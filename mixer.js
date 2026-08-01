const MIXER_DIMENSIONS = Object.freeze({
  compositionSpace: { zh: "构图与空间", en: "composition and space", color: "#df3b2e", icon: "layout-template" },
  viewpointLens: { zh: "视角与镜头", en: "viewpoint and lens", color: "#2459d3", icon: "scan-eye" },
  formGeometry: { zh: "形态与几何", en: "form and geometry", color: "#8a4fb5", icon: "shapes" },
  colorTone: { zh: "色彩与调性", en: "color and tone", color: "#d38b22", icon: "palette" },
  lightingImaging: { zh: "光线与成像", en: "lighting and imaging", color: "#2b7c91", icon: "sun-medium" },
  mediumTechnique: { zh: "媒介与技法", en: "medium and technique", color: "#2f7f62", icon: "brush" },
  materialTexture: { zh: "材质与纹理", en: "material and texture", color: "#8a6650", icon: "layers-3" },
  imperfectionEffect: { zh: "不完美与效果", en: "imperfection and effects", color: "#b14d68", icon: "scan-line" },
  typographyLayout: { zh: "字体与版式", en: "typography and layout", color: "#606059", icon: "type" }
});

const MIXER_USE_TRANSLATIONS = Object.freeze({
  "海报": "poster design",
  "品牌视觉": "brand identity visual",
  "插画": "editorial illustration",
  "数字界面": "digital interface concept",
  "空间概念": "spatial design concept"
});

const MIXER_RATIO_TRANSLATIONS = Object.freeze({
  "纵向 2:3": "vertical 2:3 composition",
  "横向 16:9": "landscape 16:9 composition",
  "方形 1:1": "square 1:1 composition"
});

const mixerState = {
  primaryStyleId: "constructivism",
  accentStyleId: "cyberpunk",
  selectedDimensions: new Set(["colorTone", "lightingImaging", "materialTexture"]),
  strength: "明显",
  outputMode: "zh",
  outputs: {}
};

const mixerDom = {};
let mixerToastTimer;
let openComboboxRole = null;
let comboboxActiveIndex = -1;
let comboboxVisibleStyleIds = [];

document.addEventListener("DOMContentLoaded", initMixer);
window.refreshMixerIcons = refreshMixerIcons;

function initMixer() {
  cacheMixerDom();
  hydrateMixerFromUrl();
  renderStyleOptions();
  normalizeMixerDimensions();
  bindMixerEvents();
  renderMixer();
}

function cacheMixerDom() {
  [
    "mixSubject", "mixUse", "mixRatio", "primaryStyleSearch", "primaryStyleMenu",
    "accentStyleSearch", "accentStyleMenu",
    "primaryStylePreview", "accentStylePreview", "swapStylesButton", "mixStrengthControl",
    "mixDimensionList", "mixDimensionCount", "mixCheck", "mixStatusBadge", "mixPromptResult",
    "mixPromptAnatomy", "mixStructureContent", "mixStructureRatio", "copyMixPromptButton",
    "resetMixerButton", "mixerToast"
  ].forEach((id) => { mixerDom[id] = document.getElementById(id); });
}

function hydrateMixerFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const primary = getMixerStyle(params.get("primary"));
  const accent = getMixerStyle(params.get("accent"));
  if (primary) mixerState.primaryStyleId = primary.id;
  if (accent && accent.id !== mixerState.primaryStyleId) mixerState.accentStyleId = accent.id;
  if (mixerState.primaryStyleId === mixerState.accentStyleId) {
    mixerState.accentStyleId = mixerState.primaryStyleId === "constructivism" ? "cyberpunk" : "constructivism";
  }
}

