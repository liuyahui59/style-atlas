import { mkdir, writeFile } from "node:fs/promises";
import { evaluateClassicExpression, loadClassicScripts, RAW_STYLE_SOURCE_FILES } from "./lib/classic-script-loader.mjs";

const root = new URL("../", import.meta.url);
const outputDir = new URL("../../outputs/019faccc-0aad-76a1-9502-8d5cecb510d2/", import.meta.url);
const context = await loadClassicScripts(root, RAW_STYLE_SOURCE_FILES);
const styles = JSON.parse(JSON.stringify(evaluateClassicExpression(context, "STYLE_DATA")));

const keepGroups = {
  "古代与古典": `
    akkadian-art achaemenid-persian-art ottonian-art babylonian-art northern-renaissance international-gothic
    carolingian-art coptic-art roman-imperial-art roman-republican-art romanesque-art mycenaean-art minoan-art
    early-netherlandish-painting parthian-art pompeian-second-style pompeian-third-style pompeian-fourth-style
    pompeian-first-style sasanian-art sumerian-art venetian-school spanish-golden-age-painting greek-orientalizing-style
    archaic-greek-art hellenistic-art greek-geometric-style sienese-school assyrian-art etruscan-art
    italian-proto-renaissance indus-valley-art early-christian-art
  `,
  "欧洲艺术运动": `
    orphism barbizon-school art-informel purism pointillism kinetic-art secessionism divisionism
    rayonism glasgow-style hudson-river-school precisionism spatialism der-blaue-reiter zero-group
    magic-realism-painting nazarene-movement les-nabis arte-povera die-bruecke
    lyrical-abstraction tachisme aesthetic-movement vienna-secession new-objectivity
    nouveau-realisme metaphysical-painting vorticism cobra supports-surfaces academic-art naturalism
    social-realism socialist-realism matter-painting neo-geo orientalist-painting flemish-baroque
    dutch-golden-age-painting utrecht-caravaggism
  `,
  "现代与当代艺术": `
    hyperrealism light-and-space post-painterly-abstraction post-minimalism
    washington-color-school geometric-abstraction concrete-art pattern-and-decoration pictures-generation
    neo-concretism new-leipzig-school hard-edge-painting
  `,
  "平面设计": `
    polish-poster-school plakatstil dutch-modern-typography postmodern-swiss-design
    deconstructivist-graphic-design cranbrook-design
    wiener-werkstatte-graphics new-typography
  `,
  "建筑与空间": `
    amsterdam-school queen-anne-style expressionist-architecture beaux-arts-architecture parametricism prairie-school
    second-empire-style high-tech-architecture gothic-revival-architecture constructivist-architecture
    classical-revival-architecture googie-architecture international-style-architecture postmodern-architecture
    deconstructivist-architecture critical-regionalism tropical-modernism metabolism organic-architecture
    chicago-school italian-radical-design hollywood-regency miami-modernism desert-modernism blobitecture
    romanesque-revival-architecture neo-vernacular-architecture
  `,
  "东亚艺术": `
    ink-wash gongbi ukiyo-e rinpa nihonga korean-minhwa blue-green-landscape baimiao
    oracle-bone-script-aesthetic bronze-inscription-aesthetic han-dynasty-silk-painting
    han-dynasty-pictorial-stone clerical-script-aesthetic wei-jin-tomb-mural
    zen-painting sosaku-hanga yamato-e shanghai-school-painting dansaekhwa gutai-art-association lingnan-school
    kano-school mono-ha shin-hanga song-court-painting ma-xia-school japanese-nanga four-wangs-school
    tosa-school wu-school eight-eccentrics-of-yangzhou yuefenpai-calendar-art zhe-school
    taohuawu-new-year-print mianzhu-new-year-print yangliuqing-new-year-print
  `,
  "南亚与东南亚艺术": `
    traditional-balinese-painting ubud-school-painting deccani-painting company-painting gond-painting gandhara-art
    kalighat-painting bengal-school pattachitra warli-painting rajasthani-miniature pahari-painting nanyang-style
  `,
  "西亚与伊斯兰艺术": `
    ottoman-miniature hurufiyya-movement qajar-painting kufic-calligraphy-aesthetic nastaliq-calligraphy-aesthetic
    safavid-miniature seljuk-art timurid-art islamic-arabesque islamic-manuscript-illumination
  `,
  "非洲与大洋洲艺术": `
    arnhem-land-bark-painting ethiopian-icon-painting australian-aboriginal-dot-painting benin-court-art
    ndebele-house-painting west-african-studio-portraiture nok-art tingatinga-painting
    aboriginal-x-ray-art
  `,
  "美洲艺术": `
    aztec-art olmec-art brazilian-concretism maya-art mixtec-art
    moche-art nazca-art tropicalia teotihuacan-art northwest-coast-formline-art inuit-printmaking inca-art
  `,
  "摄影与电影": `
    surrealist-photography german-expressionist-cinema new-german-cinema dusseldorf-school-photography film-noir
    french-new-wave-cinema pictorialism czechoslovak-new-wave new-hollywood-cinema humanist-photography
    provoke-photography photo-secession poetic-realism-cinema soviet-montage-cinema taiwan-new-cinema new-topographics
    new-objectivity-photography new-vision-photography italian-neorealism japanese-new-wave-cinema
    hong-kong-new-wave-cinema straight-photography subjective-photography japanese-i-photography
  `,
  "时尚与亚文化": `
    flapper-style mod-aesthetic skinhead-aesthetic glam-rock-aesthetic gothic-lolita gyaru-aesthetic visual-kei
    dandyism hippie-aesthetic new-romantic-aesthetic gothic-subculture disco-aesthetic rave-aesthetic
    techno-aesthetic hardcore-punk-aesthetic heavy-metal-aesthetic black-metal-aesthetic emo-aesthetic
    club-kids-aesthetic cybergoth harajuku-street-style decora-kei mori-kei normcore techwear
  `,
  "数字艺术与网络设计": `
    new-aesthetic corporate-memphis frutiger-metro
  `,
  "经典艺术主干": `
    classical-greek gothic renaissance mannerism baroque rococo neoclassicism romanticism realism pre-raphaelite
    impressionism post-impressionism symbolism fauvism expressionism cubism futurism dada constructivism suprematism
    surrealism abstract-expressionism color-field neo-expressionism photorealism
  `,
  "设计与流行视觉": `
    arts-crafts art-nouveau de-stijl bauhaus art-deco pop-art op-art minimalism postmodernism lowbrow psychedelic
    superflat swiss mid-century-modern scandinavian-modern streamline-moderne new-wave-typography memphis
    punk-visual grunge-design architectural-brutalism
  `,
  "数字与推想风格": `
    afrofuturism brutalism flat-design skeuomorphism acid-graphics glitch-art synthwave vaporwave y2k
    cyberpunk steampunk solarpunk atompunk dieselpunk biopunk
  `,
  "全球传统主干": `
    ancient-egyptian byzantine persian-miniature mughal-miniature madhubani islamic-geometry thangka
    mexican-muralism naive-art
  `,
  "补充的跨领域风格": `
    biomorphic maximalism neo-futurism neo-pop atomic-age retrofuturism
  `
};

