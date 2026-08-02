import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateClassicExpression, loadClassicScripts, STYLE_SOURCE_FILES } from "./lib/classic-script-loader.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(root, "style-prompt-data.js");
const checkOnly = process.argv.includes("--check");
const context = await loadClassicScripts(root, STYLE_SOURCE_FILES);

const styles = JSON.parse(JSON.stringify(evaluateClassicExpression(context, "STYLE_DATA")));
const profiles = JSON.parse(await readFile(resolve(root, "style-control-profiles.json"), "utf8")).profiles;
const audits = JSON.parse(await readFile(resolve(root, "style-gene-audit.json"), "utf8")).styles;
const visualGeneDimensions = [
  ["compositionSpace", "构图与空间"],
  ["formGeometry", "形态与几何"],
  ["colorTone", "色彩与调性"],
  ["lightingImaging", "光线与成像"],
  ["materialTexture", "材质与纹理"],
  ["typographyLayout", "字体与版式"]
];
const dimensionLabels = Object.fromEntries([
  ...visualGeneDimensions,
  ["viewpointLens", "视角与镜头"],
  ["mediumTechnique", "媒介与技法"],
  ["imperfectionEffect", "瑕疵与视觉效果"],
  ["styleExecution", "整体执行"]
]);
const validDimensions = new Set(Object.keys(dimensionLabels));
const defaultWeights = [1, 0.93, 0.86, 0.78, 0.7, 0.62, 0.55, 0.48];

function cleanConditionalTypographyLabel(label, language) {
  if (language === "zh") {
    return label.replace(/^(?:仅在用户要求文字时[,，]?(?:采用|使用)?|仅?按需使用|仅按原文使用)/, "");
  }
  return label
    .replace(/^only when text is requested,?\s*(?:use\s*)?/i, "")
    .replace(/\s+using exact supplied text only$/i, "")
    .replace(/\s+preserving exact text only when requested$/i, "")
    .replace(/\s+only when requested$/i, "");
}

function makeConditionalTypographyPrompt(label, language) {
  const cleaned = cleanConditionalTypographyLabel(label, language).trim();
  if (language === "zh") {
    const action = /^(?:采用|使用|保留|保持|准确|避免|不要|不生成|将|以)/.test(cleaned) ? cleaned : `采用${cleaned}`;
    const readability = /(?:准确)?保留原文/.test(cleaned) ? "，字形保持清楚可读" : "，并保持原文可读";
    return `仅在用户要求文字时，${action}${readability}`;
  }
  const action = /^(?:use|preserve|retain|keep|avoid|do not|set|integrate|apply)\b/i.test(cleaned) ? cleaned : `use ${cleaned}`;
  const readability = /preserve the exact (?:wording|text)/i.test(cleaned) ? ", with clearly legible glyph construction" : ", and preserve the exact readable wording";
  return `only when text is requested, ${action}${readability}`;
}

const genePromptTemplates = {
  compositionSpace: {
    zh: (label) => `构图采用${label}`,
    en: (label) => `compose with ${label}`
  },
  viewpointLens: {
    zh: (label) => `视角与空间表现采用${label}`,
    en: (label) => `use ${label} for viewpoint and spatial rendering`
  },
  formGeometry: {
    zh: (label) => `将用户主体转译为${label}，保持身份与关键结构`,
    en: (label) => `translate the supplied subjects into ${label} while preserving identity and defining structure`
  },
  colorTone: {
    zh: (label) => `配色限定为${label}`,
    en: (label) => `limit the palette to ${label}`
  },
  lightingImaging: {
    zh: (label) => `光影采用${label}`,
    en: (label) => `use ${label} for lighting and tonal rendering`
  },
  mediumTechnique: {
    zh: (label) => `成像与笔触采用${label}`,
    en: (label) => `render marks and edges with ${label}`
  },
  materialTexture: {
    zh: (label) => `材质与表面呈现为${label}`,
    en: (label) => `render materials and surfaces as ${label}`
  },
  typographyLayout: {
    zh: (label) => makeConditionalTypographyPrompt(label, "zh"),
    en: (label) => makeConditionalTypographyPrompt(label, "en")
  },
  imperfectionEffect: {
    zh: (label) => `仅局部使用${label}`,
    en: (label) => `use ${label} only as a controlled local effect`
  },
  styleExecution: {
    zh: (label) => `整体视觉采用${label}`,
    en: (label) => `apply ${label} across the visual treatment`
  }
};

function makeGene({ dimension, dimensionZh, labelZh, labelEn, weight, kind, level }) {
  const template = genePromptTemplates[dimension] || genePromptTemplates.styleExecution;
  return {
    id: "",
    kind,
    dimension,
    dimensionZh,
    labelZh,
    labelEn,
    promptZh: template.zh(labelZh),
    promptEn: template.en(labelEn),
    weight,
    level: level || (kind === "core" ? "核心" : "可调整")
  };
}

