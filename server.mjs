import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  attachProviderOrder,
  createPingxxCharge,
  createOrder,
  createStripeCheckout,
  estimateGenerationCredits,
  getAccount,
  getAccountId,
  getPlan,
  isBillingRequired,
  listPlans,
  markOrderPaid,
  markOrderFailed,
  reserveGeneration,
  settleGeneration,
  verifyPingxxWebhook,
  verifyStripeWebhook
} from "./billing.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const runwareBaseUrl = normalizeRunwareBaseUrl(process.env.RUNWARE_BASE_URL || "https://api.runware.ai/v1");
const models = loadModelCatalog();
const modelById = new Map(models.map((entry) => [entry.id, entry]));
const generationLimit = Math.max(1, Number(process.env.IMAGE_GENERATION_LIMIT) || 5);
const generationWindowMs = 10 * 60 * 1000;
const generationAttempts = new Map();
const imageSizes = {
  "纵向 2:3": { width: 1024, height: 1536 },
  "横向 16:9": { width: 1536, height: 864 },
  "方形 1:1": { width: 1024, height: 1024 }
};
const allowedOrigins = new Set((process.env.ALLOWED_ORIGINS || "https://styleatlas.art,https://www.styleatlas.art,https://liuyahui59.github.io,http://localhost:4173,http://127.0.0.1:4173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean));
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8"
};

const server = createServer(async (request, response) => {
  try {
    setCorsHeaders(request, response);
    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }
    const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
    if (request.method === "GET" && url.pathname === "/api/models") {
      sendJson(response, 200, { models: models.map(toPublicModel) });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/health") {
      const missing = [];
      if (!process.env.RUNWARE_API_KEY) missing.push("RUNWARE_API_KEY");
      if (isBillingRequired() && !process.env.SESSION_SECRET) missing.push("SESSION_SECRET");
      sendJson(response, missing.length ? 503 : 200, {
        status: missing.length ? "degraded" : "ok",
        ready: missing.length === 0,
        missing,
        runwareConfigured: Boolean(process.env.RUNWARE_API_KEY),
        billingRequired: isBillingRequired(),
        billingConfigured: Boolean(process.env.SESSION_SECRET),
        modelCount: models.length
      });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/account") {
      try {
        const accountId = getAccountId(request, response);
        sendJson(response, 200, { account: getAccount(accountId) });
      } catch (error) {
        sendJson(response, error.statusCode || 503, { error: error.message || "支付账户系统尚未配置" });
      }
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/billing/plans") {
      sendJson(response, 200, { plans: listPlans(), providerAvailability: getProviderAvailability() });
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/billing/checkout") {
      await createBillingCheckout(request, response);
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/billing/webhooks/stripe") {
      await handleStripeWebhook(request, response);
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/billing/webhooks/pingxx") {
      await handlePingxxWebhook(request, response);
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/generate") {
      await generateImage(request, response);
      return;
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      sendJson(response, 405, { error: "不支持该请求方式" });
      return;
    }
    await serveStatic(url.pathname, request.method === "HEAD", response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "服务器处理请求时发生错误" });
  }
});

server.listen(port, host, () => {
  console.log(`Style Atlas is running at http://${host}:${port}`);
  console.log(`Image API upstream: ${runwareBaseUrl}`);
  console.log(`Image models: ${models.map((entry) => entry.id).join(", ")}`);
  if (!process.env.RUNWARE_API_KEY) {
    console.warn("RUNWARE_API_KEY is not configured; Runware image generation is disabled.");
  }
});

