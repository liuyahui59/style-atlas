import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const sourceFiles = [
  "data.js", "data-extra.js", "data-more.js", "visual-genes.js", "artworks.js",
  "aesthetic-styles.js", "chinese-visual-directions.js", "style-prompt-data.js",
  "prompt-options.js", "visual-vocabulary-mechanics.js", "visual-vocabulary.js"
];
const source = `${(await Promise.all(sourceFiles.map((file) => readFile(new URL(file, root), "utf8")))).join("\n")}\nglobalThis.result = {
  STYLE_DATA,
  STYLE_PROMPT_DATA,
  FILTER_GROUPS,
  PROMPT_CONTROL_GROUPS,
  VISUAL_VOCABULARY_GROUPS,
  VISUAL_VOCABULARY_COUNT,
  buildStylePromptText,
  buildStyleNegativeText
};`;
const context = {};
vm.createContext(context);
vm.runInContext(source, context);

const {
  STYLE_DATA,
  STYLE_PROMPT_DATA,
  PROMPT_CONTROL_GROUPS,
  VISUAL_VOCABULARY_GROUPS,
  VISUAL_VOCABULARY_COUNT,
  buildStylePromptText,
  buildStyleNegativeText
} = context.result;
const ids = new Set(STYLE_DATA.map((style) => style.id));
const errors = [];
const forbiddenVisualGeneTermsZh = ["人物", "角色", "人体", "动物", "鸟类", "花卉", "花朵", "藤蔓", "面具", "走廊", "门窗", "城市", "建筑物", "飞船", "宇航服", "书架", "旧书", "眼睛", "怪物", "废墟", "街道", "雕像", "棕榈", "齿轮", "管道", "山水", "庭院"];
const forbiddenVisualGeneTermsEn = ["person", "people", "human", "character", "animal", "bird", "flower", "vine", "mask", "corridor", "doorway", "city", "building", "spacecraft", "spacesuit", "bookshelf", "book", "creature", "ruin", "street", "statue", "palm", "gear", "pipe", "landscape", "garden", "wall"];
const genericPromptTerms = ["高质量", "杰作", "高级感", "震撼", "精致完成度", "清晰视觉层级", "高细节", "high quality", "best quality", "masterpiece", "award-winning", "refined finish", "highly detailed", "ultra-detailed", "high-detail", "visual impact"];
const legacyPromptFields = ["prompt", "promptZh", "promptEn", "aiPrompt", "visualSpec"];
const modelPromptPrefixesZh = ["构图采用", "视角与空间表现采用", "将用户主体转译为", "配色限定为", "光影采用", "成像与笔触采用", "材质与表面呈现为", "仅在用户要求文字时采用", "仅局部使用", "整体视觉采用"];
const modelPromptPrefixesEn = ["compose with", "use ", "translate the supplied subjects into", "limit the palette to", "render marks and edges with", "render materials and surfaces as", "only when text is requested", "apply "];

if (STYLE_DATA.length !== 123) errors.push(`Expected 123 styles, found ${STYLE_DATA.length}`);
if (ids.size !== STYLE_DATA.length) errors.push("Duplicate style ids found");

for (const style of STYLE_DATA) {
  const required = ["id", "nameZh", "nameEn", "type", "period", "region", "track", "summary", "recognition", "genes", "visualGenes", "palette"];
  required.forEach((field) => {
    if (!style[field]) errors.push(`${style.id}: missing ${field}`);
  });
  legacyPromptFields.forEach((field) => {
    if (field in style) errors.push(`${style.id}: legacy prompt field ${field} must not exist`);
  });
  if (!style.visualGenes?.length) errors.push(`${style.id}: missing core visual genes`);
  const visualGenePairs = new Set();
  (style.visualGenes || []).forEach((gene, index) => {
    if (!gene.zh?.trim() || !gene.en?.trim()) errors.push(`${style.id}: incomplete visual gene ${index}`);
    const pair = `${gene.zh.trim()}|${gene.en.trim()}`;
    if (visualGenePairs.has(pair)) errors.push(`${style.id}: duplicate visual gene ${index}`);
    visualGenePairs.add(pair);
    forbiddenVisualGeneTermsZh.forEach((term) => {
      if (gene.zh.includes(term)) errors.push(`${style.id}: visual gene ${index} contains subject cue ${term}`);
    });
    forbiddenVisualGeneTermsEn.forEach((term) => {
      if (new RegExp(`\\b${term}s?\\b`, "i").test(gene.en)) errors.push(`${style.id}: visual gene ${index} contains subject cue ${term}`);
    });
    genericPromptTerms.forEach((term) => {
      if (`${gene.zh} ${gene.en}`.toLowerCase().includes(term.toLowerCase())) errors.push(`${style.id}: visual gene ${index} contains generic prompt term ${term}`);
    });
  });
  Object.entries(style.genes || {}).forEach(([gene, values]) => {
    if (!Array.isArray(values) || values.length < 1) errors.push(`${style.id}: invalid gene ${gene}`);
  });
  (style.related || []).forEach((relatedId) => {
    if (!ids.has(relatedId)) errors.push(`${style.id}: unknown related style ${relatedId}`);
  });
}

