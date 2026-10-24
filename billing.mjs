import { createHmac, createVerify, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const root = dirname(fileURLToPath(import.meta.url));
const configuredDatabasePath = process.env.BILLING_DATABASE_PATH || "";
const billingDatabasePath = configuredDatabasePath === ":memory:"
  ? ":memory:"
  : resolve(configuredDatabasePath || resolve(root, "data/style-atlas.sqlite"));
const sessionCookieName = "style_atlas_session";
const sessionSecret = process.env.SESSION_SECRET || "";
const billingRequired = /^(1|true|yes)$/i.test(process.env.BILLING_REQUIRED || "true");
const sessionMaxAgeSeconds = 60 * 60 * 24 * 180;

const plans = [
  { id: "starter", label: "入门包", credits: 100, usd: 299, cny: 2100, description: "约 20 张 Flare 图片" },
  { id: "creator", label: "创作者包", credits: 500, usd: 999, cny: 6900, description: "适合持续探索风格" },
  { id: "studio", label: "工作室包", credits: 2000, usd: 2999, cny: 19900, description: "适合项目与商业草图" }
];

const modelCreditCosts = new Map([
  ["openai:gpt-image@2.5-flare", 5],
  ["openai:gpt-image@2.5-sunburst", 17],
  ["openai:gpt-image@2", 10],
  ["recraft:v4.1@0", 5],
  ["bfl:flux@3-image", 5]
]);

let database;

export function isBillingRequired() {
  return billingRequired;
}

export function listPlans() {
  return plans.map((plan) => ({
    id: plan.id,
    label: plan.label,
    credits: plan.credits,
    description: plan.description,
    prices: { USD: plan.usd, CNY: plan.cny }
  }));
}

export function getPlan(planId) {
  return plans.find((plan) => plan.id === planId) || null;
}

export function estimateGenerationCredits(modelId) {
  return modelCreditCosts.get(modelId) || 10;
}

export function getSessionCookieName() {
  return sessionCookieName;
}

export function createAccountSession(response, secure = true) {
  if (!sessionSecret) {
    if (billingRequired) throw new Error("SESSION_SECRET 未配置");
    return randomUUID();
  }
  const accountId = randomUUID();
  ensureAccount(accountId);
  const token = signSession(accountId);
  response.setHeader("Set-Cookie", `${sessionCookieName}=${token}; Path=/; Max-Age=${sessionMaxAgeSeconds}; HttpOnly;${secure ? " Secure;" : ""} SameSite=${secure ? "None" : "Lax"}`);
  return accountId;
}

export function getAccountId(request, response) {
  const cookies = parseCookies(request.headers.cookie || "");
  const token = cookies[sessionCookieName];
  const accountId = sessionSecret ? verifySession(token) : null;
  if (accountId) {
    ensureAccount(accountId);
    return accountId;
  }
  const forwardedProtocol = request.headers["x-forwarded-proto"];
  const secure = request.socket.encrypted || forwardedProtocol === "https" || process.env.NODE_ENV === "production";
  return createAccountSession(response, secure);
}

export function getAccount(accountId) {
  const row = db().prepare("SELECT id, credits, created_at AS createdAt FROM accounts WHERE id = ?").get(accountId);
  return row ? { id: row.id, credits: Number(row.credits), createdAt: row.createdAt } : null;
}

export function createOrder({ accountId, planId, provider, currency, amountMinor }) {
  const plan = getPlan(planId);
  if (!plan) throw new Error("未知额度包");
  const orderId = randomUUID();
  db().prepare(`INSERT INTO orders
    (id, account_id, plan_id, provider, currency, amount_minor, credits, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', datetime('now'))`)
    .run(orderId, accountId, planId, provider, currency, amountMinor, plan.credits);
  return getOrder(orderId);
}

export function getOrder(orderId) {
  return db().prepare("SELECT * FROM orders WHERE id = ?").get(orderId) || null;
}

export function attachProviderOrder(orderId, providerOrderId) {
  db().prepare("UPDATE orders SET provider_order_id = ? WHERE id = ? AND status = 'pending'").run(providerOrderId, orderId);
}

export function markOrderFailed(orderId) {
  db().prepare("UPDATE orders SET status = 'failed' WHERE id = ? AND status = 'pending'").run(orderId);
}

export function markOrderPaid({ orderId, providerEventId, providerOrderId }) {
  const connection = db();
  try {
    connection.exec("BEGIN IMMEDIATE");
    const order = connection.prepare("SELECT * FROM orders WHERE id = ?").get(orderId);
    if (!order) throw new Error("订单不存在");
    if (order.status === "paid") {
      connection.exec("COMMIT");
      return getOrder(orderId);
    }
    if (providerEventId && connection.prepare("SELECT id FROM webhook_events WHERE provider_event_id = ?").get(providerEventId)) {
      connection.exec("COMMIT");
      return getOrder(orderId);
    }
    connection.prepare("UPDATE orders SET status = 'paid', provider_order_id = COALESCE(?, provider_order_id), paid_at = datetime('now') WHERE id = ?")
      .run(providerOrderId || null, orderId);
    connection.prepare("UPDATE accounts SET credits = credits + ? WHERE id = ?").run(order.credits, order.account_id);
    connection.prepare(`INSERT INTO credit_ledger
      (id, account_id, order_id, kind, credits_delta, metadata_json, created_at)
      VALUES (?, ?, ?, 'purchase', ?, ?, datetime('now'))`)
      .run(randomUUID(), order.account_id, orderId, order.credits, JSON.stringify({ providerEventId: providerEventId || null }));
    if (providerEventId) {
      connection.prepare(`INSERT OR IGNORE INTO webhook_events
        (id, provider_event_id, provider, payload_json, created_at)
        VALUES (?, ?, ?, ?, datetime('now'))`)
        .run(randomUUID(), providerEventId, order.provider, "{}");
    }
    connection.exec("COMMIT");
    return getOrder(orderId);
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
}

export function reserveGeneration({ accountId, model, estimatedCredits }) {
  const connection = db();
  connection.exec("BEGIN IMMEDIATE");
  try {
    const account = connection.prepare("SELECT credits FROM accounts WHERE id = ?").get(accountId);
    if (!account || Number(account.credits) < estimatedCredits) {
      connection.exec("ROLLBACK");
      return null;
    }
    const reservationId = randomUUID();
    connection.prepare("UPDATE accounts SET credits = credits - ? WHERE id = ?").run(estimatedCredits, accountId);
    connection.prepare(`INSERT INTO generation_reservations
      (id, account_id, model, reserved_credits, status, created_at)
      VALUES (?, ?, ?, ?, 'reserved', datetime('now'))`)
      .run(reservationId, accountId, model, estimatedCredits);
    connection.prepare(`INSERT INTO credit_ledger
      (id, account_id, kind, credits_delta, generation_id, metadata_json, created_at)
      VALUES (?, ?, 'generation_reserve', ?, ?, ?, datetime('now'))`)
      .run(randomUUID(), accountId, -estimatedCredits, reservationId, JSON.stringify({ model }));
    connection.exec("COMMIT");
    return { id: reservationId, estimatedCredits };
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
}

export function settleGeneration({ reservationId, actualCostUsd, success, errorMessage = "" }) {
  const connection = db();
  connection.exec("BEGIN IMMEDIATE");
  try {
    const reservation = connection.prepare("SELECT * FROM generation_reservations WHERE id = ?").get(reservationId);
    if (!reservation || reservation.status !== "reserved") {
      connection.exec("ROLLBACK");
      return;
    }
    const actualCredits = success ? Math.max(1, Math.ceil(Number(actualCostUsd || 0) * 100)) : 0;
    const refund = Math.max(0, Number(reservation.reserved_credits) - actualCredits);
    if (refund) {
      connection.prepare("UPDATE accounts SET credits = credits + ? WHERE id = ?").run(refund, reservation.account_id);
      connection.prepare(`INSERT INTO credit_ledger
        (id, account_id, kind, credits_delta, generation_id, metadata_json, created_at)
        VALUES (?, ?, 'generation_settle', ?, ?, ?, datetime('now'))`)
        .run(randomUUID(), reservation.account_id, refund, reservationId, JSON.stringify({ actualCredits, errorMessage }));
    }
    connection.prepare("UPDATE generation_reservations SET status = ?, actual_credits = ?, error_message = ?, settled_at = datetime('now') WHERE id = ?")
      .run(success ? "settled" : "released", actualCredits, errorMessage, reservationId);
    connection.exec("COMMIT");
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
}

export function createStripeCheckout({ order, plan, returnUrl }) {
  if (!process.env.STRIPE_SECRET_KEY) throw new BillingConfigurationError("STRIPE_SECRET_KEY 未配置");
  const successUrl = safeReturnUrl(returnUrl, process.env.BILLING_SUCCESS_URL || "https://styleatlas.art/?payment=success");
  const cancelUrl = process.env.BILLING_CANCEL_URL || "https://styleatlas.art/?payment=cancelled";
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("client_reference_id", order.account_id);
  params.set("metadata[order_id]", order.id);
  params.set("metadata[plan_id]", plan.id);
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", String(plan.usd));
  params.set("line_items[0][price_data][product_data][name]", `Style Atlas ${plan.label}`);
  params.set("line_items[0][price_data][product_data][description]", `${plan.credits} 个生图额度`);
  return requestJson("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params
  });
}

export function verifyStripeWebhook(rawBody, signatureHeader) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) throw new BillingConfigurationError("STRIPE_WEBHOOK_SECRET 未配置");
  const parts = Object.fromEntries(String(signatureHeader || "").split(",").map((item) => item.split("=", 2)));
  const timestamp = Number(parts.t);
  const provided = parts.v1 || "";
  if (!timestamp || !provided || Math.abs(Date.now() / 1000 - timestamp) > 300) return false;
  const expected = createHmac("sha256", process.env.STRIPE_WEBHOOK_SECRET).update(`${timestamp}.${rawBody}`).digest("hex");
  return safeEqual(expected, provided);
}

export function createPingxxCharge({ order, plan, channel, clientIp }) {
  if (!process.env.PINGXX_SECRET_KEY || !process.env.PINGXX_APP_ID) {
    throw new BillingConfigurationError("PINGXX_SECRET_KEY 或 PINGXX_APP_ID 未配置");
  }
  const payload = new URLSearchParams({
    order_no: order.id.replaceAll("-", "").slice(0, 16),
    amount: String(plan.cny),
    currency: "cny",
    subject: `Style Atlas ${plan.label}`,
    body: `${plan.credits} 个生图额度`,
    channel,
    client_ip: clientIp || "127.0.0.1",
    "app[id]": process.env.PINGXX_APP_ID,
    "metadata[order_id]": order.id,
    "metadata[account_id]": order.account_id
  });
  const baseUrl = (process.env.PINGXX_BASE_URL || "https://api.pingxx.com").replace(/\/$/, "");
  const authorization = Buffer.from(`${process.env.PINGXX_SECRET_KEY}:`).toString("base64");
  return requestJson(`${baseUrl}/v1/charges`, {
    method: "POST",
    headers: { Authorization: `Basic ${authorization}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: payload
  });
}

export function verifyPingxxWebhook(rawBody, signatureHeader) {
  const publicKey = process.env.PINGXX_PUBLIC_KEY?.replaceAll("\\n", "\n");
  if (!publicKey || !signatureHeader) return false;
  return createVerify("RSA-SHA256").update(rawBody).verify(publicKey, Buffer.from(signatureHeader, "base64"));
}

export class BillingConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = "BillingConfigurationError";
    this.statusCode = 503;
  }
}

function db() {
  if (database) return database;
  if (billingDatabasePath !== ":memory:") mkdirSync(dirname(billingDatabasePath), { recursive: true });
  database = new DatabaseSync(billingDatabasePath);
  database.exec("PRAGMA journal_mode = WAL");
  database.exec(`CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    credits INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    plan_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_order_id TEXT,
    currency TEXT NOT NULL,
    amount_minor INTEGER NOT NULL,
    credits INTEGER NOT NULL,
    status TEXT NOT NULL,
    created_at TEXT NOT NULL,
    paid_at TEXT
  );
  CREATE UNIQUE INDEX IF NOT EXISTS orders_provider_order_id ON orders(provider_order_id) WHERE provider_order_id IS NOT NULL;
  CREATE TABLE IF NOT EXISTS credit_ledger (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    order_id TEXT,
    kind TEXT NOT NULL,
    credits_delta INTEGER NOT NULL,
    generation_id TEXT,
    metadata_json TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS generation_reservations (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    model TEXT NOT NULL,
    reserved_credits INTEGER NOT NULL,
    actual_credits INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    error_message TEXT,
    created_at TEXT NOT NULL,
    settled_at TEXT
  );
  CREATE TABLE IF NOT EXISTS webhook_events (
    id TEXT PRIMARY KEY,
    provider_event_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    payload_json TEXT,
    created_at TEXT NOT NULL
  );`);
  return database;
}

function ensureAccount(accountId) {
  db().prepare("INSERT OR IGNORE INTO accounts (id, credits, created_at) VALUES (?, 0, datetime('now'))").run(accountId);
}

function signSession(accountId) {
  const signature = createHmac("sha256", sessionSecret).update(accountId).digest("base64url");
  return `${accountId}.${signature}`;
}

function verifySession(token) {
  if (!token) return null;
  const separator = token.lastIndexOf(".");
  if (separator < 1) return null;
  const accountId = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = createHmac("sha256", sessionSecret).update(accountId).digest("base64url");
  return safeEqual(expected, signature) ? accountId : null;
}

function parseCookies(value) {
  return Object.fromEntries(value.split(";").map((part) => part.trim().split("=", 2)).filter(([key, item]) => key && item).map(([key, item]) => [key, decodeURIComponent(item)]));
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left));
  const b = Buffer.from(String(right));
  return a.length === b.length && timingSafeEqual(a, b);
}

function safeReturnUrl(value, fallback) {
  try {
    const url = new URL(value || fallback);
    if (url.protocol === "https:" && ["styleatlas.art", "www.styleatlas.art", "liuyahui59.github.io"].includes(url.hostname)) return url.href;
  } catch {
    // Use the configured fallback.
  }
  return fallback;
}

async function requestJson(url, options) {
  const response = await fetch(url, options);
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error?.message || payload.error || payload.message || `支付服务返回 ${response.status}`);
    error.statusCode = response.status >= 500 ? 502 : 400;
    throw error;
  }
  return payload;
}