async function generateImage(request, response) {
  if (!process.env.RUNWARE_API_KEY) {
    sendJson(response, 503, { error: "服务端尚未配置 Runware API Key" });
    return;
  }

  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: error.message });
    return;
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const size = imageSizes[body.ratio];
  const requestModel = typeof body.model === "string" && body.model.trim()
    ? body.model.trim()
    : models[0].id;
  const modelConfig = modelById.get(requestModel);
  if (!prompt || prompt.length > 20000) {
    sendJson(response, 400, { error: "Prompt 不能为空且不能超过 20000 个字符" });
    return;
  }
  if (!size) {
    sendJson(response, 400, { error: "不支持所选画幅" });
    return;
  }
  if (!modelConfig) {
    sendJson(response, 400, { error: "所选模型未在服务端启用" });
    return;
  }

  const negativePrompt = typeof body.negativePrompt === "string" ? body.negativePrompt.trim().slice(0, 12000) : "";
  const clientId = getClientId(request);
  if (!takeGenerationSlot(clientId)) {
    sendJson(response, 429, { error: "生成过于频繁，请十分钟后再试" });
    return;
  }

  let reservation;
  try {
    if (isBillingRequired()) {
      const accountId = getAccountId(request, response);
      if (!process.env.SESSION_SECRET) {
        sendJson(response, 503, { error: "支付账户系统尚未配置 SESSION_SECRET" });
        return;
      }
      reservation = reserveGeneration({
        accountId,
        model: requestModel,
        estimatedCredits: estimateGenerationCredits(requestModel)
      });
      if (!reservation) {
        sendJson(response, 402, {
          error: "额度不足，请先购买生图额度",
          code: "INSUFFICIENT_CREDITS",
          account: getAccount(accountId),
          requiredCredits: estimateGenerationCredits(requestModel)
        });
        return;
      }
    }
  } catch (error) {
    sendJson(response, error.statusCode || 503, { error: error.message || "账户系统暂时不可用" });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180000);
  const taskUUID = randomUUID();

  try {
    const task = {
      taskType: "imageInference",
      taskUUID,
      model: requestModel,
      positivePrompt: [prompt, negativePrompt ? `Avoid the following: ${negativePrompt}` : ""].filter(Boolean).join("\n\n").slice(0, 32000),
      width: size.width,
      height: size.height,
      numberResults: 1,
      outputType: "URL",
      outputFormat: "WEBP",
      includeCost: true
    };
    const upstreamResponse = await fetch(runwareBaseUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RUNWARE_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": process.env.RUNWARE_USER_AGENT || "style-atlas/0.3"
      },
      body: JSON.stringify([task]),
      signal: controller.signal
    });
    const payload = await upstreamResponse.json().catch(() => ({}));

    if (!upstreamResponse.ok) {
      console.error("Runware image request failed", {
        status: upstreamResponse.status,
        taskUUID,
        code: payload.error?.code || payload.errors?.[0]?.code
      });
      sendJson(response, mapUpstreamStatus(upstreamResponse.status, payload), {
        error: getUpstreamErrorMessage(upstreamResponse.status, payload)
      });
      settleReservation(reservation, false, null, getUpstreamErrorMessage(upstreamResponse.status, payload));
      return;
    }

    const runwareError = extractRunwareError(payload, taskUUID);
    if (runwareError) {
      console.error("Runware image task failed", { taskUUID, code: runwareError.code });
      sendJson(response, mapUpstreamStatus(400, runwareError), {
        error: getUpstreamErrorMessage(400, { error: runwareError })
      });
      settleReservation(reservation, false, null, runwareError.message);
      return;
    }

    const imageResult = extractRunwareResult(payload, taskUUID);
    if (!imageResult) {
      console.error("Runware image response did not include image data", { taskUUID });
      sendJson(response, 502, { error: "Runware 图片接口未返回有效结果" });
      settleReservation(reservation, false, null, "Runware 图片接口未返回有效结果");
      return;
    }

    const actualCost = reservation
      ? Number.isFinite(Number(imageResult.cost)) ? Number(imageResult.cost) : reservation.estimatedCredits / 100
      : null;
    settleReservation(reservation, true, actualCost, "");

    sendJson(response, 200, {
      image: imageResult.imageURL,
      imageUUID: imageResult.imageUUID || "",
      cost: Number.isFinite(Number(imageResult.cost)) ? Number(imageResult.cost) : null,
      currency: "USD",
      model: requestModel,
      width: size.width,
      height: size.height
    });
  } catch (error) {
    if (error.name === "AbortError") {
      sendJson(response, 504, { error: "图片生成超时，请稍后重试" });
      settleReservation(reservation, false, null, "图片生成超时");
      return;
    }
    console.error("Runware image request could not be completed", error);
    sendJson(response, 502, { error: "暂时无法连接 Runware 图片接口，请稍后重试" });
    settleReservation(reservation, false, null, error.message || "Runware 请求失败");
  } finally {
    clearTimeout(timeout);
  }
}

