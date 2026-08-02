const NEW_AESTHETIC_STYLE_CONFIGS = [
  {
    id: "maximalism", nameZh: "极繁主义", nameEn: "Maximalism", type: "艺术与设计风格",
    period: "20 世纪后期–当代", year: 1970, region: "全球", track: "商业与设计视觉",
    summary: "以受控的高密度、多层装饰和浓郁材质制造丰盛而有层级的视觉体验。",
    recognition: "满幅布局、多层重叠、宝石色与复杂材质共同围绕一个明确焦点。",
    traits: ["满版", "装饰", "高饱和", "高细节"], fields: ["海报", "品牌视觉", "空间", "时尚"],
    influencedBy: "装饰艺术、巴洛克、波普艺术与后现代设计", influenced: "当代品牌视觉、编辑设计与沉浸式空间",
    related: ["rococo", "postmodernism"], palette: ["#692D5C", "#0E5E62", "#D1A23C"], art: "memphis",
    genes: { composition: ["满幅高密度", "多层重叠", "单一主焦点"], form: ["受控重复", "尺度对比", "装饰边框"], color: ["宝石色", "深色底", "金属强调"], type: ["装饰展示字", "大尺度标题"], texture: ["图案织物", "漆面", "金箔拼贴"] },
    visualGenes: [["满幅高密度与单一主焦点", "full-frame density with one dominant focal point"], ["多层重叠与受控尺度对比", "layered overlap and controlled scale contrast"], ["深色底上的分组宝石色", "grouped jewel tones over a dark ground"], ["局部高光与深暗部层级", "layered local highlights and deep shadow hierarchy"], ["织物、漆面、金箔与纸张拼贴", "patterned textile, lacquer, gold leaf, and paper collage"], ["大尺度装饰展示字", "large-scale decorative display typography"]],
    artwork: "rococo"
  },
  {
    id: "structuralism", nameZh: "结构主义", nameEn: "Structuralism", type: "概念与视觉方法",
    period: "20 世纪中后期", year: 1960, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "把网格、模块、节点和关系显性化，让视觉结构本身成为内容。",
    recognition: "可见网格、模块序列、中性色和技术图纸式关系标注。",
    traits: ["网格", "理性", "几何", "系统化"], fields: ["平面", "建筑", "数字界面", "出版"],
    influencedBy: "结构语言学、瑞士国际主义与系统设计", influenced: "信息设计、参数化系统与模块化界面",
    related: ["swiss", "conceptual-art"], palette: ["#171719", "#E8E7E2", "#E23D2D"], art: "grid",
    genes: { composition: ["显性网格", "模块序列", "关系层级"], form: ["框架节点", "连接线", "模块单元"], color: ["黑白灰", "单一原色标注"], type: ["瑞士无衬线", "等宽字体"], texture: ["技术图纸", "线框", "半透明叠片"] },
    visualGenes: [["显性网格、模块与序列关系", "visible grids, modules, and sequential relationships"], ["框架、节点与连接构成的抽象形态", "abstract forms built from frames, nodes, and connections"], ["黑白灰配一种原色标注", "black, white, and gray with one primary annotation color"], ["均匀分析性照明与低戏剧性", "even analytical lighting with low theatricality"], ["技术图纸、线框与半透明叠片", "technical drawings, wireframes, and translucent overlays"], ["严格网格对齐的无衬线或等宽字", "grid-aligned sans serif or monospaced typography"]],
    artwork: "swiss"
  },
  {
    id: "neo-futurism", nameZh: "新未来主义", nameEn: "Neo-Futurism", type: "当代设计与建筑美学",
    period: "20 世纪末–当代", year: 1990, region: "全球", track: "商业与设计视觉",
    summary: "以连续壳体、参数化曲面和轻质复合材料塑造流动的未来感。",
    recognition: "上升流线、连续曲面、银白冷色和玻璃复合材质。",
    traits: ["未来", "动态", "有机", "精密"], fields: ["建筑", "产品", "空间", "品牌视觉"],
    influencedBy: "未来主义、高科技建筑与参数化设计", influenced: "当代交通设计、概念建筑与科技品牌视觉",
    related: ["futurism", "solarpunk"], palette: ["#E8ECEC", "#8FA2A8", "#16CBD1"], art: "futurism",
    genes: { composition: ["流线上升", "连续平衡", "曲线动势"], form: ["连续壳体", "参数化肋骨", "空气动力曲面"], color: ["银白", "冷灰", "电青"], type: ["宽体几何无衬线", "宽松字距"], texture: ["低铁玻璃", "拉丝金属", "半透明膜"] },
    visualGenes: [["对角上升的连续流线动势", "continuous rising diagonal flow"], ["连续壳体、参数化肋骨与空气动力曲面", "continuous shells, parametric ribs, and aerodynamic surfaces"], ["银白冷灰配少量电青强调", "silver-white and cool gray with restrained electric cyan"], ["高明度环境光与干净边缘光", "high-key ambient light and clean rim lighting"], ["玻璃、拉丝金属与陶瓷复合表面", "glass, brushed metal, and ceramic composite surfaces"], ["宽体几何无衬线与宽松字距", "wide geometric sans serif with open tracking"]],
    artwork: "solarpunk"
  },
  {
    id: "biomorphic", nameZh: "生物形态风格", nameEn: "Biomorphic Style", type: "形态与当代设计",
    period: "20 世纪–当代", year: 1935, region: "欧美", track: "欧洲艺术与现代主义",
    summary: "从细胞、薄膜和生长结构提炼柔性曲面，而不直接复制具体生物。",
    recognition: "去中心流动布局、细胞式曲面、柔和自然色与半透明胶质。",
    traits: ["有机", "自然", "流动", "低饱和"], fields: ["产品", "建筑", "插画", "数字艺术"],
    influencedBy: "新艺术运动、超现实主义与自然形态研究", influenced: "有机现代主义、参数化设计与生物设计",
    related: ["art-nouveau", "surrealism"], palette: ["#D77E78", "#78B9A8", "#E8E1D4"], art: "organic",
    genes: { composition: ["去中心流动", "形态包含", "生长连接"], form: ["细胞轮廓", "柔性薄膜", "连续曲面"], color: ["珊瑚粉", "海水绿", "乳白"], type: ["圆润无衬线", "流动曲线"], texture: ["半透明树脂", "胶质", "柔软陶土"] },
    visualGenes: [["去中心化的流动布局与形态包含", "decentered flowing layout with nested forms"], ["细胞式圆润轮廓与连续柔性曲面", "cell-like rounded contours and continuous flexible surfaces"], ["珊瑚粉、海水绿与乳白过渡", "transitions of coral pink, sea green, and milky white"], ["柔和漫射光、透光与次表面散射", "soft diffuse light, translucency, and subsurface scattering"], ["半透明树脂、胶质与柔软陶土", "translucent resin, gel, and soft clay"], ["略带流动曲线的圆润无衬线字", "rounded sans serif with subtly flowing curves"]],
    artwork: "art-nouveau"
  },
  {
    id: "neo-pop", nameZh: "新波普艺术", nameEn: "Neo-Pop Art", type: "当代艺术与视觉文化",
    period: "20 世纪 80 年代–当代", year: 1985, region: "欧美", track: "商业与设计视觉",
    summary: "以商品图标、漫画轮廓和电光鲜色重新组织大众消费视觉。",
    recognition: "超大图标、粗黑轮廓、电光原色与丝网印刷塑胶感。",
    traits: ["平面", "高饱和", "强对比", "高识别"], fields: ["绘画", "海报", "品牌视觉", "时尚"],
    influencedBy: "波普艺术、漫画与消费文化", influenced: "潮流艺术、玩具设计与社交媒体视觉",
    related: ["pop-art", "superflat"], palette: ["#F23D4C", "#FFD629", "#2457D6"], art: "pop",
    genes: { composition: ["单一超大主体", "大胆裁切", "受控重复"], form: ["粗黑轮廓", "简化平涂", "图标剪影"], color: ["电光红", "鲜黄", "钴蓝"], type: ["超粗无衬线", "漫画标题字"], texture: ["丝网印刷", "乙烯基", "漫画网点"] },
    visualGenes: [["单一超大焦点与大胆边缘裁切", "one oversized focal point with bold edge cropping"], ["粗黑轮廓、简化平涂与图标式剪影", "heavy black contours, simplified flat fills, and icon-like silhouettes"], ["电光红黄蓝与黑白硬边分区", "electric red, yellow, and blue in hard-edged black-and-white zones"], ["两至三级平涂明暗与小面积塑料高光", "two- or three-step flat shading with restrained plastic highlights"], ["丝网印刷、漫画网点与乙烯基光泽", "screen print, comic halftone, and vinyl gloss"], ["超粗无衬线或漫画展示字", "ultra-bold sans serif or comic display typography"]],
    artwork: "pop-art"
  },
  {
    id: "collage", nameZh: "拼贴艺术", nameEn: "Collage Art", type: "艺术与平面设计",
    period: "20 世纪初–当代", year: 1912, region: "欧美", track: "欧洲艺术与现代主义",
    summary: "通过剪切、重叠、尺度断裂与可见接缝重组既有图像。",
    recognition: "照片与纸片重叠、尺度跳跃、撕裂边缘和限定印刷色。",
    traits: ["不对称", "手工", "叙事", "反叛"], fields: ["平面", "海报", "出版", "插画"],
    influencedBy: "立体主义、达达主义与大众印刷", influenced: "朋克视觉、编辑设计与数字合成",
    related: ["dada", "punk-visual"], palette: ["#D9C9A3", "#B83B32", "#253B52"], art: "collage",
    genes: { composition: ["重叠剪切框", "尺度跳跃", "可见接缝"], form: ["剪贴照片", "纸片轮廓", "几何遮片"], color: ["局部照片色", "限定印刷色"], type: ["报纸衬线", "打字机字", "剪贴字"], texture: ["撕裂纸张", "胶带", "复印颗粒"] },
    visualGenes: [["重叠剪切框、尺度跳跃与可见接缝", "overlapping cut frames, scale jumps, and visible seams"], ["剪贴照片、纸片轮廓与几何遮片", "cut photographs, paper silhouettes, and geometric overlays"], ["局部照片色配两至三种限定印刷色", "local photographic color with two or three limited print colors"], ["平面纸片光与细小边缘投影", "flat paper lighting with small edge shadows"], ["撕裂杂志纸、胶带与复印颗粒", "torn magazine paper, tape, and photocopy grain"], ["报纸衬线、打字机或剪贴字", "newspaper serif, typewriter, or cutout typography"]],
    artwork: "dada"
  },
  {
    id: "naive-art", nameZh: "稚拙绘画", nameEn: "Naive Art", type: "绘画美学",
    period: "19 世纪末–当代", year: 1885, region: "全球", track: "全球地域传统",
    summary: "以直接轮廓、平面叙事和非学院派比例保留坦率的手绘感。",
    recognition: "简单前后排列、略不准确的比例、清澈原色与蜡笔水粉表面。",
    traits: ["平面", "手工", "叙事", "自然色"], fields: ["绘画", "插画", "书籍", "教育"],
    influencedBy: "民间绘画、自学艺术与儿童绘画", influenced: "现代插画、绘本与局外人艺术",
    related: ["mexican-folk", "kawaii"], palette: ["#E94A3B", "#F2C84B", "#3D79B8"], art: "folk",
    genes: { composition: ["平面叙事", "简单前后排列", "平视视角"], form: ["直接轮廓", "简化形体", "非学院比例"], color: ["清澈原色", "自然色", "直接并置"], type: ["手绘字", "儿童书写感"], texture: ["蜡笔", "水粉", "粗纹纸"] },
    visualGenes: [["平面叙事布局与简单前后排列", "flat narrative layout with simple front-back ordering"], ["直接轮廓、简化形体与非学院比例", "direct contours, simplified forms, and nonacademic proportions"], ["清澈原色与自然色直接并置", "clear primary and natural colors placed directly side by side"], ["均匀明亮平光与两级简单阴影", "even bright flat light with simple two-step shadows"], ["蜡笔、水粉与粗纹纸上的不均匀涂色", "uneven crayon and gouache coloring on coarse paper"], ["可读的手绘书写感字形", "legible hand-drawn writing-style typography"]],
    artwork: "mexican-folk"
  },
  {
    id: "atompunk", nameZh: "原子朋克美学", nameEn: "Atompunk Aesthetic", type: "复古未来与朋克美学",
    period: "2000 年代至今，引用约 1945–1965 年的原子时代想象", year: 2008, region: "欧美", track: "商业与设计视觉",
    summary: "把原子时代的乐观科技想象转化为流线、轨道与珐琅铬面。",
    recognition: "原子轨道、回旋镖曲线、原色粉彩和明亮复古科技广告感。",
    traits: ["未来", "几何", "怀旧", "高饱和"], fields: ["海报", "产品", "游戏", "影视"],
    influencedBy: "原子时代设计、流线型现代主义与太空竞赛", influenced: "复古未来主义、游戏世界观与科幻视觉",
    related: ["atomic-age", "retrofuturism"], palette: ["#D84132", "#47AFA7", "#F0D372"], art: "retro",
    genes: { composition: ["放射构图", "轨道曲线", "流线水平"], form: ["圆顶", "胶囊", "回旋镖曲线"], color: ["樱桃红", "青绿", "奶油黄"], type: ["年代未来展示字", "几何粗体"], texture: ["珐琅金属", "铬边", "早期塑料"] },
    visualGenes: [["乐观未来式放射构图与轨道曲线", "optimistic retro-future radial composition and orbital curves"], ["圆顶、胶囊与回旋镖式流线模块", "domes, capsules, and boomerang-shaped streamlined modules"], ["樱桃红、青绿、奶油黄与铬色", "cherry red, teal, cream yellow, and chrome"], ["明亮影棚光与干净硬边投影", "bright studio light and clean hard-edged shadows"], ["珐琅金属、铬边、玻璃与光滑早期塑料", "enamel metal, chrome trim, glass, and smooth early plastic"], ["年代未来展示字与几何粗体", "period-futurist display type and geometric bold lettering"]],
    artwork: "atomic-age"
  },
  {
    id: "wasteland-punk", nameZh: "废土朋克美学", nameEn: "Wasteland Punk Aesthetic", type: "科幻与朋克美学",
    period: "20 世纪末–当代", year: 1980, region: "全球", track: "数字与网络审美",
    summary: "以资源匮乏下的拼装、磨损与临时修复表现严酷的生存逻辑。",
    recognition: "低地平线、偏心拼装结构、沙黄锈红和灰尘破损表面。",
    traits: ["反叛", "粗粝", "低饱和", "叙事"], fields: ["游戏", "影视", "插画", "空间"],
    influencedBy: "末世科幻、工业废弃物与朋克 DIY", influenced: "生存游戏、影视概念设计与主题空间",
    related: ["steampunk", "dark-fantasy"], palette: ["#C39B55", "#9B4430", "#3D3A32"], art: "grunge",
    genes: { composition: ["低地平线", "广阔空地", "偏心拼装"], form: ["补丁板件", "不对称加固", "临时维修"], color: ["沙黄", "锈红", "旧橄榄绿"], type: ["模板字", "磨损工业粗体"], texture: ["锈蚀金属", "灰尘", "剥落涂层"] },
    visualGenes: [["低地平线、广阔空域与偏心拼装结构", "low horizon, broad open space, and off-center assembled structure"], ["补丁、螺栓、破损板件与不对称加固", "patches, bolts, damaged panels, and asymmetric reinforcement"], ["沙黄、锈红、焦黑与旧橄榄绿", "sand yellow, rust red, charred black, and aged olive"], ["烈日硬影、空气灰尘与远景热浪", "hard sun shadows, airborne dust, and distant heat haze"], ["锈蚀金属、干裂橡胶与磨损帆布", "corroded metal, cracked rubber, and worn canvas"], ["磨损工业粗体或模板字", "weathered industrial bold or stencil typography"]],
    artwork: "steampunk"
  },
  {
    id: "dieselpunk", nameZh: "柴油朋克美学", nameEn: "Dieselpunk Aesthetic", type: "复古未来与朋克美学",
    period: "2000 年代至今，引用约 1920–1950 年的柴油工业想象", year: 2001, region: "欧美", track: "商业与设计视觉",
    summary: "用重型工业、铆接流线和油烟质感构造机械化的复古未来。",
    recognition: "强对角机械、厚钢板、军绿钢灰与油膜烟尘。",
    traits: ["未来", "粗粝", "动态", "强对比"], fields: ["游戏", "影视", "插画", "产品"],
    influencedBy: "装饰艺术、工业宣传画与两次大战间机械设计", influenced: "复古科幻、游戏世界观与机械概念设计",
    related: ["steampunk", "atompunk"], palette: ["#4F5945", "#62686A", "#8A3B30"], art: "industrial",
    genes: { composition: ["强对角线", "重型水平", "低视点"], form: ["厚钢板", "铆接流线", "大型散热格"], color: ["军绿", "钢灰", "暗红"], type: ["压缩工业无衬线", "模板字"], texture: ["铆接钢板", "油渍", "磨损漆面"] },
    visualGenes: [["工业宣传式强对角线与重型水平构图", "industrial-propaganda diagonals and heavy horizontal composition"], ["厚钢板、铆接流线外壳与大型散热格", "thick steel plate, riveted streamlined shells, and large cooling grilles"], ["军绿、钢灰、烟黑与暗红", "military green, steel gray, smoke black, and dark red"], ["烟雾中的硬质方向光与油膜高光", "hard directional light through haze with oily highlights"], ["铆接钢板、油渍、烟尘与磨损漆面", "riveted steel, oil stains, soot, and worn paint"], ["压缩工业无衬线、模板字或旧报粗体", "condensed industrial sans serif, stencil, or old-news bold typography"]],
    artwork: "steampunk"
  },
  {
    id: "kidcore", nameZh: "童核美学", nameEn: "Kidcore Aesthetic", type: "互联网与情绪美学",
    period: "20 世纪 90 年代–当代", year: 1995, region: "全球", track: "数字与网络审美",
    summary: "以玩具模块、蜡笔贴纸和高饱和原色唤起童年媒介记忆。",
    recognition: "玩具式环绕布局、圆润粗轮廓、糖果原色和绘本纸张。",
    traits: ["高饱和", "圆润", "怀旧", "叙事"], fields: ["插画", "品牌视觉", "时尚", "数字艺术"],
    influencedBy: "儿童电视、玩具包装、绘本与早期互联网", influenced: "青年亚文化、社交媒体视觉与潮流设计",
    related: ["kawaii", "y2k"], palette: ["#ED403A", "#F6D43A", "#3583D8"], art: "kawaii",
    genes: { composition: ["中心焦点", "玩具模块环绕", "贴纸叠放"], form: ["幼态比例", "圆润粗轮廓", "蜡笔细节"], color: ["红黄蓝原色", "糖果粉", "草绿"], type: ["泡泡字", "手绘儿童字"], texture: ["蜡笔", "彩纸", "贴纸塑料"] },
    visualGenes: [["中心焦点与小尺度玩具式模块环绕", "central focal point surrounded by small toy-like modules"], ["幼态短小比例、圆润粗轮廓与简化特征", "childlike compact proportions, rounded heavy outlines, and simplified features"], ["红黄蓝原色、糖果粉与草绿", "red-yellow-blue primaries, candy pink, and grass green"], ["均匀明亮平光与两级卡通阴影", "even bright flat light with two-step cartoon shadows"], ["蜡笔、彩纸、光滑贴纸与绘本纸", "crayon, colored paper, glossy stickers, and illustrated coarse paper"], ["可读的泡泡字或手绘儿童字", "legible bubble or hand-drawn childlike typography"]],
    artwork: "kawaii"
  }
];

