(()=>{
"use strict";
const {beginPendingButtons}=(()=>{
function beginPendingButtons(buttons, label = "送交中…") {
  const snapshots = [...buttons]
    .filter(Boolean)
    .map((button) => ({
      button,
      disabled: button.disabled,
      innerHTML: button.innerHTML,
    }));

  for (const { button } of snapshots) {
    button.disabled = true;
    button.textContent = label;
  }

  return function restorePendingButtons() {
    for (const { button, disabled, innerHTML } of snapshots) {
      if (button.isConnected === false) continue;
      button.innerHTML = innerHTML;
      button.disabled = disabled;
    }
  };
}

return {beginPendingButtons};})();
const {boundedSelectionRect,rectanglesIntersect}=(()=>{
function boundedSelectionRect(start, end, bounds) {
  const startX = Math.max(bounds.left, Math.min(bounds.right, start.x));
  const startY = Math.max(bounds.top, Math.min(bounds.bottom, start.y));
  const endX = Math.max(bounds.left, Math.min(bounds.right, end.x));
  const endY = Math.max(bounds.top, Math.min(bounds.bottom, end.y));
  const left = Math.min(startX, endX);
  const top = Math.min(startY, endY);
  const right = Math.max(startX, endX);
  const bottom = Math.max(startY, endY);
  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

function rectanglesIntersect(first, second) {
  return (
    first.left < second.right &&
    first.right > second.left &&
    first.top < second.bottom &&
    first.bottom > second.top
  );
}

return {boundedSelectionRect,rectanglesIntersect};})();
const {safeHexColor,normalizeColorProportion,formatSwatchTooltip,renderSwatchColor}=(()=>{
const HEX_COLOR_PATTERN =
  /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;

function safeHexColor(value) {
  const color = String(value ?? "").trim();
  return HEX_COLOR_PATTERN.test(color) ? color : "#d7d7d2";
}

function normalizeColorProportion(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  if (!Number.isFinite(number)) return null;
  const normalized = number > 1 ? number / 100 : number;
  return Math.max(0, Math.min(1, normalized));
}

function formatSwatchTooltip(hex, proportion) {
  const color = safeHexColor(hex).toUpperCase();
  const normalized = normalizeColorProportion(proportion);
  if (normalized === null) return `${color} · 应用比例未提供`;
  const percentage = Math.round(normalized * 1000) / 10;
  return `${color} · 应用比例 ${percentage}%`;
}

function renderSwatchColor(value) {
  const color = safeHexColor(value);
  return `<svg class="swatch-color" viewBox="0 0 100 44" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect width="100" height="44" fill="${color}"></rect></svg>`;
}

return {safeHexColor,normalizeColorProportion,formatSwatchTooltip,renderSwatchColor};})();
const safeColor=safeHexColor;

const QUEUE_WAIT_MESSAGES = Object.freeze([
  "正在全力加载，建议趁现在去接杯水，顺便观察一下摸鱼路线。",
  "进度条在走了，你的精神可以先下线 5 秒钟。",
  "只要我不停敲键盘，系统就以为我还在拼命工作。",
  "带薪发呆中……别催，催就是CPU正在努力散热。",
  "稍等片刻，这几秒钟不用回消息，是正当带薪假。",
  "页面加载中，正好伸个懒腰，脊椎已经提出抗议了。",
  "正在假装非常忙碌，以便应对突然路过的人。",
  "别慌，只要我转得够快，工作就追不上我。",
  "正在对齐颗粒度……没对齐，正在重新磨皮。",
  "努力加载中，绝不轻易给进度条画饼。",
  "正在为您生成解决问题的假象，请稍候。",
  "周报素材正在整理，先从“深入探索底层逻辑”开始编。",
  "如果这行加载卡住了，一定是需求变更的风水问题。",
  "会议可以没有结果，但加载必须给个进度。",
  "正在深呼吸，试图平复看到第 8 版修改意见时的心率。",
  "生活没有延期，但方案可以再改改。",
  "正在求助代码玄学，给服务器上三炷香。",
  "只要能跑起来，就假装看不见那些奇怪的告警。",
  "正在努力找 Bug，找到了就说是“特定场景下的交互特性”。",
  "图层对齐中，差这 1 个像素我的强迫症绝不答应。",
  "正在偷偷保存，防止软件闪退带走我一下午的心血。",
  "正在努力渲染，风扇已经开始起飞了。",
  "没卡死，真的没卡死，只是思路需要理一下。",
  "正在合并冲突，祈祷世界和平没有分支分歧。",
  "距离午饭时间越来越近，比工作进度走得更快的是胃酸。",
  "正在思考今天中午吃什么，这才是今日最高优先级任务。",
  "加载完成度 +1，距离下班自由度 +0.001。",
  "现在的每一次点击，都是为了下班时跑得更快。",
  "屏幕在发光，而我的灵魂已经提前打卡下班了。",
  "正在加速冲刺，工位多坐一秒都是对下班的背叛。",
  "咖啡因正在起效，电量从 2% 艰难回升至 5%。",
  "别急，最难搞的往往不是这个加载，而是待会儿吃啥。",
]);

const state = {
  loading: true,
  error: null,
  assets: [],
  resultTotal: 0,
  libraryTotal: 0,
  stats: {},
  jobs: [],
  settings: {},
  analysisRules: {
    items: [],
    selectedId: "",
    source: {
      managed: true,
      available: false,
      officialAvailable: false,
      analysisAvailable: false,
      unavailableReason: "",
      lastCheckedAt: "",
      lastError: "",
    },
    history: [],
  },
  analysisContracts: { version: "2", supportedFieldTypes: [] },
  provider: null,
  agents: [],
  agentScanResults: null,
  agentScanPerformed: false,
  collections: [],
  tags: [],
  trash: [],
  skills: [],
  mcps: [],
  paths: {},
  view: "library",
  activeCollectionId: null,
  editingCollectionId: null,
  collectionMenuId: null,
  selectedId: null,
  selectedIds: new Set(),
  lastAnchorId: null,
  query: "",
  discipline: "",
  status: "",
  sort: "newest",
  queueExpanded: false,
  queueWaitMessageIndex: -1,
  queueWaitMessageTimer: null,
  pollTimer: null,
  syntheticAssets: [],
  inspectorReturnFocus: null,
  inspectorReturnAssetId: null,
  dragDepth: 0,
  marquee: null,
  suppressWorkspaceClick: false,
  skillFavoritesOnly: false,
  skillInstallMode: "repository",
  skillZipFile: null,
  mcpSource: "all",
  editingMcpId: null,
  editingAgentId: null,
  editingAnalysisRuleId: null,
  analysisRulesAutoUpdateStarted: false,
  analysisRulesAutoUpdateTimer: null,
  appUpdate: { configured: false, currentVersion: "", updateAvailable: false },
  license: { edition: "free", unlimited: false, usage: 0, limit: 20, remaining: 20 },
  agentTestResults: {},
};

const elements = {
  app: document.querySelector("#app"),
  workspace: document.querySelector("#workspace"),
  gallery: document.querySelector("#gallery"),
  dropImportOverlay: document.querySelector("#drop-import-overlay"),
  marqueeSelection: document.querySelector("#marquee-selection"),
  loadingState: document.querySelector("#loading-state"),
  errorState: document.querySelector("#error-state"),
  errorMessage: document.querySelector("#error-message"),
  setupNotice: document.querySelector("#setup-notice"),
  setupMessage: document.querySelector("#setup-message"),
  analysisRuleNotice: document.querySelector("#analysis-rule-notice"),
  analysisRuleNoticeMessage: document.querySelector("#analysis-rule-notice-message"),
  retryAnalysisRules: document.querySelector("#retry-analysis-rules"),
  inspector: document.querySelector("#inspector"),
  inspectorEmpty: document.querySelector("#inspector-empty"),
  inspectorContent: document.querySelector("#inspector-content"),
  resultSummary: document.querySelector("#result-summary"),
  viewTitle: document.querySelector("#view-title"),
  searchForm: document.querySelector("#search-form"),
  searchInput: document.querySelector("#search-input"),
  disciplineFilter: document.querySelector("#discipline-filter"),
  statusFilter: document.querySelector("#status-filter"),
  sortSelect: document.querySelector("#sort-select"),
  clearFiltersButton: document.querySelector("#clear-filters-button"),
  openLibraryFolderButton: document.querySelector("#open-library-folder-button"),
  importButton: document.querySelector("#import-button"),
  fileInput: document.querySelector("#file-input"),
  scanButton: document.querySelector("#scan-button"),
  recognizeButton: document.querySelector("#recognize-button"),
  analysisRuleSelect: document.querySelector("#analysis-rule-select"),
  retryLoadButton: document.querySelector("#retry-load-button"),
  primaryNav: document.querySelector("#primary-nav"),
  collectionNav: document.querySelector("#collection-nav"),
  newCollectionButton: document.querySelector("#new-collection-button"),
  collectionDialog: document.querySelector("#collection-dialog"),
  collectionForm: document.querySelector("#collection-form"),
  collectionName: document.querySelector("#collection-name"),
  collectionDialogTitle: document.querySelector("#collection-dialog-title"),
  collectionSubmitButton: document.querySelector("#collection-submit-button"),
  confirmDialog: document.querySelector("#confirm-dialog"),
  confirmDialogTitle: document.querySelector("#confirm-dialog-title"),
  confirmDialogMessage: document.querySelector("#confirm-dialog-message"),
  confirmDialogSubmit: document.querySelector("#confirm-dialog-submit"),
  settingsDialog: document.querySelector("#settings-dialog"),
  settingsForm: document.querySelector("#settings-form"),
  analysisDialog: document.querySelector("#analysis-dialog"),
  analysisForm: document.querySelector("#analysis-form"),
  analysisV1Editor: document.querySelector("#analysis-v1-editor"),
  analysisV2Editor: document.querySelector("#analysis-v2-editor"),
  analysisPaletteEditor: document.querySelector("#analysis-palette-editor"),
  analysisAddColorButton: document.querySelector("#analysis-add-color-button"),
  settingInboxPath: document.querySelector("#setting-inbox-path"),
  agentProfileList: document.querySelector("#agent-profile-list"),
  agentScanResults: document.querySelector("#agent-scan-results"),
  scanAgentsButton: document.querySelector("#scan-agents-button"),
  addAgentButton: document.querySelector("#add-agent-button"),
  analysisRuleList: document.querySelector("#analysis-rule-list"),
  addAnalysisRuleButton: document.querySelector("#add-analysis-rule-button"),
  syncAnalysisRules: document.querySelector("#sync-analysis-rules"),
  analysisRuleSourceStatus: document.querySelector("#analysis-rule-source-status"),
  appUpdateStatus: document.querySelector("#app-update-status"),
  checkAppUpdateButton: document.querySelector("#check-app-update-button"),
  downloadAppUpdate: document.querySelector("#download-app-update"),
  licenseTitle: document.querySelector("#license-title"),
  licenseStatus: document.querySelector("#license-status"),
  licenseBadge: document.querySelector("#license-badge"),
  licenseUsage: document.querySelector("#license-usage"),
  licenseKeyInput: document.querySelector("#license-key-input"),
  activateLicenseButton: document.querySelector("#activate-license-button"),
  licenseMessage: document.querySelector("#license-message"),
  analysisRuleDialog: document.querySelector("#analysis-rule-dialog"),
  analysisRuleDialogTitle: document.querySelector("#analysis-rule-dialog-title"),
  analysisRuleForm: document.querySelector("#analysis-rule-form"),
  agentDialog: document.querySelector("#agent-dialog"),
  agentDialogTitle: document.querySelector("#agent-dialog-title"),
  agentForm: document.querySelector("#agent-form"),
  agentFormType: document.querySelector("#agent-form-type"),
  agentCliFields: document.querySelector("#agent-cli-fields"),
  agentApiFields: document.querySelector("#agent-api-fields"),
  agentAuthMode: document.querySelector("#agent-auth-mode"),
  agentApiKeyField: document.querySelector("#agent-api-key-field"),
  codexReadiness: document.querySelector("#codex-readiness"),
  codexExecutionMode: document.querySelector("#codex-execution-mode"),
  providerLedger: document.querySelector("#provider-ledger"),
  settingsStatusDot: document.querySelector("#settings-status-dot"),
  skillInstallDialog: document.querySelector("#skill-install-dialog"),
  skillInstallForm: document.querySelector("#skill-install-form"),
  skillRepositoryFields: document.querySelector("#skill-repository-fields"),
  skillZipFields: document.querySelector("#skill-zip-fields"),
  skillZipInput: document.querySelector("#skill-zip-input"),
  skillZipButton: document.querySelector("#skill-zip-button"),
  skillZipName: document.querySelector("#skill-zip-name"),
  mcpDialog: document.querySelector("#mcp-dialog"),
  mcpDialogTitle: document.querySelector("#mcp-dialog-title"),
  mcpForm: document.querySelector("#mcp-form"),
  filterStrip: document.querySelector(".filter-strip"),
  countLibrary: document.querySelector("#count-library"),
  countInbox: document.querySelector("#count-inbox"),
  countTags: document.querySelector("#count-tags"),
  countSkills: document.querySelector("#count-skills"),
  countMcps: document.querySelector("#count-mcps"),
  countTrash: document.querySelector("#count-trash"),
  batchBar: document.querySelector("#batch-bar"),
  batchCount: document.querySelector("#batch-count"),
  batchCollectionSelect: document.querySelector("#batch-collection-select"),
  batchAddCollectionButton: document.querySelector("#batch-add-collection-button"),
  batchRemoveCollectionButton: document.querySelector("#batch-remove-collection-button"),
  batchDeleteButton: document.querySelector("#batch-delete-button"),
  clearSelectionButton: document.querySelector("#clear-selection-button"),
  queueBar: document.querySelector("#queue-bar"),
  queueToggle: document.querySelector("#queue-toggle"),
  queueTrack: document.querySelector("#queue-track"),
  queueActiveCount: document.querySelector("#queue-active-count"),
  queueSummaryText: document.querySelector("#queue-summary-text"),
  queueWaitMessage: document.querySelector("#queue-wait-message"),
  retryNeedsSetupButton: document.querySelector("#retry-needs-setup-button"),
  liveRegion: document.querySelector("#live-region"),
};

const STATUS_LABELS = {
  discovered: "未分析",
  imported: "未分析",
  hashing: "导入中",
  queued: "排队中",
  pending: "未分析",
  running: "分析中",
  processing: "分析中",
  analyzing: "分析中",
  ready: "已完成",
  complete: "已完成",
  completed: "已完成",
  cancelled: "已取消",
  needs_review: "待确认",
  needs_setup: "需设置 Agent",
  failed: "分析失败",
  missing: "原图缺失",
  stale_analysis: "需重新分析",
  duplicate: "重复图片",
  synthetic: "合成示意",
};

const AGENT_LABELS = {
  codex: "Codex",
  claude: "Claude Code",
  workbuddy: "WorkBuddy",
};

const AGENT_LOGOS = {
  codex: "agent-logos/openai.svg",
  claude: "agent-logos/claude.svg",
  workbuddy: "agent-logos/workbuddy.svg",
};

function agentLogoMarkup(id) {
  return `<img class="agent-logo ${id === "codex" ? "agent-logo--codex" : ""}" src="${AGENT_LOGOS[id]}" alt="" />`;
}

const MCP_HEALTH_LABELS = {
  connected: "正常",
  auth_required: "需认证",
  unreachable: "不可达",
  timeout: "超时",
  invalid_response: "响应异常",
  disabled: "已停用",
};

const DNA_LABELS = {
  discipline: "领域",
  category: "类型",
  artifact: "产物",
  surface: "界面",
  style: "风格",
  lineage: "设计谱系",
  composition: "构图",
  layout: "版面",
  grid: "网格",
  density: "密度",
  whitespace: "留白",
  rhythm: "节奏",
  hierarchy: "层级",
  typography: "字体",
  color: "色彩",
  imagery: "图片",
  material: "材质",
  mood: "情绪",
  era: "年代",
  interaction: "交互",
};

function escapeHTML(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function safeMediaUrl(value) {
  const url = String(value ?? "").trim();
  if (
    url.startsWith("/") ||
    url.startsWith("data:image/") ||
    url.startsWith("blob:") ||
    url.startsWith("http://127.0.0.1") ||
    url.startsWith("http://localhost")
  ) {
    return url;
  }
  return "";
}

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  const trimmed = value.trim();
  if (!trimmed || (!trimmed.startsWith("{") && !trimmed.startsWith("["))) {
    return value;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function asObject(value) {
  const parsed = parseMaybeJson(value);
  return parsed && typeof parsed === "object" && !Array.isArray(parsed)
    ? parsed
    : {};
}

function asArray(value) {
  const parsed = parseMaybeJson(value);
  if (Array.isArray(parsed)) return parsed;
  if (parsed === undefined || parsed === null || parsed === "") return [];
  return [parsed];
}

function listFrom(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function finiteNumber(...values) {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const number = Number(value);
    if (Number.isFinite(number)) return number;
  }
  return null;
}

function stripExtension(name) {
  return String(name || "").replace(/\.[^.]+$/, "");
}

function fileNameFromPath(value) {
  const parts = String(value || "").split(/[\\/]/);
  return parts.at(-1) || "";
}

function normalizeAsset(raw) {
  const asset = asObject(raw);
  const relativePath =
    asset.relativePath || asset.relative_path || asset.path || asset.filePath || "";
  const fileName =
    asset.fileName ||
    asset.filename ||
    asset.originalName ||
    fileNameFromPath(relativePath) ||
    `asset-${asset.id || ""}`;
  const width = finiteNumber(asset.width, asset.pixelWidth, asset.dimensions?.width);
  const height = finiteNumber(
    asset.height,
    asset.pixelHeight,
    asset.dimensions?.height,
  );
  const fileStatus = String(
    asset.fileStatus || asset.file_status || "available",
  );
  const status =
    fileStatus === "missing"
      ? "missing"
      : asset.analysisStatus ||
        asset.analysis_state ||
        asset.status ||
        asset.jobStatus ||
        (asset.analysis || asset.latestAnalysis ? "ready" : "discovered");

  return {
    ...asset,
    id: String(asset.id ?? asset.assetId ?? relativePath ?? ""),
    title: String(asset.title || stripExtension(fileName) || "未命名图片"),
    fileName,
    relativePath,
    mediaUrl: safeMediaUrl(asset.mediaUrl || asset.url || asset.thumbnailUrl),
    width,
    height,
    mimeType: asset.mimeType || asset.type || "",
    fileSize: finiteNumber(asset.fileSize, asset.size, asset.bytes),
    fileStatus,
    status: String(status || "discovered"),
    createdAt:
      asset.createdAt ||
      asset.created_at ||
      asset.importedAt ||
      asset.addedAt ||
      "",
    sourceUrl: asset.sourceUrl || asset.source_url || "",
    rightsNote: asset.rightsNote || asset.rights_note || "",
    notes: asset.notes || "",
    discipline: String(asset.discipline || ""),
    favorite: Boolean(asset.favorite),
    collectionIds: asArray(
      asset.collectionIds || asset.collection_ids || asset.collections,
    ).map((item) => String(item?.id ?? item)),
    hash: asset.sha256 || asset.hash || "",
    synthetic: Boolean(asset.synthetic),
  };
}

function normalizeCollection(raw) {
  const collection = asObject(raw);
  return {
    ...collection,
    id: String(collection.id ?? collection.collectionId ?? ""),
    name: String(collection.name || collection.title || "未命名收藏集"),
    itemCount:
      finiteNumber(
        collection.itemCount,
        collection.item_count,
        collection.count,
        collection.total,
      ) ?? asArray(collection.items).length,
  };
}

function normalizeJob(raw) {
  const job = asObject(raw);
  return {
    ...job,
    id: String(job.id ?? job.jobId ?? ""),
    assetId: String(job.assetId ?? job.asset_id ?? ""),
    status: String(job.state || job.status || "queued"),
    stage: String(job.stage || job.step || ""),
    provider: String(job.provider || "codex"),
    ruleId: String(job.ruleId || job.rule_id || ""),
    ruleVersion: String(job.ruleVersion || job.rule_version || "1.0.0"),
    attempts: finiteNumber(job.attempts) ?? 0,
    progress: finiteNumber(job.progress, job.percent, job.percentage),
    error: String(
      job.error || job.errorMessage || job.lastError || job.last_error || job.message || "",
    ),
    createdAt: job.createdAt || job.created_at || "",
    updatedAt: job.updatedAt || job.updated_at || "",
  };
}

function analysisRecord(asset) {
  const latest = asObject(
    asset.currentAnalysis ||
      asset.current_analysis ||
      asset.latestAnalysis ||
      asset.latest_analysis ||
      asset.analysisRecord,
  );
  let analysis =
    asset.analysis ??
    asset.analysisData ??
    asset.analysis_data ??
    latest.analysis ??
    latest.data ??
    {};
  analysis = parseMaybeJson(analysis);
  if (asObject(analysis).analysis) analysis = asObject(analysis).analysis;
  return {
    record: latest,
    data: asObject(analysis),
  };
}

function normalizePalette(value) {
  return asArray(value)
    .map((item) => {
      if (typeof item === "string") {
        return { hex: safeColor(item).toUpperCase(), name: "", proportion: null };
      }
      const object = asObject(item);
      return {
        hex: safeColor(object.hex || object.value || object.color).toUpperCase(),
        name: String(object.name || object.role || ""),
        proportion: normalizeColorProportion(
          object.proportion ?? object.ratio ?? object.percentage,
        ),
      };
    })
    .slice(0, 8);
}

function readableValue(value) {
  if (Array.isArray(value)) {
    return value.map((item) => readableValue(item)).filter(Boolean).join("、");
  }
  if (value && typeof value === "object") {
    return Object.values(value)
      .map((item) => readableValue(item))
      .filter(Boolean)
      .join("、");
  }
  if (typeof value === "boolean") return value ? "是" : "否";
  return String(value ?? "").trim();
}

function normalizedAnalysis(asset) {
  const { record, data } = analysisRecord(asset);
  const isV2 = data.schemaVersion === "style-atlas-analysis-v2";
  const modules = isV2 ? asObject(data.modules) : {};
  const coreVisualDna = asObject(
    data.visualDna ||
      data.visualDNA ||
      data.visual_dna ||
      data.classification ||
      data.styleProfile,
  );
  const visualDna = isV2 ? {} : {
    discipline: data.designDomains || data.design_domains,
    artifact: data.artifactTypes || data.artifact_types,
    ...coreVisualDna,
    typography: data.typography,
    color: data.color
      ? [
          data.color.mode,
          data.color.temperature,
          data.color.saturation,
          data.color.contrast,
        ]
      : undefined,
    imagery: data.imagery,
    material: data.materials,
    interaction: data.interactionSignals || data.interaction_signals,
  };
  const prompts = asObject(
    data.promptKit || data.prompt_kit || data.prompts || data.prompt,
  );
  const description = readableValue(
    (isV2 ? data.summary : data.detailedDescription) ||
      data.summary ||
      data.detailed_description ||
      data.description ||
      data.summary ||
      data.visualDescription ||
      data.visual_description ||
      data.caption,
  );
  const palette = normalizePalette(
    (isV2 ? [] : data.palette ||
      data.colors ||
      data.colorPalette ||
      data.color_palette ||
      data.color?.palette ||
      visualDna.palette),
  );
  const whyItWorks = isV2 ? [] : asArray(
    data.whyItWorks ||
      data.why_it_works ||
      data.strengths ||
      data.designRationale,
  )
    .map(readableValue)
    .filter(Boolean);
  const recipe = isV2 ? [] : asArray(
    data.implementationRecipe ||
      data.implementation_recipe ||
      data.recipe ||
      data.buildNotes,
  )
    .map(readableValue)
    .filter(Boolean);

  const visualPrompt = readableValue(
    prompts.imageGeneration ||
      prompts.image_generation ||
      prompts.visual ||
      prompts.visualPrompt ||
      prompts.visual_prompt ||
      prompts.image ||
      prompts.imagePrompt ||
      data.visualPrompt ||
      data.imagePrompt,
  );
  const implementationPrompt = readableValue(
    prompts.uiImplementation ||
      prompts.ui_implementation ||
      prompts.implementation ||
      prompts.implementationPrompt ||
      prompts.implementation_prompt ||
      prompts.ui ||
      data.implementationPrompt ||
      data.uiPrompt,
  );
  const designTokenPrompt = readableValue(
    prompts.designTokens ||
      prompts.design_tokens ||
      prompts.tokens ||
      data.designTokenPrompt,
  );
  const negativePrompt = readableValue(
    prompts.negative ||
      prompts.negativePrompt ||
      prompts.negative_prompt ||
      data.negativePrompt,
  );

  return {
    data,
    isV2,
    modules,
    visualDna,
    description,
    palette,
    whyItWorks,
    recipe,
    prompts: {
      visual: visualPrompt,
      implementation: implementationPrompt,
      tokens: designTokenPrompt,
      negative: negativePrompt,
    },
    provider:
      record.provider ||
      asset.analysisProvider ||
      asset.analysis_provider ||
      data.provider ||
      "",
    model:
      record.model || asset.analysisModel || asset.analysis_model || data.model || "",
    ruleId:
      record.ruleId || record.rule_id || data.ruleId || data.rule_id || data.rule?.id || "",
    ruleVersion:
      record.ruleVersion ||
      record.rule_version ||
      data.ruleVersion ||
      data.rule_version ||
      "1.0.0",
    ruleSpec: Object.keys(asObject(asObject(record.raw).analysisRule)).length
      ? asObject(asObject(record.raw).analysisRule)
      : analysisRuleById(record.ruleId || record.rule_id || data.rule?.id || ""),
    analyzedAt:
      record.createdAt ||
      record.created_at ||
      asset.analyzedAt ||
      asset.analyzed_at ||
      "",
    confidence: finiteNumber(
      data.confidence,
      record.confidence,
      asset.analysisConfidence,
    ),
  };
}

function analysisListText(value) {
  return asArray(value).map(readableValue).filter(Boolean).join("\n");
}

function setAnalysisField(form, name, value) {
  const field = form.elements.namedItem(name);
  if (field) field.value = String(value ?? "");
}

function addAnalysisPaletteRow(swatch = {}) {
  if (elements.analysisPaletteEditor.children.length >= 8) {
    notify("色板最多保留 8 个颜色。", "error");
    return;
  }
  const hex = safeColor(swatch.hex || "#8D8D8D");
  const row = document.createElement("div");
  row.className = "analysis-color-row";
  row.innerHTML = `
    <input class="analysis-color-picker" type="color" value="${escapeHTML(hex)}" aria-label="选择颜色" />
    <input class="analysis-color-hex" type="text" value="${escapeHTML(hex.toUpperCase())}" maxlength="7" pattern="#[0-9A-Fa-f]{6}" aria-label="HEX 色值" />
    <input class="analysis-color-role" type="text" value="${escapeHTML(swatch.role || swatch.name || "颜色")}" maxlength="120" aria-label="颜色用途" />
    <label class="analysis-color-proportion"><span>占比</span><input type="number" min="0" max="100" step="1" value="${Math.round((finiteNumber(swatch.proportion) ?? 0.1) * 100)}" aria-label="颜色占比百分比" /></label>
    <button class="icon-button" type="button" data-remove-analysis-color aria-label="删除颜色" title="删除颜色">
      <svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>
    </button>`;
  elements.analysisPaletteEditor.append(row);
}

function openAnalysisEditor(asset) {
  const { data } = analysisRecord(asset);
  if (!Object.keys(data).length) return;
  const form = elements.analysisForm;
  form.dataset.assetId = asset.id;
  if (data.schemaVersion === "style-atlas-analysis-v2") {
    openV2AnalysisEditor(data, normalizedAnalysis(asset).ruleSpec);
    showDialog(elements.analysisDialog);
    requestAnimationFrame(() => elements.analysisV2Editor.querySelector("textarea, input")?.focus());
    return;
  }
  elements.analysisV1Editor.hidden = false;
  elements.analysisV2Editor.hidden = true;
  setAnalysisField(form, "summary", data.summary);
  setAnalysisField(form, "detailedDescription", data.detailedDescription || data.summary);
  setAnalysisField(form, "designDomains", analysisListText(data.designDomains));
  setAnalysisField(form, "artifactTypes", analysisListText(data.artifactTypes));
  for (const key of [
    "lineage",
    "composition",
    "grid",
    "hierarchy",
    "density",
    "whitespace",
    "rhythm",
  ]) {
    setAnalysisField(form, `visualDNA.${key}`, data.visualDNA?.[key]);
  }
  for (const key of ["category", "scale", "weight", "tracking", "case", "notes"]) {
    setAnalysisField(form, `typography.${key}`, data.typography?.[key]);
  }
  for (const key of ["mode", "temperature", "saturation", "contrast", "notes"]) {
    setAnalysisField(form, `color.${key}`, data.color?.[key]);
  }
  setAnalysisField(form, "imagery.types", analysisListText(data.imagery?.types));
  for (const key of ["treatment", "cropping", "notes"]) {
    setAnalysisField(form, `imagery.${key}`, data.imagery?.[key]);
  }
  for (const key of ["materials", "components", "interactionSignals", "avoid", "tags"]) {
    setAnalysisField(form, key, analysisListText(data[key]));
  }
  setAnalysisField(form, "whyItWorks", analysisListText(data.whyItWorks));
  setAnalysisField(
    form,
    "implementationRecipe",
    analysisListText(data.implementationRecipe),
  );
  for (const key of [
    "imageGeneration",
    "uiImplementation",
    "designTokens",
    "negative",
  ]) {
    setAnalysisField(form, `prompts.${key}`, data.prompts?.[key]);
  }
  elements.analysisPaletteEditor.replaceChildren();
  asArray(data.color?.palette).forEach(addAnalysisPaletteRow);
  if (!elements.analysisPaletteEditor.children.length) addAnalysisPaletteRow();
  showDialog(elements.analysisDialog);
  requestAnimationFrame(() => {
    const summary = form.elements.namedItem("summary");
    summary?.focus();
    summary?.setSelectionRange?.(0, 0);
    if (summary) summary.scrollTop = 0;
  });
}

function v2EditorValue(value, field) {
  if (field.type === "palette") {
    return asArray(value).map((item) => {
      const swatch = asObject(item);
      return `${safeColor(swatch.hex)} | ${swatch.role || "颜色"} | ${Math.round((finiteNumber(swatch.proportion) ?? 0) * 100)}`;
    }).join("\n");
  }
  if (Array.isArray(value)) {
    return field.itemType === "object"
      ? JSON.stringify(value, null, 2)
      : value.map(readableValue).filter(Boolean).join("\n");
  }
  return readableValue(value);
}

function openV2AnalysisEditor(data, frozenRule = null) {
  elements.analysisV1Editor.hidden = true;
  elements.analysisV2Editor.hidden = false;
  const rule = frozenRule || analysisRuleById(data.rule?.id);
  const contract = asObject(rule?.contract);
  const allowed = [...new Set([
    ...asArray(contract.requiredModules),
    ...asArray(contract.optionalModules),
    ...Object.keys(asObject(data.modules)),
  ])];
  const modules = asObject(data.modules);
  const rootFields = [
    ["summary", "简要摘要", data.summary || ""],
    ["designDomains", "设计领域", asArray(data.designDomains).join("\n")],
    ["artifactTypes", "产物类型", asArray(data.artifactTypes).join("\n")],
    ["tags", "AI 标签", asArray(data.tags).join("\n")],
    ["uncertainties", "不确定项", asArray(data.uncertainties).join("\n")],
  ];
  const moduleMarkup = allowed.map((moduleId) => {
    const module = asObject(modules[moduleId]);
    const definition = moduleDefinition(moduleId, rule);
    const fields = asObject(definition.fields);
    const fieldMarkup = Object.entries(fields).map(([key, field]) => {
      const name = `v2.module.${moduleId}.${key}`;
      const value = v2EditorValue(asObject(module.data)[key], field);
      let control = `<textarea name="${escapeHTML(name)}" data-v2-field-type="${escapeHTML(field.type || "string")}" placeholder="${field.type === "palette" ? "每行：#HEX | 用途 | 百分比" : field.type === "array" ? "每行一项" : "没有可靠证据时留空"}">${escapeHTML(value)}</textarea>`;
      if (field.type === "number") {
        control = `<input name="${escapeHTML(name)}" data-v2-field-type="number" type="number" min="${escapeHTML(field.minimum ?? 0)}" max="${escapeHTML(field.maximum ?? 100)}" value="${escapeHTML(value)}" />`;
      } else if (field.type === "enum") {
        control = `<select name="${escapeHTML(name)}" data-v2-field-type="enum"><option value="">没有可靠证据时留空</option>${asArray(field.options).map((option) => `<option value="${escapeHTML(option)}" ${option === value ? "selected" : ""}>${escapeHTML(option)}</option>`).join("")}</select>`;
      }
      return `<label class="field ${field.type === "palette" ? "analysis-edit-wide" : ""}"><span>${escapeHTML(field.label || key)}</span>${control}</label>`;
    }).join("");
    const required = asArray(contract.requiredModules).includes(moduleId);
    return `<fieldset class="analysis-edit-group analysis-edit-wide" data-v2-module="${escapeHTML(moduleId)}" data-required="${String(required)}">
      <legend>${escapeHTML(definition.label || moduleId)}</legend>
      <label class="field"><span>模块状态</span><select name="v2.module.${escapeHTML(moduleId)}.status">
        ${["available", "partial", "not_observed", "not_applicable"].map((status) => `<option value="${status}" ${status === (module.status || "not_observed") ? "selected" : ""}>${({ available: "可用", partial: "部分可见", not_observed: "无法观察", not_applicable: "不适用" })[status]}</option>`).join("")}
      </select></label>
      <div class="analysis-edit-grid">${fieldMarkup}</div>
    </fieldset>`;
  }).join("");
  const promptDefinitions = asObject(contract.promptDefinitions);
  const promptMarkup = Object.entries(asObject(data.prompts)).map(([key, value]) => `
    <label class="field"><span>${escapeHTML(promptDefinitions[key]?.label || key)}</span><textarea name="v2.prompt.${escapeHTML(key)}">${escapeHTML(readableValue(value))}</textarea></label>`).join("");
  elements.analysisV2Editor.innerHTML = `
    ${rootFields.map(([key, label, value]) => `<label class="field ${key === "summary" ? "analysis-edit-wide" : ""}"><span>${label}</span><textarea name="v2.root.${key}" ${key === "summary" ? 'maxlength="500" required' : ""}>${escapeHTML(value)}</textarea></label>`).join("")}
    <label class="field"><span>整体可信度（0–100）</span><input name="v2.root.confidence" type="number" min="0" max="100" step="1" value="${Math.round((finiteNumber(data.confidence) ?? 0) * 100)}" /></label>
    ${moduleMarkup}
    ${promptMarkup ? `<fieldset class="analysis-edit-group analysis-edit-wide"><legend>提示词</legend><div class="analysis-edit-grid">${promptMarkup}</div></fieldset>` : ""}`;
}

function readAnalysisLines(form, name) {
  return String(new FormData(form).get(name) || "")
    .split(/\n+/u)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 24);
}

function requiredAnalysisText(form, name, fallback) {
  return String(new FormData(form).get(name) || "").trim() || fallback;
}

function readAnalysisPalette() {
  return [...elements.analysisPaletteEditor.querySelectorAll(".analysis-color-row")].map(
    (row) => ({
      hex: safeColor(row.querySelector(".analysis-color-hex")?.value).toUpperCase(),
      role: row.querySelector(".analysis-color-role")?.value.trim() || "颜色",
      proportion: Math.max(
        0,
        Math.min(1, Number(row.querySelector('[type="number"]')?.value || 0) / 100),
      ),
    }),
  );
}

function editedAnalysisPayload(asset, form) {
  const { data } = analysisRecord(asset);
  if (data.schemaVersion === "style-atlas-analysis-v2") {
    return editedV2AnalysisPayload(data, form);
  }
  const description = requiredAnalysisText(
    form,
    "detailedDescription",
    data.detailedDescription || data.summary,
  );
  const editedSummary = requiredAnalysisText(form, "summary", data.summary || description);
  const summary = editedSummary.length >= 20
    ? editedSummary.slice(0, 500)
    : editedSummary.padEnd(20, "。").slice(0, 500);
  const next = structuredClone(data);
  next.schemaVersion = "style-atlas-visual-v1";
  next.language = "zh-Hans";
  next.summary = summary;
  next.detailedDescription = description;
  next.designDomains = readAnalysisLines(form, "designDomains");
  next.artifactTypes = readAnalysisLines(form, "artifactTypes");
  next.visualDNA ||= {};
  for (const key of [
    "lineage",
    "composition",
    "grid",
    "hierarchy",
    "density",
    "whitespace",
    "rhythm",
  ]) {
    next.visualDNA[key] = requiredAnalysisText(
      form,
      `visualDNA.${key}`,
      data.visualDNA?.[key] || "未说明",
    );
  }
  next.color ||= {};
  next.typography ||= {};
  for (const key of ["category", "scale", "weight", "tracking", "case", "notes"]) {
    next.typography[key] = requiredAnalysisText(
      form,
      `typography.${key}`,
      data.typography?.[key] || "未说明",
    );
  }
  for (const key of ["mode", "temperature", "saturation", "contrast", "notes"]) {
    next.color[key] = requiredAnalysisText(
      form,
      `color.${key}`,
      data.color?.[key] || "未说明",
    );
  }
  next.color.palette = readAnalysisPalette();
  next.imagery ||= {};
  next.imagery.types = readAnalysisLines(form, "imagery.types");
  for (const key of ["treatment", "cropping", "notes"]) {
    next.imagery[key] = requiredAnalysisText(
      form,
      `imagery.${key}`,
      data.imagery?.[key] || "未说明",
    );
  }
  for (const key of ["materials", "components", "interactionSignals", "avoid", "tags"]) {
    next[key] = readAnalysisLines(form, key);
  }
  next.whyItWorks = readAnalysisLines(form, "whyItWorks");
  next.implementationRecipe = readAnalysisLines(form, "implementationRecipe");
  next.prompts ||= {};
  for (const key of [
    "imageGeneration",
    "uiImplementation",
    "designTokens",
    "negative",
  ]) {
    next.prompts[key] = requiredAnalysisText(
      form,
      `prompts.${key}`,
      data.prompts?.[key] || "未生成",
    );
  }
  return next;
}

function editedV2AnalysisPayload(data, form) {
  const formData = new FormData(form);
  const next = structuredClone(data);
  next.summary = String(formData.get("v2.root.summary") || "").trim();
  for (const key of ["designDomains", "artifactTypes", "tags", "uncertainties"]) {
    const values = String(formData.get(`v2.root.${key}`) || "").split(/\n+/u).map((item) => item.trim()).filter(Boolean);
    if (values.length) next[key] = values;
    else delete next[key];
  }
  next.confidence = Math.max(0, Math.min(1, Number(formData.get("v2.root.confidence") || 0) / 100));
  next.modules = {};
  for (const group of elements.analysisV2Editor.querySelectorAll("[data-v2-module]")) {
    const moduleId = group.dataset.v2Module;
    const status = String(formData.get(`v2.module.${moduleId}.status`) || "not_observed");
    const module = { status };
    const moduleData = {};
    for (const field of group.querySelectorAll("[data-v2-field-type]")) {
      const key = field.name.split(".").at(-1);
      const raw = field.value.trim();
      if (!raw) continue;
      if (field.dataset.v2FieldType === "palette") {
        moduleData[key] = raw.split(/\n+/u).map((line) => {
          const [hex, role, percentage] = line.split("|").map((part) => part.trim());
          return { hex: safeColor(hex).toUpperCase(), role: role || "颜色", proportion: Math.max(0, Math.min(1, Number(percentage || 0) / 100)) };
        });
      } else if (field.dataset.v2FieldType === "array") {
        moduleData[key] = raw.split(/\n+/u).map((item) => item.trim()).filter(Boolean);
      } else if (field.dataset.v2FieldType === "number") {
        moduleData[key] = Number(raw);
      } else {
        moduleData[key] = raw;
      }
    }
    if (Object.keys(moduleData).length) module.data = moduleData;
    if (group.dataset.required === "true" || status !== "not_observed" || module.data) next.modules[moduleId] = module;
  }
  const prompts = {};
  for (const field of elements.analysisV2Editor.querySelectorAll('textarea[name^="v2.prompt."]')) {
    const value = field.value.trim();
    if (value) prompts[field.name.split(".").at(-1)] = value;
  }
  if (Object.keys(prompts).length) next.prompts = prompts;
  else delete next.prompts;
  return next;
}

async function saveAnalysisEdits(form) {
  const asset = assetById(form.dataset.assetId);
  if (!asset) return;
  const submit = form.querySelector('[type="submit"]');
  const restore = beginPendingButtons([submit], "保存中…");
  try {
    const updated = normalizeAsset(
      await api(`/api/assets/${encodeURIComponent(asset.id)}/analysis`, {
        method: "PATCH",
        body: JSON.stringify({ analysis: editedAnalysisPayload(asset, form) }),
      }),
    );
    const index = state.assets.findIndex((item) => item.id === asset.id);
    if (index >= 0) state.assets[index] = updated;
    closeDialog(elements.analysisDialog);
    renderGallery();
    renderInspector();
    notify("AI 分析内容已保存为新版本。");
  } catch (error) {
    notify(`AI 分析保存失败：${error.message}`, "error");
  } finally {
    restore();
  }
}

function stateLabel(value) {
  return STATUS_LABELS[value] || value || "未分类";
}

function formatNumber(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat("zh-CN").format(number)
    : "—";
}

function formatBytes(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return "—";
  if (number < 1024) return `${number} B`;
  if (number < 1024 ** 2) return `${(number / 1024).toFixed(1)} KB`;
  return `${(number / 1024 ** 2).toFixed(1)} MB`;
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function statusIsActive(status) {
  return ["queued", "pending", "running", "processing", "analyzing"].includes(
    status,
  );
}

function statusNeedsAttention(status) {
  return ["needs_review", "failed", "missing", "needs_setup"].includes(status);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  if (response.status === 204) return null;

  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { message: text };
    }
  }

  if (!response.ok) {
    const message =
      payload?.error?.message ||
      payload?.error ||
      payload?.message ||
      `本地服务回传 ${response.status}`;
    const error = new Error(String(message));
    error.status = response.status;
    error.details = payload?.details || payload?.error?.details || null;
    throw error;
  }

  return payload;
}

function normalizeAnalysisRulesPayload(payload) {
  const source = asObject(payload?.source);
  const items = listFrom(payload, ["items", "rules", "data"]).map((rule) => ({
    ...asObject(rule),
    id: String(rule?.id || ""),
    name: String(rule?.name || "未命名规则"),
    description: String(rule?.description || ""),
    prompt: String(rule?.prompt || ""),
    version: String(rule?.version || "1.0.0"),
    source: String(rule?.source || "custom"),
    readOnly: rule?.readOnly !== false,
    enabled: rule?.enabled !== false,
  }));
  const selectedId = String(payload?.selectedId || items[0]?.id || "");
  return {
    items,
    selectedId: items.some((rule) => rule.id === selectedId) ? selectedId : (items[0]?.id || ""),
    source: {
      managed: source.managed !== false,
      available: source.available === true,
      officialAvailable: source.officialAvailable === true,
      analysisAvailable: source.analysisAvailable === true,
      unavailableReason: String(source.unavailableReason || ""),
      lastCheckedAt: String(source.lastCheckedAt || ""),
      lastError: String(source.lastError || ""),
    },
    history: Array.isArray(payload?.history) ? payload.history : [],
  };
}

function applyAnalysisRulesPayload(payload) {
  state.analysisRules = normalizeAnalysisRulesPayload(payload);
  state.settings.selectedAnalysisRuleId = state.analysisRules.selectedId;
  renderAnalysisRulePicker();
  renderAnalysisRuleManager();
  renderProviderState();
  updateAnalyzeControls();
}

function analysisRuleById(id) {
  return state.analysisRules.items.find((rule) => rule.id === id) || null;
}

function selectedAnalysisRule() {
  return (
    analysisRuleById(state.analysisRules.selectedId) ||
    state.analysisRules.items[0] ||
    null
  );
}

function analysisRuleName(id, version = "") {
  const rule = analysisRuleById(id);
  const name = rule?.name || id || "未知分析类型";
  return `${name}${version ? ` · v${version}` : ""}`;
}

function studySvg(index, title, palette) {
  const [paper, ink, accent, muted] = palette;
  const variants = [
    `<rect x="44" y="44" width="712" height="512" fill="${paper}"/><rect x="380" y="88" width="328" height="292" fill="${muted}"/><path d="M390 380h318v124H390z" fill="${ink}"/><path d="M88 110h224v18H88zm0 36h166v8H88zm0 244h230v114H88z" fill="${accent}"/>`,
    `<rect width="800" height="600" fill="${ink}"/><text x="54" y="170" font-size="116" font-weight="800" fill="${paper}" font-family="Arial">FORM</text><text x="54" y="276" font-size="116" font-weight="800" fill="${paper}" font-family="Arial">FOLLOWS</text><path d="M54 330h690v5H54z" fill="${accent}"/><text x="56" y="380" font-size="22" fill="${muted}" font-family="Arial">${escapeHTML(title)}</text>`,
    `<rect width="800" height="600" fill="${paper}"/><circle cx="400" cy="285" r="172" fill="${muted}"/><rect x="334" y="118" width="132" height="316" fill="${accent}"/><rect x="352" y="150" width="96" height="244" fill="${ink}"/><path d="M84 520h632" stroke="${ink}" stroke-width="3"/>`,
    `<rect width="800" height="600" fill="${accent}"/><rect x="48" y="46" width="286" height="508" fill="${paper}"/><rect x="370" y="46" width="382" height="242" fill="${ink}"/><rect x="370" y="320" width="178" height="234" fill="${muted}"/><rect x="580" y="320" width="172" height="234" fill="${paper}"/>`,
    `<rect width="800" height="600" fill="${paper}"/><rect x="52" y="54" width="164" height="492" fill="${ink}"/><rect x="246" y="54" width="502" height="88" fill="${muted}"/><path d="M246 178h502v368H246z" fill="${accent}"/><path d="M284 488V302m84 186V260m84 228V352m84 136V214m84 274V332m84 156V278" stroke="${paper}" stroke-width="20"/>`,
    `<rect width="800" height="600" fill="${muted}"/><rect x="62" y="58" width="676" height="484" fill="${paper}"/><rect x="106" y="110" width="262" height="354" fill="${accent}"/><circle cx="520" cy="284" r="122" fill="${ink}"/><path d="M432 458h180" stroke="${ink}" stroke-width="10"/>`,
    `<rect width="800" height="600" fill="${ink}"/><rect x="48" y="52" width="704" height="496" fill="${paper}"/><path d="M48 194h704M288 52v496M520 194v354" stroke="${muted}" stroke-width="3"/><circle cx="640" cy="120" r="34" fill="${accent}"/><rect x="324" y="238" width="152" height="208" fill="${ink}"/>`,
    `<rect width="800" height="600" fill="${paper}"/><path d="M70 74h660v452H70z" fill="${muted}"/><path d="M70 74h396v452H70z" fill="${ink}"/><text x="108" y="244" font-size="86" font-weight="700" fill="${paper}" font-family="Arial">A—Z</text><rect x="506" y="118" width="174" height="174" fill="${accent}"/><path d="M506 326h174v12H506zm0 34h116v8H506z" fill="${ink}"/>`,
  ];
  const markup = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-label="${escapeHTML(title)}">
      ${variants[index % variants.length]}
      <text x="54" y="574" font-size="14" fill="${index === 1 ? paper : ink}" font-family="Arial">SYNTHETIC STUDY ${String(index + 1).padStart(2, "0")} · STYLE ATLAS</text>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(markup)}`;
}

function createSyntheticStudies() {
  const definitions = [
    {
      title: "校准建筑／首页",
      discipline: "web",
      palette: ["#f1f0ea", "#161817", "#135dff", "#b8b9b4"],
      description: "以宽幅建筑图片、低密度导航与克制字号创建安静但明确的首页层级。",
      style: "极简、建筑、编辑",
      composition: "非对称分割、图片主导、宽留白",
    },
    {
      title: "模块字体／海报",
      discipline: "brand",
      palette: ["#f4f0e8", "#111111", "#dc3328", "#858681"],
      description: "巨幅无衬线字体与校样红线构成单一视觉承诺，适合作为品牌宣言。",
      style: "字体主导、现代主义",
      composition: "全幅字号、严格基线、单点强调色",
    },
    {
      title: "静物材质／品牌",
      discipline: "brand",
      palette: ["#eee9df", "#1e211f", "#8d6f47", "#c7c1b7"],
      description: "中性棚拍、触感材质与少量标签，让产品本身成为品牌识别的证据。",
      style: "静物摄影、自然材质",
      composition: "中心聚焦、低对比背景、尺度留白",
    },
    {
      title: "流动状态／概念",
      discipline: "concept",
      palette: ["#fff5e9", "#171717", "#ef4d23", "#684cff"],
      description: "高饱和场景与分栏节奏用来表达运动、音乐或文化活动的动态性。",
      style: "文化海报、动态模糊",
      composition: "互补色冲突、分割字段、大字短句",
    },
    {
      title: "数据层级／UI",
      discipline: "ui",
      palette: ["#f5f6f2", "#171918", "#135dff", "#9ca7b8"],
      description: "窄索引配合宽数据区，使用明确基线与单一蓝色表示可操作状态。",
      style: "工具界面、信息设计",
      composition: "侧栏索引、水平读序、数据层级",
    },
    {
      title: "包装比例／产品",
      discipline: "product",
      palette: ["#eee6d8", "#201f1b", "#a66d35", "#b9b1a4"],
      description: "以几何容器、低饱和度纸材与比例对照创建可靠的产品叙事。",
      style: "包装、材质研究",
      composition: "中心对象、比例对照、低密度标注",
    },
    {
      title: "深色架构／网页",
      discipline: "web",
      palette: ["#f4f1e9", "#171918", "#6b735f", "#a8a69e"],
      description: "深色框架与亮色内容页形成场景切换，焦点留给案例本身而非界面装饰。",
      style: "作品集、深色框架",
      composition: "框中框、案例聚焦、低饱和度",
    },
    {
      title: "界面图谱／品牌",
      discipline: "brand",
      palette: ["#f7f4ec", "#111111", "#135dff", "#b9b8b0"],
      description: "将识别元素依比例、字号与应用场景编成一张可实现的品牌图谱。",
      style: "品牌规范、系统化",
      composition: "模块网格、比例标记、可追溯编号",
    },
  ];

  return definitions.map((item, index) => ({
    id: `synthetic-${index + 1}`,
    title: item.title,
    fileName: `synthetic-study-${index + 1}.svg`,
    mediaUrl: studySvg(index, item.title, item.palette),
    width: 800,
    height: 600,
    mimeType: "image/svg+xml",
    status: "synthetic",
    discipline: item.discipline,
    synthetic: true,
    analysis: {
      description: item.description,
      visualDna: {
        discipline: item.discipline,
        style: item.style,
        composition: item.composition,
        density: index % 2 === 0 ? "克制／低至中密度" : "聚焦／中密度",
        typography: "清楚字号阶层、用途导向",
      },
      palette: item.palette,
      whyItWorks: [
        "主视觉与文字层级只有一个明确焦点",
        "色彩角色固定，不以装饰取代内容",
        "构图可直接转译成响应式网格",
      ],
      implementationRecipe: [
        "先定义主内容与索引区的比例",
        "以单一强调色标记状态与主要操作",
        "在小屏幕保持原本阅读顺序，再折叠次要信息",
      ],
      promptKit: {
        visual: `${item.title}，${item.style}，${item.composition}，中性色基底，单一强调色，真实内容主导，无玻璃特效、无霓虹、无通用仪表板卡片。`,
        implementation: `以语义化 HTML、CSS Grid 与可访问控件实现「${item.title}」方向；保留${item.composition}，图片优先，状态以单一校准色表达。`,
        negative: "渐层光球、玻璃拟态、霓虹描边、卡片套卡片、巨大标题、无意义 AI 分数",
      },
    },
  }));
}

function providerObject() {
  if (Array.isArray(state.provider)) {
    const selectedProvider = ["codex", "workbuddy", "custom"].includes(
      state.settings.provider,
    )
      ? state.settings.provider
      : "codex";
    return (
      state.provider.find((item) =>
        String(item?.id || item?.name || item?.provider || "").toLowerCase() === selectedProvider,
      ) || state.provider[0] || null
    );
  }
  return state.provider && typeof state.provider === "object"
    ? state.provider
    : null;
}

function codexReadiness() {
  const provider = providerObject();
  if (!provider) return null;
  if (typeof provider.ready === "boolean") return provider.ready;
  if (typeof provider.available === "boolean") return provider.available;
  if (typeof provider.configured === "boolean") return provider.configured;
  const status = String(provider.status || provider.state || "").toLowerCase();
  if (["ready", "available", "connected", "configured", "ok"].includes(status)) return true;
  if (
    ["needs_setup", "unavailable", "missing", "error", "auth_required"].includes(
      status,
    )
  ) {
    return false;
  }
  return null;
}

async function loadBootstrap({ preserveSelection = true } = {}) {
  state.loading = true;
  state.error = null;
  renderLoading();

  try {
    const bootstrap = await api("/api/bootstrap");
    const rawAssets = listFrom(bootstrap?.assets, ["items", "assets", "data"]);
    const rawJobs = listFrom(bootstrap?.jobs, ["items", "jobs", "data"]);

    state.assets = rawAssets.map(normalizeAsset);
    state.resultTotal =
      finiteNumber(bootstrap?.assets?.total, bootstrap?.assets?.count) ??
      state.assets.length;
    state.libraryTotal =
      finiteNumber(
        bootstrap?.assets?.total,
        bootstrap?.stats?.availableAssets,
        bootstrap?.stats?.assets,
        bootstrap?.stats?.assetCount,
      ) ?? state.assets.length;
    state.stats = asObject(bootstrap?.stats);
    state.jobs = rawJobs.map(normalizeJob);
    state.settings = asObject(bootstrap?.settings);
    state.analysisRules = normalizeAnalysisRulesPayload(bootstrap?.analysisRules);
    state.analysisContracts = asObject(bootstrap?.analysisContracts);
    state.provider = bootstrap?.provider ?? bootstrap?.providers ?? null;
    state.agents = listFrom(bootstrap?.agents, ["items", "agents", "data"]);
    if (bootstrap?.agents?.selectedId) {
      state.settings.selectedAgentId = String(bootstrap.agents.selectedId);
    }
    state.collections = listFrom(bootstrap?.collections, [
      "items",
      "collections",
      "data",
    ]).map(normalizeCollection);
    state.tags = listFrom(bootstrap?.tags, ["items", "tags", "data"]);
    state.trash = listFrom(bootstrap?.trash, ["items", "trash", "data"]);
    state.skills = listFrom(bootstrap?.skills, ["items", "skills", "data"]);
    state.mcps = listFrom(bootstrap?.mcps, ["items", "mcps", "data"]);
    state.paths = asObject(bootstrap?.paths);
    state.appUpdate = asObject(bootstrap?.appUpdate);
    state.license = asObject(bootstrap?.license);
    state.loading = false;
    if (
      preserveSelection &&
      state.selectedId &&
      !state.assets.some((asset) => asset.id === state.selectedId)
    ) {
      closeInspector();
    }

    renderAll();
    maybeAutoUpdateAnalysisRules();
    if (state.appUpdate.configured) refreshAppUpdate(elements.checkAppUpdateButton, { silent: true });
  } catch (error) {
    state.loading = false;
    state.error = error;
    renderLoading();
  }
}

function renderLoading() {
  elements.loadingState.hidden = !state.loading;
  elements.errorState.hidden = !state.error;
  elements.gallery.hidden = state.loading || Boolean(state.error);

  if (state.error) {
    elements.errorMessage.textContent =
      state.error.message || "请确认本地服务仍在执行，再重新加载。";
    elements.resultSummary.textContent = "本地数据库无法连接";
  }
}

function activeJobs() {
  return state.jobs.filter((job) => statusIsActive(job.status));
}

function inboxAssets() {
  return state.assets.filter(
    (asset) => ["discovered", "imported", "pending"].includes(asset.status),
  );
}

function disciplineKey(value) {
  return String(value || "").trim().toLocaleLowerCase("zh-CN");
}

function disciplineTags(asset) {
  return String(asset?.discipline || "")
    .split(/[,，\n]/u)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter(
      (tag, index, tags) =>
        tags.findIndex((candidate) => disciplineKey(candidate) === disciplineKey(tag)) ===
        index,
    );
}

function renderDisciplineFilter() {
  const labels = new Map();
  for (const asset of state.assets) {
    for (const tag of disciplineTags(asset)) {
      const key = disciplineKey(tag);
      if (!labels.has(key)) labels.set(key, tag);
    }
  }
  if (state.discipline && !labels.has(state.discipline)) {
    labels.set(state.discipline, state.discipline);
  }
  const options = [...labels.entries()].sort((a, b) =>
    a[1].localeCompare(b[1], "zh-CN"),
  );
  elements.disciplineFilter.innerHTML = [
    '<option value="">全部领域标签</option>',
    ...options.map(
      ([key, label]) =>
        `<option value="${escapeHTML(key)}">${escapeHTML(label)}</option>`,
    ),
  ].join("");
  elements.disciplineFilter.value = state.discipline;
}

function filteredAssets() {
  let assets = [...state.assets];
  if (state.view === "inbox") assets = inboxAssets();
  if (state.discipline) {
    assets = assets.filter((asset) =>
      disciplineTags(asset).some(
        (tag) => disciplineKey(tag) === state.discipline,
      ),
    );
  }
  if (state.status) {
    assets = assets.filter((asset) => asset.status === state.status);
  }

  if (state.sort === "title") {
    assets.sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
  } else if (state.sort === "status") {
    assets.sort((a, b) => a.status.localeCompare(b.status));
  } else {
    assets.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      return bTime - aTime;
    });
  }
  return assets;
}

function activeCollection() {
  return (
    state.collections.find(
      (collection) => collection.id === state.activeCollectionId,
    ) || null
  );
}

function renderAll() {
  renderLoading();
  renderViewHeading();
  renderCounts();
  renderProviderState();
  renderCollectionNav();
  renderDisciplineFilter();
  renderGallery();
  renderInspector();
  renderBatchBar();
  renderQueue();
  renderAnalysisRulePicker();
  renderSettings();
  updateNavState();
  const statusFilterLabel = elements.statusFilter.closest("label");
  const specialView = ["tags", "trash", "skills", "mcps"].includes(state.view);
  if (elements.filterStrip) elements.filterStrip.hidden = specialView;
  if (statusFilterLabel) statusFilterLabel.hidden = state.view === "inbox";
  elements.searchInput.placeholder =
    state.view === "skills"
      ? "搜索 Skills"
      : state.view === "mcps"
        ? "搜索 MCP"
        : "搜索素材";
}

function renderViewHeading() {
  const collection = activeCollection();
  if (collection) {
    elements.viewTitle.textContent = collection.name;
  } else if (state.view === "inbox") {
    elements.viewTitle.textContent = "未分析";
  } else if (state.view === "tags") {
    elements.viewTitle.textContent = "标签管理";
  } else if (state.view === "skills") {
    elements.viewTitle.textContent = "Skills";
  } else if (state.view === "mcps") {
    elements.viewTitle.textContent = "MCP";
  } else if (state.view === "trash") {
    elements.viewTitle.textContent = "回收站";
  } else {
    elements.viewTitle.textContent = "全部素材";
  }
}

function renderCounts() {
  const inboxCount = finiteNumber(state.stats.pendingAssets) ?? inboxAssets().length;

  elements.countLibrary.textContent = formatNumber(state.libraryTotal);
  elements.countInbox.textContent = formatNumber(inboxCount);
  elements.countTags.textContent = formatNumber(state.tags.length);
  elements.countSkills.textContent = formatNumber(state.skills.length);
  elements.countMcps.textContent = formatNumber(state.mcps.length);
  elements.countTrash.textContent = formatNumber(state.trash.length);
}

function renderProviderState() {
  const provider = providerObject() || {};
  const ready = codexReadiness();
  elements.setupNotice.hidden =
    ready !== false || ["tags", "trash", "skills", "mcps"].includes(state.view);
  elements.setupMessage.textContent =
    provider.message || "请确认 Codex CLI 已安装并完成登录。";
  elements.settingsStatusDot.classList.toggle("is-ready", ready === true);
  elements.settingsStatusDot.classList.toggle("needs-setup", ready === false);
  elements.settingsStatusDot.setAttribute(
    "aria-label",
    ready === true
      ? "分析 Agent 已就绪"
      : ready === false
        ? "分析 Agent 尚未就绪"
        : "分析 Agent 状态未知",
  );
  const source = state.analysisRules.source;
  const customAvailable = state.analysisRules.items.some(
    (rule) => rule.source === "custom" && rule.enabled !== false,
  );
  elements.analysisRuleNotice.hidden = source.officialAvailable
    || ["tags", "trash", "skills", "mcps"].includes(state.view);
  elements.analysisRuleNoticeMessage.textContent = customAvailable
    ? `官方分析已暂停；当前仍可使用有效的本机自定义规则。${source.unavailableReason || ""}`
    : `官方分析已暂停，素材库、收藏、搜索和历史数据仍可使用。${source.unavailableReason || ""}`;
  elements.retryAnalysisRules.textContent = source.available ? "重新同步" : "打开设置";
}

function updateNavState() {
  elements.primaryNav.querySelectorAll("[data-view]").forEach((button) => {
    const active = button.dataset.view === state.view && !state.activeCollectionId;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
}

function renderCollectionNav() {
  if (!state.collections.length) {
    elements.collectionNav.innerHTML =
      '<p class="rail-footnote">尚未创建收藏集</p>';
    return;
  }

  elements.collectionNav.innerHTML = state.collections
    .slice(0, 12)
    .map(
      (collection) => `
        <div class="collection-link-row ${collection.id === state.activeCollectionId ? "is-active" : ""}">
          <button
            class="collection-link"
            type="button"
            data-collection-id="${escapeHTML(collection.id)}"
          >
            <span>${escapeHTML(collection.name)}</span>
            <small>${formatNumber(collection.itemCount)}</small>
          </button>
          <button
            class="icon-button collection-menu-trigger"
            type="button"
            data-collection-menu="${escapeHTML(collection.id)}"
            aria-label="${escapeHTML(collection.name)} 的操作"
            aria-haspopup="menu"
            aria-expanded="${collection.id === state.collectionMenuId}"
            title="收藏集操作"
          >
            <svg class="icon" aria-hidden="true"><use href="#icon-more"></use></svg>
          </button>
          <div class="collection-menu" role="menu" ${collection.id === state.collectionMenuId ? "" : "hidden"}>
            <button
              class="collection-menu-item"
              type="button"
              data-rename-collection="${escapeHTML(collection.id)}"
              role="menuitem"
              aria-label="重命名收藏集 ${escapeHTML(collection.name)}"
            >
              <svg class="icon" aria-hidden="true"><use href="#icon-edit"></use></svg>
              <span>重命名</span>
            </button>
            <button
              class="collection-menu-item collection-menu-item--danger"
              type="button"
              data-delete-collection="${escapeHTML(collection.id)}"
              role="menuitem"
              aria-label="删除收藏集 ${escapeHTML(collection.name)}"
            >
              <svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg>
              <span>删除</span>
            </button>
          </div>
        </div>`,
    )
    .join("");
}

function renderGallery() {
  if (state.loading || state.error) return;
  if (state.view === "tags") {
    renderTagManager();
    return;
  }
  if (state.view === "trash") {
    renderTrash();
    return;
  }
  if (state.view === "skills") {
    renderSkills();
    return;
  }
  if (state.view === "mcps") {
    renderMcps();
    return;
  }
  elements.clearFiltersButton.hidden =
    !state.query && !state.discipline && !state.status && state.sort === "newest";
  elements.gallery.hidden = false;
  const assets = filteredAssets();
  const apiLibraryEmpty = state.libraryTotal === 0;
  const renderedAssets = assets;
  const hasConditions = Boolean(state.query || state.discipline || state.status);
  const collection = activeCollection();

  elements.resultSummary.textContent = formatNumber(assets.length);

  if (!renderedAssets.length) {
    const emptyTitle = apiLibraryEmpty
      ? "尚无素材"
      : collection && !hasConditions
        ? "收藏集为空"
        : state.view === "inbox" && !hasConditions
          ? "没有未分析素材"
          : "没有结果";
    const emptyAction = apiLibraryEmpty
      ? '<button class="button button--primary" type="button" data-action="import">导入图片</button>'
      : collection && !hasConditions
        ? '<button class="button button--quiet" type="button" data-view="library">查看全部素材</button>'
        : hasConditions
          ? '<button class="button button--quiet" type="button" data-action="clear-filters">清除条件</button>'
          : "";
    elements.gallery.innerHTML = `
      <div class="empty-library-panel">
        <div>
          <h2>${emptyTitle}</h2>
          ${emptyAction}
        </div>
      </div>`;
    return;
  }

  elements.gallery.innerHTML =
    renderedAssets
      .map((asset, index) => renderAssetCard(asset, index, renderedAssets.length))
      .join("");
}

function renderTagManager() {
  elements.clearFiltersButton.hidden = true;
  elements.gallery.hidden = false;
  elements.resultSummary.textContent = formatNumber(state.tags.length);
  elements.gallery.innerHTML = `
    <div class="tool-view tag-manager">
      <div class="tool-view-heading">
        <div><h2>全部标签</h2><p>统一管理所有素材使用的分类标签。</p></div>
      </div>
      <div class="managed-tag-list">
        ${state.tags.length ? state.tags.map((tag) => `
          <div class="managed-tag" data-managed-tag="${escapeHTML(tag.name)}">
            <button class="managed-tag-name" type="button" data-rename-managed-tag="${escapeHTML(tag.name)}" title="双击修改名称">
              <span>${escapeHTML(tag.name)}</span>
            </button>
            <small>${formatNumber(tag.count)}</small>
            <button class="icon-button" type="button" data-delete-managed-tag="${escapeHTML(tag.name)}" aria-label="删除标签 ${escapeHTML(tag.name)}">
              <svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>
            </button>
          </div>`).join("") : '<p class="tool-empty">还没有标签。请先在素材详情中添加。</p>'}
      </div>
    </div>`;
}

function normalizedToolQuery() {
  return state.query.trim().toLocaleLowerCase("zh-CN");
}

function renderSkills() {
  elements.clearFiltersButton.hidden = true;
  elements.gallery.hidden = false;
  const query = normalizedToolQuery();
  const skills = state.skills.filter((skill) => {
    if (state.skillFavoritesOnly && !skill.favorite) return false;
    if (!query) return true;
    return [skill.name, skill.description, skill.source, skill.path]
      .some((value) => String(value || "").toLocaleLowerCase("zh-CN").includes(query));
  });
  elements.resultSummary.textContent = `${formatNumber(skills.length)} / ${formatNumber(state.skills.length)}`;
  elements.gallery.innerHTML = `
    <div class="tool-view integration-manager">
      <div class="tool-view-heading integration-toolbar">
        <div><h2>本机 Skills</h2><p>${formatNumber(state.skills.length)} 个 · ${formatNumber(state.skills.filter((item) => item.favorite).length)} 个收藏</p></div>
        <div class="tool-view-actions">
          <button class="button button--quiet" type="button" data-install-skill>
            <svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>
            安装
          </button>
          <button class="button button--quiet ${state.skillFavoritesOnly ? "is-active" : ""}" type="button" data-skill-favorites aria-pressed="${state.skillFavoritesOnly}">
            <svg class="icon" aria-hidden="true"><use href="#icon-star"></use></svg>
            仅看收藏
          </button>
          <button class="icon-button" type="button" data-refresh-skills aria-label="重新扫描 Skills" title="重新扫描 Skills">
            <svg class="icon" aria-hidden="true"><use href="#icon-refresh"></use></svg>
          </button>
        </div>
      </div>
      <div class="integration-list" role="list">
        ${skills.length ? skills.map((skill) => `
          <article class="integration-row skill-row" role="listitem">
            <button
              class="icon-button favorite-skill-button ${skill.favorite ? "is-active" : ""}"
              type="button"
              data-favorite-skill="${escapeHTML(skill.id)}"
              aria-pressed="${Boolean(skill.favorite)}"
              aria-label="${skill.favorite ? "取消收藏" : "收藏"} ${escapeHTML(skill.name)}"
              title="${skill.favorite ? "取消收藏" : "收藏"}"
            >
              <svg class="icon" aria-hidden="true"><use href="#icon-star"></use></svg>
            </button>
            <div class="integration-copy">
              <div class="integration-name-line">
                <strong>${escapeHTML(skill.name)}</strong>
                <span class="integration-source">${escapeHTML(skill.source)}</span>
                ${skill.system ? '<span class="integration-source">系统</span>' : ""}
              </div>
              <p>${escapeHTML(skill.description || "暂无说明")}</p>
              <code title="${escapeHTML(skill.path)}">${escapeHTML(skill.path)}</code>
            </div>
            <div class="integration-row-actions">
              ${skill.updateable ? `<button class="icon-button" type="button" data-update-skill="${escapeHTML(skill.id)}" aria-label="从仓库更新 ${escapeHTML(skill.name)}" title="从仓库更新"><svg class="icon" aria-hidden="true"><use href="#icon-refresh"></use></svg></button>` : ""}
              ${!skill.system ? `<div class="agent-sync-group" aria-label="同步 ${escapeHTML(skill.name)}">
                ${Object.entries(AGENT_LABELS).map(([id, label]) => `<button class="agent-sync ${skill.targets?.[id] ? "is-active" : ""}" type="button" data-sync-skill="${escapeHTML(skill.id)}" data-target-agent="${id}" aria-pressed="${Boolean(skill.targets?.[id])}" aria-label="${id === skill.sourceId ? `当前来源：${label}` : `${skill.targets?.[id] ? "从" : "同步到"}${label}`}" ${id === skill.sourceId ? "disabled" : ""} title="${id === skill.sourceId ? `当前来源：${label}` : `${skill.targets?.[id] ? "从" : "同步到"}${label}`}">${agentLogoMarkup(id)}</button>`).join("")}
              </div>` : ""}
            </div>
          </article>`).join("") : `
          <div class="tool-empty">
            <strong>${state.skills.length ? "没有匹配的 Skill" : "这台电脑上还没有 Skills"}</strong>
          </div>`}
      </div>
    </div>`;
}

function renderMcps() {
  elements.clearFiltersButton.hidden = true;
  elements.gallery.hidden = false;
  const query = normalizedToolQuery();
  const mcps = state.mcps.filter((mcp) => {
    if (state.mcpSource !== "all" && mcp.sourceId !== state.mcpSource) return false;
    if (!query) return true;
    return [mcp.name, mcp.source, mcp.type, mcp.endpoint, mcp.path]
      .some((value) => String(value || "").toLocaleLowerCase("zh-CN").includes(query));
  });
  const sources = [
    ["all", "全部"],
    ["codex", "Codex"],
    ["claude", "Claude Code"],
    ["workbuddy", "WorkBuddy"],
  ].filter(([id]) => id === "all" || state.mcps.some((item) => item.sourceId === id));
  elements.resultSummary.textContent = `${formatNumber(mcps.length)} / ${formatNumber(state.mcps.length)}`;
  elements.gallery.innerHTML = `
    <div class="tool-view integration-manager">
      <div class="tool-view-heading integration-toolbar">
        <div><h2>本机 MCP</h2><p>${formatNumber(state.mcps.filter((item) => item.enabled).length)} 个启用</p></div>
        <div class="tool-view-actions">
          <div class="tool-segments" aria-label="按 Agent 筛选 MCP">
            ${sources.map(([id, label]) => `<button type="button" data-mcp-source="${id}" class="${state.mcpSource === id ? "is-active" : ""}" aria-pressed="${state.mcpSource === id}">${label}</button>`).join("")}
          </div>
          <button class="button button--quiet" type="button" data-check-all-mcps><svg class="icon" aria-hidden="true"><use href="#icon-refresh"></use></svg>全部检查</button>
          <button class="button button--quiet" type="button" data-add-mcp><svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>新增 MCP</button>
          <button class="icon-button" type="button" data-refresh-mcps aria-label="重新读取 MCP" title="重新读取 MCP">
            <svg class="icon" aria-hidden="true"><use href="#icon-refresh"></use></svg>
          </button>
        </div>
      </div>
      <div class="integration-list" role="list">
        ${mcps.length ? mcps.map((mcp) => `
          <article class="integration-row mcp-row ${mcp.enabled ? "" : "is-disabled"}" role="listitem">
            <span class="integration-leading-icon" aria-hidden="true"><svg class="icon"><use href="#icon-server"></use></svg></span>
            <div class="integration-copy">
              <div class="integration-name-line">
                <strong>${escapeHTML(mcp.name)}</strong>
                <span class="integration-source">${escapeHTML(mcp.source)}</span>
                <span class="integration-source">${escapeHTML(String(mcp.type || "stdio").toUpperCase())}</span>
              </div>
              <code title="${escapeHTML(mcp.endpoint || mcp.path)}">${escapeHTML(mcp.endpoint || "未公开连接地址")}</code>
              <small>${escapeHTML(mcp.path)}</small>
              <div class="mcp-health ${mcp.health ? `is-${escapeHTML(mcp.health.status)}` : ""}" title="${escapeHTML(mcp.health?.message || "尚未检查连接")}"><span></span>${escapeHTML(MCP_HEALTH_LABELS[mcp.health?.status] || "尚未检查")}${mcp.health?.latencyMs != null ? ` · ${formatNumber(mcp.health.latencyMs)} ms` : ""}</div>
            </div>
            <div class="integration-row-actions">
              <div class="agent-sync-group" aria-label="跨 Agent 同步 ${escapeHTML(mcp.name)}">${Object.entries(AGENT_LABELS).map(([id, label]) => `<button class="agent-sync ${mcp.targets?.[id] ? "is-active" : ""}" type="button" data-sync-mcp="${escapeHTML(mcp.id)}" data-target-agent="${id}" aria-pressed="${Boolean(mcp.targets?.[id])}" aria-label="${mcp.targets?.[id] ? `已存在于${label}` : `同步到${label}`}" ${mcp.targets?.[id] ? "disabled" : ""} title="${mcp.targets?.[id] ? `已存在于${label}` : `同步到${label}`}">${agentLogoMarkup(id)}</button>`).join("")}</div>
              <button class="icon-button" type="button" data-health-mcp="${escapeHTML(mcp.id)}" aria-label="检查 ${escapeHTML(mcp.name)} 连接" title="检查连接"><svg class="icon" aria-hidden="true"><use href="#icon-refresh"></use></svg></button>
              ${mcp.manageable ? `<button class="icon-button" type="button" data-edit-mcp="${escapeHTML(mcp.id)}" aria-label="编辑 ${escapeHTML(mcp.name)}" title="编辑"><svg class="icon" aria-hidden="true"><use href="#icon-edit"></use></svg></button>
              <button
                class="switch-control"
                type="button"
                role="switch"
                data-toggle-mcp="${escapeHTML(mcp.id)}"
                aria-checked="${Boolean(mcp.enabled)}"
                aria-label="${mcp.enabled ? "停用" : "启用"} ${escapeHTML(mcp.name)}"
                title="${mcp.enabled ? "停用" : "启用"}"
              ><span></span></button><button class="icon-button icon-button--danger" type="button" data-delete-mcp="${escapeHTML(mcp.id)}" aria-label="删除 ${escapeHTML(mcp.name)}" title="删除"><svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg></button>` : '<span class="read-only-label">只读</span>'}
            </div>
          </article>`).join("") : `
          <div class="tool-empty">
            <strong>${state.mcps.length ? "没有匹配的 MCP" : "这台电脑上还没有 MCP 配置"}</strong>
          </div>`}
      </div>
    </div>`;
}

function renderTrash() {
  elements.clearFiltersButton.hidden = true;
  elements.gallery.hidden = false;
  elements.resultSummary.textContent = formatNumber(state.trash.length);
  elements.gallery.innerHTML = `
    <div class="tool-view trash-view">
      ${state.trash.length ? `<div class="trash-grid">${state.trash.map((item) => `
        <article class="trash-card">
          <div class="trash-preview">${item.mediaUrl ? `<img src="${escapeHTML(item.mediaUrl)}" alt="${escapeHTML(item.title || item.fileName)}" />` : '<span class="queue-placeholder-thumb" aria-hidden="true"></span>'}</div>
          <div class="trash-card-info">
            <strong>${escapeHTML(item.title || item.fileName || "未命名素材")}</strong>
            <span>${escapeHTML(formatDate(item.deletedAt))}</span>
          </div>
          <div class="trash-card-actions">
            <button class="button button--quiet" type="button" data-restore-trash="${escapeHTML(item.id)}">
              <svg class="icon" aria-hidden="true"><use href="#icon-restore"></use></svg>恢复
            </button>
            <button class="icon-button icon-button--danger" type="button" data-delete-trash="${escapeHTML(item.id)}" aria-label="彻底删除 ${escapeHTML(item.title || item.fileName)}">
              <svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg>
            </button>
          </div>
        </article>`).join("")}</div>` : '<div class="tool-empty"><h2>回收站为空</h2><p>删除的素材会保留在这里。</p></div>'}
    </div>`;
}

function renderAssetCard(asset, index, total) {
  const current = asset.id === state.selectedId;
  const batchSelected = state.selectedIds.has(asset.id);
  const dimensions =
    asset.width && asset.height ? `${asset.width} × ${asset.height}` : "尺寸未记录";
  const imageUrl = safeMediaUrl(asset.mediaUrl);
  const stateBadge = asset.synthetic
    ? '<span class="synthetic-flag">合成示意</span>'
    : `<span class="asset-state" data-state="${escapeHTML(asset.status)}">${escapeHTML(
        stateLabel(asset.status),
      )}</span>`;
  const selectionButton = asset.synthetic
    ? ""
    : `
      <button
        class="asset-select-toggle"
        type="button"
        data-batch-id="${escapeHTML(asset.id)}"
        aria-label="${batchSelected ? "从批次移除" : "加入批次"}：${escapeHTML(asset.title)}"
        aria-pressed="${batchSelected}"
      >
        ${
          batchSelected
            ? '<svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg>'
            : ""
        }
      </button>`;

  return `
    <figure
      class="asset-card ${current ? "is-selected" : ""} ${batchSelected ? "is-batch-selected" : ""}"
      data-asset-id="${escapeHTML(asset.id)}"
      data-registration=""
    >
      ${stateBadge}
      ${selectionButton}
      <button
        class="asset-open"
        type="button"
        data-open-asset="${escapeHTML(asset.id)}"
        aria-label="查看 ${escapeHTML(asset.title)}"
        aria-pressed="${current}"
      >
        ${
          imageUrl
            ? `<img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(asset.title)}" ${
                index < 5 ? 'fetchpriority="high"' : 'loading="lazy"'
              } decoding="async" />`
            : `<span class="queue-placeholder-thumb" aria-hidden="true"></span>`
        }
      </button>
      <figcaption class="asset-caption">
        <strong>${escapeHTML(asset.title)}</strong>
        <span>${escapeHTML(dimensions)}</span>
      </figcaption>
    </figure>`;
}

function assetById(id) {
  return (
    state.assets.find((asset) => asset.id === id) ||
    state.syntheticAssets.find((asset) => asset.id === id) ||
    null
  );
}

function visualDnaRows(visualDna, data) {
  const source =
    Object.keys(visualDna).length > 0
      ? visualDna
      : {
          discipline: data.discipline,
          style: data.style,
          composition: data.composition,
          typography: data.typography,
          mood: data.mood,
        };
  const entries = Object.entries(source)
    .map(([key, value]) => [key, readableValue(value)])
    .filter(([, value]) => value)
    .slice(0, 12);

  if (!entries.length) return "";
  return `
    <dl class="dna-list">
      ${entries
        .map(
          ([key, value]) => `
            <div>
              <dt>${escapeHTML(DNA_LABELS[key] || key)}</dt>
              <dd>${escapeHTML(value)}</dd>
            </div>`,
        )
        .join("")}
    </dl>`;
}

function renderPalette(palette) {
  if (!palette.length) return '<p class="analysis-empty">尚未撷取色板。</p>';
  return `
    <div class="palette" aria-label="色板">
      ${palette
        .map(
          (swatch) => `
            <button
              class="swatch"
              type="button"
              data-copy-color="${escapeHTML(swatch.hex)}"
              data-swatch-tooltip="${escapeHTML(
                formatSwatchTooltip(swatch.hex, swatch.proportion),
              )}"
              aria-label="复制色值 ${escapeHTML(
                formatSwatchTooltip(swatch.hex, swatch.proportion),
              )}"
            >
              ${renderSwatchColor(swatch.hex)}
            </button>`,
        )
        .join("")}
    </div>`;
}

function renderList(items, className, fallback) {
  if (!items.length) return `<p class="analysis-empty">${escapeHTML(fallback)}</p>`;
  return `<ol class="${className}">${items
    .map((item) => `<li>${escapeHTML(item)}</li>`)
    .join("")}</ol>`;
}

function renderPromptBlock(label, key, value) {
  if (!value) {
    return `
      <div class="prompt-block">
        <div class="prompt-label"><span>${escapeHTML(label)}</span></div>
        <p class="analysis-empty">尚未生成这组提示词。</p>
      </div>`;
  }
  return `
    <div class="prompt-block">
      <div class="prompt-label">
        <span>${escapeHTML(label)}</span>
        <button class="prompt-copy" type="button" data-copy-prompt="${escapeHTML(key)}">
          <svg class="icon" aria-hidden="true"><use href="#icon-copy"></use></svg>
          复制
        </button>
      </div>
      <pre class="prompt-text">${escapeHTML(value)}</pre>
    </div>`;
}

function moduleDefinition(id, rule = null) {
  return asObject(asObject(asObject(rule?.contract).moduleDefinitions)[id]);
}

function renderDynamicField(definition, value) {
  if (definition?.type === "palette" && Array.isArray(value)) return renderPalette(normalizePalette(value));
  if (Array.isArray(value)) {
    const items = value.map(readableValue).filter(Boolean);
    return items.length ? renderList(items, "evidence-list", "") : "";
  }
  const readable = readableValue(value);
  return readable ? `<p>${escapeHTML(readable)}</p>` : "";
}

function renderDynamicAnalysis(analysis) {
  const rule = analysis.ruleSpec || analysisRuleById(analysis.ruleId);
  const contract = asObject(rule?.contract);
  const order = Array.isArray(contract.displayOrder)
    ? contract.displayOrder
    : Object.keys(analysis.modules);
  const metadata = [
    ...asArray(analysis.data.designDomains),
    ...asArray(analysis.data.artifactTypes),
    ...asArray(analysis.data.tags),
  ].map(readableValue).filter(Boolean);
  const sections = [`<section class="inspector-section analysis-overview">
    <div class="inspector-section-heading"><h3 class="analysis-category-title">分析摘要</h3></div>
    <p class="analysis-summary">${escapeHTML(analysis.data.summary || "")}</p>
    ${metadata.length ? `<p class="analysis-module-meta">${metadata.map((item) => escapeHTML(item)).join(" · ")}</p>` : ""}
  </section>`];
  for (const moduleId of order) {
    const module = asObject(analysis.modules[moduleId]);
    if (["not_applicable", "not_observed"].includes(module.status)) continue;
    const data = asObject(module.data);
    const definition = moduleDefinition(moduleId, rule);
    const fields = asObject(definition.fields);
    const rows = Object.entries(data)
      .map(([key, value]) => {
        const content = renderDynamicField(fields[key], value);
        if (!content) return "";
        return `<div class="analysis-module-field"><h4>${escapeHTML(fields[key]?.label || key)}</h4>${content}</div>`;
      })
      .filter(Boolean)
      .join("");
    if (!rows) continue;
    sections.push(`<section class="inspector-section analysis-module" data-analysis-module="${escapeHTML(moduleId)}">
      <div class="inspector-section-heading"><h3 class="analysis-category-title">${escapeHTML(definition.label || moduleId)}</h3>${module.status === "partial" ? '<span class="analysis-status">部分可见</span>' : ""}</div>
      <div class="analysis-module-fields">${rows}</div>
    </section>`);
  }

  const promptDefinitions = asObject(contract.promptDefinitions);
  const promptBlocks = Object.entries(asObject(analysis.data.prompts))
    .filter(([, value]) => readableValue(value))
    .map(([key, value]) => renderPromptBlock(promptDefinitions[key]?.label || key, key, readableValue(value)))
    .join("");
  if (promptBlocks) {
    sections.push(`<section class="inspector-section"><div class="inspector-section-heading"><h3 class="analysis-category-title">提示词</h3></div>${promptBlocks}</section>`);
  }
  const uncertainties = asArray(analysis.data.uncertainties).map(readableValue).filter(Boolean);
  if (uncertainties.length) {
    sections.push(`<section class="inspector-section"><div class="inspector-section-heading"><h3 class="analysis-category-title">不确定项</h3></div>${renderList(uncertainties, "evidence-list", "")}</section>`);
  }
  return sections.join("");
}

function renderLegacyAnalysis(analysis) {
  return `
    <section class="inspector-section">
      <div class="inspector-section-heading"><h3 class="analysis-category-title">视觉特征</h3></div>
      <p class="analysis-summary">${escapeHTML(analysis.description || "分析已完成。")}</p>
      ${visualDnaRows(analysis.visualDna, analysis.data)}
    </section>
    <section class="inspector-section">
      <div class="inspector-section-heading"><h3 class="analysis-category-title">色板</h3></div>
      ${renderPalette(analysis.palette)}
    </section>
    <section class="inspector-section">
      <div class="inspector-section-heading"><h3 class="analysis-category-title">为何有效</h3></div>
      ${renderList(analysis.whyItWorks, "evidence-list", "暂无设计判断。")}
    </section>
    <section class="inspector-section">
      <div class="inspector-section-heading"><h3 class="analysis-category-title">实现建议</h3></div>
      ${renderList(analysis.recipe, "recipe-list", "暂无实现建议。")}
    </section>
    <section class="inspector-section">
      <div class="inspector-section-heading"><h3 class="analysis-category-title">提示词</h3></div>
      ${renderPromptBlock("视觉提示词", "visual", analysis.prompts.visual)}
      ${renderPromptBlock("UI 实现说明", "implementation", analysis.prompts.implementation)}
      ${renderPromptBlock("设计令牌", "tokens", analysis.prompts.tokens)}
      ${renderPromptBlock("负面条件", "negative", analysis.prompts.negative)}
    </section>`;
}

function collectionContainsAsset(collection, asset) {
  if (asset.collectionIds.includes(collection.id)) return true;
  const ids = asArray(collection.assetIds || collection.asset_ids).map(String);
  if (ids.includes(asset.id)) return true;
  return asArray(collection.items).some(
    (item) => String(item?.assetId ?? item?.id ?? item) === asset.id,
  );
}

function renderCollectionControls(asset) {
  if (!state.collections.length) {
    return `
      <div class="collection-control">
        <p>尚未创建收藏集。</p>
        <button class="text-button" type="button" data-action="new-collection">新建收藏集</button>
      </div>`;
  }

  const memberships = state.collections.filter((collection) =>
    collectionContainsAsset(collection, asset),
  );
  return `
    <div class="collection-control">
      <label class="sr-only" for="inspector-collection-select">选择收藏集</label>
      <select id="inspector-collection-select">
        <option value="">选择收藏集…</option>
        ${state.collections
          .map(
            (collection) =>
              `<option value="${escapeHTML(collection.id)}">${escapeHTML(
                collection.name,
              )}</option>`,
          )
          .join("")}
      </select>
      <button class="button button--quiet" type="button" data-add-to-collection="${escapeHTML(
        asset.id,
      )}">加入</button>
    </div>
    ${
      memberships.length
        ? `<div class="metadata-actions">${memberships
            .map(
              (collection) => `
                <button
                  class="text-button"
                  type="button"
                  data-remove-collection="${escapeHTML(collection.id)}"
                  data-asset-id="${escapeHTML(asset.id)}"
                >移出 ${escapeHTML(collection.name)}</button>`,
            )
            .join("")}</div>`
        : ""
    }`;
}

function parseDisciplineTags(value) {
  const seen = new Set();
  return String(value || "")
    .split(/[,，\n]/u)
    .map((tag) => tag.trim())
    .filter((tag) => {
      const key = disciplineKey(tag);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function allDisciplineTags() {
  const labels = new Map();
  for (const item of state.tags) {
    const tag = String(item?.name || item || "").trim();
    const key = disciplineKey(tag);
    if (key && !labels.has(key)) labels.set(key, tag);
  }
  for (const asset of state.assets) {
    for (const tag of parseDisciplineTags(asset.discipline)) {
      const key = disciplineKey(tag);
      if (!labels.has(key)) labels.set(key, tag);
    }
  }
  return [...labels.values()].sort((a, b) => a.localeCompare(b, "zh-CN"));
}

function renderTagEditor(asset) {
  const tags = parseDisciplineTags(asset.discipline);
  const suggestions = allDisciplineTags();
  const currentKeys = new Set(tags.map(disciplineKey));
  const availableSuggestions = suggestions.filter(
    (tag) => !currentKeys.has(disciplineKey(tag)),
  );
  return `
    <div class="tag-editor" data-tag-editor>
      <div class="tag-list" data-tag-list>
        ${tags
          .map(
            (tag) => `
              <span class="tag-token" data-tag-token="${escapeHTML(tag)}" title="双击修改名称">
                <span data-tag-name>${escapeHTML(tag)}</span>
                <button type="button" data-remove-tag="${escapeHTML(tag)}" aria-label="移除标签 ${escapeHTML(tag)}">
                  <svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>
                </button>
              </span>`,
          )
          .join("")}
        <input class="tag-input" data-tag-input type="text" maxlength="40" placeholder="标签名称" aria-label="新标签名称" hidden />
        <button class="tag-add-button" type="button" data-add-tag aria-label="添加标签" title="添加标签">
          <svg class="icon" aria-hidden="true"><use href="#icon-plus"></use></svg>
        </button>
      </div>
      ${
        availableSuggestions.length
          ? `<details class="tag-suggestions">
              <summary>选择已有标签</summary>
              <div class="tag-suggestion-list">
                ${availableSuggestions
                  .map(
                    (tag) =>
                      `<button class="tag-suggestion" type="button" data-add-tag-suggestion="${escapeHTML(tag)}">${escapeHTML(tag)}</button>`,
                  )
                  .join("")}
              </div>
            </details>`
          : ""
      }
    </div>`;
}

function addTagToEditor(input) {
  const value = String(input?.value || "").trim();
  if (!value) return;
  const tags = parseDisciplineTags(value);
  const list = input.closest("[data-tag-list]");
  if (!list) return;
  const current = [...list.querySelectorAll("[data-remove-tag]")].map(
    (button) => button.dataset.removeTag,
  );
  for (const tag of tags) {
    if (current.some((item) => disciplineKey(item) === disciplineKey(tag))) continue;
    if (current.length >= 8) {
      notify("每个素材最多添加 8 个标签。", "error");
      break;
    }
    const token = document.createElement("span");
    token.className = "tag-token";
    token.dataset.tagToken = tag;
    token.title = "双击修改名称";
    token.innerHTML = `<span data-tag-name>${escapeHTML(tag)}</span><button type="button" data-remove-tag="${escapeHTML(tag)}" aria-label="移除标签 ${escapeHTML(tag)}"><svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg></button>`;
    list.insertBefore(token, input);
    current.push(tag);
  }
  input.value = "";
  input.hidden = true;
  input.closest("[data-tag-list]")?.classList.remove("is-adding");
}

function readTagEditor(form) {
  return [...form.querySelectorAll("[data-tag-token]")]
    .map((token) => token.dataset.tagToken)
    .filter(Boolean)
    .join(", ");
}

function editTagToken(token) {
  if (!token || token.classList.contains("is-editing")) return;
  const name = token.dataset.tagToken || "";
  const label = token.querySelector("[data-tag-name]");
  if (!label) return;
  token.classList.add("is-editing");
  const input = document.createElement("input");
  input.className = "tag-rename-input";
  input.maxLength = 40;
  input.value = name;
  label.replaceWith(input);
  input.focus();
  input.select();
  let finished = false;
  const finish = (save) => {
    if (finished) return;
    finished = true;
    let next = save ? input.value.trim() : name;
    const list = token.closest("[data-tag-list]");
    if (
      !next ||
      [...(list?.querySelectorAll("[data-tag-token]") || [])].some(
        (item) => item !== token && disciplineKey(item.dataset.tagToken) === disciplineKey(next),
      )
    ) {
      next = name;
    }
    token.dataset.tagToken = next;
    const remove = token.querySelector("[data-remove-tag]");
    if (remove) {
      remove.dataset.removeTag = next;
      remove.setAttribute("aria-label", `移除标签 ${next}`);
    }
    const span = document.createElement("span");
    span.dataset.tagName = "";
    span.textContent = next;
    input.replaceWith(span);
    token.classList.remove("is-editing");
  };
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finish(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      finish(false);
    }
  });
  input.addEventListener("blur", () => finish(true), { once: true });
}

function editManagedTag(button) {
  if (!button || button.classList.contains("is-editing")) return;
  const name = button.dataset.renameManagedTag || "";
  button.classList.add("is-editing");
  const input = document.createElement("input");
  input.className = "managed-tag-input";
  input.maxLength = 40;
  input.value = name;
  button.replaceChildren(input);
  input.focus();
  input.select();
  let finished = false;
  const finish = async (save) => {
    if (finished) return;
    finished = true;
    const next = input.value.trim();
    if (save && next && next !== name) {
      await renameManagedTag(name, next);
    } else {
      button.classList.remove("is-editing");
      button.innerHTML = `<span>${escapeHTML(name)}</span>`;
    }
  };
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      finish(true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      finish(false);
    }
  });
  input.addEventListener("blur", () => finish(true), { once: true });
}

function renderInspector() {
  const asset = assetById(state.selectedId);
  if (!asset) {
    elements.inspectorEmpty.hidden = false;
    elements.inspectorContent.hidden = true;
    elements.inspectorContent.innerHTML = "";
    document.body.classList.remove("is-inspector-open");
    elements.inspector.removeAttribute("role");
    elements.inspector.removeAttribute("aria-modal");
    elements.inspector.setAttribute("aria-label", "图片详细查看");
    updateAnalyzeControls();
    return;
  }

  const analysis = normalizedAnalysis(asset);
  const hasAnalysis =
    Boolean(analysis.description) ||
    Object.values(analysis.visualDna).some((value) => Boolean(readableValue(value))) ||
    analysis.palette.length > 0 ||
    analysis.whyItWorks.length > 0 ||
    analysis.recipe.length > 0 ||
    Object.values(analysis.prompts).some(Boolean);
  const imageUrl = safeMediaUrl(asset.mediaUrl);
  const dimensions =
    asset.width && asset.height ? `${asset.width} × ${asset.height}` : "—";
  const confidence =
    analysis.confidence === null
      ? "—"
      : `${Math.round(
          analysis.confidence <= 1
            ? analysis.confidence * 100
            : analysis.confidence,
        )}%`;
  const queueJob = state.jobs.find(
    (job) =>
      job.assetId === asset.id &&
      ["queued", "processing", "needs_setup"].includes(job.status),
  );
  const inQueue = Boolean(queueJob);

  elements.inspectorEmpty.hidden = true;
  elements.inspectorContent.hidden = false;
  document.body.classList.add("is-inspector-open");
  if (isMobileInspector()) {
    elements.inspector.setAttribute("role", "dialog");
    elements.inspector.setAttribute("aria-modal", "true");
    elements.inspector.setAttribute(
      "aria-label",
      `图片详细查看：${asset.title}`,
    );
  } else {
    elements.inspector.removeAttribute("role");
    elements.inspector.removeAttribute("aria-modal");
    elements.inspector.setAttribute("aria-label", "图片详细查看");
  }

  elements.inspectorContent.innerHTML = `
    <div class="inspector-top">
      <div class="inspector-title">
        <p>${escapeHTML(stateLabel(asset.status))}</p>
        <h2>${escapeHTML(asset.title)}</h2>
      </div>
      <div class="inspector-top-actions">
        ${
          asset.synthetic
            ? ""
            : `<button
                class="icon-button icon-button--danger"
                type="button"
                data-delete-asset="${escapeHTML(asset.id)}"
                aria-label="删除素材 ${escapeHTML(asset.title)}"
                title="删除素材"
              >
                <svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg>
              </button>`
        }
        <button class="icon-button" type="button" data-close-inspector aria-label="关闭详细查看" title="关闭">
          <svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>
        </button>
      </div>
    </div>

    ${
      asset.synthetic
        ? '<p class="synthetic-disclosure">合成界面研究：只在本地素材库为空时显示，不会保存、编辑或送交分析 Agent。</p>'
        : ""
    }

    <figure class="inspector-preview">
      ${
        imageUrl
          ? `<img src="${escapeHTML(imageUrl)}" alt="${escapeHTML(asset.title)}" />`
          : '<span class="queue-placeholder-thumb" aria-hidden="true"></span>'
      }
      <figcaption>
        <span>${escapeHTML(asset.fileName)}</span>
        <span>${escapeHTML(dimensions)} · ${escapeHTML(
          asset.mimeType || "格式未记录",
        )}</span>
      </figcaption>
    </figure>

    ${
      !asset.synthetic
        ? `
      <div class="inspector-actions">
        ${
          inQueue
            ? `<button
                class="button button--quiet"
                type="button"
                data-cancel-job="${escapeHTML(queueJob.id)}"
              >${queueJob.status === "needs_setup" ? "移出队列" : "取消分析"}</button>`
            : `<button
                class="button button--primary"
                type="button"
                data-analyze-id="${escapeHTML(asset.id)}"
              >开始分析</button>`
        }
        ${
          hasAnalysis
            ? `<span>${escapeHTML(analysis.provider || "Codex")} · ${escapeHTML(analysisRuleName(analysis.ruleId, analysis.ruleVersion))} · 信心度 ${escapeHTML(confidence)}</span>`
            : ""
        }
      </div>`
        : ""
    }

    <section class="inspector-section inspector-analysis-heading${hasAnalysis ? "" : " inspector-analysis-empty"}">
      <div class="inspector-section-heading">
        <h3>AI 分析</h3>
        <div class="analysis-heading-actions">
          ${hasAnalysis ? '<span class="analysis-status">已完成</span>' : ""}
          ${
            hasAnalysis && !asset.synthetic
              ? `<button class="icon-button analysis-edit-button" type="button" data-edit-analysis="${escapeHTML(asset.id)}" aria-label="编辑 AI 分析" title="编辑 AI 分析"><svg class="icon" aria-hidden="true"><use href="#icon-edit"></use></svg></button>`
              : ""
          }
        </div>
      </div>
      ${
        hasAnalysis
          ? ""
          : `<div class="analysis-empty-state" aria-label="尚未分析">
              <svg class="icon" aria-hidden="true"><use href="#icon-analysis"></use></svg>
              <span>尚未分析</span>
            </div>`
      }
    </section>

    ${
      hasAnalysis
        ? analysis.isV2
          ? renderDynamicAnalysis(analysis)
          : renderLegacyAnalysis(analysis)
        : ""
    }

    <section class="inspector-section">
      <div class="inspector-section-heading">
        <h3>来源信息</h3>
      </div>
      <dl class="provenance-list">
        <div><dt>文件</dt><dd>${escapeHTML(asset.relativePath || "—")}</dd></div>
        <div><dt>文件大小</dt><dd>${escapeHTML(formatBytes(asset.fileSize))}</dd></div>
        ${
          hasAnalysis
            ? `<div><dt>分析模型</dt><dd>${escapeHTML(analysis.model || "—")}</dd></div>
               <div><dt>分析规则</dt><dd>${escapeHTML(analysisRuleName(analysis.ruleId, analysis.ruleVersion))}</dd></div>
               <div><dt>分析时间</dt><dd>${escapeHTML(formatDate(analysis.analyzedAt))}</dd></div>`
            : ""
        }
      </dl>
    </section>

    ${
      asset.synthetic
        ? ""
        : `
      <section class="inspector-section">
        <div class="inspector-section-heading">
          <h3>收藏集</h3>
        </div>
        ${renderCollectionControls(asset)}
      </section>

      <section class="inspector-section">
        <div class="inspector-section-heading">
          <h3>素材信息</h3>
        </div>
        <form class="metadata-form" data-metadata-form="${escapeHTML(asset.id)}">
          <label class="field">
            <span>标题</span>
            <input name="title" maxlength="180" value="${escapeHTML(asset.title)}" />
          </label>
          <div class="field">
            <span>领域标签</span>
            ${renderTagEditor(asset)}
          </div>
          <label class="field">
            <span>来源 URL</span>
            <input name="sourceUrl" type="url" value="${escapeHTML(asset.sourceUrl)}" placeholder="https://" />
          </label>
          <label class="field">
            <span>权利备注</span>
            <textarea name="rightsNote" placeholder="授权、作者、用途限制…">${escapeHTML(
              asset.rightsNote,
            )}</textarea>
          </label>
          <label class="field">
            <span>人工笔记</span>
            <textarea name="notes" placeholder="可重用的版面或实现观察…">${escapeHTML(
              asset.notes,
            )}</textarea>
          </label>
          <div class="metadata-actions">
            <button class="button button--primary" type="submit">保存信息</button>
          </div>
        </form>
      </section>`
    }`;

  updateAnalyzeControls();
}

function currentAnalyzeIds() {
  const batch = [...state.selectedIds].filter((id) => !assetById(id)?.synthetic);
  if (batch.length) return batch;
  const current = assetById(state.selectedId);
  return current && !current.synthetic ? [current.id] : [];
}

function updateAnalyzeControls() {
  const ids = currentAnalyzeIds();
  const analysisAvailable = state.analysisRules.source.analysisAvailable
    && Boolean(selectedAnalysisRule());
  elements.recognizeButton.disabled = ids.length === 0 || !analysisAvailable;
  elements.recognizeButton.title =
    !analysisAvailable
      ? "官方规则不可用；同步官方规则或选择有效的本机自定义规则后再分析"
      : ids.length > 0
      ? `开始分析 ${ids.length} 张素材`
      : "请先选取一张真实图片";
  document.querySelectorAll("[data-analyze-id]").forEach((button) => {
    button.disabled = !analysisAvailable;
    button.title = analysisAvailable ? "开始分析" : elements.recognizeButton.title;
  });
}

function renderBatchBar() {
  const count = state.selectedIds.size;
  elements.batchBar.hidden = count === 0;
  elements.batchCount.textContent = `已选 ${formatNumber(count)} 张`;
  const previousCollectionId = elements.batchCollectionSelect.value;
  elements.batchCollectionSelect.innerHTML = [
    '<option value="">选择收藏集</option>',
    ...state.collections.map(
      (collection) =>
        `<option value="${escapeHTML(collection.id)}">${escapeHTML(collection.name)}</option>`,
    ),
  ].join("");
  if (state.collections.some((collection) => collection.id === previousCollectionId)) {
    elements.batchCollectionSelect.value = previousCollectionId;
  }
  elements.batchAddCollectionButton.disabled = count === 0 || !state.collections.length;
  elements.batchDeleteButton.disabled = count === 0;
  elements.batchRemoveCollectionButton.hidden = !state.activeCollectionId;
  elements.batchRemoveCollectionButton.disabled = count === 0;
  updateAnalyzeControls();
}

function jobAsset(job) {
  return assetById(job.assetId);
}

function jobProgress(job) {
  if (job.progress === null) return null;
  const value = job.progress <= 1 ? job.progress * 100 : job.progress;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function stopQueueWaitMessage() {
  if (state.queueWaitMessageTimer !== null) {
    window.clearInterval(state.queueWaitMessageTimer);
    state.queueWaitMessageTimer = null;
  }
  elements.queueWaitMessage.hidden = true;
  elements.queueWaitMessage.textContent = "";
  elements.queueWaitMessage.removeAttribute("title");
  state.queueWaitMessageIndex = -1;
}

function nextQueueWaitMessageIndex(currentIndex) {
  const messageCount = QUEUE_WAIT_MESSAGES.length;
  if (messageCount < 2) return messageCount - 1;
  if (currentIndex < 0 || currentIndex >= messageCount) {
    return Math.floor(Math.random() * messageCount);
  }
  const offset = 1 + Math.floor(Math.random() * (messageCount - 1));
  return (currentIndex + offset) % messageCount;
}

function renderQueueWaitMessage(activeCount) {
  if (!activeCount || !QUEUE_WAIT_MESSAGES.length) {
    stopQueueWaitMessage();
    return;
  }

  const showCurrentMessage = () => {
    const message = QUEUE_WAIT_MESSAGES[state.queueWaitMessageIndex];
    elements.queueWaitMessage.textContent = message;
    elements.queueWaitMessage.title = message;
    elements.queueWaitMessage.hidden = false;
  };

  if (state.queueWaitMessageTimer !== null) return;

  state.queueWaitMessageIndex = nextQueueWaitMessageIndex(-1);
  showCurrentMessage();

  state.queueWaitMessageTimer = window.setInterval(() => {
    if (!activeJobs().length) {
      stopQueueWaitMessage();
      return;
    }
    state.queueWaitMessageIndex = nextQueueWaitMessageIndex(
      state.queueWaitMessageIndex,
    );
    showCurrentMessage();
  }, 6000);
}

function renderQueue() {
  const jobs = [...state.jobs].sort((a, b) => {
    const rank = (job) =>
      statusIsActive(job.status) ? 0 : statusNeedsAttention(job.status) ? 1 : 2;
    return rank(a) - rank(b);
  });
  const active = activeJobs();
  const needsSetup = jobs.some((job) => job.status === "needs_setup");
  const hasJobs = jobs.length > 0;

  elements.queueActiveCount.hidden = !active.length;
  elements.queueActiveCount.textContent = String(active.length);
  elements.queueSummaryText.textContent = active.length
    ? "个任务"
    : hasJobs
      ? `${jobs.length} 项待处理`
      : "无任务";
  renderQueueWaitMessage(active.length);
  elements.retryNeedsSetupButton.hidden = !needsSetup;
  elements.queueToggle.disabled = false;
  elements.queueToggle.title = state.queueExpanded ? "收起分析队列" : "展开分析队列";
  elements.queueToggle.setAttribute("aria-expanded", String(state.queueExpanded));
  elements.app.classList.toggle("is-queue-expanded", state.queueExpanded);
  elements.app.classList.toggle("is-queue-empty", !hasJobs);
  elements.queueBar.classList.toggle("is-empty", !hasJobs);

  if (!hasJobs) {
    elements.queueTrack.innerHTML = state.queueExpanded
      ? '<p class="queue-empty">暂无分析任务</p>'
      : "";
    renderCounts();
    return;
  }

  elements.queueTrack.innerHTML = jobs
    .map((job) => {
      const asset = jobAsset(job);
      const progress = jobProgress(job);
      const indeterminate =
        statusIsActive(job.status) && (progress === null || progress === 0);
      const providerName = agentName(job.provider);
      const ruleLabel = analysisRuleName(job.ruleId, job.ruleVersion);
      const stage =
        job.stage ||
        (job.status === "processing"
          ? `${providerName} 正在分析`
          : job.status === "queued"
            ? `等待 ${providerName}`
            : stateLabel(job.status));
      const imageUrl = safeMediaUrl(asset?.mediaUrl);
      const cancelLabel = statusIsActive(job.status) ? "取消分析" : "移出队列";
      return `
        <article class="queue-job" data-status="${escapeHTML(job.status)}">
          ${
            imageUrl
              ? `<img src="${escapeHTML(imageUrl)}" alt="" loading="lazy" />`
              : '<span class="queue-placeholder-thumb" aria-hidden="true"></span>'
          }
          <div class="queue-job-info">
            <strong>${escapeHTML(asset?.title || `图片 ${job.assetId || "—"}`)}</strong>
            <div class="job-meta">
              <span title="${escapeHTML(ruleLabel)}">${escapeHTML(stage)} · ${escapeHTML(ruleLabel)}</span>
              <span>${progress === null ? "" : `${progress}%`}</span>
            </div>
            <div class="job-progress ${indeterminate ? "is-indeterminate" : ""}" aria-label="${escapeHTML(
              stage,
            )}">
              <span style="--progress:${progress === null ? 28 : progress}%"></span>
            </div>
            ${
              job.error
                ? `<p class="job-error">${escapeHTML(job.error)}</p>`
                : ""
            }
          </div>
          <button
            class="icon-button queue-job-cancel"
            type="button"
            data-cancel-job="${escapeHTML(job.id)}"
            aria-label="${cancelLabel}：${escapeHTML(asset?.title || `图片 ${job.assetId || "—"}`)}"
            title="${cancelLabel}"
          >
            <svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg>
          </button>
        </article>`;
    })
    .join("");

  renderCounts();
}

function jobsSignature(jobs) {
  return jobs
    .map((job) => [job.id, job.status, job.error, job.updatedAt].join(":"))
    .sort()
    .join("|");
}

function selectedAgentId() {
  return String(
    state.settings.selectedAgentId || state.settings.provider || "codex",
  );
}

function agentProfileById(id) {
  return state.agents.find((agent) => String(agent.id) === String(id)) || null;
}

function agentTypeLabel(agent) {
  if (agent.type === "openai") return "API";
  if (agent.adapter === "codex") return "Codex CLI";
  if (agent.adapter === "workbuddy") return "WorkBuddy CLI";
  return "本地 CLI";
}

function agentName(id) {
  return agentProfileById(id)?.name || "Agent";
}

function agentVisual(agent) {
  const normalized = `${agent.id} ${agent.name} ${agent.adapter}`.toLowerCase();
  const logoId = normalized.includes("workbuddy")
    ? "workbuddy"
    : normalized.includes("claude")
      ? "claude"
      : normalized.includes("codex") || normalized.includes("openai")
        ? "codex"
        : "";
  return logoId
    ? agentLogoMarkup(logoId)
    : '<span class="agent-generic-mark" aria-hidden="true"><svg class="icon"><use href="#icon-analysis"></use></svg></span>';
}

function renderAgentManager() {
  const activeId = selectedAgentId();
  const activeReady = codexReadiness();
  elements.agentProfileList.innerHTML = state.agents.length
    ? state.agents.map((agent) => {
        const active = String(agent.id) === activeId;
        const testResult = state.agentTestResults[agent.id];
        const destination = agent.type === "openai"
          ? `${agent.endpoint} · ${agent.model}`
          : agent.command;
        const ready = typeof testResult?.ready === "boolean"
          ? testResult.ready
          : active
            ? activeReady
            : null;
        const status = testResult
          ? testResult.ready
            ? "连接正常"
            : testResult.message || "连接不可用"
          : active
          ? ready === true
            ? "已启用 · 已就绪"
            : ready === false
              ? "已启用 · 需设置"
              : "已启用"
          : agent.hasApiKey
            ? "API Key 已保存"
            : agentTypeLabel(agent);
        return `
          <article class="agent-profile-row ${active ? "is-active" : ""} ${ready === true ? "is-ready" : ready === false ? "needs-setup" : ""}" data-agent-id="${escapeHTML(agent.id)}">
            <label class="agent-profile-choice">
              <input type="radio" name="active-agent" value="${escapeHTML(agent.id)}" data-select-agent ${active ? "checked" : ""} />
              ${agentVisual(agent)}
              <span class="agent-profile-copy">
                <strong>${escapeHTML(agent.name)}</strong>
                <span>${escapeHTML(destination || agentTypeLabel(agent))}</span>
              </span>
              <span class="agent-profile-status">${escapeHTML(status)}</span>
            </label>
            <div class="agent-profile-actions">
              <button class="icon-button" type="button" data-test-agent="${escapeHTML(agent.id)}" aria-label="测试 ${escapeHTML(agent.name)}" title="测试连接">
                <svg class="icon" aria-hidden="true"><use href="#icon-refresh"></use></svg>
              </button>
              <button class="icon-button" type="button" data-edit-agent="${escapeHTML(agent.id)}" aria-label="编辑 ${escapeHTML(agent.name)}" title="编辑 Agent">
                <svg class="icon" aria-hidden="true"><use href="#icon-edit"></use></svg>
              </button>
              ${agent.builtIn ? "" : `
                <button class="icon-button" type="button" data-delete-agent="${escapeHTML(agent.id)}" aria-label="删除 ${escapeHTML(agent.name)}" title="删除 Agent">
                  <svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg>
                </button>`}
            </div>
          </article>`;
      }).join("")
    : '<p class="agent-manager-empty">尚未配置 Agent。</p>';

  const scanVisible = Array.isArray(state.agentScanResults);
  elements.agentScanResults.hidden = !scanVisible;
  if (scanVisible) {
    elements.agentScanResults.innerHTML = `
      <div class="agent-scan-heading"><strong>扫描结果</strong><button class="icon-button" type="button" data-close-agent-scan aria-label="关闭扫描结果"><svg class="icon" aria-hidden="true"><use href="#icon-close"></use></svg></button></div>
      ${state.agentScanResults.length
        ? state.agentScanResults.map((candidate, index) => `
            <div class="agent-scan-row">
              <span><strong>${escapeHTML(candidate.name)}</strong><small>${escapeHTML(candidate.command)}</small></span>
              <button class="agent-scan-action" type="button" data-bind-scanned-agent="${index}" ${candidate.bound ? "disabled" : ""}>
                <svg class="icon" aria-hidden="true"><use href="#${candidate.builtInId ? "icon-refresh" : "icon-plus"}"></use></svg>
                <span>${candidate.bound ? "已绑定" : candidate.builtInId ? "更新路径" : "绑定"}</span>
              </button>
            </div>`).join("")
        : '<p class="agent-manager-empty">未发现支持的本地 Agent。</p>'}
    `;
  }
}

function renderAgentFormMode() {
  const apiMode = elements.agentFormType.value === "openai";
  elements.agentCliFields.hidden = apiMode;
  elements.agentApiFields.hidden = !apiMode;
  elements.agentApiKeyField.hidden = !apiMode || elements.agentAuthMode.value === "none";
  const form = elements.agentForm.elements;
  form.command.required = !apiMode;
  form.endpoint.required = apiMode;
  form.apiModel.required = apiMode;
}

function openAgentDialog(agent = null, candidate = null) {
  state.editingAgentId = agent?.id || null;
  elements.agentForm.reset();
  elements.agentDialogTitle.textContent = agent ? "编辑 Agent" : "添加 Agent";
  const form = elements.agentForm.elements;
  form.id.value = agent?.id || "";
  form.name.value = agent?.name || candidate?.name || "";
  form.type.value = agent?.type === "openai" ? "openai" : "cli";
  form.type.disabled = Boolean(agent?.builtIn);
  form.command.value = agent?.command || candidate?.command || "";
  form.argsTemplate.value = agent?.argsTemplate || "";
  form.cliModel.value = agent?.type === "openai" ? "" : agent?.model || "";
  form.endpoint.value = agent?.endpoint || "";
  form.apiModel.value = agent?.type === "openai" ? agent?.model || "" : "";
  form.authMode.value = agent?.authMode || "api-key";
  form.apiKey.value = "";
  form.apiKey.placeholder = agent?.hasApiKey
    ? "API Key 已保存，留空不会修改"
    : "输入 API Key";
  form.structuredOutput.checked = agent?.structuredOutput !== false;
  renderAgentFormMode();
  showDialog(elements.agentDialog);
  requestAnimationFrame(() => form.name.focus());
}

async function refreshAgents() {
  const result = await api("/api/agents");
  state.agents = listFrom(result, ["items", "agents", "data"]);
  if (result?.selectedId) state.settings.selectedAgentId = String(result.selectedId);
  renderAgentManager();
}

async function scanAgents(button = elements.scanAgentsButton, { silent = false } = {}) {
  const restore = beginPendingButtons([button], "扫描中…");
  try {
    const result = await api("/api/agents/scan", {
      method: "POST",
      body: JSON.stringify({}),
    });
    state.agentScanResults = listFrom(result, ["items", "agents", "data"]);
    state.agentScanPerformed = true;
    renderAgentManager();
    if (!silent) {
      notify(`扫描完成，发现 ${formatNumber(state.agentScanResults.length)} 个本地 Agent。`);
    }
  } catch (error) {
    notify(`无法扫描本机 Agent：${error.message}`, "error");
  } finally {
    restore();
  }
}

async function selectAgent(id) {
  const profile = agentProfileById(id);
  if (!profile || id === selectedAgentId()) return;
  try {
    const result = await api(`/api/agents/${encodeURIComponent(id)}/select`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    state.agents = listFrom(result, ["items", "agents", "data"]);
    state.settings.selectedAgentId = String(result.selectedId || id);
    state.provider = result.provider || null;
    renderProviderState();
    renderSettings();
    notify(`已切换到 ${profile.name}。`);
  } catch (error) {
    renderAgentManager();
    notify(`无法切换 Agent：${error.message}`, "error");
  }
}

async function testAgent(id, button) {
  const profile = agentProfileById(id);
  if (!profile) return;
  const restore = beginPendingButtons([button], "");
  try {
    const result = await api(`/api/agents/${encodeURIComponent(id)}/test`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    state.agentTestResults[id] = result;
    if (id === selectedAgentId()) state.provider = result;
    renderProviderState();
    renderSettings();
    notify(result.message || `${profile.name} 连接状态已更新。`, result.ready ? "info" : "error");
  } catch (error) {
    state.agentTestResults[id] = { ready: false, message: error.message };
    renderAgentManager();
    notify(`连接测试失败：${error.message}`, "error");
  } finally {
    restore();
  }
}

async function removeAgent(id) {
  const profile = agentProfileById(id);
  if (!profile || profile.builtIn) return;
  if (!window.confirm(`删除 Agent「${profile.name}」？已保存的 API Key 也会从钥匙串移除。`)) return;
  try {
    await api(`/api/agents/${encodeURIComponent(id)}`, { method: "DELETE" });
    delete state.agentTestResults[id];
    await Promise.all([refreshAgents(), refreshProvider()]);
    notify(`已删除 ${profile.name}。`);
  } catch (error) {
    notify(`无法删除 Agent：${error.message}`, "error");
  }
}

async function bindScannedAgent(index) {
  const candidate = state.agentScanResults?.[index];
  if (!candidate || candidate.bound) return;
  const builtIn = candidate.builtInId
    ? agentProfileById(candidate.builtInId)
    : null;
  if (builtIn) {
    try {
      await api(`/api/agents/${encodeURIComponent(builtIn.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ command: candidate.command }),
      });
      await refreshAgents();
      candidate.configuredId = builtIn.id;
      renderAgentManager();
      notify(`已绑定 ${builtIn.name}。`);
    } catch (error) {
      notify(`无法绑定 Agent：${error.message}`, "error");
    }
    return;
  }
  openAgentDialog(null, candidate);
}