async function createBillingCheckout(request, response) {
  let body;
  try {
    body = await readJsonBody(request);
  } catch (error) {
    sendJson(response, error.statusCode || 400, { error: error.message });
    return;
  }
  const plan = getPlan(typeof body.planId === "string" ? body.planId : "");
  const region = body.region === "cn" ? "cn" : body.region === "global" ? "global" : "";
  if (!plan || !region) {
    sendJson(response, 400, { error: "请选择有效的额度包和地区" });
    return;
  }
  const provider = region === "cn" ? "pingxx" : "stripe";
  const currency = region === "cn" ? "CNY" : "USD";
  const amountMinor = region === "cn" ? plan.cny : plan.usd;
  let order;
  try {
    const accountId = getAccountId(request, response);
    order = createOrder({ accountId, planId: plan.id, provider, currency, amountMinor });
    if (provider === "stripe") {
      const checkout = await createStripeCheckout({ order, plan, returnUrl: body.returnUrl });
      attachProviderOrder(order.id, checkout.id);
      sendJson(response, 200, { provider, orderId: order.id, checkoutUrl: checkout.url });
      return;
    }
    const channel = body.channel === "alipay_qr" ? "alipay_qr" : "wx_pub_qr";
    const charge = await createPingxxCharge({ order, plan, channel, clientIp: getClientId(request) });
    attachProviderOrder(order.id, charge.id || charge.order_no || order.id);
    sendJson(response, 200, {
      provider,
      orderId: order.id,
      chargeId: charge.id || "",
      credential: charge.credential || null,
      raw: process.env.EXPOSE_PAYMENT_DEBUG === "true" ? charge : undefined
    });
  } catch (error) {
    if (order) markOrderFailed(order.id);
    console.error("Payment checkout creation failed", { provider, error: error.message });
    sendJson(response, error.statusCode || 502, { error: error.message || "暂时无法创建支付订单" });
  }
}

async function handleStripeWebhook(request, response) {
  const rawBody = await readRawBody(request).catch(() => null);
  if (!rawBody) {
    sendJson(response, 400, { error: "Webhook 内容无效" });
    return;
  }
  try {
    if (!verifyStripeWebhook(rawBody, request.headers["stripe-signature"])) {
      sendJson(response, 400, { error: "Stripe Webhook 签名无效" });
      return;
    }
    const event = JSON.parse(rawBody);
    if (event.type === "checkout.session.completed" && event.data?.object?.payment_status === "paid") {
      const session = event.data.object;
      const orderId = session.metadata?.order_id;
      if (orderId) markOrderPaid({ orderId, providerEventId: event.id, providerOrderId: session.id });
    }
    sendJson(response, 200, { received: true });
  } catch (error) {
    console.error("Stripe webhook failed", error);
    sendJson(response, error.statusCode || 400, { error: error.message || "Webhook 处理失败" });
  }
}