function createAestheticStyle(config) {
  const visualGenes = config.visualGenes.map(([zh, en]) => ({ zh, en }));
  return {
    ...config,
    visualGenes,
    artwork: { src: `assets/artworks/${config.id}.jpg` }
  };
}

STYLE_DATA.push(...NEW_AESTHETIC_STYLE_CONFIGS.map(createAestheticStyle));

const STYLE_CATEGORY_GROUPS = [
  {
    name: "艺术史流派",
    ids: [
      "ancient-egyptian", "classical-greek", "byzantine", "gothic", "renaissance", "mannerism", "baroque", "rococo",
      "neoclassicism", "romanticism", "realism", "pre-raphaelite", "impressionism", "post-impressionism", "symbolism",
      "fauvism", "expressionism", "cubism", "futurism", "dada", "suprematism", "surrealism", "abstract-expressionism",
      "color-field", "pop-art", "op-art", "conceptual-art", "neo-expressionism", "photorealism", "lowbrow", "mexican-muralism"
    ]
  },
  {
    name: "设计与建筑",
    ids: [
      "arts-crafts", "art-nouveau", "constructivism", "de-stijl", "bauhaus", "art-deco", "minimalism", "postmodernism",
      "swiss", "mid-century-modern", "scandinavian-modern", "streamline-moderne", "atomic-age", "new-wave-typography",
      "memphis", "architectural-brutalism", "maximalism", "structuralism", "neo-futurism", "biomorphic"
    ]
  },
  {
    name: "地域与传统",
    ids: [
      "ink-wash", "gongbi", "dunhuang", "chinese-new-year-print", "guochao", "ukiyo-e", "rinpa", "nihonga", "wabi-sabi",
      "korean-minhwa", "persian-miniature", "mughal-miniature", "madhubani", "islamic-geometry", "thangka", "mexican-folk",
      "african-wax-print"
    ]
  },
  {
    name: "平面与流行视觉",
    ids: [
      "psychedelic", "street-art", "kawaii", "superflat", "punk-visual", "grunge-design", "anime", "manga", "american-comics",
      "gothic-subculture", "film-noir", "neo-pop", "collage", "naive-art"
    ]
  },
  {
    name: "数字与界面",
    ids: [
      "brutalism", "flat-design", "corporate-memphis", "material-design", "skeuomorphism", "glassmorphism", "neumorphism",
      "acid-graphics", "glitch-art", "generative-art", "y2k", "frutiger-aero"
    ]
  },
  {
    name: "未来与幻想",
    ids: [
      "afrofuturism", "cyberpunk", "steampunk", "solarpunk", "retrofuturism", "synthwave", "vaporwave", "dark-fantasy",
      "atompunk", "wasteland-punk", "dieselpunk"
    ]
  },
  {
    name: "网络与情绪美学",
    ids: ["cottagecore", "dark-academia", "dreamcore", "weirdcore", "liminal-space", "kidcore"]
  }
];

