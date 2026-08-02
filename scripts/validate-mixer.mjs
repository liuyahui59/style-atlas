import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { STYLE_PROMPT_SOURCE_FILES } from "./lib/classic-script-loader.mjs";

const root = new URL("../", import.meta.url);
const sourceFiles = [...STYLE_PROMPT_SOURCE_FILES, "mixer.js"];
const source = `${(await Promise.all(sourceFiles.map((file) => readFile(new URL(file, root), "utf8")))).join("\n")}
globalThis.mixerTestApi = {
  dimensions: MIXER_DIMENSIONS,
  state: mixerState,
  dom: mixerDom,
  styles: STYLE_DATA,
  strictStyleCount: STRICT_STYLE_COUNT,
  prompts: STYLE_PROMPT_DATA,
  getStyle: getMixerStyle,
  getAccentDimensions,
  getCoreOverlapDimensions,
  normalizeMixerDimensions,
  renderMixerOutput
};`;
const context = {
  console,
  URLSearchParams,
  document: { addEventListener() {}, querySelectorAll() { return []; }, execCommand() { return true; } },
  window: {},
  navigator: {},
  setTimeout,
  clearTimeout
};
vm.createContext(context);
vm.runInContext(source, context);

const api = context.mixerTestApi;
const errors = [];
const html = await readFile(new URL("../mixer.html", import.meta.url), "utf8");
const homepage = await readFile(new URL("../index.html", import.meta.url), "utf8");
const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
const requiredIds = [
  "mixSubject", "mixUse", "mixRatio", "primaryStyleSearch", "primaryStyleMenu",
  "accentStyleSearch", "accentStyleMenu",
  "primaryStylePreview", "accentStylePreview", "swapStylesButton", "mixStrengthControl",
  "mixDimensionList", "mixDimensionCount", "mixCheck", "mixStatusBadge", "mixPromptResult",
  "mixPromptAnatomy", "mixStructureContent", "mixStructureRatio", "copyMixPromptButton",
  "resetMixerButton", "mixerToast"
];

requiredIds.forEach((id) => {
  if (!html.includes(`id="${id}"`)) errors.push(`mixer.html: missing #${id}`);
});
if (!homepage.includes('id="openMixerButton"') || !homepage.includes('href="mixer.html?primary=')) {
  errors.push("index.html: Prompt workshop is missing the style-aware mixer entry");
}
if (!appSource.includes('dom.openMixerButton.href = `mixer.html?primary=${encodeURIComponent(style.id)}`')) {
  errors.push("app.js: mixer entry does not follow the selected Prompt style");
}
if (!html.includes('src="mixer.js?v=20260802-328"')) errors.push("mixer.html: mixer.js is not loaded with the current asset version");
if (!html.includes('src="strict-catalog.js?v=20260802-328"')) errors.push("mixer.html: strict catalog is not loaded with the current asset version");
if (!html.includes('href="styles.css?v=20260802-328"')) errors.push("mixer.html: stylesheet is not loaded with the current asset version");

const knownDimensions = new Set(Object.keys(api.dimensions));
for (const [styleId, prompt] of Object.entries(api.prompts)) {
  for (const gene of prompt.genes) {
    if (!knownDimensions.has(gene.dimension)) errors.push(`${styleId}: unsupported mixer dimension ${gene.dimension}`);
  }
}
if (api.styles.length !== api.strictStyleCount || Object.keys(api.prompts).length !== api.styles.length) {
  errors.push(`Expected the ${api.strictStyleCount}-style strict mixer catalog, found ${api.styles.length} styles and ${Object.keys(api.prompts).length} prompts`);
}

Object.assign(api.dom, {
  mixSubject: { value: "未来城市音乐节" },
  mixUse: { value: "海报" },
  mixRatio: { value: "纵向 2:3" },
  mixPromptResult: { value: "" },
  mixPromptAnatomy: { innerHTML: "" }
});
api.state.primaryStyleId = "constructivism";
api.state.accentStyleId = "synthwave";
api.state.selectedDimensions = new Set(["colorTone", "lightingImaging", "materialTexture"]);
api.state.strength = "明显";
api.state.outputMode = "zh";
api.renderMixerOutput();

const primaryPrompt = api.prompts[api.state.primaryStyleId];
const accentPrompt = api.prompts[api.state.accentStyleId];
const selected = api.state.selectedDimensions;
for (const gene of primaryPrompt.genes) {
  const shouldRemain = gene.kind === "core" || !selected.has(gene.dimension);
  if (shouldRemain && !api.state.outputs.zh.includes(gene.promptZh)) errors.push(`Primary gene omitted: ${gene.labelZh}`);
  if (!shouldRemain && api.state.outputs.zh.includes(gene.promptZh)) errors.push(`Replaced primary adjustable gene leaked: ${gene.labelZh}`);
  if (shouldRemain && !api.state.outputs.en.includes(gene.promptEn)) errors.push(`Primary English gene omitted: ${gene.labelEn}`);
}
for (const gene of accentPrompt.genes) {
  const shouldAppear = selected.has(gene.dimension);
  if (shouldAppear && !api.state.outputs.zh.includes(gene.promptZh)) errors.push(`Selected secondary gene omitted: ${gene.labelZh}`);
  if (!shouldAppear && api.state.outputs.zh.includes(gene.promptZh)) errors.push(`Unselected secondary gene leaked: ${gene.labelZh}`);
  if (shouldAppear && !api.state.outputs.en.includes(gene.promptEn)) errors.push(`Selected secondary English gene omitted: ${gene.labelEn}`);
}

const requiredZhPhrases = ["主导整体视觉", "只改变视觉处理", `仅从${api.getStyle(api.state.accentStyleId).nameZh}借用`, "不得引入辅助风格惯常的主体、题材、时代或场景", "融合约束"];
requiredZhPhrases.forEach((phrase) => {
  if (!api.state.outputs.zh.includes(phrase)) errors.push(`Chinese mix prompt missing constraint: ${phrase}`);
});
const requiredEnPhrases = ["lead the overall visual treatment", "Borrow only", "do not introduce that style's customary subjects", "Blend constraint"];
requiredEnPhrases.forEach((phrase) => {
  if (!api.state.outputs.en.includes(phrase)) errors.push(`English mix prompt missing constraint: ${phrase}`);
});
if (!api.state.outputs.negative.includes("两种风格平均混合")) errors.push("Negative prompt does not reject equal-weight style mixing");
if (!api.dom.mixPromptAnatomy.innerHTML.includes("构成主义") || !api.dom.mixPromptAnatomy.innerHTML.includes("融合约束")) {
  errors.push("Prompt anatomy does not expose the primary style and blend constraint");
}

for (const style of api.styles) {
  api.state.accentStyleId = style.id;
  api.state.selectedDimensions = new Set();
  api.normalizeMixerDimensions();
  const available = new Set(api.getAccentDimensions());
  if (api.state.selectedDimensions.size < 1 || api.state.selectedDimensions.size > 3) {
    errors.push(`${style.id}: invalid default selected dimension count ${api.state.selectedDimensions.size}`);
  }
  for (const dimension of api.state.selectedDimensions) {
    if (!available.has(dimension)) errors.push(`${style.id}: selected unavailable dimension ${dimension}`);
  }
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated the style mixer across ${api.styles.length} styles and ${knownDimensions.size} visual dimensions`);
}
