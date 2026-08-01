const QUICK_FILTER_PRESETS = [
  { id: "rational", label: "理性、有秩序", traits: ["几何", "理性", "网格", "秩序", "系统化", "模块化", "精密"], minMatches: 2 },
  { id: "organic", label: "自然、有温度", traits: ["有机", "自然", "生态", "手工", "自然色"], minMatches: 1 },
  { id: "restrained", label: "克制、有留白", traits: ["留白", "克制", "低饱和", "轻盈", "开放构图"], minMatches: 2 },
  { id: "expressive", label: "强烈、有冲击", traits: ["强对比", "高饱和", "动态", "反叛", "戏剧", "表现"], minMatches: 2 },
  { id: "nostalgic", label: "怀旧、有故事", traits: ["怀旧", "叙事", "浪漫", "象征", "手工"], minMatches: 1 },
  { id: "futuristic", label: "未来、有科技感", traits: ["未来", "数字", "冷色", "高识别", "系统化"], minMatches: 1 }
];

const state = {
  view: "atlas",
  search: "",
  quickPreset: "",
  filters: { type: new Set(), region: new Set(), traits: new Set(), fields: new Set() },
  favoritesOnly: false,
  favorites: new Set(JSON.parse(localStorage.getItem("style-atlas-favorites") || "[]")),
  compare: [],
  selectedPromptStyleId: "cyberpunk",
  promptGenes: [],
  promptControls: {},
  promptOutputMode: "zh",
  promptOutputs: {},
  promptIntensity: "明显",
  promptPaletteIndex: 0,
  promptCustomColor: "",
  vocabularySearch: "",
  vocabularyGroup: "all",
  timelineZoom: 1,
  lastDetailTrigger: null
};

const labels = {
  type: "风格分类",
  region: "地域",
  traits: "视觉特征",
  fields: "应用领域",
  composition: "构图",
  form: "造型",
  color: "色彩",
  typeface: "字体",
  texture: "材质"
};

const useTranslations = {
  "海报": "poster design",
  "品牌视觉": "brand identity visual",
  "插画": "editorial illustration",
  "数字界面": "digital interface concept",
  "空间概念": "spatial design concept"
};

const ratioTranslations = {
  "纵向 2:3": "vertical 2:3 composition",
  "横向 16:9": "landscape 16:9 composition",
  "方形 1:1": "square 1:1 composition"
};

const intensityTranslations = {
  "借鉴": { zh: "轻度借鉴", en: "subtle influence from" },
  "明显": { zh: "具有明显的", en: "clearly expressed" },
  "主导": { zh: "由其视觉语言主导", en: "strongly dominated by" }
};

const dom = {};
let toastTimer;

function trackAnalyticsEvent(action, label = "") {
  if (!Array.isArray(window._hmt)) return;
  window._hmt.push(["_trackEvent", "style_atlas", action, label]);
}

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheDom();
  normalizeLocalFileLinks(document);
  bindGlobalEvents();
  renderQuickFilters();
  renderFilterGroups();
  renderVocabulary();
  renderTimeline();
  const requestedStyleId = new URLSearchParams(window.location.search).get("style");
  const initialStyleId = getStyle(requestedStyleId) ? requestedStyleId : state.selectedPromptStyleId;
  setPromptStyle(initialStyleId, false);
  renderAtlas();
  const requestedView = window.location.hash.slice(1);
  if (["atlas", "dictionary", "timeline", "prompt"].includes(requestedView) && requestedView !== "atlas") {
    switchView(requestedView);
  }
  refreshIcons();
}

function cacheDom() {
  [
    "styleSearch", "resultCount", "styleGrid", "emptyState", "quickFilters", "filterGroups",
    "mobileFilterGroups", "activeFilters", "clearFiltersButton", "emptyResetButton",
    "favoritesButton", "favoriteCount", "openCompareButton", "compareCount", "compareDock",
    "compareSummary", "compareNowButton", "clearCompareButton", "compareDialog", "compareContent",
    "closeCompareDialog", "detailLayer", "detailDrawer", "detailContent", "detailKicker", "mobileFilterButton", "mobileFilterSheet",
    "timelineAxis", "timelineLanes", "promptSubject", "promptUse", "promptRatio", "intensityControl",
    "selectedPromptStyle", "promptGenes", "geneCount", "palettePicker", "promptControls", "controlCount", "promptResult",
    "promptAnatomy", "copyPromptButton", "generateImageButton", "generateImageLabel", "resetPromptButton",
    "imageResult", "imageGenerationStatus", "imageStage", "imageStageState", "imageStateTitle", "imageStateText",
    "generatedImage", "downloadImageButton",
    "browseStylesButton", "promptStyleIndicator", "timelineViewport", "timelineCanvas",
    "timelineZoomOut", "timelineZoomIn", "timelineZoomRange", "timelineZoomValue", "timelineZoomReset",
    "vocabularySearch", "vocabularyFilters", "vocabularyGroups", "vocabularyCount", "vocabularyEmpty",
    "vocabularyResetButton", "toast"
  ].forEach((id) => { dom[id] = document.getElementById(id); });
}

