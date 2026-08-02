import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourcePath = resolve(root, "expansion-candidates.json");
const fallbackSourcePath = resolve(root, "../outputs/019faccc-0aad-76a1-9502-8d5cecb510d2/.style_launch_candidates.json");
const outputPath = resolve(root, "data-expansion.js");
const checkOnly = process.argv.includes("--check");

let source;
try {
  source = JSON.parse(await readFile(sourcePath, "utf8"));
} catch {
  const allCandidates = JSON.parse(await readFile(fallbackSourcePath, "utf8"));
  source = allCandidates
    .filter((row) => row["状态"] === "建议新增")
    .map((row) => ({ nameZh: row["中文名"], nameEn: row.English, track: row["来源轨道"] }));
  await writeFile(sourcePath, `${JSON.stringify(source, null, 2)}\n`);
}

const bases = {
  "古代与古典视觉": base("古代文明", "古代至古典时期", -500, "古代地中海与西亚", "历史艺术", ["叙事", "秩序", "手工", "象征"], ["插画", "出版", "展览", "游戏"], ["#B78D5B", "#3C332B", "#D8C8A8"], "ancient-egyptian", {
    composition: pair("分层叙事、稳定轴线与等级清楚的空间", "layered narrative space with stable axes and clear hierarchy"),
    form: pair("概括轮廓、纪念性比例与克制的几何体块", "simplified contours, monumental proportions, and restrained geometric masses"),
    color: pair("矿物土色、炭黑、石灰白与克制强调色", "mineral earth colors, charcoal black, limestone white, and restrained accents"),
    lighting: pair("均匀正面光或擦边侧光，避免现代电影式光效", "even frontal light or grazing sidelight without modern cinematic effects"),
    material: pair("石材、灰泥、陶土或金属的哑光手工表面", "matte handcrafted surfaces of stone, plaster, clay, or metal"),
    type: pair("仅按需使用与刻铭结构一致的文字", "inscription-structured lettering only when requested")
  }),
  "欧洲艺术运动": base("欧洲艺术运动", "19–20世纪", 1900, "欧洲", "艺术运动", ["历史", "表现", "构成", "绘画性"], ["绘画", "插画", "海报", "出版"], ["#C34E3D", "#315A75", "#E4D7B8"], "post-impressionism", painterly()),
  "现代与当代艺术": base("现代与当代艺术", "20世纪中后期至今", 1970, "全球", "当代艺术", ["实验", "观念", "材料", "高识别"], ["绘画", "展览", "装置", "数字艺术"], ["#202525", "#D7483E", "#E7E5DD"], "abstract-expressionism", contemporary()),
  "平面设计与传播视觉": base("平面设计", "20世纪至今", 1960, "全球设计文化", "设计风格", ["网格", "排版", "高识别", "系统化"], ["海报", "品牌视觉", "出版", "包装"], ["#E33D35", "#1F2525", "#F2EFE7"], "swiss", graphic()),
  "建筑与空间视觉": base("建筑与空间", "20世纪至今", 1960, "全球", "建筑风格", ["结构", "空间", "材料", "几何"], ["建筑", "室内", "空间概念", "展览"], ["#A9A39A", "#303536", "#E7E2D8"], "architectural-brutalism", architecture()),
  "东亚视觉传统": base("东亚艺术", "传统至今", 1500, "东亚", "地域传统", ["线性", "留白", "手工", "秩序"], ["绘画", "插画", "出版", "文化展览"], ["#B84534", "#243330", "#E7DCC4"], "ink-wash", eastAsian()),
  "南亚与东南亚视觉": base("南亚与东南亚艺术", "传统至今", 1500, "南亚与东南亚", "地域传统", ["装饰", "叙事", "手工", "高饱和"], ["绘画", "插画", "包装", "文化展览"], ["#C94732", "#245D65", "#E4B94F"], "mughal-miniature", ornamental()),
  "西亚与伊斯兰视觉": base("西亚与伊斯兰艺术", "传统至今", 1400, "西亚与伊斯兰文化圈", "地域传统", ["几何", "装饰", "精密", "秩序"], ["插画", "出版", "建筑", "品牌视觉"], ["#236A78", "#B6903E", "#EEE4C9"], "islamic-geometry", islamic()),
  "非洲与大洋洲视觉": base("非洲与大洋洲艺术", "传统至今", 1500, "非洲与大洋洲", "地域传统", ["图形", "手工", "强对比", "节奏"], ["插画", "纺织", "空间", "文化展览"], ["#B54A32", "#202C2B", "#D9B44A"], "african-wax-print", textile()),
  "美洲传统与地域视觉": base("美洲地域艺术", "传统至今", 1500, "美洲", "地域传统", ["图形", "叙事", "手工", "象征"], ["插画", "纺织", "出版", "文化展览"], ["#A74331", "#2B5962", "#D9B14B"], "mexican-folk", ornamental()),
  "摄影、电影与印刷语言": base("摄影电影印刷", "19世纪末至今", 1950, "全球", "影像风格", ["成像", "光影", "叙事", "颗粒"], ["摄影", "影视", "海报", "出版"], ["#191B1C", "#D8D2C6", "#9D342E"], "film-noir", imaging()),
  "时尚与亚文化视觉": base("时尚与亚文化", "20世纪后期至今", 1990, "全球亚文化", "亚文化风格", ["造型", "反叛", "高识别", "混搭"], ["时尚", "摄影", "海报", "品牌视觉"], ["#17191B", "#D84678", "#D8D2C8"], "gothic-subculture", fashion()),
  "数字推想与网络审美": base("数字与网络审美", "1990年代至今", 2010, "全球网络文化", "数字审美", ["数字", "未来", "高识别", "系统化"], ["数字界面", "游戏", "海报", "影像"], ["#14171B", "#34C6C9", "#E13E8F"], "cyberpunk", digital()),
  "可转译工艺视觉系统": base("工艺转译", "传统至今", 1600, "跨地域", "工艺视觉", ["手工", "材质", "精密", "装饰"], ["产品", "包装", "插画", "品牌视觉"], ["#B58A45", "#263B38", "#E5DDCA"], "arts-crafts", craft())
};