function renderAnalysisRulePicker() {
  const rules = state.analysisRules.items.filter((rule) => rule.enabled !== false);
  const groups = [
    ["official", "官方规则"],
    ["custom", "本地自定义"],
  ];
  elements.analysisRuleSelect.innerHTML = groups
    .map(([source, label]) => {
      const options = rules.filter((rule) =>
        source === "official" ? rule.source !== "custom" : rule.source === "custom",
      );
      if (!options.length) return "";
      return `<optgroup label="${label}">${options
        .map(
          (rule) =>
            `<option value="${escapeHTML(rule.id)}">${escapeHTML(rule.name)} · v${escapeHTML(rule.version)}</option>`,
        )
        .join("")}</optgroup>`;
    })
    .join("") || '<option value="">官方规则不可用</option>';
  elements.analysisRuleSelect.value = state.analysisRules.selectedId;
  elements.analysisRuleSelect.disabled = rules.length === 0;
  const selected = selectedAnalysisRule();
  elements.analysisRuleSelect.title = selected
    ? `分析规则：${selected.name} · v${selected.version}`
    : "官方规则不可用";
}

function analysisRuleSourceLabel(source) {
  return source === "custom" ? "仅本机" : "官方";
}

function analysisRuleContractSummary(rule) {
  const contract = asObject(rule.contract);
  const moduleLabel = (id) => moduleDefinition(id, rule).label || id;
  const required = asArray(contract.requiredModules).map(moduleLabel).filter(Boolean);
  const optional = asArray(contract.optionalModules).map(moduleLabel).filter(Boolean);
  return [
    required.length ? `核心：${required.join("、")}` : "",
    optional.length ? `按图可选：${optional.join("、")}` : "",
  ].filter(Boolean).join("；");
}