function bindGlobalEvents() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.view));
  });

  dom.styleSearch.addEventListener("input", (event) => {
    state.search = event.target.value.trim().toLowerCase();
    renderAtlas();
  });

  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      switchView("atlas");
      dom.styleSearch.focus();
    }
    if (event.key === "Escape") {
      closeDetail();
      closeMobileFilters();
    }
  });

  dom.clearFiltersButton.addEventListener("click", clearFilters);
  dom.emptyResetButton.addEventListener("click", clearFilters);
  dom.favoritesButton.addEventListener("click", () => {
    state.favoritesOnly = !state.favoritesOnly;
    dom.favoritesButton.classList.toggle("is-active", state.favoritesOnly);
    dom.favoritesButton.setAttribute("aria-pressed", String(state.favoritesOnly));
    renderAtlas();
  });
  dom.openCompareButton.addEventListener("click", openCompareDialog);
  dom.compareNowButton.addEventListener("click", openCompareDialog);
  dom.clearCompareButton.addEventListener("click", clearCompare);
  dom.closeCompareDialog.addEventListener("click", () => dom.compareDialog.close());

  document.querySelectorAll("[data-close-detail]").forEach((node) => node.addEventListener("click", closeDetail));
  document.querySelectorAll("[data-close-filter]").forEach((node) => node.addEventListener("click", closeMobileFilters));
  dom.mobileFilterButton.addEventListener("click", openMobileFilters);

  document.querySelectorAll("[data-open-style]").forEach((button) => {
    button.addEventListener("click", () => openDetail(button.dataset.openStyle, button));
  });

  [dom.promptSubject, dom.promptUse, dom.promptRatio].forEach((control) => {
    control.addEventListener("input", renderPromptOutput);
  });

  dom.intensityControl.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-intensity]");
    if (!button) return;
    state.promptIntensity = button.dataset.intensity;
    dom.intensityControl.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item === button));
    renderPromptOutput();
  });

  dom.promptControls.addEventListener("change", (event) => {
    const select = event.target.closest("select[data-prompt-control]");
    if (!select) return;
    const group = PROMPT_CONTROL_GROUPS.find((item) => item.id === select.dataset.promptControl);
    state.promptControls[group.id] = select.value;
    renderPromptSelectors();
    renderPromptControls();
    renderPromptOutput();
  });

  document.querySelectorAll("[data-output]").forEach((button) => {
    button.addEventListener("click", () => {
      state.promptOutputMode = button.dataset.output;
      document.querySelectorAll("[data-output]").forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-selected", String(active));
      });
      renderPromptOutput();
    });
  });

  dom.copyPromptButton.addEventListener("click", copyPrompt);
  dom.generateImageButton.addEventListener("click", startImageGeneration);
  dom.resetPromptButton.addEventListener("click", () => {
    dom.promptSubject.value = "未来城市音乐节";
    dom.promptUse.value = "海报";
    dom.promptRatio.value = "纵向 2:3";
    state.promptIntensity = "明显";
    state.promptPaletteIndex = 0;
    state.promptCustomColor = "";
    state.promptControls = {};
    setPromptStyle("cyberpunk", false);
    dom.intensityControl.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item.dataset.intensity === "明显"));
    showToast("Prompt 已重置");
  });
  dom.browseStylesButton.addEventListener("click", () => switchView("atlas"));

  dom.vocabularySearch.addEventListener("input", (event) => {
    state.vocabularySearch = event.target.value.trim().toLowerCase();
    renderVocabulary();
  });
  dom.vocabularyFilters.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-vocabulary-group]");
    if (!button) return;
    state.vocabularyGroup = button.dataset.vocabularyGroup;
    renderVocabulary();
  });
  dom.vocabularyResetButton.addEventListener("click", () => {
    state.vocabularySearch = "";
    state.vocabularyGroup = "all";
    dom.vocabularySearch.value = "";
    renderVocabulary();
  });
  dom.vocabularyGroups.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-vocabulary-term]");
    if (!button) return;
    openVocabularyDetail(button.dataset.vocabularyTerm, button);
  });

  document.querySelector("[data-feedback-email]")?.addEventListener("click", () => {
    trackAnalyticsEvent("feedback_email", "footer");
  });

  dom.timelineZoomOut.addEventListener("click", () => setTimelineZoom(state.timelineZoom - 0.25));
  dom.timelineZoomIn.addEventListener("click", () => setTimelineZoom(state.timelineZoom + 0.25));
  dom.timelineZoomReset.addEventListener("click", () => setTimelineZoom(1));
  dom.timelineZoomRange.addEventListener("input", (event) => setTimelineZoom(Number(event.target.value)));
  bindTimelinePan();

  dom.compareDialog.addEventListener("click", (event) => {
    if (event.target === dom.compareDialog) dom.compareDialog.close();
  });
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}

function escapeVocabularyText(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function renderVocabulary() {
  const query = state.vocabularySearch;
  const selectedGroup = state.vocabularyGroup;
  const visibleGroups = VISUAL_VOCABULARY_GROUPS.flatMap((group) => {
    if (selectedGroup !== "all" && group.id !== selectedGroup) return [];
    const groupMatches = `${group.label} ${group.intro}`.toLowerCase().includes(query);
    const options = group.options.filter((option) => {
      if (!query || groupMatches) return true;
      return ["zh", "en", "definition", "family", "controls", "mechanism", "observable", "effect", "boundary", "descriptionZh", "descriptionEn"]
        .map((field) => option[field] || "")
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
    return options.length ? [{ ...group, options }] : [];
  });
  const visibleCount = visibleGroups.reduce((total, group) => total + group.options.length, 0);

  dom.vocabularyCount.textContent = String(visibleCount);
  dom.vocabularyFilters.innerHTML = [
    `<button class="vocabulary-filter ${selectedGroup === "all" ? "is-active" : ""}" data-vocabulary-group="all">全部 <span>${VISUAL_VOCABULARY_COUNT}</span></button>`,
    ...VISUAL_VOCABULARY_GROUPS.map((group) => `<button class="vocabulary-filter ${selectedGroup === group.id ? "is-active" : ""}" data-vocabulary-group="${group.id}" style="--vocabulary-color:${group.color}">${group.label} <span>${group.options.length}</span></button>`)
  ].join("");

  dom.vocabularyGroups.innerHTML = visibleGroups.map((group) => `
    <section class="vocabulary-group" style="--vocabulary-color:${group.color}">
      <header class="vocabulary-group-heading">
        <span class="vocabulary-group-icon"><i data-lucide="${group.icon}" aria-hidden="true"></i></span>
        <div>
          <h2>${group.label}</h2>
          <p>${group.intro}</p>
        </div>
        <span>${group.options.length} 项</span>
      </header>
      <div class="vocabulary-grid">
        ${group.options.map((option) => `
          <button class="vocabulary-card" type="button" data-vocabulary-term="${escapeVocabularyText(option.zh)}" aria-label="查看${escapeVocabularyText(option.zh)}详细参数">
            <span class="vocabulary-card-heading">
              <span class="vocabulary-index">${String(option.index + 1).padStart(2, "0")}</span>
              <span>
                <strong>${escapeVocabularyText(option.zh)}</strong>
                <span lang="en">${escapeVocabularyText(option.en)}</span>
              </span>
            </span>
            <span class="vocabulary-definition">${escapeVocabularyText(option.definition)}</span>
          </button>
        `).join("")}
      </div>
    </section>
  `).join("");
  dom.vocabularyEmpty.hidden = visibleCount > 0;
  refreshIcons();
}

function getArtworkVariantSrc(src, variant) {
  return src
    .replace("assets/artworks/", `assets/artworks/${variant}/`)
    .replace(/\.[^.]+$/, ".webp");
}

function createVisual(style, className = "style-visual", options = {}) {
  const artwork = style.artwork;
  if (!artwork) {
    return `<span class="${className} art-${style.art}" role="img" aria-label="${style.nameZh}风格配图"></span>`;
  }

  const thumbSrc = getArtworkVariantSrc(artwork.src, "thumbs");
  const optimizedSrc = getArtworkVariantSrc(artwork.src, "optimized");
  const imageSrc = options.detail ? optimizedSrc : thumbSrc;
  const loading = options.priority ? "eager" : "lazy";
  const fetchPriority = options.priority ? ' fetchpriority="high"' : "";
  const image = `<img src="${imageSrc}" alt="${style.nameZh}风格配图" width="1200" height="900" loading="${loading}" decoding="async"${fetchPriority} />`;
  return `<span class="${className} has-artwork" role="img" aria-label="${style.nameZh}风格配图">${image}</span>`;
}

function renderQuickFilters() {
  dom.quickFilters.innerHTML = QUICK_FILTER_PRESETS.map((preset) => {
    const count = STYLE_DATA.filter((style) => getPresetMatchCount(style, preset) >= preset.minMatches).length;
    return `<button class="chip" data-quick-preset="${preset.id}" aria-label="${preset.label}，${count} 种风格">${preset.label}</button>`;
  }).join("");
  dom.quickFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-preset]");
    if (!button) return;
    state.quickPreset = state.quickPreset === button.dataset.quickPreset ? "" : button.dataset.quickPreset;
    syncFilterControls();
    renderAtlas();
  });
}