const keepIds = new Set();
const keepBucketById = new Map();
for (const [bucket, source] of Object.entries(keepGroups)) {
  for (const id of source.trim().split(/\s+/)) {
    if (keepIds.has(id)) throw new Error(`Duplicate retained id: ${id}`);
    keepIds.add(id);
    keepBucketById.set(id, bucket);
  }
}

const mergeTargets = new Map(Object.entries({
  "post-superflat": "superflat",
  "structural-expressionism": "high-tech-architecture",
  "high-tech-interior": "high-tech-architecture",
  "neo-brutalist-interior": "architectural-brutalism",
  "streamline-moderne-architecture": "streamline-moderne",
  "brazilian-neo-concretism": "neo-concretism",
  "haida-visual-tradition": "northwest-coast-formline-art",
  "japanese-zen-ink-painting": "zen-painting",
  "northern-song-landscape": "song-court-painting",
  "southern-song-landscape": "ma-xia-school",
  "charred-wood-aesthetic": "shou-sugi-ban-aesthetic",
  "console-low-poly-aesthetic": "low-poly-art",
  "ps1-aesthetic": "console-low-poly-aesthetic",
  "n64-aesthetic": "console-low-poly-aesthetic",
  "internet-y2k-nostalgia": "y2k"
}));

const techniquePattern = /(?:cyanotype|daguerreotype|wet-plate|infrared|cross-processed|instant-flash|macro-photography|photogrammetry|3d-scan|scanography|duotone|halftone|engraving|lithographic|woodcut|letterpress-texture|darkroom-photomontage|isometric-pixel|point-cloud|cel-shaded|voxel-art|generative-art|databending-art|pixel-art|ascii-art)/;
const formatPattern = /(?:album-cover|wayfinding|editorial-design|infographic|data-visualization|luxury-packaging|kinetic-typography|newspaper-editorial|indie-magazine|screen-printed-poster|protest-poster|propaganda-poster|interwar-travel-poster|chinese-calendar-poster|chinese-new-year-print|kongo-power-figure|zine-aesthetic|miniature-model-art|immersive-art|installation-art|performance-art|video-art|sound-art|body-art|social-practice-art|bio-art|data-art|material-design|isotype)/;
const trendPattern = /(?:core$|core-|angelcore|balletcore|cottagecore|dreamcore|fairycore|kidcore|mermaidcore|piratecore|weirdcore|clean-girl|old-money|coquette|gothic-cottage|sickly|chromecore|etherealwave|soft-grunge|cyber-zen|cyber-mysticism|cursed-image|tumblr|early-metaverse|digital-mysticism|virtual-idol|bloghouse|woodpunk|crystalpunk|stonepunk|clockpunk|silkpunk|lunarpunk|decopunk|nuclearpunk|climate-punk|wasteland-punk)/;