function bindMixerEvents() {
  [mixerDom.mixSubject, mixerDom.mixUse, mixerDom.mixRatio].forEach((control) => {
    control.addEventListener("input", renderMixerOutput);
  });

  ["primary", "accent"].forEach((role) => {
    const input = getComboboxInput(role);
    input.addEventListener("focus", () => {
      const selectedId = role === "primary" ? mixerState.primaryStyleId : mixerState.accentStyleId;
      if (input.value === styleLabel(getMixerStyle(selectedId))) input.value = "";
      openStyleCombobox(role, input.value);
    });
    input.addEventListener("input", () => openStyleCombobox(role, input.value));
    input.addEventListener("keydown", (event) => handleComboboxKeydown(event, role));
  });

  document.querySelectorAll("[data-combobox-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const role = button.dataset.comboboxToggle;
      if (openComboboxRole === role) closeStyleCombobox(role, true);
      else {
        getComboboxInput(role).focus();
        openStyleCombobox(role);
      }
    });
  });

  [mixerDom.primaryStyleMenu, mixerDom.accentStyleMenu].forEach((menu) => {
    menu.addEventListener("click", (event) => {
      const option = event.target.closest("button[data-style-option]");
      if (!option) return;
      selectStyleById(menu === mixerDom.primaryStyleMenu ? "primary" : "accent", option.dataset.styleOption);
      closeStyleCombobox(openComboboxRole);
    });
  });

  document.addEventListener("pointerdown", (event) => {
    if (event.target.closest("[data-style-combobox]")) return;
    closeStyleCombobox(openComboboxRole, true);
  });

  mixerDom.swapStylesButton.addEventListener("click", () => {
    const previousPrimary = mixerState.primaryStyleId;
    mixerState.primaryStyleId = mixerState.accentStyleId;
    mixerState.accentStyleId = previousPrimary;
    normalizeMixerDimensions();
    renderMixer();
    showMixerToast("主风格与辅助风格已交换");
  });

  mixerDom.mixStrengthControl.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-strength]");
    if (!button) return;
    mixerState.strength = button.dataset.strength;
    mixerDom.mixStrengthControl.querySelectorAll("button").forEach((item) => {
      item.classList.toggle("is-active", item === button);
    });
    renderMixerOutput();
    renderMixStructure();
  });

  mixerDom.mixDimensionList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-mix-dimension]");
    if (!button) return;
    const dimension = button.dataset.mixDimension;
    if (mixerState.selectedDimensions.has(dimension)) {
      if (mixerState.selectedDimensions.size === 1) {
        showMixerToast("至少保留一个融合维度");
        return;
      }
      mixerState.selectedDimensions.delete(dimension);
    } else {
      if (mixerState.selectedDimensions.size >= 3) {
        showMixerToast("辅助风格最多接管 3 个维度");
        return;
      }
      mixerState.selectedDimensions.add(dimension);
    }
    renderMixerDimensions();
    renderMixCheck();
    renderMixerOutput();
    renderMixStructure();
  });

  document.querySelectorAll("[data-mix-output]").forEach((button) => {
    button.addEventListener("click", () => {
      mixerState.outputMode = button.dataset.mixOutput;
      document.querySelectorAll("[data-mix-output]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderMixerOutput();
    });
  });

  mixerDom.copyMixPromptButton.addEventListener("click", copyMixerPrompt);
  mixerDom.resetMixerButton.addEventListener("click", resetMixer);
}

function renderStyleOptions() {
  renderComboboxOptions("primary");
  renderComboboxOptions("accent");
}

function getMixerStyleOptions() {
  return STYLE_DATA
    .filter((style) => getStylePromptData(style.id))
    .sort((a, b) => a.nameZh.localeCompare(b.nameZh, "zh-CN"));
}

function getComboboxInput(role) {
  return role === "primary" ? mixerDom.primaryStyleSearch : mixerDom.accentStyleSearch;
}

function getComboboxMenu(role) {
  return role === "primary" ? mixerDom.primaryStyleMenu : mixerDom.accentStyleMenu;
}

function openStyleCombobox(role, query = "") {
  if (openComboboxRole && openComboboxRole !== role) closeStyleCombobox(openComboboxRole, true);
  const input = getComboboxInput(role);
  const selectedStyle = getMixerStyle(role === "primary" ? mixerState.primaryStyleId : mixerState.accentStyleId);
  const effectiveQuery = query === styleLabel(selectedStyle) ? "" : query;
  openComboboxRole = role;
  comboboxActiveIndex = -1;
  input.setAttribute("aria-expanded", "true");
  input.closest(".style-combobox").classList.add("is-open");
  getComboboxMenu(role).hidden = false;
  renderComboboxOptions(role, effectiveQuery);
  if (!effectiveQuery) {
    getComboboxMenu(role).querySelector(`[data-style-option="${selectedStyle.id}"]`)?.scrollIntoView({ block: "nearest" });
  }
}