function renderFilterGroups() {
  const groupName = { type: "风格分类", region: "地域", traits: "视觉特征", fields: "应用领域" };
  const markup = Object.entries(FILTER_GROUPS).map(([group, options]) => {
    return `<section class="filter-group"><h3>${groupName[group]}</h3><div class="filter-options">${options.map((option) => {
      const count = STYLE_DATA.filter((style) => group === "traits" || group === "fields" ? style[group].includes(option) : style[group] === option || (group === "type" && style.type === option)).length;
      return `<label class="filter-option"><input type="checkbox" data-filter-group="${group}" value="${option}" /><span class="checkbox-mark" aria-hidden="true"><i data-lucide="check"></i></span><span>${option}</span><output>${count}</output></label>`;
    }).join("")}</div></section>`;
  }).join("");
  dom.filterGroups.innerHTML = markup;
  dom.mobileFilterGroups.innerHTML = markup;
  [dom.filterGroups, dom.mobileFilterGroups].forEach((container) => {
    container.addEventListener("change", (event) => {
      const input = event.target.closest("input[data-filter-group]");
      if (!input) return;
      toggleFilter(input.dataset.filterGroup, input.value, input.checked);
    });
  });
}

function toggleFilter(group, value, force) {
  const set = state.filters[group];
  const shouldAdd = force === undefined ? !set.has(value) : force;
  if (shouldAdd) set.add(value);
  else set.delete(value);
  syncFilterControls();
  renderAtlas();
}

function syncFilterControls() {
  document.querySelectorAll("input[data-filter-group]").forEach((input) => {
    input.checked = state.filters[input.dataset.filterGroup].has(input.value);
  });
  document.querySelectorAll("[data-quick-preset]").forEach((button) => {
    button.classList.toggle("is-active", state.quickPreset === button.dataset.quickPreset);
  });
}

function hasAnyFilter() {
  return state.search || state.quickPreset || state.favoritesOnly || Object.values(state.filters).some((set) => set.size);
}

function clearFilters() {
  state.search = "";
  state.quickPreset = "";
  state.favoritesOnly = false;
  Object.values(state.filters).forEach((set) => set.clear());
  dom.styleSearch.value = "";
  dom.favoritesButton.classList.remove("is-active");
  syncFilterControls();
  renderAtlas();
}

function getFilteredStyles() {
  const preset = QUICK_FILTER_PRESETS.find((item) => item.id === state.quickPreset);
  const styles = STYLE_DATA.filter((style) => {
    if (state.favoritesOnly && !state.favorites.has(style.id)) return false;
    if (preset && getPresetMatchCount(style, preset) < preset.minMatches) return false;
    if (state.filters.type.size && !state.filters.type.has(style.type)) return false;
    if (state.filters.region.size && !state.filters.region.has(style.region)) return false;
    if (state.filters.traits.size && ![...state.filters.traits].every((trait) => style.traits.includes(trait))) return false;
    if (state.filters.fields.size && ![...state.filters.fields].some((field) => style.fields.includes(field))) return false;
    if (!state.search) return true;
    const haystack = [style.nameZh, style.nameEn, style.type, style.period, style.region, style.summary, style.recognition, ...style.traits, ...style.fields, ...Object.values(style.genes).flat()].join(" ").toLowerCase();
    return haystack.includes(state.search);
  });
  if (preset) styles.sort((a, b) => getPresetMatchCount(b, preset) - getPresetMatchCount(a, preset));
  return styles;
}

function getPresetMatchCount(style, preset) {
  return style.traits.filter((trait) => preset.traits.includes(trait)).length;
}

function renderAtlas() {
  const styles = getFilteredStyles();
  dom.resultCount.textContent = String(styles.length);
  dom.favoriteCount.textContent = String(state.favorites.size);
  dom.compareCount.textContent = String(state.compare.length);
  dom.clearFiltersButton.disabled = !hasAnyFilter();
  renderActiveFilters();

  dom.styleGrid.innerHTML = styles.map((style, index) => {
    const favorite = state.favorites.has(style.id);
    const compared = state.compare.includes(style.id);
    return `<article class="style-card" data-style-card="${style.id}">
      <a class="style-card-main" href="${getStylePageHref(style.id)}" data-open-detail="${style.id}" aria-label="查看${style.nameZh}详情">
        ${createVisual(style, "style-visual", { priority: index < 3 })}
        <span class="style-meta">
          <span class="style-name-row"><span class="style-card-title">${style.nameZh}</span><span class="style-period">${style.period}</span></span>
          <span class="style-en">${style.nameEn}</span>
          <span class="style-tags"><span>${style.type}</span>${style.traits.slice(0, 3).map((trait) => `<span>${trait}</span>`).join("")}</span>
        </span>
      </a>
      <div class="card-tools ${favorite || compared ? "has-active" : ""}">
        <button class="icon-button ${favorite ? "is-active" : ""}" data-favorite="${style.id}" aria-label="${favorite ? "取消收藏" : "收藏"}${style.nameZh}" title="${favorite ? "取消收藏" : "收藏"}"><i data-lucide="bookmark"></i></button>
        <button class="icon-button ${compared ? "is-active" : ""}" data-compare="${style.id}" aria-label="${compared ? "移出" : "加入"}对比" title="${compared ? "移出对比" : "加入对比"}"><i data-lucide="columns-2"></i></button>
      </div>
    </article>`;
  }).join("");

  dom.emptyState.hidden = styles.length > 0;
  dom.styleGrid.hidden = styles.length === 0;
  bindCardEvents();
  renderCompareDock();
  refreshIcons();
}