const contextOnlyIds = new Set(`
  school-of-paris fluxus young-british-artists situationist-international conceptual-art land-art post-internet-art
  street-art harlem-renaissance-visual-art black-arts-movement dunhuang net-art demoscene-aesthetic new-media-art
  environmental-art appropriation-art urban-art
`.trim().split(/\s+/));

const regionOverrides = new Map(Object.entries({
  "traditional-balinese-painting": "南亚与东南亚",
  "ubud-school-painting": "南亚与东南亚",
  "ethiopian-icon-painting": "撒哈拉以南非洲",
  "etruscan-art": "欧洲",
  "early-christian-art": "欧洲；西亚/中亚/北非",
  "international-gothic": "欧洲"
}));

function broadRegions(style) {
  if (regionOverrides.has(style.id)) return regionOverrides.get(style.id);
  const region = style.region || "";
  const westAsiaRegion = region.replaceAll("印度尼西亚", "").replaceAll("东北非", "");
  const groups = [];
  const add = (label, pattern) => { if (pattern.test(region) && !groups.includes(label)) groups.push(label); };
  add("全球/跨地域", /全球|跨地域|国际|互联网|网络|热带地区/);
  add("欧洲", /欧洲|欧美|英国|法国|德国|意大利|威尼斯|西班牙|荷兰|尼德兰|佛兰德|瑞士|奥地利|维也纳|波兰|捷克|西欧|中欧|北欧|希腊|爱琴海|古罗马|罗马帝国|俄罗斯|苏联|西德/);
  add("东亚", /东亚|中国|日本|韩国|朝鲜|琉球|北海道|台湾|香港|蒙古/);
  add("南亚与东南亚", /南亚|东南亚|印度|尼泊尔|高棉|泰国|越南|印度尼西亚|菲律宾|马来亚/);
  if (/西亚|中亚|北非|埃及|伊朗|波斯|奥斯曼|土耳其|美索不达米亚|巴比伦|苏美尔|亚述|阿卡德|亚美尼亚|高加索|巴勒斯坦|黎凡特|马格里布|伊斯兰|希腊化/.test(westAsiaRegion)) groups.push("西亚/中亚/北非");
  add("撒哈拉以南非洲", /非洲|西非|东非|南部非洲|中非|埃塞俄比亚|贝宁|加纳|马里|尼日利亚|塞内加尔|刚果/);
  add("大洋洲", /大洋洲|澳大利亚|新西兰|波利尼西亚|巴布亚|萨摩亚|夏威夷|毛利|太平洋/);
  add("北美", /北美|欧美|美国|加拿大|纽约|芝加哥|哈莱姆|华盛顿|迈阿密/);
  if (!/北美/.test(region)) add("拉丁美洲与加勒比", /拉丁美洲|加勒比|中部美洲|南美|安第斯|亚马孙|墨西哥|巴西|古巴|海地/);
  return groups.length ? groups.join("；") : "全球/跨地域";
}

