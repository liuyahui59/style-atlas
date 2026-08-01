import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outputPath = resolve(root, "style-prompt-data.js");
const checkOnly = process.argv.includes("--check");
const dataFiles = [
  "data.js",
  "data-extra.js",
  "data-more.js",
  "visual-genes.js",
  "artworks.js",
  "aesthetic-styles.js",
  "chinese-visual-directions.js"
];

const context = vm.createContext({});
for (const file of dataFiles) {
  vm.runInContext(await readFile(resolve(root, file), "utf8"), context, { filename: file });
}

const styles = JSON.parse(JSON.stringify(vm.runInContext("STYLE_DATA", context)));
const profiles = JSON.parse(await readFile(resolve(root, "style-control-profiles.json"), "utf8")).profiles;
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
const defaultWeights = [1, 0.93, 0.86, 0.78, 0.7, 0.62, 0.55, 0.48];

const genePromptTemplates = {
  compositionSpace: {
    zh: (label) => `构图遵循${label}，建立清晰主次、留白与阅读顺序`,
    en: (label) => `Structure the composition through ${label}, with clear hierarchy, negative space, and reading order`
  },
  viewpointLens: {
    zh: (label) => `视角统一为${label}，所有对象使用同一观察与投影规则`,
    en: (label) => `Use ${label} consistently, with one viewing convention and projection system throughout`
  },
  formGeometry: {
    zh: (label) => `造型遵循${label}，同时保留主体身份、动作与关键结构`,
    en: (label) => `Shape the subjects through ${label} while preserving identity, action, and defining structure`
  },
  colorTone: {
    zh: (label) => `配色限定为${label}，区分主色、辅色与小面积强调色`,
    en: (label) => `Limit the palette to ${label}, separating dominant, supporting, and small accent colors`
  },
  lightingImaging: {
    zh: (label) => `光影采用${label}，统一光源方向与明暗逻辑`,
    en: (label) => `Use ${label} for the lighting, with coherent direction and tonal logic`
  },
  mediumTechnique: {
    zh: (label) => `以${label}统一笔触、边缘与成像痕迹`,
    en: (label) => `Use ${label} to unify marks, edges, and imaging traces`
  },
  materialTexture: {
    zh: (label) => `材质表现为${label}，统一纹理尺度、反光与磨损程度`,
    en: (label) => `Render materials as ${label}, with consistent texture scale, reflectance, and wear`
  },
  typographyLayout: {
    zh: (label) => `仅在用户需要文字时采用${label}，保持原文准确、清晰可读`,
    en: (label) => `Only when text is requested, use ${label} while preserving the exact wording and legibility`
  },
  imperfectionEffect: {
    zh: (label) => `${label}仅作受控局部效果，不削弱主体轮廓与焦点`,
    en: (label) => `Use ${label} only as a controlled local effect without weakening subject silhouettes or the focal point`
  },
  styleExecution: {
    zh: (label) => `让${label}贯穿画面，并与构图、光影和材质协调`,
    en: (label) => `Carry ${label} throughout the image and coordinate it with composition, lighting, and material treatment`
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
    ["lightingImaging", /光|明暗|阴影|高光|曝光|辉光|暗部|亮部|透光|light|shadow|highlight|exposure|glow|lumin|chiaroscuro|tonal/],
    ["materialTexture", /材质|纹理|肌理|表面|纸|颜料|玻璃|金箔|石质|木纹|金属|塑料|纤维|颗粒|texture|surface|paper|pigment|glass|stone|metal|wood|plastic|fiber|grain/],
    ["colorTone", /配色|色彩|色调|色域|色阶|单色|多色|蓝|红|黄|绿|紫|黑|白|金色|银色|粉色|palette|color|monochrome|blue|red|yellow|green|violet|black|white|gold|silver|pink/],
    ["compositionSpace", /构图|布局|轴线|对称|分层|留白|排列|节奏|网格|重叠|焦点|composition|layout|axis|symmetr|register|negative space|arrangement|rhythm|grid|overlap|focal/],
    ["formGeometry", /轮廓|形态|形体|几何|比例|体积|线条|曲线|结构|模块|边缘|outline|form|geometr|proportion|volume|line|curve|structure|module|edge/],
    ["imperfectionEffect", /故障|噪点|错位|磨损|做旧|失真|glitch|noise|misregistration|distortion|artifact/]
  ];
  const matched = rules.find(([, pattern]) => pattern.test(text));
  return matched?.[0] || visualGeneDimensions[index]?.[0] || "styleExecution";
}