function inferVisualGeneDimension(gene, index) {
  const text = `${gene.zh} ${gene.en}`.toLowerCase();
  const rules = [
    ["typographyLayout", /文字|字体|字形|排版|题跋|书写|碑铭|typograph|letter|typeface|script|inscription|lettering/],
    ["mediumTechnique", /平涂|薄涂|厚涂|笔触|线描|水墨|套色|印刷|成像|渲染|摄影|拼贴|雕刻|绘制|brush|glaz|impasto|print|render|photograph|collage|carv|linework|flat fill/],
    ["viewpointLens", /视角|视点|透视|俯视|仰视|裁切|景深|空间|viewpoint|perspective|foreshorten|crop|depth|spatial/],
    ["lightingImaging", /光线|光影|照明|明暗|阴影|高光|曝光|辉光|暗部|亮部|透光|发光|反射|\blights?\b|lighting|shadow|highlight|exposure|glow|lumin|chiaroscuro|tonal/],
    ["materialTexture", /材质|纹理|肌理|表面|纸|颜料|玻璃|金箔|石质|木纹|金属|塑料|纤维|颗粒|texture|surface|paper|pigment|glass|stone|metal|wood|plastic|fiber|grain/],
    ["colorTone", /配色|色彩|色调|色域|色阶|单色|多色|蓝|红|黄|绿|紫|黑|白|金色|银色|粉色|palette|colou?r|monochrome|\b(?:blue|red|yellow|green|violet|black|white|gold|silver|pink)\b/],
    ["compositionSpace", /构图|布局|轴线|对称|分层|留白|排列|节奏|网格|重叠|焦点|composition|layout|axis|symmetr|register|negative space|arrangement|rhythm|grid|overlap|focal/],
    ["formGeometry", /轮廓|形态|形体|几何|比例|体积|线条|曲线|结构|模块|边缘|outline|form|geometr|proportion|volume|line|curve|structure|module|edge/],
    ["imperfectionEffect", /故障|噪点|错位|磨损|做旧|失真|glitch|noise|misregistration|distortion|artifact/]
  ];
  const matched = rules.find(([, pattern]) => pattern.test(text));
  return matched?.[0] || visualGeneDimensions[index]?.[0] || "styleExecution";
}

const promptData = Object.fromEntries(styles.map((style) => {
  const profile = profiles[style.id];
  const currentVisualGeneLabels = new Set(style.visualGenes.flatMap((gene) => [gene.zh, gene.en]));
  const audit = audits[style.id] || {};
  const promotedLabels = new Set(audit.promote || []);
  const demotedLabels = new Set(audit.demote || []);
  const dimensionOverrides = audit.dimensions || {};
  const seenAuditLabels = new Set();
  const auditedClassification = (label, weight, fallbackKind, fallbackLevel) => {
    if (promotedLabels.has(label)) {
      seenAuditLabels.add(label);
      return { kind: "core", weight: Math.max(weight, 0.86), level: "强特征" };
    }
    if (demotedLabels.has(label)) {
      seenAuditLabels.add(label);
      return { kind: "adjustable", weight: Math.min(weight, 0.78), level: "支撑" };
    }
    return { kind: fallbackKind, weight, level: fallbackLevel };
  };
  const auditedDimension = (label, fallbackDimension) => {
    if (!dimensionOverrides[label]) return fallbackDimension;
    seenAuditLabels.add(label);
    return dimensionOverrides[label];
  };
  const genes = profile?.coreGenes?.filter((gene) => (
    currentVisualGeneLabels.has(gene.labelZh) || currentVisualGeneLabels.has(gene.labelEn)
  )).map((gene) => {
    const dimension = auditedDimension(gene.labelZh, gene.dimension);
    const classification = auditedClassification(
      gene.labelZh,
      gene.weight,
      gene.weight >= 0.86 ? "core" : "adjustable",
      gene.level
    );
    return makeGene({
      dimension,
      dimensionZh: dimensionLabels[dimension],
      labelZh: gene.labelZh,
      labelEn: gene.labelEn,
      ...classification
    });
  }) || [];
  const knownLabels = new Set(genes.flatMap((gene) => [gene.labelZh, gene.labelEn]));

  style.visualGenes.forEach((gene, index) => {
    if (knownLabels.has(gene.zh) || knownLabels.has(gene.en)) return;
    const expansionDimension = style.coreGeneKeys?.length ? visualGeneDimensions[index]?.[0] : null;
    const dimension = auditedDimension(gene.zh, expansionDimension || inferVisualGeneDimension(gene, index));
    const dimensionZh = dimensionLabels[dimension];
    const inferredWeight = defaultWeights[index] || 0.48 * (0.92 ** (index - defaultWeights.length + 1));
    const weight = profile ? Math.min(inferredWeight, 0.78) : inferredWeight;
    const configuredCoreKeys = new Set(style.coreGeneKeys || []);
    const sourceDimension = visualGeneDimensions[index]?.[0] || dimension;
    const classification = auditedClassification(
      gene.zh,
      weight,
      profile ? "adjustable" : (configuredCoreKeys.size
        ? (configuredCoreKeys.has(sourceDimension) ? "core" : "adjustable")
        : (index < 3 ? "core" : "adjustable"))
    );
    if (!profile && configuredCoreKeys.size) {
      classification.weight = classification.kind === "core"
        ? Math.max(classification.weight, 0.86)
        : Math.min(classification.weight, 0.78);
      classification.level = classification.kind === "core" ? "强特征" : "支撑";
    }
    genes.push(makeGene({
      dimension,
      dimensionZh,
      labelZh: gene.zh,
      labelEn: gene.en,
      ...classification
    }));
    knownLabels.add(gene.zh);
    knownLabels.add(gene.en);
  });

  const configuredAuditLabels = new Set([
    ...promotedLabels,
    ...demotedLabels,
    ...Object.keys(dimensionOverrides)
  ]);
  const missingAuditLabels = [...configuredAuditLabels].filter((label) => !seenAuditLabels.has(label));
  if (missingAuditLabels.length) throw new Error(`${style.id}: unmatched audited genes: ${missingAuditLabels.join(", ")}`);
  for (const [label, dimension] of Object.entries(dimensionOverrides)) {
    if (!validDimensions.has(dimension)) throw new Error(`${style.id}: invalid audited dimension ${dimension} for ${label}`);
  }

  genes.sort((a, b) => (a.kind === b.kind ? b.weight - a.weight : a.kind === "core" ? -1 : 1));
  genes.forEach((gene, index) => { gene.id = `gene-${index + 1}`; });
  if (genes.length < 3) throw new Error(`${style.id}: expected at least 3 prompt genes, found ${genes.length}`);
  if (!genes.some((gene) => gene.kind === "core")) throw new Error(`${style.id}: missing core prompt genes`);
  if (!genes.some((gene) => gene.kind === "adjustable")) throw new Error(`${style.id}: missing adjustable prompt genes`);
  return [style.id, { genes }];
}));