const categorizedStyleIds = STYLE_CATEGORY_GROUPS.flatMap((group) => group.ids);
const duplicateCategoryIds = categorizedStyleIds.filter((id, index) => categorizedStyleIds.indexOf(id) !== index);
const knownStyleIds = new Set(STYLE_DATA.map((style) => style.id));
const unknownCategoryIds = categorizedStyleIds.filter((id) => !knownStyleIds.has(id));
const uncategorizedStyleIds = STYLE_DATA.filter((style) => !categorizedStyleIds.includes(style.id)).map((style) => style.id);

if (duplicateCategoryIds.length || unknownCategoryIds.length || uncategorizedStyleIds.length) {
  throw new Error([
    duplicateCategoryIds.length ? `Duplicate style categories: ${[...new Set(duplicateCategoryIds)].join(", ")}` : "",
    unknownCategoryIds.length ? `Unknown categorized styles: ${unknownCategoryIds.join(", ")}` : "",
    uncategorizedStyleIds.length ? `Uncategorized styles: ${uncategorizedStyleIds.join(", ")}` : ""
  ].filter(Boolean).join("; "));
}

const categoryByStyleId = new Map(
  STYLE_CATEGORY_GROUPS.flatMap((group) => group.ids.map((id) => [id, group.name]))
);
STYLE_DATA.forEach((style) => { style.type = categoryByStyleId.get(style.id); });

FILTER_GROUPS.type = STYLE_CATEGORY_GROUPS.map((group) => group.name);
FILTER_GROUPS.region = [...new Set(STYLE_DATA.map((style) => style.region))];
FILTER_GROUPS.traits = [...new Set(STYLE_DATA.flatMap((style) => style.traits))];
FILTER_GROUPS.fields = [...new Set(STYLE_DATA.flatMap((style) => style.fields))];