const regionalMovementOrSchoolIds = new Set(`
  ubud-school-painting sosaku-hanga shin-hanga nihonga shanghai-school-painting dansaekhwa
  gutai-art-association lingnan-school mono-ha rinpa kano-school ma-xia-school japanese-nanga
  four-wangs-school tosa-school wu-school eight-eccentrics-of-yangzhou zhe-school bengal-school
  nanyang-style hurufiyya-movement tingatinga-painting brazilian-concretism tropicalia
  mexican-muralism naive-art venetian-school sienese-school afrofuturism
`.trim().split(/\s+/));

const crossDisciplinaryDesignIds = new Set(`
  arts-crafts art-nouveau de-stijl bauhaus art-deco postmodernism mid-century-modern
  scandinavian-modern streamline-moderne memphis glasgow-style aesthetic-movement retrofuturism
`.trim().split(/\s+/));

const historicalCanonicalIds = new Set(`
  classical-greek gothic renaissance baroque rococo
`.trim().split(/\s+/));

function strictCategory(style, bucket) {
  if (regionalMovementOrSchoolIds.has(style.id)) return "艺术运动与画派";
  if (bucket === "古代与古典" || ["ancient-egyptian", "byzantine"].includes(style.id) || historicalCanonicalIds.has(style.id)) return "历史时期风格与古典传统";
  if (crossDisciplinaryDesignIds.has(style.id)) return "设计运动与跨媒介风格";
  if (style.id === "west-african-studio-portraiture") return "摄影与电影风格";
  if (style.id === "yuefenpai-calendar-art") return "平面与视觉传达风格";
  if (["欧洲艺术运动", "现代与当代艺术", "经典艺术主干"].includes(bucket)) return "艺术运动与画派";
  if (["平面设计", "设计与流行视觉"].includes(bucket)) {
    if (["pop-art", "op-art", "minimalism", "lowbrow", "street-art", "superflat"].includes(style.id)) return "艺术运动与画派";
    if (style.id === "architectural-brutalism") return "建筑、室内与产品设计风格";
    return "平面与视觉传达风格";
  }
  if (bucket === "建筑与空间") return "建筑、室内与产品设计风格";
  if (["东亚艺术", "南亚与东南亚艺术", "西亚与伊斯兰艺术", "非洲与大洋洲艺术", "美洲艺术", "全球传统主干"].includes(bucket)) {
    return "地域艺术传统";
  }
  if (bucket === "摄影与电影") return "摄影与电影风格";
  if (bucket === "时尚与亚文化") return "时尚与亚文化风格";
  if (bucket === "补充的跨领域风格") {
    if (["neo-futurism", "atomic-age", "retrofuturism", "maximalism"].includes(style.id)) return "建筑、室内与产品设计风格";
    return "艺术运动与画派";
  }
  return "数字与网络视觉风格";
}

function decisionFor(style) {
  if (keepIds.has(style.id)) {
    const bucket = keepBucketById.get(style.id);
    return {
      status: "保留",
      target: "",
      strictCategory: strictCategory(style, bucket),
      reason: "有独立专名，存在持续的艺术史、设计史或专业研究用法，并具备可区分的形式特征。"
    };
  }
  if (mergeTargets.has(style.id)) {
    return {
      status: "应合并",
      target: mergeTargets.get(style.id),
      strictCategory: "",
      reason: "与上位风格、同义名称或既有条目的视觉边界不足以支持独立主条目。"
    };
  }
  if (contextOnlyIds.has(style.id)) {
    return {
      status: "转入史论/语境库",
      target: "",
      strictCategory: "",
      reason: "学术名称与历史身份成立，但作品的视觉形式过于多样，不足以支持跨主体稳定复现。"
    };
  }
  if (style.track === "可转译工艺视觉系统") {
    return {
      status: "转入工艺媒介库",
      target: "",
      strictCategory: "",
      reason: "主要由材料、工序或器物门类定义，可提炼视觉语言，但不作为严格意义上的独立艺术或设计风格。"
    };
  }
  if (techniquePattern.test(style.id) || formatPattern.test(style.id)) {
    return {
      status: "转入媒介/类型库",
      target: "",
      strictCategory: "",
      reason: "名称主要指媒介、技术、内容类型、设计系统或应用门类，不能单独证明稳定一致的风格谱系。"
    };
  }
  if (trendPattern.test(style.id) || style.track === "数字推想与网络审美" || style.track === "时尚与亚文化视觉") {
    return {
      status: "转入趋势词库",
      target: "",
      strictCategory: "",
      reason: "属于平台化审美标签、短周期潮流或推想类型；可用于检索和混合，但不进入严格风格主库。"
    };
  }
  return {
    status: "暂不收录",
    target: "",
    strictCategory: "",
    reason: "现有命名过宽、偏题材/地域统称，或尚缺少足够稳定的独立风格边界与权威命名依据。"
  };
}