const policy = {
  intensity: {
    zh: {
      "借鉴": "轻度借鉴{name}的视觉处理",
      "明显": "以{name}作为清晰可识别的整体风格",
      "主导": "以{name}主导整体视觉"
    },
    en: {
      "借鉴": "Apply a subtle visual influence from {name}",
      "明显": "Use {name} as the clearly recognizable overall style",
      "主导": "Let {name} lead the overall visual treatment"
    }
  },
  content: {
    zh: "只改变视觉处理，保持用户主体的身份、数量、动作与关键结构",
    en: "Change only the visual treatment; preserve the supplied subjects' identity, count, action, and defining structure"
  },
  executionLead: {
    zh: "执行：",
    en: "Execution: "
  },
  negative: {
    zh: "主体残缺或重复，关键结构丢失，风格混杂，未经请求的文字，乱码，水印，品牌标志",
    en: "cropped or duplicated subjects, lost defining structure, mixed visual styles, unrequested text, illegible lettering, watermarks, brand logos"
  }
};

const output = `// Generated by scripts/generate-prompt-data.mjs. Edit the source profiles, then regenerate.\nconst STYLE_PROMPT_POLICY = Object.freeze(${JSON.stringify(policy, null, 2)});\n\nconst STYLE_PROMPT_DATA = Object.freeze(${JSON.stringify(promptData, null, 2)});\n\nfunction getStylePromptData(styleId) {\n  return STYLE_PROMPT_DATA[styleId] || null;\n}\n\nfunction buildStylePromptText(style, options = {}) {\n  const language = options.language === \"en\" ? \"en\" : \"zh\";\n  const data = getStylePromptData(style.id);\n  if (!data) return \"\";\n  const intensity = options.intensity || \"明显\";\n  const styleName = language === \"zh\" ? style.nameZh : style.nameEn;\n  const direction = STYLE_PROMPT_POLICY.intensity[language][intensity].replace(\"{name}\", styleName);\n  const sourceGenes = Array.isArray(options.activeGenes) ? options.activeGenes : data.genes;\n  const promptKey = language === \"zh\" ? \"promptZh\" : \"promptEn\";\n  const geneText = sourceGenes.map((gene) => gene[promptKey]).filter(Boolean).join(language === \"zh\" ? \"；\" : \"; \" );\n  const parts = [\n    direction,\n    STYLE_PROMPT_POLICY.content[language],\n    geneText ? STYLE_PROMPT_POLICY.executionLead[language] + geneText : \"\"\n  ].filter(Boolean);\n  return parts.join(language === \"zh\" ? \"。\" : \". \" ) + (language === \"zh\" ? \"。\" : \".\");\n}\n\nfunction buildStyleNegativeText(language = \"zh\") {\n  return STYLE_PROMPT_POLICY.negative[language === \"en\" ? \"en\" : \"zh\"];\n}\n`;

if (checkOnly) {
  const existing = await readFile(outputPath, "utf8").catch(() => null);
  if (existing !== output) {
    console.error("style-prompt-data.js is stale or missing");
    process.exitCode = 1;
  } else {
    console.log(`Validated unified prompt data for ${styles.length} styles`);
  }
} else {
  await writeFile(outputPath, output);
  console.log(`Generated unified prompt data for ${styles.length} styles`);
}