function renderAnalysisRuleManager() {
  const historyIds = new Set(state.analysisRules.history.map((entry) => String(entry?.id || "")));
  elements.analysisRuleList.innerHTML = state.analysisRules.items
    .map((rule) => {
      const active = rule.id === state.analysisRules.selectedId;
      return `<div class="analysis-rule-row ${active ? "is-active" : ""}">
        <button class="analysis-rule-choice" type="button" data-select-analysis-rule="${escapeHTML(rule.id)}" aria-pressed="${String(active)}">
          <span class="analysis-rule-radio" aria-hidden="true"></span>
          <span class="analysis-rule-copy">
            <span class="analysis-rule-title"><strong>${escapeHTML(rule.name)}</strong><small>${escapeHTML(analysisRuleSourceLabel(rule.source))}</small></span>
            <span>${escapeHTML(rule.description || "未填写用途说明")}</span>
            <span>${escapeHTML(analysisRuleContractSummary(rule))}</span>
          </span>
          <span class="analysis-rule-version">v${escapeHTML(rule.version)}</span>
        </button>
        <div class="analysis-rule-actions">
          ${rule.source === "custom" ? `<button class="icon-button" type="button" data-edit-analysis-rule="${escapeHTML(rule.id)}" title="编辑规则" aria-label="编辑 ${escapeHTML(rule.name)}"><svg class="icon" aria-hidden="true"><use href="#icon-edit"></use></svg></button><button class="icon-button icon-button--danger" type="button" data-delete-analysis-rule="${escapeHTML(rule.id)}" title="删除规则" aria-label="删除 ${escapeHTML(rule.name)}"><svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg></button>` : ""}
          ${rule.source === "cloud" && historyIds.has(rule.id) ? `<button class="icon-button" type="button" data-rollback-analysis-rule="${escapeHTML(rule.id)}" title="回退到上一版本" aria-label="回退 ${escapeHTML(rule.name)}"><svg class="icon" aria-hidden="true"><use href="#icon-restore"></use></svg></button>` : ""}
        </div>
      </div>`;
    })
    .join("") || '<div class="agent-manager-empty">当前没有可用的分析规则。素材管理与历史数据不受影响。</div>';

  const source = state.analysisRules.source;
  const officialRules = state.analysisRules.items.filter(
    (rule) => rule.source !== "custom" && rule.enabled !== false,
  );
  elements.addAnalysisRuleButton.disabled = officialRules.length === 0;
  elements.syncAnalysisRules.disabled = !source.available;
  if (!source.officialAvailable) {
    elements.analysisRuleSourceStatus.textContent = `官方规则不可用：${source.unavailableReason || "请重新同步官方规则。"}`;
    elements.analysisRuleSourceStatus.className = "analysis-rule-source-status is-error";
  } else if (source.lastError) {
    elements.analysisRuleSourceStatus.textContent = `上次检查失败：${source.lastError}`;
    elements.analysisRuleSourceStatus.className = "analysis-rule-source-status is-error";
  } else if (source.lastCheckedAt) {
    elements.analysisRuleSourceStatus.textContent = `上次检查：${formatDate(source.lastCheckedAt)}`;
    elements.analysisRuleSourceStatus.className = "analysis-rule-source-status is-success";
  } else {
    elements.analysisRuleSourceStatus.textContent = source.available
      ? "启动后会自动检查；当前也可手动检查。"
      : "当前使用随软件提供的官方规则。";
    elements.analysisRuleSourceStatus.className = "analysis-rule-source-status";
  }
  elements.syncAnalysisRules.title = elements.analysisRuleSourceStatus.textContent;
}