function closeStyleCombobox(role, restoreSelection = false) {
  if (!role) return;
  const input = getComboboxInput(role);
  const menu = getComboboxMenu(role);
  menu.hidden = true;
  input.setAttribute("aria-expanded", "false");
  input.removeAttribute("aria-activedescendant");
  input.closest(".style-combobox").classList.remove("is-open");
  if (restoreSelection) renderMixerStyleInputs();
  openComboboxRole = null;
  comboboxActiveIndex = -1;
  comboboxVisibleStyleIds = [];
}

function renderComboboxOptions(role, query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const selectedId = role === "primary" ? mixerState.primaryStyleId : mixerState.accentStyleId;
  const options = getMixerStyleOptions().filter((style) => {
    if (!normalizedQuery) return true;
    return `${style.nameZh} ${style.nameEn} ${style.type} ${style.region}`.toLowerCase().includes(normalizedQuery);
  });
  comboboxVisibleStyleIds = openComboboxRole === role ? options.map((style) => style.id) : comboboxVisibleStyleIds;
  const menu = getComboboxMenu(role);
  menu.innerHTML = options.length
    ? options.map((style) => `<button type="button" id="${role}-style-option-${style.id}" class="style-combobox-option ${style.id === selectedId ? "is-selected" : ""}" data-style-option="${style.id}" role="option" aria-selected="${style.id === selectedId}"><span><strong>${escapeMixerHtml(style.nameZh)}</strong><small>${escapeMixerHtml(style.nameEn)}</small></span>${style.id === selectedId ? '<i data-lucide="check" aria-hidden="true"></i>' : ""}</button>`).join("")
    : `<div class="style-combobox-empty">没有匹配风格</div>`;
  refreshMixerIcons();
}

function handleComboboxKeydown(event, role) {
  if (event.key === "Escape") {
    closeStyleCombobox(role, true);
    return;
  }
  if (!["ArrowDown", "ArrowUp", "Enter"].includes(event.key)) return;
  if (openComboboxRole !== role) openStyleCombobox(role);
  if (!comboboxVisibleStyleIds.length) return;
  event.preventDefault();
  if (event.key === "Enter") {
    if (comboboxActiveIndex >= 0) {
      selectStyleById(role, comboboxVisibleStyleIds[comboboxActiveIndex]);
      closeStyleCombobox(role);
    }
    return;
  }
  const direction = event.key === "ArrowDown" ? 1 : -1;
  comboboxActiveIndex = (comboboxActiveIndex + direction + comboboxVisibleStyleIds.length) % comboboxVisibleStyleIds.length;
  updateComboboxActiveOption(role);
}

function updateComboboxActiveOption(role) {
  const menu = getComboboxMenu(role);
  menu.querySelectorAll("[data-style-option]").forEach((option) => option.classList.remove("is-active"));
  const styleId = comboboxVisibleStyleIds[comboboxActiveIndex];
  const activeOption = menu.querySelector(`[data-style-option="${styleId}"]`);
  if (!activeOption) return;
  activeOption.classList.add("is-active");
  activeOption.scrollIntoView({ block: "nearest" });
  getComboboxInput(role).setAttribute("aria-activedescendant", activeOption.id);
}

function selectStyleById(role, styleId) {
  const style = getMixerStyle(styleId);
  if (!style || !getStylePromptData(style.id)) {
    renderMixerStyleInputs();
    showMixerToast("请选择有效风格");
    return;
  }
  const otherId = role === "primary" ? mixerState.accentStyleId : mixerState.primaryStyleId;
  if (style.id === otherId) {
    renderMixerStyleInputs();
    showMixerToast("主风格与辅助风格需要不同");
    return;
  }
  if (role === "primary") mixerState.primaryStyleId = style.id;
  else mixerState.accentStyleId = style.id;
  normalizeMixerDimensions();
  renderMixer();
}

