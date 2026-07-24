const state = {
  view: "atlas",
  search: "",
  filters: { type: new Set(), region: new Set(), traits: new Set(), fields: new Set() },
  favoritesOnly: false,
  favorites: new Set(JSON.parse(localStorage.getItem("style-atlas-favorites") || "[]")),
  compare: [],
  selectedPromptStyleId: "constructivism",
  promptGenes: [],
  promptOutputMode: "zh",
  promptIntensity: "明显",
  promptPaletteIndex: 0,
  lastDetailTrigger: null
};

const labels = {
  type: "主类型",
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

document.addEventListener("DOMContentLoaded", init);

function init() {
  cacheDom();
  bindGlobalEvents();
  renderQuickFilters();
  renderFilterGroups();
  renderTimeline();
  setPromptStyle(state.selectedPromptStyleId, false);
  renderAtlas();
  refreshIcons();
}

function cacheDom() {
  [
    "styleSearch", "resultCount", "styleGrid", "emptyState", "quickFilters", "filterGroups",
    "mobileFilterGroups", "activeFilters", "clearFiltersButton", "emptyResetButton",
    "favoritesButton", "favoriteCount", "openCompareButton", "compareCount", "compareDock",
    "compareSummary", "compareNowButton", "clearCompareButton", "compareDialog", "compareContent",
    "closeCompareDialog", "detailLayer", "detailContent", "mobileFilterButton", "mobileFilterSheet",
    "timelineAxis", "timelineLanes", "promptSubject", "promptUse", "promptRatio", "intensityControl",
    "selectedPromptStyle", "promptGenes", "geneCount", "palettePicker", "promptResult",
    "promptAnatomy", "copyPromptButton", "copyPromptMainButton", "resetPromptButton",
    "browseStylesButton", "promptStyleIndicator", "toast"
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
  dom.copyPromptMainButton.addEventListener("click", copyPrompt);
  dom.resetPromptButton.addEventListener("click", () => {
    dom.promptSubject.value = "未来城市音乐节";
    dom.promptUse.value = "海报";
    dom.promptRatio.value = "纵向 2:3";
    state.promptIntensity = "明显";
    state.promptPaletteIndex = 0;
    setPromptStyle("constructivism", false);
    dom.intensityControl.querySelectorAll("button").forEach((item) => item.classList.toggle("is-active", item.dataset.intensity === "明显"));
    showToast("Prompt 已重置");
  });
  dom.browseStylesButton.addEventListener("click", () => switchView("atlas"));

  dom.compareDialog.addEventListener("click", (event) => {
    if (event.target === dom.compareDialog) dom.compareDialog.close();
  });
}

function refreshIcons() {
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
}

function createVisual(style, className = "style-visual") {
  return `<span class="${className} art-${style.art}" role="img" aria-label="${style.nameZh}的原创视觉语言样片"></span>`;
}

function renderQuickFilters() {
  const items = ["几何", "留白", "强对比", "有机", "高饱和", "未来"];
  dom.quickFilters.innerHTML = items.map((item) => `<button class="chip" data-quick-filter="${item}">${item}</button>`).join("");
  dom.quickFilters.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-filter]");
    if (!button) return;
    toggleFilter("traits", button.dataset.quickFilter);
  });
}