const promptEntries = Object.entries(STYLE_PROMPT_DATA);
if (promptEntries.length !== STYLE_DATA.length) errors.push(`Expected ${STYLE_DATA.length} unified prompts, found ${promptEntries.length}`);
const promptLengths = [];
for (const style of STYLE_DATA) {
  const prompt = STYLE_PROMPT_DATA[style.id];
  if (!prompt) {
    errors.push(`${style.id}: missing unified prompt data`);
    continue;
  }
  if (!Array.isArray(prompt.genes) || prompt.genes.length < 3) {
    errors.push(`${style.id}: expected at least 3 weighted prompt genes`);
    continue;
  }
  const coreGenes = prompt.genes.filter((gene) => gene.kind === "core");
  const adjustableGenes = prompt.genes.filter((gene) => gene.kind === "adjustable");
  if (!coreGenes.length) errors.push(`${style.id}: missing core prompt genes`);
  if (!adjustableGenes.length) errors.push(`${style.id}: missing adjustable prompt genes`);
  const geneLabels = new Set();
  const geneIds = new Set();
  const promptDimensions = new Set();
  prompt.genes.forEach((gene, index) => {
    const requiredGeneFields = ["id", "kind", "dimension", "dimensionZh", "labelZh", "labelEn", "promptZh", "promptEn", "level"];
    requiredGeneFields.forEach((field) => {
      if (!gene[field]?.trim()) errors.push(`${style.id}: prompt gene ${index} missing ${field}`);
    });
    if (!["core", "adjustable"].includes(gene.kind)) errors.push(`${style.id}: invalid prompt gene kind ${gene.kind}`);
    if (gene.kind === "core" && gene.weight < 0.86) errors.push(`${style.id}: core prompt gene below audited weight threshold ${gene.labelZh}`);
    if (gene.kind === "adjustable" && gene.weight >= 0.86) errors.push(`${style.id}: adjustable prompt gene above audited weight threshold ${gene.labelZh}`);
    if (geneIds.has(gene.id)) errors.push(`${style.id}: duplicate prompt gene id ${gene.id}`);
    geneIds.add(gene.id);
    if (!Number.isFinite(gene.weight) || gene.weight <= 0 || gene.weight > 1) errors.push(`${style.id}: invalid prompt gene weight ${index}`);
    if (gene.promptZh === gene.labelZh || gene.promptEn === gene.labelEn) errors.push(`${style.id}: prompt gene ${index} copies its human label without model instructions`);
    if (!modelPromptPrefixesZh.some((prefix) => gene.promptZh.startsWith(prefix))) errors.push(`${style.id}: prompt gene ${index} lacks an executable Chinese instruction`);
    if (!modelPromptPrefixesEn.some((prefix) => gene.promptEn.startsWith(prefix))) errors.push(`${style.id}: prompt gene ${index} lacks an executable English instruction`);
    promptDimensions.add(gene.dimension);
    for (const label of [gene.labelZh?.trim(), gene.labelEn?.trim()]) {
      if (!label) continue;
      if (geneLabels.has(label)) errors.push(`${style.id}: duplicate prompt gene label ${label}`);
      geneLabels.add(label);
    }
  });
  if (promptDimensions.size < 3) errors.push(`${style.id}: complete prompt covers fewer than 3 visual dimensions`);
  for (const group of [coreGenes, adjustableGenes]) {
    group.forEach((gene, index) => {
      if (index > 0 && gene.weight > group[index - 1].weight) errors.push(`${style.id}: ${gene.kind} prompt gene weights are not descending`);
    });
  }

  const fullPromptZh = buildStylePromptText(style, { language: "zh", activeGenes: prompt.genes });
  const fullPromptEn = buildStylePromptText(style, { language: "en", activeGenes: prompt.genes });
  prompt.genes.forEach((gene) => {
    const remainingGenes = prompt.genes.filter((item) => item.id !== gene.id);
    const reducedPromptZh = buildStylePromptText(style, { language: "zh", activeGenes: remainingGenes });
    const reducedPromptEn = buildStylePromptText(style, { language: "en", activeGenes: remainingGenes });
    if (!fullPromptZh.includes(gene.promptZh)) errors.push(`${style.id}: full prompt does not include mapped instruction for ${gene.id}`);
    if (!fullPromptEn.includes(gene.promptEn)) errors.push(`${style.id}: full English prompt does not include mapped instruction for ${gene.id}`);
    if (reducedPromptZh.includes(gene.promptZh) || reducedPromptEn.includes(gene.promptEn)) errors.push(`${style.id}: disabling ${gene.id} does not remove its mapped instruction`);
    if (reducedPromptZh === fullPromptZh || reducedPromptEn === fullPromptEn) errors.push(`${style.id}: disabling ${gene.id} does not change both prompts`);
  });

  const defaultPromptZh = buildStylePromptText(style, { language: "zh" });
  const defaultPromptEn = buildStylePromptText(style, { language: "en" });
  prompt.genes.forEach((gene) => {
    if (!defaultPromptZh.includes(gene.promptZh) || !defaultPromptEn.includes(gene.promptEn)) errors.push(`${style.id}: complete default prompt omits gene ${gene.id}`);
  });

  for (const language of ["zh", "en"]) {
    for (const intensity of ["借鉴", "明显", "主导"]) {
      const text = buildStylePromptText(style, { language, intensity });
      if (!text.trim()) errors.push(`${style.id}: empty ${language} prompt at ${intensity} intensity`);
      if (language === "zh" && !text.endsWith("。")) errors.push(`${style.id}: Chinese prompt has incorrect terminal punctuation`);
      if (language === "en" && !text.endsWith(".")) errors.push(`${style.id}: English prompt has incorrect terminal punctuation`);
      if (/禁止新增主体|不新增主体|必须同时满足/.test(text)) errors.push(`${style.id}: default prompt contains an over-restrictive instruction`);
      if (/允许补充|独立控制项优先|确保主体完整/.test(text)) errors.push(`${style.id}: default prompt contains non-style boilerplate`);
      if (text.includes(buildStyleNegativeText(language))) errors.push(`${style.id}: negative prompt leaked into positive prompt`);
      if (language === "zh" && intensity === "明显") promptLengths.push(text.length);
    }
  }
}
const unknownPromptIds = promptEntries.map(([id]) => id).filter((id) => !ids.has(id));
if (unknownPromptIds.length) errors.push(`Unknown unified prompt ids: ${unknownPromptIds.join(", ")}`);
const averagePromptLength = promptLengths.reduce((sum, length) => sum + length, 0) / promptLengths.length;
if (averagePromptLength > 260) errors.push(`Average Chinese prompt is too long: ${averagePromptLength.toFixed(1)} characters`);

