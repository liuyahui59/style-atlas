import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const host = "127.0.0.1";
const port = Number(process.env.PORT || 4173);
const baseUrl = normalizeBaseUrl(process.env.OPENAI_BASE_URL || "https://www.micuapi.ai");
const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-2";
const model2k = process.env.OPENAI_IMAGE_MODEL_2K || "gpt-image-2-pro";
const generationLimit = Math.max(1, Number(process.env.IMAGE_GENERATION_LIMIT) || 5);
const generationWindowMs = 10 * 60 * 1000;
const generationAttempts = new Map();
const imageSizes = {
  "纵向 2:3": "1024x1536",
  "横向 16:9": "2048x1152",
  "方形 1:1": "1024x1024"
};
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
    const url = new URL(request.url, `http://${request.headers.host || `${host}:${port}`}`);
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
  console.log(`Image API upstream: ${baseUrl}`);
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OPENAI_API_KEY is not configured; Micu image generation is disabled.");
  }
});

async function generateImage(request, response) {
  if (!process.env.OPENAI_API_KEY) {
    sendJson(response, 503, { error: "服务端尚未配置米醋 Image2 Token" });
    return;
  }

  const clientId = getClientId(request);
  if (!takeGenerationSlot(clientId)) {
    sendJson(response, 429, { error: "生成过于频繁，请十分钟后再试" });
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
  const requestModel = getImageModel(size);
  if (!prompt || prompt.length > 20000) {
    sendJson(response, 400, { error: "Prompt 不能为空且不能超过 20000 个字符" });
    return;
  }
  if (!size) {
    sendJson(response, 400, { error: "不支持所选画幅" });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 130000);

  try {
    const upstreamResponse = await fetch(`${baseUrl}/v1/images/generations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
        "User-Agent": process.env.OPENAI_USER_AGENT || "style-atlas/0.1"
      },
      body: JSON.stringify({
        model: requestModel,
        prompt,
        n: 1,
        size,
        quality: "medium",
        response_format: "b64_json"
      }),
      signal: controller.signal
    });
    const requestId = upstreamResponse.headers.get("x-request-id");
    const payload = await upstreamResponse.json().catch(() => ({}));

    if (!upstreamResponse.ok) {
      console.error("Micu image request failed", {
        status: upstreamResponse.status,
        requestId,
        code: payload.error?.code
      });
      sendJson(response, mapUpstreamStatus(upstreamResponse.status, payload.error), {
        error: getUpstreamErrorMessage(upstreamResponse.status, payload.error)
      });
      return;
    }

    const imageResult = extractImageResult(payload.data?.[0]);
    if (!imageResult) {
      console.error("Micu image response did not include image data", { requestId });
      sendJson(response, 502, { error: "米醋图片接口未返回有效结果" });
      return;
    }

    sendJson(response, 200, {
      image: imageResult.image,
      extension: imageResult.extension,
      model: requestModel,
      size
    });
  } catch (error) {
    if (error.name === "AbortError") {
      sendJson(response, 504, { error: "图片生成超时，请稍后重试" });
      return;
    }
    console.error("Micu image request could not be completed", error);
    sendJson(response, 502, { error: "暂时无法连接米醋图片接口，请稍后重试" });
  } finally {
    clearTimeout(timeout);
  }
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

function getUpstreamErrorMessage(status, error = {}) {
  const detail = typeof error.message === "string" ? error.message : "";
  if (error.code === "moderation_blocked") return "当前描述未通过图片安全检查，请调整内容后重试";
  if (status === 401) return "米醋 Token 无效，请确认使用 Image2 分组密钥";
  if (status === 403) return "米醋拒绝了请求，请检查 Token 分组和 User-Agent 配置";
  if (status === 429 || /too many requests|rate.?limit/i.test(detail)) return "米醋图片通道繁忙或额度不足，请稍后重试";
  if (/无可用渠道|分组/.test(detail)) return `米醋模型分组不匹配：${detail}`;
  if (status >= 500) return "米醋图片服务暂时不可用，请稍后重试";
  return detail ? `图片生成请求失败：${detail}` : "图片生成请求无效，请调整 Prompt 后重试";
}

function mapUpstreamStatus(status, error = {}) {
  if (status === 400 && /too many requests|rate.?limit/i.test(error.message || "")) return 429;
  if (status === 401 || status === 403 || status === 429) return status;
  if (status >= 500) return 502;
  return 400;
}

function getImageModel(size) {
  if (size === "2048x1152" || size === "1152x2048" || size === "2048x2048") return model2k;
  return model;
}

function extractImageResult(result) {
  if (!result || typeof result !== "object") return null;
  if (typeof result.b64_json === "string" && result.b64_json) {
    if (result.b64_json.startsWith("data:image/")) {
      return { image: result.b64_json, extension: getDataUrlExtension(result.b64_json) };
    }
    return { image: `data:image/png;base64,${result.b64_json}`, extension: "png" };
  }
  if (typeof result.url === "string" && /^(?:https:\/\/|data:image\/)/.test(result.url)) {
    return {
      image: result.url,
      extension: result.url.startsWith("data:image/") ? getDataUrlExtension(result.url) : "png"
    };
  }
  return null;
}

function getDataUrlExtension(dataUrl) {
  const mimeType = dataUrl.slice(5, dataUrl.indexOf(";"));
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  return "png";
}

function normalizeBaseUrl(value) {
  const parsed = new URL(value);
  if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["127.0.0.1", "localhost"].includes(parsed.hostname))) {
    throw new Error("OPENAI_BASE_URL 必须使用 HTTPS，只有本地测试地址可以使用 HTTP");
  }
  return parsed.href.replace(/\/$/, "").replace(/\/v1$/, "");
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