function renderFilterGroups() {
  const groupName = { type: "主类型", region: "地域", traits: "视觉特征", fields: "应用领域" };
  const markup = Object.entries(FILTER_GROUPS).map(([group, options]) => {
    return `<section class="filter-group"><h3>${groupName[group]}</h3><div class="filter-options">${options.map((option) => {
      const count = STYLE_DATA.filter((style) => group === "traits" || group === "fields" ? style[group].includes(option) : style[group] === option || (group === "type" && style.type === option)).length;
      return `<label class="filter-option"><input type="checkbox" data-filter-group="${group}" value="${option}" /><span>${option}</span><output>${count}</output></label>`;
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
  document.querySelectorAll("[data-quick-filter]").forEach((button) => {
    button.classList.toggle("is-active", state.filters.traits.has(button.dataset.quickFilter));
  });
}

function hasAnyFilter() {
  return state.search || state.favoritesOnly || Object.values(state.filters).some((set) => set.size);
}

function clearFilters() {
  state.search = "";
  state.favoritesOnly = false;
  Object.values(state.filters).forEach((set) => set.clear());
  dom.styleSearch.value = "";
  dom.favoritesButton.classList.remove("is-active");
  syncFilterControls();
  renderAtlas();
}

function getFilteredStyles() {
  return STYLE_DATA.filter((style) => {
    if (state.favoritesOnly && !state.favorites.has(style.id)) return false;
    if (state.filters.type.size && !state.filters.type.has(style.type)) return false;
    if (state.filters.region.size && !state.filters.region.has(style.region)) return false;
    if (state.filters.traits.size && ![...state.filters.traits].every((trait) => style.traits.includes(trait))) return false;
    if (state.filters.fields.size && ![...state.filters.fields].some((field) => style.fields.includes(field))) return false;
    if (!state.search) return true;
    const haystack = [style.nameZh, style.nameEn, style.type, style.period, style.region, style.summary, style.recognition, ...style.traits, ...style.fields, ...Object.values(style.genes).flat()].join(" ").toLowerCase();
    return haystack.includes(state.search);
  });
}

function renderAtlas() {
  const styles = getFilteredStyles();
  dom.resultCount.textContent = String(styles.length);
  dom.favoriteCount.textContent = String(state.favorites.size);
  dom.compareCount.textContent = String(state.compare.length);
  dom.clearFiltersButton.disabled = !hasAnyFilter();
  renderActiveFilters();

  dom.styleGrid.innerHTML = styles.map((style) => {
    const favorite = state.favorites.has(style.id);
    const compared = state.compare.includes(style.id);
    return `<article class="style-card" data-style-card="${style.id}">
      <button class="style-card-main" data-open-detail="${style.id}" aria-label="查看${style.nameZh}详情">
        ${createVisual(style)}
        <span class="style-meta">
          <span class="style-name-row"><span class="style-card-title">${style.nameZh}</span><span class="style-period">${style.period}</span></span>
          <span class="style-en">${style.nameEn}</span>
          <span class="style-tags"><span>${style.type}</span>${style.traits.slice(0, 3).map((trait) => `<span>${trait}</span>`).join("")}</span>
        </span>
      </button>
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
  if (state.favoritesOnly) items.push({ group: "favorites", value: "只看收藏" });
  Object.entries(state.filters).forEach(([group, set]) => set.forEach((value) => items.push({ group, value })));
  dom.activeFilters.innerHTML = items.length
    ? items.map((item) => `<button class="active-filter" data-remove-filter="${item.group}" data-value="${item.value}">${item.value}<i data-lucide="x"></i></button>`).join("")
    : `<span class="compare-placeholder">全部风格 · 按相关性排序</span>`;
  dom.activeFilters.querySelectorAll("[data-remove-filter]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.removeFilter === "favorites") state.favoritesOnly = false;
      else state.filters[button.dataset.removeFilter].delete(button.dataset.value);
      syncFilterControls();
      renderAtlas();
    });
  });
}

function bindCardEvents() {
  dom.styleGrid.querySelectorAll("[data-open-detail]").forEach((button) => button.addEventListener("click", () => openDetail(button.dataset.openDetail, button)));
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
      ${compareRow("核心构图", a.genes.composition.join("、"), b.genes.composition.join("、"))}
      ${compareRow("造型", a.genes.form.join("、"), b.genes.form.join("、"))}
      ${compareRow("色彩", a.genes.color.join("、"), b.genes.color.join("、"))}
      ${compareRow("字体", a.genes.type.join("、"), b.genes.type.join("、"))}
      ${compareRow("材质", a.genes.texture.join("、"), b.genes.texture.join("、"))}
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
  state.lastDetailTrigger = trigger || document.activeElement;
  renderDetail(style);
  dom.detailLayer.hidden = false;
  document.body.classList.add("has-layer");
  dom.detailLayer.querySelector("[data-close-detail]").focus();
}