const rules = [
  rule(/pompeian first/i, { period:"约前200–前80年", year:-150, region:"古罗马坎帕尼亚", composition:"仿石矩形墙面分区与粗细水平带", form:"凸起灰泥板、清楚接缝与石材式几何", color:"深红、赭黄、黑、绿与仿大理石杂色", material:"彩绘灰泥、仿石纹与浅浮雕板块" }),
  rule(/pompeian second/i, { period:"约前80–前20年", year:-50, region:"古罗马坎帕尼亚", composition:"中心透视、虚构开口与前景框架", form:"细建筑线、透视缩短与实体框景", color:"朱红、深黑、赭黄、蓝绿与石材白", material:"平整湿壁画、仿石与精密建筑描线" }),
  rule(/pompeian third/i, { period:"约前20年–公元50年", year:10, region:"古罗马坎帕尼亚", composition:"大面积单色面板、纤细轴线与小焦点", form:"极细线性构架、轻巧对称与悬浮小形", color:"朱红、黑、白、赭黄与少量绿蓝", material:"平滑湿壁画、哑光色面与精细线绘" }),
  rule(/pompeian fourth/i, { period:"约50–79年", year:60, region:"古罗马坎帕尼亚", composition:"多层框架、上下分区与复杂幻觉空间", form:"粗细结构并置、透视片段与密集节点", color:"朱红、黑、金黄、蓝绿与石材白", material:"湿壁画、灰泥、仿石与精细装饰描线" }),
  rule(/sumerian/i, {period:"约前3500–前2000年",year:-2800,region:"美索不达米亚",composition:"横向分层、基线秩序与等级比例",form:"正侧复合视点、紧凑轮廓与几何体块",color:"石灰白、沥青黑、赭红与青金石蓝",material:"石灰岩、雪花石膏与镶嵌颗粒"}),
  rule(/akkadian/i, {period:"约前2334–前2154年",year:-2250,region:"美索不达米亚",composition:"单一主轴结合上升对角线",form:"有力体块、深刻线与浮雕转折",material:"磨光石材、铜铸表面与清晰刻痕"}),
  rule(/assyrian/i, {period:"约前900–前612年",year:-750,region:"美索不达米亚",composition:"连续长幅叙事、平行基线与横向推进",form:"侧面轮廓、浅浮雕与精密刻线",material:"石灰石板、细密凿刻与哑光石面"}),
  rule(/babylonian/i, {period:"约前1894–前539年",year:-1000,region:"美索不达米亚",composition:"模块化墙面分区与带状重复",form:"清楚外轮廓、低浮雕模块与规则节奏",color:"钴蓝、青绿、赭黄、砖红与黑边",material:"彩釉砖、烧结陶面与深色勾缝"}),
  rule(/achaemenid/i, {period:"约前550–前330年",year:-450,region:"古代伊朗",composition:"轴线对称、长列重复与阶梯层级",form:"克制侧面造型、浅浮雕与精确轮廓",material:"磨光石材、浅浮雕与釉砖细节"}),
  rule(/parthian/i, {period:"约前247年–224年",year:1,region:"伊朗与西亚",composition:"正面中心、近似对称与浅层空间",form:"正面性、硬边轮廓与较少透视缩短"}),
  rule(/sasanian/i, {period:"224–651年",year:400,region:"伊朗与西亚",composition:"中心轴或圆形徽章与成对重复",form:"饱满体块、连续弧线与纹章式轮廓",color:"银白、暗金、深红、钴蓝与墨绿",material:"银器锤揲、鎏金与岩壁浮雕"}),
  rule(/indus valley/i, {period:"约前2600–前1900年",year:-2300,region:"南亚",composition:"小尺度方形框、中心图形与信息带",form:"简练侧面轮廓、凹刻线与紧密比例",material:"烧制皂石、陶土、铜与印压颗粒"}),
  rule(/minoan/i, {period:"约前2000–前1450年",year:-1700,region:"爱琴海克里特",composition:"开放场域、环绕曲线与非对称节奏",form:"弹性轮廓、收放曲线与轻盈动态",color:"赤陶红、埃及蓝、黑、白与暖黄",material:"湿壁画、细线陶绘与抛光石膏"}),
  rule(/mycenaean/i, {period:"约前1600–前1100年",year:-1400,region:"爱琴海希腊",composition:"中心轴、环形边带与紧凑对称",form:"厚重剪影、螺旋波带与直接轮廓",color:"暗金、青铜、赤陶红、黑与石灰白",material:"锤揲金片、青铜、巨石与陶面线绘"}),
  rule(/greek geometric/i, {period:"约前900–前700年",year:-800,region:"古希腊",composition:"严格横向分带、环形连续与满幅节奏",form:"折线、回纹、三角与概括黑色剪影",color:"陶土红、炭黑与少量米白",material:"哑光陶土、黑釉与细密手绘线"}),
  rule(/orientalizing/i, {period:"约前700–前600年",year:-650,region:"古希腊",composition:"连续饰带、中心徽章与疏密填充",form:"卷曲轮廓、莲瓣式几何与刻线",color:"陶土红、黑、乳白与暗紫红",material:"陶土、黑釉、附加彩与刻划细节"}),
  rule(/archaic greek/i, {period:"约前700–前480年",year:-580,region:"古希腊",composition:"正面中心、稳定轴线与对称平衡",form:"几何化比例、连续轮廓与模式化转折",material:"哑光石材、陶绘黑釉与克制彩绘"}),
  rule(/hellenistic/i, {period:"约前323–前31年",year:-180,region:"希腊化世界",composition:"对角线、旋转动势与深浅交错",form:"扭转体块、深褶线与强透视缩短",lighting:"强侧光形成深阴影与明亮边缘",material:"高低浮雕、大理石凿痕与青铜表面"}),
  rule(/roman republican/i, {period:"约前509–前27年",year:-100,region:"古罗马",composition:"稳定正面或三分之四视点与清楚中心",form:"具体表面转折、坚实比例与清晰轮廓",lighting:"方向明确的自然侧光",material:"大理石、青铜、灰泥与湿壁画"}),
  rule(/roman imperial/i, {period:"约前27年–4世纪",year:100,region:"罗马帝国",composition:"宏大轴线、连续叙事带与深层空间",form:"理想化比例、坚实体块与深浅浮雕",material:"抛光大理石、铸铜、马赛克与彩绘灰泥"}),
  rule(/early christian/i, {period:"约2–6世纪",year:350,region:"地中海与罗马世界",composition:"中心或横向叙事、等级比例与清楚分区",form:"正面造型、简化体积与厚实轮廓",material:"湿壁画、金色马赛克与手抄本颜料"}),
  rule(/coptic/i, {period:"约3–12世纪",year:600,region:"埃及与东北非",composition:"中心正面、近似对称与边带结构",form:"正面性、粗线轮廓与平面体积",material:"亚麻羊毛织物、蛋彩木板与干燥壁画"}),
  rule(/carolingian/i, {period:"约780–900年",year:820,region:"西欧",composition:"页框层级、中心图像与装饰边界",form:"古典体积、快速线描与精密首字结构",material:"羊皮纸、蛋彩、金箔、象牙与金属"}),
  rule(/ottonian/i, {period:"约950–1050年",year:1000,region:"中欧",composition:"严格中心轴、层叠分区与大面积金地",form:"拉长比例、强烈手势与平面体积",material:"羊皮纸蛋彩、金箔、珐琅与浮雕金属"}),
  rule(/romanesque art/i, {period:"约1000–1150年",year:1080,region:"西欧",composition:"半圆框、横向分区与等级比例",form:"厚重轮廓、拉长几何体与模式褶线",material:"石雕、湿壁画与蛋彩羊皮纸"}),
  rule(/international gothic/i, {period:"约1375–1425年",year:1400,region:"欧洲宫廷网络",composition:"浅层舞台空间、S形动线与精密边框",form:"修长比例、柔软曲线与尖细轮廓",material:"羊皮纸蛋彩、金箔与细织物表面"}),
  rule(/proto-renaissance/i, {period:"约1250–1400年",year:1320,region:"意大利",composition:"稳定中心、浅建筑空间与清楚叙事层级",form:"坚实体积、柔和褶线与连续轮廓",material:"湿壁画、木板蛋彩与金箔"}),
  rule(/northern renaissance|early netherlandish/i, {period:"约1420–1580年",year:1480,region:"北欧与尼德兰",composition:"稳定几何空间、层层景深与多细节焦点",form:"精确轮廓、微小反光与具体材质差异",lighting:"单向自然光、细腻明暗与可追踪反射",material:"多层透明油釉与细木板底"}),
  rule(/venetian school/i, {period:"约1500–1600年",year:1540,region:"威尼斯",composition:"宽阔三角或对角组织与色光连接",form:"柔边体块、综合色面与少量轮廓线",color:"暖金、深红、群青、橄榄绿与粉灰",lighting:"温暖漫射光、空气透视与柔和反射",material:"多层油画罩染与柔润表面"}),
  rule(/sienese/i, {period:"约1250–1500年",year:1350,region:"意大利锡耶纳",composition:"浅层叠置、中心轴与节奏化群组",form:"修长比例、连续曲线与图案化褶线",material:"木板蛋彩、金箔压纹与精刻线"}),
  rule(/spanish golden age/i, {period:"约1590–1680年",year:1630,region:"西班牙",composition:"单一焦点、深色大背景与稳定结构",form:"具体比例、坚实轮廓与克制笔触",lighting:"强定向侧光穿出深暗空间",material:"吸光油层、粗织画布与局部厚涂"}),
  rule(/han dynasty silk/i, {
    period:"约前2世纪–2世纪", year:1, region:"东亚 · 中国",
    composition:pair("上下层叠的宇宙分区、中心轴与贯穿画面的流动曲线", "vertically tiered cosmological zones, a central axis, and flowing curves that connect the full field"),
    form:pair("细而连续的墨线、平面色区与舒展的带状轮廓", "fine continuous ink contours, flat color areas, and elongated ribbon-like curves"),
    color:pair("暖褐绢地、墨黑、朱红、土黄与低饱和矿物青绿", "warm brown silk, ink black, vermilion, ochre, and muted mineral blue-green"),
    lighting:pair("均匀平面光，以色层和遮叠建立浅层空间，不使用写实投影", "even flat illumination, with shallow space built by color layers and overlap rather than cast shadows"),
    material:pair("老化绢纹、细密墨线、薄层矿物色与局部颜料脱落", "aged silk grain, fine ink linework, thin mineral color, and restrained pigment loss"),
    type:pair("仅在用户要求文字时使用清楚可读、与秦汉书写结构相容的字形", "only when text is requested, use legible lettering compatible with Qin-Han script structure")
  }),
  rule(/han dynasty pictorial stone/i, {
    period:"约前2世纪–2世纪", year:100, region:"东亚 · 中国",
    composition:pair("横向分栏、连续叙事与压缩的浅层空间", "horizontal registers, continuous episodic sequencing, and compressed shallow space"),
    form:pair("减地浅浮雕、侧面剪影、硬边凿线与概括体块", "low-relief carving, profile silhouettes, hard incised edges, and simplified masses"),
    color:pair("石灰灰、炭黑与纸白构成拓片式高反差", "limestone gray, charcoal black, and paper white in a rubbing-like high-contrast range"),
    lighting:pair("拓片版本采用均匀平面明暗，石刻版本采用擦边侧光显示凿刻深浅", "use even flat tonal contrast for rubbing treatments or grazing sidelight to reveal carved depth"),
    material:pair("粗粒石面、凿刻沟槽、墨拓渗印与纤维纸纹", "coarse stone grain, chiseled grooves, ink-rubbing transfer, and fibrous paper texture"),
    type:pair("仅在用户要求文字时使用准确可读的汉代刻铭式字形", "only when text is requested, use accurate legible lettering derived from Han carved inscriptions")
  }),
  rule(/wei-jin tomb/i, {
    period:"3–6世纪", year:400, region:"东亚 · 中国",
    composition:pair("长幅横向推进、分区叙事、浅层遮叠与克制留空", "long horizontal progression, segmented narrative zones, shallow overlap, and restrained open ground"),
    form:pair("舒展而有节奏的轮廓线、简化体积与连续动势", "rhythmic flowing contours, simplified volume, and continuous directional movement"),
    color:pair("砖红、赭黄、灰绿、墨黑与石灰白的低饱和综合色", "a muted range of brick red, ochre, gray-green, ink black, and lime white"),
    lighting:pair("均匀壁画光，以线条、综合色层和遮叠组织空间", "even mural illumination, with space organized by line, color layers, and overlap"),
    material:pair("墓室砖墙或灰泥、干壁画矿物颜料、磨蚀边缘与细颗粒", "tomb brick or plaster, dry-fresco mineral pigment, abraded edges, and fine granular wear"),
    type:pair("仅在用户要求文字时使用简洁可读、与魏晋书写相容的题记", "only when text is requested, use concise legible inscriptions compatible with Wei-Jin writing")
  }),
  rule(/tang figure/i, {period:"7–10世纪",year:750,region:"东亚 · 中国",composition:"稳定中心、群组层级与疏朗背景",form:"圆润体量、流畅衣褶线与克制动态",color:"朱砂、石绿、赭色、白与少量金色",lighting:"均匀柔光，以线染塑造体积",material:"绢本或纸本、矿物设色与细线勾勒"}),
  rule(/tang gold-and-blue/i, {period:"7–10世纪",year:750,region:"东亚 · 中国",composition:"高视点层叠、山形节奏与云水留白",form:"细线勾勒、块面山形与金线节点",color:"石青、石绿、赭色、朱砂与金色",material:"绢本矿物色、金线与层层罩染"}),
  rule(/northern song landscape/i, {period:"10–12世纪",year:1050,region:"东亚 · 中国",composition:"高远主峰、层层深度与小尺度节奏参照",form:"坚实山体结构、皴擦层次与精细点线",color:"墨色、淡赭、灰绿与纸绢暖白",lighting:"清润自然光与空气层次",material:"绢本水墨、淡设色与细密皴法"}),
  rule(/southern song landscape|ma-xia/i, {period:"12–13世纪",year:1200,region:"东亚 · 中国",composition:"偏角取景、大片留白与近景强焦点",form:"斧劈式硬折、简练远景与粗细线对比",color:"墨黑、灰褐、淡绿与绢本暖白",lighting:"雾化远景与局部明暗对比",material:"绢本水墨、湿润墨层与锐利皴线"}),
  rule(/yuan literati/i, {period:"13–14世纪",year:1320,region:"东亚 · 中国",composition:"平远层叠、书写节奏与疏朗留白",form:"干笔皴擦、概括轮廓与笔墨结构",color:"墨色、纸白与极少淡赭",lighting:"不依赖写实投影，以墨色浓淡分层",material:"纸本水墨、干湿笔触与题跋式空域"}),
  rule(/wu school|zhe school|songjiang school|jinling school/i, {period:"约15–17世纪",year:1550,region:"东亚 · 中国",composition:"散点层叠、卷轴式游观与虚实分区",form:"书写线条、皴法差异与概括山形",color:"墨色、淡赭、灰绿与克制矿物色",material:"纸绢水墨、设色层染与可见笔触"}),
  rule(/four wangs|four monks/i, {period:"17世纪",year:1670,region:"东亚 · 中国",composition:"传统层叠景物程式的重组、层叠与节奏控制",form:"皴法模块、书写轮廓与结构化笔墨",color:"墨色、淡赭、灰绿与纸本暖白",material:"纸本水墨、干湿叠加与笔触积层"}),
  rule(/eight eccentrics/i, {period:"18世纪",year:1750,region:"东亚 · 中国",composition:"偏心取势、大块留白与突出的单一笔墨焦点",form:"夸张概括、书写性强线与枯湿突变",color:"墨黑、纸白与少量朱砂或淡彩",material:"纸本水墨、飞白、泼写与干笔颗粒"}),
  rule(/shanghai school|lingnan school/i, {period:"19世纪末–20世纪",year:1900,region:"东亚 · 中国",composition:"传统卷轴结构与近代图像裁切并置",form:"书写线条、综合色面与较强写生体积",color:"墨色、鲜明设色与纸本暖白",lighting:"自然观察光与水墨层次结合",material:"纸本水墨、矿物或水彩设色与印刷影响"}),
  rule(/taohuawu|yangliuqing|mianzhu|weifang|new year print/i, {period:"约17世纪至今",year:1750,region:"东亚 · 中国",composition:"中心主图、边带装饰与对称或分区布局",form:"木版硬边轮廓、平面套色与概括形体",color:"朱红、明黄、石绿、蓝与黑色套印",lighting:"平面印刷光，不依赖写实投影",material:"木版刻线、套色偏差、纸纤维与手工填色"}),
  rule(/lianhuanhua/i, {period:"20世纪",year:1950,region:"东亚 · 中国",composition:"连续画格、清楚叙事顺序与简洁画外空间",form:"精细线描、黑白层次与可读动作轮廓",color:"黑白灰为主，按需使用有限套色",lighting:"线性明暗与印刷灰阶",material:"钢笔或毛笔线描、新闻纸与胶印颗粒"}),
  rule(/yuefenpai|shanghai moderne/i, {period:"约1910–1940年代",year:1930,region:"东亚 · 中国",composition:"中心商业主图、装饰边框与广告文字区",form:"柔化写实体积、清楚轮廓与装饰几何",color:"粉彩综合色、朱红、青绿、金色与米白",lighting:"柔和影棚光与平滑综合色阶",material:"石印或胶印网点、纸张与手工修饰"}),
  rule(/seal script|clerical script|regular script|running script|cursive script|oracle bone|bronze inscription/i, {period:"古代至今",year:500,region:"东亚 · 中国",composition:"字距、行列、重心与留白构成主体版面",form:"笔画起收、转折、粗细与结构比例主导造型",color:"墨黑、纸白与少量朱砂",lighting:"平面均匀光，不以投影塑造字形",material:"墨迹渗化、石骨刻痕或青铜铭刻质感",type:"用户原文必须准确，以对应书体的结构而非伪文字呈现"}),
  rule(/yamato-e|tosa school/i, {period:"约9–19世纪",year:1200,region:"东亚 · 日本",composition:"斜向俯视、屋顶揭除式分区与卷轴叙事",form:"细线轮廓、平面色区与柔和主体比例",color:"矿物群青、朱红、绿、金与纸绢暖白",lighting:"均匀平面光与金地微光",material:"纸绢矿物色、金银箔与细密线描"}),
  rule(/kano school/i, {period:"15–19世纪",year:1600,region:"东亚 · 日本",composition:"屏风式大构图、强主轴与大片金地留空",form:"强劲墨线、概括体块与装饰性色面",color:"墨色、金地、矿物绿蓝与朱红",lighting:"金地反光与墨色层次共同塑形",material:"屏风纸本、金箔、水墨与矿物颜料"}),
  rule(/japanese nanga/i, {period:"18–19世纪",year:1800,region:"东亚 · 日本",composition:"平远层叠、文人式留白与书画并置",form:"干笔皴擦、松动轮廓与书写性点线",color:"墨色、淡赭与克制水色",material:"纸本水墨、淡彩与干湿笔触"}),
  rule(/japanese zen ink/i, {period:"14–16世纪",year:1450,region:"东亚 · 日本",composition:"单一焦点、大面积留白与偏心平衡",form:"迅疾墨线、简化轮廓与浓淡突变",color:"墨黑、淡墨与纸白",lighting:"不使用写实投影，以墨色浓淡建立体积",material:"纸本水墨、飞白与渗化边缘"}),
  rule(/shin-hanga/i, {period:"约1915–1960年",year:1930,region:"东亚 · 日本",composition:"现代裁切、单一焦点与清楚前中后层次",form:"木版轮廓、柔和综合色阶与精确套色",color:"综合色、深蓝、暖红与纸白",lighting:"大气光、夜色或雨雪的综合色阶",material:"木版套色、纸纹与精密版次叠印"}),
  rule(/sosaku-hanga/i, {period:"20世纪上半叶",year:1935,region:"东亚 · 日本",composition:"直接构图、版面留痕与个人化不对称",form:"粗刻线、简化块面与手工边缘",color:"有限套色、黑色主版与纸张底色",lighting:"平面印刷光与色块明度关系",material:"自刻自印木版、刀痕与套印偏差"}),
  rule(/gutai/i, {period:"1954–1972年",year:1960,region:"东亚 · 日本",composition:"行动痕迹、非中心扩散与材料事件",form:"撕裂、泼洒、穿透与大尺度手势",color:"高对比原色、黑白与材料本色",lighting:"展示光突出凹凸和材料变化",material:"厚颜料、纸布破口与行为制作痕迹"}),
  rule(/mono-ha/i, {period:"约1968–1973年",year:1970,region:"东亚 · 日本",composition:"少量元素、重力关系与开放负空间",form:"未经修饰的几何或自然材料原形",color:"石木土金属本色与中性背景",lighting:"自然展示光与接触阴影",material:"石、木、玻璃、钢与现场接触关系"}),
  rule(/dansaekhwa/i, {period:"1970年代至今",year:1975,region:"东亚 · 韩国",composition:"满幅单色场、重复动作与细微网格",form:"刮、推、点、压形成的微小表面单位",color:"白、灰、土色、深蓝等克制单色",lighting:"柔侧光显示极低浮雕和综合色差",material:"厚薄颜料、画布纤维与重复手工痕迹"}),
  rule(/chaekgeori/i, {period:"18–19世纪",year:1800,region:"东亚 · 韩国",composition:"多层架格式分区、反向透视与密集陈列",form:"清楚硬边、几何格口与精细物面轮廓",color:"矿物红绿蓝、墨黑、金色与纸白",lighting:"均匀平面光与局部明暗",material:"纸绢设色、细线与矿物颜料"}),
  rule(/korean ink abstraction/i, {period:"20世纪中后期至今",year:1980,region:"东亚 · 韩国",composition:"开放留白、墨块扩散与现代画面尺度",form:"书写线、泼墨边缘与抽象结构",color:"墨黑、灰阶、纸白与少量综合色",lighting:"墨色浓淡与纸面吸收形成空间",material:"纸本水墨、渗化、皴擦与当代拼接"}),
  rule(/ainu pattern/i, {period:"传统至今",year:1700,region:"东亚 · 日本北海道",composition:"连续边带、镜像重复与中心留底",form:"尖括弧、旋涡与粗细一致的护边轮廓",color:"靛蓝、黑、白、红与纤维本色",lighting:"均匀织物光与轻微线迹阴影",material:"树皮布或棉布、贴布、刺绣与可见线迹",type:"仅按需使用不干扰纹样连续性的清晰文字"}),
  rule(/taiwan indigenous weaving/i, {period:"传统至今",year:1700,region:"东亚 · 台湾",composition:"经纬网格、连续边带与对称重复",form:"菱形、阶梯形与条带式几何单位",color:"红、黑、白与纤维本色的高对比关系",lighting:"均匀织物光与轻微经纬阴影",material:"手织纤维、经纬起伏与染色差异"}),
  rule(/ryukyu bingata/i, {period:"约14世纪至今",year:1600,region:"东亚 · 琉球",composition:"满幅重复、疏密分区与清楚底色",form:"型纸硬边、手绘晕染与连续纹样单位",color:"朱红、明黄、靛蓝、绿色与布底白",lighting:"均匀织物光，保留染色色差",material:"型纸防染、颜料渗化与手工套色"}),
  rule(/pointill|divisionism/i, {period:"约1880–1905年",year:1890,region:"法国与意大利",composition:"稳定整体轮廓与细小色点的均匀覆盖",form:"由并置色点在视距中合成形体",color:"高纯度互补色与综合色中间调",lighting:"以色点明度而非连续灰阶表现光",material:"细小点触、干燥颜料与可见画布纹理"}),
  rule(/kinetic|zero group|spatialism/i, {period:"约1945–1970年",year:1960,composition:"序列、重复、光学变化与观看路径",form:"几何模块、切割、悬置或真实运动",lighting:"定向光、反射与阴影参与构图",material:"金属、玻璃、单色涂层与工业表面"}),
  rule(/arte povera/i, {period:"约1967–1975年",year:1970,region:"意大利",composition:"开放组合、重力关系与非纪念尺度",form:"简单堆叠、张力、折叠与材料原形",color:"土色、中性色与材料本色",material:"石、木、布、土与非贵重工业材料"}),
  rule(/informel|tachisme|lyrical abstraction|cobr/i, {period:"约1945–1965年",year:1955,composition:"非中心、即兴扩散与满幅笔势",form:"不规则斑块、手势线与未封闭形",color:"综合色、黑线与局部高纯度对比",lighting:"平面画面光，以颜料厚薄形成层次",material:"擦涂、滴洒、刮痕与粗糙颜料表面"}),
  rule(/new objectivity|magic realism painting|precisionism/i, {period:"约1920–1940年",year:1930,composition:"冷静几何、清楚空间与稳定视点",form:"锐利轮廓、坚实体积与克制变形",color:"低至中饱和色与冷暖分区",lighting:"清晰均匀光或冷硬侧光",material:"平滑油层、少见笔触与精确边缘"}),
  rule(/constructivist architecture|metabolism|archigram|high-tech architecture|structural expressionism/i, {period:"约1920–1980年",year:1965,composition:"外露结构、模块生长与清楚动线",form:"框架、舱体、管线与可读连接节点",color:"材料本色配高识别功能色",lighting:"均匀分析光与金属边缘高光",material:"钢、玻璃、混凝土与预制构件"}),
  rule(/brutalist architecture|neo-brutalist interior/i, {period:"约1950年代至今",year:1965,composition:"厚重体量、清楚结构与大尺度留空",form:"直角块体、深凹开口与重复模块",color:"混凝土灰、黑、锈色与克制原色",lighting:"硬侧光强调体量和深阴影",material:"清水混凝土、粗木模板纹与外露结构"}),
  rule(/art nouveau|secession|glasgow style/i, {period:"约1890–1915年",year:1900,composition:"不对称框架、连续曲线与图文一体",form:"鞭状曲线、扁平轮廓与精密装饰节点",color:"植物绿、金色、深蓝与柔和综合色",material:"平涂印刷、彩色玻璃与金属线条"}),
  rule(/poster|plakat|flyer|propaganda/i, {composition:"大尺度主图、强标题层级与直接阅读路径",form:"简化剪影、硬边色块与高对比图形",color:"有限高对比色与纸张底色",lighting:"平面印刷光，不使用写实投影",material:"粗网点、丝网套色或胶印颗粒",type:"大字号标题、紧凑副文与清楚层级"}),
  rule(/typograph|typeface|type design|lettering/i, {composition:"基线、网格、字级与留白主导版面",form:"字形结构、笔画对比与模块节奏",color:"高对比文字色与克制强调色",lighting:"平面无影的印刷或屏幕呈现",material:"清晰矢量边缘或受控印刷颗粒",type:"文字作为主要造型并保持用户原文可读"}),
  rule(/risograph|screen-printed|xerox|letterpress|halftone|duotone|woodcut|engraving|lithograph|rubber stamp|color woodblock/i, printmaking()),
  rule(/pixel|ps1|n64|console low-poly|isometric pixel/i, {period:"约1980年代至今",year:1995,composition:"像素网格、有限视角与清楚层级",form:"阶梯边缘、低分辨率块面与简化体积",color:"有限调色板与离散明度级",lighting:"烘焙式明暗或无渐变色阶",material:"可见像素、纹理抖动与低分辨率采样",type:"位图字形与固定网格排版"}),
  rule(/voxel/i, {composition:"三维正交网格与可读层级",form:"等尺寸立方体拼接的离散体积",color:"有限色阶与面向分区",lighting:"硬边环境光遮蔽与块面阴影",material:"体素颗粒与无平滑曲面",type:"方格字形与模块化界面"}),
  rule(/ascii|terminal|code poetry|hacker/i, {composition:"等宽字符网格、行列秩序与终端留白",form:"字符密度形成轮廓和灰阶",color:"黑底配单色荧光或低色数文本",lighting:"屏幕自发光与轻微辉光",material:"低分辨率显示、扫描线与字符采样",type:"等宽字体、命令行层级与原文准确"}),
  rule(/web 1\.0|desktop metaphor|early metaverse|internet collage/i, {period:"约1990–2005年",year:1998,composition:"多窗格、密集链接与非统一栅格",form:"小图标、硬边按钮与拼贴式模块",color:"网页安全色、默认蓝链接与灰色控件",lighting:"平面屏幕光与早期小面积高光",material:"低分辨率位图、压缩图与系统控件",type:"默认网页字体、下划线链接与紧凑字号"}),
  rule(/glitch|databend|scanography/i, {composition:"局部错位、条带断裂与受控数据偏移",form:"重复边缘、像素撕裂与扫描畸变",color:"RGB通道分离、过饱和局部色与黑白底",lighting:"电子过曝、扫描亮带与局部反相",material:"压缩块、坏帧、噪点与数字扫描纹理"}),
  rule(/point cloud|photogrammetry|3d scan/i, {composition:"漂浮采样、断续轮廓与深度分层",form:"点集或网格残片构成不完整体积",color:"传感器综合色、冷灰与局部伪彩",lighting:"环境光与数据密度共同塑形",material:"点云颗粒、网格破口与扫描噪声"}),
  rule(/chrome|liquid metal|holographic/i, {composition:"集中体量、流线反射与大面积洁净背景",form:"镜面曲面、液态折叠与圆滑高光边缘",color:"银铬、虹彩、黑与冷白",lighting:"多条带状软箱反射与锐利轮廓光",material:"镜面金属、镀铬塑形与薄膜虹彩"}),
  rule(/cyanotype/i, {period:"1840年代至今",year:1850,composition:"单色负形、接触式轮廓与纸面留白",form:"边缘软硬变化与曝光形成的平面形",color:"普鲁士蓝与纸白",lighting:"由曝光深浅形成单色层次",material:"铁盐感光、纸纤维与水洗不均"}),
  rule(/wet plate|daguerreotype/i, {period:"19世纪中期",year:1860,composition:"正式中心、浅景深与画幅边缘衰减",form:"精细中心、柔化边缘与克制姿态",color:"银灰、暖黑与棕褐单色",lighting:"长曝光式稳定光与方向柔光",material:"银盐、玻璃或金属底片与化学斑痕"}),
  rule(/polaroid|instant flash/i, {period:"约1970年代至今",year:1985,composition:"近距离中心裁切与即时快照构图",form:"直接轮廓、轻微失焦与随机边缘",color:"暖白、偏青阴影与局部高饱和色",lighting:"正面硬闪光与快速衰减阴影",material:"即时成像乳剂、白边与轻微色偏"}),
  rule(/film noir|neo-noir|tech noir|giallo|neon noir/i, {composition:"低机位、斜线遮挡与深暗负空间",form:"硬轮廓、局部剪影与紧张透视",color:"黑色深调配单一高饱和强调色",lighting:"硬侧光、百叶式切光与潮湿反射",material:"胶片颗粒、烟雾层次与高反差成像"}),
  rule(/new wave cinema|neorealism|new cinema|new hollywood/i, {composition:"现场式取景、开放画外空间与不完美裁切",form:"自然比例、非舞台化动作与环境关系",color:"自然综合色或克制胶片色",lighting:"可用光、自然曝光与保留暗部",material:"颗粒胶片、手持轻微抖动与真实表面"}),
  rule(/stained glass|plique-a-jour/i, {composition:"铅条或金属丝分隔的闭合色区",form:"连续硬边、几何拼片与清楚主轮廓",color:"宝石红、钴蓝、翠绿、琥珀与透光白",lighting:"强背光穿透彩色材料",material:"有气泡的彩玻璃、金属分隔与焊点"}),
  rule(/mosaic|pietra dura|marquetry|intarsia|inlay|eggshell|feather mosaic/i, {composition:"按结构分区的拼片与镶嵌节奏",form:"硬边色片、细接缝与轮廓嵌线",color:"材料本色与有限对比色",lighting:"斜侧光显示拼片接缝和反光差",material:"切片镶嵌、微小接缝与手工不均"}),
  rule(/lacquer|maki-e|kintsugi|tsuishu/i, {composition:"大面积深色留底与局部高密度细节",form:"连续轮廓、层层堆叠与精细刻线",color:"漆黑、朱红、暗金与克制虹彩",lighting:"低调侧光与连续漆面反射",material:"多层漆、金粉、刻痕与抛光表面"}),
  rule(/celadon|ru ware|guan ware|jun ware|longquan|raku|shino|oribe|delft|azulejo|tile|porcelain|sancai|transferware/i, {composition:"器表式分区、留底与重复边带",form:"柔和轮廓、釉层包裹与烧制变化",color:"釉色主调配胎体白或陶土色",lighting:"柔和漫射光与小面积釉面高光",material:"陶胎、釉层、开片、流釉与烧制差异"}),
  rule(/dye|batik|shibori|katazome|yuzen|indigo resist|bingata/i, {composition:"重复单元、布面满幅或中心留白结构",form:"防染边缘、渗化轮廓与折叠重复",color:"染料主色、布底色与受控综合色",lighting:"均匀织物光，避免塑料高光",material:"纤维吸色、防染裂纹与手工套色偏差"}),
  rule(/embroidery|sashiko|blackwork|whitework|goldwork|kesi|brocade|nishijin|yunjin|song brocade|knit|crochet|lace|tapestry|carpet|quilt|boro|beadwork/i, textile()),
  rule(/origami|quilling|paper relief|scrapbook|papier/i, {composition:"折线、层叠纸面与清楚正负形",form:"折面、卷纸、切边与模块拼接",color:"纸张本色配有限印刷或染色色块",lighting:"柔和侧光显示折痕和纸层阴影",material:"纸纤维、切边、折痕与轻微毛边"}),
  rule(/bamboo|rattan|straw weaving|knot|mesh weaving/i, {composition:"经纬网格、重复编结与疏密分区",form:"条带交错、节点连接与连续边缘",color:"纤维本色、深浅编条与少量染色",lighting:"斜侧光强调编织起伏和投影",material:"纤维、竹藤、绳结或金属网的交织表面"}),
  rule(/carving|jade|soapstone|sgraffito|stucco|plaster|charred wood|shou sugi/i, {composition:"实体留白、凹凸层级与刻痕方向",form:"削切面、浮雕边缘与连续工具路径",color:"材料本色、阴刻暗部与局部抛光色",lighting:"擦边侧光突出凹凸和工具痕",material:"石、木或灰泥的雕刻颗粒与手工边缘"}),
  rule(/fashion|couture|techwear|gorpcore|lolita|kei|gyaru|mod|rock|punk|metal|goth|rave|disco|balletcore|coquette|core/i, fashion(), "时尚与亚文化视觉"),

  // South and Southeast Asia: distinguish sculpture, manuscript painting, mural, print, floor drawing, textile, and lacquer.
  rule(/gandhara/i, {period:"约1–5世纪",year:200,region:"南亚西北部",composition:"稳定正面或三分之四视点、浅龛式空间与清楚垂直轴",form:"自然主义体积、深衣褶、波浪发束与克制姿态",color:"片岩灰、灰泥白与残存矿物综合色",lighting:"柔侧光塑造深衣褶和圆润体积",material:"灰色片岩、灰泥或陶塑的细凿表面",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "南亚与东南亚视觉"),
  rule(/mathura|gupta|chola art|vijayanagara/i, {period:"约1–16世纪",year:700,region:"南亚 · 印度",composition:"正面中轴、环绕式节奏与建筑龛框层级",form:"连续饱满轮廓、节律化姿态与清楚手势结构",color:"砂岩红、青铜棕、石灰白与矿物残彩",lighting:"擦边侧光强调圆润体积与浅深浮雕",material:"砂岩、花岗岩或失蜡青铜的雕铸表面",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "南亚与东南亚视觉"),
  rule(/pala art/i, {period:"约8–12世纪",year:950,region:"南亚东部",composition:"狭长贝叶画幅、严格中心与层层环绕的小尺度结构",form:"细密轮廓、紧凑比例与珠宝式重复节点",color:"朱红、深蓝、绿、黑与金色",lighting:"均匀平面光，以色层和金色节点建立层级",material:"贝叶或纸本、矿物颜料、墨线与金饰",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "南亚与东南亚视觉"),
  rule(/deccani|rajasthani|pahari|company painting/i, {period:"约16–19世纪",year:1750,region:"南亚 · 印度",composition:"浅层场域或风景舞台、精密边框与清楚叙事焦点",form:"细线轮廓、侧面或三分之四造型与精确微细节",color:"矿物宝石色、综合色背景、纸白与局部金色",lighting:"均匀综合色光，以平涂和细密层染塑形",material:"纸本矿物色、不透明水彩、金饰与细描",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "南亚与东南亚视觉"),
  rule(/bengal school/i, {period:"约1905–1940年",year:1920,region:"南亚 · 印度",composition:"疏朗中心、雾化背景与诗性留白",form:"柔化轮廓、流动线条与轻薄综合色体积",color:"淡褐、灰绿、靛蓝与低饱和暖色",lighting:"低对比漫射光与薄雾式层次",material:"水彩洗染、蛋彩薄层与吸水纸面"}, "南亚与东南亚视觉"),
  rule(/kalighat/i, {period:"约19世纪",year:1870,region:"南亚 · 印度加尔各答",composition:"单一主体、大面积素底与直接居中或偏心取势",form:"粗黑连续轮廓、扫刷式体积与高度概括造型",color:"有限明亮综合色、墨黑与纸白",lighting:"平面画面光，仅以宽笔综合色提示体积",material:"纸本水彩或不透明色、快速笔线与平滑刷痕"}, "南亚与东南亚视觉"),
  rule(/gond/i, {period:"传统至今",year:1980,region:"南亚 · 印度中部",composition:"轮廓内满布重复纹理、密集全幅与分形节奏",form:"清楚外轮廓、点线填充与分叉式内部结构",color:"高饱和红黄绿蓝、黑色轮廓与浅色底",lighting:"均匀平面光，以纹样密度形成明暗",material:"纸或画布、细笔点线与不透明平涂"}, "南亚与东南亚视觉"),
  rule(/warli/i, {period:"传统至今",year:1900,region:"南亚 · 印度西部",composition:"中心环舞或叙事场景、基线串联与均匀留底",form:"圆、三角与短线组成的白色几何形",color:"稻米白与红褐泥墙的双色对比",lighting:"完全平面化，不使用体积投影",material:"泥墙颗粒、稻米浆白色笔痕与手绘不均"}, "南亚与东南亚视觉"),
  rule(/pattachitra|phad painting/i, {period:"传统至今",year:1700,region:"南亚 · 印度",composition:"连续叙事分区、密集边框与几乎无空白的满幅组织",form:"粗细一致的深色轮廓、平面形与重复装饰节点",color:"朱红、黄、绿、黑、白与矿物蓝",lighting:"均匀平面光，以色块对比区分层级",material:"布或处理纸面、矿物与植物颜料、精细线绘"}, "南亚与东南亚视觉"),
  rule(/rangoli|kolam/i, {period:"传统至今",year:1600,region:"南亚",composition:"地面中心放射、镜像对称与连续闭合网格",form:"点阵导引的连线、几何结与流动白线",color:"米白单色或高饱和粉末综合色",lighting:"均匀顶光，保留粉末与地面的轻微阴影",material:"米粉、石粉或花粉颗粒与手撒边缘",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "南亚与东南亚视觉"),
  rule(/kalamkari/i, {period:"传统至今",year:1700,region:"南亚 · 印度",composition:"叙事中心、植物边带与连续布面分区",form:"卡拉姆笔绘轮廓、蜡防染式硬边与细密填纹",color:"茜红、靛蓝、黑、赭黄与布本米色",lighting:"均匀织物光，不使用塑料式高光",material:"棉布、植物染、媒染渗化与手绘线迹"}, "南亚与东南亚视觉"),
  rule(/songket|ikat|batik/i, {period:"传统至今",year:1750,region:"东南亚",composition:"经纬重复、中心菱格或连续边带与明确疏密关系",form:"由经纬、蜡防染或金属线形成的硬软交替轮廓",color:"靛蓝、茜红、金黄、黑与纤维本色",lighting:"均匀织物光，金属线仅有细小反光",material:"手织纤维、经纬错位、蜡裂或金银纬线",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "南亚与东南亚视觉"),
  rule(/balinese|ubud school/i, {period:"约19世纪至今",year:1930,region:"东南亚 · 印度尼西亚巴厘岛",composition:"密集全幅、层叠群像与几乎无空白的连续叙事",form:"细密流线、装饰性轮廓与重复尺度变化",color:"传统黑褐灰阶或综合色矿物色与金色节点",lighting:"均匀叙事光，以线密度和综合色层次塑形",material:"纸布墨线、综合色层染与细密手绘"}, "南亚与东南亚视觉"),
  rule(/wayang|classical javanese/i, {period:"约9世纪至今",year:1700,region:"东南亚 · 印度尼西亚爪哇",composition:"侧面主体串联、横向基线与装饰边带",form:"极度拉长的侧面剪影、尖锐关节与穿孔式细节",color:"黑、棕、红、金与皮革本色",lighting:"平面正光或强背光形成清楚剪影",material:"雕刻水牛皮、穿孔、金彩与木杆结构"}, "南亚与东南亚视觉"),
  rule(/khmer angkor/i, {period:"约9–15世纪",year:1150,region:"东南亚 · 高棉",composition:"长幅浅浮雕、连续基线与建筑轴线秩序",form:"低浮雕侧面轮廓、节律化姿态与密集装饰带",color:"砂岩暖灰、风化褐与残存矿物色",lighting:"擦边侧光显示浅浮雕层级",material:"砂岩凿刻、风化颗粒与连续刻线"}, "南亚与东南亚视觉"),
  rule(/bagan|thai temple mural|lao temple|kandyan temple/i, {period:"约11–19世纪",year:1750,region:"南亚与东南亚佛教文化圈",composition:"墙面连续叙事、层级式场景与装饰边框",form:"细线轮廓、平面群组与节律化建筑分隔",color:"朱红、赭黄、绿、黑、白与局部金色",lighting:"均匀平面光，以色区和线条组织叙事",material:"干湿壁画、矿物颜料、灰泥裂纹与金饰"}, "南亚与东南亚视觉"),
  rule(/newar paubha/i, {period:"约13世纪至今",year:1700,region:"南亚 · 尼泊尔谷地",composition:"严格中心、同心层级与密集边框",form:"精密连续轮廓、对称环绕与珠宝式微细节",color:"朱红、群青、绿、金与深色底",lighting:"均匀平面光，金色节点产生微小反光",material:"棉布矿物色、金饰与细密勾线"}, "南亚与东南亚视觉"),
  rule(/dong ho/i, {period:"约17世纪至今",year:1800,region:"东南亚 · 越南",composition:"单一主图、平面基线与简明叙事留白",form:"木版硬边、粗黑轮廓与概括形体",color:"天然红黄绿黑与贝壳粉纸白",lighting:"平面印刷光，不使用写实阴影",material:"木版套印、手工纸纤维、云母光泽与套色偏差"}, "南亚与东南亚视觉"),
  rule(/vietnamese lacquer/i, {period:"20世纪至今",year:1940,region:"东南亚 · 越南",composition:"大色面分区、浅层叠置与金属色节点",form:"连续轮廓、磨显边缘与平面化体积",color:"漆黑、朱红、金、银与蛋壳白",lighting:"低调反射光与抛光表面的综合色深度",material:"多层天然漆、金银箔、蛋壳镶嵌与磨显痕迹"}, "南亚与东南亚视觉"),
  rule(/peranakan/i, {period:"约19–20世纪",year:1900,region:"东南亚海峡殖民地",composition:"对称立面、密集边饰与瓷砖式重复单元",form:"中式花叶曲线、欧洲框饰与南洋几何拼接",color:"薄荷绿、粉、钴蓝、赭黄与白色高明度综合色",lighting:"明亮均匀的热带日光与釉面小高光",material:"彩釉瓷砖、灰泥、木雕与珠绣表面"}, "南亚与东南亚视觉"),

  // West Asia and Islamic visual systems.
  rule(/kufic/i, {period:"约7世纪至今",year:900,region:"西亚与伊斯兰文化圈",composition:"严格基线、方整比例与建筑式横向展开",form:"角折粗笔、等厚结构、延长横画与几何收束",color:"墨黑、纸白、金色与克制矿物强调色",lighting:"平面无影，以字形黑白关系建立层级",material:"羊皮纸墨迹、石刻或釉砖硬边",type:"文字是主要造型；准确保留用户原文并采用可辨识库法体结构",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "西亚与伊斯兰视觉"),
  rule(/naskh calligraphy/i, {period:"约10世纪至今",year:1200,region:"西亚与伊斯兰文化圈",composition:"稳定基线、紧凑行距与清楚正文层级",form:"圆润小写比例、清晰点画与受控粗细变化",color:"墨黑、纸白、金色与少量矿物色",lighting:"平面均匀光，保持字形清晰",material:"纸本墨迹、芦苇笔触与手抄纸纤维",type:"文字是主要造型；准确保留用户原文并采用清晰纳斯赫体结构",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "西亚与伊斯兰视觉"),
  rule(/nastaliq/i, {period:"约14世纪至今",year:1500,region:"伊朗及南亚波斯语文化圈",composition:"斜向下垂的行列、悬挂式节奏与宽阔页边留白",form:"流畅弧线、短竖长横与粗细强烈的悬垂笔势",color:"墨黑、纸白、金色与克制矿物边饰",lighting:"平面均匀光，以字行节奏主导版面",material:"纸本墨迹、芦苇笔锋与抛光纸面",type:"文字是主要造型；准确保留用户原文并采用纳斯塔利克体的斜行结构",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "西亚与伊斯兰视觉"),
  rule(/diwani/i, {period:"约16世纪至今",year:1650,region:"奥斯曼文化圈",composition:"紧密团块、上升曲线与印玺式整体轮廓",form:"高度连写、回旋细线与密集装饰点画",color:"墨黑或金色、纸白与朱红强调",lighting:"平面无影，保持复杂字势可辨",material:"抛光纸、墨迹与金泥细线",type:"文字是主要造型；准确保留用户原文并采用迪瓦尼体的连写团块",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "西亚与伊斯兰视觉"),
  rule(/hurufiyya/i, {period:"约1950年代至今",year:1970,region:"西亚与北非",composition:"字形碎片作为抽象场、重复叠压与非线性阅读",form:"书写手势、断裂字母与尺度突变",color:"黑白底、土色与高纯度局部强调",lighting:"平面画面光，以笔势和综合色建立层次",material:"油彩、墨、拼贴与粗糙书写表面",type:"字形可抽象化，但用户要求的正文必须另行保持可读",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "西亚与伊斯兰视觉"),
  rule(/zellige|andalusian ornament/i, {period:"约10世纪至今",year:1400,region:"马格里布与安达卢西亚",composition:"星形网格、无缝铺陈、放射对称与连续边带",form:"手切多边形、交织线与精确拼接节点",color:"钴蓝、绿松石、白、黑、赭黄与砖红",lighting:"均匀环境光配釉面小高光",material:"手切釉陶片、灰泥接缝与轻微尺寸偏差",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "西亚与伊斯兰视觉"),
  rule(/muqarnas/i, {period:"约10世纪至今",year:1300,region:"西亚、北非与中亚",composition:"穹顶或檐下分层放射、逐级过渡与蜂窝式重复",form:"棱锥小龛、悬挑单元与由方到圆的几何转换",color:"灰泥白、砖色、金色或蓝绿釉色",lighting:"掠射与顶部入光制造逐级明暗",material:"灰泥、砖、木或镜面小单元的重复接缝",coreKeys:["compositionSpace","formGeometry","lightingImaging"]}, "西亚与伊斯兰视觉"),
  rule(/arabesque|ottoman decorative|mamluk decorative|seljuk art/i, {period:"约11–19世纪",year:1450,region:"西亚与伊斯兰文化圈",composition:"连续边带、镜像卷草与可无限延展的满幅组织",form:"分叉卷叶、交织茎线与几何节点",color:"钴蓝、绿松石、赭红、金与深色轮廓",lighting:"平面装饰光，金属或釉面仅作局部反光",material:"釉砖、木石雕、金属嵌错或手抄本金饰"}, "西亚与伊斯兰视觉"),
  rule(/safavid|timurid|ilkhanid|ottoman miniature|qajar painting/i, {period:"约13–19世纪",year:1600,region:"伊朗、中亚与奥斯曼文化圈",composition:"俯视叠层、浅空间、多焦点叙事与精密页边",form:"细线轮廓、扁平体积与微型装饰细节",color:"群青、朱红、绿、粉、金与纸白",lighting:"均匀平面光，以色区和金饰分层",material:"纸本不透明水彩、矿物颜料、金箔与细描",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "西亚与伊斯兰视觉"),
  rule(/manuscript illumination|armenian manuscript|georgian sacred/i, {period:"约9–18世纪",year:1300,region:"西亚与高加索",composition:"页框、中心图像、首字与边饰形成严格层级",form:"硬边轮廓、正面造型与交织式装饰节点",color:"群青、朱红、绿、金与羊皮纸暖白",lighting:"均匀平面光与金箔反射",material:"羊皮纸或纸本蛋彩、金箔与精细墨线"}, "西亚与伊斯兰视觉"),
  rule(/iznik/i, {period:"约15–17世纪",year:1570,region:"奥斯曼土耳其",composition:"白地上的对称花簇、连续边带与器表曲面适配",form:"钴蓝硬线、饱满弧叶与清楚闭合色区",color:"钴蓝、绿松石、番茄红、翠绿与白",lighting:"柔和漫射光与透明釉面小高光",material:"石英质陶胎、釉下彩与透明釉层"}, "西亚与伊斯兰视觉"),
  rule(/persian carpet/i, {period:"约15世纪至今",year:1700,region:"伊朗与周边地区",composition:"中心徽章、角隅呼应、多重边带与满幅场纹",form:"卷草、花叶与几何结形成细密连续单位",color:"茜红、靛蓝、象牙白、深绿与金黄",lighting:"均匀织物光与短绒方向产生的综合色差",material:"羊毛或丝绒结、经纬结构与手工微差",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "西亚与伊斯兰视觉"),
  rule(/tatreez/i, {period:"传统至今",year:1800,region:"巴勒斯坦及黎凡特",composition:"衣片分区、连续边带与对称菱格重复",form:"十字绣像素网格、阶梯轮廓与地区性几何单位",color:"深红主线、黑色底与白绿蓝局部强调",lighting:"均匀织物光与细小线迹阴影",material:"亚麻或棉布、密集十字绣与可见经纬",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "西亚与伊斯兰视觉"),
  rule(/ebru/i, {period:"约15世纪至今",year:1700,region:"土耳其与西亚",composition:"全幅流体纹场、涡旋扩散与非重复有机节奏",form:"梳拉曲线、同心液滴与羽状边缘",color:"矿物红蓝绿黄与综合色底",lighting:"完全平面化，以综合色浓淡表现层次",material:"水面浮色转印、纸纤维与流体边缘"}, "西亚与伊斯兰视觉"),

  // Africa and Oceania: preserve the native medium instead of forcing every style into a textile template.
  rule(/nok art/i, {period:"约前1000年–公元300年",year:-300,region:"西非 · 尼日利亚",composition:"独立体量、正面或三分之四视点与稳定垂直重心",form:"三角或穿孔眼、几何化面部与柱状体积",color:"赤陶红、土褐与烧制黑斑",lighting:"擦边侧光强调穿孔和陶塑起伏",material:"粗粒赤陶、手塑接缝与烧制差异",coreKeys:["formGeometry","lightingImaging","materialTexture"]}, "非洲与大洋洲视觉"),
  rule(/ife art/i, {period:"约12–15世纪",year:1350,region:"西非 · 尼日利亚",composition:"正面中心、安静对称与肖像式近距观看",form:"自然主义比例、细密纵向刻纹与平滑圆润体积",color:"青铜绿锈、陶土红与石英灰",lighting:"柔侧光显示细密刻纹与平滑体积",material:"失蜡铜合金、赤陶或石英的精细表面",coreKeys:["formGeometry","lightingImaging","materialTexture"]}, "非洲与大洋洲视觉"),
  rule(/benin court/i, {period:"约13–19世纪",year:1600,region:"西非 · 贝宁王国",composition:"正面等级构图、中心主轴与密集浮雕背景",form:"高低比例、粗壮轮廓与珠饰式重复节点",color:"黄铜金、深褐、绿锈与象牙白",lighting:"擦边侧光强化浮雕深浅和金属反光",material:"失蜡黄铜、象牙雕刻与高浮雕颗粒"}, "非洲与大洋洲视觉"),
  rule(/kongo power figure/i, {period:"约19–20世纪初",year:1900,region:"中非 · 刚果文化圈",composition:"独立正面体量、紧凑轮廓与强烈中心焦点",form:"简化木雕体块、突出嵌件与密集钉状增生",color:"深木色、铁锈、白色高光与材料本色",lighting:"硬侧光突出嵌件、钉体和木雕凹凸",material:"木、铁钉、树脂、纤维与镜面嵌件",coreKeys:["formGeometry","lightingImaging","materialTexture"]}, "非洲与大洋洲视觉"),
  rule(/makonde carving/i, {period:"传统至今",year:1950,region:"东非 · 莫桑比克与坦桑尼亚",composition:"单体或群像柱状上升、镂空穿插与连续负空间",form:"乌木硬折轮廓、扭转体块与精密刀刻",color:"乌木黑褐与抛光高光",lighting:"强侧光显示镂空和扭转体积",material:"乌木雕刻、刀痕与局部抛光"}, "非洲与大洋洲视觉"),
  rule(/shona stone/i, {period:"20世纪中期至今",year:1970,region:"南部非洲 · 津巴布韦",composition:"单一石体、紧凑剪影与大面积周边留空",form:"圆润抽象体积、连续孔洞与材料引导的简化轮廓",color:"蛇纹石黑绿、灰褐与抛光亮面",lighting:"柔侧光沿连续曲面移动",material:"手凿石材、粗凿与镜面抛光并置",coreKeys:["formGeometry","lightingImaging","materialTexture"]}, "非洲与大洋洲视觉"),
  rule(/adinkra/i, {period:"约19世纪至今",year:1900,region:"西非 · 加纳",composition:"模块符号按网格、边带或散点重复排列",form:"高概括黑色符号、闭合几何与清楚负形",color:"黑、赭褐、纤维米色与有限综合色",lighting:"均匀织物光，保持印记平面清晰",material:"手刻印章、植物染料、布纤维与印压浓淡",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "非洲与大洋洲视觉"),
  rule(/kente/i, {period:"约17世纪至今",year:1800,region:"西非 · 加纳",composition:"窄条拼接、棋盘分区与高密度经纬节奏",form:"矩形、阶梯与细线带组成的精确织纹",color:"金黄、红、绿、蓝、黑与高对比综合色",lighting:"均匀织物光与丝线细小反光",material:"窄幅手织丝棉、拼缝与经纬浮线"}, "非洲与大洋洲视觉"),
  rule(/kuba textile/i, {period:"约17世纪至今",year:1850,region:"中非 · 刚果盆地",composition:"不规则网格、错位重复与有意打断的连续节奏",form:"菱形、折线、互锁单位与纤维化边缘",color:"拉菲草本色、黑、棕与赭黄",lighting:"斜侧光显示割绒与贴绣起伏",material:"拉菲草织物、割绒、贴绣与手工拼接"}, "非洲与大洋洲视觉"),
  rule(/bogolan/i, {period:"传统至今",year:1900,region:"西非 · 马里",composition:"布面分栏、粗线网格与交替图形密度",form:"泥染硬边、点线符号与不规则几何单位",color:"泥黑、铁锈褐、象牙白与纤维本色",lighting:"均匀织物光，不使用釉面高光",material:"棉布、发酵泥染、漂洗痕与手绘不均"}, "非洲与大洋洲视觉"),
  rule(/ndebele house/i, {period:"约20世纪至今",year:1950,region:"南部非洲",composition:"立面式大色块、强对称或均衡分区与连续边框",form:"黑色粗线分隔的阶梯几何、三角与矩形",color:"白底配黑、蓝、黄、红、绿的高饱和色",lighting:"均匀日光保持墙面色块清楚",material:"灰泥墙、哑光涂料与手绘边缘"}, "非洲与大洋洲视觉"),
  rule(/ethiopian icon/i, {period:"约14世纪至今",year:1700,region:"东北非 · 埃塞俄比亚",composition:"严格正面、层级对称与边框式叙事分区",form:"放大杏仁眼、粗黑轮廓与扁平正面体积",color:"朱红、明黄、绿、蓝、黑与纸白",lighting:"均匀平面光，不以写实阴影塑形",material:"木板或羊皮纸蛋彩、矿物颜料与粗线描"}, "非洲与大洋洲视觉"),
  rule(/tingatinga/i, {period:"约1968年至今",year:1980,region:"东非 · 坦桑尼亚",composition:"单一或重复形体平铺、强轮廓与浅背景",form:"圆润简化剪影、点状装饰与平滑硬边",color:"高饱和红黄蓝绿、黑色轮廓与纯色底",lighting:"均匀平面光，以色块关系塑形",material:"硬质板面、工业瓷漆的光滑高饱和平涂"}, "非洲与大洋洲视觉"),
  rule(/reverse glass/i, {period:"20世纪至今",year:1950,region:"西非 · 塞内加尔",composition:"正面叙事、浅层舞台与装饰边框",form:"深色硬边轮廓、平面色区与图像化细节",color:"高饱和红黄蓝绿、黑色轮廓与玻璃高光",lighting:"均匀正光与玻璃表面反射",material:"玻璃背面反向绘制、平滑色层与边缘轻微错位"}, "非洲与大洋洲视觉"),
  rule(/uli aesthetic/i, {period:"传统至今",year:1900,region:"西非 · 伊博文化圈",composition:"开放曲线、非对称平衡与大面积底面留空",form:"连续细线、螺旋、交叉与节律化线性符号",color:"黑、白、赭褐与有限植物染色",lighting:"完全平面化，线条密度形成层次",material:"身体或墙面植物颜料、手绘线迹与底面颗粒"}, "非洲与大洋洲视觉"),
  rule(/bark painting|x-ray art/i, {period:"传统至今",year:1900,region:"澳大利亚北部",composition:"主体轮廓内外布满交叉排线、叠置关系与连续场纹",form:"清楚外轮廓、内部解剖式线形与细密 rarrk 排线",color:"赭红、黄赭、炭黑、白土与树皮棕",lighting:"平面画面光，以排线密度建立明暗",material:"桉树皮、天然赭石颜料与细密手绘排线"}, "非洲与大洋洲视觉"),
  rule(/aboriginal dot/i, {period:"约1970年代至今",year:1980,region:"澳大利亚中西部",composition:"同心路径、点阵场、隐性地形网与全幅节奏",form:"大小受控的圆点、路径线与符号化平面单位",color:"土红、赭黄、黑、白与当代高饱和综合色",lighting:"完全平面化，以点密度和综合色对比建层",material:"画布丙烯点触、可见点粒与叠点边缘"}, "非洲与大洋洲视觉"),
  rule(/tapa/i, {period:"传统至今",year:1800,region:"波利尼西亚",composition:"布面分栏、中心场与连续几何边带",form:"粗细黑线、三角折线与植物印压单位",color:"树皮米褐、黑、赭红与少量白",lighting:"均匀纤维光，保持印绘图形清楚",material:"捶打树皮布、植物染、拓印与纤维裂纹"}, "非洲与大洋洲视觉"),
  rule(/maori koru/i, {period:"传统至今",year:1800,region:"大洋洲 · 新西兰",composition:"旋涡单元连续生长、镜像平衡与边带展开",form:"蕨芽式 koru 螺旋、粗细交替和清楚负形",color:"黑、红、白与木石本色",lighting:"平面图形光或擦边光，按媒介显示线刻深度",material:"木骨雕刻、绘线或纤维表面的连续曲线"}, "非洲与大洋洲视觉"),
  rule(/maori carving/i, {period:"传统至今",year:1800,region:"大洋洲 · 新西兰",composition:"正面中心、全表面填刻与左右呼应的祖先形结构",form:"koru 螺旋、缺口线与高低浮雕交织",color:"木材红褐、黑、白与贝壳虹彩",lighting:"擦边侧光突出深刻线和浮雕层次",material:"木雕凿痕、骨石或贝壳嵌眼与植物油光泽"}, "非洲与大洋洲视觉"),
  rule(/samoan tatau/i, {period:"传统至今",year:1800,region:"大洋洲 · 萨摩亚",composition:"身体曲面分区、连续腰带与高密度黑纹渐变",form:"三角、梳齿、平行带与实黑块组成的模块纹样",color:"皮肤本色与深黑墨色的强对比",lighting:"均匀柔光保持身体曲面和纹样清楚",material:"手工点刺墨迹、细小点列与皮肤真实纹理"}, "非洲与大洋洲视觉"),
  rule(/hawaiian featherwork/i, {period:"传统至今",year:1800,region:"大洋洲 · 夏威夷",composition:"披肩或徽章式对称分区、宽色带与强轮廓",form:"弧形边缘、大片羽色与少量几何界线",color:"鲜红、明黄、黑与羽毛综合色",lighting:"柔侧光显示羽片方向与细密反光",material:"密集羽毛、纤维网底与重叠羽缘"}, "非洲与大洋洲视觉"),
  rule(/west african studio portraiture/i, {period:"约1950–1980年代",year:1965,region:"西非",composition:"正面或三分之四全身、图案背景与道具形成平衡舞台",form:"清楚主体轮廓、姿态几何与服装图案并置",color:"高反差黑白或饱和综合色胶片色",lighting:"直接棚灯或正面闪光，阴影简洁",material:"中画幅胶片颗粒、印相纸与手绘布景",coreKeys:["compositionSpace","lightingImaging","materialTexture"]}, "非洲与大洋洲视觉"),

  // Indigenous and regional American systems.
  rule(/olmec art/i, {period:"约前1500–前400年",year:-900,region:"中部美洲",composition:"独立纪念体量、严格正面与稳定低重心",form:"宽阔头部、厚唇轮廓与圆钝巨石体积",color:"玄武岩深灰、玉石绿与土色",lighting:"硬侧光强调巨石体积和深刻线",material:"玄武岩、玉石或陶土的重凿与抛光表面",coreKeys:["formGeometry","lightingImaging","materialTexture"]}, "美洲传统与地域视觉"),
  rule(/teotihuacan|maya art|aztec art|mixtec art|zapotec art/i, {period:"约前200年–16世纪",year:900,region:"中部美洲",composition:"轴线平台、横向叙事带、方格分区与等级清楚的场面",form:"硬边侧面轮廓、阶梯几何、符号块与浅浮雕体积",color:"赤铁红、赭黄、绿松石蓝、黑与石灰白",lighting:"平面壁画光或擦边侧光，按媒介显示浮雕",material:"灰泥壁画、石刻、折页手抄本或羽饰镶嵌",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "美洲传统与地域视觉"),
  rule(/chavin|nazca|moche|wari art|tiwanaku|chimu|inca art/i, {period:"约前1000年–16世纪",year:800,region:"安第斯地区",composition:"严格带状分区、镜像或旋转对称与连续模块重复",form:"阶梯几何、轮廓化生物人形与互锁符号单位",color:"土红、赭黄、黑、乳白与靛蓝综合色",lighting:"平面纹样光或擦边光显示织陶金属表面",material:"陶绘、石刻、金属锤揲或高密度经纬织纹",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "美洲传统与地域视觉"),
  rule(/andean textile/i, {period:"传统至今",year:1500,region:"安第斯地区",composition:"经纬网格、连续边带与棋盘式重复",form:"阶梯菱形、互锁符号与高密度小单元",color:"茜红、赭黄、靛蓝、黑与纤维本色",lighting:"均匀织物光与细小经纬起伏",material:"羊驼或棉纤维、紧密经纬、染色色差与手工接缝"}, "美洲传统与地域视觉"),
  rule(/navajo weaving/i, {period:"约19世纪至今",year:1900,region:"北美西南部",composition:"中心菱形、横向条带与近似对称的毯面结构",form:"阶梯轮廓、锯齿与大尺度几何色块",color:"羊毛白、黑、灰、赭红与靛蓝",lighting:"均匀织物光与低绒起伏",material:"手纺羊毛、紧密平纹与天然染色差异"}, "美洲传统与地域视觉"),
  rule(/pueblo pottery/i, {period:"传统至今",year:1800,region:"北美西南部",composition:"器表环带、中心留底与旋转连续纹样",form:"黑色硬边、阶梯几何、曲线鸟形与负形切分",color:"陶土红、黑、白与天然综合色",lighting:"柔漫射光与小面积陶面高光",material:"手制陶胎、矿物彩绘、抛光或哑光烧制表面"}, "美洲传统与地域视觉"),
  rule(/northwest coast formline|haida/i, {period:"传统至今",year:1800,region:"北美西北海岸",composition:"双向对称、卵形主单元与轮廓线连续嵌套",form:"粗黑形线、卵形、U 形与分裂形组成闭合结构",color:"黑、朱红、蓝绿与木材本色",lighting:"平面图形光或擦边光显示雕刻深度",material:"木雕、树皮编织或平涂颜料的硬边表面",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "美洲传统与地域视觉"),
  rule(/inuit printmaking/i, {period:"约1950年代至今",year:1970,region:"北美北极地区",composition:"单一轮廓、宽阔纸面留白与偏心平衡",form:"石刻或版刻硬边、概括剪影与少量内部纹理",color:"黑、石墨灰、纸白与有限红黄蓝套色",lighting:"平面印刷光，以黑白形建立空间",material:"石版、模板或木版压印、纸纤维与手工墨色"}, "美洲传统与地域视觉"),
  rule(/inuit sculpture/i, {period:"传统至今",year:1900,region:"北美北极地区",composition:"单一紧凑体量、低重心与大面积周边留空",form:"由原石引导的圆钝轮廓、简化姿态与连续曲面",color:"皂石灰绿、黑、骨白与材料本色",lighting:"柔侧光显示连续曲面和刻线",material:"皂石、骨或象牙的刀痕与局部抛光",coreKeys:["formGeometry","lightingImaging","materialTexture"]}, "美洲传统与地域视觉"),
  rule(/plains beadwork/i, {period:"约19世纪至今",year:1900,region:"北美大平原",composition:"衣物或器物分区、连续边带与对称重复",form:"玻璃珠像素网格、菱形、三角与花式单位",color:"白、蓝、红、黄、绿与高对比珠色",lighting:"柔侧光产生离散珠面高光",material:"玻璃珠、皮革或布底、线缝与细小接缝"}, "美洲传统与地域视觉"),
  rule(/amish quilt/i, {period:"约19世纪至今",year:1900,region:"北美",composition:"大尺度矩形分区、中心方块与严格几何秩序",form:"直线拼片、宽色带与细密压线纹理",color:"深黑、靛蓝、酒红、紫与克制纯色",lighting:"均匀织物光，斜光仅显示压线起伏",material:"纯色棉毛织物、手工拼缝与压线"}, "美洲传统与地域视觉"),
  rule(/vodou flag/i, {period:"约20世纪至今",year:1950,region:"加勒比 · 海地",composition:"中心徽像、边框与满布闪光单元的对称结构",form:"亮片像素化轮廓、珠线边缘与平面符号",color:"高饱和红蓝金银、黑与织物底色",lighting:"正面柔光产生密集离散闪点",material:"亮片、珠子、布底与可见手缝"}, "美洲传统与地域视觉"),
  rule(/wixarika/i, {period:"传统至今",year:1950,region:"中部美洲 · 墨西哥",composition:"中心放射、同心路径与满幅高密度填充",form:"珠点或纱线形成的粗轮廓、螺旋与几何符号",color:"荧光粉、黄、蓝、绿、红与黑的高饱和综合色",lighting:"均匀正光，珠面产生细小高光",material:"玻璃珠、蜡、纱线与手工贴附起伏"}, "美洲传统与地域视觉"),
  rule(/talavera/i, {period:"约16世纪至今",year:1800,region:"中部美洲 · 墨西哥",composition:"器表分区、中心花饰与连续边带",form:"釉下硬边曲线、对称花叶与几何填充",color:"钴蓝、白、黄、绿与铁红",lighting:"柔漫射光与透明釉面小高光",material:"锡釉陶面、手绘釉彩与烧制微差"}, "美洲传统与地域视觉"),
  rule(/haitian naive/i, {period:"20世纪至今",year:1950,region:"加勒比 · 海地",composition:"高视点密集场景、重复群组与浅层空间",form:"清楚轮廓、简化比例与平面叙事形",color:"高饱和绿蓝红黄与综合色阴影",lighting:"均匀明亮光，以色块而非透视建层",material:"画布或硬板油彩、平滑平涂与细密重复笔触"}, "美洲传统与地域视觉"),
  rule(/carnival|dia de muertos/i, {period:"传统至今",year:1900,region:"拉丁美洲与加勒比",composition:"中心造型、层叠装饰、密集边缘与节庆式全幅节奏",form:"夸张剪影、重复小饰件与清楚象征轮廓",color:"高饱和粉、紫、橙、绿、蓝与金银强调",lighting:"高亮现场光或正面闪光，保持材质层级清楚",material:"纸花、珠片、羽饰、织物与手工拼接",coreKeys:["formGeometry","colorTone","materialTexture"]}, "美洲传统与地域视觉"),

  // Architecture and space.
  rule(/amsterdam school/i, {period:"约1910–1930年",year:1920,region:"荷兰",composition:"街角体量连续转折、非对称立面与开口节奏密集变化",form:"表现性砖砌曲面、塔冠、梯形开口与雕塑化节点",color:"深红砖、褐、黑与铜绿",lighting:"低角度侧光强调砖面凹凸和曲线体量",material:"手工砖、木石细部、陶饰与深砌缝"}, "建筑与空间视觉"),
  rule(/queen anne/i, {period:"约1870–1910年",year:1890,region:"英国与北美",composition:"不对称立面、凸窗塔楼与多重屋顶轮廓",form:"陡坡屋顶、圆塔、山墙与尺度多变的开口",color:"砖红、深绿、奶白与多色木饰",lighting:"自然侧光显示层叠轮廓和檐下阴影",material:"砖、木瓦、彩绘木构与纹样玻璃"}, "建筑与空间视觉"),
  rule(/beaux-arts/i, {period:"约1880–1930年",year:1900,region:"欧洲与北美",composition:"宏大中轴、严格对称、层级入口与仪式性序列",form:"古典柱式、拱券、山花与尺度清楚的雕饰",color:"石灰岩白、暖灰、铜绿与克制金色",lighting:"均匀日光配深檐投影，强调纪念体量",material:"切石、灰泥、铜与精细雕刻接缝"}, "建筑与空间视觉"),
  rule(/second empire/i, {period:"约1850–1880年",year:1870,region:"法国及欧美",composition:"对称立面、突出中央段与水平檐线层级",form:"孟莎屋顶、老虎窗、成组柱饰与高耸轮廓",color:"石材暖灰、深色屋面、白与金属绿锈",lighting:"清楚自然侧光与深屋檐阴影",material:"切石、板岩、铸铁与精细窗饰"}, "建筑与空间视觉"),
  rule(/prairie school/i, {period:"约1895–1925年",year:1910,region:"北美",composition:"强水平延展、低矮中心与室内外连续轴线",form:"低坡悬挑屋顶、长窗带与层叠平台",color:"土褐、砖红、橄榄绿与暖白",lighting:"宽阔自然侧光和深悬挑形成的柔影",material:"砖、木、石与细长水平接缝"}, "建筑与空间视觉"),
  rule(/chicago school/i, {period:"约1880–1910年",year:1900,region:"北美 · 芝加哥",composition:"底部—重复中段—顶部的高层立面三段式秩序",form:"钢框架网格、宽大窗洞与垂直体量",color:"砖石暖褐、深铁色与玻璃灰蓝",lighting:"均匀环境日光强调窗格重复",material:"钢框架、砖石包覆、陶饰与大面积玻璃"}, "建筑与空间视觉"),
  rule(/international style architecture/i, {period:"约1920–1970年",year:1935,region:"欧美及全球",composition:"正交网格、自由平面、非对称平衡与无装饰留空",form:"薄板、直角盒体、水平窗带与架空体量",color:"白、玻璃灰、黑与材料中性色",lighting:"均匀自然光显示纯净体量与薄边",material:"白色灰泥、钢、玻璃与平整混凝土"}, "建筑与空间视觉"),
  rule(/gothic revival/i, {period:"约1740–1900年",year:1850,region:"欧洲与北美",composition:"强垂直轴、尖塔群与重复跨间节奏",form:"尖拱、肋架、扶壁、花窗与细长比例",color:"石材灰、深木色、彩玻璃宝石色",lighting:"穿透彩窗的综合色光与深凹石刻阴影",material:"石砌、彩色玻璃、木构与精细雕刻"}, "建筑与空间视觉"),
  rule(/romanesque revival/i, {period:"约1840–1900年",year:1880,region:"欧洲与北美",composition:"厚重对称或均衡体量、连续拱廊与稳定基座",form:"半圆拱、粗短柱、深凹开口与堡垒式块体",color:"粗面石灰、砂岩暖褐与砖红",lighting:"硬侧光形成深拱阴影和厚墙感",material:"粗琢石、厚砌缝与砖石拱券"}, "建筑与空间视觉"),
  rule(/classical revival/i, {period:"18世纪至今",year:1900,region:"全球",composition:"严格中轴、对称立面与清楚基座—柱列—檐部层级",form:"古典柱式、山花、拱券与规范比例",color:"石灰白、暖灰、铜绿与低饱和综合色",lighting:"均匀日光和清楚柱列投影",material:"切石、灰泥、金属与平整雕饰"}, "建筑与空间视觉"),
  rule(/expressionist architecture/i, {period:"约1910–1930年",year:1920,region:"欧洲",composition:"单一雕塑性主量、动态轴线与戏剧化进入路径",form:"晶体尖角、弯曲砖体或有机壳体的夸张轮廓",color:"砖红、深褐、玻璃综合色与石材灰",lighting:"强侧光和内部辉光共同强化雕塑轮廓",material:"表现性砖砌、玻璃、混凝土与手工接缝"}, "建筑与空间视觉"),
  rule(/constructivist architecture/i, {period:"约1920–1935年",year:1928,region:"苏联",composition:"互穿几何体、悬挑水平件与可读功能分区",form:"圆筒、直角盒体、外露楼梯与动态图形体量",color:"混凝土灰、白、黑与红色功能强调",lighting:"清楚分析光和硬边体块阴影",material:"钢、玻璃、砖、灰泥与早期混凝土"}, "建筑与空间视觉"),
  rule(/high-tech architecture|structural expressionism/i, {period:"约1970年代至今",year:1980,region:"全球",composition:"结构与设备外置、重复跨格和清楚服务动线",form:"桁架、拉索、管线、节点与可替换模块",color:"金属本色、玻璃灰配红黄蓝功能色",lighting:"明亮分析光与金属边缘高光",material:"钢、铝、玻璃、膜材和精密工业连接"}, "建筑与空间视觉"),
  rule(/high-tech interior/i, {period:"约1970年代至今",year:1985,region:"全球",composition:"开放大空间、设备可见与模块化工作区",form:"外露管线、金属网架、轨道与可移动构件",color:"银灰、黑、白配高识别功能色",lighting:"均匀顶光、线性工作光与金属反射",material:"不锈钢、玻璃、橡胶、穿孔板和外露连接"}, "建筑与空间视觉"),
  rule(/deconstructivist/i, {period:"约1980年代至今",year:1990,region:"全球",composition:"轴线冲突、碎片叠置、倾斜切割与不稳定平衡",form:"断裂板片、锐角楔体、扭曲网格与非正交交接",color:"金属灰、混凝土、黑白与有限强色",lighting:"硬侧光切出多重折面和深缝",material:"金属板、玻璃、混凝土与复杂异形接缝"}, "建筑与空间视觉"),
  rule(/parametricism/i, {period:"约1990年代至今",year:2010,region:"全球",composition:"连续场、梯度变化、流线汇聚与无硬性分区",form:"参数曲面、分形网格、渐变孔洞与平滑连接",color:"白、银灰、黑与连续综合色",lighting:"掠射光沿连续曲面移动并显示细密网格",material:"复合板、玻璃、金属网与数字制造接缝"}, "建筑与空间视觉"),
  rule(/blobitecture/i, {period:"约1990年代至今",year:2000,region:"全球",composition:"单一或相连团块、柔性动线与周边开放留空",form:"无直角的膨胀曲面、滴状轮廓与连续壳体",color:"白、银灰、半透明综合色与材料本色",lighting:"宽阔软光形成连续高光带",material:"玻璃纤维、金属板、膜材与平滑连续表皮"}, "建筑与空间视觉"),
  rule(/metabolism/i, {period:"约1960–1975年",year:1965,region:"日本",composition:"核心筒与可增殖舱体、重复模块和垂直生长",form:"胶囊、巨构框架、桥接单元与可替换节点",color:"混凝土灰、白、黑与工业原色",lighting:"清楚日光强调模块投影和连接深度",material:"预制混凝土、钢、玻璃与外露螺栓"}, "建筑与空间视觉"),
  rule(/googie/i, {period:"约1945–1970年",year:1960,region:"北美",composition:"路边招牌式强焦点、上扬对角线与非对称轮廓",form:"飞翼屋顶、回旋镖、星爆、原子轨道与细柱",color:"青绿、珊瑚红、黄、白与金属银",lighting:"明亮日光或彩色霓虹勾勒锐利轮廓",material:"玻璃、钢、塑料、霓虹管与彩色面板"}, "建筑与空间视觉"),
  rule(/streamline moderne architecture/i, {period:"约1930–1950年",year:1940,region:"欧美",composition:"强水平带、圆角转折与连续流线方向",form:"弧形墙面、舷窗、平屋顶与细长速度线",color:"奶白、浅灰、海蓝与少量金属综合色",lighting:"柔侧光沿圆角形成长高光带",material:"光滑灰泥、铬钢、玻璃砖与搪瓷面板"}, "建筑与空间视觉"),
  rule(/miami modernism/i, {period:"约1945–1970年",year:1960,region:"北美 · 迈阿密",composition:"水平阳台、重复遮阳模块与轻盈场地立面",form:"薄板、曲面雨棚、穿孔墙与热带几何装饰",color:"粉、薄荷绿、浅蓝、白与珊瑚色",lighting:"强烈热带日光和清楚遮阳投影",material:"浅色灰泥、玻璃、铝、马赛克与水磨石"}, "建筑与空间视觉"),
  rule(/desert modernism/i, {period:"约1940–1970年代",year:1960,region:"北美沙漠地区",composition:"低矮水平体量、开放场域与远景连续",form:"薄屋面、大挑檐、玻璃幕墙与简洁直线",color:"砂岩色、暖白、炭黑与综合色植被绿",lighting:"高照度硬日光、深檐阴影与清晰地面反射",material:"石、木、钢、玻璃与粗细对比的墙面"}, "建筑与空间视觉"),
  rule(/tropical modernism/i, {period:"约1940–1970年代",year:1960,region:"热带地区",composition:"穿堂通风、架空体量、深阳台与内外连续",form:"遮阳板、花格墙、薄屋顶与开放框架",color:"混凝土灰、白、木色与热带综合色",lighting:"强日光经遮阳构件形成节律化投影",material:"混凝土、砖花格、木、玻璃与透气表皮"}, "建筑与空间视觉"),
  rule(/critical regionalism|neo-vernacular/i, {period:"约1980年代至今",year:1990,region:"全球",composition:"现代几何秩序结合场地轴线、气候路径与地方尺度",form:"克制现代体量嵌入地方屋顶、墙体或院落原型",color:"地方石土木色配少量现代中性色",lighting:"顺应当地气候的自然光与深浅遮阳",material:"地方石、土、木、砖与现代结构的清楚接合"}, "建筑与空间视觉"),
  rule(/passive house|bioclimatic|ecological architecture/i, {period:"约1970年代至今",year:2000,region:"全球",composition:"紧凑体形、朝向明确、遮阳分层与性能驱动的开口秩序",form:"高性能围护、深窗洞、可调遮阳与简洁连续表皮",color:"木材本色、白、灰与低饱和自然色",lighting:"真实日光、受控眩光与可读的遮阳投影",material:"高保温墙体、木、玻璃、再生材料与密封节点"}, "建筑与空间视觉"),
  rule(/biophilic design/i, {period:"约1980年代至今",year:2010,region:"全球",composition:"自然光路径、层叠视线、内外渗透与多尺度空间节点",form:"有机边界、曲面或自然几何与开放框景",color:"植物绿、土色、木色与中性背景",lighting:"漫射天光、斑驳日光与柔和综合色",material:"真实木石、水面、织物与可触摸粗糙表面"}, "建筑与空间视觉"),
  rule(/japandi/i, {period:"约2010年代至今",year:2018,region:"日本与北欧影响",composition:"低矮陈设、清楚留白、少量焦点与平衡动线",form:"简洁直线、柔和圆角与克制手作不规则",color:"暖白、木色、灰、黑与低饱和自然色",lighting:"宽窗漫射光与柔和局部照明",material:"浅深木材、亚麻、陶土、石与哑光灰泥"}, "建筑与空间视觉"),
  rule(/hollywood regency/i, {period:"约1930–1960年代",year:1950,region:"北美",composition:"对称陈设、戏剧性中心与镜面反射层叠",form:"古典曲线、细腿家具、几何屏风与装饰轮廓",color:"黑白、高饱和宝石色、金与镜面银",lighting:"柔和棚灯式环境光配晶亮局部高光",material:"漆面、镜面、黄铜、丝绒与玻璃"}, "建筑与空间视觉"),
  rule(/space age interior/i, {period:"约1955–1975年",year:1965,region:"欧美",composition:"中心舱室、模块化陈设与环形流线",form:"球形、胶囊、流线壳体与悬浮式基座",color:"白、银、橙、红与未来综合色",lighting:"均匀内发光、隐藏灯带与光滑表面高光",material:"模压塑料、玻璃纤维、铬钢与乙烯基"}, "建筑与空间视觉"),
  rule(/italian radical|futurist retail/i, {period:"约1965年至今",year:1975,region:"意大利及全球",composition:"舞台化单一概念、尺度错置与强烈路径引导",form:"超大几何、软体模块、镜面曲面或实验装置",color:"高纯度原色、黑白与荧光强调",lighting:"戏剧灯带、综合色环境光与镜面反射",material:"塑料、泡沫、镜面金属、层压板与临时构件"}, "建筑与空间视觉"),
  rule(/organic architecture/i, {period:"20世纪至今",year:1950,region:"全球",composition:"建筑沿地形展开、空间连续流动与内外相互嵌入",form:"水平延展、自然曲线、悬挑与场地生成体量",color:"石木土色、暖灰与自然综合色",lighting:"自然光顺材料和空间路径渐变",material:"地方石、木、砖、混凝土与连续手工接缝"}, "建筑与空间视觉"),
  rule(/viennese modern architecture/i, {period:"约1895–1914年",year:1905,region:"奥地利维也纳",composition:"平整几何立面、规则窗格与克制对称",form:"直线框架、方形饰点与少量曲线金属细部",color:"白、黑、金与低饱和综合色",lighting:"均匀自然光保持立面平整清楚",material:"白色灰泥、石、玻璃、黄铜与精细马赛克"}, "建筑与空间视觉"),

  // European movements and schools.
  rule(/barbizon/i, {period:"约1830–1870年",year:1850,region:"法国",composition:"低地平线、林地近景与自然观察式平衡",form:"松动自然轮廓、综合色块与直接地貌结构",color:"土褐、橄榄绿、灰蓝与低饱和综合色",lighting:"阴天或黄昏的自然综合色光",material:"可见油画笔触、薄厚交替与画布颗粒"}, "欧洲艺术运动"),
  rule(/sublime landscape/i, {period:"约1750–1850年",year:1820,region:"欧洲与北美",composition:"极端尺度对比、低位观看与巨大自然空间压迫",form:"尖锐山体、翻涌云层与微小尺度参照",color:"深蓝灰、土褐、冷白与集中暖光",lighting:"风暴式明暗、穿云光与深暗前景",material:"透明油釉、薄雾柔边与局部厚亮笔触"}, "欧洲艺术运动"),
  rule(/picturesque/i, {period:"约18世纪末–19世纪",year:1800,region:"英国与欧洲",composition:"弯曲路径、前景框架、错落层次与刻意不对称",form:"粗细变化的自然轮廓、局部残缺与柔和起伏",color:"土绿、褐、灰蓝与暖综合色",lighting:"斜射自然光和树影形成层次",material:"水彩或油彩的柔和洗染与可见纸布纹"}, "欧洲艺术运动"),
  rule(/hudson river/i, {period:"约1825–1870年",year:1850,region:"北美",composition:"宽阔全景、层层大气远景与稳定地平线",form:"精确地貌轮廓、微小细节与宏大尺度关系",color:"综合色绿褐、天空蓝与日落金",lighting:"清澈空气光、远景雾化与集中日光",material:"细腻油画罩染、平滑表面与少量细笔纹理"}, "欧洲艺术运动"),
  rule(/nazarene/i, {period:"约1809–1850年",year:1830,region:"德语地区与意大利",composition:"清楚叙事中心、稳定群组与浅层古典空间",form:"清晰轮廓、克制理想比例与简洁衣褶",color:"清澈矿物色、暖肤色与综合色背景",lighting:"均匀纯净光，抑制戏剧性阴影",material:"湿壁画或平滑油层、细线和少见笔触"}, "欧洲艺术运动"),
  rule(/academic art/i, {period:"约17–19世纪",year:1850,region:"欧洲",composition:"金字塔或轴线结构、清楚叙事高潮与完整空间层级",form:"理想化解剖、平滑体积与受控姿态",color:"综合色肉色、土色、深红蓝与克制金色",lighting:"工作室式定向光与连续明暗塑形",material:"多层油画罩染、无痕平滑表面与精细素描底"}, "欧洲艺术运动"),
  rule(/orientalist painting/i, {period:"约19世纪",year:1870,region:"欧洲",composition:"舞台式深景、密集细节与强烈异域化陈设",form:"学院写实体积、精确装饰纹样与戏剧姿态",color:"宝石色、土金色、深红蓝与暖光综合色",lighting:"强烈日照或室内侧光形成综合色反差",material:"平滑油层、细密织物与金属陶面描绘"}, "欧洲艺术运动"),
  rule(/naturalism/i, {period:"约1870–1900年",year:1885,region:"欧洲",composition:"现场观察式视点、稳定环境关系与非理想化叙事",form:"具体自然比例、可读重量与真实表面差异",color:"低至中饱和自然综合色",lighting:"连续自然光和可信局部阴影",material:"直接油画笔触、真实织物木石与皮肤表面"}, "欧洲艺术运动"),
  rule(/social realism/i, {period:"约1920–1950年代",year:1935,region:"欧美",composition:"群体行动、直接视点与环境压力形成的清楚叙事",form:"坚实体量、具体劳动姿态与概括写实轮廓",color:"土红、灰蓝、褐与有限高纯度强调",lighting:"自然或硬侧光，保持场景信息可读",material:"油画、壁画、版画或摄影式颗粒"}, "欧洲艺术运动"),
  rule(/socialist realism/i, {period:"约1930–1980年代",year:1950,region:"苏联及相关地区",composition:"仰视中心、上升对角线与清楚集体层级",form:"理想化坚实体量、积极姿态与纪念性轮廓",color:"暖红、金、天蓝、综合色肤色与深色基底",lighting:"明亮主光与清楚轮廓光，压低复杂暗部",material:"平滑油画、壁画或宣传印刷表面"}, "欧洲艺术运动"),
  rule(/flemish baroque/i, {period:"约1600–1700年",year:1640,region:"佛兰德",composition:"旋转群组、强对角线与饱满画面边缘",form:"丰厚体积、连续曲线与强烈动作联结",color:"深红、金、综合色肉色、深绿与黑",lighting:"温暖聚光、深暗背景与明亮反射",material:"多层油画罩染、厚亮笔触与丝绒金属质感"}, "欧洲艺术运动"),
  rule(/utrecht caravaggism/i, {period:"约1615–1635年",year:1625,region:"荷兰乌得勒支",composition:"近距离半身群组、单一烛光焦点与深暗背景",form:"强烈手势、具体体积与硬边明暗转折",color:"黑、暖褐、暗红与烛光金黄",lighting:"可见光源式强明暗对照和深阴影",material:"吸光油层、局部厚亮与粗织画布"}, "欧洲艺术运动"),
  rule(/dutch golden age/i, {period:"约1600–1700年",year:1650,region:"荷兰",composition:"稳定室内或风景空间、精密日常焦点与清楚尺度",form:"具体轮廓、细腻材质差异与克制动作",color:"土褐、灰蓝、综合色黑白与局部高纯度色",lighting:"窗侧自然光、柔和暗部与可追踪反射",material:"细腻油画罩染、木板或画布和精确表面描绘"}, "欧洲艺术运动"),
  rule(/pointillism/i, {period:"约1886–1905年",year:1890,region:"法国",composition:"稳定整体轮廓与均匀点触覆盖",form:"规则小圆点在观看距离中合成清楚体积",color:"高纯度互补色点与光学综合色",lighting:"以点色明度而非连续灰阶表现日光",material:"细小规则油彩点、干燥表面与可见画布"}, "欧洲艺术运动"),
  rule(/divisionism/i, {period:"约1890–1910年",year:1900,region:"意大利",composition:"象征或社会场景的稳定结构与方向性分色笔触",form:"由短线或点划组成的轮廓和体积",color:"分离的高纯度综合色与互补色",lighting:"以方向性分色笔触建立发光感",material:"细短油彩线点、画布纹理与综合色振动"}, "欧洲艺术运动"),
  rule(/les nabis/i, {period:"约1888–1900年",year:1895,region:"法国",composition:"浅空间、装饰性裁切与大色面不对称平衡",form:"简化硬边轮廓、平面色区与图案化形体",color:"综合色黄绿、紫、赭红与深色轮廓",lighting:"平面综合色关系取代写实光影",material:"哑光平涂、纸板或画布与装饰性笔触"}, "欧洲艺术运动"),
  rule(/der blaue reiter/i, {period:"约1911–1914年",year:1912,region:"德国",composition:"斜向节奏、色块交错与趋向抽象的开放空间",form:"简化轮廓、弧线动势与分解体积",color:"高纯度蓝黄红绿与主观综合色",lighting:"综合色明度而非自然光塑形",material:"可见油画笔触、透明与不透明色层并置"}, "欧洲艺术运动"),
  rule(/die bruecke/i, {period:"约1905–1913年",year:1910,region:"德国",composition:"近距压缩、强对角线与不稳定画面边缘",form:"尖锐粗轮廓、木刻式硬折与拉长比例",color:"酸性黄绿、朱红、蓝与黑色轮廓",lighting:"高反差平面色而非连续自然明暗",material:"粗砺油彩、木刻刀痕与裸露底材"}, "欧洲艺术运动"),
  rule(/orphism/i, {period:"约1912–1914年",year:1913,region:"法国",composition:"同心圆弧、交叠色盘与旋转节奏",form:"分割圆形、棱面与透明综合色片",color:"高纯度互补色与光谱式渐变",lighting:"色彩自身明度制造发光与运动",material:"平面油彩、综合色叠层与清楚几何边缘"}, "欧洲艺术运动"),
  rule(/rayonism/i, {period:"约1912–1914年",year:1913,region:"俄罗斯",composition:"多方向光束交叉、中心爆发与棱面碎裂",form:"锐利射线、细长三角与交错直线",color:"高纯度红蓝黄绿与综合色交叠",lighting:"光束本身成为结构并切割形体",material:"油彩硬边、短线笔触与透明综合色叠压"}, "欧洲艺术运动"),
  rule(/vorticism/i, {period:"约1914–1918年",year:1915,region:"英国",composition:"旋涡式中心、强斜线与机械块面压缩",form:"锐角折线、楔形与硬边机械几何",color:"黑、白、赭、深蓝与克制强色",lighting:"硬边明度块切分，不使用柔和综合色",material:"平涂油彩、墨线与粗糙印刷表面"}, "欧洲艺术运动"),
  rule(/purism/i, {period:"约1918–1925年",year:1922,region:"法国",composition:"稳定正交网格、重叠轮廓与清楚比例秩序",form:"净化几何体、精确曲线与机械对象式轮廓",color:"白、灰、赭、蓝与低饱和综合色",lighting:"均匀冷静光与简化体积阴影",material:"平滑薄油层、清楚硬边与少见笔触"}, "欧洲艺术运动"),
  rule(/precisionism/i, {period:"约1920–1940年",year:1930,region:"北美",composition:"工业垂直水平轴、近距裁切与寂静留空",form:"锐利轮廓、圆筒与直角机械体积",color:"冷灰、砖红、米白与克制蓝",lighting:"清澈硬光与精确投影",material:"平滑油层、喷绘般渐变与无痕表面"}, "欧洲艺术运动"),
  rule(/new objectivity/i, {period:"约1920–1933年",year:1928,region:"德国",composition:"冷静正面或三分之四视点、清楚间隔与疏离空间",form:"锐利具体轮廓、坚实体积与略带夸张的细节",color:"低饱和冷暖分区、综合色灰与局部强色",lighting:"冷硬均匀光或直接侧光",material:"平滑薄油层、精确边缘与少见笔触"}, "欧洲艺术运动"),
  rule(/magic realism painting/i, {period:"约1920–1940年",year:1930,region:"欧洲",composition:"稳定日常空间、异常静止与清楚物体间隔",form:"精确轮廓、略带陌生化的坚实体积",color:"低饱和自然色配冷暖不协调节点",lighting:"清晰均匀且略显不自然的定向光",material:"平滑油层、细密表面与压低笔触"}, "欧洲艺术运动"),
  rule(/metaphysical painting/i, {period:"约1910–1920年",year:1915,region:"意大利",composition:"空旷广场、深透视、孤立形体与不合逻辑的尺度关系",form:"硬边古典体块、实体模型式轮廓与长直阴影",color:"赭黄、砖红、墨绿、深蓝与灰白",lighting:"低角度硬光制造超长阴影和寂静感",material:"平滑油层、石膏木质般哑光表面"}, "欧洲艺术运动"),
  rule(/art informel/i, {period:"约1945–1960年代",year:1955,region:"欧洲",composition:"无中心满幅、即兴扩散与不稳定密度",form:"不规则斑块、手势线与未封闭形",color:"土色、黑白与局部高纯度综合色",lighting:"平面画面光，以颜料厚薄产生阴影",material:"厚涂、刮擦、滴洒与砂质粗糙表面"}, "欧洲艺术运动"),
  rule(/tachisme/i, {period:"约1940–1960年代",year:1955,region:"法国与欧洲",composition:"色斑快速分布、非中心平衡与开放边缘",form:"自发斑点、短促手势与液态边界",color:"综合色斑、黑线与纸布底色",lighting:"平面光，以综合色浓度和叠压建层",material:"泼洒、滴染、擦涂与吸收边缘"}, "欧洲艺术运动"),
  rule(/lyrical abstraction/i, {period:"约1945–1970年代",year:1960,region:"欧洲与北美",composition:"开放流动场、长线联结与呼吸式留空",form:"书写性弧线、柔边色块与透明叠层",color:"高纯度综合色配大面积中性底",lighting:"综合色透明度形成内发光层次",material:"稀释油彩或丙烯、泼洒与柔化边缘"}, "欧洲艺术运动"),
  rule(/matter painting/i, {period:"约1940–1960年代",year:1955,region:"欧洲",composition:"厚重表面场、裂缝方向与材料堆积形成结构",form:"凸起团块、刮槽、孔洞与不规则边缘",color:"土褐、灰黑、白与材料本色",lighting:"擦边侧光强化高低起伏和阴影",material:"砂、灰泥、厚颜料、布与物质性裂纹"}, "欧洲艺术运动"),
  rule(/spatialism/i, {period:"约1947–1968年",year:1960,region:"意大利",composition:"单色场、单一切口或穿孔与大面积负空间",form:"锋利切缝、圆孔与真实画布开口",color:"白、红、蓝、黑或金属单色",lighting:"真实环境光在切口内产生阴影",material:"被切割或穿孔的画布、单色涂层与裸露边缘"}, "欧洲艺术运动"),
  rule(/zero group/i, {period:"约1957–1966年",year:1962,region:"德国及欧洲",composition:"重复序列、单色场、光学振动与开放空间",form:"规则点阵、浮起模块与反光小单元",color:"白、银、黑与极少纯色",lighting:"定向光、反射和真实阴影参与构图",material:"铝、镜面、单色涂层与工业网面"}, "欧洲艺术运动"),
  rule(/kinetic art/i, {period:"约1950年代至今",year:1965,region:"全球",composition:"悬置序列、观看路径与真实运动形成的时间结构",form:"可动杆件、重复几何片与平衡连接",color:"材料本色、黑白与有限高纯度色",lighting:"移动阴影、反射和环境光随运动变化",material:"金属、塑料、线材、电机与可见连接"}, "欧洲艺术运动"),
  rule(/arte povera/i, {period:"约1967–1975年",year:1970,region:"意大利",composition:"开放组合、重力关系与非纪念尺度",form:"简单堆叠、张力、折叠与材料原形",color:"土色、中性色与材料本色",lighting:"自然展示光和真实接触阴影",material:"石、木、布、土与非贵重工业材料"}, "欧洲艺术运动"),
  rule(/supports\/surfaces/i, {period:"约1966–1974年",year:1970,region:"法国",composition:"画布、边框与悬挂方式被拆分后形成开放结构",form:"未绷画布、折叠条带与重复染色单元",color:"未经调和的综合色、布本色与简单重复色",lighting:"均匀展示光显示折叠和悬挂阴影",material:"未处理画布、染料、绳、木框与裁切边缘"}, "欧洲艺术运动"),
  rule(/neo-geo/i, {period:"约1980年代",year:1985,region:"欧美",composition:"大尺度规则网格、靶形或重复企业符号",form:"硬边圆环、方格与工业化抽象单元",color:"高纯度红黄蓝、黑白或光亮商业综合色",lighting:"均匀画面光或商品展示式反光",material:"光滑丙烯、金属、层压板与无手工痕迹表面"}, "欧洲艺术运动"),
  rule(/fluxus/i, {period:"约1960年代至今",year:1965,region:"欧美及日本",composition:"说明卡、日常物、盒装档案与事件顺序并置",form:"简单文字指令、现成物轮廓与非纪念尺度",color:"纸张本色、黑字与偶发综合色",lighting:"普通展示光，避免戏剧化塑形",material:"印刷卡片、邮寄物、木盒、胶带与使用痕迹",coreKeys:["compositionSpace","materialTexture","typographyLayout"]}, "欧洲艺术运动"),
  rule(/situationist/i, {period:"约1957–1972年",year:1965,region:"欧洲",composition:"地图切片、漫画图像、标语与环境碎片的重组",form:"剪切边缘、路线箭头、语句框与挪用图形",color:"黑白印刷、红色强调与廉价综合色",lighting:"平面复制光，不使用写实投影",material:"拼贴、胶印、新闻纸和复印颗粒",type:"直接标语、漫画语句框与清楚可读的政治文本",coreKeys:["compositionSpace","materialTexture","typographyLayout"]}, "欧洲艺术运动"),

  // Modern and contemporary art.
  rule(/monochrome painting/i, {period:"约1950年代至今",year:1960,region:"全球",composition:"单一色场、边缘关系与极少内部事件",form:"画幅本身、综合色微差与表面重复动作",color:"严格单色或相邻窄综合色阶",lighting:"展示光揭示细微综合色与表面起伏",material:"薄涂、厚涂、刮擦或织物纤维形成的单色表面",coreKeys:["colorTone","lightingImaging","materialTexture"]}, "现代与当代艺术"),
  rule(/hard-edge painting/i, {period:"约1950–1970年代",year:1960,region:"北美",composition:"大尺度几何分区、清楚边界与非透视平衡",form:"锐利直线、弧形与完全闭合的平面色块",color:"纯净高饱和综合色或强明度对比",lighting:"均匀无影画面光，色块自身建立层级",material:"平滑丙烯、胶带遮蔽硬边与无笔触表面"}, "现代与当代艺术"),
  rule(/washington color school/i, {period:"约1950–1970年代",year:1965,region:"北美 · 华盛顿",composition:"大面积开放色场、中心靶形或条带节奏",form:"染色软边、同心圆、竖条与简化几何",color:"明亮透明综合色与未涂画布底色",lighting:"综合色透明度和画布吸收产生发光感",material:"稀释丙烯浸染、裸画布纤维与无厚涂表面"}, "现代与当代艺术"),
  rule(/post-painterly abstraction/i, {period:"约1950–1960年代",year:1960,region:"北美",composition:"开放色场、清晰大形与压低手势中心",form:"平坦轮廓、长条或宽阔色区与有限边缘变化",color:"清澈高纯度综合色与大面积同色层",lighting:"综合色明度而非颜料堆积建立空间",material:"薄丙烯、染色画布与克制笔触"}, "现代与当代艺术"),
  rule(/geometric abstraction/i, {period:"20世纪至今",year:1960,region:"全球",composition:"非客观网格、比例分区与重复几何秩序",form:"直线、圆、弧、多边形与精确闭合边缘",color:"受控纯色、黑白与清楚明度级",lighting:"平面无影，以色形关系建层",material:"平滑颜料、矢量硬边或工业制表面"}, "现代与当代艺术"),
  rule(/concrete art/i, {period:"约1930年代至今",year:1950,region:"欧洲及全球",composition:"完全非再现的比例系统、模块排列与数学秩序",form:"精确基本几何、等距关系与无象征形",color:"有限纯色、黑白与系统化综合色组合",lighting:"均匀平面光，不模拟自然空间",material:"平滑颜料、清楚硬边与工业化表面"}, "现代与当代艺术"),
  rule(/neo-concretism/i, {period:"约1959–1961年及其延续",year:1960,region:"巴西",composition:"几何模块脱离画框、可参与空间与身体尺度关系",form:"折叠平面、铰接几何与柔化的非刚性结构",color:"白、红、蓝、黄与克制纯色",lighting:"环境光和真实投影参与观看",material:"木、金属、纸、织物与可触摸涂层"}, "现代与当代艺术"),
  rule(/post-minimalism/i, {period:"约1966–1975年",year:1970,region:"欧美",composition:"重复单元受重力改变、开放铺陈与非刚性秩序",form:"垂坠、卷曲、堆叠与过程形成的软性几何",color:"材料本色、灰白、土色与有限综合色",lighting:"自然展示光强调重力和柔性阴影",material:"毡、绳、乳胶、玻璃纤维与过程痕迹"}, "现代与当代艺术"),
  rule(/pattern and decoration/i, {period:"约1970–1980年代",year:1978,region:"北美",composition:"满幅纹样、重复边带、多文化装饰并置与拒绝中心层级",form:"花纹、几何、贴片与连续装饰单位",color:"高饱和多色、金属色与强烈综合色对比",lighting:"均匀画面光，材质反光作为局部节奏",material:"织物、拼贴、陶片、丙烯与手工装饰表面"}, "现代与当代艺术"),
  rule(/land art/i, {period:"约1960年代至今",year:1970,region:"全球",composition:"沿地形展开的长线、螺旋、切口或巨大几何与远距观看",form:"土石堆移、沟槽、环形与场地尺度标记",color:"土石水植被本色与季节综合色",lighting:"真实天气、日照角度与时间变化",material:"土、石、水、植被、侵蚀与施工痕迹",coreKeys:["compositionSpace","lightingImaging","materialTexture"]}, "现代与当代艺术"),
  rule(/environmental art/i, {period:"约1960年代至今",year:1980,region:"全球",composition:"作品与生态场地、观众路径和时间过程共同构成",form:"场地响应结构、自然过程和可变化边界",color:"环境本色、自然综合色与少量标识色",lighting:"真实气候光和昼夜季节变化",material:"当地自然材料、回收物、生长或风化表面",coreKeys:["compositionSpace","lightingImaging","materialTexture"]}, "现代与当代艺术"),
  rule(/installation art/i, {period:"约1960年代至今",year:1980,region:"全球",composition:"观众可进入的空间布置、路径节点与多面观看",form:"物件、结构、投影或环境元素形成的关系场",color:"由材料和空间概念决定的受控综合色",lighting:"展示光、现场光或投影参与空间组织",material:"现成物、建筑材料、影像与临时连接"}, "现代与当代艺术"),
  rule(/immersive art/i, {period:"约1990年代至今",year:2010,region:"全球",composition:"包围式全景、无固定画框与观众路径触发的连续场",form:"大尺度投影、粒子、镜面或可响应空间形",color:"高动态综合色场或受控单色环境",lighting:"投影、自发光、反射与黑场共同塑造空间",material:"数字投影、LED、镜面、传感器与空间音响"}, "现代与当代艺术"),
  rule(/light and space/i, {period:"约1960–1970年代至今",year:1970,region:"北美西海岸",composition:"空室、开口、雾化场域与观看位置精确控制",form:"几乎消失的边界、连续平面与感知性几何",color:"白、综合色光谱与低对比综合色",lighting:"光本身作为材料，制造无边界渐变和综合色适应",material:"玻璃、树脂、荧光灯、环境雾与光滑墙面",coreKeys:["compositionSpace","colorTone","lightingImaging"]}, "现代与当代艺术"),
  rule(/video art/i, {period:"约1960年代至今",year:1975,region:"全球",composition:"单屏或多屏序列、时间循环与展示设备关系",form:"电子扫描、实时画面、切换和重复动作结构",color:"模拟综合色、黑白或数字屏幕综合色",lighting:"屏幕自发光、展厅暗部与电子过曝",material:"CRT、录像磁带、投影、压缩噪点与设备外壳"}, "现代与当代艺术"),
  rule(/sound art/i, {period:"约1960年代至今",year:1980,region:"全球",composition:"声源位置、回声、观众路径与空间间隔构成不可见结构",form:"扬声器阵列、振动介质或声波数据的最小视觉载体",color:"中性环境色与设备本色",lighting:"克制展示光，保持声源和空间关系可辨",material:"扬声器、线缆、共振材料与声学表面",coreKeys:["compositionSpace","lightingImaging","materialTexture"]}, "现代与当代艺术"),
  rule(/performance art/i, {period:"约1960年代至今",year:1970,region:"全球",composition:"身体、时间、观众距离与现场边界共同组织事件",form:"动作序列、姿态限制与场地关系",color:"现场环境色、服装材料色与少量概念强调",lighting:"现场可用光或单一功能照明",material:"身体、日常物、场地痕迹与文献影像",coreKeys:["compositionSpace","formGeometry","materialTexture"]}, "现代与当代艺术"),
  rule(/body art/i, {period:"约1960–1980年代",year:1975,region:"全球",composition:"身体局部或整体作为直接画面中心与尺度基准",form:"动作、痕迹、疼痛或变形形成的明确轮廓变化",color:"肤色、血色、黑白文献影调与材料本色",lighting:"直接文献光或单一现场光",material:"皮肤、颜料、绷带、摄影胶片与即时痕迹",coreKeys:["formGeometry","lightingImaging","materialTexture"]}, "现代与当代艺术"),
  rule(/social practice/i, {period:"约1990年代至今",year:2000,region:"全球",composition:"参与者、流程、场所与档案材料组成开放系统",form:"工作坊、讨论、服务或协作过程的非单一物件形式",color:"现场环境色与清楚信息标识色",lighting:"普通公共空间或文献记录光",material:"印刷物、桌椅、档案、录像与使用痕迹",coreKeys:["compositionSpace","materialTexture","typographyLayout"]}, "现代与当代艺术"),
  rule(/bio art/i, {period:"约1990年代至今",year:2000,region:"全球",composition:"实验台、培养容器与生长过程形成模块化展示",form:"细胞、菌落、组织或生物数据的有机增殖结构",color:"半透明乳白、培养液综合色与实验标识色",lighting:"冷白实验光、透射光与显微成像光",material:"生物材料、培养皿、玻璃、凝胶与实验设备"}, "现代与当代艺术"),
  rule(/data art/i, {period:"约1990年代至今",year:2010,region:"全球",composition:"数据映射网格、序列、网络与多尺度聚类",form:"点线面编码、粒子流与参数化几何",color:"按变量受控的离散或连续综合色标度",lighting:"屏幕自发光或投影环境光",material:"数字显示、绘图输出、LED 或机械数据装置",coreKeys:["compositionSpace","formGeometry","colorTone"]}, "现代与当代艺术"),
  rule(/new media art/i, {period:"约1980年代至今",year:2000,region:"全球",composition:"屏幕、网络、传感器与参与路径组成交互系统",form:"实时生成、界面模块、数字图像与物理输出混合",color:"屏幕综合色、设备本色与交互状态色",lighting:"屏幕自发光、投影和空间展示光",material:"代码、显示器、传感器、网络数据与电子设备"}, "现代与当代艺术"),
  rule(/post-internet art/i, {period:"约2000年代至今",year:2010,region:"全球",composition:"网页图像、商品展示、实体输出与屏幕逻辑并置",form:"压缩图、界面碎片、光滑对象与尺度错置",color:"屏幕高纯度综合色、商业中性色与图像采样色",lighting:"无影商品光、屏幕辉光与展厅照明混合",material:"喷绘、树脂、显示器、廉价合成材料与压缩图像"}, "现代与当代艺术"),
  rule(/appropriation art|pictures generation/i, {period:"约1970–1980年代至今",year:1980,region:"欧美",composition:"既有媒体图像的再裁切、放大、重复与语境置换",form:"广告、电影或艺术史图像的复制轮廓与版式痕迹",color:"保留来源图像综合色或强化复制色偏",lighting:"复制品平面光、屏幕光或商品展示光",material:"摄影翻拍、丝网、胶印、录像与再生产颗粒"}, "现代与当代艺术"),
  rule(/graffiti art|urban art/i, {period:"约1970年代至今",year:1985,region:"全球环境文化",composition:"墙面尺度、重叠签名、强中心字形与环境边缘适配",form:"喷罐粗细线、泡泡字、尖角字与快速轮廓",color:"高纯度喷漆色、黑白勾边与墙体综合色",lighting:"现场日光或夜间硬光，保留墙面凹凸",material:"喷漆雾化、滴流、砖墙、覆盖层与风化痕迹",coreKeys:["formGeometry","materialTexture","typographyLayout"]}, "现代与当代艺术"),
  rule(/low-poly art/i, {period:"约1990年代至今",year:2000,region:"全球数字文化",composition:"清楚三维体量、可读剪影与简化深度层级",form:"少量多边形、三角切面与硬边法线",color:"分面受控综合色与离散明度级",lighting:"单一主光形成清楚平面明暗",material:"低面数网格、平涂材质与无细分曲面"}, "现代与当代艺术"),
  rule(/miniature model art/i, {period:"约1990年代至今",year:2010,region:"全球",composition:"俯视或近距离模型场景、尺度线索与精密局部焦点",form:"真实对象的缩尺体积、细小接缝与人为模型边缘",color:"受控综合色、轻微玩具感与真实材料色",lighting:"微缩棚拍光、浅景深与可读阴影",material:"树脂、纸木、泡沫、微缩涂装与手工接缝",coreKeys:["compositionSpace","lightingImaging","materialTexture"]}, "现代与当代艺术"),
  rule(/toyism/i, {period:"约1990年代至今",year:2000,region:"荷兰及国际",composition:"密集图形场、无单一透视与重复符号模块",form:"硬边卡通轮廓、装饰图标与平面拼接",color:"高饱和多色、黑色轮廓与清楚色区",lighting:"均匀平面光，不使用写实投影",material:"平滑丙烯、木板或公共壁面与精细硬边"}, "现代与当代艺术"),
  rule(/new leipzig/i, {period:"约1990年代至今",year:2000,region:"德国莱比锡",composition:"主体与建筑碎片并置、舞台式空间和不连贯叙事",form:"具象轮廓、错位尺度与绘画性变形",color:"灰绿、棕、综合色蓝红与不协调局部强色",lighting:"冷暖混合、来源不统一的绘画光",material:"可见油画层、擦除、薄涂与局部厚涂"}, "现代与当代艺术"),

  // Graphic design and visual communication.
  rule(/emigre typography/i, {period:"约1984–2005年",year:1990,region:"北美",composition:"多层文字网格、基线错位、尺度跳变与碎片化阅读路径",form:"早期数字位图、实验字形与尖锐低分辨率轮廓",color:"黑白、纸张色与有限电子强调色",lighting:"平面印刷光，不使用立体字投影",material:"低分辨率字体、桌面出版锯齿与胶印纸面",type:"实验字体主导版面；准确保留用户原文并维持可追踪阅读层级",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/newspaper editorial/i, {period:"19世纪末至今",year:1950,region:"全球",composition:"多栏栅格、头条—导语—正文的紧密层级与高信息密度",form:"矩形图文模块、细分隔线与稳定基线",color:"新闻纸白、黑、灰与单一版面强调色",lighting:"完全平面化的印刷呈现",material:"新闻纸纤维、粗网点、油墨吸收与轻微套印偏差",type:"窄栏正文、醒目头条与清楚字级；准确保留用户原文",coreKeys:["compositionSpace","materialTexture","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/polish poster/i, {period:"约1945–1989年",year:1965,region:"波兰",composition:"单一隐喻主图、不对称留白与手工标题形成直接焦点",form:"手绘变形、剪贴轮廓、象征替代与不完整边缘",color:"综合色红黑、土色与有限高纯度对比",lighting:"平面图像光，依靠色块与绘画笔触建层",material:"石版、丝网、拼贴与粗糙纸面",type:"手绘展示字与图形紧密融合；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/album cover/i, {period:"约1940年代至今",year:1980,region:"全球",composition:"方形画幅、单一识别主图与艺术家—标题的固定层级",form:"摄影、图形或插画围绕一个可缩略识别的核心轮廓",color:"受音乐类型约束的有限主色与高识别强调色",lighting:"按主视觉媒介统一，避免互相冲突的光源",material:"胶印纸套、唱片磨损、摄影颗粒或特殊印后",type:"封面标题在小尺寸仍可辨；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/supergraphics/i, {period:"约1960–1970年代",year:1970,region:"欧美",composition:"超大图形跨越墙面、转角和建筑分区，尺度压过局部物件",form:"宽色带、圆弧、箭头与巨型字母的连续硬边",color:"高纯度橙黄蓝绿、黑白与建筑底色",lighting:"环境光保持墙面硬边清楚",material:"哑光墙漆、乙烯贴膜与跨接缝边缘",type:"超大无衬线字可跨平面延展；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/wayfinding/i, {period:"20世纪中期至今",year:1970,region:"全球",composition:"信息按位置、方向和决策点分层，留有清楚安全边距",form:"箭头、图标、色带与模块牌面的统一几何系统",color:"高对比底字关系与按区域编码的有限功能色",lighting:"均匀可读照明，避免反光遮挡信息",material:"耐候金属、搪瓷、乙烯膜或背光面板",type:"高可读无衬线、统一字号与多语言对齐；准确保留用户原文",coreKeys:["compositionSpace","colorTone","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/plakatstil|sachplakat/i, {period:"约1905–1915年",year:1910,region:"德国",composition:"单一放大物形、纯色背景与极少文字的直接层级",form:"粗黑轮廓、平面剪影与无细节的商品式几何",color:"两至四色高对比平涂与纸张底色",lighting:"平面印刷光，最多保留单级体积色块",material:"石版平涂、纸纹与清楚印刷边缘",type:"粗重展示字与主图等权；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/kinetic typography/i, {period:"约1950年代至今",year:2000,region:"全球",composition:"文字沿时间轴进入、移位、缩放并形成镜头内节奏",form:"字形运动轨迹、遮罩切换与尺度突变",color:"高对比字底关系与少量状态色",lighting:"屏幕平面光或与影像一致的综合色",material:"时间轴动画、运动模糊和清楚关键帧边缘",type:"文字是主要运动形体；准确保留用户原文和阅读时长",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/indie magazine/i, {period:"约1990年代至今",year:2010,region:"全球",composition:"灵活多栏、跨页图像、边注与小型文本模块的编辑节奏",form:"摄影裁切、手写标记与克制几何框线混合",color:"纸张本色、黑白摄影与一至两种编辑强调色",lighting:"平面出版光，图像保留各自成像特征",material:"未涂布纸、胶印网点、扫描与小批量印刷差异",type:"个性标题与可读正文形成清楚层级；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/xerox aesthetic/i, {period:"约1970–1990年代及复兴",year:1985,region:"全球地下出版",composition:"高密度拼贴、倾斜裁切、重复影印与越界版面",form:"高反差黑白轮廓、锯齿边缘与压扁灰阶",color:"黑、纸白与偶发荧光套色",lighting:"复印机扫描光造成的平面过曝与死黑",material:"碳粉颗粒、脏点、折痕、代际复制噪声",type:"打字机字、剪贴标题与手写标注；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/cuban revolutionary poster/i, {period:"约1960–1980年代",year:1970,region:"古巴",composition:"强象征主图、对角动势与紧凑政治标题",form:"平面剪影、摄影转印、粗线插画与太阳式放射",color:"高饱和红黄蓝绿、黑与纸白",lighting:"完全平面化，以色形对比制造冲击",material:"丝网套色、粗网点与手工套印偏差",type:"粗重无衬线或手绘标题；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/soviet propaganda/i, {period:"约1917–1950年代",year:1930,region:"苏联",composition:"仰视中心、上升对角线、放射线与大标题形成动员路径",form:"英雄化剪影、几何切片与照片蒙太奇硬边",color:"红、黑、米白与有限工业综合色",lighting:"高反差平面明暗与轮廓光式色块",material:"石版、胶印、照片拼贴与粗网点",type:"粗重几何无衬线、斜排标语；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/international corporate identity/i, {period:"约1950–1980年代",year:1970,region:"欧美及全球",composition:"严格模块网格、固定安全区与跨媒介一致层级",form:"简化标志、标准图标和可复用几何组件",color:"一至三种品牌标准色配大面积中性色",lighting:"平面无影，保持所有载体颜色一致",material:"清楚矢量边缘、胶印与标准化应用样张",type:"统一字体家族、字号和对齐规则；准确保留用户原文",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/japanese corporate identity/i, {period:"约1950–1980年代",year:1970,region:"日本",composition:"标志与留白形成紧凑中心、清楚网格和高缩放适应性",form:"几何徽记、负形切分与精确曲线",color:"黑白配单一朱红、蓝或绿色标准色",lighting:"平面无影，保持符号硬边",material:"矢量或印刷硬边、细密纸面与标准化应用",type:"克制无衬线与日文网格协调；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/dutch modern typography/i, {period:"约1920–1930年代",year:1930,region:"荷兰",composition:"非对称网格、强水平垂直轴与照片文字功能分区",form:"基本几何、粗细线条和直接图形符号",color:"红、黑、白与有限蓝黄",lighting:"平面印刷光",material:"活字、照片网点、胶印纸与清楚裁切",type:"无衬线、粗细和字号形成动态层级；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/dutch studio graphic/i, {period:"约1980年代至今",year:2000,region:"荷兰",composition:"规则系统与有意扰动并存，多层信息仍保持可追踪结构",form:"大胆几何、程序化图形与观念性图像替换",color:"高纯度综合色、黑白与突出的系统色",lighting:"平面屏幕或印刷光",material:"矢量、数字合成、专色印刷与实验纸材",type:"理性网格内的实验字形；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/postmodern swiss/i, {period:"约1970–1990年代",year:1985,region:"瑞士",composition:"打破单一网格、斜排、层叠和尺度冲突但保留信息层级",form:"几何碎片、装饰线框与引用式图形",color:"高对比多色、黑白与意外综合色组合",lighting:"平面印刷光",material:"胶印、照片拼贴、粗细网点与清楚纸面",type:"多字体、角度与字级冲突；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/deconstructivist graphic|cranbrook/i, {period:"约1980–1990年代",year:1990,region:"北美",composition:"多层文本互相遮挡、边注漂移、基线断裂与非线性阅读",form:"文字碎片、线框、透明叠层与噪声边缘",color:"黑白灰配综合色采样和局部强色",lighting:"平面复制光",material:"扫描、胶片叠字、复印颗粒与数字拼版痕迹",type:"字形既是信息又是图像；准确保留用户原文并提供最低可读主层",coreKeys:["compositionSpace","materialTexture","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/risograph/i, {period:"约1980年代至今",year:2010,region:"全球",composition:"有限色版分层、大片留底与图文模块直接叠压",form:"粗网点、硬边色块与套印错位轮廓",color:"荧光粉、孔雀蓝、黄、黑等二至四色专色",lighting:"完全平面化的纸面印刷光",material:"大豆油墨颗粒、孔版网点、套印偏差与未涂布纸",type:"直接无衬线或手写标题；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/screen-printed poster/i, {period:"20世纪至今",year:1970,region:"全球",composition:"大面积专色色块、清楚正负形与强标题层级",form:"丝网硬边、粗网点与图形化剪影",color:"两至六种高遮盖专色与纸张底色",lighting:"平面印刷光",material:"丝网墨层、细小堵网、套色偏差与纸纤维",type:"粗重展示字与图形共同套色；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/letterpress design/i, {period:"15世纪至今",year:1950,region:"全球",composition:"活字栏宽、基线秩序、字块与留白形成物理版面",form:"金属活字边缘、线框和简单印版图形",color:"黑、纸白与一至两种专色",lighting:"平面纸面光，斜光可显示轻微压痕",material:"棉纸、油墨挤边、压凹与活字微小不齐",type:"活字字级与字距主导；准确保留用户原文",coreKeys:["compositionSpace","materialTexture","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/modular typography/i, {period:"20世纪至今",year:2000,region:"全球",composition:"字符依固定单元网格排列并形成可扩展版面系统",form:"少量方、圆、线段组合成一致字形骨架",color:"高对比字底关系与有限模块状态色",lighting:"平面无影",material:"矢量硬边、像素或物理模块接缝",type:"模块化字形是主要结构；准确保留用户原文并维持辨识度",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/experimental typography/i, {period:"20世纪至今",year:2000,region:"全球",composition:"字级、方向、间距与遮挡被系统性实验，阅读路径仍可判断",form:"变形字骨、切割、拉伸、叠压与负形字形",color:"高对比黑白或受控综合色层",lighting:"平面印刷或屏幕光",material:"数字变形、印刷颗粒、手工剪切或三维字面",type:"字体承担主要视觉实验；准确保留用户原文并避免伪文字",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/rave flyer|digital new wave/i, {period:"约1988–2000年代",year:1995,region:"欧美俱乐部文化",composition:"密集信息块、旋转文字、中心电子图形与多层边框",form:"早期三维字、扫描图、分形、波形与锐利几何",color:"荧光绿粉橙、黑、银与高饱和综合色",lighting:"屏幕辉光、镀铬高光与平面印刷层混合",material:"低分辨率数字合成、扫描噪点、覆膜与廉价传单纸",type:"压缩无衬线、像素字和三维展示字；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/luxury packaging/i, {period:"20世纪至今",year:2000,region:"全球",composition:"严格中心、宽阔留白、标志—品名—信息的克制层级",form:"精确盒体、细线边框与少量高识别装饰节点",color:"黑白、中性色配金银或单一深宝石色",lighting:"柔和商品光与受控金属烫印高光",material:"厚卡纸、烫金、压凹、丝带与细腻涂层",type:"高对比衬线或克制无衬线；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/editorial design/i, {period:"20世纪至今",year:1990,region:"全球",composition:"跨页网格、标题—导语—正文—图注的清楚阅读层级",form:"图像裁切、栏线、页码和模块化信息框",color:"纸张底色、正文黑与有限栏目强调色",lighting:"平面出版呈现",material:"胶印网点、纸张纤维与装订中缝",type:"多级字号、稳定行长和基线；准确保留用户原文",coreKeys:["compositionSpace","materialTexture","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/modernist book design/i, {period:"约1920–1970年代",year:1950,region:"欧美",composition:"非对称网格、明确页边、功能性图文关系与宽阔留白",form:"矩形照片、直线、色块与无装饰几何",color:"黑、纸白与一至两种原色",lighting:"平面印刷光",material:"活字或胶印、未涂布纸与清楚裁切",type:"无衬线层级、统一基线与克制字级；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/data visualization|infographic/i, {period:"20世纪至今",year:2000,region:"全球",composition:"数据按比较关系选择轴、尺度、图例与注释，阅读顺序清楚",form:"位置、长度、面积、点线与连接关系的精确编码",color:"连续或离散色阶服务数据分组，并满足对比可读性",lighting:"完全平面化，禁止装饰性三维投影干扰数值",material:"清楚矢量边缘或高分辨率印刷",type:"数字、标签与注释优先可读；准确保留用户原文和数据",coreKeys:["compositionSpace","colorTone","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/japanese modern poster/i, {period:"约1950年代至今",year:1970,region:"日本",composition:"单一强图形、宽阔留白、非对称焦点与精确标题位置",form:"摄影转印、几何符号、毛笔性线条或超现实合成的硬边控制",color:"黑白配朱红或有限高纯度综合色",lighting:"平面印刷光，图像内部光线保持统一",material:"丝网、胶印、照片网点与细腻纸面",type:"日文与拉丁字按网格协同；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/victorian graphic/i, {period:"约1837–1901年",year:1880,region:"英国及欧美",composition:"中心标题、密集边框、对称分区与信息填满版面",form:"卷草、徽章、线刻插图与多重框线",color:"黑、纸黄、深红绿蓝与有限金色",lighting:"平面印刷光",material:"木口木刻、石版套色、凸版油墨与旧纸颗粒",type:"多种装饰衬线、阴影字和弧形排字；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/wiener werkstatte graphics/i, {period:"约1903–1932年",year:1910,region:"奥地利维也纳",composition:"方形网格、边框与图文一体的全表面秩序",form:"棋盘、重复小几何、细线主体与装饰硬边",color:"黑白配金、朱红或有限综合色",lighting:"完全平面化",material:"木版、石版、手工纸与清楚套色",type:"几何展示字与装饰边框一致；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/new typography/i, {period:"约1920–1935年",year:1928,region:"欧洲",composition:"非对称网格、强左对齐、对角线和照片文字的功能层级",form:"直线、圆、色块与摄影裁切的基本几何",color:"黑白配红或少量原色",lighting:"平面印刷光",material:"无衬线活字、照片网点与胶印纸",type:"无衬线、大小写和字重按功能组织；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/interwar travel poster/i, {period:"约1918–1939年",year:1930,region:"欧美",composition:"目的地主景、强透视路径与顶部或底部大标题",form:"简化建筑地貌、流线剪影与平面综合色块",color:"有限高饱和蓝黄红绿与纸张底色",lighting:"理想化日照、长阴影与清楚明度块",material:"石版套色、颗粒渐变与纸纹",type:"粗重地点标题和紧凑信息；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/protest poster/i, {period:"20世纪至今",year:1970,region:"全球",composition:"一眼可读的口号、单一符号与远距离高对比层级",form:"拳头式高识别剪影、手工线条与直接图标",color:"黑白、红与有限高纯度综合色",lighting:"完全平面化",material:"丝网、复印、模板喷涂与廉价纸张",type:"极粗标题、短句和大字距；准确保留用户原文",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/chinese calendar poster/i, {period:"约1910–1940年代",year:1930,region:"东亚 · 中国",composition:"中心主图、上下或侧边品牌信息与装饰框的商业层级",form:"细线轮廓、柔和写实综合色和印刷式平滑造型",color:"综合色粉肤、朱红、青绿、金与纸白",lighting:"摄影棚式柔光与平滑综合色明暗",material:"石版或胶印网点、纸面综合色与手绘修版",type:"装饰标题与商品信息分层；准确保留用户原文"}, "平面设计与传播视觉"),
  rule(/isotype/i, {period:"约1925–1970年代",year:1935,region:"欧洲及全球",composition:"等尺寸图标按基线重复，通过数量而非缩放表达数据",form:"统一侧面剪影、固定描绘规则与模块化符号",color:"有限功能色、黑白与清楚类别区分",lighting:"完全平面无影",material:"矢量或印刷硬边与均匀墨色",type:"简洁无衬线标签与图标严格对齐；准确保留用户原文和数据",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "平面设计与传播视觉"),
  rule(/zine aesthetic/i, {period:"约1970年代至今",year:1990,region:"全球地下文化",composition:"折页逻辑、拼贴网格、越界裁切与手工页码形成非正式阅读",form:"剪贴图、手绘线、胶带边缘与高反差影印形",color:"黑白、纸张色与偶发荧光专色",lighting:"复印机式平面高反差",material:"复印碳粉、订书钉、胶带、折痕与廉价纸",type:"打字机字、手写字和剪贴标题；准确保留用户原文",coreKeys:["compositionSpace","materialTexture","typographyLayout"]}, "平面设计与传播视觉"),

  // Photography, cinema, and print languages.
  rule(/pictorialism|photo-secession/i, {period:"约1885–1915年",year:1900,region:"欧美",composition:"绘画式稳定构图、柔化背景与诗性单一焦点",form:"软焦轮廓、综合色明暗团块与克制细节",color:"棕褐、银灰、炭黑与低对比单色",lighting:"逆光、雾化柔光与低反差阴影",material:"树胶重铬酸盐、铂金或银盐印相的纸纤维和手工修饰"}, "摄影、电影与印刷语言"),
  rule(/straight photography/i, {period:"约1900–1940年代",year:1930,region:"欧美",composition:"直接取景、完整景深与清楚画面边缘关系",form:"准确透视、锐利轮廓与不依赖柔焦的具体细节",color:"宽灰阶黑白或克制自然综合色",lighting:"真实可追踪光源和完整亮暗层次",material:"细颗粒银盐胶片、清晰相纸和少修饰印相"}, "摄影、电影与印刷语言"),
  rule(/new objectivity photography|dusseldorf school/i, {period:"约1920年代至今",year:1970,region:"德国",composition:"严格正面、中心轴、系列化同视点与无戏剧裁切",form:"精确几何轮廓、均匀尺度和类型学重复",color:"中性黑白或低饱和自然综合色",lighting:"阴天漫射光、压低阴影与反光",material:"大画幅高解析胶片、细密颗粒与平整印相"}, "摄影、电影与印刷语言"),
  rule(/new topographics/i, {period:"约1970年代至今",year:1975,region:"北美",composition:"平视距离、稳定地平线、日常建成环境与情绪中性框取",form:"清楚基础设施轮廓、无夸张透视与均匀细节",color:"中性黑白或低饱和综合色",lighting:"平淡日光、阴天光与压低戏剧反差",material:"大画幅胶片、细颗粒和中性档案印相"}, "摄影、电影与印刷语言"),
  rule(/new vision photography/i, {period:"约1920–1930年代",year:1930,region:"欧洲",composition:"极端俯仰、对角裁切、近距放大与影子作为图形",form:"锐利几何、透视缩短与陌生化尺度",color:"高反差黑白与少量综合色实验",lighting:"硬光、投影、透明叠影与光绘",material:"银盐胶片、光影照片和摄影机无镜头实验"}, "摄影、电影与印刷语言"),
  rule(/surrealist photography|darkroom photomontage/i, {period:"约1920–1940年代",year:1930,region:"欧美",composition:"不合逻辑尺度、物体替换、多重空间和梦境式并置",form:"双重曝光轮廓、剪贴边缘、负片反转与身体碎片化",color:"银灰黑白、棕褐或受控综合色",lighting:"暗房曝光、太阳化边缘与不一致光源",material:"银盐相纸、剪贴、再拍摄、颗粒和暗房接缝"}, "摄影、电影与印刷语言"),
  rule(/humanist photography/i, {period:"约1930–1960年代",year:1950,region:"欧洲",composition:"街头中景、环境主体关系与决定性瞬间的自然裁切",form:"自然动作、清楚轮廓与轻微运动痕迹",color:"柔和黑白灰阶",lighting:"可用自然光、保留暗部和高光层次",material:"35mm 胶片颗粒、手持轻微不稳与银盐印相"}, "摄影、电影与印刷语言"),
  rule(/social documentary photography/i, {period:"约1930年代至今",year:1950,region:"全球",composition:"环境信息、主体处境和空间关系共同进入画面",form:"未经美化的具体轮廓与可读动作",color:"黑白灰阶或克制自然综合色",lighting:"现场可用光与可信曝光，不人为戏剧化",material:"胶片或数字颗粒、新闻印刷与真实表面"}, "摄影、电影与印刷语言"),
  rule(/color documentary/i, {period:"约1960年代至今",year:1980,region:"全球",composition:"日常场景的开放裁切、综合色关系与环境细节共同叙事",form:"自然比例、直接边缘和偶发视觉重叠",color:"综合色胶片色、复杂环境色与受控高光",lighting:"现场日光、荧光灯或闪光的真实混合综合色",material:"彩色负片颗粒、综合色偏移与相纸表面"}, "摄影、电影与印刷语言"),
  rule(/street photography/i, {period:"20世纪至今",year:1970,region:"全球",composition:"快速取景、前景遮挡、层叠街面与画外空间",form:"瞬时动作、透视碰撞和偶然边缘切割",color:"高反差黑白或现场综合色",lighting:"可用光、反射和不可控的明暗混合",material:"35mm 颗粒、手持微糊与高感噪点"}, "摄影、电影与印刷语言"),
  rule(/provoke photography/i, {period:"约1968–1970年代",year:1970,region:"日本",composition:"倾斜失衡、近距压迫、断裂裁切与不可预测画外空间",form:"粗颗粒吞没细节、模糊轮廓与摇晃边缘",color:"极高反差黑白、死黑与过曝白",lighting:"现场硬光、过曝和暗部堵塞",material:"粗颗粒胶片、失焦、运动模糊、刮痕和粗糙印相"}, "摄影、电影与印刷语言"),
  rule(/japanese i-photography/i, {period:"约1970年代至今",year:1990,region:"日本",composition:"近距离私人片段、日记式序列与不完美日常裁切",form:"自然轮廓、轻微失焦和未经摆布的动作",color:"综合色负片色、偏暖肤色与环境色偏",lighting:"室内可用光、窗光或小型闪光",material:"小型胶片、日期痕迹、颗粒和私人相册式印相"}, "摄影、电影与印刷语言"),
  rule(/subjective photography/i, {period:"约1949–1960年代",year:1955,region:"德国及欧洲",composition:"抽象裁切、光影实验、多重曝光与个人视点",form:"高反差轮廓、光迹、纹理近摄与非具象结构",color:"黑白灰阶或有限综合色实验",lighting:"强投影、负片反转和暗房操控光",material:"银盐胶片、太阳化、多重曝光与颗粒印相"}, "摄影、电影与印刷语言"),
  rule(/infrared photography/i, {period:"20世纪至今",year:1980,region:"全球",composition:"保持真实镜头空间，以异常光谱反差重组层次",form:"清楚轮廓、发亮植被式高反射表面与深暗天空",color:"黑白高反差或假彩红粉青综合色",lighting:"近红外反射造成明暗反转和轻微辉光",material:"红外胶片或传感器、滤镜光晕与细颗粒"}, "摄影、电影与印刷语言"),
  rule(/cross-processed/i, {period:"约1980–1990年代及复兴",year:1990,region:"全球",composition:"直接时尚或街头裁切与强综合色块",form:"清楚轮廓配高反差综合色边缘",color:"偏青绿阴影、偏黄高光、过饱和红蓝与综合色偏移",lighting:"硬光或闪光强化反常综合色",material:"反转片负冲或负片正冲形成的颗粒、高反差与综合色交叉"}, "摄影、电影与印刷语言"),
  rule(/lomography/i, {period:"约1990年代至今",year:2000,region:"全球",composition:"随手近距、倾斜地平线、偶然裁切与快照序列",form:"边缘失真、轻微失焦和不可控运动轮廓",color:"高饱和综合色、偏青或偏黄与暗角",lighting:"可用光、漏光、过曝和直闪混合",material:"廉价塑料镜头、粗颗粒胶片、漏光与暗角"}, "摄影、电影与印刷语言"),
  rule(/macro photography/i, {period:"20世纪至今",year:2000,region:"全球",composition:"极近距离单一焦点、局部占满画面与尺度陌生化",form:"微小结构被放大为清楚纹理与几何",color:"真实局部综合色或受控实验综合色",lighting:"柔光箱、环形光或侧逆光显示微表面",material:"高倍率镜头、极浅景深、焦点堆栈与细密传感器纹理"}, "摄影、电影与印刷语言"),
  rule(/golden age fashion photography/i, {period:"约1930–1960年代",year:1950,region:"欧美",composition:"优雅全身或半身、工作室背景与明确服装轮廓",form:"拉长姿态、精确布料折线和克制道具",color:"银灰黑白或柔和综合色胶片色",lighting:"大面积柔光、轮廓光与精心控制的阴影",material:"大中画幅胶片、精细印相和轻度修饰"}, "摄影、电影与印刷语言"),
  rule(/german expressionist cinema/i, {period:"约1919–1933年",year:1925,region:"德国",composition:"倾斜布景、尖锐对角线、压迫前景与扭曲深度",form:"锯机械轮系廓、夸张影子与不自然几何",color:"高反差黑白、综合色黑和少量染色调",lighting:"硬侧光、绘制阴影和极端明暗分区",material:"早期胶片颗粒、舞台布景表面与轻微闪烁"}, "摄影、电影与印刷语言"),
  rule(/soviet montage/i, {period:"约1920年代",year:1927,region:"苏联",composition:"通过镜头碰撞、尺度跳切和方向对立建立意义",form:"强对角线、近景碎片、机械重复和群体节奏",color:"高反差黑白",lighting:"硬自然光和图形化明暗块",material:"粗颗粒胶片、快速剪辑、划痕与新闻影像质感"}, "摄影、电影与印刷语言"),
  rule(/poetic realism cinema/i, {period:"约1930年代",year:1937,region:"法国",composition:"雾夜街景、封闭空间、主体与环境的抒情距离",form:"柔化轮廓、深景遮挡和克制动作",color:"银灰黑白、湿润深调与少量综合色染色",lighting:"雾化逆光、路灯式局部光和潮湿反射",material:"35mm 胶片颗粒、烟雾和棚景真实表面"}, "摄影、电影与印刷语言"),
  rule(/italian neorealism/i, {period:"约1943–1952年",year:1948,region:"意大利",composition:"真实街区、开放画外空间与现场式中远景",form:"自然比例、非舞台动作和环境关系",color:"宽灰阶黑白",lighting:"可用日光、真实曝光与保留暗部",material:"粗颗粒外景胶片、现场声音感与未经修饰表面"}, "摄影、电影与印刷语言"),
  rule(/french new wave/i, {period:"约1958–1968年",year:1962,region:"法国",composition:"手持街景、跳切、直接凝视和打破连续性的自由裁切",form:"自然动作、轻微晃动和镜头内临时重构",color:"高反差黑白或轻盈综合色胶片色",lighting:"现场可用光、窗光与偶发过曝",material:"35mm 胶片颗粒、手持抖动、跳切和直接录音感"}, "摄影、电影与印刷语言"),
  rule(/czechoslovak new wave/i, {period:"约1960年代",year:1965,region:"捷克斯洛伐克",composition:"日常场景与荒诞插曲并置、自由剪辑和意外视觉比喻",form:"自然表演、超现实物件关系与不稳定框取",color:"黑白或柔和东欧综合色胶片色",lighting:"自然光与舞台化段落混合",material:"35mm 颗粒、拼贴动画或实验剪辑痕迹"}, "摄影、电影与印刷语言"),
  rule(/new german cinema/i, {period:"约1960–1980年代",year:1975,region:"西德",composition:"疏离长镜头、建筑框景与社会空间的冷静距离",form:"克制动作、硬边环境轮廓与非煽情表演",color:"低饱和综合色或冷静黑白",lighting:"现场光、冷色室内光与压低戏剧反差",material:"16mm 或 35mm 颗粒、直接声画与克制剪辑"}, "摄影、电影与印刷语言"),
  rule(/new hollywood/i, {period:"约1967–1980年",year:1975,region:"北美",composition:"宽银幕环境、长焦压缩、自由机位和主体驱动的开放场面",form:"自然动作、环境或公路尺度和层叠前景",color:"综合色负片色、暖高光与深阴影",lighting:"可用光、低照度夜景和自然主义曝光",material:"35mm 胶片颗粒、变焦、镜头耀光与实景表面"}, "摄影、电影与印刷语言"),
  rule(/hong kong new wave/i, {period:"约1979–1990年代",year:1985,region:"中国香港",composition:"高密度环境空间、快速机位、斜向运动与类型片节奏",form:"近距动作、广角透视和层叠招牌轮廓",color:"综合色霓虹、钨丝暖色与胶片青绿阴影",lighting:"混合色温、街灯、实景高光和深暗背景",material:"35mm 胶片颗粒、快速摇移和潮湿环境表面"}, "摄影、电影与印刷语言"),
  rule(/taiwan new cinema/i, {period:"约1982–1990年代",year:1988,region:"中国台湾",composition:"固定长镜头、深景空间、门框层叠与主体在环境中的小尺度关系",form:"自然动作、克制轮廓和完整空间持续时间",color:"低饱和综合色胶片色、暖灰与自然绿",lighting:"现场日光、室内可用光与保留阴影",material:"35mm 胶片颗粒、长镜头和真实建筑表面"}, "摄影、电影与印刷语言"),
  rule(/japanese new wave/i, {period:"约1960年代",year:1965,region:"日本",composition:"倾斜机位、断裂剪辑、极端近景和社会空间冲突",form:"夸张动作、粗粝轮廓与实验画面分割",color:"高反差黑白或强烈综合色胶片色",lighting:"硬光、过曝和舞台化色光混合",material:"35mm 颗粒、跳切、手持和实验声画"}, "摄影、电影与印刷语言"),
  rule(/giallo cinema/i, {period:"约1960–1980年代",year:1975,region:"意大利",composition:"主观窥视角度、遮挡前景、斜线和悬疑性局部特写",form:"硬轮廓、极端近景和刀锋式切割边缘",color:"高饱和红、蓝、绿、黄与深黑",lighting:"非自然综合色侧光、局部聚光和深暗负空间",material:"综合色胶片颗粒、烟雾、镜面和湿润表面"}, "摄影、电影与印刷语言"),
  rule(/neo-noir/i, {period:"约1970年代至今",year:1990,region:"全球",composition:"低机位、遮挡前景、环境深景与心理压迫的负空间",form:"硬边剪影、反射碎片和紧张透视",color:"深黑、综合色蓝绿与单一暖色强调",lighting:"低调侧光、实景灯、百叶切光和湿地反射",material:"胶片或数字噪点、烟雾、玻璃和潮湿路面"}, "摄影、电影与印刷语言"),
  rule(/tech noir/i, {period:"约1980年代至今",year:1990,region:"全球",composition:"黑色电影深景叠加技术界面、监控画面和工业空间",form:"剪影、硬机械轮廓、屏幕框与密集线缆结构",color:"深黑、冷蓝绿、红色警示与屏幕综合色",lighting:"霓虹、屏幕辉光、硬轮廓光和烟雾散射",material:"粗颗粒胶片、CRT 扫描、金属和湿润反射"}, "摄影、电影与印刷语言"),
  rule(/hong kong neon noir/i, {period:"约1980–2000年代",year:1995,region:"中国香港",composition:"窄街深景、层叠招牌、近距遮挡与垂直环境压缩",form:"透视拉伸、雨伞玻璃反射和密集文字轮廓",color:"洋红、青绿、钠灯黄与深黑",lighting:"霓虹综合色、逆光雨雾、镜面反射和深暗背景",material:"综合色胶片颗粒、潮湿路面、玻璃和霓虹管"}, "摄影、电影与印刷语言"),
  rule(/chanbara|wuxia cinema/i, {period:"约1950年代至今",year:1970,region:"东亚",composition:"宽银幕对峙、留空方向、快速横移与动作轴线清楚",form:"长线动作轨迹、衣料运动和武器式延伸轮廓",color:"黑白墨调或综合色胶片色与克制强色",lighting:"自然侧光、轮廓逆光和雾气层次",material:"胶片颗粒、烟尘、风动织物与实景表面"}, "摄影、电影与印刷语言"),
  rule(/analog horror/i, {period:"约2000年代至今",year:2015,region:"全球网络文化",composition:"固定监控框、公共广播版式、空场与突发画面侵入",form:"模糊轮廓、跟踪错位、拉伸画面与不可辨局部",color:"褪色综合色、黑白雪花、病态绿蓝与警示红",lighting:"低照度、过曝亮点和 CRT 自发光",material:"VHS 磁带噪点、扫描线、时间码、坏帧和磁迹扭曲",type:"仅按需使用准确时间码、警报或广播字幕；保持用户原文可读"}, "摄影、电影与印刷语言"),
  rule(/cinematic photography/i, {period:"20世纪至今",year:2000,region:"全球",composition:"宽画幅、前中后景叙事、画外空间与明确视线方向",form:"镜头透视、焦点转移和自然动作轮廓",color:"受控电影综合色、统一冷暖关系与保留肤色层次",lighting:"具有动机的实景光、主辅光关系和层次化暗部",material:"胶片颗粒或受控数字噪点、镜头光学和真实表面"}, "摄影、电影与印刷语言"),

  // Fashion and subculture: encode silhouette, layering, palette, and material rather than adding a fixed subject.
  rule(/balletcore/i, {period:"约2020年代",year:2022,region:"全球网络时尚",composition:"轻盈中心、细长垂直线与小面积绑带节点",form:"贴身上段、薄纱外层、交叉绑带与柔和圆弧",color:"芭蕾粉、奶白、浅灰与缎带综合色",lighting:"柔和高调光与低对比阴影",material:"薄纱、针织、缎带、缎面与细密褶皱"}, "时尚与亚文化视觉"),
  rule(/yami kawaii/i, {period:"约2010年代至今",year:2015,region:"日本网络亚文化",composition:"可爱模块与医疗警示符号并置、贴纸式密集层叠",form:"圆润幼态轮廓、绷带式条带和尖锐小型反差节点",color:"粉、薄荷绿、白、黑与病态紫红",lighting:"均匀平光配局部冷色辉光",material:"软针织、塑料配件、胶贴与医疗材料质感"}, "时尚与亚文化视觉"),
  rule(/normcore/i, {period:"约2010年代至今",year:2014,region:"欧美",composition:"普通日常比例、无单一装饰焦点与功能层级",form:"宽松基础廓形、直筒线、标准运动与工装比例",color:"灰、白、海军蓝、卡其与低饱和综合色",lighting:"中性自然光或直接街拍光",material:"棉、丹宁、抓绒、尼龙与普通成衣接缝"}, "时尚与亚文化视觉"),
  rule(/scene aesthetic/i, {period:"约2005–2012年",year:2008,region:"欧美青少年网络文化",composition:"发型和配件形成上重轮廓、自拍近距与图案密集叠层",form:"尖锐层次发束、紧身下装与大尺度卡通配件",color:"荧光粉绿蓝、黑与斑马式高对比",lighting:"正面闪光、屏幕光与高饱和后期",material:"染发光泽、塑料珠饰、印花针织与廉价数码噪点"}, "时尚与亚文化视觉"),
  rule(/jirai kei/i, {period:"约2020年代",year:2021,region:"日本",composition:"紧凑对称上身、蝴蝶结焦点与层叠短裙比例",form:"圆领、泡袖、收腰、荷叶边与厚底鞋的甜暗混合廓形",color:"黑、粉、酒红与奶白",lighting:"柔和室内光或正面闪光，保留黑色层次",material:"蕾丝、缎带、绒面、针织与金属小配件"}, "时尚与亚文化视觉"),
  rule(/disco aesthetic/i, {period:"约1970年代",year:1978,region:"欧美俱乐部文化",composition:"舞池中心、放射反射与全身流动轮廓",form:"喇叭裤、连体衣、深领和夸张肩线",color:"银金、黑、综合色宝石色与镜球彩光",lighting:"频闪、镜球碎光和彩色舞台轮廓光",material:"亮片、金属纱、缎面、莱卡与镜面"}, "时尚与亚文化视觉"),
  rule(/indie sleaze/i, {period:"约2006–2012年",year:2009,region:"欧美夜生活文化",composition:"近距派对快照、拥挤裁切与随意叠穿",form:"窄身旧衣、松垮层搭和不修整边缘",color:"黑、脏白、综合色红蓝与闪光过曝肤色",lighting:"机顶硬闪、深暗背景和红眼式直接光",material:"旧棉、皮革、亮片、胶片或早期数码噪点"}, "时尚与亚文化视觉"),
  rule(/african street fashion/i, {period:"约2000年代至今",year:2015,region:"非洲环境文化",composition:"全身造型焦点、建筑街景与强图案比例平衡",form:"精准剪裁、宽窄廓形混搭与配件层级",color:"高纯度综合色、复杂印花与中性色基底",lighting:"强日光或直接街拍闪光，保持织纹可读",material:"蜡染布、针织、丹宁、皮革与金属配件"}, "时尚与亚文化视觉"),
  rule(/gothic lolita/i, {period:"约1990年代至今",year:2000,region:"日本",composition:"钟形裙装中心、头饰—领口—裙摆的对称层级",form:"高领、收腰、蓬裙、荷叶边与维多利亚式小尺度细节",color:"黑、白、酒红、深蓝与暗金",lighting:"柔侧光保持黑色蕾丝和层次可读",material:"蕾丝、天鹅绒、缎带、棉布与仿古金属"}, "时尚与亚文化视觉"),
  rule(/sweet lolita/i, {period:"约1990年代至今",year:2005,region:"日本",composition:"钟形裙装、对称蝴蝶结和重复甜点式小纹样",form:"圆领、泡袖、蓬裙、荷叶边与圆润配件",color:"粉、天蓝、奶白、薄荷绿与柔和综合色",lighting:"明亮柔光与低对比阴影",material:"棉布、蕾丝、缎带、薄纱与哑光印花"}, "时尚与亚文化视觉"),
  rule(/gothic cottagecore/i, {period:"约2010年代至今",year:2020,region:"全球网络文化",composition:"自然层叠与深色中心、松散长线廓形和少量古旧节点",form:"长裙、束腰、披肩、宽袖与自然不规则边缘",color:"黑、苔绿、褐、灰与暗花色",lighting:"阴天柔光、烛光或林下斑驳光",material:"亚麻、旧蕾丝、羊毛、皮革与风化木石"}, "时尚与亚文化视觉"),
  rule(/skinhead aesthetic/i, {period:"约1960年代末至今",year:1970,region:"英国",composition:"直接正面全身、短硬上重轮廓与少量实用配件",form:"短发、短夹克、直筒裤和厚重靴形的紧凑比例",color:"黑、白、深红、丹宁蓝与军绿",lighting:"直接街拍光或硬闪光",material:"丹宁、工装棉、皮革、尼龙和抛光硬靴"}, "时尚与亚文化视觉"),
  rule(/piratecore/i, {period:"当代网络审美",year:2020,region:"全球",composition:"不对称层搭、腰带交叉与长短布片形成动态轮廓",form:"宽袖、束腰、长靴、披带和磨损边缘",color:"黑、褐、暗红、骨白与铜色",lighting:"暖侧光、海上雾光或低调电影光",material:"粗麻、旧皮革、棉布、黄铜和风化木纹"}, "时尚与亚文化视觉"),
  rule(/golden age hollywood glamour/i, {period:"约1930–1950年代",year:1945,region:"北美",composition:"优雅中心、长线全身或精密近景与对称工作室背景",form:"收腰长裙、柔性垂褶、宽肩或沙漏轮廓",color:"黑白银灰、香槟金与深宝石综合色",lighting:"蝴蝶光、轮廓光和柔焦高光",material:"丝缎、天鹅绒、珠宝、毛皮与细腻胶片颗粒"}, "时尚与亚文化视觉"),
  rule(/black metal aesthetic/i, {period:"约1980年代至今",year:1995,region:"北欧及全球",composition:"高反差中心、荒冷负空间与刻意粗糙的标志层",form:"尖刺轮廓、破碎黑白形和难读枝杈字形",color:"黑、白、灰与极少暗红",lighting:"硬闪、月光式逆光和极深暗部",material:"复印颗粒、尸妆般哑光、旧皮革和金属钉",type:"仅按需使用枝杈式标志字；正文保持用户原文可读"}, "时尚与亚文化视觉"),
  rule(/death metal aesthetic/i, {period:"约1980年代至今",year:1995,region:"欧美及全球",composition:"密集中心图像、粗重底部与尖锐标志层",form:"纠缠尖角、腐蚀轮廓和极端细节团块",color:"黑、暗红、污绿、骨白与锈褐",lighting:"低调硬光、局部高光和深暗综合色",material:"粗糙印刷、磨损金属、皮革和厚重墨层",type:"仅按需使用纠缠式标志字；正文保持用户原文可读"}, "时尚与亚文化视觉"),
  rule(/heavy metal aesthetic/i, {period:"约1970年代至今",year:1985,region:"欧美及全球",composition:"强中心徽章、对称翼状展开与舞台式造型焦点",form:"尖角字形、铆钉、皮革轮廓和夸张肩部",color:"黑、银、红、紫与电蓝",lighting:"舞台逆光、金属轮廓光和烟雾",material:"皮革、铆钉、铬金属、丹宁和粗颗粒印刷"}, "时尚与亚文化视觉"),
  rule(/gorpcore/i, {period:"约2010年代至今",year:2020,region:"全球",composition:"功能分层、口袋节点和户外装备形成清楚全身层级",form:"宽松壳衣、束带、模块口袋与厚底鞋的实用廓形",color:"苔绿、土黄、黑灰与高识别户外强调色",lighting:"阴天户外光或清楚商品光",material:"防水尼龙、抓绒、网布、橡胶与热压接缝"}, "时尚与亚文化视觉"),
  rule(/glam rock/i, {period:"约1970年代",year:1973,region:"英国及欧美",composition:"舞台中心、细长全身轮廓与夸张面部配件焦点",form:"宽肩窄腰、喇叭裤、厚底鞋和星形闪电式线条",color:"银金、红蓝、黑白与高饱和综合色",lighting:"彩色舞台光、追光和强轮廓反射",material:"亮片、金属纱、缎面、羽饰和漆皮"}, "时尚与亚文化视觉"),
  rule(/techwear/i, {period:"约1990年代至今",year:2015,region:"全球环境时尚",composition:"模块分层、对角束带、口袋节点与行动动线清楚",form:"不对称壳体、立体剪裁、收束裤脚和可调连接",color:"黑、炭灰、橄榄绿与少量反光强调",lighting:"冷硬环境光、轮廓光和受控湿面反射",material:"防水膜布、尼龙、网布、磁扣和压胶缝"}, "时尚与亚文化视觉"),
  rule(/coquette aesthetic/i, {period:"约2020年代",year:2022,region:"全球网络时尚",composition:"柔软中心、蝴蝶结和细带作为重复小焦点",form:"贴身短上装、细肩带、荷叶边与小尺度曲线",color:"粉、奶白、浅红、黑与柔和花色",lighting:"高调柔光、轻微闪光和低对比阴影",material:"蕾丝、缎带、薄纱、棉布与珍珠光泽"}, "时尚与亚文化视觉"),
  rule(/armored fashion/i, {period:"当代",year:2020,region:"全球实验时尚",composition:"强中心全身、肩胸关节分层与坚硬外壳包覆",form:"甲片叠接、尖角护肩、关节模块和雕塑性轮廓",color:"银、黑、锈色、骨白与局部强色",lighting:"硬侧光和锐利金属轮廓高光",material:"金属、树脂、皮革、网链和可见铰接结构"}, "时尚与亚文化视觉"),
  rule(/old money aesthetic/i, {period:"当代复兴，引用20世纪传统上层休闲装",year:2020,region:"欧美影响",composition:"克制对称、清楚全身比例与少量经典配件层级",form:"结构西装、针织搭肩、直筒裤裙和合体但不紧绷的轮廓",color:"海军蓝、奶白、驼色、深绿与酒红",lighting:"自然柔光或低反差编辑光",material:"羊毛、羊绒、亚麻、真丝、皮革与精细缝制"}, "时尚与亚文化视觉"),
  rule(/club kids/i, {period:"约1980–1990年代",year:1990,region:"纽约俱乐部文化",composition:"单一极端造型中心、配件堆叠与舞台式全身展示",form:"夸张体积、异形头饰、厚底鞋和身体比例改造",color:"荧光多色、黑白、金属色与综合色妆面",lighting:"正面闪光、俱乐部频闪和综合色环境光",material:"塑料、泡沫、亮片、乳胶、羽饰和临时手工连接"}, "时尚与亚文化视觉"),
  rule(/techno aesthetic/i, {period:"约1980年代至今",year:2000,region:"全球电子音乐文化",composition:"黑场中心、重复网格、功能服装层级和工业空间留空",form:"简洁硬边、贴身与宽松模块混合、少装饰轮廓",color:"黑、灰、银与单一电子强调色",lighting:"频闪、冷白顶光和轮廓辉光",material:"尼龙、网布、反光带、金属和混凝土工业表面"}, "时尚与亚文化视觉"),
  rule(/two-tone ska/i, {period:"约1970年代末–1980年代",year:1980,region:"英国",composition:"黑白棋盘重复、跳跃姿态与紧凑乐队式群组",form:"窄身西装、短裤管、帽檐和锐利黑白剪影",color:"黑、白与少量红或蓝",lighting:"高反差直接光或舞台光",material:"羊毛西装料、棉衬衫、棋盘印花和粗网点印刷"}, "时尚与亚文化视觉"),
  rule(/mermaidcore/i, {period:"约2020年代",year:2022,region:"全球网络时尚",composition:"流动中心、波浪曲线与透明层叠向下延展",form:"鱼尾或不对称裙摆、贝壳曲面和湿润细长轮廓",color:"海绿、珍珠白、虹彩紫蓝与银",lighting:"水下综合色、波纹投影和柔和虹彩高光",material:"虹彩薄膜、亮片、网纱、珍珠和湿亮缎面"}, "时尚与亚文化视觉"),
  rule(/flapper style/i, {period:"约1920年代",year:1925,region:"欧美",composition:"直身短裙、下移腰线和头饰形成垂直流苏节奏",form:"平直筒形、短发轮廓、几何珠饰与细长肢体线",color:"黑、金、银、香槟与深宝石色",lighting:"装饰艺术式舞台光和珠饰碎光",material:"流苏、珠片、丝绸、天鹅绒和羽饰"}, "时尚与亚文化视觉"),
  rule(/mod aesthetic/i, {period:"约1960年代",year:1965,region:"英国",composition:"短小几何轮廓、清楚色块与简洁全身比例",form:"A 字短裙、窄身西装、圆形图案和利落边缘",color:"黑白、红、蓝、橙与高对比原色",lighting:"明亮棚拍光或直接街拍光",material:"羊毛、针织、漆皮、乙烯基和几何印花"}, "时尚与亚文化视觉"),
  rule(/clean girl/i, {period:"约2020年代",year:2022,region:"全球网络时尚",composition:"整洁中心、贴近身体的简洁线条与极少配件",form:"利落基础廓形、顺滑发型和圆润小尺度金属节点",color:"奶白、米灰、黑、浅蓝与自然肤色",lighting:"高调自然窗光和柔和高光",material:"细针织、棉、光滑皮革、金属小饰和湿润妆面"}, "时尚与亚文化视觉"),
  rule(/emo aesthetic/i, {period:"约2000年代",year:2007,region:"欧美青少年亚文化",composition:"近距自拍、偏斜上重轮廓与乐队图形层叠",form:"侧扫尖发、紧身轮廓、窄裤和条带配件",color:"黑、红、白、紫与高对比条纹",lighting:"直接闪光、低照度室内和早期数码色偏",material:"染发、棉 T 恤、丹宁、铆钉带和数码噪点"}, "时尚与亚文化视觉"),
  rule(/rave aesthetic/i, {period:"约1988–2000年代及复兴",year:1995,region:"全球俱乐部文化",composition:"宽松全身、反光配件节点与舞池群体节奏",form:"超宽裤、短上装、厚底鞋和功能小包",color:"荧光黄绿粉、银、黑与综合色塑料色",lighting:"UV 黑光、频闪、激光和综合色雾光",material:"尼龙、网布、反光带、塑料珠饰和合成毛绒"}, "时尚与亚文化视觉"),
  rule(/cybergoth/i, {period:"约1990年代末–2010年代",year:2005,region:"全球工业俱乐部文化",composition:"黑色中心、荧光发束和管状配件向外放射",form:"厚底靴、束带、呼吸面罩和管线式发饰",color:"黑配荧光绿粉蓝或紫",lighting:"UV 黑光、冷色轮廓光和金属反射",material:"PVC、乳胶、网布、塑料管、橡胶和铬金属"}, "时尚与亚文化视觉"),
  rule(/gyaru aesthetic/i, {period:"约1990–2010年代",year:2005,region:"日本",composition:"高识别妆发中心、短装比例与密集闪亮配件",form:"蓬松卷发、夸张眼妆、厚底鞋和紧身短轮廓",color:"金棕、粉、白、黑与高饱和综合色",lighting:"明亮正面闪光和高曝光街拍光",material:"染发光泽、仿皮草、亮片、丹宁和手机照片噪点"}, "时尚与亚文化视觉"),
  rule(/mori kei/i, {period:"约2000年代至今",year:2010,region:"日本",composition:"松散多层、长线下垂与小尺度自然配件",form:"宽松裙裤、披肩、围巾和不对称柔软边缘",color:"奶白、苔绿、褐、灰蓝与低饱和花色",lighting:"林下或窗边漫射柔光",material:"亚麻、棉、羊毛、针织、蕾丝和手作木饰"}, "时尚与亚文化视觉"),
  rule(/visual kei/i, {period:"约1980年代至今",year:1995,region:"日本",composition:"舞台中心、夸张发型和服装边缘形成尖锐上升轮廓",form:"宽肩窄腰、不对称长短层、束腰和戏剧化发束",color:"黑、白、红、紫、金银与综合色妆面",lighting:"舞台追光、综合色轮廓光和深暗背景",material:"皮革、蕾丝、天鹅绒、金属、羽饰和光泽妆面"}, "时尚与亚文化视觉"),
  rule(/dandyism/i, {period:"约19世纪至今",year:1900,region:"欧洲及全球",composition:"挺直中心、精准全身比例与少量精致配件层级",form:"合体西装、清楚肩线、长外套和克制姿态",color:"黑、炭灰、奶白、酒红与深绿",lighting:"柔和肖像侧光和可读暗部",material:"精纺羊毛、丝绸、皮革、天鹅绒和精细缝制"}, "时尚与亚文化视觉"),
  rule(/hippie aesthetic/i, {period:"约1960–1970年代",year:1970,region:"欧美",composition:"松散层搭、流动长线和多种手工图案并置",form:"喇叭裤、长裙、流苏、宽袖和自然不规则轮廓",color:"土橙、紫、绿、靛蓝与高饱和扎染综合色",lighting:"暖日光、逆光光晕和自然阴影",material:"棉麻、钩针、麂皮、珠饰、扎染和手工刺绣"}, "时尚与亚文化视觉"),
  rule(/fairycore/i, {period:"约2010年代至今",year:2020,region:"全球网络审美",composition:"轻盈中心、微小闪点和植物式曲线环绕",form:"薄翼般透明层、碎边裙摆和细小有机配件",color:"浅绿、薰衣草紫、粉、珍珠白与虹彩",lighting:"斑驳柔光、逆光辉边和微小闪烁",material:"透明薄纱、欧根纱、珠片、花材和虹彩膜"}, "时尚与亚文化视觉"),
  rule(/new romantic aesthetic/i, {period:"约1979–1985年",year:1982,region:"英国",composition:"戏剧中心、宽肩细腰与历史服装元素的层叠",form:"荷叶领、泡袖、军装肩线和夸张帽饰",color:"黑、白、金、深红蓝与华丽综合色",lighting:"舞台柔光、轮廓光和烟雾",material:"丝缎、天鹅绒、蕾丝、皮革和金属饰件"}, "时尚与亚文化视觉"),
  rule(/rocker aesthetic/i, {period:"约1950年代至今",year:1960,region:"欧美",composition:"紧凑全身、短夹克上重轮廓与机车式斜线",form:"皮夹克、直筒丹宁、厚靴和金属拉链",color:"黑、白、丹宁蓝与暗红",lighting:"硬侧光、街灯或直接闪光",material:"磨损皮革、丹宁、金属拉链和橡胶"}, "时尚与亚文化视觉"),
  rule(/hardcore punk/i, {period:"约1980年代至今",year:1985,region:"欧美",composition:"直接近距、短硬轮廓、功能动作和极少装饰",form:"剃短发、宽松 T 恤、工装裤和厚底鞋",color:"黑、白、军绿与有限红色",lighting:"现场硬光、机顶闪光和高反差黑白",material:"粗棉、丹宁、帆布、胶带和复印颗粒"}, "时尚与亚文化视觉"),
  rule(/harajuku street/i, {period:"约1980年代至今",year:2000,region:"日本东京",composition:"全身街拍、多个主题层叠与配件从头到脚形成阅读路径",form:"不同廓形并置、比例夸张和自定义改造边缘",color:"多色高饱和、黑白与按造型主题组织的综合色",lighting:"自然街拍光或直接闪光",material:"成衣、手作改造、塑料配件、古着和街拍数码颗粒"}, "时尚与亚文化视觉"),
  rule(/decora kei/i, {period:"约1990年代末至今",year:2005,region:"日本",composition:"配件高密度重复、上半身焦点和从发部向外扩散的层级",form:"小夹子、珠串、贴纸和玩具模块堆叠在圆润轮廓上",color:"彩虹高饱和、粉、黄、蓝、绿与白",lighting:"明亮正面光和塑料小高光",material:"塑料发夹、珠饰、贴纸、针织和彩色合成纤维"}, "时尚与亚文化视觉"),

  // Digital speculation and network aesthetics.
  rule(/meme surrealism/i, {period:"约2010年代至今",year:2018,region:"全球网络文化",composition:"熟悉模板被不合逻辑重排、尺度突变与文字图像错位",form:"低质量剪贴边缘、重复表情和语义断裂的普通图形",color:"来源图综合色、过饱和局部色与默认黑白文字",lighting:"多个来源光线故意不一致，保留拼贴感",material:"JPEG 压缩、截图边缘、重复保存噪点与平台水印式留白",type:"仅按需使用准确短句与默认平台字体；禁止生成无意义伪文字"}, "数字推想与网络审美"),
  rule(/sickly aesthetic/i, {period:"约2010年代至今",year:2020,region:"全球网络审美",composition:"中心形体被空白或临床界面包围，局部出现异常密集细节",form:"细长脆弱轮廓、轻微液化和不稳定边缘",color:"病态黄绿、苍白灰、紫红与冷白",lighting:"冷白顶光、荧光综合色和局部过曝",material:"光滑皮肤般合成面、医疗塑料、数字噪点与湿亮局部"}, "数字推想与网络审美"),
  rule(/bloghouse aesthetic/i, {period:"约2006–2011年",year:2008,region:"欧美网络与俱乐部文化",composition:"派对快照、博客缩略图、粗大标题和高密度拼贴",form:"直接闪光轮廓、剪贴标志和锯齿数字边缘",color:"黑、白、霓虹粉蓝绿与过曝肤色",lighting:"机顶硬闪、深黑背景和屏幕式高反差",material:"早期数码噪点、JPEG 压缩、扫描传单和粗网点",type:"粗重无衬线与博客式小标签；准确保留用户原文"}, "数字推想与网络审美"),
  rule(/outrun aesthetic/i, {period:"约2010年代至今，引用1980年代未来视觉",year:2015,region:"全球网络文化",composition:"低地平线、中心消失点、透视网格与远方圆盘焦点",form:"高速水平线、棱角载具式剪影和几何山脊",color:"深紫、洋红、青蓝、橙红与黑",lighting:"综合色逆光、地平线辉光和镜面道路反射",material:"数字渐变、扫描线、轻微 VHS 噪点和光栅网格"}, "数字推想与网络审美"),
  rule(/seapunk/i, {period:"约2011–2013年",year:2012,region:"全球网络文化",composition:"漂浮图标、水面纹理和早期网页元素的满屏拼贴",form:"海豚式曲线、液态波纹、三维旋转字和低模物件轮廓",color:"青绿、湖蓝、紫、粉与虹彩",lighting:"水下焦散、屏幕辉光和塑料高光",material:"早期三维渲染、GIF 抖动、透明 PNG 边缘和水纹贴图",type:"仅按需使用早期三维展示字；准确保留用户原文"}, "数字推想与网络审美"),
  rule(/synthetic media/i, {period:"约2015年代至今",year:2022,region:"全球",composition:"摄影式画面与生成、合成、界面证据层并置",form:"近似真实但具有局部连续性错误的光滑轮廓",color:"综合色摄影色、模型综合色偏移与受控异常色",lighting:"整体可信但局部反射或阴影不一致的合成光",material:"神经渲染平滑面、插值纹理、压缩和生成式细节漂移"}, "数字推想与网络审美"),
  rule(/nuclearpunk/i, {period:"当代推想",year:2020,region:"全球",composition:"重型基础设施、辐射警戒分区与厚重中心体量",form:"反应堆式圆筒、厚墙、仪表模块和防护层轮廓",color:"混凝土灰、警示黄黑、放射绿与锈色",lighting:"冷白工业光、绿色监测辉光和深结构阴影",material:"铅钢、混凝土、陶瓷绝缘体、锈蚀和警戒涂层"}, "数字推想与网络审美"),
  rule(/cassette futurism/i, {period:"约1970–1990年代未来想象及复兴",year:1985,region:"全球",composition:"实体控制台、密集按钮、分区屏幕与模块设备堆叠",form:"厚壳盒体、机械键、磁带舱和粗像素显示",color:"米灰、黑、橙、绿色 CRT 与功能色标签",lighting:"低亮屏幕自发光、按钮小灯和工业顶光",material:"ABS 塑料、拉丝金属、橡胶键、CRT 扫描线和磨损标签",type:"等宽标签、段码和窄体技术字；准确保留用户原文"}, "数字推想与网络审美"),
  rule(/jrpg interface/i, {period:"约1990年代至今",year:2000,region:"日本游戏文化",composition:"主体区、数值区、指令菜单和对话框形成明确回合层级",form:"装饰边框、状态图标、光标和层叠面板",color:"深蓝黑底、金色边框、白字与状态功能色",lighting:"屏幕自发光，背景画面与界面明度分离",material:"像素或矢量界面边缘、低分辨率图标和半透明面板",type:"菜单与数值必须准确可读；使用时代一致位图或窄体字"}, "数字推想与网络审美"),
  rule(/minimal os/i, {period:"约2010年代至今",year:2020,region:"全球数字设计",composition:"大面积系统留白、少量窗口、清楚状态层和严格对齐",form:"细线图标、简单矩形控件和低装饰几何",color:"黑白灰、单一系统强调色与受控深浅模式",lighting:"平面屏幕光，最多使用极浅层级阴影",material:"清楚矢量边缘、像素对齐和统一控件表面",type:"中性界面无衬线、稳定字号和准确原文"}, "数字推想与网络审美"),
  rule(/surveillance aesthetic/i, {period:"约1990年代至今",year:2015,region:"全球",composition:"多路监控窗格、时间码、追踪框和高位广角视点",form:"广角畸变、识别框、坐标线和低细节远距轮廓",color:"低饱和综合色、夜视绿、黑白与警示红",lighting:"监控自动曝光、红外补光和高光溢出",material:"低码率视频、时间码、隔行扫描、压缩块和传感器噪点",type:"仅按需使用准确时间日期与系统标签；保持用户原文可读"}, "数字推想与网络审美"),
  rule(/crystalpunk/i, {period:"当代推想",year:2020,region:"全球",composition:"晶簇中心、放射生长、透明层叠和硬质防护结构并置",form:"多棱晶面、尖锐分叉和几何镶嵌轮廓",color:"透明白、紫蓝、青绿与虹彩高光",lighting:"强折射、综合色焦散和锐利轮廓光",material:"晶体、切面玻璃、透明树脂、金属框和微裂纹"}, "数字推想与网络审美"),
  rule(/etherealwave/i, {period:"约1990年代至今",year:2010,region:"全球音乐与网络文化",composition:"漂浮中心、宽阔雾化空间和缓慢层叠的透明形",form:"柔长轮廓、薄纱式曲线和边缘消散",color:"夜蓝、紫灰、珍珠白与低饱和粉蓝",lighting:"逆光辉边、体积雾和低对比扩散光",material:"柔焦胶片颗粒、透明织物、数字雾化和微小光粒"}, "数字推想与网络审美"),
  rule(/miami retrofuturism/i, {period:"当代复古未来视觉",year:2015,region:"全球，引用迈阿密现代与1980年代",composition:"水平天际、竖向植被式竖线、流线建筑和跑道式透视",form:"圆角体块、霓虹线条、百叶与流线曲面",color:"粉、薄荷绿、青蓝、珊瑚橙与奶白",lighting:"暖日落、青粉霓虹和光滑表面反射",material:"灰泥、玻璃砖、铬金属、低噪数字渐变和霓虹"}, "数字推想与网络审美"),
  rule(/woodpunk/i, {period:"当代推想",year:2020,region:"全球",composition:"木构模块、机械连接和手工工作区形成可读系统",form:"榫卯框架、木机械轮系式轮廓和有机工具结构",color:"深浅木色、麻绳褐、铁黑与少量植物绿",lighting:"暖侧光显示木纹、切面和结构阴影",material:"粗细木材、竹、绳、树脂和可见榫接"}, "数字推想与网络审美"),
  rule(/climate punk/i, {period:"当代推想",year:2025,region:"全球",composition:"气候基础设施、庇护层、资源循环模块和极端天气空间",form:"遮阳壳、集水面、可修复模块和环境传感器轮廓",color:"材料中性色、警示橙、环境蓝绿与天气综合色",lighting:"强烈极端日光、尘雾或暴雨漫射光",material:"回收金属、生物材料、膜结构、风化和修补痕迹"}, "数字推想与网络审美"),
  rule(/ai surrealism/i, {period:"约2020年代至今",year:2023,region:"全球生成文化",composition:"梦境式连续变形、尺度滑移和多个语义区域无缝融合",form:"看似光滑但局部拓扑不稳定的混合轮廓",color:"综合色摄影色与局部非自然综合色漂移",lighting:"电影式整体光与局部反射、阴影不一致",material:"神经生成式细节、纹理融合、重复微结构和过度平滑表面"}, "数字推想与网络审美"),
  rule(/soft grunge/i, {period:"约2010年代",year:2014,region:"全球网络文化",composition:"单一照片、手写短句、透明贴图和宽阔留黑的轻度拼贴",form:"柔焦轮廓、轻微撕裂边缘和非侵入式故障",color:"灰粉、浅紫、黑、脏白与低饱和综合色",lighting:"柔和闪光、阴天光和轻微综合色漏光",material:"胶片颗粒、纸纹、JPEG 噪点和轻度磨损",type:"细小手写或打字机式标题；准确保留用户原文"}, "数字推想与网络审美"),
  rule(/cyber zen/i, {period:"当代",year:2020,region:"全球",composition:"大面积数字留白、单一平静焦点和少量界面节点",form:"极简几何、柔和圆角与克制细线",color:"黑白灰、冷青与单一暖色强调",lighting:"柔和屏幕辉光、低对比环境光和细轮廓光",material:"哑光数字表面、细颗粒、玻璃和极少铬金属"}, "数字推想与网络审美"),
  rule(/cyber mysticism|digital mysticism/i, {period:"约2010年代至今",year:2020,region:"全球网络文化",composition:"中心符号、同心界面环、数据星图和仪式式对称",form:"几何徽记、细线轨道、发光符号与层叠透明框",color:"深黑、紫蓝、金、青与发光白",lighting:"中心辉光、屏幕自发光、体积光束和暗场",material:"全息薄膜、数字粒子、玻璃、扫描噪点与细线 UI",type:"仅按需使用准确符号说明和用户原文；避免伪造神秘文字"}, "数字推想与网络审美"),
  rule(/cel-shaded/i, {period:"约1990年代至今",year:2005,region:"全球游戏与动画",composition:"清楚剪影、镜头式三维空间和可读动作方向",form:"黑色或综合色轮廓、简化多边形和分段明暗面",color:"高纯度综合色、两至三级阴影和有限高光",lighting:"单一主光转化为硬边卡通色阶",material:"实时三维网格、描边渲染、平涂贴图和无细微粗糙度"}, "数字推想与网络审美"),
  rule(/latent space/i, {period:"约2015年代至今",year:2022,region:"全球生成文化",composition:"多个图像概念在连续场中渐变、聚类和中间态并置",form:"轮廓相互插值、局部拓扑漂移和特征融合",color:"从一组综合色平滑过渡到另一组综合色",lighting:"不同图像域的光线逐步混合而非突变",material:"神经插值平滑面、生成纹理漂移和连续形变痕迹"}, "数字推想与网络审美"),
  rule(/biopunk/i, {period:"当代推想",year:2020,region:"全球",composition:"实验模块、有机生长体与工业支架互相嵌合",form:"膜、管束、细胞式重复和不对称增殖轮廓",color:"组织粉、病态绿、培养液黄、黑与冷白",lighting:"冷白实验光、透射光和湿亮高光",material:"生物膜、凝胶、玻璃、金属支架和黏液般表面"}, "数字推想与网络审美"),
  rule(/stonepunk/i, {period:"当代推想",year:2020,region:"全球",composition:"巨石模块、绳索连接和原始机械逻辑形成厚重系统",form:"粗凿石轮、楔形、骨木支架和低重心体量",color:"石灰、赭褐、炭黑与骨白",lighting:"硬日光和擦边侧光强化凿痕",material:"粗石、骨、木、皮绳、灰尘和磨损"}, "数字推想与网络审美"),
  rule(/clockpunk/i, {period:"当代推想，引用文艺复兴机械",year:2020,region:"全球",composition:"同心机械层、精密传动路径和轴心式装置焦点",form:"机械轮系轮系、擒纵、发条、刻度环和黄铜框架",color:"黄铜金、钢灰、深木色与珐琅白",lighting:"暖侧光、金属边缘高光和深机械缝隙",material:"黄铜、钢、木、珐琅、润滑油和精密刻纹"}, "数字推想与网络审美"),
  rule(/silkpunk/i, {period:"当代推想",year:2015,region:"全球，借鉴东亚材料技术",composition:"轻型框架、翼面、绳索和层叠膜材形成可读动力系统",form:"竹木弧架、折叠翼、张拉曲线和柔硬连接",color:"丝白、竹木色、墨黑、朱红与青绿色",lighting:"柔和天光透过薄膜并显示纤维纹理",material:"竹、丝、纸、绳、漆和精细机械连接"}, "数字推想与网络审美"),
  rule(/angelcore/i, {period:"约2010年代至今",year:2020,region:"全球网络审美",composition:"中心上升、对称展开、宽阔天光留白和细小闪点",form:"羽状层叠、细长弧线、光环式圆形和轻盈轮廓",color:"白、象牙、浅蓝、淡金与珍珠虹彩",lighting:"高调逆光、体积云光、柔焦辉边和过曝高光",material:"薄纱、羽毛、珍珠、胶片光晕和柔化数字颗粒"}, "数字推想与网络审美"),
  rule(/net art/i, {period:"约1990年代至今",year:2000,region:"全球互联网",composition:"超链接、浏览器窗口、网络路径和用户操作共同构成非线性页面",form:"默认控件、文本链接、小图标和代码生成形",color:"网页安全色、默认蓝链接、灰控件与屏幕黑白",lighting:"平面屏幕光",material:"HTML、低分辨率位图、GIF、压缩图和网络延迟痕迹",type:"默认网页字体、下划线链接与准确用户原文"}, "数字推想与网络审美"),
  rule(/new aesthetic/i, {period:"约2010年代",year:2012,region:"全球网络文化",composition:"机器视觉框、像素层、现实物体与数字界面同屏并置",form:"识别框、二维码式网格、低模形和硬边数字覆盖",color:"屏幕 RGB、监控灰、荧光功能色与现实综合色",lighting:"现实环境光与屏幕自发光直接叠加",material:"像素、压缩、三维网格、摄像头噪点和打印输出"}, "数字推想与网络审美"),
  rule(/internet y2k nostalgia/i, {period:"约1997–2005年视觉的当代怀旧",year:2000,region:"全球互联网",composition:"门户式模块、闪烁徽章、圆角设备和密集小图标",form:"气泡按钮、椭圆轨道、像素图标和厚边网页控件",color:"邦迪蓝、银、酸绿、白与早期网页安全色",lighting:"塑料高光、屏幕辉光和金属渐变",material:"低分辨率位图、GIF 抖动、透明塑料和镀铬数字表面",type:"像素字或早期网页无衬线；准确保留用户原文"}, "数字推想与网络审美"),
  rule(/virtual idol/i, {period:"约2000年代至今",year:2015,region:"东亚及全球",composition:"舞台中心、界面弹幕、全身轮廓和品牌色节点",form:"动画式清楚剪影、发束模块和高识别服装几何",color:"高纯度品牌色、屏幕黑与发光强调",lighting:"虚拟舞台追光、轮廓辉光和 LED 环境光",material:"赛璐璐或三维渲染、全息屏、数字粒子和干净贴图"}, "数字推想与网络审美"),
  rule(/digital fashion/i, {period:"约2015年代至今",year:2022,region:"全球",composition:"全身造型中心、无重力层叠和可超越物理缝制的轮廓",form:"程序化褶皱、液态外壳、夸张体积和悬浮配件",color:"可变综合色、虹彩、铬色与数字材质色",lighting:"三维棚灯、环境贴图反射和清楚轮廓光",material:"布料模拟、程序纹理、透明网格和无物理接缝的数字表面"}, "数字推想与网络审美"),
  rule(/demoscene/i, {period:"约1980年代至今",year:1995,region:"全球计算机亚文化",composition:"实时视听序列、中心三维效果、滚动文字和节拍同步切换",form:"程序化隧道、分形、变形网格和粒子场",color:"高饱和光谱渐变、屏幕黑与有限硬件综合色",lighting:"程序化辉光、光栅条和实时着色高光",material:"像素、色带、抖动、实时渲染限制和压缩音画同步",type:"滚动等宽或位图字；准确保留用户原文"}, "数字推想与网络审美"),
  rule(/lunarpunk/i, {period:"当代推想",year:2020,region:"全球",composition:"夜间生态聚落、月相轴线、低照度路径和共同体节点",form:"有机壳体、蘑菇式照明、织物罩棚和柔性结构",color:"夜蓝、紫、银白、发光青绿与植物深绿",lighting:"月光、低位生物光和柔和路径光",material:"深色木石、菌丝材料、织物、再生玻璃和湿润植被"}, "数字推想与网络审美"),
  rule(/decopunk/i, {period:"当代推想，引用装饰艺术",year:2020,region:"全球",composition:"严格中轴、阶梯上升、放射扇形和奢华机械层级",form:"流线阶梯几何、太阳纹、尖塔和精密机械装饰",color:"黑、金、铬银、深绿与酒红",lighting:"戏剧轮廓光、金属高光和深色背景",material:"抛光黄铜、黑漆、镀铬、玻璃和精密刻纹"}, "数字推想与网络审美"),
  rule(/cursed image/i, {period:"约2010年代至今",year:2018,region:"全球网络文化",composition:"普通快照中出现无法解释的局部关系、糟糕裁切和信息缺失",form:"模糊轮廓、尺度不协调和偶然遮挡",color:"脏综合色数码色、偏绿闪光和压缩综合色断层",lighting:"直接闪光、低照度噪点和不自然自动曝光",material:"低分辨率 JPEG、重复压缩、镜头污渍和早期手机噪点"}, "数字推想与网络审美"),
  rule(/frutiger metro/i, {period:"约2004–2013年",year:2008,region:"全球数字与企业视觉",composition:"粗黑流线插画、图标群、波形模块和非对称平面层叠",form:"粗圆轮廓、扁平拟人图标、音乐与交通式符号",color:"黑白配高饱和青绿橙蓝粉",lighting:"完全平面化，仅用少量光泽色块",material:"清楚矢量边缘、数字贴纸感与简洁渐变",type:"圆润无衬线和手绘式展示字；准确保留用户原文"}, "数字推想与网络审美"),
  rule(/2010s tumblr/i, {period:"约2010–2016年",year:2013,region:"全球网络文化",composition:"纵向信息流、单张照片、短句叠字和留黑拼贴",form:"柔焦摄影轮廓、透明 PNG、星空和手绘小符号",color:"黑白、灰紫、低饱和粉蓝与综合色胶片色",lighting:"柔和闪光、逆光光晕和低对比综合色",material:"JPEG 颗粒、轻微漏光、扫描纸纹和平台压缩",type:"小写无衬线、打字机或手写短句；准确保留用户原文"}, "数字推想与网络审美"),
  rule(/web 2\.0 gloss/i, {period:"约2004–2012年",year:2008,region:"全球互联网",composition:"圆角模块、居中服务入口、图标工具栏和明确层级",form:"气泡按钮、圆润图标、反射式标志和厚边控件",color:"高饱和蓝绿橙、白与银灰渐变",lighting:"顶部白色高光、内阴影和玻璃式反射",material:"光泽塑料、矢量渐变、像素对齐边缘和小型阴影",type:"圆润无衬线、粗体按钮标签与准确用户原文"}, "数字推想与网络审美"),
  rule(/isometric pixel/i, {composition:"等距轴网、清楚高度层级与模块化场景拼接",form:"阶梯像素边缘、等距菱形面和离散体积",color:"有限调色板、离散明度级与材质分区色",lighting:"固定方向的像素阴影和无平滑渐变的面光",material:"可见像素、纹理抖动和逐格边缘"}, "数字推想与网络审美"),
  rule(/console low-poly/i, {composition:"固定游戏机镜头、清楚前中后层级和低面数场景模块",form:"大三角面、硬边轮廓和简化三维体积",color:"有限纹理综合色与明显顶点综合色插值",lighting:"烘焙式明暗、低精度阴影和环境雾",material:"低面数网格、低分辨率贴图和纹理扭曲"}, "数字推想与网络审美"),
  rule(/ps1 aesthetic/i, {composition:"固定或有限机位、短视距雾和低分辨率三维层级",form:"不稳定多边形边缘、顶点抖动和块状体积",color:"低位深综合色、抖动和综合色条带",lighting:"顶点光照、无精确投影和综合色雾化",material:"低面数网格、纹理仿射扭曲、像素抖动和深度抖动"}, "数字推想与网络审美"),
  rule(/n64 aesthetic/i, {composition:"第三人称或固定游戏机视角、清楚平台层级和大块场景",form:"圆钝低面数体积、简化曲面和粗轮廓",color:"高饱和有限综合色、平滑顶点色和雾化远景",lighting:"柔和顶点光照、烘焙阴影和明显环境雾",material:"低分辨率双线性过滤贴图、低面数网格和柔糊采样"}, "数字推想与网络审美"),

  // Craft-derived visual systems: describe the operation and its visible trace.
  rule(/aran knit/i, {composition:"粗针织纹按纵向栏带排列，中心绳索纹与侧边小纹形成对称层级",form:"凸起绞花、蜂窝、菱格与连续绳索状线条",color:"羊毛米白、燕麦色、灰与自然纤维色",lighting:"斜侧柔光强调粗针目和立体绞花阴影",material:"粗纺羊毛、清楚针目、弹性罗纹与手织张力差"}, "可转译工艺视觉系统"),
  rule(/whitework embroidery/i, {composition:"白地白线的中心纹样、边饰与疏密针区形成低对比层级",form:"镂孔、抽纱、缎面针和细密凸起轮廓",color:"纯白、象牙白与极细微冷暖白差",lighting:"掠射柔光通过阴影显示同色刺绣",material:"亚麻或棉布、白线、抽纱孔洞与细小针脚"}, "可转译工艺视觉系统"),
  rule(/sashiko/i, {composition:"等距针脚沿几何网格、连续波纹或交错边带重复",form:"短白虚线、青海波式弧线、菱格与连接节点",color:"靛蓝布底与米白棉线的双色对比",lighting:"均匀织物光与线迹的微小凸起阴影",material:"靛染棉布、粗白棉线、可见针距和补强接缝"}, "可转译工艺视觉系统"),
  rule(/luneville/i, {composition:"精细花饰沿中心轴或衣片边缘蔓延，珠片形成密集高光路径",form:"链式钩针线、亮片轮廓和珠饰填充的细弧形",color:"金银、黑、透明珠色与宝石综合色",lighting:"柔侧光产生密集离散珠片闪点",material:"薄纱底、钩针链绣、亮片、玻璃珠与金属线"}, "可转译工艺视觉系统"),
  rule(/fair isle knit/i, {composition:"窄幅横向色带连续重复，每行使用少量颜色并保持均匀节奏",form:"小尺度十字、菱形、雪花和锯齿像素针目",color:"两至五种羊毛综合色，以深浅对比组织色带",lighting:"均匀柔光保持针目图案清楚",material:"多色提花针织、背面浮线、细羊毛与轻微张力差"}, "可转译工艺视觉系统"),
  rule(/crazy quilt/i, {composition:"不规则布片从中心或随机节点放射拼接，接缝被装饰针法强调",form:"多边形碎片、弯折接缝和不一致纹样尺度",color:"高综合色宝石色、印花、深色底与金线强调",lighting:"柔侧光显示不同织物反光差和厚度",material:"丝绒、丝缎、棉布、蕾丝、刺绣接缝与旧布差异"}, "可转译工艺视觉系统"),
  rule(/crochet/i, {composition:"环形或方形单元逐圈生长并拼接成连续网面",form:"链针、短长针、扇形和镂空孔组成的模块轮廓",color:"纱线本色、有限综合色或多色拼接",lighting:"斜侧柔光穿过镂孔并显示线圈阴影",material:"钩针线圈、纱线毛羽、结点与柔软网状起伏"}, "可转译工艺视觉系统"),
  rule(/tapestry aesthetic/i, {composition:"横向叙事场、连续边带与大色块在经线框架中逐段构成",form:"由纬线换色形成的柔硬交替边缘和简化轮廓",color:"羊毛综合色、植物染红蓝绿与经线底色",lighting:"均匀织物光，纬向纹理产生低起伏",material:"经线隐藏、纬线覆盖、换色缝隙与厚重挂毯纤维"}, "可转译工艺视觉系统"),
  rule(/blackwork/i, {composition:"黑线纹样按袖口领口边带或满幅网格严密排列",form:"计数针法形成的细黑几何、双面线和密度灰阶",color:"黑线与白或米色亚麻底的高对比",lighting:"均匀织物光，保持细线和孔隙可读",material:"丝线或棉线、亚麻经纬、细密回针和可见针孔"}, "可转译工艺视觉系统"),
  rule(/brocade aesthetic/i, {composition:"重复主花、辅助纹与连续边带在经纬网格中分层",form:"提花形成的闭合轮廓、浮纬和对称纹样单位",color:"深宝石综合色、金银线与织物底色",lighting:"斜侧光显示浮线和金属纬线反射",material:"丝织提花、浮纬、金银线和高密度经纬"}, "可转译工艺视觉系统"),
  rule(/kesi tapestry/i, {composition:"画面式分区与精密轮廓沿色区逐段织成，大片底色保持平整",form:"通经断纬产生的细缝边缘、细线勾勒和小尺度综合色渐变",color:"丝线综合色、金线与细腻综合色层次",lighting:"均匀柔光显示丝线光泽和极细通经断纬缝",material:"生丝经线、彩色纬线、通经断纬和缂口痕迹"}, "可转译工艺视觉系统"),
  rule(/boro aesthetic/i, {composition:"多层旧布不规则覆盖，补丁网格和重复针脚形成累积结构",form:"矩形碎片、磨损孔洞、毛边和跨片直线针迹",color:"多阶靛蓝、褪色蓝、棉白与旧布综合色",lighting:"斜侧柔光显示层叠布片和磨损起伏",material:"旧靛染棉麻、补丁、刺子针脚、毛边和褪色"}, "可转译工艺视觉系统"),
  rule(/lace aesthetic/i, {composition:"连续网底、中心花样与边缘扇齿形成高低密度透明结构",form:"细线环结、花瓣曲线、网孔和尖机械轮系廓",color:"白、象牙、黑或单色纤维",lighting:"强背光或斜侧光显示透明孔隙和线结阴影",material:"亚麻棉丝线、结环、针编或梭结的精细网面"}, "可转译工艺视觉系统"),
  rule(/miao embroidery/i, {composition:"衣片分区、中心徽样、多重边带与密集综合色刺绣层叠",form:"几何螺旋、折线、贴布轮廓和粗细针法并置",color:"黑靛底配红、粉、橙、绿、蓝与银色",lighting:"柔侧光显示高密度线迹和银饰反光",material:"棉布、丝线、贴布、挑花、锁绣与可见针脚"}, "可转译工艺视觉系统"),
  rule(/goldwork embroidery/i, {composition:"金属线沿主轮廓盘绕，中心徽样和边饰形成高亮层级",form:"盘金线、凸绣垫高、螺旋和连续金属边缘",color:"金、银、深红、黑与织物底色",lighting:"定向柔光产生连续金属高光和凸绣阴影",material:"金属包线、丝线固定针、垫芯和丝绒或缎面底"}, "可转译工艺视觉系统"),
  rule(/patchwork quilt/i, {composition:"方块、条带或重复模块按床面网格拼接，边框和中心场层级清楚",form:"直线拼片、三角方形模块和连续压线轮廓",color:"多色印花、纯色与按模块控制的综合色关系",lighting:"均匀织物光，斜光显示夹层压线起伏",material:"棉布碎片、拼缝、夹棉、压线和手工尺寸微差"}, "可转译工艺视觉系统"),
  rule(/sichuan embroidery/i, {composition:"中心画面、疏密花色和留底结合，针向服从轮廓体积",form:"短针层叠、综合色渐变和整齐轮廓边缘",color:"明快红绿蓝黄与丝线细腻综合色",lighting:"柔和斜光显示丝线方向和细亮反射",material:"绸缎底、彩色丝线、齐针掺针和细密针脚"}, "可转译工艺视觉系统"),
  rule(/suzhou embroidery/i, {composition:"画面式留白、精细单一焦点与针向组织的柔和层次",form:"极细分丝、随机针向和近乎无轮廓的综合色过渡",color:"低至中饱和综合色、丝白与细腻冷暖渐变",lighting:"柔漫射光与丝线微光，避免强反差",material:"细绢底、劈丝细线、乱针或平针和几乎不可见针脚"}, "可转译工艺视觉系统"),
  rule(/hunan embroidery/i, {composition:"中心形体、强明暗对比和密集针向形成坚实体积",form:"长短针、毛针和交叉针建立粗细变化轮廓",color:"黑白灰、综合色棕红与局部高纯度色",lighting:"方向性侧光感通过丝线明暗和反射塑形",material:"绸缎、较粗丝线、交叉针法和显著线向"}, "可转译工艺视觉系统"),
  rule(/cantonese embroidery/i, {composition:"满幅繁密、中心对称、金线边饰与高密度装饰节点",form:"垫高凸绣、盘金轮廓和饱满闭合色区",color:"金、朱红、翠绿、蓝与高饱和综合色",lighting:"强柔光产生金线高光和凸绣深浅",material:"金银线、彩色丝线、垫芯、珠片和缎面底"}, "可转译工艺视觉系统"),
  rule(/song brocade/i, {composition:"小尺度经纬网格、对称团花与连续几何边带",form:"精细几何骨架、扁平团花和清楚提花边缘",color:"古铜金、赭红、靛蓝、茶绿与综合色底",lighting:"均匀柔光与丝线细小方向反射",material:"多重经纬、熟丝提花、金线和紧密织面"}, "可转译工艺视觉系统"),
  rule(/nishijin-ori/i, {composition:"大尺度图案跨越织面，金银纬线与综合色区形成华丽层级",form:"精密团花、几何、渐变纬线和清楚硬边",color:"金银、朱红、紫、绿、黑与高综合色",lighting:"斜侧光显示金属丝和丝线方向性闪烁",material:"高密度丝织、多色纬线、金银箔线和提花起伏"}, "可转译工艺视觉系统"),
  rule(/yunjin brocade/i, {composition:"中心主花、连续云纹边带与大尺度对称满幅结构",form:"饱满曲线、妆花换色边缘和金线勾勒",color:"金、朱红、宝蓝、翠绿与高饱和综合色",lighting:"柔侧光显示金线和多层纬花反射",material:"丝织、妆花挖梭、金线和彩纬浮起"}, "可转译工艺视觉系统"),
  rule(/zhuang brocade/i, {composition:"经纬方格、连续菱形和八角花单位按带状重复",form:"阶梯硬边、几何花纹和紧凑小尺度模块",color:"黑底配红、橙、黄、绿、蓝与白",lighting:"均匀织物光保持综合色网格清楚",material:"棉经彩纬、通经断纬或提花结构和手织微差"}, "可转译工艺视觉系统"),
  rule(/beadwork aesthetic/i, {composition:"珠点按网格、轮廓或密集填充排列，边带和中心图形层级清楚",form:"离散圆珠组成的像素边缘、线串和立体凸点",color:"玻璃或材料综合色、高对比底色与金属珠光",lighting:"柔侧光产生大量离散小高光",material:"玻璃珠、线、布或皮底、串缝连接和细小接缝"}, "可转译工艺视觉系统"),
  rule(/guan ware/i, {composition:"器表大面积留白，极少装饰，以釉色与开片网络为主要视觉",form:"厚釉包裹的柔和轮廓、圆润转折和不规则裂纹",color:"粉青、灰青、米黄与深浅开片线",lighting:"大面积柔光与低对比釉面高光",material:"厚润青釉、紫口铁足、细密或疏朗开片和陶胎"}, "可转译工艺视觉系统"),
  rule(/delftware/i, {composition:"白地中心图景、连续边饰与器表曲面适配",form:"钴蓝手绘线、简化景物轮廓和植物卷饰",color:"钴蓝与锡釉白的清楚双色关系",lighting:"柔漫射光和釉面小高光",material:"锡釉陶胎、钴料笔触、釉面细裂与烧制蓝色浓淡"}, "可转译工艺视觉系统"),
  rule(/jun ware/i, {composition:"器表以连续釉色场为主，局部流斑和综合色云团自然分布",form:"厚釉柔化的圆润器形和不规则流动边缘",color:"天青、月白、紫红、蓝灰与乳浊综合色",lighting:"柔光穿入乳浊釉层形成深浅综合色",material:"乳浊厚釉、铜红窑变、流釉、气泡和烧制不均"}, "可转译工艺视觉系统"),
  rule(/longquan celadon/i, {composition:"器表留白、浅刻或模印纹样与稳定环形边界",form:"饱满圆润器形、浅浮纹和厚釉柔边",color:"梅子青、粉青、橄榄青与灰绿",lighting:"柔漫射光与温润连续釉面反射",material:"厚青釉、细密气泡、石质胎和温润玻璃质表面"}, "可转译工艺视觉系统"),
  rule(/azulejo/i, {composition:"方形瓷砖按墙面网格拼接，单幅叙事或连续重复边带",form:"釉绘硬边、几何重复和可跨砖延续的轮廓",color:"钴蓝与白为主，或黄绿蓝多色釉彩",lighting:"均匀环境光和釉面离散反光",material:"釉面陶砖、方形勾缝、手绘釉色和烧制差异"}, "可转译工艺视觉系统"),
  rule(/^celadon aesthetic/i, {composition:"器表留白和克制环形结构，以釉色深浅为主要层级",form:"简洁圆润器形、柔边轮廓与少量刻印纹",color:"青绿、灰绿、粉青与温和胎色",lighting:"宽阔柔光和连续温润高光",material:"含铁青釉、陶瓷胎、细微气泡与轻微综合色差"}, "可转译工艺视觉系统"),
  rule(/raku aesthetic/i, {composition:"小尺度单体、非对称器形与大面积材料留白",form:"手捏不规则轮廓、厚薄不均和偶发变形",color:"黑、赤褐、乳白与烟熏综合色",lighting:"柔侧光显示粗糙坯体和釉面不均",material:"低温釉、烟熏、急冷裂纹、炭黑和手捏痕迹"}, "可转译工艺视觉系统"),
  rule(/ru ware/i, {composition:"极简器表、无装饰或极浅纹，以比例和釉色为主",form:"端正克制器形、柔和薄边和圆润转折",color:"天青、雨过天青、灰蓝与极淡绿色",lighting:"极柔漫射光和小面积温润高光",material:"细腻青釉、香灰胎、稀疏细开片和微小支钉痕"}, "可转译工艺视觉系统"),
  rule(/tang sancai/i, {composition:"立体器表上的大块流釉分区与自然下淌方向",form:"饱满塑形、清楚模印轮廓和釉色自由交融边缘",color:"铅黄、铜绿、乳白、褐与少量蓝",lighting:"柔侧光显示透明釉层和立体体积",material:"低温铅釉、流淌综合色、露胎边缘和烧制斑驳"}, "可转译工艺视觉系统"),
  rule(/hispano-moresque tile/i, {composition:"星形多边形、交织网格与连续墙面镶嵌",form:"手切或模制几何、阿拉伯纹样和精密拼接节点",color:"钴蓝、绿、白、赭黄与金属虹彩",lighting:"均匀环境光配釉面和虹彩反射",material:"锡釉陶砖、金属光泽釉、勾缝与烧制微差"}, "可转译工艺视觉系统"),
  rule(/transferware/i, {composition:"器表中心景图、重复边带与留白区由转印版统一复制",form:"细密雕版线、蓝色轮廓和可重复图案边缘",color:"钴蓝、棕、黑、红与白釉底的单色关系",lighting:"柔漫射光和釉面小高光",material:"铜版转印纸痕、釉下印花、接图缝和细密线纹"}, "可转译工艺视觉系统"),
  rule(/oribe ware/i, {composition:"不对称器形、大片釉色与铁绘几何的自由分区",form:"方折或扭曲轮廓、粗黑笔线和故意不规则边缘",color:"深铜绿、黑褐、乳白与铁红",lighting:"柔侧光显示厚釉、露胎和不规则体积",material:"绿釉、铁绘、粗陶胎、流釉和窑变"}, "可转译工艺视觉系统"),
  rule(/shino ware/i, {composition:"厚白釉面上的稀疏铁绘与大面积留白",form:"厚重手作轮廓、柔化边缘和简笔图形",color:"乳白、暖橙、铁褐与火痕灰",lighting:"暖柔光显示乳浊釉和橘皮状表面",material:"长石厚釉、针孔、火痕、铁绘和粗陶胎"}, "可转译工艺视觉系统"),
  rule(/dehua blanc de chine/i, {composition:"单色白瓷体量、稳定中心与大面积周边留空",form:"流畅圆润轮廓、精细塑形和柔和衣纹式转折",color:"象牙白、乳白与冷暖白细微差",lighting:"大面积柔光和白瓷连续透润高光",material:"高白瓷胎、透明釉、细腻模塑和近乎无颗粒表面"}, "可转译工艺视觉系统"),
  rule(/painted enamel/i, {composition:"小尺度器表分区、精密画面与金属边饰",form:"细线勾勒、平滑综合色渐变和硬边金属框",color:"粉彩综合色、白地、金与细腻综合色",lighting:"柔和商品光与釉面小高光",material:"铜胎或瓷胎、低温珐琅彩、金属边和玻璃质釉面"}, "可转译工艺视觉系统"),
  rule(/filigree/i, {composition:"细金属丝沿对称骨架、中心徽样或连续边带密集填充",form:"卷曲细丝、颗粒、焊接结点和透明负空间",color:"金、银、铜与氧化综合色",lighting:"定向柔光产生细线闪点和镂空阴影",material:"拉丝金银铜、卷丝、掐丝、焊点和细小金属颗粒"}, "可转译工艺视觉系统"),
  rule(/chasing and repousse/i, {composition:"金属面上高低浮雕围绕中心或连续边带展开",form:"锤揲鼓起、錾刻凹线和连续工具路径",color:"金、银、铜、青铜综合色与氧化暗部",lighting:"擦边侧光强化浮雕高点和錾刻阴影",material:"薄金属片、背面锤揲、正面錾刻、锤痕和抛光差"}, "可转译工艺视觉系统"),
  rule(/fire-gilded/i, {composition:"金色覆盖集中在高点、边饰或完整金属体量上",form:"保留底层铸錾轮廓并由金层统一表面",color:"暖金、暗金、铜褐与磨损露底色",lighting:"暖侧光产生连续金属高光和深凹阴影",material:"汞鎏金层、微孔、磨损露铜和抛光差"}, "可转译工艺视觉系统"),
  rule(/shippo enamel/i, {composition:"金属丝分隔的闭合色区按器表网格、花纹或徽样排列",form:"细银铜线、弧形闭合单元和精密接合节点",color:"透明或不透明宝石色、金银线与深色底",lighting:"柔光产生玻璃质釉面高光和金属丝反射",material:"掐丝金属胎、玻璃珐琅、烧制气泡和抛光表面"}, "可转译工艺视觉系统"),
  rule(/plique-a-jour/i, {composition:"金属丝骨架中的透明色区连续拼接，依靠背光形成整体",form:"细金属隔线、无底胎的闭合曲线和镂空负形",color:"透明红蓝绿黄与银金边线",lighting:"强背光穿透透明珐琅并产生综合色投影",material:"无底透明珐琅、金属丝、微小气泡和薄壁接缝"}, "可转译工艺视觉系统"),
  rule(/gold and silver inlay/i, {composition:"深色金属底上的细线、徽样或连续边饰形成高对比层级",form:"嵌入式金银线、细槽轮廓和精密交叉节点",color:"黑褐金属底、金与银的高对比",lighting:"斜侧光产生金银细线反射和底材哑光差",material:"铜铁底、开槽、金银丝嵌入、磨平和氧化表面"}, "可转译工艺视觉系统"),
  rule(/suminagashi/i, {composition:"同心墨圈在水面扩散并被气流或拨动形成全幅非重复流纹",form:"极细平行波纹、软边涡旋和不规则空白岛",color:"墨黑、灰、纸白与少量综合色墨",lighting:"完全平面化，以墨色浓淡和纸面吸收建层",material:"水面浮墨转印、宣纸纤维、扩散边缘和偶发气泡痕"}, "可转译工艺视觉系统"),
  rule(/^marbling aesthetic/i, {composition:"液滴被梳、拨、拉成连续全幅流纹和重复羽状路径",form:"同心液滴、梳齿波、石纹和软边色带",color:"多色颜料、纸白与高对比流纹",lighting:"完全平面化",material:"水面或胶液浮色转印、梳拉轨迹、纸纤维和液滴边缘"}, "可转译工艺视觉系统"),
  rule(/ise katagami/i, {composition:"型纸纹样以连续小单元、镜像边带或满幅网格精密连接",form:"刀刻细线、桥接节点、镂空负形和重复硬边",color:"柿涩纸褐、黑与透空底色",lighting:"背光或均匀正光显示镂空精度",material:"多层和纸、柿涩、刀刻毛边和丝线加固"}, "可转译工艺视觉系统"),
  rule(/clamp-resist/i, {composition:"折叠和夹板决定镜像色区、重复模块与中心轴",form:"夹压形成的几何硬边、折线和轻微渗化轮廓",color:"染料综合色、布底白与深浅受压差",lighting:"均匀织物光",material:"折叠布、木夹板、防染压力、染液渗边和折痕"}, "可转译工艺视觉系统"),
  rule(/wax-resist dye/i, {composition:"满幅连续纹样、边带或手绘叙事由蜡线分隔",form:"蜡防染硬边、龟裂细线和局部自由手绘轮廓",color:"靛蓝、褐、红、布白与多次套染综合色",lighting:"均匀织物光",material:"棉布、热蜡、染液渗化、蜡裂和手工综合色差"}, "可转译工艺视觉系统"),
  rule(/chinese indigo resist/i, {composition:"蓝地白花的连续边带、中心纹样与满幅重复",form:"白浆防染形成的硬边白形、细裂纹和清楚负形",color:"深浅靛蓝与布白的双色关系",lighting:"均匀织物光",material:"棉布、石灰豆粉防染浆、靛染、浆裂和手工印版痕"}, "可转译工艺视觉系统"),
  rule(/shibori/i, {composition:"折、扎、缝、夹形成的重复点列、放射或条带结构",form:"软边白圈、折线、皱褶和防染结点",color:"靛蓝与布白为主，或有限综合色染料",lighting:"均匀织物光显示皱褶和纤维",material:"纤维吸色、结扎痕、缝线防染、渗化和折叠不均"}, "可转译工艺视觉系统"),
  rule(/katazome/i, {composition:"型纸重复单元、连续边带与清楚底纹满幅铺陈",form:"米糊防染形成的硬边轮廓、桥接痕和细密刻纹",color:"靛蓝、布白与有限手染综合色",lighting:"均匀织物光",material:"型纸、米糊防染、刷染纤维、轻微渗边和重复接缝"}, "可转译工艺视觉系统"),
  rule(/yuzen/i, {composition:"衣片曲面上的大尺度画面、流动边饰与疏密留底",form:"糊防染细线、手绘综合色渐变和精密闭合轮廓",color:"高综合色红蓝绿紫、金与丝绢底色",lighting:"柔和织物光和金线小高光",material:"丝绢、糊筒防染、手描染、蒸化综合色和金饰"}, "可转译工艺视觉系统"),
  rule(/tie-dye/i, {composition:"捆扎点形成的放射圆、重复结点或自由综合色场",form:"同心软边、白色束缚线和液态扩散轮廓",color:"高饱和多色或靛蓝与布白",lighting:"均匀织物光",material:"棉纤维、扎结防染、综合色渗化、折痕和不规则边缘"}, "可转译工艺视觉系统"),
  rule(/straw weaving/i, {composition:"经纬或辐射编条形成重复网格、边带和中心收口",form:"扁平草条、折角、同心环和交叉节点",color:"麦秆金、浅褐、深褐与少量染色",lighting:"斜侧光显示草条反光和编织阴影",material:"干草纤维、扁条、毛刺、折痕和手工接缝"}, "可转译工艺视觉系统"),
  rule(/^knotwork aesthetic/i, {composition:"绳线沿连续路径交错、循环并形成对称结体或边带",form:"绳环、交叉、收束节点和无断裂连续线",color:"纤维本色、单色绳线或有限综合色",lighting:"斜侧光显示绳线圆度和结点阴影",material:"棉麻丝绳、摩擦毛羽、收紧痕和手工张力差"}, "可转译工艺视觉系统"),
  rule(/metal mesh weaving/i, {composition:"金属丝按经纬、环扣或链甲网格连续展开并形成疏密分区",form:"细丝交叉、圆环连接和柔性金属平面",color:"银灰、黑铁、铜金与氧化综合色",lighting:"硬侧光产生密集线状高光和网孔投影",material:"金属丝、编结、焊点、氧化和柔性网面"}, "可转译工艺视觉系统"),
  rule(/rattan weaving/i, {composition:"粗细藤条形成经纬网、六角孔、边框和曲面包覆",form:"圆藤弯曲、条带交叉和连续包边",color:"藤黄、蜜褐、深棕与少量染色",lighting:"暖侧光显示藤条圆度和孔隙投影",material:"藤皮藤芯、弯曲纤维、绑扎接头和手工松紧差"}, "可转译工艺视觉系统"),
  rule(/chinese knotting/i, {composition:"单根绳线围绕中心轴镜像盘绕，下垂流苏形成垂直层级",form:"双钱结、盘长结、环耳和紧密对称结体",color:"朱红、金、青蓝与丝线光泽",lighting:"柔侧光显示绳线圆度和结体深浅",material:"丝绳、编结、收口、流苏和紧密张力"}, "可转译工艺视觉系统"),
  rule(/bamboo weaving/i, {composition:"竹篾经纬、斜编或六角孔形成连续网格和器形曲面",form:"直线竹篾、折角、交叉节点和整齐包边",color:"竹黄、浅绿、焦褐与染色条带",lighting:"斜侧光显示竹篾宽度、孔隙和投影",material:"劈竹薄篾、纤维纹理、编压接缝和轻微毛边"}, "可转译工艺视觉系统"),
  rule(/modular origami/i, {composition:"大量同尺寸折纸单元按三维网格、环形或球形重复锁接",form:"三角模块、重复折面、插接节点和多面体轮廓",color:"纸张本色、有限模块综合色或渐变排列",lighting:"硬侧光产生稳定重复折面阴影",material:"折纸纤维、锐利折痕、无胶插接和细小缝隙"}, "可转译工艺视觉系统"),
  rule(/^origami aesthetic/i, {composition:"单张纸围绕中心折序形成清楚正负形和稳定立体剪影",form:"锐利山谷折线、平面三角和无切割连续纸面",color:"单色纸、双面纸色或有限印花",lighting:"方向侧光显示折面明暗和纸边投影",material:"纸纤维、锐利折痕、轻微回弹和无胶连续表面"}, "可转译工艺视觉系统"),
  rule(/quilling/i, {composition:"卷纸线围绕中心花形、边框或字形连续填充",form:"紧卷、泪滴、S 卷和细纸条侧边形成的线性轮廓",color:"多色纸条、纸白与受控综合色",lighting:"斜侧光显示纸条高度、卷曲和细小投影",material:"窄纸条、卷曲张力、胶点和直立纸边"}, "可转译工艺视觉系统"),
  rule(/scrapbook/i, {composition:"照片、票据、纸片、标注和装饰在页面上重叠但保留主次",form:"撕边、裁切矩形、胶带和手写轮廓",color:"纸张综合色、褪色照片色与一至两种主题强调色",lighting:"平面扫描光或柔侧光显示纸层",material:"旧纸、照片、胶带、贴纸、折痕、胶痕和层叠边缘"}, "可转译工艺视觉系统"),
  rule(/papier-mache/i, {composition:"单一纸浆体量或多个手塑模块围绕稳定中心组合",form:"圆钝手塑轮廓、接片起伏和简化体积",color:"纸浆本色、综合色涂层与手绘图案",lighting:"柔侧光显示不完全平整的纸浆表面",material:"纸浆、胶、层叠纸片、干燥裂纹和手工打磨"}, "可转译工艺视觉系统"),
  rule(/paper relief/i, {composition:"多层裁纸在浅空间中叠置，正负形和投影共同构图",form:"硬边切片、折线、曲面纸层和阶梯式高差",color:"纸白、单色层次或有限综合色纸",lighting:"斜侧光产生清楚纸层投影和深度",material:"厚薄纸张、切边、折痕、垫高和纸纤维"}, "可转译工艺视觉系统"),
  rule(/rubber stamp/i, {composition:"小型印记重复排列、错位叠压或形成直接图标版面",form:"刀刻硬边、简化负形和印压缺口",color:"单色油墨、纸张底色与有限套印色",lighting:"完全平面化",material:"橡皮刀痕、油墨不均、漏印、重复压印和纸纤维"}, "可转译工艺视觉系统"),
  rule(/color woodblock/i, {composition:"主版轮廓与多块色版按清楚分区套印，留有纸面呼吸",form:"木刻硬边、刀痕线和平面综合色块",color:"有限矿物或水性套色、黑色主版与纸张底色",lighting:"平面印刷光",material:"木版刀痕、水性墨、版木纹、套色偏差和和纸纤维"}, "可转译工艺视觉系统"),
  rule(/byzantine mosaic/i, {composition:"严格中心或半穹顶轴线、等级比例与金地连续场",form:"正面扁平轮廓、衣褶线和马赛克小片构成的硬边形",color:"金、群青、朱红、绿与白",lighting:"金色玻璃片在观看角度中产生离散闪烁",material:"金箔玻璃马赛克、石片、砂浆缝和不齐铺贴角度"}, "可转译工艺视觉系统"),
  rule(/roman mosaic/i, {composition:"地面或墙面边框、中心徽章与连续几何叙事分区",form:"小石块构成的具体轮廓、黑白线和重复回纹",color:"石灰白、黑、赭红、黄与天然石色",lighting:"均匀环境光和石片细小明度差",material:"天然石或陶片、细密砂浆缝和 tesserae 方向变化"}, "可转译工艺视觉系统"),
  rule(/eggshell inlay/i, {composition:"深色漆底上的浅色碎片按轮廓、渐变或裂网密集铺陈",form:"不规则多边碎片、细黑缝和微小硬边",color:"蛋壳白、米黄、黑漆与淡综合色",lighting:"柔侧光显示壳片细小高差和漆面反射",material:"蛋壳薄片、漆层、压嵌裂纹、磨平和抛光表面"}, "可转译工艺视觉系统"),
  rule(/pietra dura/i, {composition:"黑或浅色石底上的中心花饰、对称徽样与精密边框",form:"按轮廓切割的硬石色片、细接缝和连续曲线",color:"半宝石红绿蓝黄、黑石底与白色高光",lighting:"柔侧光显示不同石材抛光反射",material:"玛瑙、碧玉、大理石等硬石薄片、无明显缝隙和镜面抛光"}, "可转译工艺视觉系统"),
  rule(/marquetry/i, {composition:"木皮色片按家具平面形成中心图案、边框或连续几何",form:"薄木皮切片、直线拼花和细小轮廓嵌线",color:"浅深木色、黑木、红褐与天然纹理综合色",lighting:"暖侧光显示木纹方向和抛光差",material:"薄木皮、拼缝、胶合、木纹方向变化和清漆表面"}, "可转译工艺视觉系统"),
  rule(/intarsia/i, {composition:"较厚木片或材料块按实体表面嵌入，形成几何或透视图案",form:"硬边块体、透视式木纹切分和精确轮廓",color:"多种天然木色、骨白与深色嵌线",lighting:"斜侧光显示嵌片微高差和木纹",material:"实木或厚木片嵌接、细缝、木纹方向和抛光"}, "可转译工艺视觉系统"),
  rule(/feather mosaic/i, {composition:"羽片按中心图形、边带或满幅色区紧密叠铺",form:"细小羽缘、方向性层叠和柔硬交替轮廓",color:"天然高饱和红蓝绿黄、黑与虹彩",lighting:"柔侧光产生方向性虹彩和细密羽缘高光",material:"羽毛片、纤维底、胶接、重叠边缘和自然虹彩"}, "可转译工艺视觉系统"),
  rule(/sgraffito/i, {composition:"上下色层通过刮刻形成线性图案、边带或大块正负形",form:"刮线、剔地硬边和露底综合色轮廓",color:"表层与底层两至三色的高对比关系",lighting:"擦边侧光显示刮槽深度",material:"湿灰泥或陶面综合色层、刮刀痕、毛边和露底颗粒"}, "可转译工艺视觉系统"),
  rule(/stucco relief/i, {composition:"墙面边框、壁龛或满幅纹样以浅深浮雕连续展开",form:"灰泥卷草、几何切面、凹槽和反复模印轮廓",color:"石灰白、暖灰、土色与少量综合色",lighting:"强擦边光形成清楚浮雕阴影",material:"石灰灰泥、模塑、手刻、细裂和粉质表面"}, "可转译工艺视觉系统"),
  rule(/shou sugi ban|charred wood/i, {composition:"大面积木板方向、拼缝和烧灼深浅形成线性结构",form:"板材直线、炭化龟裂和刷除后木纹沟槽",color:"炭黑、银灰、深褐与露木色",lighting:"擦边侧光显示炭裂和木纹高低",material:"火烧木材、鳄鱼皮状炭层、刷痕、油封和板缝"}, "可转译工艺视觉系统"),
  rule(/soapstone carving/i, {composition:"单一紧凑石体、顺应原料形状与周边留空",form:"圆润刀削面、细刻线和柔和凹凸",color:"寿山石黄、红、白、灰绿与天然综合色脉",lighting:"柔侧光显示半透明石质和刀面",material:"软石、细刀痕、天然综合色脉、砂磨和局部抛光"}, "可转译工艺视觉系统"),
  rule(/venetian plaster/i, {composition:"大面积连续墙面以批刮方向和综合色云层形成低对比结构",form:"无固定图形的宽刮痕、综合色斑和柔和边界",color:"石灰白、暖灰、综合色土色与可选深宝石色",lighting:"掠射光显示细微批刀起伏和蜡面反射",material:"多层石灰灰泥、细石粉、批刀痕、压光和蜡封"}, "可转译工艺视觉系统"),
  rule(/miniature carving/i, {composition:"极小尺度内的高密度层级、透雕孔隙和连续微细节",form:"微型凿线、薄壁镂空和多层嵌套轮廓",color:"象牙白、骨色、木色或材料本色",lighting:"微距侧光显示细小凹槽和透雕阴影",material:"象牙替代材、骨果核或木材、微刻刀痕和手工抛光"}, "可转译工艺视觉系统"),
  rule(/jade carving/i, {composition:"单一玉料体量、顺色取形、镂空层级与稳定周边留空",form:"圆润抛光曲面、浅浮雕、透雕和细阴刻线",color:"白玉、青玉、碧玉、墨玉与天然综合色皮",lighting:"柔侧逆光显示半透明度和连续高光",material:"硬玉石、砂磨、细刻、天然绺裂和温润抛光"}, "可转译工艺视觉系统"),
  rule(/east asian lacquer/i, {composition:"大面积深色留底、少量高密度装饰和克制器表分区",form:"连续圆润轮廓、薄层包覆和精确边缘",color:"漆黑、朱红、深褐与少量金",lighting:"低调柔光形成深而连续的漆面反射",material:"多层天然漆、研磨、抛光、细小尘点和深邃光泽"}, "可转译工艺视觉系统"),
  rule(/carved lacquer|tsuishu/i, {composition:"厚漆面满布连续卷纹或分区图案，凹槽与高面形成强层级",form:"V 形雕槽、层层漆截面和圆润浮雕边缘",color:"朱红、漆黑、黄褐与层间深浅差",lighting:"擦边侧光强化深刻槽和高面柔亮反射",material:"数十层漆、雕刻截面、细刀痕和温润抛光"}, "可转译工艺视觉系统"),
  rule(/kintsugi/i, {composition:"裂缝路径成为主线，金色连接在克制器表留白中清楚展开",form:"随机分叉裂线、拼合错位和不规则断面",color:"陶瓷釉色、金或银线与露胎色",lighting:"柔侧光产生金线高光和釉面反射",material:"破损陶瓷、漆粘接、金银粉、断口和修复高差"}, "可转译工艺视觉系统"),
  rule(/maki-e/i, {composition:"深漆底上的金粉图形、疏密留底与流动边缘层级",form:"蒔粉细线、平莳或高莳浮起轮廓和精密小点",color:"漆黑、深褐、金、银与少量综合色",lighting:"低调柔光产生金粉闪烁和漆面深反射",material:"天然漆、金银粉、层层罩漆、研磨和抛光"}, "可转译工艺视觉系统"),

  // Remaining regional distinctions that would otherwise inherit an overly broad track profile.
  rule(/oracle bone script/i, {
    period:"约前13–前11世纪", year:-1200, region:"东亚 · 中国",
    composition:pair("字形顺应骨片边界与裂纹疏密排列，字距、尺度和朝向保留手工变化", "glyphs arranged around bone edges and fissures with handmade variation in spacing, scale, and orientation"),
    form:pair("细直刀刻线、尖折转角、象形结构与不对称字势", "thin straight incisions, pointed angular turns, pictographic construction, and asymmetrical glyph posture"),
    color:pair("骨甲米白、刻槽深褐与拓片黑", "bone ivory, dark brown incisions, and rubbing black"),
    lighting:pair("采用平面档案光，或以擦边侧光清楚显示浅刻槽", "use flat archival light or grazing sidelight that clearly reveals shallow incisions"),
    material:pair("龟甲兽骨、刀刻凹线、占卜裂纹、风化斑与拓印颗粒", "tortoise plastron or scapula, knife-cut grooves, divination cracks, weathered mottling, and rubbing grain"),
    type:pair("仅在用户要求文字时准确保留原文，并采用甲骨刻辞式的细直象形构形", "only when text is requested, preserve the exact wording and use thin angular oracle-bone inscription construction"),
    coreKeys:["formGeometry","materialTexture","typographyLayout"]
  }, "东亚视觉传统"),
  rule(/bronze inscription/i, {
    period:"约前11–前3世纪", year:-800, region:"东亚 · 中国",
    composition:pair("字列顺应器内铸面纵向成行，间距紧凑、大小略有变化而整体重心稳定", "compact vertical columns fitted to the interior cast field, with slight size variation and a stable overall block"),
    form:pair("粗厚圆转的铸刻线、团块字形、柔化转角与不均匀边缘", "thick rounded cast strokes, compact glyph masses, softened turns, and irregular edges"),
    color:pair("青铜金、绿锈、深褐、金属黑与拓片白", "bronze gold, verdigris, dark brown, metallic black, and rubbing white"),
    lighting:pair("以擦边侧光显示铸刻深浅、金属起伏与绿锈层次", "use grazing sidelight to reveal cast depth, metal relief, and layered patina"),
    material:pair("青铜铸纹、凹凸铭文、氧化绿锈、腐蚀斑与拓印墨迹", "cast bronze texture, raised or recessed inscriptions, verdigris oxidation, corrosion marks, and ink-rubbing traces"),
    type:pair("仅在用户要求文字时准确保留原文，并采用西周至战国金文的圆厚铸刻构形", "only when text is requested, preserve the exact wording and use rounded cast inscription forms derived from Zhou bronze script"),
    coreKeys:["formGeometry","materialTexture","typographyLayout"]
  }, "东亚视觉传统"),
  rule(/seal script/i, {period:"约前8世纪–3世纪及后世应用",year:-300,region:"东亚 · 中国",composition:"纵向字势、均匀字距与严整方形字域",form:"粗细近一的圆转线条、左右对称倾向和拉长结构",color:"墨黑、纸白与朱砂印色",lighting:"完全平面化",material:"毛笔中锋墨迹、石刻或印面刻痕",type:"准确保留用户原文，并采用篆书的匀称圆转结构",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "东亚视觉传统"),
  rule(/clerical script/i, {
    period:"约前3世纪–3世纪及后世应用", year:100, region:"东亚 · 中国",
    composition:pair("横向舒展的扁方字域、清楚行列、稳定基线与均衡字距", "horizontally expanded oblong glyph fields, clear rows, stable baselines, and balanced spacing"),
    form:pair("横画波磔、蚕头雁尾、方折转角与左右开张结构", "flared horizontal strokes, silkworm-head and wild-goose-tail terminals, angular turns, and laterally opened structure"),
    color:pair("墨黑、纸白、碑石灰与少量朱砂印色", "ink black, paper white, stele gray, and restrained cinnabar seal red"),
    lighting:pair("纸墨版本完全平面化，碑刻版本只用轻微擦边光显示刻痕", "keep ink-on-paper versions fully flat; use only slight grazing light for carved stele traces"),
    material:pair("毛笔墨迹、汉碑刻痕、拓片颗粒、纸纤维与克制飞白", "brush ink, Han stele incisions, rubbing grain, paper fibers, and restrained dry-brush streaks"),
    type:pair("仅在用户要求文字时准确保留原文，并采用隶书扁方、波磔清楚的可读结构", "only when text is requested, preserve the exact wording in legible clerical-script forms with oblong proportions and flared strokes"),
    coreKeys:["compositionSpace","formGeometry","typographyLayout"]
  }, "东亚视觉传统"),
  rule(/regular script/i, {period:"约3世纪至今",year:700,region:"东亚 · 中国",composition:"方整字域、清楚行列、均衡重心与可预测字距",form:"起收明确、横竖撇捺分明、方圆兼备和结构严谨",color:"墨黑、纸白与朱砂印色",lighting:"完全平面化",material:"毛笔墨迹、纸面吸收、碑刻或刻本边缘",type:"准确保留用户原文，并采用楷书的规范笔画和可读结构",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "东亚视觉传统"),
  rule(/running script/i, {period:"约2世纪至今",year:900,region:"东亚 · 中国",composition:"行列可松动、字间连带与重心起伏形成连续阅读节奏",form:"部分笔画连写、牵丝、提按变化和楷草之间的流动结构",color:"墨黑、纸白与朱砂印色",lighting:"完全平面化",material:"毛笔墨迹、干湿提按、纸面渗化和飞白",type:"准确保留用户原文，并采用行书的连带与清楚可读结构",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "东亚视觉传统"),
  rule(/cursive script/i, {period:"约2世纪至今",year:900,region:"东亚 · 中国",composition:"纵向气脉、字组连绵、疏密突变与大面积行间留白",form:"高度省略、连续回转、疾涩变化和强烈粗细速度感",color:"墨黑、纸白与朱砂印色",lighting:"完全平面化",material:"毛笔飞白、浓淡墨、迅疾转折和吸水纸面",type:"准确保留用户原文；仅在模型能维持文字正确时采用草书连绵结构",coreKeys:["compositionSpace","formGeometry","typographyLayout"]}, "东亚视觉传统"),
  rule(/mianzhu new year/i, {period:"约17世纪至今",year:1800,region:"东亚 · 中国四川",composition:"中心主图、粗线边框与较自由的手绘填色",form:"木版墨线、夸张概括轮廓和粗放手绘边缘",color:"大红、桃红、黄、绿、蓝与纸白",lighting:"完全平面化",material:"木版墨线、手绘综合色、粉笺和明显刷色差"}, "东亚视觉传统"),
  rule(/taohuawu new year/i, {period:"约17世纪至今",year:1750,region:"东亚 · 中国苏州",composition:"精细分区、雅致场景、装饰边框与较深的建筑式层次",form:"细密木版线、精确套色和柔和形体轮廓",color:"桃红、嫩绿、淡黄、蓝与墨黑",lighting:"平面印刷光，以色层微差建层",material:"木版套色、细纸纤维、版次叠印和轻微套色偏差"}, "东亚视觉传统"),
  rule(/yangliuqing new year/i, {period:"约17世纪至今",year:1800,region:"东亚 · 中国天津",composition:"中心对称、丰满群组、室内框景和吉庆装饰层级",form:"木版轮廓结合手工开脸与综合色晕染",color:"朱红、粉、黄、绿、蓝与金色",lighting:"平面套色配手绘综合色明暗",material:"木版套印、手工彩绘、金粉和纸面综合色"}, "东亚视觉传统"),
  rule(/weifang new year/i, {period:"约17世纪至今",year:1800,region:"东亚 · 中国山东",composition:"对称门画、强中心、粗边框与直接远观结构",form:"粗壮木版线、概括剪影和高识别轮廓",color:"朱红、明黄、石绿、蓝与黑",lighting:"完全平面化",material:"木版套色、粗纸、综合色不均和印压痕"}, "东亚视觉传统"),
  rule(/philippine modernism/i, {period:"约1950–1980年代",year:1970,region:"东南亚 · 菲律宾",composition:"现代平面结构、强综合色块与地方材料或民俗节奏并置",form:"几何抽象、简化具象轮廓和手工纹理对比",color:"土色、热带高纯度色与黑白结构",lighting:"综合色平面光或强烈热带侧光",material:"油彩、木材、纤维、拼贴和粗糙手工表面"}, "南亚与东南亚视觉"),
  rule(/jeepney art/i, {period:"约1940年代至今",year:1980,region:"东南亚 · 菲律宾",composition:"载体表面满版、中心名称、连续边饰与多层图像并置",form:"手绘字、铬饰、粗线图形和密集装饰节点",color:"高饱和红黄蓝绿、铬银与综合色渐变",lighting:"明亮日光产生铬面强反射",material:"手绘搪瓷漆、铬钢、贴花、磨损和车体接缝",type:"仅按需使用准确手绘名称与路线文字；保持用户原文可读"}, "南亚与东南亚视觉"),
  rule(/nanyang style/i, {period:"约1930–1960年代",year:1950,region:"东南亚 · 新加坡与马来亚",composition:"热带现场取景、浅层空间和现代主义画面分区",form:"简化综合色块、清楚轮廓与书写性线条",color:"综合色赭黄、热带绿、蓝与朱红",lighting:"强热带日光、综合色阴影与暖湿空气感",material:"油彩、水墨或综合色媒介的可见笔触和纸布纹"}, "南亚与东南亚视觉"),
  rule(/thai folk pop/i, {period:"约21世纪",year:2015,region:"东南亚 · 泰国",composition:"传统装饰框与当代流行图像、商品符号和大色块并置",form:"平面硬边、卡通化轮廓和金饰式细密节点",color:"金、朱红、荧光粉绿蓝与深色底",lighting:"平面屏幕光配局部金色或霓虹高光",material:"丙烯、喷绘、金箔、数字拼贴和光滑商业表面"}, "南亚与东南亚视觉"),
  rule(/mesopotamian cylinder seal/i, {period:"约前3500–前500年",year:-1800,region:"古代美索不达米亚",composition:"连续滚印的横向叙事带、基线和首尾可衔接结构",form:"极小凹刻侧面轮廓、密集符号和圆筒展开式重复",color:"石材本色、黏土灰褐与拓印式深浅",lighting:"擦边光显示凹刻，或平面滚印光",material:"硬石圆筒、微刻凹线、黏土滚印颗粒和接缝"}, "西亚与伊斯兰视觉"),
  rule(/urartian art/i, {period:"约前9–前6世纪",year:-750,region:"古代亚美尼亚高原",composition:"中心徽样、连续边带、对称兽形和器物曲面适配",form:"锤揲浅浮雕、刻线轮廓和重复几何",color:"青铜金、铜红、绿锈与深色刻线",lighting:"擦边侧光强化金属浮雕和刻线",material:"青铜锤揲、铸造、刻纹、绿锈和局部抛光"}, "西亚与伊斯兰视觉"),
  rule(/zoroastrian visual/i, {period:"古代至今",year:1200,region:"伊朗与帕西文化圈",composition:"中心火焰或翼形徽记式对称、边框与仪式性秩序",form:"清楚几何徽形、层叠翼线和火焰式上升曲线",color:"白、金、朱红、深蓝与石色",lighting:"中心暖光或均匀礼仪光，保持符号边界清楚",material:"石刻、金属、织物、手抄本颜料与精细线描"}, "西亚与伊斯兰视觉"),
  rule(/asante visual/i, {period:"约17世纪至今",year:1850,region:"西非 · 加纳",composition:"金饰、织纹与符号按等级分区，中心徽样和重复边带并存",form:"几何织纹、铸金小形和高概括象征轮廓",color:"金、红、绿、黑与高对比综合色",lighting:"柔侧光同时显示金属高光和织物起伏",material:"失蜡铸金、肯特织物、木雕和精细手工接缝"}, "非洲与大洋洲视觉"),
  rule(/australian modernism/i, {period:"约1940–1970年代",year:1960,region:"澳大利亚",composition:"现代主义几何、广阔留空与地貌尺度的横向组织",form:"简化综合色块、硬边结构和抽象地形轮廓",color:"赭红、桉树灰绿、天空蓝、黑白与综合色土色",lighting:"清澈强日光和大尺度平坦阴影",material:"油彩、板材、混凝土或印刷面的克制现代质感"}, "非洲与大洋洲视觉"),
  rule(/papua new guinea ceremonial/i, {period:"传统至今",year:1900,region:"大洋洲 · 巴布亚新几内亚",composition:"强中心仪式体量、左右展开的羽饰或板形结构与密集边缘",form:"夸张轮廓、对称面纹、锯齿和多层附加件",color:"红、黑、白、黄与天然综合色",lighting:"柔侧光显示羽毛、纤维、木面和身体涂饰层次",material:"木、树皮布、羽毛、贝壳、纤维和天然颜料"}, "非洲与大洋洲视觉"),
  rule(/african independence-era modernism/i, {period:"约1950–1980年代",year:1965,region:"非洲",composition:"现代几何网格、纪念轴线与地方纹样或气候构件并置",form:"混凝土体块、遮阳格、壁画和模块化公共形",color:"混凝土灰、土色、国家综合色与高识别壁画色",lighting:"强日光、深遮阳投影和清楚体量明暗",material:"清水混凝土、砖、马赛克、木和公共艺术表面"}, "非洲与大洋洲视觉"),
  rule(/timbuktu manuscript/i, {period:"约13–19世纪",year:1600,region:"西非 · 廷巴克图",composition:"紧密文本行、宽窄页边、边注与少量几何标题区",form:"手写阿拉伯字行、墨色粗细和不规则纸页轮廓",color:"墨黑、纸黄、褐与少量红色标注",lighting:"均匀档案光，保持墨迹和纸纤维清楚",material:"手工纸、铁胆或植物墨、皮革装订、污渍和磨损",type:"仅在用户要求文字时使用准确手写文本；禁止伪造历史经文"}, "非洲与大洋洲视觉"),
  rule(/pacific contemporary art/i, {period:"约1970年代至今",year:2000,region:"大洋洲",composition:"传统网格、谱系图形与当代装置、摄影或大尺度空间并置",form:"编织线、身体尺度轮廓、现代几何和材料模块",color:"海洋蓝绿、土色、黑白与高纯度综合色",lighting:"自然岛屿光或展厅定向光显示材料关系",material:"纤维、树皮布、木、影像、回收物和当代混合媒介"}, "非洲与大洋洲视觉"),
  rule(/yoruba visual/i, {period:"传统至今",year:1800,region:"西非 · 约鲁巴文化圈",composition:"正面等级中心、串珠或雕刻边框与重复色带",form:"几何化头部比例、珠面图形和木雕体块",color:"钴蓝、红、黄、白、黑与珠饰综合色",lighting:"柔侧光显示珠面闪点和木雕凹凸",material:"木雕、玻璃珠、织物、金属和天然颜料"}, "非洲与大洋洲视觉"),
  rule(/amazonian featherwork/i, {period:"传统至今",year:1900,region:"南美亚马孙地区",composition:"头冠或身体装饰围绕中心放射、色带分层和对称展开",form:"长短羽片、扇形轮廓和纤维绑扎节点",color:"天然红、黄、蓝、绿、黑与虹彩",lighting:"柔侧光显示羽片方向、半透明度和虹彩",material:"天然羽毛、植物纤维、树脂、绑扎和重叠羽缘"}, "美洲传统与地域视觉"),
  rule(/american folk sign/i, {period:"约19–20世纪",year:1950,region:"北美",composition:"名称居中、弧形标题、边框和小型图标组成远距离可读版面",form:"手绘衬线、阴影字、粗轮廓和简化图标",color:"黑白、红、黄、蓝与有限高对比综合色",lighting:"平面招牌光，户外版本保留表面反光",material:"手绘油漆、木板或金属、刷痕、褪色和边缘磨损",type:"手绘招牌字必须准确保留用户原文"}, "美洲传统与地域视觉"),
  rule(/chola aesthetic/i, {period:"约1990年代至今，源于墨西哥裔美国视觉文化",year:2000,region:"北美 · 墨西哥裔美国社区",composition:"正面近距、姓名式字标、细线装饰与黑白摄影层叠",form:"锐利细眉式弧线、手写字、窄线条和克制轮廓",color:"黑、白、灰、酒红与银色",lighting:"直接闪光或高反差黑白肖像光",material:"圆珠笔细线、黑白胶片颗粒、金属饰件和手写纸面",type:"仅按需使用准确的手写姓名与哥特式字标；保持用户原文可读"}, "美洲传统与地域视觉"),
  rule(/brazilian concretism/i, {period:"约1950年代",year:1955,region:"巴西",composition:"严格网格、数学序列和非再现几何模块",form:"直线、方形、圆与精确硬边",color:"黑白、红黄蓝与系统化纯色",lighting:"完全平面化",material:"平滑工业颜料、印刷或硬质板面"}, "美洲传统与地域视觉"),
  rule(/brazilian neo-concretism/i, {period:"约1959–1961年及延续",year:1960,region:"巴西",composition:"几何形脱离画框进入真实空间，与观看路径和触摸关系结合",form:"折叠平面、铰接模块、柔性几何和开放边界",color:"白、红、蓝、黄与克制纯色",lighting:"环境光和真实投影参与构图",material:"木、金属、纸、织物和可触摸涂层"}, "美洲传统与地域视觉"),
  rule(/brazilian modernism/i, {period:"约1920–1960年代",year:1940,region:"巴西",composition:"现代主义简化结构与热带尺度、地方图形和动态综合色并置",form:"圆润几何、简化具象轮廓和大胆平面切分",color:"热带绿蓝、土红、黄、黑白与高纯度综合色",lighting:"强日光或平面综合色关系",material:"油彩、壁画、混凝土、拼贴和粗细对比表面"}, "美洲传统与地域视觉"),
  rule(/cuban modernism/i, {period:"约1920–1960年代",year:1950,region:"古巴",composition:"现代平面结构、非洲—加勒比节奏与强综合色块重组",form:"几何化轮廓、徽形式图形和书写性曲线",color:"土红、黑、白、热带绿蓝黄与高纯度综合色",lighting:"平面综合色光或强烈加勒比日光",material:"油彩、版画、壁画和可见手工笔触"}, "美洲传统与地域视觉"),
  rule(/tropicalia/i, {period:"约1967–1972年",year:1969,region:"巴西",composition:"流行媒体、热带图像、政治文字与综合色舞台的杂交拼贴",form:"摄影剪贴、手绘曲线、广告图形和装置模块",color:"高饱和绿黄红蓝、黑白与综合色冲突",lighting:"舞台综合色光、平面印刷光和现场日光混合",material:"丝网、拼贴、塑料、织物、电视图像和廉价消费材料"}, "美洲传统与地域视觉"),
  rule(/harlem renaissance/i, {period:"约1920–1930年代",year:1930,region:"北美 · 哈莱姆",composition:"肖像、都市夜生活和几何节奏形成稳定现代画面",form:"装饰艺术式轮廓、坚实体积和音乐节拍般重复线",color:"深黑褐、金、酒红、蓝与综合色肤色",lighting:"舞台侧光、夜景光和温暖室内光",material:"油画、版画、摄影和杂志印刷颗粒"}, "美洲传统与地域视觉"),
  rule(/black arts movement/i, {period:"约1965–1975年",year:1970,region:"北美",composition:"强中心符号、集体节奏、海报式文字与直接政治层级",form:"粗黑轮廓、非洲图形引用、剪影和表现性笔触",color:"黑、红、绿、金、土色与高对比综合色",lighting:"平面海报光或高反差摄影光",material:"丝网、拼贴、壁画、粗网点和手工纸面",type:"仅按需使用准确政治或文化文字；保持用户原文可读"}, "美洲传统与地域视觉"),
  rule(/andean indigenismo/i, {period:"约1920–1950年代",year:1935,region:"安第斯地区",composition:"纪念性主体群、山地环境层级与稳定三角或横向结构",form:"坚实体积、粗壮轮廓和现代主义简化",color:"土红、赭黄、靛蓝、深绿与综合色肤色",lighting:"高原强日光、清楚体积阴影与冷暖空气层次",material:"油彩、壁画或版画的粗重笔触和土质综合色"}, "美洲传统与地域视觉")
];

const mergedAliases = new Map(Object.entries({
  "Brutalist Architecture": "architectural-brutalism",
  "Wabi-Sabi Interior": "wabi-sabi",
  "Mid-Century Modern Interior": "mid-century-modern",
  "Maximalist Interior": "maximalism",
  "Neo-Futurist Architecture": "neo-futurism",
  "Vaporwave Fashion": "vaporwave",
  "Psychedelic Poster Design": "psychedelic-art",
  "Post-Internet Aesthetic": "post-internet-art"
}));
const categoryByTrack = Object.freeze({
  "古代与古典视觉": "艺术史流派",
  "欧洲艺术运动": "艺术史流派",
  "现代与当代艺术": "艺术史流派",
  "平面设计与传播视觉": "平面与流行视觉",
  "建筑与空间视觉": "设计与建筑",
  "东亚视觉传统": "地域与传统",
  "南亚与东南亚视觉": "地域与传统",
  "西亚与伊斯兰视觉": "地域与传统",
  "非洲与大洋洲视觉": "地域与传统",
  "美洲传统与地域视觉": "地域与传统",
  "摄影、电影与印刷语言": "平面与流行视觉",
  "时尚与亚文化视觉": "平面与流行视觉",
  "数字推想与网络审美": "数字与界面",
  "可转译工艺视觉系统": "设计与建筑"
});
const generatedIds = new Set();
const publishableSource = source.filter((candidate) => !mergedAliases.has(candidate.nameEn));
const entries = publishableSource.map((candidate, index) => createStyle(candidate, index));
const ids = new Set();
for (const entry of entries) {
  if (ids.has(entry.id)) throw new Error(`Duplicate expansion id: ${entry.id}`);
  ids.add(entry.id);
  if (entry.visualGenes.length !== 6) throw new Error(`${entry.id}: expected six visual genes`);
  if (new Set(entry.visualGenes.map((gene) => gene.zh)).size !== 6) throw new Error(`${entry.id}: duplicate visual genes`);
}

const output = `// Generated by scripts/generate-expansion-data.mjs. Edit the generator rules or expansion-candidates.json, then regenerate.\n` +
`const STYLE_EXPANSION_DATA = ${JSON.stringify(entries, null, 2)};\n\n` +
`STYLE_DATA.push(...STYLE_EXPANSION_DATA);\n\n` +
`for (const style of STYLE_EXPANSION_DATA) {\n` +
`  const category = STYLE_CATEGORY_GROUPS.find((group) => group.name === style.type);\n` +
`  if (category && !category.ids.includes(style.id)) category.ids.push(style.id);\n` +
`}\n\n` +
`FILTER_GROUPS.type = STYLE_CATEGORY_GROUPS.map((group) => group.name);\n` +
`FILTER_GROUPS.region = [...new Set(STYLE_DATA.map((style) => style.region))];\n` +
`FILTER_GROUPS.traits = [...new Set(STYLE_DATA.flatMap((style) => style.traits))];\n` +
`FILTER_GROUPS.fields = [...new Set(STYLE_DATA.flatMap((style) => style.fields))];\n`;

if (checkOnly) {
  const existing = await readFile(outputPath, "utf8").catch(() => "");
  if (existing !== output) {
    console.error("data-expansion.js is stale");
    process.exitCode = 1;
  } else {
    console.log(`Validated ${entries.length} generated expansion styles`);
  }
} else {
  await writeFile(outputPath, output);
  console.log(`Generated ${entries.length} expansion styles`);
}

function createStyle(candidate, index) {
  const baseProfile = structuredClone(bases[candidate.track]);
  if (!baseProfile) throw new Error(`Unknown track: ${candidate.track}`);
  for (const { pattern, values, track } of rules) {
    if ((!track || track === candidate.track) && pattern.test(`${candidate.nameEn} ${candidate.nameZh}`)) apply(baseProfile, values);
  }
  const id = uniqueSlug(candidate.nameEn);
  const visualGenes = ["composition", "form", "color", "lighting", "material", "type"].map((key) => {
    const value = baseProfile.visual[key];
    return { zh: value.zh, en: value.en };
  });
  const recognition = visualGenes.slice(0, 5).map((gene) => gene.zh).join("；") + "。";
  const summary = `${candidate.nameZh}以${visualGenes[0].zh}、${visualGenes[1].zh}和${visualGenes[4].zh}建立可跨主体迁移的视觉语言。`;
  return {
    id,
    nameZh: candidate.nameZh,
    nameEn: candidate.nameEn,
    type: categoryByTrack[candidate.track],
    period: baseProfile.period,
    year: baseProfile.year + (index % 7),
    region: baseProfile.region,
    track: candidate.track,
    summary,
    recognition,
    traits: baseProfile.traits,
    fields: baseProfile.fields,
    related: [baseProfile.artworkRef],
    palette: baseProfile.palette,
    artworkRef: baseProfile.artworkRef,
    coreGeneKeys: baseProfile.coreKeys,
    subjectBoundary: "只迁移构图、形态、色彩、光影、材质与版式；不自动添加该传统的固定主体、宗教符号、器物或场景。",
    influencedBy: `${candidate.nameZh}的历史语境、构成原则与传统媒介`,
    influenced: `${baseProfile.fields.join("、")}中的当代视觉转译`,
    genes: {
      composition: [visualGenes[0].zh],
      form: [visualGenes[1].zh],
      color: [visualGenes[2].zh],
      type: [visualGenes[5].zh],
      texture: [visualGenes[4].zh]
    },
    visualGenes,
    art: "abstract"
  };
}

function apply(profile, values) {
  for (const [key, value] of Object.entries(values)) {
    if (["composition", "form", "color", "lighting", "material", "type"].includes(key)) {
      profile.visual[key] = typeof value === "string" ? pair(value, profile.visual[key].en) : value;
    } else {
      profile[key] = value;
    }
  }
}

function uniqueSlug(name) {
  const baseId = name.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  let id = baseId || "expanded-style";
  let suffix = 2;
  while (generatedIds.has(id)) id = `${baseId}-${suffix++}`;
  generatedIds.add(id);
  return id;
}

function base(label, period, year, region, type, traits, fields, palette, artworkRef, visual) {
  const coreKeysByType = {
    "历史艺术": ["compositionSpace", "formGeometry", "materialTexture"],
    "艺术运动": ["compositionSpace", "formGeometry", "colorTone"],
    "当代艺术": ["compositionSpace", "formGeometry", "materialTexture"],
    "设计风格": ["compositionSpace", "formGeometry", "typographyLayout"],
    "建筑风格": ["compositionSpace", "formGeometry", "materialTexture"],
    "地域传统": ["compositionSpace", "formGeometry", "materialTexture"],
    "影像风格": ["compositionSpace", "lightingImaging", "materialTexture"],
    "亚文化风格": ["formGeometry", "colorTone", "materialTexture"],
    "数字审美": ["compositionSpace", "formGeometry", "materialTexture"],
    "工艺视觉": ["compositionSpace", "formGeometry", "materialTexture"]
  };
  return { label, period, year, region, type, traits, fields, palette, artworkRef, visual, coreKeys: coreKeysByType[type] };
}
function rule(pattern, values, track = "") { return { pattern, values, track }; }
function pair(zh, en) { return { zh, en }; }

function painterly() { return {
  composition:pair("围绕主要视觉动作组织构图与空间节奏","composition organized around a primary visual action and spatial rhythm"),
  form:pair("以流派特有的轮廓、笔触和形体变形处理用户主体","translate the supplied subject through the movement's distinctive contours, marks, and formal distortions"),
  color:pair("受控综合色与流派特有的色彩对比","controlled mixed color with contrasts characteristic of the movement"),
  lighting:pair("以画面明度和色温组织光感，避免通用电影光","organize light through pictorial value and temperature rather than generic cinematic lighting"),
  material:pair("保留颜料、画布和手工笔触的可见过程","retain visible processes of pigment, support, and handmade marks"),
  type:pair("仅按需使用与画面形态一致的展示字体","display typography aligned with the formal language only when requested")
}; }
function contemporary(){const v=painterly();v.composition=pair("开放结构、材料关系与观看路径共同组织画面","open structures, material relations, and viewing paths organize the image");v.material=pair("材料本体、制作痕迹与当代展示表面并置","juxtapose material presence, process traces, and contemporary display surfaces");return v;}
function graphic(){return {composition:pair("明确网格、层级、留白与阅读顺序","a clear grid, hierarchy, negative space, and reading order"),form:pair("硬边图形、模块比例与受控尺度对比","hard-edged graphics, modular proportions, and controlled scale contrast"),color:pair("有限主色、纸白或屏幕底色与高识别强调色","a limited primary palette, paper or screen ground, and a high-recognition accent"),lighting:pair("平面印刷或屏幕光，不以写实投影塑形","flat print or screen light without realistic cast-shadow modeling"),material:pair("印刷网点、纸张颗粒或清晰数字边缘","print halftones, paper grain, or crisp digital edges"),type:pair("字体、字级、基线和段落宽度形成可读系统","typeface, scale, baselines, and measure form a readable system")};}
function architecture(){return {composition:pair("体量层级、结构网格、动线与负空间共同组织空间","massing hierarchy, structural grids, circulation, and negative space organize the scene"),form:pair("以明确构件、连接节点和比例关系塑造用户对象","translate the supplied objects through legible components, joints, and proportional relations"),color:pair("材料本色、中性色与少量功能强调色","material colors, neutrals, and restrained functional accents"),lighting:pair("自然或分析性照明突出体量、开口和结构深度","natural or analytical light revealing mass, openings, and structural depth"),material:pair("真实建材接缝、表面粗细与结构逻辑","credible construction joints, surface grain, and structural logic"),type:pair("仅按需使用建筑标识式清晰字体","clear architectural-signage typography only when requested")};}
function eastAsian(){return {composition:pair("散点或浅层空间、疏密节奏与主动留白","scattered or shallow space, density rhythm, and intentional negative space"),form:pair("书写性轮廓、线宽变化与概括形体","calligraphic contours, line-weight variation, and simplified forms"),color:pair("纸绢底色、墨色与克制矿物强调色","paper or silk ground, ink tones, and restrained mineral accents"),lighting:pair("均匀柔光，以墨色和色层而非写实投影塑形","even soft light with form modeled by ink and color layers rather than cast shadows"),material:pair("纸绢纤维、墨色渗化与薄层矿物颜料","paper or silk fiber, ink diffusion, and thin mineral pigment layers"),type:pair("仅按需使用与画面节奏一致的书写或刻本字形","calligraphic or block-print type aligned with the image rhythm only when requested")};}
function ornamental(){return {composition:pair("中心、边带、连续纹样与叙事分区形成多层秩序","central fields, borders, repeating patterns, and narrative registers form layered order"),form:pair("精细轮廓、扁平色区与重复装饰节奏","fine contours, flat color cells, and repeating ornamental rhythm"),color:pair("宝石色、土色、金色与深色轮廓并置","jewel tones, earth colors, gold, and dark contours"),lighting:pair("均匀平面光与小面积金属或釉面反光","even flat light with small metallic or glazed highlights"),material:pair("手绘颜料、纤维、金属或陶面细节","hand-painted pigment, fiber, metal, or ceramic detail"),type:pair("仅按需使用与边饰结构一致的可读文字","legible lettering aligned with border structures only when requested")};}
function islamic(){const v=ornamental();v.composition=pair("几何网格、放射对称、连续边带与可延展重复","geometric grids, radial symmetry, continuous borders, and extensible repetition");v.form=pair("多边形、交织曲线与精确拼接节点","polygons, interlaced curves, and precise joining nodes");return v;}
function textile(){return {composition:pair("经纬网格、重复单元、边带与疏密节奏","warp-weft grids, repeat units, borders, and density rhythm"),form:pair("硬边或纤维化轮廓、模块拼接与图形化平面","hard or fibrous contours, modular joins, and graphic flat shapes"),color:pair("高识别染色色块、材料本色与深色分隔","high-recognition dyed blocks, material color, and dark separators"),lighting:pair("均匀织物光与轻微起伏阴影","even textile light with subtle relief shadows"),material:pair("可见纤维、编织接缝、染色渗化与手工偏差","visible fibers, woven joins, dye bleed, and handmade variation"),type:pair("仅按需使用与织纹节奏一致的清晰字体","clear typography aligned with textile rhythm only when requested")};}
function imaging(){return {composition:pair("镜头位置、裁切、景深与画外空间共同组织画面","camera position, cropping, depth of field, and off-screen space organize the frame"),form:pair("透视、运动、焦点与成像边缘共同定义形体","perspective, motion, focus, and imaging edges define form"),color:pair("受控胶片或印刷色域与明确黑白层次","a controlled film or print gamut with legible tonal hierarchy"),lighting:pair("具有方向和叙事作用的现场光、影调与曝光","motivated practical light, tonal structure, and exposure with narrative purpose"),material:pair("胶片颗粒、感光乳剂、网点或印刷纸面","film grain, photosensitive emulsion, halftones, or printed paper"),type:pair("仅按需使用与时代影像一致的字幕或印刷字体","period-consistent subtitle or print typography only when requested")};}
function fashion(){return {composition:pair("单一造型焦点、全身轮廓与配件层级","a single styling focus, full silhouette, and accessory hierarchy"),form:pair("通过廓形、层搭、比例和边缘细节改变视觉气质","shift visual character through silhouette, layering, proportion, and edge detail"),color:pair("亚文化标志色、基础中性色与受控强调色","subcultural signature colors, base neutrals, and controlled accents"),lighting:pair("编辑式定向光或现场闪光，保持服装结构可读","editorial directional light or practical flash while keeping garment structure legible"),material:pair("可辨识织物、皮革、金属配件与真实接缝","legible textiles, leather, metal hardware, and credible seams"),type:pair("仅按需使用与亚文化出版物一致的标题字体","headline typography aligned with subcultural publishing only when requested")};}
function digital(){return {composition:pair("屏幕网格、界面层级、数字留白与模块叠加","screen grids, interface hierarchy, digital negative space, and modular overlays"),form:pair("硬边数字形、程序化曲线与受控失真","hard-edged digital forms, procedural curves, and controlled distortion"),color:pair("屏幕黑、冷色主调与高纯度电子强调色","screen black, cool dominant tones, and saturated electronic accents"),lighting:pair("屏幕自发光、轮廓辉光与受控反射","screen emission, contour glow, and controlled reflections"),material:pair("像素、扫描、压缩、三维采样或合成表面","pixels, scans, compression, 3D sampling, or synthetic surfaces"),type:pair("仅按需使用等宽、界面或时代一致的数字字体","monospaced, interface, or period-consistent digital type only when requested")};}
function craft(){return {composition:pair("材料分区、重复工序、接缝与手工节奏","material divisions, repeated operations, joins, and handmade rhythm"),form:pair("由工艺约束形成的闭合轮廓、模块和边缘变化","closed contours, modules, and edge variation shaped by craft constraints"),color:pair("材料本色、传统染釉色与克制强调色","material colors, traditional dyes or glazes, and restrained accents"),lighting:pair("斜侧光或柔和漫射光显示表面深浅与反光差","grazing or diffuse light revealing relief and reflectance differences"),material:pair("可见纤维、釉层、金属、纸木或镶嵌接缝","visible fibers, glaze, metal, paper, wood, or inlay joins"),type:pair("仅按需使用不破坏工艺结构的清晰文字","clear lettering that does not disrupt the craft structure, only when requested")};}
function printmaking(){return {composition:"版面分区、套色关系与清楚正负形",form:"刻线、硬边色块与印压轮廓",color:"有限套色、纸张底色与高对比墨色",lighting:"平面印刷光，不使用写实投影",material:"网点、刻痕、套印偏差与纸纤维",type:"与印版工艺一致的标题字并保持原文可读"};}