const requiredControls = ["composition", "viewpoint", "shot", "lens", "depth", "lighting", "color", "form", "medium", "texture", "mood"];
const controlIds = PROMPT_CONTROL_GROUPS.map((group) => group.id);
if (new Set(controlIds).size !== requiredControls.length || requiredControls.some((id) => !controlIds.includes(id))) {
  errors.push("Prompt control groups are missing or duplicated");
}
PROMPT_CONTROL_GROUPS.forEach((group) => {
  if (!group.label || !group.color || !Array.isArray(group.options) || group.options.length < 5) {
    errors.push(`${group.id}: invalid prompt control group`);
  }
  group.options.forEach((option, index) => {
    if (!option.zh || !option.en) errors.push(`${group.id}[${index}]: invalid bilingual option`);
  });
});

const vocabularyFields = ["definition", "family", "controls", "mechanism", "observable", "effect", "boundary", "descriptionZh", "descriptionEn"];
const vocabularyOptions = VISUAL_VOCABULARY_GROUPS.flatMap((group) => group.options);
const vocabularyFingerprints = new Set();
if (VISUAL_VOCABULARY_COUNT !== vocabularyOptions.length || vocabularyOptions.length !== 112) {
  errors.push(`Expected 112 visual vocabulary records, found ${vocabularyOptions.length}`);
}
vocabularyOptions.forEach((option) => {
  vocabularyFields.forEach((field) => {
    if (!option[field]?.trim()) errors.push(`${option.zh}: missing vocabulary field ${field}`);
  });
  const fingerprint = vocabularyFields.slice(1).map((field) => option[field]?.trim()).join("|");
  if (vocabularyFingerprints.has(fingerprint)) errors.push(`${option.zh}: duplicate vocabulary mechanics record`);
  vocabularyFingerprints.add(fingerprint);
});

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${STYLE_DATA.length} styles and ${PROMPT_CONTROL_GROUPS.length} prompt control groups`);
}