const visualHistoryBands = [
  {
    id: "ancient",
    label: "古代文明与早期视觉体系",
    shortLabel: "古代文明",
    approxTime: "史前—约公元500年",
    coverage: "两河、埃及、希腊罗马、先秦秦汉、印度古典、中南美古代文明"
  },
  {
    id: "premodern",
    label: "前现代宗教与区域传统",
    shortLabel: "前现代传统",
    approxTime: "约500—1500年",
    coverage: "欧洲中世纪、拜占庭、伊斯兰艺术、东亚宫廷与文人传统、南亚及东南亚宗教艺术"
  },
  {
    id: "early-modern",
    label: "早期近代、宫廷与装饰体系",
    shortLabel: "早期近代",
    approxTime: "约1400—1800年",
    coverage: "文艺复兴、巴洛克、洛可可、奥斯曼与萨法维艺术、明清视觉、日本江户视觉"
  },
  {
    id: "industrial-modernity",
    label: "工业化与现代性形成",
    shortLabel: "工业化与现代性",
    approxTime: "约1760—1914年",
    coverage: "新古典主义、浪漫主义、现实主义、工艺美术、新艺术、印象派、早期摄影与平面传播"
  },
  {
    id: "modernism",
    label: "现代主义形成与鼎盛",
    shortLabel: "现代主义",
    approxTime: "约1900—1960年",
    coverage: "表现主义、立体主义、未来主义、构成主义、包豪斯、超现实主义、国际主义设计"
  },
  {
    id: "postwar-postmodern",
    label: "战后实验与后现代转向",
    shortLabel: "战后与后现代",
    approxTime: "约1945—1995年",
    coverage: "抽象表现主义、波普、极简、概念艺术、朋克、孟菲斯、后现代建筑与平面设计"
  },
  {
    id: "digital-contemporary",
    label: "数字网络与当代复合视觉",
    shortLabel: "数字网络与当代",
    approxTime: "约1990年至今",
    coverage: "数字艺术、网络艺术、游戏视觉、屏幕美学、网络亚文化、推想美学及AI视觉"
  }
];

const visualHistoryOverrides = new Map();
const addVisualHistoryOverrides = (bandId, source) => {
  for (const id of source.trim().split(/\s+/)) {
    if (visualHistoryOverrides.has(id)) throw new Error(`Duplicate visual-history override: ${id}`);
    visualHistoryOverrides.set(id, bandId);
  }
};

addVisualHistoryOverrides("ancient", `
  aztec-art maya-art mixtec-art moche-art nazca-art teotihuacan-art inca-art
`);
addVisualHistoryOverrides("premodern", `
  thangka international-gothic seljuk-art islamic-arabesque nastaliq-calligraphy-aesthetic zen-painting
  pattachitra ethiopian-icon-painting northwest-coast-formline-art arnhem-land-bark-painting
  aboriginal-x-ray-art warli-painting
`);
addVisualHistoryOverrides("early-modern", `
  ukiyo-e korean-minhwa mianzhu-new-year-print yangliuqing-new-year-print japanese-nanga
`);
addVisualHistoryOverrides("industrial-modernity", `
  art-nouveau les-nabis aesthetic-movement glasgow-style vienna-secession dandyism pictorialism
  secessionism beaux-arts-architecture chicago-school divisionism classical-revival-architecture
`);
addVisualHistoryOverrides("modernism", `
  scandinavian-modern hollywood-regency concrete-art organic-architecture nanyang-style geometric-abstraction
  new-objectivity-photography socialist-realism
`);
addVisualHistoryOverrides("postwar-postmodern", `
  nouveau-realisme neo-futurism neo-geo hong-kong-new-wave-cinema critical-regionalism
  neo-vernacular-architecture deconstructivist-graphic-design cranbrook-design japanese-i-photography
  taiwan-new-cinema deconstructivist-architecture visual-kei afrofuturism
`);
addVisualHistoryOverrides("digital-contemporary", `
  cyberpunk steampunk solarpunk atompunk dieselpunk biopunk corporate-memphis frutiger-metro
`);