function renderDetail(style) {
  const favorite = state.favorites.has(style.id);
  const compared = state.compare.includes(style.id);
  const rows = [
    ["构图", style.genes.composition], ["造型", style.genes.form], ["色彩", style.genes.color],
    ["字体", style.genes.type], ["材质", style.genes.texture]
  ];
  dom.detailContent.innerHTML = `<div class="detail-hero">
    <div class="detail-title">
      <div class="detail-tags"><span class="chip">${style.type}</span><span class="chip">${style.period}</span><span class="chip">${style.region}</span></div>
      <h2 id="detailTitle">${style.nameZh}</h2><div class="detail-en">${style.nameEn}</div>
      <p class="detail-summary">${style.summary}</p>
      <p class="detail-recognition"><strong>一眼识别：</strong>${style.recognition}</p>
      <div class="detail-actions">
        <button class="primary-button" data-use-prompt="${style.id}"><i data-lucide="wand-sparkles"></i>用于 Prompt</button>
        <button class="secondary-button" data-detail-compare="${style.id}"><i data-lucide="columns-2"></i>${compared ? "移出对比" : "加入对比"}</button>
        <button class="icon-button ${favorite ? "is-active" : ""}" data-detail-favorite="${style.id}" aria-label="${favorite ? "取消收藏" : "收藏"}${style.nameZh}" title="${favorite ? "取消收藏" : "收藏"}"><i data-lucide="bookmark"></i></button>
      </div>
    </div>
    ${createVisual(style, "detail-visual")}
  </div>
  <div class="detail-body">
    <section class="detail-section"><h3>视觉基因</h3><table class="gene-table"><tbody>${rows.map(([name, values]) => `<tr><th>${name}</th><td>${values.join(" · ")}</td></tr>`).join("")}</tbody></table></section>
    <section class="detail-section"><h3>历史脉络</h3><div class="lineage-grid"><div><span>来自</span><strong>${style.influencedBy}</strong></div><div><span>影响</span><strong>${style.influenced}</strong></div></div></section>
    <section class="detail-section"><h3>Prompt 预览</h3><div class="detail-prompt">${style.promptZh.join("，")}</div></section>
    <section class="detail-section"><h3>相邻风格</h3><div class="detail-tags">${style.related.map((id) => { const related = getStyle(id); return `<button class="relation-chip" data-related-style="${id}">${related.nameZh}</button>`; }).join("")}</div></section>
  </div>`;
  dom.detailContent.querySelector("[data-use-prompt]").addEventListener("click", () => {
    setPromptStyle(style.id);
    closeDetail();
    switchView("prompt");
  });
  dom.detailContent.querySelector("[data-detail-compare]").addEventListener("click", () => toggleCompare(style.id));
  dom.detailContent.querySelector("[data-detail-favorite]").addEventListener("click", () => toggleFavorite(style.id));
  dom.detailContent.querySelectorAll("[data-related-style]").forEach((button) => button.addEventListener("click", () => renderDetail(getStyle(button.dataset.relatedStyle))));
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
  const years = [1000, 1200, 1400, 1600, 1800, 1900, 1950, 2000, 2025];
  dom.timelineAxis.innerHTML = years.map((year) => `<span class="axis-label" style="left:${timelinePosition(year)}%">${year}</span>`).join("");
  const tracks = ["欧洲艺术与现代主义", "东亚视觉传统", "全球地域传统", "商业与设计视觉", "数字与网络审美"];
  dom.timelineLanes.innerHTML = tracks.map((track) => {
    const items = STYLE_DATA.filter((style) => style.track === track).sort((a, b) => a.year - b.year);
    return `<section class="timeline-lane"><div class="lane-label">${track}</div><div class="lane-track">${items.map((style, index) => {
      const position = timelinePosition(style.year);
      const top = index % 2 === 0 ? 8 : 106;
      return `<span class="timeline-marker" style="left:${position}%" aria-hidden="true"></span><button class="timeline-node" data-timeline-style="${style.id}" style="left:${position}%;--node-top:${top}px">${createVisual(style, "timeline-node-visual")}<strong>${style.nameZh}</strong><small>${style.period}</small></button>`;
    }).join("")}</div></section>`;
  }).join("");
  dom.timelineLanes.querySelectorAll("[data-timeline-style]").forEach((button) => button.addEventListener("click", () => openDetail(button.dataset.timelineStyle, button)));
}