function openAnalysisRuleDialog(rule = null) {
  state.editingAnalysisRuleId = rule?.id || null;
  elements.analysisRuleForm.reset();
  elements.analysisRuleDialogTitle.textContent = rule ? "编辑自定义规则" : "新建自定义规则";
  const form = elements.analysisRuleForm.elements;
  const officialRules = state.analysisRules.items.filter((item) => item.source !== "custom" && item.enabled !== false);
  form.baseRuleId.innerHTML = officialRules.map((item) => `<option value="${escapeHTML(item.id)}">${escapeHTML(item.name)} · v${escapeHTML(item.version)}</option>`).join("");
  form.baseRuleId.value = rule?.baseRuleId || state.analysisRules.selectedId || officialRules[0]?.id || "";
  if (!officialRules.some((item) => item.id === form.baseRuleId.value)) form.baseRuleId.value = officialRules[0]?.id || "";
  form.baseRuleId.disabled = Boolean(rule);
  form.id.value = rule?.id || "";
  form.name.value = rule?.name || "";
  form.description.value = rule?.description || "";
  form.prompt.value = rule?.prompt || "";
  showDialog(elements.analysisRuleDialog);
  requestAnimationFrame(() => form.name.focus());
}

async function selectAnalysisRule(id) {
  if (id === state.analysisRules.selectedId) return;
  try {
    const payload = await api(`/api/analysis-rules/${encodeURIComponent(id)}/select`, {
      method: "POST",
      body: "{}",
    });
    applyAnalysisRulesPayload(payload);
    notify(`后续分析将使用「${analysisRuleById(id)?.name || id}」。`);
  } catch (error) {
    renderAnalysisRulePicker();
    renderAnalysisRuleManager();
    notify(`无法切换分析规则：${error.message}`, "error");
  }
}