function visualHistoryFor(style) {
  const overrideId = visualHistoryOverrides.get(style.id);
  if (overrideId) return visualHistoryBands.find((band) => band.id === overrideId);
  const year = Number(style.year);
  if (year < 500) return visualHistoryBands[0];
  if (year < 1400) return visualHistoryBands[1];
  if (year < 1760) return visualHistoryBands[2];
  if (year < 1900) return visualHistoryBands[3];
  if (year < 1945) return visualHistoryBands[4];
  if (year < 1990) return visualHistoryBands[5];
  return visualHistoryBands[6];
}

const styleById = new Map(styles.map((style) => [style.id, style]));
for (const id of keepIds) {
  if (!styleById.has(id)) throw new Error(`Unknown retained id: ${id}`);
}
for (const [id, target] of mergeTargets) {
  if (!styleById.has(id)) throw new Error(`Unknown merge source: ${id}`);
  if (!styleById.has(target)) throw new Error(`Unknown merge target: ${target}`);
}

const audit = styles.map((style, index) => {
  const decision = decisionFor(style);
  const targetStyle = decision.target ? styleById.get(decision.target) : null;
  const visualHistory = visualHistoryFor(style);
  return {
    index: index + 1,
    id: style.id,
    nameZh: style.nameZh,
    nameEn: style.nameEn,
    period: style.period,
    formationYear: style.year,
    originalTrack: style.track,
    originalType: style.type,
    detailedRegion: style.region,
    broadRegion: broadRegions(style),
    status: decision.status,
    mergeTargetId: decision.target,
    mergeTargetName: targetStyle ? `${targetStyle.nameZh} / ${targetStyle.nameEn}` : "",
    strictCategory: decision.strictCategory,
    visualHistoryId: visualHistory.id,
    visualHistory: visualHistory.label,
    visualHistoryTime: visualHistory.approxTime,
    reason: decision.reason
  };
});

const retained = audit.filter((item) => item.status === "保留").sort((left, right) =>
  left.strictCategory.localeCompare(right.strictCategory, "zh-CN") || left.nameZh.localeCompare(right.nameZh, "zh-CN")
);
const strictCategoryOrder = [
  "历史时期风格与古典传统",
  "艺术运动与画派",
  "地域艺术传统",
  "设计运动与跨媒介风格",
  "建筑、室内与产品设计风格",
  "平面与视觉传达风格",
  "摄影与电影风格",
  "时尚与亚文化风格",
  "数字与网络视觉风格"
];
const broadRegionOrder = [
  "全球/跨地域",
  "欧洲",
  "东亚",
  "南亚与东南亚",
  "西亚/中亚/北非",
  "撒哈拉以南非洲",
  "大洋洲",
  "北美",
  "拉丁美洲与加勒比"
];
const statusCounts = Object.fromEntries([...new Set(audit.map((item) => item.status))].map((status) => [
  status,
  audit.filter((item) => item.status === status).length
]));
const categoryCounts = Object.fromEntries(strictCategoryOrder.map((category) => [
  category,
  retained.filter((item) => item.strictCategory === category).length
]));
const visualHistoryCounts = Object.fromEntries(visualHistoryBands.map((band) => [
  band.label,
  retained.filter((item) => item.visualHistoryId === band.id).length
]));

const methodology = {
  title: "风格谱严格风格主库审定 V1",
  scope: "从网站候选记录中筛选严格意义上的艺术与设计风格，并生成网站严格主库。",
  operationalDefinition: "主库的基本单位可以是历史风格、艺术运动、画派、设计风格或稳定地域传统；但必须同时具有独立名称、可追溯语境、稳定形式机制和跨主体转译能力。",
  retainedCount: retained.length,
  totalAudited: audit.length,
  inclusionRules: [
    "名称是艺术史、设计史、建筑史、摄影史、电影史或稳定亚文化研究中持续使用的独立专名。",
    "具有可说明的形成语境、代表人物/群体或传播谱系，而不是临时营销标签。",
    "至少在构图、造型、色彩、材质、成像或字体中的两项形成稳定且可区分的形式机制。",
    "与已有条目之间存在足够边界，不能只是上位风格的题材版本、材料版本或近义别名。",
    "在不预设主体的前提下，仍能被转译为稳定的构图、造型、色彩、光线、材质或成像约束。"
  ],
  exclusionRules: [
    "媒介、工艺、材料、印刷方式和摄影技术转入相应工具库。",
    "题材、场景、应用门类和地域统称不作为独立风格。",
    "短周期 -core、平台审美标签和缺少独立谱系的推想派生词转入趋势词库。",
    "同义、上下位重叠或视觉边界不足的条目合并。",
    "学术上成立但没有统一视觉语法的运动、群体或媒介实践转入史论/语境库。"
  ],
  referenceFrameworks: [
    "Getty Art & Architecture Thesaurus (AAT): https://www.getty.edu/research/tools/vocabularies/aat/",
    "Tate Art Terms: https://www.tate.org.uk/art/art-terms",
    "The Metropolitan Museum of Art, Heilbrunn Timeline: https://www.metmuseum.org/toah/",
    "MoMA Art and Artists: https://www.moma.org/artists/"
  ],
  statusCounts,
  categoryCounts,
  visualHistoryBands,
  visualHistoryCounts
};

