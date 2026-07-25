import { readFile } from "node:fs/promises";
import vm from "node:vm";

const root = new URL("../", import.meta.url);
const source = `${await readFile(new URL("data.js", root), "utf8")}\n${await readFile(new URL("data-extra.js", root), "utf8")}\n${await readFile(new URL("data-more.js", root), "utf8")}\n${await readFile(new URL("visual-genes.js", root), "utf8")}\n${await readFile(new URL("prompt-options.js", root), "utf8")}\nglobalThis.result = { STYLE_DATA, FILTER_GROUPS, PROMPT_CONTROL_GROUPS };`;
const context = {};
vm.createContext(context);
vm.runInContext(source, context);

const { STYLE_DATA, PROMPT_CONTROL_GROUPS } = context.result;
const ids = new Set(STYLE_DATA.map((style) => style.id));
const errors = [];
const forbiddenVisualGeneTermsZh = ["人物", "角色", "人体", "动物", "鸟类", "花卉", "花朵", "藤蔓", "面具", "走廊", "门窗", "城市", "建筑物", "飞船", "宇航服", "书架", "旧书", "眼睛", "怪物", "废墟", "街道", "雕像", "棕榈", "齿轮", "管道", "山水", "庭院"];
const forbiddenVisualGeneTermsEn = ["person", "people", "human", "character", "animal", "bird", "flower", "vine", "mask", "corridor", "doorway", "city", "building", "spacecraft", "spacesuit", "bookshelf", "book", "creature", "ruin", "street", "statue", "palm", "gear", "pipe", "landscape", "garden", "wall"];
const genericPromptTerms = ["高质量", "杰作", "高级感", "震撼", "精致完成度", "清晰视觉层级", "高细节", "high quality", "best quality", "masterpiece", "award-winning", "refined finish", "highly detailed", "ultra-detailed", "high-detail", "visual impact"];

if (STYLE_DATA.length !== 100) errors.push(`Expected 100 styles, found ${STYLE_DATA.length}`);
if (ids.size !== STYLE_DATA.length) errors.push("Duplicate style ids found");

for (const style of STYLE_DATA) {
  const required = ["id", "nameZh", "nameEn", "type", "period", "region", "track", "summary", "recognition", "genes", "visualGenes", "palette", "promptZh", "promptEn"];
  required.forEach((field) => {
    if (!style[field]) errors.push(`${style.id}: missing ${field}`);
  });
  if (style.promptZh?.length !== style.promptEn?.length || style.promptZh?.length < 5) {
    errors.push(`${style.id}: invalid prompt pairs`);
  }
  if (!style.visualGenes?.length) errors.push(`${style.id}: missing core visual genes`);
  if (JSON.stringify(style.promptZh.slice(1)) !== JSON.stringify(style.visualGenes.map((gene) => gene.zh))) {
    errors.push(`${style.id}: Chinese prompt is not derived from visual genes`);
  }
  if (JSON.stringify(style.promptEn.slice(1)) !== JSON.stringify(style.visualGenes.map((gene) => gene.en))) {
    errors.push(`${style.id}: English prompt is not derived from visual genes`);
  }
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

if (errors.length) {
  console.error(errors.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Validated ${STYLE_DATA.length} styles and ${PROMPT_CONTROL_GROUPS.length} prompt control groups`);
}