async function syncAnalysisRules(button = elements.syncAnalysisRules, { silent = false } = {}) {
  const restore = beginPendingButtons([button], "检查中…");
  try {
    const payload = await api("/api/analysis-rules/sync", { method: "POST", body: "{}" });
    applyAnalysisRulesPayload(payload);
    if (!silent) notify(`官方规则已更新，共 ${payload.items.filter((rule) => rule.source !== "custom").length} 条可用。`);
  } catch (error) {
    try {
      applyAnalysisRulesPayload(await api("/api/analysis-rules"));
    } catch {
      // Keep the last locally cached rules when status refresh also fails.
    }
    if (!silent) notify(`无法检查官方规则更新：${error.message}`, "error");
  } finally {
    restore();
  }
}

async function maybeAutoUpdateAnalysisRules() {
  if (state.analysisRulesAutoUpdateStarted) return;
  state.analysisRulesAutoUpdateStarted = true;
  const check = async () => {
    const source = state.analysisRules.source;
    if (!source.available) return;
    const lastChecked = new Date(source.lastCheckedAt || 0).getTime();
    if (Number.isFinite(lastChecked) && Date.now() - lastChecked < 24 * 60 * 60 * 1000) return;
    await syncAnalysisRules(elements.syncAnalysisRules, { silent: true });
  };
  await check();
  state.analysisRulesAutoUpdateTimer = window.setInterval(check, 60 * 60 * 1000);
}