function normalizeMixerDimensions() {
  const available = new Set(getAccentDimensions());
  mixerState.selectedDimensions = new Set([...mixerState.selectedDimensions].filter((dimension) => available.has(dimension)));
  if (mixerState.selectedDimensions.size) return;
  const preferred = ["colorTone", "lightingImaging", "materialTexture", "mediumTechnique", "formGeometry"];
  const defaults = preferred.filter((dimension) => available.has(dimension)).slice(0, 2);
  const fallback = defaults.length ? defaults : [...available].slice(0, 2);
  mixerState.selectedDimensions = new Set(fallback);
}

function renderMixer() {
  renderMixerStyleInputs();
  renderMixerStylePreviews();
  renderMixerDimensions();
  renderMixCheck();
  renderMixerOutput();
  renderMixStructure();
  refreshMixerIcons();
}

function renderMixerStyleInputs() {
  mixerDom.primaryStyleSearch.value = styleLabel(getMixerStyle(mixerState.primaryStyleId));
  mixerDom.accentStyleSearch.value = styleLabel(getMixerStyle(mixerState.accentStyleId));
}

function renderMixerStylePreviews() {
  mixerDom.primaryStylePreview.innerHTML = createMixerStylePreview(getMixerStyle(mixerState.primaryStyleId), "主导");
  mixerDom.accentStylePreview.innerHTML = createMixerStylePreview(getMixerStyle(mixerState.accentStyleId), "从属");
}

function createMixerStylePreview(style, role) {
  const data = getStylePromptData(style.id);
  const dimensions = new Set(data.genes.map((gene) => gene.dimension).filter(Boolean));
  return `${createMixerVisual(style)}<div class="mix-style-copy"><strong>${escapeMixerHtml(style.nameZh)}</strong><small>${escapeMixerHtml(style.nameEn)} · ${escapeMixerHtml(style.period)}</small><span>${dimensions.size} 个视觉维度</span></div><b class="mix-role-badge">${role}</b>`;
}

function createMixerVisual(style) {
  if (!style.artwork?.src) return `<span class="mix-style-visual art-${style.art}" role="img" aria-label="${escapeMixerHtml(style.nameZh)}风格配图"></span>`;
  const src = style.artwork.src.replace("assets/artworks/", "assets/artworks/thumbs/").replace(/\.[^.]+$/, ".webp");
  return `<span class="mix-style-visual has-artwork"><img src="${src}" alt="${escapeMixerHtml(style.nameZh)}风格配图" width="1200" height="900" loading="lazy" decoding="async" /></span>`;
}

function renderMixerDimensions() {
  const accentData = getStylePromptData(mixerState.accentStyleId);
  const dimensions = getAccentDimensions();
  mixerDom.mixDimensionCount.textContent = `${mixerState.selectedDimensions.size} 项已选择`;
  mixerDom.mixDimensionList.innerHTML = dimensions.map((dimension) => {
    const meta = MIXER_DIMENSIONS[dimension] || { zh: dimension, color: "#6c6c66", icon: "circle-dashed" };
    const count = accentData.genes.filter((gene) => gene.dimension === dimension).length;
    const active = mixerState.selectedDimensions.has(dimension);
    return `<button type="button" class="mix-dimension ${active ? "is-active" : ""}" data-mix-dimension="${dimension}" aria-pressed="${active}" style="--dimension-color:${meta.color}">
      <i data-lucide="${meta.icon}" aria-hidden="true"></i><span><strong>${meta.zh}</strong><small>${count} 条执行基因</small></span><i data-lucide="${active ? "check" : "plus"}" aria-hidden="true"></i>
    </button>`;
  }).join("");
  refreshMixerIcons();
}