function renderActiveFilters() {
  const items = [];
  const preset = QUICK_FILTER_PRESETS.find((item) => item.id === state.quickPreset);
  if (preset) items.push({ group: "preset", value: preset.label });
  if (state.favoritesOnly) items.push({ group: "favorites", value: "只看收藏" });
  Object.entries(state.filters).forEach(([group, set]) => set.forEach((value) => items.push({ group, value })));
  dom.activeFilters.innerHTML = items.length
    ? items.map((item) => `<button class="active-filter" data-remove-filter="${item.group}" data-value="${item.value}">${item.value}<i data-lucide="x"></i></button>`).join("")
    : `<span class="compare-placeholder">全部风格 · 按相关性排序</span>`;
  dom.activeFilters.querySelectorAll("[data-remove-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.removeFilter === "preset") state.quickPreset = "";
      else if (button.dataset.removeFilter === "favorites") state.favoritesOnly = false;
      else state.filters[button.dataset.removeFilter].delete(button.dataset.value);
      syncFilterControls();
      renderAtlas();
    });
  });
}

function bindCardEvents() {
  dom.styleGrid.querySelectorAll("[data-open-detail]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!shouldOpenDrawer(event)) return;
      event.preventDefault();
      openDetail(link.dataset.openDetail, link);
    });
  });
  dom.styleGrid.querySelectorAll("[data-favorite]").forEach((button) => button.addEventListener("click", () => toggleFavorite(button.dataset.favorite)));
  dom.styleGrid.querySelectorAll("[data-compare]").forEach((button) => button.addEventListener("click", () => toggleCompare(button.dataset.compare)));
}

function toggleFavorite(id) {
  if (state.favorites.has(id)) state.favorites.delete(id);
  else state.favorites.add(id);
  localStorage.setItem("style-atlas-favorites", JSON.stringify([...state.favorites]));
  const style = getStyle(id);
  showToast(`${style.nameZh}${state.favorites.has(id) ? "已收藏" : "已取消收藏"}`);
  renderAtlas();
  if (!dom.detailLayer.hidden) renderDetail(style);
}

function toggleCompare(id) {
  if (state.compare.includes(id)) {
    state.compare = state.compare.filter((item) => item !== id);
  } else if (state.compare.length < 2) {
    state.compare.push(id);
  } else {
    showToast("对比最多选择两个风格");
    return;
  }
  renderAtlas();
  if (!dom.detailLayer.hidden) renderDetail(getStyle(id));
}

function renderCompareDock() {
  dom.compareDock.hidden = state.compare.length === 0;
  dom.compareNowButton.disabled = state.compare.length !== 2;
  dom.compareSummary.innerHTML = state.compare.length
    ? state.compare.map((id) => {
      const style = getStyle(id);
      return `<span class="compare-item"><i style="background:${style.palette[0]}"></i>${style.nameZh}</span>`;
    }).join("") + (state.compare.length === 1 ? `<span class="compare-placeholder">再选择一个风格</span>` : "")
    : "";
  dom.compareCount.textContent = String(state.compare.length);
}

function clearCompare() {
  state.compare = [];
  renderAtlas();
  showToast("已清空对比");
}

function openCompareDialog() {
  if (state.compare.length !== 2) {
    showToast("请先选择两个风格");
    return;
  }
  const [a, b] = state.compare.map(getStyle);
  dom.compareContent.innerHTML = `<div class="compare-head"><span></span>${[a, b].map((style) => `<div class="compare-style-head">${createVisual(style)}<div><h3>${style.nameZh}</h3><small>${style.period}</small></div></div>`).join("")}</div>
    <table class="compare-table"><tbody>
      ${compareRow("一句话识别", a.recognition, b.recognition)}
      ${compareRow("典型构图", a.genes.composition.join("、"), b.genes.composition.join("、"))}
      ${compareRow("典型造型", a.genes.form.join("、"), b.genes.form.join("、"))}
      ${compareRow("典型色彩", a.genes.color.join("、"), b.genes.color.join("、"))}
      ${compareRow("典型字体", a.genes.type.join("、"), b.genes.type.join("、"))}
      ${compareRow("典型材质", a.genes.texture.join("、"), b.genes.texture.join("、"))}
      ${compareRow("形成语境", a.influencedBy, b.influencedBy)}
      ${compareRow("适合领域", a.fields.join("、"), b.fields.join("、"))}
    </tbody></table>`;
  dom.compareDialog.showModal();
  refreshIcons();
}

function compareRow(name, a, b) {
  return `<tr><th>${name}</th><td>${a}</td><td>${b}</td></tr>`;
}

function openDetail(id, trigger) {
  const style = getStyle(id);
  if (!style) return;
  trackAnalyticsEvent("style_detail", style.id);
  state.lastDetailTrigger = trigger || document.activeElement;
  dom.detailKicker.textContent = "STYLE PROFILE";
  dom.detailDrawer.classList.remove("is-vocabulary-detail");
  dom.detailDrawer.style.removeProperty("--vocabulary-color");
  renderDetail(style);
  dom.detailLayer.hidden = false;
  document.body.classList.add("has-layer");
  dom.detailLayer.querySelector("[data-close-detail]").focus();
}

function openVocabularyDetail(term, trigger) {
  const group = VISUAL_VOCABULARY_GROUPS.find((item) => item.options.some((option) => option.zh === term));
  const option = group?.options.find((item) => item.zh === term);
  if (!group || !option) return;
  trackAnalyticsEvent("visual_vocabulary_detail", option.zh);
  state.lastDetailTrigger = trigger || document.activeElement;
  dom.detailKicker.textContent = "VISUAL ATOM";
  dom.detailDrawer.classList.add("is-vocabulary-detail");
  dom.detailDrawer.style.setProperty("--vocabulary-color", group.color);
  renderVocabularyDetail(group, option);
  dom.detailLayer.hidden = false;
  document.body.classList.add("has-layer");
  dom.detailLayer.querySelector("[data-close-detail]").focus();
}

