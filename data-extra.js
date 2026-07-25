const buildStyle = (entry) => ({
  ...entry,
  art: entry.art || "bauhaus",
  promptZh: entry.prompt.map(([zh]) => zh),
  promptEn: entry.prompt.map(([, en]) => en)
});

const EXTRA_STYLE_DATA = [
  buildStyle({
    id: "ancient-egyptian", nameZh: "古埃及艺术", nameEn: "Ancient Egyptian Art", type: "历史时期",
    period: "约前 3000–前 30 年", year: -1350, region: "北非", track: "全球地域传统",
    summary: "以永恒秩序、神圣权力与来世信仰为核心，用严格规范组织人物和叙事。",
    recognition: "人物侧面头腿与正面肩眼并置，横向分层叙事，赭石、蓝绿和金色鲜明。",
    traits: ["平面", "秩序", "象征", "高识别"], fields: ["绘画", "建筑", "装饰"],
    genes: { composition: ["横向分层", "等级比例", "正侧面复合视角"], form: ["轮廓明确", "程式化人体", "象形符号"], color: ["赭黄", "孔雀蓝", "矿物绿", "金色"], type: ["象形文字带", "图文同构"], texture: ["石灰岩壁画", "矿物颜料", "金箔"] },
    influencedBy: "尼罗河文明、王权制度与来世信仰", influenced: "希腊化埃及、装饰艺术与现代复古视觉",
    related: ["classical-greek", "art-deco"], palette: ["#c68b3c", "#17778b", "#263528"], art: "islamic",
    prompt: [["古埃及壁画语境", "ancient Egyptian mural language"], ["横向分层构图", "horizontal register composition"], ["正侧面复合人物", "composite-profile figures"], ["象形文字边饰", "hieroglyphic borders"], ["赭金与孔雀蓝", "ochre gold and peacock blue"], ["矿物颜料石壁质感", "mineral pigment on stone texture"]]
  }),
  buildStyle({
    id: "classical-greek", nameZh: "古希腊古典艺术", nameEn: "Classical Greek Art", type: "历史时期",
    period: "前 5–前 4 世纪", year: -450, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "以比例、均衡和理想人体探索理性秩序，将自然观察提炼为可复用的美学典范。",
    recognition: "对立式站姿、理想化人体、柱式比例和克制平衡的轮廓。",
    traits: ["写实", "对称", "理性", "克制"], fields: ["雕塑", "建筑", "装饰"],
    genes: { composition: ["中心稳定", "均衡比例", "清晰轮廓"], form: ["理想人体", "对立式站姿", "柱式结构"], color: ["大理石白", "陶土红", "青铜绿"], type: ["碑铭式大写字母", "几何比例"], texture: ["大理石", "青铜", "红黑陶"] },
    influencedBy: "爱琴文明、数学比例与城邦公共文化", influenced: "古罗马、文艺复兴、新古典主义与现代公共建筑",
    related: ["roman-art", "neoclassicism"], palette: ["#ded8c8", "#a3482e", "#4e776f"], art: "renaissance",
    prompt: [["古希腊古典美学", "Classical Greek aesthetic"], ["均衡中心构图", "balanced centered composition"], ["理想化人体比例", "idealized human proportion"], ["多立克柱式秩序", "Doric architectural order"], ["大理石白与陶土红", "marble white and terracotta red"], ["雕刻石材质感", "carved stone texture"]]
  }),
  buildStyle({
    id: "roman-art", nameZh: "古罗马艺术", nameEn: "Roman Art", type: "历史时期",
    period: "前 1 世纪–4 世纪", year: 100, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "将希腊形式与帝国工程、写实肖像和公共叙事结合，形成宏大而实用的视觉体系。",
    recognition: "拱券与穹顶、写实胸像、连续叙事浮雕以及鲜艳湿壁画空间。",
    traits: ["写实", "宏大", "秩序", "叙事"], fields: ["建筑", "雕塑", "绘画"],
    genes: { composition: ["轴线布局", "连续叙事", "透视性室内"], form: ["拱券穹顶", "写实肖像", "纪念碑尺度"], color: ["庞贝红", "石灰白", "青铜绿", "黑色"], type: ["罗马碑铭体", "全大写字距"], texture: ["马赛克", "湿壁画", "大理石"] },
    influencedBy: "古希腊、伊特鲁里亚文化与帝国工程", influenced: "拜占庭、文艺复兴、古典主义与公共建筑",
    related: ["classical-greek", "renaissance"], palette: ["#9c352c", "#d9cfb5", "#344f45"], art: "baroque",
    prompt: [["古罗马壁画语境", "ancient Roman fresco context"], ["轴线式空间", "axial spatial composition"], ["拱券与写实人物", "arches and realistic figures"], ["庞贝红主色", "Pompeian red palette"], ["碑铭式文字", "Roman inscription lettering"], ["湿壁画与马赛克质感", "fresco and mosaic texture"]]
  }),
  buildStyle({
    id: "byzantine", nameZh: "拜占庭艺术", nameEn: "Byzantine Art", type: "历史时期",
    period: "4–15 世纪", year: 900, region: "欧洲与西亚", track: "全球地域传统",
    summary: "通过正面圣像、金色非现实空间和马赛克光泽，传达超越尘世的宗教权威。",
    recognition: "正面凝视、扁平圣像、金色背景、细长人物与镶嵌式光芒。",
    traits: ["平面", "对称", "象征", "华丽"], fields: ["绘画", "建筑", "装饰"],
    genes: { composition: ["正面中心", "等级对称", "无透视金色空间"], form: ["细长圣像", "杏仁形光环", "轮廓化衣褶"], color: ["金色", "群青", "紫红", "象牙白"], type: ["希腊文碑铭", "宗教符号"], texture: ["玻璃马赛克", "蛋彩木板", "金箔"] },
    influencedBy: "晚期罗马、东方基督教与宫廷礼仪", influenced: "东正教圣像、哥特艺术与俄罗斯宗教视觉",
    related: ["gothic", "roman-art"], palette: ["#c9a13a", "#204b78", "#763e59"], art: "islamic",
    prompt: [["拜占庭圣像艺术", "Byzantine icon art"], ["庄严正面对称", "solemn frontal symmetry"], ["细长轮廓人物", "elongated outlined figures"], ["金色非现实背景", "otherworldly gold background"], ["群青与紫红", "ultramarine and imperial purple"], ["玻璃马赛克金箔质感", "glass mosaic and gold leaf texture"]]
  }),
  buildStyle({
    id: "gothic", nameZh: "哥特艺术", nameEn: "Gothic Art", type: "历史时期",
    period: "12–15 世纪", year: 1250, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "以垂直性、尖拱结构和有色光线塑造通向神圣世界的空间体验。",
    recognition: "尖拱、玫瑰窗、纤细垂直线、彩色玻璃与密集叙事细节。",
    traits: ["垂直", "装饰", "叙事", "神秘"], fields: ["建筑", "绘画", "书籍"],
    genes: { composition: ["强烈垂直轴", "分格叙事", "中心玫瑰窗"], form: ["尖拱", "肋拱", "细长人物"], color: ["宝石蓝", "深红", "金色", "石灰灰"], type: ["黑体手写体", "装饰首字母"], texture: ["彩色玻璃", "石雕", "羊皮纸"] },
    influencedBy: "罗马式建筑、经院哲学与城市教会", influenced: "国际哥特、浪漫主义哥特复兴与暗黑美学",
    related: ["byzantine", "romanticism"], palette: ["#173e67", "#8d2734", "#c49c41"], art: "baroque",
    prompt: [["哥特式视觉语言", "Gothic visual language"], ["高耸垂直构图", "soaring vertical composition"], ["尖拱与玫瑰窗", "pointed arches and rose window"], ["宝石蓝深红光线", "jewel-blue and crimson light"], ["装饰手抄文字", "illuminated manuscript lettering"], ["彩色玻璃与石雕质感", "stained glass and carved stone texture"]]
  }),
  buildStyle({
    id: "mughal-miniature", nameZh: "莫卧儿细密画", nameEn: "Mughal Miniature", type: "地域传统",
    period: "16–19 世纪", year: 1600, region: "南亚", track: "全球地域传统",
    summary: "融合波斯细密画、印度色彩与欧洲观察法，以精微笔触记录宫廷、自然和史诗。",
    recognition: "俯视园林、精细人物群像、花卉边框、矿物色和金粉细节。",
    traits: ["精密", "满版", "叙事", "装饰"], fields: ["绘画", "书籍", "装饰"],
    genes: { composition: ["多层俯视", "散点叙事", "装饰边框"], form: ["细密轮廓", "侧面人物", "植物与织物纹样"], color: ["孔雀蓝", "朱红", "翡翠绿", "金色"], type: ["波斯书法题记", "图文边框"], texture: ["矿物颜料", "金粉", "手工纸"] },
    influencedBy: "波斯细密画、印度宫廷文化与欧洲版画", influenced: "拉贾斯坦绘画、殖民时期插图与当代南亚视觉",
    related: ["islamic-geometry", "ink-wash"], palette: ["#2c6591", "#b34231", "#38805b"], art: "islamic",
    prompt: [["莫卧儿细密画", "Mughal miniature painting"], ["多层俯视叙事", "layered bird's-eye narrative"], ["精微人物与花卉边框", "finely drawn figures and floral border"], ["孔雀蓝朱红与金色", "peacock blue vermilion and gold"], ["波斯书法题记", "Persian calligraphic inscription"], ["矿物颜料金粉纸本", "mineral pigment and gold on paper"]]
  }),
  buildStyle({
    id: "african-traditional", nameZh: "西非传统雕刻", nameEn: "West African Traditional Sculpture", type: "地域传统",
    period: "15–20 世纪", year: 1750, region: "非洲", track: "全球地域传统",
    summary: "以仪式功能、祖先记忆和抽象化人体建立具有精神效力的物质形象。",
    recognition: "夸张头部、几何化面孔、正面姿态、木质刀痕与象征纹样。",
    traits: ["几何", "象征", "有机", "强对比"], fields: ["雕塑", "装饰", "表演"],
    genes: { composition: ["强正面性", "垂直轴线", "部位节奏重复"], form: ["面部几何化", "夸张比例", "镂空与凸起纹样"], color: ["炭黑", "木棕", "白土", "赤红"], type: ["符号性刻纹", "无独立文字"], texture: ["手凿木纹", "金属包覆", "纤维与珠饰"] },
    influencedBy: "地方宗教、祖先崇拜与工匠传统", influenced: "立体主义、表现主义与现代雕塑",
    related: ["cubism", "expressionism"], palette: ["#2b211b", "#8b5134", "#ddd0b1"], art: "surrealism",
    prompt: [["西非传统雕刻语言", "West African sculptural language"], ["正面垂直构图", "frontal vertical composition"], ["几何化面具轮廓", "geometric mask-like forms"], ["炭黑木棕与白土", "charcoal black wood brown and kaolin white"], ["象征刻纹", "symbolic incised pattern"], ["手凿木材与纤维质感", "hand-carved wood and fiber texture"]]
  }),
  buildStyle({
    id: "mannerism", nameZh: "矫饰主义", nameEn: "Mannerism", type: "艺术运动",
    period: "约 1520–1600 年", year: 1550, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "有意拉伸古典规范，以复杂姿态、反自然色彩和不稳定空间追求优雅张力。",
    recognition: "细长人体、蛇形姿态、拥挤空间、冷艳肤色和刻意的不自然比例。",
    traits: ["写实", "动态", "低饱和", "戏剧"], fields: ["绘画", "雕塑", "建筑"],
    genes: { composition: ["不稳定纵深", "偏心重心", "拥挤人物"], form: ["拉长人体", "蛇形姿态", "精致手势"], color: ["冷粉", "酸绿", "银蓝", "紫红"], type: ["优雅衬线", "细长比例"], texture: ["光滑油彩", "抛光大理石"] },
    influencedBy: "盛期文艺复兴与宫廷审美", influenced: "巴洛克、超现实主义与时尚摄影",
    related: ["renaissance", "baroque"], palette: ["#c78f9d", "#8ea78b", "#6d7893"], art: "renaissance",
    prompt: [["矫饰主义绘画", "Mannerist painting"], ["不稳定偏心构图", "unstable off-center composition"], ["拉长人体与蛇形姿态", "elongated figures and serpentine poses"], ["冷粉酸绿银蓝", "cool pink acid green and silver blue"], ["宫廷式精致", "courtly refinement"], ["光滑油画薄涂", "smooth glazed oil texture"]]
  }),
  buildStyle({
    id: "rococo", nameZh: "洛可可", nameEn: "Rococo", type: "艺术运动",
    period: "18 世纪上半叶", year: 1730, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "以轻盈曲线、粉彩和亲密享乐场景取代巴洛克的宏大权威。",
    recognition: "贝壳曲线、粉蓝粉红、金色雕花、轻盈庭园和丝绸般笔触。",
    traits: ["有机", "不对称", "低饱和", "华丽"], fields: ["绘画", "建筑", "产品"],
    genes: { composition: ["轻盈对角线", "非对称涡卷", "亲密舞台"], form: ["贝壳曲线", "花叶纹", "柔软人物"], color: ["粉蓝", "粉红", "奶白", "浅金"], type: ["花体衬线", "装饰连字"], texture: ["丝绸", "瓷器", "镀金木雕"] },
    influencedBy: "晚期巴洛克与法国宫廷文化", influenced: "新古典主义的反拨、时尚插画与甜美复古视觉",
    related: ["baroque", "neoclassicism"], palette: ["#a8c8d8", "#dfadb9", "#d7bb78"], art: "baroque",
    prompt: [["洛可可装饰美学", "Rococo decorative aesthetic"], ["轻盈非对称构图", "light asymmetrical composition"], ["贝壳曲线与花叶纹", "rocaille curves and floral scrolls"], ["粉蓝粉红浅金", "powder blue blush pink and pale gold"], ["优雅花体标题", "elegant flourished lettering"], ["丝绸瓷器与镀金质感", "silk porcelain and gilded texture"]]
  }),
  buildStyle({
    id: "neoclassicism", nameZh: "新古典主义", nameEn: "Neoclassicism", type: "艺术运动",
    period: "约 1760–1830 年", year: 1780, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "以考古发现和启蒙理性重新激活古典秩序，强调公共美德、清晰轮廓与克制情感。",
    recognition: "浅浮雕式人物排列、清晰线描、古典柱式、石材色与道德叙事。",
    traits: ["理性", "对称", "写实", "克制"], fields: ["绘画", "建筑", "产品"],
    genes: { composition: ["浅景深舞台", "稳定三组式", "轴线对称"], form: ["雕塑般人体", "清晰轮廓", "古典柱式"], color: ["石灰白", "庞贝红", "深绿", "黑色"], type: ["罗马碑铭体", "高对比衬线"], texture: ["抛光大理石", "平滑油画"] },
    influencedBy: "古希腊罗马考古、启蒙思想与学院制度", influenced: "帝政风格、公共纪念建筑与现代古典品牌",
    related: ["classical-greek", "romanticism"], palette: ["#d7d0bd", "#8f3029", "#263e35"], art: "renaissance",
    prompt: [["新古典主义语境", "Neoclassical visual language"], ["稳定轴线构图", "stable axial composition"], ["雕塑般人物与柱式", "sculptural figures and classical columns"], ["石灰白庞贝红", "limestone white and Pompeian red"], ["碑铭式衬线字体", "inscriptional serif typography"], ["抛光大理石与平滑油彩", "polished marble and smooth oil finish"]]
  }),
  buildStyle({
    id: "romanticism", nameZh: "浪漫主义", nameEn: "Romanticism", type: "艺术运动",
    period: "约 1790–1850 年", year: 1820, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "以崇高自然、个体情感和历史想象回应工业化与理性秩序。",
    recognition: "微小人物面对巨大自然、风暴光线、对角运动和强烈情绪。",
    traits: ["写实", "动态", "戏剧", "自然"], fields: ["绘画", "文学", "插画"],
    genes: { composition: ["人物与自然尺度反差", "漩涡或对角运动", "远景深度"], form: ["风云与山海", "奔放姿态", "废墟轮廓"], color: ["深蓝灰", "夕阳金", "土褐", "雾白"], type: ["文学性衬线", "手写标题"], texture: ["透明罩染", "风云笔触", "颗粒纸张"] },
    influencedBy: "启蒙反思、民族主义与自然哲学", influenced: "象征主义、表现主义、电影奇观与幻想艺术",
    related: ["neoclassicism", "symbolism"], palette: ["#34485a", "#d19b52", "#5a4436"], art: "baroque",
    prompt: [["浪漫主义崇高感", "Romantic sublime"], ["人物与自然尺度反差", "dramatic human-to-nature scale contrast"], ["风暴般对角运动", "storm-driven diagonal movement"], ["深蓝灰与夕阳金", "deep blue-gray and sunset gold"], ["文学性叙事", "literary narrative mood"], ["透明油彩与大气雾感", "glazed oil paint and atmospheric haze"]]
  }),
  buildStyle({
    id: "realism", nameZh: "现实主义", nameEn: "Realism", type: "艺术运动",
    period: "约 1840–1880 年", year: 1855, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "拒绝神话理想化，将劳动者、城市生活和日常现场置于严肃艺术中心。",
    recognition: "平视普通人物、土色调、扎实重量感和不加美化的现实细节。",
    traits: ["写实", "低饱和", "叙事", "克制"], fields: ["绘画", "摄影", "插画"],
    genes: { composition: ["平视视角", "横向群像", "现场式裁切"], form: ["真实体态", "劳动动作", "具体环境"], color: ["土褐", "灰绿", "铅白", "暗红"], type: ["朴素衬线", "报刊式标题"], texture: ["厚实油彩", "粗布与泥土"] },
    influencedBy: "社会变革、新闻观察与学院艺术反拨", influenced: "自然主义、社会纪实摄影与电影现实主义",
    related: ["romanticism", "impressionism"], palette: ["#6c5942", "#66705c", "#bfb59f"], art: "renaissance",
    prompt: [["现实主义绘画", "Realist painting"], ["平视现场构图", "eye-level observational composition"], ["未经美化的普通人物", "unidealized everyday figures"], ["土褐灰绿低饱和", "earth brown and gray-green palette"], ["社会纪实语气", "social documentary tone"], ["厚实油彩与粗糙材质", "substantial oil paint and rough material texture"]]
  }),
  buildStyle({
    id: "pre-raphaelite", nameZh: "前拉斐尔派", nameEn: "Pre-Raphaelite Brotherhood", type: "艺术运动",
    period: "1848–约 1900 年", year: 1850, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "以宝石般色彩、植物学细节和中世纪文学主题反对学院化的柔滑惯例。",
    recognition: "极清晰自然细节、苍白人物、浓密植物、强烈象征与宝石色。",
    traits: ["写实", "装饰", "高饱和", "叙事"], fields: ["绘画", "插画", "书籍"],
    genes: { composition: ["近景满幅", "植物包围人物", "象征细节散布"], form: ["精密轮廓", "中世纪服饰", "植物学写实"], color: ["翡翠绿", "朱红", "群青", "金色"], type: ["中世纪复兴字体", "装饰首字母"], texture: ["湿白底油画", "织物与花草细节"] },
    influencedBy: "中世纪艺术、早期文艺复兴与浪漫文学", influenced: "工艺美术、新艺术运动与幻想插画",
    related: ["arts-crafts", "art-nouveau"], palette: ["#2f6d4b", "#9d2f35", "#325d8a"], art: "nouveau",
    prompt: [["前拉斐尔派绘画", "Pre-Raphaelite painting"], ["近景植物包围构图", "close botanical enclosure"], ["精密人物与中世纪服饰", "finely rendered figures in medieval dress"], ["翡翠朱红群青", "emerald vermilion and ultramarine"], ["文学象征细节", "literary symbolic detail"], ["湿白底油画与织物质感", "luminous wet-ground oil and textile texture"]]
  }),
  buildStyle({
    id: "arts-crafts", nameZh: "工艺美术运动", nameEn: "Arts and Crafts Movement", type: "艺术与设计运动",
    period: "约 1860–1910 年", year: 1880, region: "欧洲", track: "商业与设计视觉",
    summary: "以诚实材料、手工劳动和整体设计回应工业化批量生产的审美贫乏。",
    recognition: "对称植物纹样、手工木作、中世纪字体、自然色和满版重复。",
    traits: ["有机", "满版", "装饰", "手工"], fields: ["书籍", "产品", "建筑"],
    genes: { composition: ["连续满版", "镜像对称", "图文一体"], form: ["扁平花叶", "藤蔓交织", "手工几何"], color: ["靛蓝", "茜红", "橄榄绿", "米白"], type: ["中世纪衬线", "手工木刻字"], texture: ["木版印刷", "织物", "天然木材"] },
    influencedBy: "中世纪工坊、哥特复兴与社会主义思想", influenced: "新艺术运动、现代书籍设计与可持续工艺",
    related: ["pre-raphaelite", "art-nouveau"], palette: ["#2f5161", "#913e3b", "#69704a"], art: "nouveau",
    prompt: [["工艺美术运动图案", "Arts and Crafts pattern design"], ["对称满版重复", "symmetrical all-over repeat"], ["扁平花叶与藤蔓", "flat botanical leaves and vines"], ["靛蓝茜红橄榄绿", "indigo madder red and olive green"], ["手工中世纪字体", "hand-crafted medieval lettering"], ["木版印刷与织物质感", "woodblock print and woven textile texture"]]
  }),
  buildStyle({
    id: "post-impressionism", nameZh: "后印象主义", nameEn: "Post-Impressionism", type: "艺术运动",
    period: "约 1886–1905 年", year: 1890, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "从印象主义的光色出发，转向更主观的情绪、结构、象征和个人笔触。",
    recognition: "强化轮廓、非自然高饱和色、旋转或块面笔触以及主观空间。",
    traits: ["高饱和", "有机", "动态", "表现"], fields: ["绘画", "插画"],
    genes: { composition: ["主观透视", "色块分区", "节奏化视线"], form: ["强化轮廓", "几何化体积", "旋转笔触"], color: ["钴蓝", "铬黄", "翠绿", "橙红"], type: ["手绘标题", "朴素展示体"], texture: ["厚涂油彩", "点彩与短笔触"] },
    influencedBy: "印象主义、日本版画与象征主义", influenced: "野兽派、表现主义、立体主义与现代插画",
    related: ["impressionism", "fauvism"], palette: ["#2d5a91", "#e0b72f", "#d86a36"], art: "impressionism",
    prompt: [["后印象主义绘画", "Post-Impressionist painting"], ["主观节奏构图", "subjective rhythmic composition"], ["强化轮廓与旋转笔触", "bold contours and swirling brushwork"], ["钴蓝铬黄橙红", "cobalt blue chrome yellow and orange-red"], ["情绪化空间", "emotionally charged space"], ["厚涂油彩肌理", "visible impasto oil texture"]]
  }),
  buildStyle({
    id: "symbolism", nameZh: "象征主义", nameEn: "Symbolism", type: "艺术运动",
    period: "约 1880–1910 年", year: 1895, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "用梦境、神话和私人符号替代直接再现，强调不可见的心理与精神世界。",
    recognition: "静止梦境、神秘人物、装饰性金色、隐喻物件和不确定叙事。",
    traits: ["象征", "低饱和", "神秘", "装饰"], fields: ["绘画", "插画", "海报"],
    genes: { composition: ["仪式化中心", "浅景深舞台", "符号环绕"], form: ["理想化人物", "神话生物", "装饰轮廓"], color: ["暗金", "夜蓝", "灰紫", "苍白肤色"], type: ["文学性衬线", "神秘手写体"], texture: ["金箔", "柔雾油彩", "蜡质表面"] },
    influencedBy: "浪漫主义、神秘学与现代心理探索", influenced: "新艺术运动、超现实主义、奇幻艺术与电影美术",
    related: ["romanticism", "surrealism"], palette: ["#ad8b43", "#263b56", "#67556f"], art: "surrealism",
    prompt: [["象征主义梦境", "Symbolist dream imagery"], ["仪式化中心构图", "ritualized centered composition"], ["神话人物与隐喻物件", "mythic figures and allegorical objects"], ["暗金夜蓝灰紫", "antique gold night blue and gray violet"], ["文学与神秘学气质", "literary occult atmosphere"], ["金箔与柔雾油彩", "gold leaf and hazy oil texture"]]
  }),
  buildStyle({
    id: "fauvism", nameZh: "野兽派", nameEn: "Fauvism", type: "艺术运动",
    period: "约 1905–1910 年", year: 1906, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "把色彩从再现对象中解放出来，以纯色冲突和直接笔触表达视觉能量。",
    recognition: "任意肤色、互补色强撞、简化轮廓、宽阔笔触和扁平空间。",
    traits: ["高饱和", "平面", "有机", "强对比"], fields: ["绘画", "插画", "海报"],
    genes: { composition: ["扁平色域", "近景裁切", "色彩平衡重于透视"], form: ["简化轮廓", "宽阔笔触", "变形人物"], color: ["朱红", "钴蓝", "翠绿", "柠黄"], type: ["手绘粗体", "自由字形"], texture: ["可见画布", "直接油彩笔触"] },
    influencedBy: "后印象主义、非洲艺术与纯色实验", influenced: "表现主义、现代彩色插画与品牌配色",
    related: ["post-impressionism", "expressionism"], palette: ["#d94332", "#245ca6", "#2e9064"], art: "impressionism",
    prompt: [["野兽派绘画", "Fauvist painting"], ["扁平近景色域", "flat close-cropped color fields"], ["简化轮廓与宽阔笔触", "simplified contours and broad brushwork"], ["朱红钴蓝翠绿强撞", "vermilion cobalt and emerald clash"], ["非自然主观色彩", "non-natural subjective color"], ["直接油彩画布肌理", "direct oil-on-canvas texture"]]
  }),
  buildStyle({
    id: "expressionism", nameZh: "表现主义", nameEn: "Expressionism", type: "艺术运动",
    period: "约 1905–1925 年", year: 1910, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "以变形、尖锐色彩和直接笔触把内在焦虑置于客观再现之上。",
    recognition: "扭曲人物、倾斜空间、刺目的非自然色和粗粝轮廓。",
    traits: ["表现", "动态", "强对比", "反叛"], fields: ["绘画", "版画", "电影"],
    genes: { composition: ["倾斜空间", "压迫式近景", "放射节奏"], form: ["扭曲人体", "尖角轮廓", "粗重线条"], color: ["酸黄", "血红", "深蓝", "黑色"], type: ["手刻粗体", "不规则字形"], texture: ["木刻刀痕", "干涩厚涂"] },
    influencedBy: "后印象主义、象征主义与非洲雕刻", influenced: "新表现主义、恐怖电影、朋克与情绪插画",
    related: ["fauvism", "neo-expressionism"], palette: ["#d4bd22", "#a52d32", "#263e67"], art: "impressionism",
    prompt: [["表现主义绘画", "Expressionist painting"], ["倾斜压迫构图", "tilted claustrophobic composition"], ["扭曲人物与尖锐轮廓", "distorted figures and jagged contours"], ["酸黄血红深蓝", "acid yellow blood red and deep blue"], ["强烈心理张力", "intense psychological tension"], ["木刻与干涩厚涂质感", "woodcut marks and dry impasto texture"]]
  }),
  buildStyle({
    id: "cubism", nameZh: "立体主义", nameEn: "Cubism", type: "艺术运动",
    period: "约 1907–1914 年", year: 1911, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "把对象拆解为多个同时视点的几何切面，重构二维画面的空间逻辑。",
    recognition: "碎裂切面、多重视角、浅空间、报纸拼贴和棕灰色调。",
    traits: ["几何", "平面", "低饱和", "理性"], fields: ["绘画", "雕塑", "平面"],
    genes: { composition: ["中心聚合", "切面互锁", "浅层空间"], form: ["几何碎片", "多视点对象", "字母拼贴"], color: ["赭石", "灰褐", "墨黑", "橄榄绿"], type: ["报纸衬线", "模板字母"], texture: ["拼贴纸张", "沙粒油彩", "木纹"] },
    influencedBy: "塞尚、非洲雕刻与摄影视角", influenced: "未来主义、构成主义、装饰艺术与现代平面拼贴",
    related: ["african-traditional", "futurism"], palette: ["#8b765a", "#655f55", "#24221f"], art: "constructivism",
    prompt: [["分析立体主义", "Analytical Cubism"], ["中心切面互锁构图", "central interlocking faceted composition"], ["多视点几何碎片", "multi-view geometric fragments"], ["赭石灰褐墨黑", "ochre gray-brown and black"], ["报纸字母拼贴", "newspaper letter collage"], ["纸张木纹与沙粒油彩", "paper woodgrain and gritty oil texture"]]
  }),
  buildStyle({
    id: "futurism", nameZh: "未来主义", nameEn: "Futurism", type: "艺术运动",
    period: "约 1909–1916 年", year: 1912, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "歌颂速度、机械和都市能量，用重复轮廓与力线表现连续运动。",
    recognition: "放射力线、重复肢体、机械切面、强烈对角线和速度残影。",
    traits: ["动态", "几何", "未来", "强对比"], fields: ["绘画", "雕塑", "海报"],
    genes: { composition: ["放射对角线", "连续运动叠影", "向前冲击"], form: ["机械切面", "重复轮廓", "速度线"], color: ["钢灰", "电蓝", "橙红", "黑色"], type: ["斜体粗字", "爆发式排版"], texture: ["金属光泽", "粗颗粒印刷"] },
    influencedBy: "立体主义、工业城市与摄影运动研究", influenced: "构成主义、动态摄影、科幻海报与运动品牌",
    related: ["cubism", "constructivism"], palette: ["#5b6670", "#287c9e", "#cf4b31"], art: "constructivism",
    prompt: [["意大利未来主义", "Italian Futurism"], ["放射对角线构图", "radiating diagonal composition"], ["机械切面与速度残影", "mechanical facets and motion trails"], ["钢灰电蓝橙红", "steel gray electric blue and orange-red"], ["斜体爆发式排版", "italic explosive typography"], ["金属与粗颗粒印刷", "metallic and coarse print texture"]]
  }),
  buildStyle({
    id: "dada", nameZh: "达达主义", nameEn: "Dada", type: "艺术运动",
    period: "约 1916–1924 年", year: 1918, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "以荒诞、偶然和挪用反对战争与艺术权威，把日常材料变成观念挑衅。",
    recognition: "随机字阶、剪报拼贴、现成品、黑白照片和故意失序的版面。",
    traits: ["反叛", "不对称", "拼贴", "强对比"], fields: ["平面", "表演", "雕塑"],
    genes: { composition: ["随机散布", "尺度突变", "反网格碰撞"], form: ["剪报碎片", "现成物", "机械人物"], color: ["黑白", "报纸灰", "单一红色"], type: ["混合字体", "旋转文字", "打字机字"], texture: ["撕纸", "旧报纸", "胶痕"] },
    influencedBy: "战争创伤、未来主义与先锋诗歌", influenced: "超现实主义、朋克设计、观念艺术与后现代拼贴",
    related: ["surrealism", "conceptual-art"], palette: ["#171715", "#dedbd1", "#c8382b"], art: "constructivism",
    prompt: [["达达主义拼贴", "Dada photomontage"], ["故意失序反网格", "deliberately disordered anti-grid"], ["剪报照片与现成物", "newspaper cutouts and found objects"], ["黑白灰配单一红", "black white gray with one red accent"], ["混合字号旋转排版", "mixed-scale rotated typography"], ["撕纸胶痕旧报质感", "torn paper glue marks and aged newsprint"]]
  }),
  buildStyle({
    id: "suprematism", nameZh: "至上主义", nameEn: "Suprematism", type: "艺术运动",
    period: "约 1915–1930 年", year: 1915, region: "欧洲", track: "欧洲艺术与现代主义",
    summary: "以纯粹几何形和无限白场摆脱对象再现，追求非客观感觉的最高状态。",
    recognition: "漂浮方形、圆与十字，大面积白场，有限原色和无重力感。",
    traits: ["几何", "留白", "平面", "理性"], fields: ["绘画", "平面", "产品"],
    genes: { composition: ["白场漂浮", "非对称平衡", "无重力旋转"], form: ["方形", "圆形", "十字与直线"], color: ["黑色", "白色", "红色", "少量蓝黄"], type: ["极少文字", "几何无衬线"], texture: ["平涂油彩", "画布细纹"] },
    influencedBy: "立体主义、未来主义与俄罗斯先锋", influenced: "构成主义、包豪斯、极简主义与抽象平面设计",
    related: ["constructivism", "minimalism"], palette: ["#151513", "#f2f0e8", "#c9382c"], art: "bauhaus",
    prompt: [["至上主义抽象", "Suprematist abstraction"], ["无限白场非对称平衡", "asymmetric balance in an infinite white field"], ["漂浮方圆十字", "floating squares circles and crosses"], ["黑白红有限原色", "black white red limited primaries"], ["几乎无文字", "near-absence of typography"], ["平涂油彩画布细纹", "flat oil paint on subtly textured canvas"]]
  }),
  buildStyle({
    id: "de-stijl", nameZh: "风格派", nameEn: "De Stijl", type: "艺术与设计运动",
    period: "1917–1931 年", year: 1921, region: "欧洲", track: "商业与设计视觉",
    summary: "用水平垂直、矩形和原色建立跨绘画、建筑与家具的普遍视觉秩序。",
    recognition: "黑色正交网格、不等矩形、红黄蓝原色和纯白空间。",
    traits: ["几何", "网格", "平面", "理性"], fields: ["绘画", "建筑", "产品"],
    genes: { composition: ["非对称正交网格", "边缘延伸", "矩形比例"], form: ["水平垂直线", "矩形色块", "去具象化"], color: ["红", "黄", "蓝", "黑白"], type: ["几何无衬线", "正交排版"], texture: ["平涂色面", "漆面木材"] },
    influencedBy: "立体主义、神智学与抽象秩序", influenced: "包豪斯、国际主义建筑、网格系统与现代品牌",
    related: ["bauhaus", "swiss"], palette: ["#d33c31", "#e4c936", "#285a9d"], art: "bauhaus",
    prompt: [["风格派设计语言", "De Stijl design language"], ["非对称正交网格", "asymmetric orthogonal grid"], ["矩形与水平垂直线", "rectangles with horizontal and vertical lines"], ["红黄蓝黑白", "red yellow blue black and white"], ["几何无衬线排版", "geometric sans-serif typography"], ["纯净平涂漆面", "clean flat painted finish"]]
  }),
  buildStyle({
    id: "art-deco", nameZh: "装饰艺术", nameEn: "Art Deco", type: "艺术与设计运动",
    period: "约 1920–1940 年", year: 1925, region: "欧美", track: "商业与设计视觉",
    summary: "以流线几何、奢华材料和机器时代意象塑造现代都市的精致乐观。",
    recognition: "阶梯轮廓、放射日芒、黑金对比、重复扇形和高耸对称。",
    traits: ["几何", "对称", "强对比", "华丽"], fields: ["建筑", "海报", "产品"],
    genes: { composition: ["轴线对称", "阶梯上升", "放射中心"], form: ["日芒", "扇形", "折线与流线"], color: ["黑色", "金色", "翡翠绿", "象牙白"], type: ["高对比几何标题", "细长大写字"], texture: ["黄铜", "漆面", "大理石", "镀铬"] },
    influencedBy: "立体主义、古埃及热、机器美学与奢侈工艺", influenced: "流线型现代、电影美术、奢侈品牌与复古未来视觉",
    related: ["ancient-egyptian", "mid-century-modern"], palette: ["#171715", "#c9a24c", "#236252"], art: "islamic",
    prompt: [["装饰艺术视觉", "Art Deco visual language"], ["高耸轴线对称", "soaring axial symmetry"], ["阶梯轮廓与放射日芒", "stepped silhouettes and sunburst motifs"], ["黑金与翡翠绿", "black gold and emerald green"], ["细长几何大写字", "elongated geometric capitals"], ["黄铜大理石与漆面质感", "brass marble and lacquer texture"]]
  }),
  buildStyle({
    id: "abstract-expressionism", nameZh: "抽象表现主义", nameEn: "Abstract Expressionism", type: "艺术运动",
    period: "约 1943–1965 年", year: 1950, region: "欧美", track: "欧洲艺术与现代主义",
    summary: "把画布变成身体行动和心理痕迹的场域，以巨大尺度强调创作过程本身。",
    recognition: "满幅滴洒、挥扫笔触、无中心结构、巨大画面和强烈物质痕迹。",
    traits: ["抽象", "动态", "有机", "表现"], fields: ["绘画", "空间"],
    genes: { composition: ["满幅无中心", "层叠轨迹", "越界延伸"], form: ["滴洒线网", "宽阔挥扫", "偶发色块"], color: ["黑白", "土色", "高纯度单色"], type: ["通常无文字", "手势性书写"], texture: ["流淌油漆", "厚涂", "裸露画布"] },
    influencedBy: "超现实主义自动技法、欧洲抽象与战后经验", influenced: "色域绘画、行为艺术、新表现主义与当代抽象",
    related: ["color-field", "neo-expressionism"], palette: ["#242220", "#d8d3c8", "#9a4f3b"], art: "impressionism",
    prompt: [["抽象表现主义", "Abstract Expressionism"], ["满幅无中心构图", "all-over non-hierarchical composition"], ["滴洒线网与挥扫笔触", "dripped linework and sweeping gestures"], ["黑白土色配强烈色块", "black white earth tones with forceful accents"], ["身体性动作痕迹", "physical traces of action"], ["流淌厚涂与裸画布", "flowing impasto and exposed canvas texture"]]
  }),
  buildStyle({
    id: "color-field", nameZh: "色域绘画", nameEn: "Color Field Painting", type: "艺术运动",
    period: "约 1948–1970 年", year: 1955, region: "欧美", track: "欧洲艺术与现代主义",
    summary: "以大尺度连续色面和边缘关系营造沉浸体验，弱化手势和具体形象。",
    recognition: "巨大柔边色块、稀薄染色、简化结构和接近纯粹的色彩氛围。",
    traits: ["抽象", "留白", "平面", "克制"], fields: ["绘画", "空间"],
    genes: { composition: ["大尺度色域", "少量层级", "边缘呼吸"], form: ["矩形色块", "柔边云团", "染色平面"], color: ["深红", "橙黄", "靛蓝", "柔粉"], type: ["无文字", "极简题签"], texture: ["薄染画布", "哑光色层"] },
    influencedBy: "抽象表现主义、现代抽象与崇高观念", influenced: "极简主义、沉浸装置、现代品牌色场与数字背景",
    related: ["abstract-expressionism", "minimalism"], palette: ["#8f2f35", "#d98532", "#384e78"], art: "impressionism",
    prompt: [["色域绘画", "Color Field painting"], ["大尺度平静色域", "large meditative color fields"], ["柔边矩形与染色层", "soft-edged rectangles and stained layers"], ["深红橙黄与靛蓝", "deep red orange-yellow and indigo"], ["极少视觉层级", "minimal visual hierarchy"], ["薄染哑光画布质感", "stained matte canvas texture"]]
  }),
  buildStyle({
    id: "op-art", nameZh: "欧普艺术", nameEn: "Op Art", type: "艺术运动",
    period: "约 1955–1970 年", year: 1964, region: "欧美", track: "商业与设计视觉",
    summary: "通过精确重复和高反差制造视觉震动、深度错觉与运动感。",
    recognition: "黑白条纹、波纹网格、同心几何和观看时产生的闪烁错觉。",
    traits: ["几何", "强对比", "网格", "动态"], fields: ["绘画", "平面", "时尚"],
    genes: { composition: ["满版重复", "同心放射", "波形变形"], form: ["黑白条纹", "棋盘网格", "精密曲线"], color: ["黑白", "互补色", "荧光强调"], type: ["几何无衬线", "低干扰标题"], texture: ["硬边平涂", "丝网印刷"] },
    influencedBy: "构成主义、包豪斯色彩研究与视觉心理学", influenced: "动态平面、时尚图案、数字动效与界面背景",
    related: ["bauhaus", "psychedelic"], palette: ["#111111", "#f4f2e9", "#e34236"], art: "swiss",
    prompt: [["欧普艺术", "Op Art"], ["满版同心重复", "all-over concentric repetition"], ["波形黑白条纹", "warped black-and-white stripes"], ["极端黑白高反差", "extreme black-and-white contrast"], ["精确几何秩序", "precise geometric order"], ["硬边丝网印刷质感", "hard-edge screen-print finish"]]
  }),
  buildStyle({
    id: "minimalism", nameZh: "极简主义", nameEn: "Minimalism", type: "艺术与设计运动",
    period: "约 1960–1975 年", year: 1965, region: "欧美", track: "商业与设计视觉",
    summary: "以基本形、工业材料和重复单元去除个人叙事，让对象、尺度与空间直接发生关系。",
    recognition: "基本几何体、序列重复、有限材料、无装饰和清晰负空间。",
    traits: ["几何", "留白", "克制", "理性"], fields: ["雕塑", "建筑", "平面"],
    genes: { composition: ["单元重复", "严格间距", "大量负空间"], form: ["立方体", "直线", "模块序列"], color: ["白色", "黑色", "工业灰", "单一原色"], type: ["中性无衬线", "极少字号层级"], texture: ["不锈钢", "玻璃", "喷漆表面"] },
    influencedBy: "包豪斯、构成主义与现代工业生产", influenced: "现代建筑、产品设计、数字界面与奢侈品牌",
    related: ["suprematism", "swiss"], palette: ["#f3f2ed", "#1b1b19", "#9b9c99"], art: "swiss",
    prompt: [["极简主义设计", "Minimalist design"], ["严格模块与大量负空间", "strict modules with generous negative space"], ["基本几何体与重复单元", "primary geometric forms and repeated units"], ["黑白工业灰配单色强调", "black white industrial gray with one accent"], ["中性无衬线排版", "neutral sans-serif typography"], ["不锈钢玻璃哑光质感", "stainless steel glass and matte finish"]]
  }),
  buildStyle({
    id: "conceptual-art", nameZh: "观念艺术", nameEn: "Conceptual Art", type: "艺术运动",
    period: "约 1965–1980 年", year: 1970, region: "欧美", track: "欧洲艺术与现代主义",
    summary: "把作品的核心从物质形式转向观念、指令、语言和制度语境。",
    recognition: "档案照片、打字文本、编号系统、日常物件和说明式陈列。",
    traits: ["理性", "克制", "反叛", "文字"], fields: ["空间", "摄影", "平面"],
    genes: { composition: ["档案式网格", "对象与说明并置", "序列记录"], form: ["现成物", "文档", "地图与图表"], color: ["黑白", "纸张米色", "办公灰"], type: ["打字机字", "中性无衬线", "编号标签"], texture: ["复印纸", "照片", "胶带与档案盒"] },
    influencedBy: "达达现成品、极简主义与语言哲学", influenced: "装置艺术、制度批判、数据艺术与研究型设计",
    related: ["dada", "minimalism"], palette: ["#1d1d1b", "#e7e2d7", "#8a8b87"], art: "swiss",
    prompt: [["观念艺术档案", "Conceptual art archive"], ["对象与说明并置", "juxtaposition of object and explanatory text"], ["现成物照片与编号文档", "found object photographs and numbered documents"], ["黑白办公灰", "black white and office gray"], ["打字机与标签排版", "typewriter and label typography"], ["复印纸胶带档案质感", "photocopy paper tape and archival texture"]]
  }),
  buildStyle({
    id: "architectural-brutalism", nameZh: "粗野主义建筑", nameEn: "Brutalist Architecture", type: "建筑运动",
    period: "约 1950–1975 年", year: 1960, region: "欧美", track: "商业与设计视觉",
    summary: "以裸露结构、清水混凝土和巨型体量表达公共机构与战后重建的直接性。",
    recognition: "厚重悬挑、重复窗格、粗糙混凝土、堡垒体量和暴露结构。",
    traits: ["几何", "粗粝", "宏大", "强对比"], fields: ["建筑", "空间", "数字界面"],
    genes: { composition: ["巨型模块堆叠", "重复结构网格", "深重阴影"], form: ["悬挑体块", "裸露梁柱", "雕塑性楼梯"], color: ["混凝土灰", "炭黑", "锈红", "苔绿"], type: ["粗体无衬线", "建筑标识字"], texture: ["木模混凝土", "耐候钢", "粗石"] },
    influencedBy: "现代主义、战后公共建设与结构诚实", influenced: "后现代建筑、数字新粗野主义与游戏场景",
    related: ["bauhaus", "brutalism"], palette: ["#8d8b84", "#272725", "#8a4b38"], art: "brutalism",
    prompt: [["粗野主义建筑", "Brutalist architecture"], ["巨型模块堆叠构图", "monumental stacked-module composition"], ["悬挑混凝土与重复窗格", "cantilevered concrete and repetitive window bays"], ["混凝土灰炭黑锈红", "concrete gray charcoal and rust red"], ["粗体建筑标识", "bold architectural signage"], ["木模清水混凝土质感", "board-formed raw concrete texture"]]
  }),
  buildStyle({
    id: "mid-century-modern", nameZh: "中世纪现代主义", nameEn: "Mid-century Modern", type: "设计运动",
    period: "约 1945–1969 年", year: 1955, region: "欧美", track: "商业与设计视觉",
    summary: "把现代主义功能原则转化为温暖、轻巧且适合大众生活的建筑、家具与平面语言。",
    recognition: "低矮水平线、锥形支脚、有机曲面、木材与明快几何图案。",
    traits: ["几何", "有机", "理性", "明快"], fields: ["产品", "建筑", "平面"],
    genes: { composition: ["开放水平布局", "不对称平衡", "模块与有机形并置"], form: ["锥形支脚", "薄壳曲面", "原子与回旋镖图案"], color: ["芥末黄", "青绿色", "砖橙", "胡桃木"], type: ["友好几何无衬线", "复古展示字"], texture: ["胡桃木", "玻璃纤维", "黄铜", "粗花呢"] },
    influencedBy: "包豪斯、斯堪的纳维亚设计与战后工业生产", influenced: "当代家居、科技品牌与复古商业插画",
    related: ["bauhaus", "art-deco"], palette: ["#d1a72f", "#317c76", "#bd5b35"], art: "bauhaus",
    prompt: [["中世纪现代主义", "mid-century modern design"], ["开放不对称布局", "open asymmetrical layout"], ["锥形支脚与有机曲面", "tapered legs and organic shell forms"], ["芥末黄青绿砖橙", "mustard yellow teal and burnt orange"], ["友好几何无衬线", "friendly geometric sans-serif"], ["胡桃木黄铜与粗花呢", "walnut brass and tweed texture"]]
  }),
  buildStyle({
    id: "psychedelic", nameZh: "迷幻视觉", nameEn: "Psychedelic Art", type: "视觉文化",
    period: "约 1965–1975 年", year: 1967, region: "欧美", track: "商业与设计视觉",
    summary: "以感知扩张、反文化音乐和东方图像为背景，制造高密度、流动且难以稳定阅读的视觉。",
    recognition: "融化字体、万花筒对称、荧光互补色、液态轮廓和满版细节。",
    traits: ["高饱和", "有机", "满版", "反叛"], fields: ["海报", "音乐", "插画"],
    genes: { composition: ["满版中心放射", "镜像万花筒", "拥挤层叠"], form: ["液态曲线", "眼睛与花朵", "变形人物"], color: ["荧光粉", "酸橙绿", "电紫", "橙色"], type: ["融化手绘字", "图文难分"], texture: ["丝网错位", "纸张颗粒", "油墨叠色"] },
    influencedBy: "新艺术运动、欧普艺术、反文化与摇滚音乐", influenced: "锐舞传单、酸性图形、音乐节视觉与数字动效",
    related: ["art-nouveau", "op-art"], palette: ["#e84d9b", "#9acd32", "#7346aa"], art: "nouveau",
    prompt: [["六十年代迷幻海报", "1960s psychedelic poster"], ["满版万花筒构图", "dense kaleidoscopic composition"], ["液态曲线与变形人物", "liquid curves and warped figures"], ["荧光粉酸绿电紫", "neon pink acid green and electric violet"], ["融化式手绘字体", "melting hand-drawn lettering"], ["错位丝网与油墨叠色", "misregistered screen print and overprinted ink"]]
  }),
  buildStyle({
    id: "postmodernism", nameZh: "后现代主义设计", nameEn: "Postmodern Design", type: "设计运动",
    period: "约 1970–1995 年", year: 1980, region: "欧美", track: "商业与设计视觉",
    summary: "质疑现代主义的唯一正确答案，以历史引用、戏仿、符号和混杂规则重获表达自由。",
    recognition: "古典符号与大众图像混搭、断裂网格、夸张色彩和反功能装饰。",
    traits: ["不对称", "反叛", "拼贴", "高饱和"], fields: ["建筑", "平面", "产品"],
    genes: { composition: ["断裂网格", "多重中心", "历史元素拼接"], form: ["夸张山墙", "符号化柱式", "拼贴碎片"], color: ["粉色", "青绿", "黄色", "黑白纹样"], type: ["多字体混排", "装饰衬线与无衬线并置"], texture: ["彩色层压板", "镜面", "印刷拼贴"] },
    influencedBy: "波普艺术、符号学与对现代主义的批判", influenced: "孟菲斯、解构主义、九十年代平面与互联网混搭",
    related: ["pop-art", "memphis"], palette: ["#d96e9f", "#3aa59a", "#e3c734"], art: "memphis",
    prompt: [["后现代主义设计", "Postmodern design"], ["断裂网格与多重中心", "broken grid with multiple focal points"], ["历史符号和流行图像拼贴", "collage of historical symbols and popular imagery"], ["粉青黄与黑白纹样", "pink teal yellow and black-white patterns"], ["多字体反规则混排", "rule-breaking mixed typography"], ["彩色层压板与印刷拼贴", "colored laminate and print-collage texture"]]
  }),
  buildStyle({
    id: "neo-expressionism", nameZh: "新表现主义", nameEn: "Neo-Expressionism", type: "艺术运动",
    period: "约 1978–1990 年", year: 1983, region: "欧美", track: "欧洲艺术与现代主义",
    summary: "以粗暴人物、涂写符号和厚重颜料恢复绘画的身体性、历史感与都市焦虑。",
    recognition: "巨大画布、原始人物、潦草文字、脏污高彩度和厚重堆叠。",
    traits: ["表现", "粗粝", "反叛", "高饱和"], fields: ["绘画", "平面", "时尚"],
    genes: { composition: ["拥挤满幅", "人物正面冲撞", "涂写层叠"], form: ["原始线条", "夸张头部", "王冠与骨骼符号"], color: ["焦黑", "脏黄", "钴蓝", "猩红"], type: ["涂鸦手写", "刮刻文字"], texture: ["厚涂油彩", "炭笔", "拼贴与刮痕"] },
    influencedBy: "德国表现主义、抽象表现主义与街头文化", influenced: "街头艺术、时尚涂鸦、当代具象绘画与专辑视觉",
    related: ["expressionism", "street-art"], palette: ["#26231f", "#d1a72a", "#365f9d"], art: "impressionism",
    prompt: [["新表现主义绘画", "Neo-Expressionist painting"], ["拥挤满幅冲撞构图", "crowded confrontational all-over composition"], ["原始人物与涂写符号", "raw figures and scrawled symbols"], ["焦黑脏黄钴蓝猩红", "charred black dirty yellow cobalt and scarlet"], ["刮刻涂鸦文字", "scratched graffiti lettering"], ["厚涂炭笔与拼贴刮痕", "impasto charcoal collage and scratched texture"]]
  }),
  buildStyle({
    id: "street-art", nameZh: "街头艺术", nameEn: "Street Art", type: "视觉文化",
    period: "1970 年代至今", year: 1990, region: "全球", track: "商业与设计视觉",
    summary: "以公共空间为媒介，融合署名、模板、壁画和社会评论，形成快速传播的城市视觉语言。",
    recognition: "喷漆轮廓、泡泡字、模板人物、墙体裂纹和高反差大色块。",
    traits: ["反叛", "高饱和", "粗粝", "文字"], fields: ["公共艺术", "平面", "时尚"],
    genes: { composition: ["墙面满幅", "尺度夸张", "环境形状适配"], form: ["泡泡字", "喷漆标签", "模板与角色图形"], color: ["黑白", "荧光色", "原色喷漆"], type: ["手写标签", "粗体涂鸦字"], texture: ["混凝土墙", "喷漆雾边", "滴流与剥落"] },
    influencedBy: "纽约涂鸦、嘻哈文化、朋克与政治壁画", influenced: "品牌联名、潮流时尚、城市节庆与社交媒体图形",
    related: ["neo-expressionism", "pop-art"], palette: ["#171715", "#e34035", "#29a9a1"], art: "pop",
    prompt: [["街头艺术壁画", "street art mural"], ["适应墙面的大尺度满幅构图", "large wall-responsive composition"], ["喷漆标签模板与角色图形", "spray tags stencils and character graphics"], ["黑白配荧光原色", "black and white with neon primaries"], ["粗体泡泡涂鸦字", "bold bubble graffiti lettering"], ["混凝土喷漆滴流剥落", "concrete spray drips and peeling texture"]]
  }),
  buildStyle({
    id: "vaporwave", nameZh: "蒸汽波", nameEn: "Vaporwave", type: "数字视觉趋势",
    period: "2010 年代", year: 2012, region: "全球", track: "数字与网络审美",
    summary: "挪用八九十年代消费图像、早期电脑和古典雕塑，以怀旧错位评论数字资本主义。",
    recognition: "粉紫青渐变、古典半身像、棕榈树、日文文字和低清旧电脑界面。",
    traits: ["未来", "拼贴", "低保真", "高饱和"], fields: ["音乐", "平面", "数字界面"],
    genes: { composition: ["中心拼贴", "透视网格", "漂浮窗口"], form: ["古典雕塑", "棕榈树", "旧电脑与棋盘地面"], color: ["粉紫", "青蓝", "日落橙", "深蓝"], type: ["日文与拉丁字混排", "像素字", "复古衬线"], texture: ["VHS 噪点", "低清压缩", "镀铬"] },
    influencedBy: "八十年代商业图像、早期互联网与采样音乐", influenced: "网络怀旧、Y2K 复兴、音乐封面与短视频滤镜",
    related: ["synthwave", "y2k"], palette: ["#dc77c5", "#48c4cc", "#4b3b8f"], art: "y2k",
    prompt: [["蒸汽波美学", "vaporwave aesthetic"], ["中心拼贴与透视网格", "central collage over perspective grid"], ["古典雕塑棕榈树旧电脑", "classical bust palm trees and retro computer"], ["粉紫青蓝日落橙", "pink violet cyan and sunset orange"], ["日文像素字混排", "Japanese and pixel typography mix"], ["VHS 噪点与低清压缩", "VHS noise and lo-fi compression"]]
  }),
  buildStyle({
    id: "cyberpunk", nameZh: "赛博朋克", nameEn: "Cyberpunk", type: "视觉文化",
    period: "1980 年代至今", year: 1984, region: "全球", track: "数字与网络审美",
    summary: "以高科技低生活的矛盾想象巨型都市、企业权力、身体改造与地下抵抗。",
    recognition: "夜雨城市、密集霓虹招牌、巨构阴影、湿地反光和机械义体。",
    traits: ["未来", "强对比", "满版", "戏剧"], fields: ["电影", "游戏", "插画"],
    genes: { composition: ["低机位巨构", "拥挤纵深", "人物被城市压缩"], form: ["霓虹招牌", "管线与义体", "高层贫民街区"], color: ["电青", "洋红", "酸黄", "深黑"], type: ["窄体无衬线", "多语种霓虹字", "终端字"], texture: ["雨水反光", "金属锈蚀", "屏幕噪点"] },
    influencedBy: "黑色电影、科幻文学、东京与香港都市景观", influenced: "游戏美术、科技时尚、音乐视觉与未来城市品牌",
    related: ["synthwave", "glitch-art"], palette: ["#20b7c6", "#da3a91", "#d9cf2f"], art: "y2k",
    prompt: [["赛博朋克城市", "cyberpunk city"], ["低机位拥挤纵深", "low-angle dense urban depth"], ["霓虹招牌管线与机械义体", "neon signage cables and cybernetic bodies"], ["电青洋红酸黄深黑", "electric cyan magenta acid yellow and black"], ["多语种终端排版", "multilingual terminal typography"], ["雨水反光锈蚀与屏幕噪点", "wet reflections rust and screen noise"]]
  }),
  buildStyle({
    id: "synthwave", nameZh: "合成波", nameEn: "Synthwave", type: "数字视觉趋势",
    period: "2000 年代末至今", year: 2009, region: "全球", track: "数字与网络审美",
    summary: "重构八十年代电子音乐、街机、录像带与复古未来想象，营造夜行速度感。",
    recognition: "黑色地平线、紫红落日、透视网格、镀铬标题和跑车剪影。",
    traits: ["未来", "几何", "高饱和", "怀旧"], fields: ["音乐", "海报", "游戏"],
    genes: { composition: ["中央地平线", "单点透视网格", "对称远景"], form: ["条纹落日", "棕榈剪影", "跑车与山脉"], color: ["霓虹紫", "洋红", "电蓝", "深黑"], type: ["镀铬斜体字", "街机像素字"], texture: ["VHS 扫描线", "数字辉光", "镀铬反射"] },
    influencedBy: "八十年代电子音乐、街机游戏与复古未来电影", influenced: "音乐封面、独立游戏、夜跑品牌与网络怀旧",
    related: ["vaporwave", "cyberpunk"], palette: ["#743ea8", "#e14194", "#247ec1"], art: "y2k",
    prompt: [["合成波复古未来", "synthwave retrofuturism"], ["中央地平线单点透视", "centered horizon with one-point perspective"], ["条纹落日网格与跑车", "striped sunset grid and sports car"], ["霓虹紫洋红电蓝", "neon violet magenta and electric blue"], ["镀铬斜体街机字", "chrome italic arcade lettering"], ["VHS 扫描线与数字辉光", "VHS scanlines and digital glow"]]
  }),
  buildStyle({
    id: "frutiger-aero", nameZh: "Frutiger Aero", nameEn: "Frutiger Aero", type: "数字视觉趋势",
    period: "约 2004–2013 年", year: 2007, region: "全球", track: "数字与网络审美",
    summary: "以自然、科技和乐观消费想象结合的界面审美，代表宽带互联网早期的亲和未来。",
    recognition: "蓝天绿地、水泡、玻璃按钮、鱼眼透视和高光拟物图标。",
    traits: ["未来", "有机", "高饱和", "明快"], fields: ["数字界面", "广告", "产品"],
    genes: { composition: ["开阔中心景观", "悬浮界面层", "鱼眼空间"], form: ["水泡与叶片", "圆润图标", "玻璃面板"], color: ["天空蓝", "草绿", "水青", "阳光黄"], type: ["人文无衬线", "圆润界面字"], texture: ["玻璃高光", "水滴", "柔和塑料"] },
    influencedBy: "Web 2.0、环保营销、拟物界面与数码摄影", influenced: "网络怀旧、乐观科技品牌与新拟物设计",
    related: ["y2k", "material-design"], palette: ["#47a9db", "#66a941", "#35b8b2"], art: "y2k",
    prompt: [["Frutiger Aero 美学", "Frutiger Aero aesthetic"], ["开阔自然景观与悬浮界面", "open natural landscape with floating UI"], ["水泡叶片与玻璃按钮", "bubbles leaves and glass buttons"], ["天空蓝草绿水青", "sky blue grass green and aqua"], ["圆润人文无衬线", "rounded humanist sans-serif"], ["高光玻璃水滴与柔塑料", "glossy glass water droplets and soft plastic"]]
  }),
  buildStyle({
    id: "flat-design", nameZh: "扁平化设计", nameEn: "Flat Design", type: "数字视觉趋势",
    period: "约 2012–2018 年", year: 2013, region: "全球", track: "数字与网络审美",
    summary: "去除拟物材质和装饰阴影，用清晰色块、图标与排版提升跨设备界面的效率。",
    recognition: "纯色色块、简单图标、无阴影层级、规则网格和明快配色。",
    traits: ["平面", "几何", "网格", "明快"], fields: ["数字界面", "品牌视觉", "插画"],
    genes: { composition: ["卡片式网格", "清晰信息层级", "等距留白"], form: ["基础图标", "几何插画", "纯色按钮"], color: ["明蓝", "珊瑚红", "薄荷绿", "浅灰"], type: ["中性无衬线", "明确字号层级"], texture: ["纯平色面", "极少阴影"] },
    influencedBy: "瑞士国际主义、现代图标系统与响应式网页", influenced: "Material Design、品牌插画系统与当代产品界面",
    related: ["swiss", "material-design"], palette: ["#2e78c7", "#e55c55", "#45a984"], art: "swiss",
    prompt: [["扁平化数字设计", "flat digital design"], ["规则卡片网格与清晰层级", "regular card grid with clear hierarchy"], ["基础图标与几何插画", "simple icons and geometric illustration"], ["明蓝珊瑚红薄荷绿", "bright blue coral red and mint green"], ["中性无衬线界面字", "neutral sans-serif UI typography"], ["纯色面与极少阴影", "solid color surfaces with minimal shadow"]]
  }),
  buildStyle({
    id: "material-design", nameZh: "Material Design", nameEn: "Material Design", type: "设计系统",
    period: "2014 年至今", year: 2014, region: "全球", track: "数字与网络审美",
    summary: "用纸张隐喻、层级阴影、响应式动效和系统组件统一多设备产品体验。",
    recognition: "浮动操作按钮、分层卡片、柔和阴影、标准间距和大胆主色。",
    traits: ["几何", "网格", "平面", "系统化"], fields: ["数字界面", "设计系统", "品牌视觉"],
    genes: { composition: ["八点网格", "层级表面", "响应式模块"], form: ["圆形操作按钮", "矩形卡片", "系统图标"], color: ["大胆主色", "中性表面", "状态色"], type: ["现代无衬线", "严格字阶"], texture: ["纸张式层级", "柔和投影", "动效反馈"] },
    influencedBy: "扁平化设计、纸张模型与移动操作系统", influenced: "全球设计系统、组件化产品开发与跨端界面",
    related: ["flat-design", "frutiger-aero"], palette: ["#4267b2", "#f6c343", "#e3574c"], art: "bauhaus",
    prompt: [["Material Design 界面", "Material Design interface"], ["八点网格与分层表面", "eight-point grid with layered surfaces"], ["卡片系统与浮动操作按钮", "card system and floating action button"], ["大胆主色配中性表面", "bold primary color with neutral surfaces"], ["严格现代无衬线字阶", "strict modern sans-serif type scale"], ["纸张层级与柔和投影", "paper-like elevation and soft shadows"]]
  }),
  buildStyle({
    id: "corporate-memphis", nameZh: "企业孟菲斯插画", nameEn: "Corporate Memphis", type: "数字视觉趋势",
    period: "约 2017–2023 年", year: 2018, region: "全球", track: "数字与网络审美",
    summary: "以模块化扁平人物、柔和几何和包容性场景快速构建科技产品的亲和叙事。",
    recognition: "夸张四肢、小头人物、无面孔、柔和色块和漂浮植物。",
    traits: ["平面", "有机", "明快", "模块化"], fields: ["插画", "品牌视觉", "数字界面"],
    genes: { composition: ["中心人物场景", "漂浮辅助形", "模块化叙事"], form: ["夸张四肢", "无面孔人物", "圆润植物与几何"], color: ["珊瑚红", "柔蓝", "薰衣草紫", "薄荷绿"], type: ["友好无衬线", "圆润标题"], texture: ["纯色矢量", "轻微颗粒"] },
    influencedBy: "扁平化设计、孟菲斯图形与科技品牌需求", influenced: "SaaS 品牌插画、产品空状态与现代商业传播",
    related: ["flat-design", "memphis"], palette: ["#e76f66", "#5d8fc4", "#9a82bd"], art: "memphis",
    prompt: [["企业孟菲斯插画", "Corporate Memphis illustration"], ["中心人物模块化场景", "centered modular character scene"], ["夸张四肢无面孔人物", "small-headed faceless figures with exaggerated limbs"], ["珊瑚柔蓝薰衣草紫", "coral soft blue and lavender"], ["友好圆润无衬线", "friendly rounded sans-serif"], ["纯色矢量与轻微颗粒", "flat vector color with subtle grain"]]
  }),
  buildStyle({
    id: "solarpunk", nameZh: "太阳朋克", nameEn: "Solarpunk", type: "视觉文化",
    period: "2010 年代至今", year: 2020, region: "全球", track: "数字与网络审美",
    summary: "想象生态修复、分布式技术和社区协作共存的可实现未来，对抗反乌托邦惯性。",
    recognition: "绿植覆盖建筑、太阳能、社区花园、明亮日光和手工科技混合。",
    traits: ["未来", "有机", "明快", "生态"], fields: ["插画", "建筑", "游戏"],
    genes: { composition: ["开阔社区全景", "自然与建筑交织", "向阳上升视线"], form: ["垂直绿化", "太阳能板", "风车与温室"], color: ["叶绿", "天空蓝", "阳光黄", "陶土红"], type: ["人文无衬线", "手写社区标识"], texture: ["木材", "玻璃", "再生金属", "茂密植物"] },
    influencedBy: "生态设计、科幻文学、气候行动与工艺美术", influenced: "可持续建筑传播、气候游戏与未来城市插画",
    related: ["frutiger-aero", "cyberpunk"], palette: ["#4d934f", "#55a8cb", "#e4ba37"], art: "ink",
    prompt: [["太阳朋克未来城市", "solarpunk future city"], ["开阔社区全景构图", "open community panorama"], ["绿植建筑太阳能与温室", "plant-covered buildings solar panels and greenhouses"], ["叶绿天空蓝阳光黄", "leaf green sky blue and sunlight yellow"], ["人文社区标识", "humanist community signage"], ["木材玻璃再生金属与植物", "wood glass recycled metal and lush vegetation"]]
  }),
  buildStyle({
    id: "generative-art", nameZh: "生成艺术", nameEn: "Generative Art", type: "数字视觉趋势",
    period: "1960 年代至今", year: 2019, region: "全球", track: "数字与网络审美",
    summary: "由艺术家设计规则、系统或算法，让作品在确定结构与随机变化之间持续生成。",
    recognition: "参数化重复、粒子轨迹、递归结构、可视化规则和每次不同的输出。",
    traits: ["几何", "系统化", "动态", "未来"], fields: ["数字艺术", "动效", "空间"],
    genes: { composition: ["规则驱动分布", "多尺度递归", "随机受控"], form: ["粒子", "流场曲线", "网格与分形"], color: ["算法调色板", "连续色阶", "高反差强调"], type: ["代码式等宽字", "数据标签"], texture: ["精密矢量", "像素粒子", "光点叠加"] },
    influencedBy: "系统艺术、早期计算机绘图、数学与创意编程", influenced: "数据艺术、实时视觉、链上艺术与品牌动态系统",
    related: ["op-art", "glitch-art"], palette: ["#245fd1", "#ec4b43", "#efc93a"], art: "bauhaus",
    prompt: [["生成艺术系统", "generative art system"], ["规则驱动的递归构图", "rule-driven recursive composition"], ["粒子流场网格与分形", "particle flow fields grids and fractals"], ["算法生成的连续色阶", "algorithmically generated color scale"], ["等宽代码标签", "monospaced code labels"], ["精密矢量与发光粒子", "precise vectors and luminous particles"]]
  }),
  buildStyle({
    id: "glitch-art", nameZh: "故障艺术", nameEn: "Glitch Art", type: "数字视觉趋势",
    period: "1990 年代至今", year: 2015, region: "全球", track: "数字与网络审美",
    summary: "把数据损坏、信号错误和压缩异常从技术缺陷转化为数字媒介的可见语言。",
    recognition: "RGB 错位、像素撕裂、扫描线、数据块和局部图像重复。",
    traits: ["数字", "反叛", "强对比", "动态"], fields: ["数字艺术", "音乐", "平面"],
    genes: { composition: ["横向数据撕裂", "局部重复", "秩序突然中断"], form: ["像素块", "RGB 通道偏移", "扫描线与噪点"], color: ["电青", "洋红", "信号绿", "深黑"], type: ["损坏等宽字", "字符乱码"], texture: ["JPEG 压缩块", "模拟雪花", "屏幕扫描线"] },
    influencedBy: "录像艺术、数字错误文化与实验电子音乐", influenced: "音乐视觉、时尚影像、动态图形与网络反完美美学",
    related: ["generative-art", "cyberpunk"], palette: ["#20c3c9", "#e0409b", "#57d34f"], art: "y2k",
    prompt: [["故障艺术", "glitch art"], ["横向数据撕裂构图", "horizontal data-tear composition"], ["像素块 RGB 错位与扫描线", "pixel blocks RGB shift and scanlines"], ["电青洋红信号绿深黑", "electric cyan magenta signal green and black"], ["损坏等宽字符", "corrupted monospaced characters"], ["JPEG 压缩与模拟噪点", "JPEG artifacts and analog static texture"]]
  })
];

STYLE_DATA.push(...EXTRA_STYLE_DATA);

FILTER_GROUPS.type = [...new Set(STYLE_DATA.map((style) => style.type))];
FILTER_GROUPS.region = [...new Set(STYLE_DATA.map((style) => style.region))];
FILTER_GROUPS.fields = [...new Set(STYLE_DATA.flatMap((style) => style.fields))];