function renderMixCheck() {
  const overlaps = getCoreOverlapDimensions();
  if (overlaps.length) {
    const labels = overlaps.map((dimension) => MIXER_DIMENSIONS[dimension]?.zh || dimension).join("、");
    mixerDom.mixStatusBadge.textContent = "核心维度重叠";
    mixerDom.mixStatusBadge.classList.add("is-warning");
    mixerDom.mixCheck.className = "mix-check has-warning";
    mixerDom.mixCheck.innerHTML = `<i data-lucide="shield-alert" aria-hidden="true"></i><div><strong>主风格优先</strong><span>${labels}包含主风格核心基因，辅助特征将被限制为局部修饰。</span></div>`;
  } else {
    mixerDom.mixStatusBadge.textContent = "可控融合";
    mixerDom.mixStatusBadge.classList.remove("is-warning");
    mixerDom.mixCheck.className = "mix-check is-safe";
    mixerDom.mixCheck.innerHTML = `<i data-lucide="shield-check" aria-hidden="true"></i><div><strong>维度关系清晰</strong><span>辅助风格只替换主风格对应的可调整基因。</span></div>`;
  }
  refreshMixerIcons();
}

function renderMixerOutput() {
  const primary = getMixerStyle(mixerState.primaryStyleId);
  const accent = getMixerStyle(mixerState.accentStyleId);
  const subject = mixerDom.mixSubject.value.trim() || "未命名主体";
  const use = mixerDom.mixUse.value;
  const ratio = mixerDom.mixRatio.value;
  const selected = [...mixerState.selectedDimensions];
  const overlaps = getCoreOverlapDimensions();
  const primaryGenes = getStylePromptData(primary.id).genes.filter((gene) => {
    return gene.kind === "core" || !selected.includes(gene.dimension);
  });
  const accentGenes = getStylePromptData(accent.id).genes.filter((gene) => selected.includes(gene.dimension));
  const zhDimensions = selected.map((dimension) => MIXER_DIMENSIONS[dimension]?.zh || dimension).join("、");
  const enDimensions = selected.map((dimension) => MIXER_DIMENSIONS[dimension]?.en || dimension).join(", ");
  const primaryZh = primaryGenes.map((gene) => gene.promptZh).filter(Boolean).join("；");
  const primaryEn = primaryGenes.map((gene) => gene.promptEn).filter(Boolean).join("; ");
  const accentZh = accentGenes.map((gene) => gene.promptZh).filter(Boolean).join("；");
  const accentEn = accentGenes.map((gene) => gene.promptEn).filter(Boolean).join("; ");
  const strengthZh = mixerState.strength === "轻度" ? "以克制的局部影响应用" : "作为清晰可见但从属的辅助特征应用";
  const strengthEn = mixerState.strength === "轻度" ? "apply as a restrained local influence" : "apply as clearly visible but subordinate supporting traits";
  const constraintZh = overlaps.length
    ? "同一维度出现冲突时，以主风格核心基因为准，辅助特征只作为局部表面或成像修饰"
    : "所选辅助维度替换主风格对应的可调整基因，未选择维度继续遵循主风格";
  const constraintEn = overlaps.length
    ? "where instructions overlap, preserve the primary style's core genes and use the secondary traits only as local surface or imaging modifiers"
    : "replace only the primary style's adjustable genes in the selected dimensions; keep every unselected dimension governed by the primary style";

  mixerState.outputs = {
    zh: `${subject}，${use}设计，${ratio}。以${primary.nameZh}主导整体视觉；只改变视觉处理，保持用户主体的身份、数量、动作与关键结构。主风格执行：${primaryZh}。仅从${accent.nameZh}借用${zhDimensions}；${strengthZh}；不得引入辅助风格惯常的主体、题材、时代或场景。辅助风格执行：${accentZh}。融合约束：${constraintZh}。`,
    en: `${subject}, ${MIXER_USE_TRANSLATIONS[use]}, ${MIXER_RATIO_TRANSLATIONS[ratio]}. Let ${primary.nameEn} lead the overall visual treatment; change only the visual treatment and preserve the supplied subjects' identity, count, action, and defining structure. Primary execution: ${primaryEn}. Borrow only ${enDimensions} from ${accent.nameEn}; ${strengthEn}; do not introduce that style's customary subjects, themes, period, or setting. Secondary execution: ${accentEn}. Blend constraint: ${constraintEn}.`,
    negative: `避免：${buildStyleNegativeText("zh")}；两种风格平均混合；相互竞争的构图与空间规则；辅助风格改变主体身份或题材；未选择维度出现辅助风格特征。`
  };
  mixerDom.mixPromptResult.value = mixerState.outputs[mixerState.outputMode];
  const anatomy = [
    ["主体", "#df3b2e"], ["用途与画幅", "#2459d3"], [primary.nameZh, "#171715"],
    ...selected.map((dimension) => [MIXER_DIMENSIONS[dimension]?.zh || dimension, MIXER_DIMENSIONS[dimension]?.color || "#6c6c66"]),
    ["融合约束", "#2f7f62"]
  ];
  mixerDom.mixPromptAnatomy.innerHTML = anatomy.map(([label, color]) => `<span class="anatomy-token"><i style="background:${color}"></i>${escapeMixerHtml(label)}</span>`).join("");
}