function renderVocabularyDetail(group, option) {
  dom.detailContent.innerHTML = `<div class="vocabulary-detail-hero">
    <div class="vocabulary-detail-heading">
      <span class="vocabulary-detail-index">${String(option.index + 1).padStart(2, "0")}</span>
      <div>
        <div class="detail-tags"><span class="chip">${escapeVocabularyText(group.label)}</span><span class="chip">${escapeVocabularyText(option.family)}</span></div>
        <h2 id="detailTitle">${escapeVocabularyText(option.zh)}</h2>
        <p class="vocabulary-detail-en" lang="en">${escapeVocabularyText(option.en)}</p>
      </div>
    </div>
    <p class="vocabulary-detail-summary">${escapeVocabularyText(option.definition)}</p>
  </div>
  <div class="vocabulary-detail-body">
    <section class="vocabulary-standard-block">
      <div class="vocabulary-standard-label"><span>标准视觉描述</span><small>STANDARD VISUAL DESCRIPTION</small></div>
      <p class="vocabulary-standard-zh">${escapeVocabularyText(option.descriptionZh)}</p>
      <p class="vocabulary-standard-en" lang="en">${escapeVocabularyText(option.descriptionEn)}</p>
    </section>

    <section class="vocabulary-causal-section">
      <h3>视觉机制链</h3>
      <div class="vocabulary-causal-chain">
        <article><span>01</span><h4>成因机制</h4><p>${escapeVocabularyText(option.mechanism)}</p></article>
        <article><span>02</span><h4>可观察现象</h4><p>${escapeVocabularyText(option.observable)}</p></article>
        <article><span>03</span><h4>视觉 / 认知作用</h4><p>${escapeVocabularyText(option.effect)}</p></article>
      </div>
    </section>

    <div class="vocabulary-detail-notes">
      <section class="vocabulary-control-band"><span>可控参数</span><p>${escapeVocabularyText(option.controls)}</p></section>
      <section class="vocabulary-boundary-band"><span>机制边界 · 依赖与互斥</span><p>${escapeVocabularyText(option.boundary)}</p></section>
    </div>
  </div>`;
  dom.detailDrawer.scrollTop = 0;
  refreshIcons();
}

function renderDetail(style) {
  const favorite = state.favorites.has(style.id);
  const compared = state.compare.includes(style.id);
  const rows = [
    ["典型构图", style.genes.composition], ["典型造型", style.genes.form], ["典型色彩", style.genes.color],
    ["典型字体", style.genes.type], ["典型材质", style.genes.texture]
  ];
  dom.detailContent.innerHTML = `<div class="detail-hero">
    <div class="detail-title">
      <div class="detail-tags"><span class="chip">${style.type}</span><span class="chip">${style.period}</span><span class="chip">${style.region}</span></div>
      <h2 id="detailTitle">${style.nameZh}</h2><div class="detail-en">${style.nameEn}</div>
      <p class="detail-summary">${style.summary}</p>
      <p class="detail-recognition"><strong>一眼识别：</strong>${style.recognition}</p>
      <div class="detail-actions">
        <button class="primary-button" data-use-prompt="${style.id}"><i data-lucide="wand-sparkles"></i><span class="detail-action-label-full">生成 Prompt</span><span class="detail-action-label-short">Prompt</span></button>
        <a class="secondary-button" href="${getStylePageHref(style.id)}"><i data-lucide="external-link"></i><span class="detail-action-label-full">风格指南</span><span class="detail-action-label-short">指南</span></a>
        <button class="secondary-button" data-detail-compare="${style.id}"><i data-lucide="columns-2"></i><span class="detail-action-label-full">${compared ? "移出对比" : "加入对比"}</span><span class="detail-action-label-short">${compared ? "移出" : "对比"}</span></button>
        <button class="icon-button ${favorite ? "is-active" : ""}" data-detail-favorite="${style.id}" aria-label="${favorite ? "取消收藏" : "收藏"}${style.nameZh}" aria-pressed="${favorite}" title="${favorite ? "已收藏，点击取消" : "收藏风格"}"><i data-lucide="${favorite ? "bookmark-check" : "bookmark"}"></i></button>
      </div>
    </div>
    ${createVisual(style, "detail-visual", { detail: true, priority: true })}
  </div>
  <div class="detail-body">
    <section class="detail-section"><h3>典型视觉倾向</h3><table class="gene-table"><tbody>${rows.map(([name, values]) => `<tr><th>${name}</th><td>${values.join(" · ")}</td></tr>`).join("")}</tbody></table></section>
    <section class="detail-section"><h3>历史脉络</h3><div class="lineage-grid"><div><span>来自</span><strong>${style.influencedBy}</strong></div><div><span>影响</span><strong>${style.influenced}</strong></div></div></section>
    <section class="detail-section"><h3>视觉语言 Prompt</h3><div class="detail-prompt">${style.aiPrompt?.zh || style.promptZh.join("，")}</div></section>
    <section class="detail-section"><h3>相邻风格</h3><div class="detail-tags">${style.related.map((id) => { const related = getStyle(id); return `<a class="relation-chip" href="${getStylePageHref(id)}" data-related-style="${id}">${related.nameZh}</a>`; }).join("")}</div></section>
  </div>`;
  dom.detailContent.querySelector("[data-use-prompt]").addEventListener("click", () => {
    setPromptStyle(style.id);
    closeDetail();
    switchView("prompt");
  });
  dom.detailContent.querySelector("[data-detail-compare]").addEventListener("click", () => toggleCompare(style.id));
  dom.detailContent.querySelector("[data-detail-favorite]").addEventListener("click", () => toggleFavorite(style.id));
  dom.detailContent.querySelectorAll("[data-related-style]").forEach((link) => {
    link.addEventListener("click", (event) => {
      if (!shouldOpenDrawer(event)) return;
      event.preventDefault();
      const relatedStyle = getStyle(link.dataset.relatedStyle);
      if (!relatedStyle) return;
      trackAnalyticsEvent("style_detail", relatedStyle.id);
      renderDetail(relatedStyle);
      dom.detailDrawer.scrollTop = 0;
    });
  });
  refreshIcons();
}