const rows = retained.map((item, index) => `| ${index + 1} | ${item.nameZh} | ${item.nameEn} | ${item.strictCategory} | ${item.broadRegion} | ${item.visualHistory} | ${item.visualHistoryTime} | ${item.period} |`).join("\n");
const visualHistoryOrder = new Map(visualHistoryBands.map((band, index) => [band.id, index]));
const threeAxisStyles = [...retained].sort((left, right) =>
  visualHistoryOrder.get(left.visualHistoryId) - visualHistoryOrder.get(right.visualHistoryId)
  || left.formationYear - right.formationYear
  || left.nameZh.localeCompare(right.nameZh, "zh-CN")
);
const threeAxisRows = threeAxisStyles.map((item, index) => `| ${index + 1} | ${item.nameZh} | ${item.nameEn} | ${item.strictCategory} | ${item.broadRegion} | ${item.visualHistory} | ${item.visualHistoryTime} | ${item.period} |`).join("\n");
const auditRows = audit.map((item) => `| ${item.index} | ${item.nameZh} | ${item.nameEn} | ${item.status} | ${item.mergeTargetName || "-"} | ${item.reason} |`).join("\n");
const markdown = `# 风格谱严格风格主库审定 V1\n\n` +
  `审定范围：现有 ${audit.length} 条；建议主库保留：**${retained.length} 条**。本表暂不回写网站。\n\n` +
  `> ${methodology.operationalDefinition}\n\n` +
  `## 纳入口径\n\n${methodology.inclusionRules.map((rule) => `- ${rule}`).join("\n")}\n\n` +
  `## 排除口径\n\n${methodology.exclusionRules.map((rule) => `- ${rule}`).join("\n")}\n\n` +
  `## 状态统计\n\n${Object.entries(statusCounts).map(([status, count]) => `- ${status}：${count}`).join("\n")}\n\n` +
  `## 主库分类统计\n\n${Object.entries(categoryCounts).map(([category, count]) => `- ${category}：${count}`).join("\n")}\n\n` +
  `## 视觉史分类统计\n\n${Object.entries(visualHistoryCounts).map(([band, count]) => `- ${band}：${count}`).join("\n")}\n\n` +
  `## 严格风格主清单\n\n| 序号 | 中文名 | English | 风格分类 | 大地域 | 视觉史分类 | 时间带 | 风格年代 |\n|---:|---|---|---|---|---|---|---|\n${rows}\n`;
const threeAxisMarkdown = `# 风格谱严格风格三轴分类 V1\n\n` +
  `本表只处理已审定保留的 **${retained.length} 种风格**。分类轴仅保留“风格分类、大地域、视觉史分类”，不使用应用领域或视觉特征作为分类。\n\n` +
  `## 视觉史口径\n\n| 视觉史分类 | 大致时间 | 主要涵盖内容 | 风格数 |\n|---|---|---|---:|\n` +
  `${visualHistoryBands.map((band) => `| ${band.label} | ${band.approxTime} | ${band.coverage} | ${visualHistoryCounts[band.label]} |`).join("\n")}\n\n` +
  `## ${retained.length} 种风格三轴表\n\n| 序号 | 中文名 | English | 风格分类 | 大地域 | 视觉史分类 | 时间带 | 风格年代 |\n|---:|---|---|---|---|---|---|---|\n${threeAxisRows}\n`;
const auditMarkdown = `# 风格谱 753 项全量审定表 V1\n\n` +
  `本表与《风格谱严格风格主库审定 V1》使用同一口径。严格主库保留 ${retained.length} 项，其余条目依学术身份和视觉可复现性分流。\n\n` +
  `| 原序号 | 中文名 | English | 审定结果 | 合并到 | 理由 |\n|---:|---|---|---|---|---|\n${auditRows}\n`;