async function handlePingxxWebhook(request, response) {
  const rawBody = await readRawBody(request).catch(() => null);
  if (!rawBody) {
    sendJson(response, 400, { error: "Webhook 内容无效" });
    return;
  }
  try {
    if (!verifyPingxxWebhook(rawBody, request.headers["x-pingplusplus-signature"])) {
      sendJson(response, 400, { error: "Ping++ Webhook 签名无效" });
      return;
    }
    const event = JSON.parse(rawBody);
    const charge = event.data?.object || event.data || {};
    const orderId = charge.metadata?.order_id;
    if (orderId && ["charge.succeeded", "paid", "succeeded"].includes(event.type || charge.status)) {
      markOrderPaid({ orderId, providerEventId: event.id || charge.id, providerOrderId: charge.id });
    }
    sendJson(response, 200, { received: true });
  } catch (error) {
    console.error("Ping++ webhook failed", error);
    sendJson(response, error.statusCode || 400, { error: error.message || "Webhook 处理失败" });
  }
}

function settleReservation(reservation, success, actualCost, errorMessage) {
  if (!reservation) return;
  try {
    settleGeneration({ reservationId: reservation.id, actualCostUsd: actualCost, success, errorMessage });
  } catch (error) {
    console.error("Credit settlement failed", { reservationId: reservation.id, error: error.message });
  }
}

function getProviderAvailability() {
  return {
    stripe: Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET),
    pingxx: Boolean(process.env.PINGXX_SECRET_KEY && process.env.PINGXX_APP_ID && process.env.PINGXX_PUBLIC_KEY)
  };
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 65536) {
      const error = new Error("请求内容过大");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new Error("请求内容不是有效 JSON");
  }
}

async function readRawBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 262144) throw new Error("Webhook 内容过大");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function serveStatic(pathname, headOnly, response) {
  let relativePath;
  try {
    relativePath = decodeURIComponent(pathname === "/" ? "index.html" : pathname.slice(1));
  } catch {
    sendJson(response, 400, { error: "无效的访问路径" });
    return;
  }

  if (!extname(relativePath)) {
    relativePath = `${relativePath.replace(/\/$/, "")}/index.html`.replace(/^\//, "");
  }

  const filePath = resolve(root, relativePath);
  const pathSegments = relativePath.split(/[\\/]/);
  const extension = extname(filePath).toLowerCase();
  if (filePath !== root && !filePath.startsWith(`${root}${sep}`)) {
    sendJson(response, 403, { error: "禁止访问该路径" });
    return;
  }
  if (pathSegments.some((segment) => segment.startsWith(".")) || !mimeTypes[extension]) {
    sendJson(response, 404, { error: "页面不存在" });
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) throw new Error("Not a file");
    const content = headOnly ? null : await readFile(filePath);
    const cacheControl = extension === ".html"
      ? "public, max-age=0, must-revalidate"
      : extension === ".jpg" || extension === ".png" || extension === ".webp"
        ? "public, max-age=604800"
        : "public, max-age=3600";
    response.writeHead(200, {
      "Content-Type": mimeTypes[extension],
      "Content-Length": fileStat.size,
      "Cache-Control": cacheControl,
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    });
    response.end(content);
  } catch {
    sendJson(response, 404, { error: "页面不存在" });
  }
}

function getUpstreamErrorMessage(status, payload = {}) {
  const error = payload.error || payload.errors?.[0] || {};
  const detail = typeof error.message === "string" ? error.message : typeof payload.message === "string" ? payload.message : "";
  if (/moderation|safety|blocked/i.test(`${error.code || ""} ${detail}`)) return "当前描述未通过图片安全检查，请调整内容后重试";
  if (status === 401) return "Runware API Key 无效，请检查服务端密钥";
  if (status === 403) return "Runware 拒绝了请求，请检查 API Key 权限";
  if (status === 429 || /too many requests|rate.?limit|credit|balance/i.test(detail)) return "Runware 图片通道繁忙或额度不足，请稍后重试";
  if (status >= 500) return "Runware 图片服务暂时不可用，请稍后重试";
  return detail ? `图片生成请求失败：${detail}` : "图片生成请求无效，请调整 Prompt 后重试";
}