function closeDetail() {
  if (dom.detailLayer.hidden) return;
  dom.detailLayer.hidden = true;
  document.body.classList.remove("has-layer");
  if (state.lastDetailTrigger && document.contains(state.lastDetailTrigger)) state.lastDetailTrigger.focus();
}

function openMobileFilters() {
  dom.mobileFilterSheet.hidden = false;
  document.body.classList.add("has-layer");
  dom.mobileFilterSheet.querySelector("[data-close-filter]").focus();
}

function closeMobileFilters() {
  if (dom.mobileFilterSheet.hidden) return;
  dom.mobileFilterSheet.hidden = true;
  document.body.classList.remove("has-layer");
  dom.mobileFilterButton.focus();
}

function switchView(view) {
  if (view !== state.view) trackAnalyticsEvent("view_open", view);
  state.view = view;
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    const active = panel.dataset.viewPanel === view;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  });
  document.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  history.replaceState(null, "", `#${view}`);
  window.scrollTo({ top: 0, behavior: "smooth" });
  if (view === "prompt") renderPromptOutput();
}

function renderTimeline() {
  const trackWidth = Math.round(2200 * state.timelineZoom);
  dom.timelineCanvas.style.setProperty("--timeline-track-width", `${trackWidth}px`);
  dom.timelineZoomRange.value = String(state.timelineZoom);
  dom.timelineZoomRange.style.setProperty("--range-progress", `${((state.timelineZoom - 1) / 5) * 100}%`);
  dom.timelineZoomValue.value = `${Math.round(state.timelineZoom * 100)}%`;
  dom.timelineZoomOut.disabled = state.timelineZoom <= 1;
  dom.timelineZoomIn.disabled = state.timelineZoom >= 6;
  const years = [-1000, 0, 500, 1000, 1500, 1800, 1900, 1950, 2000, 2025];
  dom.timelineAxis.innerHTML = years.map((year) => `<span class="axis-label" style="left:${timelinePosition(year)}%">${formatTimelineYear(year)}</span>`).join("");
  const tracks = ["欧洲艺术与现代主义", "东亚视觉传统", "全球地域传统", "商业与设计视觉", "数字与网络审美"];
  dom.timelineLanes.innerHTML = tracks.map((track) => {
    const items = STYLE_DATA.filter((style) => style.track === track).sort((a, b) => a.year - b.year);
    const layout = layoutTimelineItems(items, trackWidth);
    return `<section class="timeline-lane" style="--lane-height:${layout.height}px"><div class="lane-label">${track}</div><div class="lane-track">${layout.items.map(({ style, position, top, connectorHeight }) => {
      return `<span class="timeline-marker" style="left:${position}%" aria-hidden="true"></span><button class="timeline-node" data-timeline-style="${style.id}" style="left:${position}%;--node-top:${top}px;--connector-height:${connectorHeight}px">${createVisual(style, "timeline-node-visual")}<strong>${style.nameZh}</strong><small>${style.period}</small></button>`;
    }).join("")}</div></section>`;
  }).join("");
  dom.timelineLanes.querySelectorAll("[data-timeline-style]").forEach((button) => button.addEventListener("click", () => openDetail(button.dataset.timelineStyle, button)));
}

function layoutTimelineItems(items, trackWidth) {
  const rowEnds = [];
  const nodeGap = 126;
  const placed = items.map((style) => {
    const position = timelinePosition(style.year);
    const x = (position / 100) * trackWidth;
    let row = rowEnds.findIndex((end) => x - end >= nodeGap);
    if (row === -1) row = rowEnds.length;
    rowEnds[row] = x;
    return { style, position, row };
  });
  const height = Math.max(214, rowEnds.length * 104 + 58);
  return {
    height,
    items: placed.map((item) => {
      const top = 12 + item.row * 104;
      return { ...item, top, connectorHeight: Math.max(10, height - top - 104) };
    })
  };
}

function setTimelineZoom(value, anchorClientX = null) {
  const next = Math.max(1, Math.min(6, Math.round(value * 4) / 4));
  if (next === state.timelineZoom) return;
  const viewport = dom.timelineViewport;
  const viewportRect = viewport.getBoundingClientRect();
  const anchorX = anchorClientX === null
    ? viewport.clientWidth / 2
    : Math.max(0, Math.min(viewport.clientWidth, anchorClientX - viewportRect.left));
  const oldTrackStart = dom.timelineAxis.offsetLeft;
  const oldTrackWidth = dom.timelineAxis.clientWidth || 1;
  const anchorRatio = Math.max(0, Math.min(1, (viewport.scrollLeft + anchorX - oldTrackStart) / oldTrackWidth));
  state.timelineZoom = next;
  renderTimeline();
  requestAnimationFrame(() => {
    const newTrackStart = dom.timelineAxis.offsetLeft;
    viewport.scrollLeft = Math.max(0, newTrackStart + anchorRatio * dom.timelineAxis.clientWidth - anchorX);
  });
}