async function removeAnalysisRule(id) {
  const rule = analysisRuleById(id);
  if (!rule || rule.source !== "custom") return;
  const confirmed = await confirmAction({
    title: "删除分析规则",
    message: `删除本机规则「${rule.name}」？已经完成的分析记录不会受影响。`,
    confirmLabel: "删除规则",
  });
  if (!confirmed) return;
  try {
    applyAnalysisRulesPayload(await api(`/api/analysis-rules/${encodeURIComponent(id)}`, { method: "DELETE" }));
    notify(`已删除「${rule.name}」。`);
  } catch (error) {
    notify(`无法删除分析规则：${error.message}`, "error");
  }
}

async function rollbackAnalysisRule(id, button) {
  const restore = beginPendingButtons([button], "");
  try {
    const payload = await api(`/api/analysis-rules/${encodeURIComponent(id)}/rollback`, {
      method: "POST",
      body: "{}",
    });
    applyAnalysisRulesPayload(payload);
    notify(`「${analysisRuleById(id)?.name || id}」已回退到上一版本。`);
  } catch (error) {
    notify(`无法回退分析规则：${error.message}`, "error");
  } finally {
    restore();
  }
}

function renderSettings() {
  const provider = providerObject() || {};
  elements.settingInboxPath.textContent =
    state.paths.inbox || state.paths.inboxDirectory || "由本地服务管理";
  renderAgentManager();
  renderAnalysisRuleManager();
  renderProviderDetails(provider);
  renderAppUpdate();
  renderLicense();
}

function renderLicense() {
  const license = state.license || {};
  const usage = Math.max(0, Number(license.usage) || 0);
  const limit = Math.max(1, Number(license.limit) || 20);
  const unlimited = license.unlimited === true;
  elements.licenseTitle.textContent = unlimited ? "永久版 · 无限量" : "免费版";
  elements.licenseBadge.textContent = unlimited
    ? "已激活"
    : `${formatNumber(Math.max(0, Number(license.remaining) || 0))} 张可用`;
  elements.licenseBadge.classList.toggle("is-active", unlimited);
  elements.licenseUsage.hidden = unlimited;
  elements.licenseUsage.max = limit;
  elements.licenseUsage.value = Math.min(usage, limit);
  elements.licenseStatus.textContent = unlimited
    ? `许可证 ${license.licenseId || "已验证"} · 当前 ${formatNumber(usage)} 张图片`
    : license.overLimit
      ? `当前已有 ${formatNumber(usage)} 张图片；现有内容不受影响，激活前不能继续新增。`
      : `已使用 ${formatNumber(usage)} / ${formatNumber(limit)} 张图片`;
  elements.licenseKeyInput.placeholder = unlimited
    ? "粘贴新的激活码以更换"
    : "粘贴购买的激活码";
  elements.activateLicenseButton.textContent = unlimited ? "更换激活码" : "激活永久版";
  if (!elements.licenseMessage.classList.contains("is-error")) {
    elements.licenseMessage.textContent = unlimited
      ? `签发于 ${formatDate(license.issuedAt)}，离线验证有效。`
      : "购买后粘贴激活码，即可解除图片数量限制。";
  }
}

async function activateLicense() {
  const licenseKey = elements.licenseKeyInput.value.trim();
  elements.licenseMessage.classList.remove("is-error");
  if (!licenseKey) {
    elements.licenseMessage.textContent = "请先粘贴激活码。";
    elements.licenseMessage.classList.add("is-error");
    elements.licenseKeyInput.focus();
    return;
  }
  const restore = beginPendingButtons([elements.activateLicenseButton], "验证中…");
  try {
    state.license = await api("/api/license/activate", {
      method: "POST",
      body: JSON.stringify({ licenseKey }),
    });
    elements.licenseKeyInput.value = "";
    elements.licenseMessage.textContent = "激活成功，图片数量限制已解除。";
    await loadBootstrap({ preserveSelection: true });
    renderLicense();
    notify("style atlas 永久版已激活，图片数量不限。", "success");
  } catch (error) {
    elements.licenseMessage.textContent = error.message;
    elements.licenseMessage.classList.add("is-error");
    notify(`激活失败：${error.message}`, "error");
  } finally {
    restore();
    renderLicense();
  }
}

function renderAppUpdate() {
  const update = state.appUpdate || {};
  if (update.error) {
    elements.appUpdateStatus.textContent = `检查失败：${update.error}`;
  } else if (!update.configured) {
    elements.appUpdateStatus.textContent = `当前版本 ${update.currentVersion || "1.0.0"}，暂无更新服务`;
  } else if (update.updateAvailable) {
    elements.appUpdateStatus.textContent = `发现新版本 ${update.version}`;
  } else {
    elements.appUpdateStatus.textContent = `当前已是最新版本 ${update.currentVersion || "1.0.0"}`;
  }
  elements.downloadAppUpdate.hidden = !update.updateAvailable || !update.downloadUrl;
  if (update.downloadUrl) elements.downloadAppUpdate.href = update.downloadUrl;
}

async function refreshAppUpdate(button = elements.checkAppUpdateButton, { silent = false } = {}) {
  const restore = beginPendingButtons([button], "检查中…");
  try {
    state.appUpdate = await api("/api/app-update");
    renderAppUpdate();
    if (!silent) notify(state.appUpdate.updateAvailable ? `发现 style atlas ${state.appUpdate.version}。` : "当前已是最新版本。");
  } catch (error) {
    state.appUpdate = { ...state.appUpdate, error: error.message };
    renderAppUpdate();
    if (!silent) notify(`无法检查软件更新：${error.message}`, "error");
  } finally {
    restore();
  }
}

function renderProviderDetails(provider = providerObject() || {}) {
  const ready = codexReadiness();
  elements.codexReadiness.textContent =
    ready === true
      ? `已就绪${provider.version ? ` · ${provider.version}` : ""}`
      : ready === false
        ? provider.message || "未就绪 · 请确认 Codex CLI 已安装并登录"
        : "状态未知";
  elements.codexReadiness.classList.toggle("is-ready", ready === true);
  elements.codexReadiness.classList.toggle("needs-setup", ready === false);
  elements.codexExecutionMode.textContent =
    provider.execution ||
    provider.executionMode ||
    (state.settings.executionMode === "codex-agent"
      ? "本地 Codex Agent"
      : state.settings.executionMode) ||
    "本地 Codex Agent";
}

async function refreshAssets({ selectId = null } = {}) {
  const params = new URLSearchParams({
    limit: "200",
    sort: state.sort,
  });
  if (state.query) params.set("query", state.query);
  if (state.status) params.set("status", state.status);
  if (state.activeCollectionId) {
    params.set("collectionId", state.activeCollectionId);
  }

  const result = await api(`/api/assets?${params.toString()}`);
  state.assets = listFrom(result, ["items", "assets", "data"]).map(normalizeAsset);
  state.selectedIds = new Set(
    [...state.selectedIds].filter((id) => state.assets.some((asset) => asset.id === id)),
  );
  const selectionStillExists =
    !state.selectedId || Boolean(assetById(state.selectedId));
  if (!selectionStillExists) state.selectedId = null;
  state.resultTotal =
    finiteNumber(result?.total, result?.count) ?? state.assets.length;
  if (!state.query && !state.status && !state.activeCollectionId) {
    state.libraryTotal = state.resultTotal;
  }
  renderAll();
  if (selectId) await selectAsset(selectId, { scroll: true });
}

async function refreshJobs() {
  try {
    const result = await api(
      "/api/jobs?state=queued,processing,failed,needs_setup&limit=80",
    );
    const previousStatuses = new Map(
      state.jobs.map((job) => [job.id, job.status]),
    );
    const previousSignature = jobsSignature(state.jobs);
    const previousSelectedStatus = state.jobs.find(
      (job) => job.assetId === state.selectedId,
    )?.status;
    const nextJobs = listFrom(result, ["items", "jobs", "data"]).map(
      normalizeJob,
    );
    const reachedTerminalState = nextJobs.some((job) => {
      const previousStatus = previousStatuses.get(job.id);
      return previousStatus !== job.status && !statusIsActive(job.status);
    });
    const nextSignature = jobsSignature(nextJobs);
    const nextSelectedStatus = nextJobs.find(
      (job) => job.assetId === state.selectedId,
    )?.status;
    state.jobs = nextJobs;
    if (reachedTerminalState) {
      await Promise.allSettled([
        refreshAssets({ selectId: state.selectedId }),
        refreshProvider(),
      ]);
      return;
    }
    if (previousSignature !== nextSignature) renderQueue();
    if (previousSelectedStatus !== nextSelectedStatus) renderInspector();
  } catch (error) {
    console.warn("Unable to refresh jobs", error);
  }
}

async function refreshCollections() {
  const result = await api("/api/collections");
  state.collections = listFrom(result, ["items", "collections", "data"]).map(
    normalizeCollection,
  );
  renderCollectionNav();
  renderCounts();
  renderInspector();
}

async function refreshProvider() {
  try {
    state.provider = await api("/api/providers");
    renderProviderState();
    renderSettings();
  } catch (error) {
    state.provider = { ready: false, message: error.message };
    renderProviderState();
    renderSettings();
  }
}

async function refreshSkills() {
  const result = await api("/api/skills");
  state.skills = listFrom(result, ["items", "skills", "data"]);
  if (state.view === "skills") renderAll();
  else renderCounts();
}

async function refreshMcps() {
  const result = await api("/api/mcps");
  state.mcps = listFrom(result, ["items", "mcps", "data"]);
  if (state.view === "mcps") renderAll();
  else renderCounts();
}

async function setSkillFavorite(id) {
  const skill = state.skills.find((item) => item.id === id);
  if (!skill) return;
  const nextFavorite = !skill.favorite;
  try {
    const updated = await api(
      `/api/skills/${encodeURIComponent(id)}/favorite`,
        {
        method: "PATCH",
        body: JSON.stringify({ favorite: nextFavorite }),
      },
    );
    Object.assign(skill, updated);
    renderGallery();
    notify(nextFavorite ? `已收藏 ${skill.name}。` : `已取消收藏 ${skill.name}。`);
  } catch (error) {
    notify(`无法更新 Skill 收藏：${error.message}`, "error");
  }
}

async function toggleMcp(id, button) {
  const mcp = state.mcps.find((item) => item.id === id);
  if (!mcp || !mcp.manageable) return;
  const nextEnabled = !mcp.enabled;
  const restore = beginPendingButtons([button], "");
  try {
    const updated = await api(`/api/mcps/${encodeURIComponent(id)}/enabled`, {
      method: "PATCH",
      body: JSON.stringify({ enabled: nextEnabled }),
    });
    Object.assign(mcp, updated);
    renderGallery();
    notify(`${mcp.name} 已${nextEnabled ? "启用" : "停用"}，重启 Agent 后生效。`);
  } catch (error) {
    notify(`无法更新 MCP：${error.message}`, "error");
  } finally {
    restore();
  }
}