const strictCatalogRecords = retained.map((item) => ({
  id: item.id,
  category: item.strictCategory,
  broadRegion: item.broadRegion,
  broadRegions: item.broadRegion.split("；"),
  visualHistoryId: item.visualHistoryId,
  visualHistory: item.visualHistory,
  visualHistoryShort: visualHistoryBands.find((band) => band.id === item.visualHistoryId).shortLabel,
  visualHistoryTime: item.visualHistoryTime,
  visualHistoryCoverage: visualHistoryBands.find((band) => band.id === item.visualHistoryId).coverage
}));
const strictCatalogSource = `const STRICT_STYLE_CATALOG = Object.freeze(${JSON.stringify(strictCatalogRecords, null, 2)});\n` +
  `const STRICT_STYLE_COUNT = STRICT_STYLE_CATALOG.length;\n` +
  `const STRICT_STYLE_CATALOG_BY_ID = new Map(STRICT_STYLE_CATALOG.map((item) => [item.id, item]));\n` +
  `const STRICT_STYLE_IDS = new Set(STRICT_STYLE_CATALOG_BY_ID.keys());\n` +
  `const STRICT_VISUAL_HISTORY_BANDS = Object.freeze(${JSON.stringify(visualHistoryBands, null, 2)});\n` +
  `const strictStyles = STYLE_DATA.filter((style) => STRICT_STYLE_IDS.has(style.id));\n` +
  `if (strictStyles.length !== STRICT_STYLE_COUNT) throw new Error(\`Strict catalog expected \${STRICT_STYLE_COUNT} styles, found \${strictStyles.length}\`);\n` +
  `for (const style of strictStyles) {\n` +
  `  const classification = STRICT_STYLE_CATALOG_BY_ID.get(style.id);\n` +
  `  style.originalType = style.type;\n` +
  `  style.detailedRegion = style.region;\n` +
  `  style.type = classification.category;\n` +
  `  style.broadRegion = classification.broadRegion;\n` +
  `  style.broadRegions = [...classification.broadRegions];\n` +
  `  style.visualHistoryId = classification.visualHistoryId;\n` +
  `  style.visualHistory = classification.visualHistory;\n` +
  `  style.visualHistoryShort = classification.visualHistoryShort;\n` +
  `  style.visualHistoryTime = classification.visualHistoryTime;\n` +
  `  style.visualHistoryCoverage = classification.visualHistoryCoverage;\n` +
  `  style.related = (style.related || []).filter((id) => STRICT_STYLE_IDS.has(id));\n` +
  `}\n` +
  `STYLE_DATA.splice(0, STYLE_DATA.length, ...strictStyles);\n` +
  `STYLE_CATEGORY_GROUPS.splice(0, STYLE_CATEGORY_GROUPS.length, ...${JSON.stringify(strictCategoryOrder)}.map((name) => ({ name, ids: strictStyles.filter((style) => style.type === name).map((style) => style.id) })));\n` +
  `FILTER_GROUPS.type = ${JSON.stringify(strictCategoryOrder)};\n` +
  `FILTER_GROUPS.region = ${JSON.stringify(broadRegionOrder)}.filter((region) => strictStyles.some((style) => style.broadRegions.includes(region)));\n` +
  `FILTER_GROUPS.visualHistory = STRICT_VISUAL_HISTORY_BANDS.map((band) => band.label);\n` +
  `delete FILTER_GROUPS.traits;\n` +
  `delete FILTER_GROUPS.fields;\n`;

await mkdir(outputDir, { recursive: true });
await writeFile(new URL("strict-catalog.js", root), strictCatalogSource);
await writeFile(new URL("风格谱严格风格审定_V1.json", outputDir), `${JSON.stringify({ methodology, retained, audit }, null, 2)}\n`);
await writeFile(new URL("风格谱严格风格主清单_V1.md", outputDir), markdown);
await writeFile(new URL("风格谱300种严格风格三轴分类_V1.md", outputDir), threeAxisMarkdown);
await writeFile(new URL("风格谱753项全量审定表_V1.md", outputDir), auditMarkdown);

console.log(JSON.stringify({ total: audit.length, retained: retained.length, statusCounts, categoryCounts }, null, 2));