function renderMixStructure() {
  const primary = getMixerStyle(mixerState.primaryStyleId);
  const accent = getMixerStyle(mixerState.accentStyleId);
  const selected = [...mixerState.selectedDimensions];
  mixerDom.mixStructureRatio.textContent = mixerState.strength === "轻度" ? "主导 / 轻度借鉴" : "主导 / 明显从属";
  mixerDom.mixStructureContent.innerHTML = `<div class="mix-structure-row"><span class="mix-structure-key is-primary">主</span><div><strong>${escapeMixerHtml(primary.nameZh)}</strong><small>整体身份 · 核心结构 · 未选择维度</small></div></div>
    <div class="mix-structure-row"><span class="mix-structure-key is-accent">辅</span><div><strong>${escapeMixerHtml(accent.nameZh)}</strong><small>${selected.map((dimension) => MIXER_DIMENSIONS[dimension]?.zh || dimension).join(" · ")}</small></div></div>`;
}

function getAccentDimensions() {
  const data = getStylePromptData(mixerState.accentStyleId);
  if (!data) return [];
  return Object.keys(MIXER_DIMENSIONS).filter((dimension) => data.genes.some((gene) => gene.dimension === dimension));
}

function getCoreOverlapDimensions() {
  const primaryData = getStylePromptData(mixerState.primaryStyleId);
  return [...mixerState.selectedDimensions].filter((dimension) => {
    return primaryData.genes.some((gene) => gene.dimension === dimension && gene.kind === "core");
  });
}

async function copyMixerPrompt() {
  const text = mixerDom.mixPromptResult.value;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    mixerDom.mixPromptResult.select();
    document.execCommand("copy");
  }
  showMixerToast("融合 Prompt 已复制");
}

function resetMixer() {
  mixerState.primaryStyleId = "constructivism";
  mixerState.accentStyleId = "cyberpunk";
  mixerState.selectedDimensions = new Set(["colorTone", "lightingImaging", "materialTexture"]);
  mixerState.strength = "明显";
  mixerState.outputMode = "zh";
  mixerDom.mixSubject.value = "未来城市音乐节";
  mixerDom.mixUse.value = "海报";
  mixerDom.mixRatio.value = "纵向 2:3";
  mixerDom.mixStrengthControl.querySelectorAll("button").forEach((button) => button.classList.toggle("is-active", button.dataset.strength === "明显"));
  document.querySelectorAll("[data-mix-output]").forEach((button) => {
    const active = button.dataset.mixOutput === "zh";
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
  });
  renderMixer();
  showMixerToast("风格混合器已重置");
}

function getMixerStyle(id) {
  return STYLE_DATA.find((style) => style.id === id);
}

function styleLabel(style) {
  return `${style.nameZh} · ${style.nameEn}`;
}

function showMixerToast(message) {
  clearTimeout(mixerToastTimer);
  mixerDom.mixerToast.textContent = message;
  mixerDom.mixerToast.classList.add("is-visible");
  mixerToastTimer = setTimeout(() => mixerDom.mixerToast.classList.remove("is-visible"), 1800);
}

function refreshMixerIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}

function escapeMixerHtml(value) {
  return String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;" })[char]);
}