function setSkillInstallMode(mode) {
  state.skillInstallMode = mode === "zip" ? "zip" : "repository";
  elements.skillRepositoryFields.hidden = state.skillInstallMode !== "repository";
  elements.skillZipFields.hidden = state.skillInstallMode !== "zip";
  elements.skillInstallDialog.querySelectorAll("[data-skill-install-mode]").forEach((button) => {
    const active = button.dataset.skillInstallMode === state.skillInstallMode;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function openSkillInstallDialog() {
  elements.skillInstallForm.reset();
  state.skillZipFile = null;
  elements.skillZipName.textContent = "尚未选择文件";
  setSkillInstallMode("repository");
  showDialog(elements.skillInstallDialog);
}

async function updateSkill(id, button) {
  const skill = state.skills.find((item) => item.id === id);
  if (!skill?.updateable) return;
  const restore = beginPendingButtons([button], "");
  try {
    await api(`/api/skills/${encodeURIComponent(id)}/update`, { method: "POST", body: "{}" });
    await refreshSkills();
    notify(`${skill.name} 已从仓库更新。`);
  } catch (error) { notify(`无法更新 Skill：${error.message}`, "error"); }
  finally { restore(); }
}

async function syncSkill(id, targetId, button) {
  const skill = state.skills.find((item) => item.id === id);
  if (!skill) return;
  const enabled = !Boolean(skill.targets?.[targetId]);
  const restore = beginPendingButtons([button], "");
  try {
    await api(`/api/skills/${encodeURIComponent(id)}/sync`, { method: "POST", body: JSON.stringify({ targetId, enabled }) });
    await refreshSkills();
    notify(`${skill.name} 已${enabled ? "同步到" : "移出"}${AGENT_LABELS[targetId]}。`);
  } catch (error) { notify(`无法同步 Skill：${error.message}`, "error"); }
  finally { restore(); }
}

function splitCommandArgs(value) {
  return (String(value || "").match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/gu) || []).map((part) => part.replace(/^("|')|("|')$/gu, ""));
}

function renderMcpTransportFields() {
  const type = elements.mcpForm.elements.type.value;
  elements.mcpForm.querySelectorAll("[data-mcp-url-field]").forEach((field) => { field.hidden = type === "stdio"; });
  elements.mcpForm.querySelectorAll("[data-mcp-command-field]").forEach((field) => { field.hidden = type !== "stdio"; });
}

function openMcpDialog(mcp = null) {
  state.editingMcpId = mcp?.id || null;
  elements.mcpForm.reset();
  elements.mcpDialogTitle.textContent = mcp ? "编辑 MCP" : "新增 MCP";
  const form = elements.mcpForm.elements;
  form.sourceId.disabled = Boolean(mcp);
  form.sourceId.value = mcp?.sourceId || "codex";
  form.type.value = mcp?.type || "stdio";
  form.name.value = mcp?.name || "";
  form.url.value = mcp?.url || "";
  form.command.value = mcp?.command || "";
  form.args.value = Array.isArray(mcp?.args) ? mcp.args.map((arg) => /\s/u.test(arg) ? JSON.stringify(arg) : arg).join(" ") : "";
  elements.mcpForm.querySelectorAll('input[name="targets"]').forEach((input) => {
    input.checked = mcp ? Boolean(mcp.targets?.[input.value]) : input.value === form.sourceId.value;
    input.disabled = Boolean(mcp?.targets?.[input.value]) || input.value === form.sourceId.value;
  });
  renderMcpTransportFields();
  showDialog(elements.mcpDialog);
  requestAnimationFrame(() => form.name.focus());
}

async function syncMcp(id, targetId, button) {
  const mcp = state.mcps.find((item) => item.id === id);
  if (!mcp || targetId === mcp.sourceId) return;
  const targets = Object.entries(mcp.targets || {}).filter(([, active]) => active).map(([target]) => target);
  const next = new Set(targets);
  if (next.has(targetId)) next.delete(targetId); else next.add(targetId);
  const restore = beginPendingButtons([button], "");
  try {
    await api(`/api/mcps/${encodeURIComponent(id)}/sync`, { method: "POST", body: JSON.stringify({ targets: [...next] }) });
    await refreshMcps();
    notify(`${mcp.name} 的 Agent 同步已更新。`);
  } catch (error) { notify(`无法同步 MCP：${error.message}`, "error"); }
  finally { restore(); }
}

async function checkMcp(id, button) {
  const mcp = state.mcps.find((item) => item.id === id);
  if (!mcp) return;
  const restore = beginPendingButtons([button], "");
  try {
    mcp.health = await api(`/api/mcps/${encodeURIComponent(id)}/health`, { method: "POST", body: "{}" });
    renderGallery();
    notify(`${mcp.name}：${mcp.health.message}`);
  } catch (error) { notify(`连接检查失败：${error.message}`, "error"); }
  finally { restore(); }
}

async function checkAllMcps(button) {
  const restore = beginPendingButtons([button], "检查中…");
  try {
    const payload = await api("/api/mcps/health", { method: "POST", body: "{}" });
    for (const mcp of state.mcps) if (payload.results?.[mcp.id]) mcp.health = payload.results[mcp.id];
    renderGallery();
    notify("全部 MCP 连接检查完成。");
  } catch (error) { notify(`连接检查失败：${error.message}`, "error"); }
  finally { restore(); }
}

async function removeMcp(id) {
  const mcp = state.mcps.find((item) => item.id === id);
  if (!mcp) return;
  const confirmed = await confirmAction({ title: "删除 MCP", message: `从 ${mcp.source} 删除「${mcp.name}」？删除前会保留配置备份。`, confirmLabel: "删除 MCP" });
  if (!confirmed) return;
  try {
    await api(`/api/mcps/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refreshMcps();
    notify(`${mcp.name} 已删除。`);
  } catch (error) { notify(`无法删除 MCP：${error.message}`, "error"); }
}

async function selectAsset(id, { scroll = false } = {}) {
  const initial = assetById(id);
  if (!initial) return;
  const shouldMoveFocus = state.selectedId !== id && isMobileInspector();
  if (shouldMoveFocus) {
    state.inspectorReturnFocus =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    state.inspectorReturnAssetId = id;
  }
  state.selectedId = id;
  state.lastAnchorId = id;
  renderGallery();
  renderInspector();
  renderBatchBar();

  if (!initial.synthetic) {
    try {
      const detail = normalizeAsset(
        await api(`/api/assets/${encodeURIComponent(id)}`),
      );
      const index = state.assets.findIndex((asset) => asset.id === id);
      if (index >= 0) state.assets[index] = detail;
      renderInspector();
    } catch (error) {
      notify(`无法读取完整素材信息：${error.message}`, "error");
    }
  }

  if (scroll) {
    requestAnimationFrame(() => {
      const card = elements.gallery.querySelector(
        `[data-asset-id="${CSS.escape(id)}"]`,
      );
      card?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  if (shouldMoveFocus) {
    requestAnimationFrame(() => {
      elements.inspector
        .querySelector("[data-close-inspector]")
        ?.focus({ preventScroll: true });
    });
  }
}

function closeInspector() {
  const returnFocus = state.inspectorReturnFocus;
  const returnAssetId = state.inspectorReturnAssetId || state.selectedId;
  state.inspectorReturnFocus = null;
  state.inspectorReturnAssetId = null;
  state.selectedId = null;
  renderGallery();
  renderInspector();
  renderBatchBar();
  if (returnFocus || returnAssetId) {
    requestAnimationFrame(() => {
      if (returnFocus instanceof HTMLElement && returnFocus.isConnected) {
        returnFocus.focus({ preventScroll: true });
        return;
      }
      const assetButton = returnAssetId
        ? elements.gallery.querySelector(
            `[data-open-asset="${CSS.escape(returnAssetId)}"]`,
          )
        : null;
      if (assetButton instanceof HTMLElement) {
        assetButton.focus({ preventScroll: true });
      } else {
        elements.workspace.focus({ preventScroll: true });
      }
    });
  }
}

function isMobileInspector() {
  return window.matchMedia("(max-width: 920px)").matches;
}

function trapMobileInspectorFocus(event) {
  if (
    event.key !== "Tab" ||
    !state.selectedId ||
    !isMobileInspector() ||
    !document.body.classList.contains("is-inspector-open")
  ) {
    return false;
  }

  const focusable = [
    ...elements.inspector.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ].filter((element) => element.getClientRects().length > 0);
  if (!focusable.length) return false;

  const first = focusable[0];
  const last = focusable.at(-1);
  if (!elements.inspector.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
    return true;
  }
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return true;
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
    return true;
  }
  return false;
}

function toggleBatch(id) {
  const asset = assetById(id);
  if (!asset || asset.synthetic) return;
  if (state.selectedIds.has(id)) state.selectedIds.delete(id);
  else state.selectedIds.add(id);
  state.lastAnchorId = id;
  renderGallery();
  renderBatchBar();
}

function selectBatchRange(targetId) {
  const assets = filteredAssets().filter((asset) => !asset.synthetic);
  const start = assets.findIndex((asset) => asset.id === state.lastAnchorId);
  const end = assets.findIndex((asset) => asset.id === targetId);
  if (start < 0 || end < 0) {
    toggleBatch(targetId);
    return;
  }
  const [from, to] = start < end ? [start, end] : [end, start];
  for (const asset of assets.slice(from, to + 1)) {
    state.selectedIds.add(asset.id);
  }
  state.lastAnchorId = targetId;
  renderGallery();
  renderBatchBar();
}

async function analyzeAssets(ids) {
  const uniqueIds = [...new Set(ids)].filter((id) => !assetById(id)?.synthetic);
  if (!uniqueIds.length) return;
  if (!state.analysisRules.source.analysisAvailable || !selectedAnalysisRule()) {
    notify("官方规则不可用，请先重新同步；有效的本机自定义规则仍可继续使用。", "error");
    return;
  }

  const buttons = [
    elements.recognizeButton,
    ...document.querySelectorAll("[data-analyze-id]"),
  ];
  const restoreButtons = beginPendingButtons(buttons);

  try {
    let queued = 0;
    const errors = [];
    for (const id of uniqueIds) {
      try {
        await api(`/api/assets/${encodeURIComponent(id)}/analyze`, {
          method: "POST",
          body: JSON.stringify({ ruleId: state.analysisRules.selectedId }),
        });
        queued += 1;
      } catch (error) {
        errors.push(`${assetById(id)?.title || id}：${error.message}`);
      }
    }

    state.queueExpanded = true;
    await Promise.allSettled([refreshJobs(), refreshAssets()]);
    if (queued) {
      notify(`${queued} 张素材已加入分析队列。`);
    }
    if (errors.length) {
      notify(`有 ${errors.length} 张未能排入队列：${errors[0]}`, "error");
    }
  } finally {
    restoreButtons();
    renderInspector();
    renderBatchBar();
  }
}

function readFileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () =>
      reject(reader.error || new Error("无法读取文件")),
    );
    reader.readAsDataURL(file);
  });
}

async function importFiles(files) {
  const validFiles = [...files].filter(isSupportedImageFile);
  if (!validFiles.length) {
    notify("没有可导入的图片文件。", "error");
    return;
  }

  elements.importButton.disabled = true;
  const original = elements.importButton.innerHTML;
  elements.importButton.textContent = `导入 0 / ${validFiles.length}`;
  let imported = 0;
  let lastAssetId = null;
  const errors = [];
  let skippedForLimit = 0;

  for (const [index, file] of validFiles.entries()) {
    try {
      const data = await readFileDataUrl(file);
      const payload = await api("/api/import", {
        method: "POST",
        body: JSON.stringify({
          name: stripExtension(file.name),
          type: file.type,
          data,
          sourceUrl: "",
          rightsNote: "",
        }),
      });
      imported += 1;
      if (payload?.license) state.license = asObject(payload.license);
      lastAssetId = String(payload?.asset?.id || lastAssetId || "");
      elements.importButton.textContent = `导入 ${imported} / ${validFiles.length}`;
    } catch (error) {
      if (error.details?.code === "FREE_LIBRARY_LIMIT_REACHED") {
        skippedForLimit = validFiles.length - index;
        state.license = asObject(error.details.license);
        break;
      }
      errors.push(`${file.name}：${error.message}`);
    }
  }

  elements.importButton.disabled = false;
  elements.importButton.innerHTML = original;
  elements.fileInput.value = "";
  await loadBootstrap({ preserveSelection: false });
  if (lastAssetId) await selectAsset(lastAssetId, { scroll: true });

  if (imported) {
    notify(
      `${imported} 张图片已导入并选取。`,
    );
  }
  if (errors.length) {
    notify(`有 ${errors.length} 张未导入：${errors[0]}`, "error");
  }
  if (skippedForLimit > 0) {
    notify(`已达到免费版 20 张上限，另有 ${skippedForLimit} 张未导入。`, "error");
  }
}

function isSupportedImageFile(file) {
  return (
    /^image\/(jpeg|png|webp|gif)$/i.test(file?.type || "") ||
    /\.(jpe?g|png|webp|gif)$/i.test(file?.name || "")
  );
}

function draggedImageFiles(dataTransfer) {
  return [...(dataTransfer?.files || [])].filter(isSupportedImageFile);
}

function hasDraggedFiles(dataTransfer) {
  return [...(dataTransfer?.types || [])].includes("Files");
}

function setDropImportActive(active) {
  if (active) {
    const bounds = elements.workspace.getBoundingClientRect();
    elements.dropImportOverlay.style.setProperty("--drop-zone-top", `${Math.round(bounds.top + 4)}px`);
    elements.dropImportOverlay.style.setProperty("--drop-zone-right", `${Math.round(window.innerWidth - bounds.right + 4)}px`);
    elements.dropImportOverlay.style.setProperty("--drop-zone-bottom", `${Math.round(window.innerHeight - bounds.bottom + 4)}px`);
    elements.dropImportOverlay.style.setProperty("--drop-zone-left", `${Math.round(bounds.left + 4)}px`);
  }
  elements.dropImportOverlay.hidden = !active;
  elements.workspace.classList.toggle("is-drop-target", active);
}

function marqueeCanStart(event) {
  return (
    event.button === 0 &&
    !["tags", "trash", "skills", "mcps"].includes(state.view) &&
    !isMobileInspector() &&
    !document.querySelector("dialog[open]") &&
    !event.target.closest(
      "button, input, select, textarea, a, .asset-card, .filter-strip, .batch-bar, .setup-notice, .state-panel, .tool-view",
    ) &&
    (event.target === elements.gallery || event.target === elements.workspace)
  );
}

function updateMarquee(event) {
  const marquee = state.marquee;
  const inputId = event.pointerId ?? "mouse";
  if (!marquee || inputId !== marquee.pointerId) return;
  const selection = boundedSelectionRect(
    marquee.start,
    { x: event.clientX, y: event.clientY },
    marquee.bounds,
  );
  if (!marquee.active && Math.hypot(selection.width, selection.height) < 5) return;
  marquee.active = true;
  event.preventDefault();
  const rectangle = elements.marqueeSelection.querySelector("rect");
  rectangle.setAttribute("x", String(selection.left));
  rectangle.setAttribute("y", String(selection.top));
  rectangle.setAttribute("width", String(selection.width));
  rectangle.setAttribute("height", String(selection.height));
  elements.marqueeSelection.removeAttribute("hidden");

  const intersecting = new Set(
    marquee.cards
      .filter(({ rect }) => rectanglesIntersect(selection, rect))
      .map(({ id }) => id),
  );
  const nextSelection = new Set(marquee.additive ? marquee.initialIds : []);
  for (const id of intersecting) {
    if (marquee.toggle && marquee.initialIds.has(id)) nextSelection.delete(id);
    else nextSelection.add(id);
  }
  state.selectedIds = nextSelection;
  for (const { id, element } of marquee.cards) {
    const selected = nextSelection.has(id);
    element.classList.toggle("is-batch-selected", selected);
    const toggle = element.querySelector("[data-batch-id]");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(selected));
      toggle.innerHTML = selected
        ? '<svg class="icon" aria-hidden="true"><use href="#icon-check"></use></svg>'
        : "";
    }
  }
}

function finishMarquee(event) {
  const marquee = state.marquee;
  const inputId = event.pointerId ?? "mouse";
  if (!marquee || inputId !== marquee.pointerId) return;
  state.marquee = null;
  elements.marqueeSelection.setAttribute("hidden", "");
  const rectangle = elements.marqueeSelection.querySelector("rect");
  for (const attribute of ["x", "y", "width", "height"]) {
    rectangle.removeAttribute(attribute);
  }
  elements.workspace.classList.remove("is-marquee-selecting");
  if (typeof event.pointerId === "number") {
    try {
      elements.workspace.releasePointerCapture(event.pointerId);
    } catch {}
  }
  if (marquee.active) {
    event.preventDefault();
    state.suppressWorkspaceClick = true;
    window.setTimeout(() => {
      state.suppressWorkspaceClick = false;
    }, 0);
    renderBatchBar();
    renderGallery();
  }
}

async function scanFolder() {
  const original = elements.scanButton.innerHTML;
  elements.scanButton.disabled = true;
  elements.scanButton.textContent = "扫描中…";
  try {
    const result = await api("/api/scan", {
      method: "POST",
      body: JSON.stringify({}),
    });
    await loadBootstrap();
    notify(
      `扫描完成：${formatNumber(result?.scanned ?? 0)} 个文件，新增 ${formatNumber(
        result?.imported ?? 0,
      )} 张，重复 ${formatNumber(result?.duplicates ?? 0)} 张${
        result?.missing ? `，新发现 ${formatNumber(result.missing)} 张原图缺失` : ""
      }${
        result?.limited ? `，${formatNumber(result.limited)} 张因免费版上限暂未加入` : ""
      }。`,
    );
  } catch (error) {
    notify(`扫描失败：${error.message}`, "error");
  } finally {
    elements.scanButton.disabled = false;
    elements.scanButton.innerHTML = original;
  }
}

async function saveMetadata(form) {
  const id = form.dataset.metadataForm;
  const submit = form.querySelector('[type="submit"]');
  const original = submit.textContent;
  submit.disabled = true;
  submit.textContent = "保存中…";
  const data = new FormData(form);
  try {
    const updated = normalizeAsset(
      await api(`/api/assets/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: String(data.get("title") || "").trim(),
          discipline: readTagEditor(form),
          sourceUrl: String(data.get("sourceUrl") || "").trim(),
          rightsNote: String(data.get("rightsNote") || "").trim(),
          notes: String(data.get("notes") || "").trim(),
        }),
      }),
    );
    const index = state.assets.findIndex((asset) => asset.id === id);
    if (index >= 0) state.assets[index] = updated;
    renderDisciplineFilter();
    renderGallery();
    renderInspector();
    await refreshUtilityViews();
    notify("素材信息已保存。");
  } catch (error) {
    notify(`素材信息保存失败：${error.message}`, "error");
    submit.disabled = false;
    submit.textContent = original;
  }
}

async function createCollection(name) {
  const result = await api("/api/collections", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  state.collections.push(normalizeCollection(result));
  await refreshCollections();
}

function openCollectionDialog(collection = null) {
  state.editingCollectionId = collection?.id || null;
  elements.collectionForm.reset();
  elements.collectionDialogTitle.textContent = collection
    ? "重命名收藏集"
    : "新建收藏集";
  elements.collectionSubmitButton.textContent = collection ? "保存" : "创建";
  elements.collectionName.value = collection?.name || "";
  showDialog(elements.collectionDialog);
  requestAnimationFrame(() => {
    elements.collectionName.focus();
    elements.collectionName.select();
  });
}

async function renameCollection(collectionId, name) {
  await api(`/api/collections/${encodeURIComponent(collectionId)}`, {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
  await refreshCollections();
}

async function addSelectedToCollection() {
  const collectionId = elements.batchCollectionSelect.value;
  const ids = [...state.selectedIds];
  if (!collectionId) {
    notify("请选择收藏集。", "error");
    return;
  }
  await Promise.all(
    ids.map((assetId) =>
      api(`/api/collections/${encodeURIComponent(collectionId)}/items`, {
        method: "POST",
        body: JSON.stringify({ assetId }),
      }),
    ),
  );
  await refreshCollections();
  notify(`已将 ${formatNumber(ids.length)} 张素材加入收藏集。`);
}

async function removeSelectedFromCurrentCollection() {
  if (!state.activeCollectionId) return;
  const ids = [...state.selectedIds];
  await Promise.all(
    ids.map((assetId) =>
      api(
        `/api/collections/${encodeURIComponent(state.activeCollectionId)}/items/${encodeURIComponent(assetId)}`,
        { method: "DELETE" },
      ),
    ),
  );
  state.selectedIds.clear();
  await Promise.all([refreshCollections(), refreshAssets()]);
  notify(`已从收藏集移出 ${formatNumber(ids.length)} 张素材。`);
}

async function deleteSelectedAssets() {
  const ids = [...state.selectedIds];
  if (!ids.length) return;
  const confirmed = await confirmAction({
    title: "删除已选素材",
    message: `删除已选的 ${formatNumber(ids.length)} 张素材？原图会移到回收目录，可手动恢复。`,
    confirmLabel: "删除素材",
  });
  if (!confirmed) return;

  let deleted = 0;
  for (const assetId of ids) {
    await api(`/api/assets/${encodeURIComponent(assetId)}`, { method: "DELETE" });
    deleted += 1;
  }
  state.selectedIds.clear();
  state.selectedId = null;
  await loadBootstrap({ preserveSelection: false });
  if (state.activeCollectionId) await refreshAssets();
  notify(`已删除 ${formatNumber(deleted)} 张素材，原图已移入回收目录。`);
}

async function addToCollection(assetId, collectionId) {
  if (!collectionId) {
    notify("请先选择收藏集。", "error");
    return;
  }
  await api(`/api/collections/${encodeURIComponent(collectionId)}/items`, {
    method: "POST",
    body: JSON.stringify({ assetId }),
  });
  const asset = assetById(assetId);
  if (asset && !asset.collectionIds.includes(collectionId)) {
    asset.collectionIds.push(collectionId);
  }
  await refreshCollections();
    notify("素材已加入收藏集。");
}

async function removeFromCollection(assetId, collectionId) {
  await api(
    `/api/collections/${encodeURIComponent(collectionId)}/items/${encodeURIComponent(
      assetId,
    )}`,
    { method: "DELETE" },
  );
  const asset = assetById(assetId);
  if (asset) {
    asset.collectionIds = asset.collectionIds.filter((id) => id !== collectionId);
  }
  await refreshCollections();
  notify("素材已移出收藏集。");
}

function confirmAction({ title, message, confirmLabel }) {
  elements.confirmDialogTitle.textContent = title;
  elements.confirmDialogMessage.textContent = message;
  elements.confirmDialogSubmit.textContent = confirmLabel;
  elements.confirmDialog.returnValue = "cancel";
  showDialog(elements.confirmDialog);
  return new Promise((resolve) => {
    elements.confirmDialog.addEventListener(
      "close",
      () => resolve(elements.confirmDialog.returnValue === "confirm"),
      { once: true },
    );
  });
}

async function deleteAsset(assetId) {
  const asset = assetById(assetId);
  if (!asset || asset.synthetic) return;
  const confirmed = await confirmAction({
    title: "删除素材",
    message: `删除「${asset.title}」？之后可在左侧「回收站」中恢复或彻底删除。`,
    confirmLabel: "删除素材",
  });
  if (!confirmed) return;

  try {
    const result = await api(`/api/assets/${encodeURIComponent(assetId)}`, {
      method: "DELETE",
    });
    state.selectedId = null;
    state.selectedIds.delete(assetId);
    await loadBootstrap({ preserveSelection: false });
    if (state.activeCollectionId) await refreshAssets();
    notify(
      result?.movedToTrash
        ? "素材已删除，原图已移入回收目录。"
        : "素材记录已删除；原图此前已不在素材文件夹。",
    );
  } catch (error) {
    notify(`无法删除素材：${error.message}`, "error");
  }
}

async function refreshUtilityViews() {
  const [tags, trash] = await Promise.all([
    api("/api/tags"),
    api("/api/trash"),
  ]);
  state.tags = listFrom(tags, ["items", "tags", "data"]);
  state.trash = listFrom(trash, ["items", "trash", "data"]);
  renderCounts();
  renderGallery();
}

async function renameManagedTag(currentName, nextName) {
  const name = String(nextName || "").trim();
  if (!name || name === currentName) return;
  try {
    await api(`/api/tags/${encodeURIComponent(currentName)}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    });
    await Promise.all([refreshAssets(), refreshUtilityViews()]);
    notify(`标签已改为「${name}」。`);
  } catch (error) {
    notify(`无法修改标签：${error.message}`, "error");
  }
}

async function deleteManagedTag(name) {
  const tag = state.tags.find((item) => item.name === name);
  const confirmed = await confirmAction({
    title: "删除标签",
    message: `从 ${formatNumber(tag?.count || 0)} 个素材中移除标签「${name}」？素材本身不会被删除。`,
    confirmLabel: "删除标签",
  });
  if (!confirmed) return;
  try {
    await api(`/api/tags/${encodeURIComponent(name)}`, { method: "DELETE" });
    await Promise.all([refreshAssets(), refreshUtilityViews()]);
    notify(`标签「${name}」已删除。`);
  } catch (error) {
    notify(`无法删除标签：${error.message}`, "error");
  }
}

async function restoreTrashItem(id) {
  try {
    await api(`/api/trash/${encodeURIComponent(id)}/restore`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    await loadBootstrap({ preserveSelection: false });
    notify("素材已恢复到原素材库。");
  } catch (error) {
    notify(`无法恢复素材：${error.message}`, "error");
  }
}

async function permanentlyDeleteTrashItem(id) {
  const item = state.trash.find((candidate) => String(candidate.id) === String(id));
  if (!item) return;
  const confirmed = await confirmAction({
    title: "彻底删除",
    message: `彻底删除「${item.title || item.fileName}」？此操作无法恢复。`,
    confirmLabel: "彻底删除",
  });
  if (!confirmed) return;
  try {
    await api(`/api/trash/${encodeURIComponent(id)}`, { method: "DELETE" });
    await refreshUtilityViews();
    notify("素材已从回收站彻底删除。");
  } catch (error) {
    notify(`无法彻底删除：${error.message}`, "error");
  }
}

async function deleteCollection(collectionId) {
  const collection = state.collections.find((item) => item.id === collectionId);
  if (!collection) return;
  const confirmed = await confirmAction({
    title: "删除收藏集",
    message: `删除「${collection.name}」？其中的素材仍会保留在素材库。`,
    confirmLabel: "删除收藏集",
  });
  if (!confirmed) return;

  try {
    await api(`/api/collections/${encodeURIComponent(collectionId)}`, {
      method: "DELETE",
    });
    if (state.activeCollectionId === collectionId) {
      state.activeCollectionId = null;
      state.view = "library";
      await refreshAssets();
    }
    await refreshCollections();
    notify(`已删除收藏集「${collection.name}」，素材未删除。`);
  } catch (error) {
    notify(`无法删除收藏集：${error.message}`, "error");
  }
}

async function cancelJob(jobId) {
  try {
    await api(`/api/jobs/${encodeURIComponent(jobId)}`, { method: "DELETE" });
    await Promise.allSettled([refreshJobs(), refreshAssets()]);
    notify("分析已取消。");
  } catch (error) {
    notify(`无法取消分析：${error.message}`, "error");
  }
}

async function openCollection(id) {
  state.view = "library";
  state.activeCollectionId = id;
  state.selectedId = null;
  state.selectedIds.clear();
  await refreshAssets();
  elements.workspace.scrollTo({ top: 0, behavior: "smooth" });
}

function clearFilters() {
  state.selectedIds.clear();
  state.query = "";
  state.discipline = "";
  state.status = "";
  state.sort = "newest";
  elements.searchInput.value = "";
  elements.disciplineFilter.value = "";
  elements.statusFilter.value = "";
  elements.sortSelect.value = "newest";
  refreshAssets().catch((error) =>
    notify(`无法清除条件：${error.message}`, "error"),
  );
}

function showDialog(dialog) {
  if (!dialog.open) dialog.showModal();
}

function closeDialog(dialog) {
  if (dialog?.open) dialog.close();
}

async function openSettings() {
  renderSettings();
  showDialog(elements.settingsDialog);
  const tasks = [refreshProvider()];
  if (!state.agentScanPerformed) {
    tasks.push(scanAgents(elements.scanAgentsButton, { silent: true }));
  }
  await Promise.allSettled(tasks);
}

async function copyPrompt(key) {
  const asset = assetById(state.selectedId);
  if (!asset) return;
  const normalized = normalizedAnalysis(asset);
  const prompt = normalized.isV2
    ? readableValue(asObject(normalized.data.prompts)[key])
    : normalized.prompts[key];
  if (!prompt) return;
  try {
    await navigator.clipboard.writeText(prompt);
    notify("提示词已复制到剪贴簿。");
  } catch (error) {
    notify(`无法复制提示词：${error.message}`, "error");
  }
}

async function copyPaletteColor(button) {
  const color = safeColor(button.dataset.copyColor).toUpperCase();
  const originalTooltip = button.dataset.swatchTooltip || color;
  try {
    await navigator.clipboard.writeText(color);
    button.dataset.swatchTooltip = `已复制 ${color}`;
    button.classList.add("is-copied");
    window.setTimeout(() => {
      if (!button.isConnected) return;
      button.dataset.swatchTooltip = originalTooltip;
      button.classList.remove("is-copied");
    }, 1200);
    notify(`${color} 已复制。`);
  } catch (error) {
    notify(`无法复制色值：${error.message}`, "error");
  }
}

let liveRegionTimer = null;
function notify(message, type = "info") {
  window.clearTimeout(liveRegionTimer);
  elements.liveRegion.textContent = String(message);
  elements.liveRegion.classList.toggle("is-error", type === "error");
  elements.liveRegion.classList.add("is-visible");
  liveRegionTimer = window.setTimeout(() => {
    elements.liveRegion.classList.remove("is-visible");
  }, type === "error" ? 7000 : 4200);
}

function moveSelection(direction) {
  if (!state.selectedId) return;
  const assets = filteredAssets();
  const currentIndex = assets.findIndex((asset) => asset.id === state.selectedId);
  if (currentIndex < 0) return;
  const nextIndex = Math.max(
    0,
    Math.min(assets.length - 1, currentIndex + direction),
  );
  if (nextIndex !== currentIndex) {
    selectAsset(assets[nextIndex].id, { scroll: true });
  }
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    target?.isContentEditable
  );
}

function submitSearch() {
  state.selectedIds.clear();
  state.query = elements.searchInput.value.trim();
  if (state.view === "skills" || state.view === "mcps") {
    renderGallery();
    return;
  }
  refreshAssets().catch((error) =>
    notify(`搜索失败：${error.message}`, "error"),
  );
}

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitSearch();
});

elements.searchInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  submitSearch();
});

elements.searchInput.addEventListener("input", () => {
  if (state.view !== "skills" && state.view !== "mcps") return;
  state.query = elements.searchInput.value.trim();
  renderGallery();
});

elements.disciplineFilter.addEventListener("change", () => {
  state.selectedIds.clear();
  state.discipline = disciplineKey(elements.disciplineFilter.value);
  renderGallery();
  renderBatchBar();
});

elements.statusFilter.addEventListener("change", () => {
  state.selectedIds.clear();
  state.status = elements.statusFilter.value;
  refreshAssets().catch((error) =>
    notify(`筛选失败：${error.message}`, "error"),
  );
});

elements.sortSelect.addEventListener("change", () => {
  state.sort = elements.sortSelect.value;
  refreshAssets().catch((error) =>
    notify(`排序失败：${error.message}`, "error"),
  );
});

elements.clearFiltersButton.addEventListener("click", clearFilters);
elements.openLibraryFolderButton.addEventListener("click", async () => {
  const button = elements.openLibraryFolderButton;
  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  try {
    await api("/api/library/reveal", {
      method: "POST",
      headers: { "X-Style-Atlas-Action": "reveal-library" },
    });
    notify("已打开素材文件夹。");
  } catch (error) {
    notify(`无法打开素材文件夹：${error.message}`, "error");
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
});
elements.importButton.addEventListener("click", () => elements.fileInput.click());
elements.fileInput.addEventListener("change", () => {
  if (elements.fileInput.files?.length) importFiles(elements.fileInput.files);
});

document.addEventListener("dragenter", (event) => {
  if (!hasDraggedFiles(event.dataTransfer)) return;
  event.preventDefault();
  state.dragDepth += 1;
  setDropImportActive(true);
});

document.addEventListener("dragover", (event) => {
  if (!hasDraggedFiles(event.dataTransfer)) return;
  event.preventDefault();
  if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  setDropImportActive(true);
});

document.addEventListener("dragleave", (event) => {
  if (!hasDraggedFiles(event.dataTransfer)) return;
  state.dragDepth = Math.max(0, state.dragDepth - 1);
  if (state.dragDepth === 0 || !event.relatedTarget) {
    state.dragDepth = 0;
    setDropImportActive(false);
  }
});

document.addEventListener("drop", (event) => {
  if (!hasDraggedFiles(event.dataTransfer)) return;
  event.preventDefault();
  state.dragDepth = 0;
  setDropImportActive(false);
  const files = draggedImageFiles(event.dataTransfer);
  if (!files.length) {
    notify("拖入的文件中没有可导入的图片。", "error");
    return;
  }
  importFiles(files);
});

document.addEventListener("dragend", () => {
  state.dragDepth = 0;
  setDropImportActive(false);
});

elements.workspace.addEventListener("mousedown", (event) => {
  if (!marqueeCanStart(event)) return;
  const cards = [...elements.gallery.querySelectorAll(".asset-card[data-asset-id]")]
    .map((element) => ({
      element,
      id: element.dataset.assetId,
      rect: element.getBoundingClientRect(),
    }))
    .filter(({ id, rect }) =>
      id && !assetById(id)?.synthetic && rect.width > 0 && rect.height > 0,
    );
  state.marquee = {
    pointerId: "mouse",
    start: { x: event.clientX, y: event.clientY },
    bounds: elements.workspace.getBoundingClientRect(),
    cards,
    initialIds: new Set(state.selectedIds),
    additive: event.shiftKey || event.metaKey || event.ctrlKey,
    toggle: event.metaKey || event.ctrlKey,
    active: false,
  };
  elements.workspace.classList.add("is-marquee-selecting");
});

document.addEventListener("mousemove", updateMarquee);
document.addEventListener("mouseup", finishMarquee);
elements.scanButton.addEventListener("click", scanFolder);
elements.recognizeButton.addEventListener("click", () =>
  analyzeAssets(currentAnalyzeIds()),
);
elements.clearSelectionButton.addEventListener("click", () => {
  state.selectedIds.clear();
  renderGallery();
  renderBatchBar();
});
elements.retryLoadButton.addEventListener("click", () =>
  loadBootstrap({ preserveSelection: false }),
);
elements.queueToggle.addEventListener("click", () => {
  state.queueExpanded = !state.queueExpanded;
  renderQueue();
});
elements.newCollectionButton.addEventListener("click", () => {
  openCollectionDialog();
});

elements.collectionForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = elements.collectionName.value.trim();
  if (!name) return;
  const submit = elements.collectionForm.querySelector('[type="submit"]');
  submit.disabled = true;
  try {
    if (state.editingCollectionId) {
      await renameCollection(state.editingCollectionId, name);
    } else {
      await createCollection(name);
    }
    closeDialog(elements.collectionDialog);
    elements.collectionForm.reset();
    notify(
      state.editingCollectionId
        ? `收藏集已重命名为「${name}」。`
        : `已创建收藏集「${name}」。`,
    );
    state.editingCollectionId = null;
  } catch (error) {
    notify(`无法保存收藏集：${error.message}`, "error");
  } finally {
    submit.disabled = false;
  }
});

elements.skillInstallForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = elements.skillInstallForm.querySelector('[type="submit"]');
  const restore = beginPendingButtons([submit], "安装中…");
  try {
    let endpoint = "/api/skills/install/repository";
    let body;
    if (state.skillInstallMode === "zip") {
      if (!state.skillZipFile) throw new Error("请先选择 ZIP 文件。");
      const dataUrl = await readFileDataUrl(state.skillZipFile);
      endpoint = "/api/skills/install/zip";
      body = { fileName: state.skillZipFile.name, data: dataUrl.slice(dataUrl.indexOf(",") + 1) };
    } else {
      const data = new FormData(elements.skillInstallForm);
      body = { url: String(data.get("url") || "").trim(), branch: String(data.get("branch") || "").trim(), subpath: String(data.get("subpath") || "").trim() };
    }
    const result = await api(endpoint, { method: "POST", body: JSON.stringify(body) });
    await refreshSkills();
    closeDialog(elements.skillInstallDialog);
    notify(`已安装 ${formatNumber(result.installed?.length || 0)} 个 Skill。`);
  } catch (error) { notify(`Skill 安装失败：${error.message}`, "error"); }
  finally { restore(); }
});

elements.skillZipButton.addEventListener("click", () => elements.skillZipInput.click());
elements.skillZipInput.addEventListener("change", () => {
  state.skillZipFile = elements.skillZipInput.files?.[0] || null;
  elements.skillZipName.textContent = state.skillZipFile?.name || "尚未选择文件";
});

elements.mcpForm.elements.type.addEventListener("change", renderMcpTransportFields);
elements.mcpForm.elements.sourceId.addEventListener("change", () => {
  elements.mcpForm.querySelectorAll('input[name="targets"]').forEach((input) => {
    input.disabled = input.value === elements.mcpForm.elements.sourceId.value;
    input.checked = input.disabled;
  });
});

elements.mcpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = elements.mcpForm.querySelector('[type="submit"]');
  const restore = beginPendingButtons([submit], "保存中…");
  const form = elements.mcpForm.elements;
  const payload = { sourceId: form.sourceId.value, name: form.name.value.trim(), type: form.type.value, url: form.url.value.trim(), command: form.command.value.trim(), args: splitCommandArgs(form.args.value), enabled: state.editingMcpId ? state.mcps.find((item) => item.id === state.editingMcpId)?.enabled !== false : true, targets: [...elements.mcpForm.querySelectorAll('input[name="targets"]:checked')].map((input) => input.value) };
  try {
    await api(state.editingMcpId ? `/api/mcps/${encodeURIComponent(state.editingMcpId)}` : "/api/mcps", { method: state.editingMcpId ? "PATCH" : "POST", body: JSON.stringify(payload) });
    await refreshMcps();
    closeDialog(elements.mcpDialog);
    notify(state.editingMcpId ? "MCP 已更新。" : "MCP 已新增并同步。");
    state.editingMcpId = null;
  } catch (error) { notify(`无法保存 MCP：${error.message}`, "error"); }
  finally { restore(); }
});

elements.batchAddCollectionButton.addEventListener("click", () => {
  addSelectedToCollection().catch((error) =>
    notify(`无法加入收藏集：${error.message}`, "error"),
  );
});
elements.batchRemoveCollectionButton.addEventListener("click", () => {
  removeSelectedFromCurrentCollection().catch((error) =>
    notify(`无法移出收藏集：${error.message}`, "error"),
  );
});
elements.batchDeleteButton.addEventListener("click", () => {
  deleteSelectedAssets().catch((error) =>
    notify(`无法删除素材：${error.message}`, "error"),
  );
});

elements.settingsForm.addEventListener("submit", (event) => event.preventDefault());
elements.analysisRuleSelect.addEventListener("change", () => {
  selectAnalysisRule(elements.analysisRuleSelect.value);
});
elements.addAnalysisRuleButton.addEventListener("click", () => openAnalysisRuleDialog());
elements.checkAppUpdateButton.addEventListener("click", () => refreshAppUpdate());
elements.activateLicenseButton.addEventListener("click", () => activateLicense());
elements.licenseKeyInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  activateLicense();
});
elements.syncAnalysisRules.addEventListener("click", () => syncAnalysisRules());
elements.retryAnalysisRules.addEventListener("click", () => {
  if (state.analysisRules.source.available) syncAnalysisRules(elements.retryAnalysisRules);
  else openSettings();
});
elements.analysisRuleForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = elements.analysisRuleForm.querySelector('[type="submit"]');
  const restore = beginPendingButtons([submit], "保存中…");
  const form = elements.analysisRuleForm.elements;
  const currentId = state.editingAnalysisRuleId;
  try {
    const payload = await api(
      currentId ? `/api/analysis-rules/${encodeURIComponent(currentId)}` : "/api/analysis-rules",
      {
        method: currentId ? "PATCH" : "POST",
        body: JSON.stringify({
          name: form.name.value.trim(),
          description: form.description.value.trim(),
          prompt: form.prompt.value.trim(),
          ...(!currentId ? { baseRuleId: form.baseRuleId.value } : {}),
        }),
      },
    );
    applyAnalysisRulesPayload(payload);
    closeDialog(elements.analysisRuleDialog);
    state.editingAnalysisRuleId = null;
    notify(currentId ? "自定义分析规则已更新。" : "自定义分析规则已创建。");
  } catch (error) {
    notify(`无法保存分析规则：${error.message}`, "error");
  } finally {
    restore();
  }
});

elements.agentFormType.addEventListener("change", renderAgentFormMode);
elements.agentAuthMode.addEventListener("change", renderAgentFormMode);
elements.agentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = elements.agentForm.querySelector('[type="submit"]');
  const restore = beginPendingButtons([submit], "保存中…");
  const form = elements.agentForm.elements;
  const current = state.editingAgentId
    ? agentProfileById(state.editingAgentId)
    : null;
  const type = current?.builtIn ? "builtin" : form.type.value;
  const payload = {
    name: form.name.value.trim(),
    type,
    command: form.command.value.trim(),
    argsTemplate: form.argsTemplate.value.trim(),
    model: type === "openai" ? form.apiModel.value.trim() : form.cliModel.value.trim(),
    endpoint: form.endpoint.value.trim(),
    authMode: form.authMode.value,
    apiKey: form.apiKey.value.trim(),
    structuredOutput: form.structuredOutput.checked,
  };
  try {
    await api(
      current ? `/api/agents/${encodeURIComponent(current.id)}` : "/api/agents",
      {
        method: current ? "PATCH" : "POST",
        body: JSON.stringify(payload),
      },
    );
    state.editingAgentId = null;
    closeDialog(elements.agentDialog);
    await refreshAgents();
    notify(current ? "Agent 已更新。" : "Agent 已添加。可先测试连接，再设为当前 Agent。");
  } catch (error) {
    notify(`无法保存 Agent：${error.message}`, "error");
  } finally {
    restore();
  }
});

elements.retryNeedsSetupButton.addEventListener("click", async () => {
  const button = elements.retryNeedsSetupButton;
  button.disabled = true;
  try {
    const result = await api("/api/jobs/retry-needs-setup", {
      method: "POST",
      body: JSON.stringify({}),
    });
    await Promise.allSettled([refreshProvider(), refreshJobs()]);
    notify(`已将 ${formatNumber(result?.retried ?? 0)} 项任务重新加入分析队列。`);
  } catch (error) {
    notify(`无法重试任务：${error.message}`, "error");
  } finally {
    button.disabled = false;
  }
});

document.addEventListener("submit", (event) => {
  const analysisForm = event.target.closest("#analysis-form");
  if (analysisForm) {
    event.preventDefault();
    saveAnalysisEdits(analysisForm);
    return;
  }
  const form = event.target.closest("[data-metadata-form]");
  if (!form) return;
  event.preventDefault();
  saveMetadata(form);
});

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (state.suppressWorkspaceClick) {
    event.preventDefault();
    state.suppressWorkspaceClick = false;
    return;
  }
  const selectRuleButton = target.closest("[data-select-analysis-rule]");
  if (selectRuleButton) {
    await selectAnalysisRule(selectRuleButton.dataset.selectAnalysisRule);
    return;
  }
  const editRuleButton = target.closest("[data-edit-analysis-rule]");
  if (editRuleButton) {
    const rule = analysisRuleById(editRuleButton.dataset.editAnalysisRule);
    if (rule?.source === "custom") openAnalysisRuleDialog(rule);
    return;
  }
  const deleteRuleButton = target.closest("[data-delete-analysis-rule]");
  if (deleteRuleButton) {
    await removeAnalysisRule(deleteRuleButton.dataset.deleteAnalysisRule);
    return;
  }
  const rollbackRuleButton = target.closest("[data-rollback-analysis-rule]");
  if (rollbackRuleButton) {
    await rollbackAnalysisRule(rollbackRuleButton.dataset.rollbackAnalysisRule, rollbackRuleButton);
    return;
  }
  if (target.closest("#scan-agents-button")) {
    await scanAgents(target.closest("#scan-agents-button"));
    return;
  }
  if (target.closest("#add-agent-button")) {
    openAgentDialog();
    return;
  }
  if (target.closest("[data-close-agent-scan]")) {
    state.agentScanResults = null;
    renderAgentManager();
    return;
  }
  const bindScannedButton = target.closest("[data-bind-scanned-agent]");
  if (bindScannedButton) {
    await bindScannedAgent(Number(bindScannedButton.dataset.bindScannedAgent));
    return;
  }
  const testAgentButton = target.closest("[data-test-agent]");
  if (testAgentButton) {
    await testAgent(testAgentButton.dataset.testAgent, testAgentButton);
    return;
  }
  const editAgentButton = target.closest("[data-edit-agent]");
  if (editAgentButton) {
    const profile = agentProfileById(editAgentButton.dataset.editAgent);
    if (profile) openAgentDialog(profile);
    return;
  }
  const deleteAgentButton = target.closest("[data-delete-agent]");
  if (deleteAgentButton) {
    await removeAgent(deleteAgentButton.dataset.deleteAgent);
    return;
  }
  const installModeButton = target.closest("[data-skill-install-mode]");
  if (installModeButton) { setSkillInstallMode(installModeButton.dataset.skillInstallMode); return; }
  if (target.closest("[data-install-skill]")) { openSkillInstallDialog(); return; }
  const updateSkillButton = target.closest("[data-update-skill]");
  if (updateSkillButton) { await updateSkill(updateSkillButton.dataset.updateSkill, updateSkillButton); return; }
  const syncSkillButton = target.closest("[data-sync-skill]");
  if (syncSkillButton) { await syncSkill(syncSkillButton.dataset.syncSkill, syncSkillButton.dataset.targetAgent, syncSkillButton); return; }
  const favoriteSkillButton = target.closest("[data-favorite-skill]");
  if (favoriteSkillButton) {
    await setSkillFavorite(favoriteSkillButton.dataset.favoriteSkill);
    return;
  }
  if (target.closest("[data-skill-favorites]")) {
    state.skillFavoritesOnly = !state.skillFavoritesOnly;
    renderGallery();
    return;
  }
  if (target.closest("[data-refresh-skills]")) {
    await refreshSkills().catch((error) =>
      notify(`无法重新扫描 Skills：${error.message}`, "error"),
    );
    return;
  }
  const mcpSourceButton = target.closest("[data-mcp-source]");
  if (mcpSourceButton) {
    state.mcpSource = mcpSourceButton.dataset.mcpSource;
    renderGallery();
    return;
  }
  if (target.closest("[data-refresh-mcps]")) {
    await refreshMcps().catch((error) =>
      notify(`无法重新读取 MCP：${error.message}`, "error"),
    );
    return;
  }
  if (target.closest("[data-add-mcp]")) { openMcpDialog(); return; }
  const editMcpButton = target.closest("[data-edit-mcp]");
  if (editMcpButton) { openMcpDialog(state.mcps.find((item) => item.id === editMcpButton.dataset.editMcp)); return; }
  const deleteMcpButton = target.closest("[data-delete-mcp]");
  if (deleteMcpButton) { await removeMcp(deleteMcpButton.dataset.deleteMcp); return; }
  const healthMcpButton = target.closest("[data-health-mcp]");
  if (healthMcpButton) { await checkMcp(healthMcpButton.dataset.healthMcp, healthMcpButton); return; }
  const checkAllMcpsButton = target.closest("[data-check-all-mcps]");
  if (checkAllMcpsButton) { await checkAllMcps(checkAllMcpsButton); return; }
  const syncMcpButton = target.closest("[data-sync-mcp]");
  if (syncMcpButton) { await syncMcp(syncMcpButton.dataset.syncMcp, syncMcpButton.dataset.targetAgent, syncMcpButton); return; }
  const mcpToggle = target.closest("[data-toggle-mcp]");
  if (mcpToggle) {
    await toggleMcp(mcpToggle.dataset.toggleMcp, mcpToggle);
    return;
  }
  const editAnalysisButton = target.closest("[data-edit-analysis]");
  if (editAnalysisButton) {
    const asset = assetById(editAnalysisButton.dataset.editAnalysis);
    if (asset) openAnalysisEditor(asset);
    return;
  }
  const copyColorButton = target.closest("[data-copy-color]");
  if (copyColorButton) {
    await copyPaletteColor(copyColorButton);
    return;
  }
  const removeAnalysisColorButton = target.closest("[data-remove-analysis-color]");
  if (removeAnalysisColorButton) {
    if (elements.analysisPaletteEditor.children.length <= 1) {
      notify("色板至少需要保留一个颜色。", "error");
      return;
    }
    removeAnalysisColorButton.closest(".analysis-color-row")?.remove();
    return;
  }
  const removeTagButton = target.closest("[data-remove-tag]");
  if (removeTagButton) {
    removeTagButton.closest("[data-tag-token]")?.remove();
    return;
  }
  const addTagButton = target.closest("[data-add-tag]");
  if (addTagButton) {
    const list = addTagButton.closest("[data-tag-list]");
    const input = list?.querySelector("[data-tag-input]");
    if (input) {
      input.hidden = false;
      list.classList.add("is-adding");
      input.focus();
    }
    return;
  }
  const suggestionButton = target.closest("[data-add-tag-suggestion]");
  if (suggestionButton) {
    const editor = suggestionButton.closest("[data-tag-editor]");
    const input = editor?.querySelector("[data-tag-input]");
    if (input) {
      input.value = suggestionButton.dataset.addTagSuggestion || "";
      addTagToEditor(input);
      suggestionButton.remove();
    }
    return;
  }
  const deleteManagedTagButton = target.closest("[data-delete-managed-tag]");
  if (deleteManagedTagButton) {
    await deleteManagedTag(deleteManagedTagButton.dataset.deleteManagedTag);
    return;
  }
  const restoreTrashButton = target.closest("[data-restore-trash]");
  if (restoreTrashButton) {
    await restoreTrashItem(restoreTrashButton.dataset.restoreTrash);
    return;
  }
  const deleteTrashButton = target.closest("[data-delete-trash]");
  if (deleteTrashButton) {
    await permanentlyDeleteTrashItem(deleteTrashButton.dataset.deleteTrash);
    return;
  }
  const collectionMenuButton = target.closest("[data-collection-menu]");
  if (collectionMenuButton) {
    const id = collectionMenuButton.dataset.collectionMenu;
    state.collectionMenuId = state.collectionMenuId === id ? null : id;
    renderCollectionNav();
    if (state.collectionMenuId) {
      requestAnimationFrame(() => {
        elements.collectionNav
          .querySelector(`[data-rename-collection="${CSS.escape(id)}"]`)
          ?.focus();
      });
    }
    return;
  }
  if (state.collectionMenuId) {
    state.collectionMenuId = null;
    renderCollectionNav();
  }
  const deleteAssetButton = target.closest("[data-delete-asset]");
  if (deleteAssetButton) {
    await deleteAsset(deleteAssetButton.dataset.deleteAsset);
    return;
  }

  const deleteCollectionButton = target.closest("[data-delete-collection]");
  if (deleteCollectionButton) {
    await deleteCollection(deleteCollectionButton.dataset.deleteCollection);
    return;
  }

  const renameCollectionButton = target.closest("[data-rename-collection]");
  if (renameCollectionButton) {
    const collection = state.collections.find(
      (item) => item.id === renameCollectionButton.dataset.renameCollection,
    );
    if (collection) openCollectionDialog(collection);
    return;
  }

  const cancelJobButton = target.closest("[data-cancel-job]");
  if (cancelJobButton) {
    await cancelJob(cancelJobButton.dataset.cancelJob);
    return;
  }

  const openAssetButton = target.closest("[data-open-asset]");
  if (openAssetButton) {
    const id = openAssetButton.dataset.openAsset;
    if (event.shiftKey) selectBatchRange(id);
    else if (event.ctrlKey || event.metaKey) toggleBatch(id);
    await selectAsset(id);
    return;
  }

  const batchButton = target.closest("[data-batch-id]");
  if (batchButton) {
    toggleBatch(batchButton.dataset.batchId);
    return;
  }

  const collectionButton = target.closest("[data-collection-id]");
  if (collectionButton) {
    await openCollection(collectionButton.dataset.collectionId);
    return;
  }

  const actionTarget = target.closest("[data-action]");
  if (actionTarget) {
    const action = actionTarget.dataset.action;
    if (action === "settings") {
      await openSettings();
    } else if (action === "new-collection") {
      openCollectionDialog();
    } else if (action === "import") {
      elements.fileInput.click();
    } else if (action === "clear-filters") {
      clearFilters();
    }
    return;
  }

  const viewButton = target.closest("[data-view]");
  if (viewButton) {
    state.view = viewButton.dataset.view;
    state.activeCollectionId = null;
    state.selectedId = null;
    state.selectedIds.clear();
    if (state.view === "inbox") {
      state.status = "";
      elements.statusFilter.value = "";
    }
    if (["tags", "trash", "skills", "mcps"].includes(state.view)) {
      state.query = "";
      state.discipline = "";
      state.status = "";
      elements.searchInput.value = "";
      elements.disciplineFilter.value = "";
      elements.statusFilter.value = "";
    }
    if (state.view === "skills") await refreshSkills();
    else if (state.view === "mcps") await refreshMcps();
    else if (state.view === "tags" || state.view === "trash") {
      await refreshUtilityViews();
      renderAll();
    } else await refreshAssets();
    closeInspector();
    elements.workspace.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  if (target.closest("[data-close-inspector]")) {
    closeInspector();
    return;
  }

  const analyzeButton = target.closest("[data-analyze-id]");
  if (analyzeButton) {
    await analyzeAssets([analyzeButton.dataset.analyzeId]);
    return;
  }

  const copyButton = target.closest("[data-copy-prompt]");
  if (copyButton) {
    await copyPrompt(copyButton.dataset.copyPrompt);
    return;
  }

  const addCollectionButton = target.closest("[data-add-to-collection]");
  if (addCollectionButton) {
    const select = document.querySelector("#inspector-collection-select");
    try {
      await addToCollection(
        addCollectionButton.dataset.addToCollection,
        select?.value || "",
      );
    } catch (error) {
      notify(`无法加入收藏集：${error.message}`, "error");
    }
    return;
  }

  const removeCollectionButton = target.closest("[data-remove-collection]");
  if (removeCollectionButton) {
    try {
      await removeFromCollection(
        removeCollectionButton.dataset.assetId,
        removeCollectionButton.dataset.removeCollection,
      );
    } catch (error) {
      notify(`无法移出收藏集：${error.message}`, "error");
    }
    return;
  }

  const closeDialogButton = target.closest("[data-close-dialog]");
  if (closeDialogButton) {
    closeDialog(closeDialogButton.closest("dialog"));
    return;
  }

  const clickedWorkspaceBlank =
    target === elements.workspace ||
    target === elements.gallery ||
    Boolean(target.closest(".workspace-heading"));
  if (state.selectedId && !isMobileInspector() && clickedWorkspaceBlank) {
    closeInspector();
  }
});

elements.analysisAddColorButton.addEventListener("click", () => {
  addAnalysisPaletteRow();
});

elements.analysisPaletteEditor.addEventListener("input", (event) => {
  const row = event.target.closest(".analysis-color-row");
  if (!row) return;
  const picker = row.querySelector(".analysis-color-picker");
  const hex = row.querySelector(".analysis-color-hex");
  if (event.target === picker) hex.value = picker.value.toUpperCase();
  if (event.target === hex && /^#[0-9A-Fa-f]{6}$/.test(hex.value)) {
    picker.value = hex.value;
  }
});

document.addEventListener("dblclick", (event) => {
  const token = event.target.closest("[data-tag-token]");
  if (token && !event.target.closest("[data-remove-tag]")) {
    editTagToken(token);
    return;
  }
  const managedTag = event.target.closest("[data-rename-managed-tag]");
  if (managedTag) editManagedTag(managedTag);
});

document.addEventListener("change", (event) => {
  const select = event.target.closest?.("[data-select-agent]");
  if (select) selectAgent(select.value);
});

document.addEventListener("keydown", (event) => {
  const input = event.target.closest?.("[data-tag-input]");
  if (!input) return;
  if (event.key === "Enter" || event.key === "," || event.key === "，") {
    event.preventDefault();
    addTagToEditor(input);
  }
});

document.addEventListener("input", (event) => {
  const input = event.target.closest?.("[data-tag-input]");
  if (!input || !/[，,]/u.test(input.value)) return;
  addTagToEditor(input);
});

document.addEventListener("focusout", (event) => {
  const input = event.target.closest?.("[data-tag-input]");
  if (input) {
    addTagToEditor(input);
    input.hidden = true;
    input.closest("[data-tag-list]")?.classList.remove("is-adding");
  }
});

document.addEventListener(
  "error",
  (event) => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement)) return;
    image.alt = `${image.alt || "图片"}（无法读取）`;
    image.hidden = true;
    const placeholder = document.createElement("span");
    placeholder.className = "queue-placeholder-thumb";
    placeholder.setAttribute("aria-hidden", "true");
    image.after(placeholder);
  },
  true,
);

document.addEventListener("keydown", (event) => {
  if (trapMobileInspectorFocus(event)) return;
  if (event.key === "/" && !isTypingTarget(event.target)) {
    event.preventDefault();
    elements.searchInput.focus();
    return;
  }
  if (event.key === "Escape" && state.collectionMenuId) {
    state.collectionMenuId = null;
    renderCollectionNav();
    return;
  }
  if (event.key === "Escape" && state.selectedId) {
    closeInspector();
    return;
  }
  if (isTypingTarget(event.target) || document.querySelector("dialog[open]")) {
    return;
  }
  if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    moveSelection(-1);
  } else if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    moveSelection(1);
  }
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    window.clearInterval(state.pollTimer);
    state.pollTimer = null;
  } else if (!state.pollTimer) {
    refreshJobs();
    state.pollTimer = window.setInterval(refreshJobs, 5500);
  }
});

state.syntheticAssets = createSyntheticStudies().map(normalizeAsset);
loadBootstrap({ preserveSelection: false });
state.pollTimer = window.setInterval(refreshJobs, 5500);

// Runs inside the copied client's scope. Rendering and controls remain the product's own code.
async function copyDemoText(value){
  const previous=document.activeElement;
  try{if(document.featurePolicy?.allowsFeature('clipboard-write')===false||!navigator.clipboard)throw new Error('Use local clipboard fallback');await navigator.clipboard.writeText(value);}
  catch{
    const field=document.createElement('textarea');field.value=value;field.style.cssText='position:fixed;top:0;left:0;opacity:0';document.body.append(field);field.select();
    const copied=document.execCommand('copy');field.remove();previous?.focus({preventScroll:true});if(!copied)throw new Error('请手动选择内容复制');
  }
}
copyPrompt=async key=>{
  const asset=assetById(state.selectedId);if(!asset)return;
  const analysis=normalizedAnalysis(asset),prompt=analysis.isV2?readableValue(asObject(analysis.data.prompts)[key]):analysis.prompts[key];if(!prompt)return;
  try{await copyDemoText(prompt);notify('提示词已复制到剪贴簿。');}catch(error){notify(`无法复制提示词：${error.message}`,'error');}
};
copyPaletteColor=async button=>{
  const color=safeColor(button.dataset.copyColor).toUpperCase();
  try{await copyDemoText(color);notify(`${color} 已复制。`);}catch(error){notify(`无法复制色值：${error.message}`,'error');}
};
function revealDemoResult(){
  const heading=elements.inspector.querySelector('.inspector-analysis-heading');
  if(!heading)return;
  const top=heading.getBoundingClientRect().top-elements.inspector.getBoundingClientRect().top+elements.inspector.scrollTop-64;
  elements.inspector.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
}
const nativeImportFiles=importFiles;
let referenceImportPending=false;
importFiles=async()=>window.styleAtlasDemoClient.importReference('lighting');
elements.fileInput.disabled=true;
document.querySelectorAll('input[type="file"]').forEach(input=>{input.disabled=true;});
window.styleAtlasDemoClient={
  async updateQueue(){await refreshJobs();},
  async refresh(id){await loadBootstrap({preserveSelection:false});if(id)await selectAsset(String(id));},
  async showResult(id){state.view='library';state.query='';state.status='';elements.searchInput.value='';state.queueExpanded=false;await loadBootstrap({preserveSelection:false});await selectAsset(String(id));state.queueExpanded=false;state.jobs=state.jobs.filter(job=>['queued','processing','failed','needs_setup'].includes(job.status));renderAll();notify('分析记录已打开，可查看并复制提示词。');requestAnimationFrame(revealDemoResult);},
  async importReference(key){
    if(referenceImportPending)return;
    const record=window.STYLE_ATLAS_DEMO_FIXTURES.records.find(item=>item.key===key);if(!record)return;
    referenceImportPending=true;
    try{
      const bytes=Uint8Array.from(atob(record.media.split(',')[1]),char=>char.charCodeAt(0));
      await nativeImportFiles([new File([bytes],`${key}.webp`,{type:'image/webp'})]);
      if(isMobileInspector()&&state.selectedId&&!assetById(state.selectedId)?.currentAnalysis){state.selectedIds.add(state.selectedId);closeInspector();}
    }finally{referenceImportPending=false;}
  },
  async reset(){window.clearInterval(state.pollTimer);state.view='library';state.query='';state.status='';state.discipline='';state.selectedIds.clear();state.selectedId=null;state.activeCollectionId=null;state.queueExpanded=false;elements.searchInput.value='';closeInspector();document.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());await loadBootstrap({preserveSelection:false});state.pollTimer=window.setInterval(refreshJobs,5500);},
  async openCase(key){await window.styleAtlasDemoClient.importReference(key);await window.styleAtlasDemo.completeReference(key);},
};
// The website imports only its reference; the original controls never open a file chooser.
document.addEventListener('click',event=>{
  if(!event.target.closest('#import-button,[data-action="import"],#file-input'))return;
  event.preventDefault();event.stopImmediatePropagation();window.styleAtlasDemoClient.importReference('lighting');
},true);
document.addEventListener('click',event=>{
  if(event.target.closest('[data-copy-prompt],[data-copy-color]'))window.styleAtlasDemo.send('copied');
});
document.addEventListener('change',event=>{
  if(event.target.id==='analysis-rule-select')window.styleAtlasDemo.ruleChanged(event.target.value);
});
for(const type of ['dragenter','dragover'])document.addEventListener(type,event=>{
  if(!event.dataTransfer.types.includes('Files'))return;
  event.preventDefault();event.stopImmediatePropagation();event.dataTransfer.dropEffect='none';setDropImportActive(false);
},true);
document.addEventListener('dragover',event=>{
  if(event.dataTransfer.types.includes('application/x-style-atlas-reference')){event.preventDefault();event.dataTransfer.dropEffect='copy';document.body.classList.add('demo-drag-active');}
},true);
document.addEventListener('dragleave',event=>{if(!event.relatedTarget)document.body.classList.remove('demo-drag-active');},true);
document.addEventListener('drop',event=>{
  const key=event.dataTransfer.getData('application/x-style-atlas-reference');
  document.body.classList.remove('demo-drag-active');
  if(key==='lighting'){event.preventDefault();event.stopImmediatePropagation();window.styleAtlasDemoClient.importReference('lighting');return;}
  if(event.dataTransfer.types.includes('Files')){event.preventDefault();event.stopImmediatePropagation();setDropImportActive(false);notify('网页体验仅使用光影样图，请点击导入开始。');}
},true);
window.addEventListener('message',async event=>{
  if(event.source!==parent||event.data?.channel!=='style-atlas-parent')return;
  if(event.data.action==='import-reference')window.styleAtlasDemoClient.importReference('lighting');
  if(event.data.action==='reset')window.styleAtlasDemo.reset();
  if(event.data.action==='open-case')window.styleAtlasDemoClient.openCase(event.data.key);
  if(event.data.action==='handshake')window.styleAtlasDemo.send('ready');
  if(event.data.action==='guide-focus'){
    state.view='library';state.status='';state.query='';elements.searchInput.value='';
    const snapshot=window.styleAtlasDemo.snapshot();
    if(snapshot.currentId){
      if(snapshot.stage==='result'){await selectAsset(String(snapshot.currentId));requestAnimationFrame(revealDemoResult);return;}
      state.selectedIds.add(String(snapshot.currentId));if(isMobileInspector())closeInspector();
    }
    renderAll();
    const target=document.querySelector(window.styleAtlasDemo.targetSelector());
    target?.scrollIntoView({block:'nearest',inline:'nearest'});target?.focus({preventScroll:true});
  }
});
document.addEventListener('keydown',event=>{if(event.key==='Escape')window.styleAtlasDemo.send('escape');});
window.styleAtlasDemo.send('ready');

})();