function mapUpstreamStatus(status, payload = {}) {
  const detail = JSON.stringify(payload);
  if (status === 400 && /too many requests|rate.?limit|credit|balance/i.test(detail)) return 429;
  if (status === 401 || status === 403 || status === 429) return status;
  if (status >= 500) return 502;
  return 400;
}

function extractRunwareResult(payload, taskUUID) {
  const entries = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
  const result = entries.find((entry) => entry?.taskUUID === taskUUID) || entries.find((entry) => entry?.imageURL);
  if (!result || typeof result.imageURL !== "string" || !/^https:\/\//.test(result.imageURL)) return null;
  return result;
}

function extractRunwareError(payload, taskUUID) {
  const entries = Array.isArray(payload) ? payload : Array.isArray(payload.data) ? payload.data : [];
  const result = entries.find((entry) => entry?.taskUUID === taskUUID && (entry?.error || entry?.code || entry?.errorCode));
  if (!result) return null;
  const error = result.error && typeof result.error === "object" ? result.error : result;
  return {
    code: error.code || error.errorCode || "runware_task_error",
    message: error.message || error.errorMessage || "Runware image task failed"
  };
}

function normalizeRunwareBaseUrl(value) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:") throw new Error("RUNWARE_BASE_URL 必须使用 HTTPS");
  return parsed.href.replace(/\/$/, "");
}

function loadModelCatalog() {
  const fallback = [
    { id: "openai:gpt-image@2.5-flare", label: "GPT Image 2.5 Flare", description: "速度优先，适合日常生成" },
    { id: "openai:gpt-image@2.5-sunburst", label: "GPT Image 2.5 Sunburst", description: "质量优先，适合复杂画面" },
    { id: "openai:gpt-image@2", label: "GPT Image 2", description: "通用 GPT 图片模型" },
    { id: "recraft:v4.1@0", label: "Recraft V4.1", description: "设计、图形与文字排版" },
    { id: "bfl:flux@3-image", label: "FLUX 3 Image", description: "高质量通用视觉生成" }
  ];
  const raw = process.env.RUNWARE_MODELS;
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    const configured = Array.isArray(parsed) ? parsed : [];
    const entries = configured.map((item) => typeof item === "string" ? { id: item } : item)
      .filter((item) => item && typeof item.id === "string" && /^[a-z0-9._-]+(?::[a-z0-9._-]+@[a-z0-9._-]+)?$/i.test(item.id))
      .map((item) => ({
        id: item.id,
        label: typeof item.label === "string" && item.label.trim() ? item.label.trim() : item.id,
        description: typeof item.description === "string" ? item.description.trim() : "Runware 图像模型"
      }));
    if (entries.length) return [...new Map(entries.map((entry) => [entry.id, entry])).values()];
  } catch (error) {
    console.warn("RUNWARE_MODELS is not valid JSON; using the default model catalog", error.message);
  }
  return fallback;
}

function toPublicModel(modelConfig) {
  return { id: modelConfig.id, label: modelConfig.label, description: modelConfig.description };
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  if (origin && (allowedOrigins.has("*") || allowedOrigins.has(origin))) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type, Stripe-Signature, X-Pingplusplus-Signature");
  response.setHeader("Access-Control-Allow-Credentials", "true");
}

function getClientId(request) {
  const forwarded = request.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded) return forwarded.split(",")[0].trim();
  return request.socket.remoteAddress || "unknown";
}

function takeGenerationSlot(clientId) {
  const now = Date.now();
  const recentAttempts = (generationAttempts.get(clientId) || []).filter((time) => now - time < generationWindowMs);
  if (recentAttempts.length >= generationLimit) {
    generationAttempts.set(clientId, recentAttempts);
    return false;
  }
  recentAttempts.push(now);
  generationAttempts.set(clientId, recentAttempts);
  return true;
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(body);
}