function timelinePosition(year) {
  return Math.max(3, Math.min(97, ((year - TIMELINE_BOUNDS.min) / (TIMELINE_BOUNDS.max - TIMELINE_BOUNDS.min)) * 100));
}

function setPromptStyle(id, notify = true) {
  const style = getStyle(id);
  if (!style) return;
  state.selectedPromptStyleId = id;
  state.promptGenes = style.promptZh.map((zh, index) => ({ zh, en: style.promptEn[index], active: true }));
  state.promptPaletteIndex = 0;
  dom.promptStyleIndicator.textContent = `${style.nameZh} · ${style.nameEn}`;
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
  dom.promptGenes.innerHTML = activeGenes.map((gene) => `<span class="gene-chip">${gene.zh}<button data-remove-gene="${gene.zh}" aria-label="移除${gene.zh}"><i data-lucide="x"></i></button></span>`).join("");
  dom.promptGenes.querySelectorAll("[data-remove-gene]").forEach((button) => button.addEventListener("click", () => {
    const gene = state.promptGenes.find((item) => item.zh === button.dataset.removeGene);
    if (gene) gene.active = false;
    renderPromptControls();
    renderPromptOutput();
  }));

  dom.palettePicker.innerHTML = style.palette.map((color, index) => `<button class="palette-swatch ${state.promptPaletteIndex === index ? "is-active" : ""}" style="background:${color}" data-palette-index="${index}" aria-label="选择色彩 ${color}" title="${color}"></button>`).join("");
  dom.palettePicker.querySelectorAll("[data-palette-index]").forEach((button) => button.addEventListener("click", () => {
    state.promptPaletteIndex = Number(button.dataset.paletteIndex);
    renderPromptControls();
    renderPromptOutput();
  }));
  refreshIcons();
}

function renderPromptOutput() {
  const style = getStyle(state.selectedPromptStyleId);
  if (!style || !dom.promptSubject) return;
  const subject = dom.promptSubject.value.trim() || "未命名主体";
  const use = dom.promptUse.value;
  const ratio = dom.promptRatio.value;
  const intensity = intensityTranslations[state.promptIntensity];
  const activeGenes = state.promptGenes.filter((gene) => gene.active);
  const color = style.palette[state.promptPaletteIndex];

  const outputs = {
    zh: `${subject}，${use}设计，${intensity.zh}${style.nameZh}视觉语言，${activeGenes.map((gene) => gene.zh).join("，")}，强调色 ${color}，${ratio}，清晰视觉层级，精致完成度`,
    en: `${subject}, ${useTranslations[use]}, ${intensity.en} ${style.nameEn} visual language, ${activeGenes.map((gene) => gene.en).join(", ")}, accent color ${color}, ${ratioTranslations[ratio]}, clear visual hierarchy, refined finish`,
    negative: "避免：无关装饰、过多色彩、随机字体、低清晰度、文字乱码、水印、品牌标志、与所选风格冲突的材质和时代元素"
  };
  dom.promptResult.value = outputs[state.promptOutputMode];
  const anatomy = [
    ["主体", "#df3b2e"], ["用途", "#2459d3"], ["风格", "#2f7f62"], ["视觉基因", "#8e5aaa"], ["色彩", color], ["画幅", "#6c6c66"]
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
  showToast("Prompt 已复制");
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