function bindTimelinePan() {
  const viewport = dom.timelineViewport;
  let drag = null;
  let zoomWheelDelta = 0;
  viewport.addEventListener("pointerdown", (event) => {
    if (event.target.closest("button")) return;
    drag = { x: event.clientX, scrollLeft: viewport.scrollLeft };
    viewport.classList.add("is-dragging");
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener("pointermove", (event) => {
    if (!drag) return;
    viewport.scrollLeft = drag.scrollLeft - (event.clientX - drag.x);
  });
  const endDrag = () => {
    drag = null;
    viewport.classList.remove("is-dragging");
  };
  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  viewport.addEventListener("wheel", (event) => {
    if (!event.ctrlKey && !event.metaKey) return;
    event.preventDefault();
    zoomWheelDelta -= event.deltaY;
    if (Math.abs(zoomWheelDelta) < 24) return;
    setTimelineZoom(state.timelineZoom + (zoomWheelDelta > 0 ? 0.25 : -0.25), event.clientX);
    zoomWheelDelta = 0;
  }, { passive: false });

  viewport.addEventListener("dblclick", (event) => {
    if (event.target.closest("button")) return;
    setTimelineZoom(state.timelineZoom + 0.5, event.clientX);
  });

  viewport.addEventListener("keydown", (event) => {
    if (!["+", "=", "-", "_", "0"].includes(event.key)) return;
    event.preventDefault();
    if (event.key === "0") setTimelineZoom(1);
    else setTimelineZoom(state.timelineZoom + (["+", "="].includes(event.key) ? 0.25 : -0.25));
  });
}

function formatTimelineYear(year) {
  if (year < 0) return `前 ${Math.abs(year)}`;
  return String(year);
}

function timelinePosition(year) {
  const segments = [
    { start: -1400, end: 1000, from: 2, to: 18 },
    { start: 1000, end: 1800, from: 18, to: 42 },
    { start: 1800, end: 1900, from: 42, to: 59 },
    { start: 1900, end: 1950, from: 59, to: 73 },
    { start: 1950, end: 2000, from: 73, to: 91 },
    { start: 2000, end: 2025, from: 91, to: 98 }
  ];
  const segment = segments.find((item) => year >= item.start && year <= item.end) || (year < -1400 ? segments[0] : segments[segments.length - 1]);
  const ratio = Math.max(0, Math.min(1, (year - segment.start) / (segment.end - segment.start)));
  return segment.from + ratio * (segment.to - segment.from);
}

function setPromptStyle(id, notify = true) {
  const style = getStyle(id);
  if (!style) return;
  state.selectedPromptStyleId = id;
  state.promptGenes = style.visualGenes.map((gene) => ({ ...gene, active: true }));
  state.promptPaletteIndex = 0;
  dom.promptStyleIndicator.textContent = `${style.nameZh} · ${style.nameEn}`;
  renderPromptSelectors();
  renderPromptControls();
  renderPromptOutput();
  if (notify) showToast(`${style.nameZh}已加入 Prompt 工坊`);
}

function renderPromptControls() {
  const style = getStyle(state.selectedPromptStyleId);
  dom.selectedPromptStyle.innerHTML = `${createVisual(style, "selected-style-visual")}<div><strong>${style.nameZh}</strong><small>${style.nameEn} · ${style.period}</small></div><button class="icon-button" data-change-style aria-label="更换风格" title="更换风格"><i data-lucide="replace"></i></button>`;
  dom.selectedPromptStyle.querySelector("[data-change-style]").addEventListener("click", () => switchView("atlas"));

  const activeGenes = state.promptGenes.filter((gene) => gene.active);
  dom.geneCount.textContent = `${activeGenes.length} 项已启用`;
  dom.promptGenes.innerHTML = activeGenes.length
    ? activeGenes.map((gene) => `<span class="gene-chip">${gene.zh}<button data-remove-gene="${gene.zh}" aria-label="移除${gene.zh}"><i data-lucide="x"></i></button></span>`).join("")
    : `<span class="control-placeholder">风格名称仍会保留，视觉基因已全部关闭</span>`;
  dom.promptGenes.querySelectorAll("[data-remove-gene]").forEach((button) => button.addEventListener("click", () => {
    const gene = state.promptGenes.find((item) => item.zh === button.dataset.removeGene);
    if (gene) gene.active = false;
    renderPromptControls();
    renderPromptOutput();
  }));

  const customColor = state.promptCustomColor || style.palette[0];
  dom.palettePicker.innerHTML = style.palette.map((color, index) => `<button class="palette-swatch ${state.promptPaletteIndex === index ? "is-active" : ""}" style="background:${color}" data-palette-index="${index}" aria-label="选择色彩 ${color}" title="${color}"></button>`).join("")
    + `<label class="custom-color-picker ${state.promptPaletteIndex === -1 ? "is-active" : ""}" title="自定义颜色">
      <input type="color" value="${customColor}" aria-label="自定义颜色" data-custom-color />
      <i data-lucide="pipette" aria-hidden="true"></i>
    </label>`;
  dom.palettePicker.querySelectorAll("[data-palette-index]").forEach((button) => button.addEventListener("click", () => {
    state.promptPaletteIndex = Number(button.dataset.paletteIndex);
    renderPromptControls();
    renderPromptOutput();
  }));
  dom.palettePicker.querySelector("[data-custom-color]").addEventListener("input", (event) => {
    state.promptCustomColor = event.target.value;
    state.promptPaletteIndex = -1;
    dom.palettePicker.querySelectorAll(".palette-swatch").forEach((swatch) => swatch.classList.remove("is-active"));
    dom.palettePicker.querySelector(".custom-color-picker").classList.add("is-active");
    renderPromptOutput();
  });
  refreshIcons();
}

function renderPromptSelectors() {
  const activeCount = Object.values(state.promptControls).filter(Boolean).length;
  dom.controlCount.textContent = `${activeCount} 项已指定`;
  dom.promptControls.innerHTML = PROMPT_CONTROL_GROUPS.map((group) => {
    const value = state.promptControls[group.id] || "";
    const placeholder = "不指定";
    return `<label class="control-field ${value ? "has-value" : ""}"><span>${group.label}</span><span class="select-control"><select data-prompt-control="${group.id}" aria-label="${group.label}">
      <option value="">${placeholder}</option>
      ${group.options.map((option, index) => `<option value="${index}"${value === String(index) ? " selected" : ""}>${option.zh}</option>`).join("")}
    </select><i data-lucide="chevron-down" aria-hidden="true"></i></span></label>`;
  }).join("");
}

function getActivePromptControls() {
  return PROMPT_CONTROL_GROUPS.flatMap((group) => {
    const value = state.promptControls[group.id];
    if (value === undefined || value === "") return [];
    return [{ ...group, option: group.options[Number(value)] }];
  });
}

const CONTENT_PROTECTION_ZH = "保持用户指定的主体、数量、动作、场景、身份与叙事关系；用户明确指定的构图、镜头、画幅与文字内容优先；不新增主体、人物、道具或叙事元素。";
const CONTENT_PROTECTION_EN = "Preserve the user-defined subjects, count, actions, setting, identities, and narrative relationships. User-specified composition, camera, aspect ratio, and exact text take priority. Do not add subjects, props, or story elements.";

function getStylePromptByIntensity(style, language) {
  const prompt = style.aiPrompt?.[language];
  if (!prompt) return language === "zh" ? style.promptZh.join("，") : style.promptEn.join(", ");
  if (state.promptIntensity === "主导") return prompt;

  if (language === "zh") {
    const replacement = state.promptIntensity === "借鉴"
      ? `轻度借鉴${style.nameZh}的视觉语言，仅选取少量关键特征，不让风格压过用户内容。`
      : `以${style.nameZh}作为主要且清晰可识别的视觉风格，同时保持用户内容优先。`;
    return prompt.replace(`以${style.nameZh}作为唯一主导风格。`, replacement);
  }

  const replacement = state.promptIntensity === "借鉴"
    ? `Use a subtle influence from ${style.nameEn}, selecting only a few defining traits without overpowering the user-defined content.`
    : `Use ${style.nameEn} as the clearly recognizable primary visual style while keeping the user-defined content dominant.`;
  return prompt.replace(`Use ${style.nameEn} as the sole dominant visual style.`, replacement);
}

function getReducedGenePrompt(style, activeGenes, language) {
  if (language === "zh") {
    const direction = {
      "借鉴": `轻度借鉴${style.nameZh}的视觉语言`,
      "明显": `以${style.nameZh}作为清晰可识别的主要视觉风格`,
      "主导": `以${style.nameZh}作为唯一主导视觉风格`
    }[state.promptIntensity];
    return `${CONTENT_PROTECTION_ZH}${direction}；仅应用这些已启用的视觉基因：${activeGenes.map((gene) => gene.zh).join("，") || "不额外应用风格视觉基因"}。`;
  }
  const direction = {
    "借鉴": `Use a subtle influence from ${style.nameEn}`,
    "明显": `Use ${style.nameEn} as the clearly recognizable primary visual style`,
    "主导": `Use ${style.nameEn} as the sole dominant visual style`
  }[state.promptIntensity];
  return `${CONTENT_PROTECTION_EN} ${direction}, using only these enabled visual genes: ${activeGenes.map((gene) => gene.en).join(", ") || "no additional style-specific visual genes"}.`;
}

function renderPromptOutput() {
  const style = getStyle(state.selectedPromptStyleId);
  if (!style || !dom.promptSubject) return;
  const subject = dom.promptSubject.value.trim() || "未命名主体";
  const use = dom.promptUse.value;
  const ratio = dom.promptRatio.value;
  const activeGenes = state.promptGenes.filter((gene) => gene.active);
  const activeControls = getActivePromptControls();
  const color = state.promptPaletteIndex === -1 ? state.promptCustomColor : style.palette[state.promptPaletteIndex];
  const hasColorOverride = activeControls.some((control) => control.id === "color");
  const includeAccentColor = !hasColorOverride || state.promptPaletteIndex === -1;
  const hasAllGenes = activeGenes.length === state.promptGenes.length;
  const stylePromptZh = hasAllGenes
    ? getStylePromptByIntensity(style, "zh")
    : getReducedGenePrompt(style, activeGenes, "zh");
  const stylePromptEn = hasAllGenes
    ? getStylePromptByIntensity(style, "en")
    : getReducedGenePrompt(style, activeGenes, "en");

  const zhParts = [
    subject,
    `${use}设计`,
    stylePromptZh,
    ...activeControls.map((control) => control.option.zh),
    ...(includeAccentColor ? [`强调色 ${color}`] : []),
    ratio
  ];
  const enParts = [
    subject,
    useTranslations[use],
    stylePromptEn,
    ...activeControls.map((control) => control.option.en),
    ...(includeAccentColor ? [`accent color ${color}`] : []),
    ratioTranslations[ratio]
  ];

  const outputs = {
    zh: zhParts.join("，"),
    en: enParts.join(", "),
    negative: `避免：${style.aiPrompt?.negative || "与所选风格冲突的构图、配色、材质和时代元素"}，低清晰度，文字乱码，水印，品牌标志`,
    generation: `${enParts.join(", ")}. Negative prompt: ${style.aiPrompt?.negative || "conflicting visual styles"}, low resolution, illegible text, watermarks, brand logos.`
  };
  state.promptOutputs = outputs;
  dom.promptResult.value = outputs[state.promptOutputMode];
  const anatomy = [
    ["主体", "#df3b2e"], ["用途", "#2459d3"], ["视觉基因", "#2f7f62"],
    ...activeControls.map((control) => [control.label, control.color]),
    ...(includeAccentColor ? [[state.promptPaletteIndex === -1 ? "自定义颜色" : "风格色板", color]] : []),
    ["画幅", "#6c6c66"]
  ];
  dom.promptAnatomy.innerHTML = anatomy.map(([name, swatch]) => `<span class="anatomy-token"><i style="background:${swatch}"></i>${name}</span>`).join("");
}

async function copyPrompt() {
  const text = dom.promptResult.value;
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    dom.promptResult.select();
    document.execCommand("copy");
  }
  trackAnalyticsEvent("prompt_copy", state.promptOutputMode);
  showToast("Prompt 已复制");
}

function startImageGeneration() {
  if (dom.generateImageButton.disabled) return;

  dom.imageResult.hidden = false;
  dom.imageResult.setAttribute("aria-busy", "false");
  setImageGenerationState("building");
  trackAnalyticsEvent("image_preview_building", dom.promptRatio.value);
}

function setImageGenerationState(status, message = "") {
  dom.imageStage.dataset.state = status;
  dom.generatedImage.hidden = status !== "success";
  dom.imageStageState.hidden = status === "success";
  dom.downloadImageButton.hidden = status !== "success";

  if (status === "building") {
    dom.imageGenerationStatus.textContent = "建设中";
    dom.imageStateTitle.textContent = "图像生成功能建设中";
    dom.imageStateText.textContent = "我们正在完善风格控制与生成质量，敬请期待。";
    return;
  }

  if (status === "loading") {
    dom.imageGenerationStatus.textContent = "生成中";
    dom.imageStateTitle.textContent = "正在生成图片";
    dom.imageStateText.textContent = "复杂画面可能需要约两分钟";
    return;
  }
  if (status === "success") {
    dom.imageGenerationStatus.textContent = "生成完成";
    return;
  }
  dom.imageGenerationStatus.textContent = "生成失败";
  dom.imageStateTitle.textContent = "未能生成图片";
  dom.imageStateText.textContent = message;
}

function showToast(message) {
  clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add("is-visible");
  toastTimer = setTimeout(() => dom.toast.classList.remove("is-visible"), 1800);
}

function getStyle(id) {
  return STYLE_DATA.find((style) => style.id === id);
}

function getStylePageHref(id) {
  return window.location.protocol === "file:" ? `styles/${id}/index.html` : `styles/${id}/`;
}

function shouldOpenDrawer(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

function normalizeLocalFileLinks(scope) {
  if (window.location.protocol !== "file:") return;
  scope.querySelectorAll('a[href$="/"]').forEach((link) => {
    link.setAttribute("href", `${link.getAttribute("href")}index.html`);
  });
}
