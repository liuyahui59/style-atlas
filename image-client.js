// Shared browser client for the server-side Runware adapter.
(function initStyleAtlasImageClient() {
  const configuredBase = typeof window.STYLE_ATLAS_API_BASE === "string" ? window.STYLE_ATLAS_API_BASE.trim() : "";
  const defaultBase = /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)
    ? window.location.origin
    : "https://api.styleatlas.art";
  const apiBase = (configuredBase || defaultBase).replace(/\/$/, "");
  let modelsPromise;

  const fallbackModels = [
    { id: "openai:gpt-image@2.5-flare", label: "GPT Image 2.5 Flare", description: "速度优先，适合日常生成" },
    { id: "openai:gpt-image@2.5-sunburst", label: "GPT Image 2.5 Sunburst", description: "质量优先，适合复杂画面" },
    { id: "openai:gpt-image@2", label: "GPT Image 2", description: "通用 GPT 图片模型" },
    { id: "recraft:v4.1@0", label: "Recraft V4.1", description: "设计、图形与文字排版" },
    { id: "bfl:flux@3-image", label: "FLUX 3 Image", description: "高质量通用视觉生成" }
  ];

  async function getModels() {
    if (!modelsPromise) {
      modelsPromise = fetch(`${apiBase}/api/models`, { headers: { Accept: "application/json" } })
        .then(async (response) => {
          const payload = await response.json().catch(() => ({}));
          if (!response.ok || !Array.isArray(payload.models) || !payload.models.length) {
            throw new Error(payload.error || "模型列表不可用");
          }
          return payload.models;
        })
        .catch((error) => {
          console.warn("Style Atlas image models unavailable", error);
          return fallbackModels;
        });
    }
    return modelsPromise;
  }

  async function requestJson(path, options = {}) {
    const response = await fetch(`${apiBase}${path}`, {
      credentials: "include",
      ...options,
      headers: { Accept: "application/json", ...(options.headers || {}) }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || `请求失败（${response.status}）`);
      error.status = response.status;
      error.code = payload.code;
      error.payload = payload;
      throw error;
    }
    return payload;
  }

  async function getAccount() {
    return requestJson("/api/account");
  }

  async function getBillingPlans() {
    return requestJson("/api/billing/plans");
  }

  async function createCheckout({ planId, region, channel, returnUrl }) {
    return requestJson("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, region, channel, returnUrl })
    });
  }

  async function setupModelSelect(select, hint) {
    if (!select) return [];
    const models = await getModels();
    const previous = select.value;
    select.innerHTML = models.map((model) => `<option value="${escapeAttribute(model.id)}">${escapeHtml(model.label)}</option>`).join("");
    select.value = models.some((model) => model.id === previous) ? previous : models[0].id;
    select.disabled = false;
    const updateHint = () => {
      const model = models.find((item) => item.id === select.value) || models[0];
      if (hint) hint.textContent = model.description || model.id;
    };
    select.addEventListener("change", updateHint);
    updateHint();
    return models;
  }

  async function generate(options) {
    const response = await fetch(`${apiBase}/api/generate`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        prompt: String(options.prompt || "").trim(),
        negativePrompt: String(options.negativePrompt || "").trim(),
        ratio: options.ratio,
        model: options.model
      })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || `图片生成失败（${response.status}）`);
      error.status = response.status;
      error.code = payload.code;
      error.payload = payload;
      throw error;
    }
    if (!payload.image) throw new Error("图片接口未返回有效图片");
    return payload;
  }

  function formatCost(cost, currency = "USD") {
    if (typeof cost !== "number" || !Number.isFinite(cost)) return "成本待回传";
    return `${currency === "USD" ? "$" : `${currency} `}${cost.toFixed(cost < 0.1 ? 4 : 3)}`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>\"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[character]);
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/'/g, "&#39;");
  }

  window.StyleAtlasImage = Object.freeze({ apiBase, getModels, getAccount, getBillingPlans, createCheckout, setupModelSelect, generate, formatCost });
})();