const promptData = Object.fromEntries(styles.map((style) => {
  const profile = profiles[style.id];
  const genes = profile?.coreGenes?.map((gene) => makeGene({
    dimension: gene.dimension,
    dimensionZh: gene.dimensionZh,
    labelZh: gene.labelZh,
    labelEn: gene.labelEn,
    weight: gene.weight,
    kind: gene.weight >= 0.86 ? "core" : "adjustable",
    level: gene.level
  })) || [];
  const knownLabels = new Set(genes.flatMap((gene) => [gene.labelZh, gene.labelEn]));

  style.visualGenes.forEach((gene, index) => {
    if (knownLabels.has(gene.zh) || knownLabels.has(gene.en)) return;
    const dimension = inferVisualGeneDimension(gene, index);
    const dimensionZh = dimensionLabels[dimension];
    const weight = defaultWeights[index] || 0.48 * (0.92 ** (index - defaultWeights.length + 1));
    genes.push(makeGene({
      dimension,
      dimensionZh,
      labelZh: gene.zh,
      labelEn: gene.en,
      weight,
      kind: profile ? "adjustable" : (index < 3 ? "core" : "adjustable")
    }));
    knownLabels.add(gene.zh);
    knownLabels.add(gene.en);
  });

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
      "借鉴": "轻度借鉴{name}，只保留少量关键视觉特征",
      "明显": "以{name}为清晰可识别的主要视觉风格",
      "主导": "由{name}的视觉语言主导画面"
    },
    en: {
      "借鉴": "Use a subtle influence from {name}, retaining only a few defining visual traits",
      "明显": "Use {name} as the clearly recognizable primary visual style",
      "主导": "Let the visual language of {name} strongly lead the image"
    }
  },
  content: {
    zh: "保持用户指定主体的身份、数量和关键动作；允许补充使构图成立所需的环境、光影和辅助元素",
    en: "Preserve the identity, count, and key actions of the user-defined subjects; add the environment, lighting, and supporting elements needed for a complete composition"
  },
  executionLead: {
    zh: "具体执行：",
    en: "Execution: "
  },
  override: {
    zh: "用户指定的独立控制项优先于风格默认参数，并与整体视觉保持协调",
    en: "User-selected controls override the style defaults while remaining visually coherent with the whole image"
  },
  quality: {
    zh: "确保主体完整、焦点明确、前中后景关系成立，光线、色彩与材质统一",
    en: "Keep subjects complete, the focal point clear, spatial depth coherent, and lighting, color, and materials unified"
  },
  negative: {
    zh: "主体残缺或重复，关键部位缺失，焦点分散，空间关系断裂，光源冲突，材质混杂，未经请求的文字，乱码，水印，品牌标志",
    en: "cropped or duplicated subjects, missing key parts, scattered focal points, broken spatial relationships, conflicting light sources, mixed materials, unrequested text, illegible lettering, watermarks, brand logos"
  }
};

const output = `// Generated by scripts/generate-prompt-data.mjs. Edit the source profiles, then regenerate.\nconst STYLE_PROMPT_POLICY = Object.freeze(${JSON.stringify(policy, null, 2)});\n\nconst STYLE_PROMPT_DATA = Object.freeze(${JSON.stringify(promptData, null, 2)});\n\nfunction getStylePromptData(styleId) {\n  return STYLE_PROMPT_DATA[styleId] || null;\n}\n\nfunction buildStylePromptText(style, options = {}) {\n  const language = options.language === \"en\" ? \"en\" : \"zh\";\n  const data = getStylePromptData(style.id);\n  if (!data) return \"\";\n  const intensity = options.intensity || \"明显\";\n  const styleName = language === \"zh\" ? style.nameZh : style.nameEn;\n  const direction = STYLE_PROMPT_POLICY.intensity[language][intensity].replace(\"{name}\", styleName);\n  const sourceGenes = Array.isArray(options.activeGenes) ? options.activeGenes : data.genes;\n  const promptKey = language === \"zh\" ? \"promptZh\" : \"promptEn\";\n  const geneText = sourceGenes.map((gene) => gene[promptKey]).filter(Boolean).join(language === \"zh\" ? \"；\" : \"; \" );\n  const parts = [\n    direction,\n    STYLE_PROMPT_POLICY.content[language],\n    geneText ? STYLE_PROMPT_POLICY.executionLead[language] + geneText : \"\",\n    options.hasOverrides ? STYLE_PROMPT_POLICY.override[language] : \"\",\n    STYLE_PROMPT_POLICY.quality[language]\n  ].filter(Boolean);\n  return parts.join(language === \"zh\" ? \"。\" : \". \" ) + (language === \"zh\" ? \"。\" : \".\");\n}\n\nfunction buildStyleNegativeText(language = \"zh\") {\n  return STYLE_PROMPT_POLICY.negative[language === \"en\" ? \"en\" : \"zh\"];\n}\n`;

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
