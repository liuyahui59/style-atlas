const buildMoreStyle = (entry) => {
  const { visualSpec, ...style } = entry;
  return {
    ...style,
    art: entry.art || "bauhaus",
    genes: {
      composition: [visualSpec[1][0]],
      form: [visualSpec[2][0]],
      color: [visualSpec[3][0]],
      type: [visualSpec[4][0]],
      texture: [visualSpec[5][0]]
    }
  };
};

const MORE_STYLE_DATA = [
  buildMoreStyle({
    id: "photorealism", nameZh: "照相写实主义", nameEn: "Photorealism", type: "艺术运动",
    period: "1960 年代末至今", year: 1970, region: "欧美", track: "欧洲艺术与现代主义",
    summary: "以摄影为中介，通过精确绘制重新审视机械观看、图像复制与现实感。",
    recognition: "照片式裁切、镜面反射、城市表面、锐利细节和冷静客观的光线。",
    traits: ["写实", "精密", "理性", "高细节"], fields: ["绘画", "插画", "广告"],
    influencedBy: "摄影、波普艺术与消费社会图像", influenced: "商业插画、超写实绘画与数字渲染", related: ["realism", "pop-art"],
    palette: ["#4f6672", "#b7a58e", "#8b3e35"], art: "renaissance",
    visualSpec: [["照相写实主义绘画", "Photorealist painting"], ["照片式精确裁切构图", "precisely cropped photographic composition"], ["高精度现实对象与反射", "highly detailed real-world objects and reflections"], ["自然环境色与准确明暗", "naturalistic color with accurate tonal values"], ["克制中性标题", "restrained neutral typography"], ["无可见笔触的平滑画面", "smooth painted surface with no visible brushwork"]]
  }),
  buildMoreStyle({
    id: "lowbrow", nameZh: "低眉艺术 / 波普超现实主义", nameEn: "Lowbrow Art / Pop Surrealism", type: "艺术运动",
    period: "1970 年代末至今", year: 1985, region: "欧美", track: "商业与设计视觉",
    summary: "融合地下漫画、热棒文化、朋克和超现实意象，以精细卡通反抗高低艺术边界。",
    recognition: "大眼怪诞角色、复古广告造型、黑色幽默和光滑细密的绘画表面。",
    traits: ["叙事", "怪诞", "高饱和", "反叛"], fields: ["绘画", "插画", "潮流艺术"],
    influencedBy: "地下漫画、波普艺术、超现实主义与滑板文化", influenced: "潮流玩具、角色艺术和商业插画", related: ["pop-art", "surrealism"],
    palette: ["#d45546", "#4b8490", "#d9b54b"], art: "pop",
    visualSpec: [["低眉艺术与波普超现实主义", "Lowbrow art and Pop Surrealism"], ["中心角色与怪诞叙事构图", "centered character with uncanny narrative composition"], ["复古卡通与大眼怪诞角色", "retro cartoons and big-eyed uncanny characters"], ["糖果色配暗色阴影", "candy colors with dark shadows"], ["复古招牌式标题", "retro sign-painting display type"], ["光滑细描与旧广告印刷", "smooth detailed painting and vintage ad-print texture"]]
  }),
  buildMoreStyle({
    id: "gongbi", nameZh: "工笔画", nameEn: "Gongbi Painting", type: "地域传统",
    period: "约 10 世纪至今", year: 1100, region: "东亚", track: "东亚视觉传统",
    summary: "以精谨线描、层层设色和细密观察塑造清晰而典雅的形象。",
    recognition: "细而稳定的轮廓、平整层染、精密花鸟人物与克制背景。",
    traits: ["写实", "精密", "平面", "克制"], fields: ["绘画", "插画", "装饰"],
    influencedBy: "院体绘画与传统线描", influenced: "当代国风插画与工艺设计", related: ["ink-wash", "dunhuang"],
    palette: ["#9d3d35", "#315f6f", "#d6bf8c"], art: "ink",
    visualSpec: [["工笔画视觉语言", "Gongbi painting visual language"], ["平稳留白构图", "balanced composition with reserved space"], ["精谨线描与细密花鸟", "precise outlines and finely observed flora and fauna"], ["矿物青绿与朱砂设色", "mineral blue-green and cinnabar palette"], ["细雅题跋", "refined calligraphic inscription"], ["绢本层染质感", "layered pigment on silk texture"]]
  }),
  buildMoreStyle({
    id: "dunhuang", nameZh: "敦煌艺术", nameEn: "Dunhuang Art", type: "地域传统",
    period: "4–14 世纪", year: 700, region: "东亚", track: "东亚视觉传统",
    summary: "融合丝路多元文化，以壁画、飞天、藻井和佛教叙事构成宏阔视觉体系。",
    recognition: "飞天飘带、藻井几何、矿物色壁画与连续叙事场景。",
    traits: ["叙事", "装饰", "动态", "低饱和"], fields: ["绘画", "建筑", "装饰"],
    influencedBy: "佛教艺术与丝路文化交流", influenced: "中国宗教艺术与当代文创", related: ["gongbi", "thangka"],
    palette: ["#a34d35", "#315b62", "#c19a52"], art: "islamic",
    visualSpec: [["敦煌壁画视觉语言", "Dunhuang mural visual language"], ["藻井中心与连续叙事构图", "caisson-centered continuous narrative composition"], ["飞天飘带与佛教图像", "flying apsaras ribbons and Buddhist imagery"], ["赭红石绿与土金", "ochre red mineral green and earthy gold"], ["写经式题记", "sutra-like inscription"], ["风化矿物壁画质感", "weathered mineral fresco texture"]]
  }),
  buildMoreStyle({
    id: "chinese-new-year-print", nameZh: "中国木版年画", nameEn: "Chinese Woodblock New Year Print", type: "地域传统",
    period: "17 世纪至今", year: 1700, region: "东亚", track: "东亚视觉传统",
    summary: "以套色木版、吉祥符号和民间叙事服务节庆生活与家庭空间。",
    recognition: "粗实轮廓、正面人物、红黄绿套色与高密度吉祥纹样。",
    traits: ["平面", "对称", "高饱和", "叙事"], fields: ["版画", "插画", "包装"],
    influencedBy: "民间信仰、木版印刷与节庆习俗", influenced: "国潮包装与节日视觉", related: ["guochao", "ukiyo-e"],
    palette: ["#cf342f", "#e0b936", "#278060"], art: "ukiyo",
    visualSpec: [["中国木版年画", "Chinese woodblock New Year print"], ["正面对称满版构图", "frontal symmetrical full composition"], ["吉祥人物与民间纹样", "auspicious figures and folk motifs"], ["朱红明黄与石绿套色", "vermilion yellow and mineral green palette"], ["手刻榜书标题", "hand-carved display lettering"], ["木版套色与纸张纤维", "registered woodblock ink and fibrous paper"]]
  }),
  buildMoreStyle({
    id: "guochao", nameZh: "国潮视觉", nameEn: "Guochao Visual Style", type: "视觉文化",
    period: "2010 年代至今", year: 2018, region: "东亚", track: "商业与设计视觉",
    summary: "把中国传统图形、文字和色彩重新组织为当代品牌与青年消费视觉。",
    recognition: "传统纹样与粗体中文并置，朱红金色、高反差构图和现代产品表达。",
    traits: ["高饱和", "装饰", "文字", "强对比"], fields: ["品牌视觉", "包装", "海报"],
    influencedBy: "民间美术、传统器物与当代潮流文化", influenced: "新消费品牌与文化文创", related: ["chinese-new-year-print", "flat-design"],
    palette: ["#c9332c", "#d8aa38", "#183f65"], art: "constructivism",
    visualSpec: [["国潮商业视觉", "Guochao contemporary Chinese visual style"], ["传统纹样与现代网格并置", "traditional motifs combined with a modern grid"], ["瑞兽云纹与粗体图形", "mythic animals cloud motifs and bold graphics"], ["朱红金色与藏青", "vermilion gold and deep navy palette"], ["现代粗体中文标题", "bold contemporary Chinese display type"], ["精致印刷与金属烫印", "refined print and metallic foil texture"]]
  }),
  buildMoreStyle({
    id: "rinpa", nameZh: "琳派", nameEn: "Rinpa School", type: "地域传统",
    period: "17–19 世纪", year: 1650, region: "东亚", track: "东亚视觉传统",
    summary: "以金银地、自然母题和大胆留白形成高度装饰性的日本视觉传统。",
    recognition: "金箔背景、成组花鸟、流水曲线、大胆裁切与平面色块。",
    traits: ["平面", "装饰", "留白", "有机"], fields: ["绘画", "装饰", "产品"],
    influencedBy: "日本古典文学与宫廷工艺", influenced: "日本设计、装饰艺术与品牌包装", related: ["ukiyo-e", "nihonga"],
    palette: ["#c8a34c", "#31556b", "#b34b3d"], art: "ukiyo",
    visualSpec: [["琳派装饰艺术", "Rinpa decorative art"], ["大胆留白与边缘裁切", "bold negative space and edge cropping"], ["花鸟流水平面造型", "flat flowers birds and flowing water forms"], ["金地群青与朱红", "gold ground ultramarine and vermilion"], ["雅致题签", "elegant calligraphic title"], ["金箔绢本与矿物颜料", "gold leaf silk and mineral pigment texture"]]
  }),
  buildMoreStyle({
    id: "nihonga", nameZh: "日本画", nameEn: "Nihonga", type: "地域传统",
    period: "19 世纪末至今", year: 1890, region: "东亚", track: "东亚视觉传统",
    summary: "以传统矿物颜料和纸绢材料回应现代绘画制度，兼具细腻观察与平面秩序。",
    recognition: "柔和矿物色、清晰轮廓、季节自然和哑光纸绢表面。",
    traits: ["平面", "低饱和", "克制", "写实"], fields: ["绘画", "插画", "装饰"],
    influencedBy: "日本古典绘画与近代美术教育", influenced: "当代日系插画与出版视觉", related: ["rinpa", "ukiyo-e"],
    palette: ["#788b77", "#bf8d79", "#d8cfb7"], art: "ink",
    visualSpec: [["日本画美学", "Nihonga aesthetic"], ["安静平衡与浅层空间", "quiet balance and shallow pictorial space"], ["细腻自然形态与清晰轮廓", "delicate natural forms with clear contours"], ["柔和矿物色与灰绿色", "soft mineral pigments and gray-green palette"], ["极简日文题签", "minimal Japanese inscription"], ["岩彩和纸哑光质感", "matte mineral pigment on washi texture"]]
  }),
  buildMoreStyle({
    id: "wabi-sabi", nameZh: "侘寂", nameEn: "Wabi-sabi", type: "视觉文化",
    period: "15 世纪至今", year: 1500, region: "东亚", track: "东亚视觉传统",
    summary: "重视不完满、时间痕迹与朴素材料，在克制中呈现安静和短暂。",
    recognition: "不对称留白、土色、天然材料、裂纹与手工不规则边缘。",
    traits: ["留白", "不对称", "低饱和", "克制"], fields: ["产品", "空间", "摄影"],
    influencedBy: "禅宗、茶道与日本手工传统", influenced: "当代空间、产品与生活方式视觉", related: ["minimalism", "ink-wash"],
    palette: ["#80766a", "#b6aa96", "#43453f"], art: "ink",
    visualSpec: [["侘寂美学", "wabi-sabi aesthetic"], ["不对称留白构图", "asymmetrical composition with generous negative space"], ["朴素不规则形态", "humble irregular forms"], ["灰褐土色低饱和", "muted gray-brown earth tones"], ["极少文字", "minimal understated typography"], ["风化陶土木材与裂纹", "weathered clay wood and cracked texture"]]
  }),
  buildMoreStyle({
    id: "kawaii", nameZh: "卡哇伊美学", nameEn: "Kawaii Aesthetic", type: "视觉文化",
    period: "1970 年代至今", year: 1975, region: "东亚", track: "商业与设计视觉",
    summary: "以幼态比例、圆润轮廓和柔亮色彩建立亲和、轻松且高度商品化的视觉语言。",
    recognition: "大头小身体、圆眼、柔和轮廓、糖果色与微型装饰符号。",
    traits: ["有机", "高饱和", "平面", "明快"], fields: ["插画", "产品", "包装"],
    influencedBy: "少女文化、漫画与角色商品", influenced: "全球角色设计与青年品牌", related: ["superflat", "corporate-memphis"],
    palette: ["#f49ab4", "#8dcad0", "#f2cf67"], art: "memphis",
    visualSpec: [["卡哇伊角色美学", "kawaii character aesthetic"], ["中心角色与小型装饰环绕", "centered character with tiny surrounding motifs"], ["幼态比例与圆润轮廓", "chibi proportions and rounded contours"], ["粉彩糖果色", "pastel candy-color palette"], ["圆润友好标题字", "rounded friendly display type"], ["光滑贴纸与柔软塑料质感", "smooth sticker and soft plastic texture"]]
  }),
  buildMoreStyle({
    id: "superflat", nameZh: "超扁平", nameEn: "Superflat", type: "艺术运动",
    period: "2000 年代至今", year: 2000, region: "东亚", track: "商业与设计视觉",
    summary: "消解高低艺术边界，将动画、消费文化与传统平面性压缩进无纵深图像。",
    recognition: "无阴影平面空间、高密度角色、清晰轮廓和鲜艳商业色彩。",
    traits: ["平面", "满版", "高饱和", "叙事"], fields: ["绘画", "插画", "时尚"],
    influencedBy: "日本动画、浮世绘与消费文化", influenced: "潮流艺术、时尚联名与数字收藏", related: ["kawaii", "pop-art"],
    palette: ["#ef5f86", "#30a8c3", "#f0cc37"], art: "pop",
    visualSpec: [["超扁平视觉语言", "Superflat visual language"], ["高密度无纵深满版构图", "dense all-over composition without depth"], ["卡通角色与重复符号", "cartoon characters and repeated symbols"], ["明亮高饱和商业色", "bright saturated commercial palette"], ["动画式粗体标题", "anime-inspired bold display type"], ["无阴影光滑印刷表面", "shadowless smooth printed surface"]]
  }),
  buildMoreStyle({
    id: "korean-minhwa", nameZh: "韩国民画", nameEn: "Korean Minhwa", type: "地域传统",
    period: "17–19 世纪", year: 1800, region: "东亚", track: "东亚视觉传统",
    summary: "以民间愿望、日常幽默和吉祥象征形成自由鲜明的朝鲜时代绘画语言。",
    recognition: "平面透视、虎鹊、书架图、明亮矿物色与天真夸张比例。",
    traits: ["平面", "叙事", "高饱和", "象征"], fields: ["绘画", "装饰", "插画"],
    influencedBy: "朝鲜民间信仰与宫廷绘画", influenced: "韩国当代插画与文化设计", related: ["chinese-new-year-print", "gongbi"],
    palette: ["#c74638", "#315f8b", "#d8b641"], art: "ukiyo",
    visualSpec: [["韩国民画", "Korean Minhwa folk painting"], ["平面散点叙事构图", "flat scattered narrative composition"], ["虎鹊书架与吉祥符号", "tiger magpie bookshelves and auspicious symbols"], ["朱红群青与明黄", "vermilion cobalt and bright yellow"], ["民间手写题字", "folk hand-lettered inscription"], ["矿物颜料韩纸质感", "mineral pigment on hanji paper texture"]]
  }),
  buildMoreStyle({
    id: "persian-miniature", nameZh: "波斯细密画", nameEn: "Persian Miniature Painting", type: "地域传统",
    period: "13–17 世纪", year: 1450, region: "西亚与北非", track: "全球地域传统",
    summary: "以精密线条、层叠空间和诗歌叙事组织宫廷、园林与史诗世界。",
    recognition: "多层俯视、精细人物、花卉边框、宝石色与金色点缀。",
    traits: ["精密", "满版", "叙事", "装饰"], fields: ["绘画", "书籍", "装饰"],
    influencedBy: "伊朗书籍艺术与诗歌传统", influenced: "莫卧儿细密画与西亚出版艺术", related: ["mughal-miniature", "islamic-geometry"],
    palette: ["#266a91", "#b53f42", "#c9a347"], art: "islamic",
    visualSpec: [["波斯细密画", "Persian miniature painting"], ["多层俯视与装饰边框", "layered elevated view with ornamental border"], ["精微宫廷人物与花园", "finely drawn court figures and gardens"], ["群青朱红与金色", "ultramarine vermilion and gold"], ["波斯书法题记", "Persian calligraphic inscription"], ["金粉矿物颜料纸本", "gold and mineral pigment on paper"]]
  }),
  buildMoreStyle({
    id: "madhubani", nameZh: "米提拉绘画", nameEn: "Madhubani Painting", type: "地域传统",
    period: "传统至今", year: 1600, region: "南亚", track: "全球地域传统",
    summary: "以双线轮廓、满版纹样和自然颜料记录神话、婚礼与地方生活。",
    recognition: "无留白满版、双线人物、鱼鸟花叶填充和鲜明平涂色。",
    traits: ["满版", "平面", "高饱和", "叙事"], fields: ["绘画", "装饰", "插画"],
    influencedBy: "印度米提拉地区女性壁画传统", influenced: "民间艺术市场与当代纺织设计", related: ["islamic-geometry", "mexican-folk"],
    palette: ["#c13c31", "#e1ad35", "#356f5b"], art: "islamic",
    visualSpec: [["米提拉民间绘画", "Madhubani folk painting"], ["无留白满版构图", "dense all-over composition without empty space"], ["双线人物与动植物纹样", "double-line figures and flora-fauna motifs"], ["天然红黄绿黑", "natural red yellow green and black palette"], ["手绘符号边框", "hand-drawn symbolic border"], ["粗纤维纸与天然颜料", "coarse paper and natural pigment texture"]]
  }),
  buildMoreStyle({
    id: "thangka", nameZh: "藏传唐卡", nameEn: "Tibetan Thangka Painting", type: "地域传统",
    period: "11 世纪至今", year: 1400, region: "东亚", track: "全球地域传统",
    summary: "依据严格仪轨和比例绘制宗教图像，以中心神祇和象征系统服务修行与传承。",
    recognition: "中心神祇、层级对称、密集光环、矿物宝石色与织锦边框。",
    traits: ["对称", "精密", "象征", "高饱和"], fields: ["绘画", "宗教艺术", "装饰"],
    influencedBy: "藏传佛教仪轨与喜马拉雅绘画", influenced: "宗教图像传承与文化研究", related: ["dunhuang", "byzantine"],
    palette: ["#a83232", "#225c7a", "#d1a63a"], art: "islamic",
    visualSpec: [["藏传唐卡绘画", "Tibetan Thangka painting"], ["严格中心层级对称", "strict centered hierarchical symmetry"], ["神祇莲座光环与云纹", "deity lotus throne halo and cloud motifs"], ["朱红群青石绿与金色", "vermilion ultramarine mineral green and gold"], ["仪轨题记", "ritual inscription"], ["矿物颜料金线与织锦", "mineral pigment gold line and brocade texture"]]
  }),
  buildMoreStyle({
    id: "mexican-muralism", nameZh: "墨西哥壁画运动", nameEn: "Mexican Muralism", type: "艺术运动",
    period: "1920–1950 年代", year: 1925, region: "拉丁美洲", track: "全球地域传统",
    summary: "以公共壁画讲述革命、劳动、民族身份和社会历史，强调集体可见性。",
    recognition: "宏大群像、强壮人物、对角运动、土红与深蓝公共叙事。",
    traits: ["叙事", "宏大", "动态", "强对比"], fields: ["公共艺术", "绘画", "海报"],
    influencedBy: "革命政治、前哥伦布艺术与文艺复兴壁画", influenced: "社会现实主义与公共艺术", related: ["realism", "street-art"],
    palette: ["#9d3d2e", "#234c68", "#c69a4c"], art: "constructivism",
    visualSpec: [["墨西哥壁画运动视觉", "Mexican Muralism visual language"], ["宏大对角群像构图", "monumental diagonal group composition"], ["劳动人物与社会叙事", "workers and social narrative"], ["土红深蓝与赭黄", "earth red deep blue and ochre"], ["公共标语式标题", "public slogan-like lettering"], ["湿壁画与粗灰泥质感", "fresco and rough plaster texture"]]
  }),
  buildMoreStyle({
    id: "mexican-folk", nameZh: "墨西哥民间艺术", nameEn: "Mexican Folk Art", type: "地域传统",
    period: "传统至今", year: 1800, region: "拉丁美洲", track: "全球地域传统",
    summary: "以节庆、宗教、动物与日常生活为主题，形成鲜艳、手工且富于象征的民间视觉。",
    recognition: "高饱和花卉、骨骼与动物形象、对称装饰和手绘不规则轮廓。",
    traits: ["高饱和", "装饰", "象征", "有机"], fields: ["装饰", "插画", "产品"],
    influencedBy: "原住民工艺、天主教图像与地方节庆", influenced: "包装、旅游与全球民艺设计", related: ["mexican-muralism", "madhubani"],
    palette: ["#d33b42", "#1a8b87", "#edb42f"], art: "pop",
    visualSpec: [["墨西哥民间艺术", "Mexican folk art"], ["中心对称装饰构图", "centered symmetrical ornamental composition"], ["花卉动物与节庆符号", "flowers animals and festival symbols"], ["亮红青绿与金黄", "bright red turquoise and golden yellow"], ["手绘节庆标题", "hand-painted festive lettering"], ["彩绘木雕与陶器质感", "painted woodcarving and ceramic texture"]]
  }),
  buildMoreStyle({
    id: "african-wax-print", nameZh: "非洲蜡染印花视觉", nameEn: "African Wax Print Aesthetic", type: "视觉文化",
    period: "19 世纪末至今", year: 1900, region: "非洲", track: "全球地域传统",
    summary: "以高对比色、重复图案和织物尺度形成横跨服饰、身份与商业传播的视觉语言。",
    recognition: "满版重复、几何与植物符号、清晰蜡裂纹和强烈互补色。",
    traits: ["满版", "几何", "高饱和", "重复"], fields: ["服装", "装饰", "品牌视觉"],
    influencedBy: "跨洲纺织贸易与非洲地方穿着文化", influenced: "时尚、包装与当代身份表达", related: ["afrofuturism", "op-art"],
    palette: ["#df8e22", "#185f74", "#b82f45"], art: "islamic",
    visualSpec: [["非洲蜡染印花视觉", "African wax print aesthetic"], ["连续满版重复构图", "continuous all-over repeat composition"], ["几何植物与象征图案", "geometric botanical and symbolic motifs"], ["橙黄钴蓝与洋红", "orange yellow cobalt and magenta"], ["粗体织物标签字", "bold textile-label typography"], ["蜡防染裂纹与棉布", "wax-resist crackle and cotton texture"]]
  }),
  buildMoreStyle({
    id: "afrofuturism", nameZh: "非洲未来主义", nameEn: "Afrofuturism", type: "视觉文化",
    period: "20 世纪后期至今", year: 1994, region: "非洲与全球", track: "数字与网络审美",
    summary: "通过科技、神话与黑人历史重写未来想象，连接身份、解放和宇宙叙事。",
    recognition: "未来服饰、非洲纹样、金属与珠饰、宇宙背景和强烈人物中心。",
    traits: ["未来", "高饱和", "象征", "戏剧"], fields: ["时尚", "电影", "插画"],
    influencedBy: "黑人科幻、音乐文化与非洲视觉传统", influenced: "电影、时尚、音乐与概念艺术", related: ["african-wax-print", "cyberpunk"],
    palette: ["#5f3b91", "#d49d2a", "#158b8f"], art: "y2k",
    visualSpec: [["非洲未来主义", "Afrofuturism"], ["英雄式中心人物构图", "heroic centered character composition"], ["未来服饰与非洲纹样", "futuristic attire with African motifs"], ["紫色金色与绿松石", "violet gold and turquoise palette"], ["几何未来标题", "geometric futuristic typography"], ["金属珠饰织物与宇宙光泽", "metal beadwork textiles and cosmic sheen"]]
  }),
  buildMoreStyle({
    id: "scandinavian-modern", nameZh: "斯堪的纳维亚现代主义", nameEn: "Scandinavian Modern", type: "设计运动",
    period: "1930–1970 年代", year: 1950, region: "欧洲", track: "商业与设计视觉",
    summary: "以人本功能、自然材料和简洁形式平衡现代生产与日常温度。",
    recognition: "浅色木材、柔和有机曲线、明亮空间和克制中性色。",
    traits: ["有机", "克制", "低饱和", "理性"], fields: ["产品", "空间", "品牌视觉"],
    influencedBy: "功能主义、地方工艺与北欧自然", influenced: "全球家居、生活方式与品牌设计", related: ["mid-century-modern", "minimalism"],
    palette: ["#d7c6a5", "#6e8477", "#bd7658"], art: "bauhaus",
    visualSpec: [["斯堪的纳维亚现代主义", "Scandinavian Modern design"], ["开放平衡与充足留白", "open balanced composition with ample space"], ["柔和有机功能形态", "soft organic functional forms"], ["浅木色灰绿与柔白", "light wood gray-green and soft white"], ["人文无衬线字体", "humanist sans-serif typography"], ["浅色木材羊毛与陶瓷", "light wood wool and ceramic texture"]]
  }),
  buildMoreStyle({
    id: "streamline-moderne", nameZh: "流线型现代主义", nameEn: "Streamline Moderne", type: "设计运动",
    period: "1930–1940 年代", year: 1935, region: "欧美", track: "商业与设计视觉",
    summary: "以空气动力学曲线、水平速度线和工业材料表达机器时代的效率与乐观。",
    recognition: "圆角体块、长水平线、镀铬饰条、海洋意象和速度感。",
    traits: ["有机", "动态", "未来", "理性"], fields: ["产品", "建筑", "广告"],
    influencedBy: "装饰艺术、交通工具与工业设计", influenced: "汽车、家电和复古未来视觉", related: ["art-deco", "atomic-age"],
    palette: ["#d8d4c7", "#2f7a87", "#a74434"], art: "art-nouveau",
    visualSpec: [["流线型现代主义", "Streamline Moderne"], ["水平延展与速度线构图", "horizontal composition with speed lines"], ["圆角流线和空气动力形态", "rounded aerodynamic forms"], ["象牙白海蓝与镀铬银", "ivory ocean blue and chrome silver"], ["细长几何标题字", "elongated geometric display type"], ["搪瓷镀铬与光滑玻璃", "enamel chrome and smooth glass texture"]]
  }),
  buildMoreStyle({
    id: "atomic-age", nameZh: "原子时代设计", nameEn: "Atomic Age Design", type: "设计运动",
    period: "1945–1965 年", year: 1955, region: "欧美", track: "商业与设计视觉",
    summary: "把原子、太空和战后消费乐观转化为活泼图案、产品与广告语言。",
    recognition: "回旋镖、星爆、轨道线、细脚家具和明快中世纪配色。",
    traits: ["几何", "动态", "明快", "未来"], fields: ["广告", "产品", "插画"],
    influencedBy: "太空竞赛、核时代想象与中世纪现代主义", influenced: "复古未来、动画背景和餐饮品牌", related: ["mid-century-modern", "retrofuturism"],
    palette: ["#e2a832", "#3b8790", "#d95d47"], art: "memphis",
    visualSpec: [["原子时代设计", "Atomic Age design"], ["不对称漂浮图形构图", "asymmetrical floating graphic composition"], ["星爆轨道与回旋镖形", "starbursts orbit lines and boomerang shapes"], ["芥末黄青绿与砖橙", "mustard teal and brick orange"], ["复古几何展示字", "retro geometric display type"], ["平版印刷与层压板质感", "lithographic print and laminate texture"]]
  }),
  buildMoreStyle({
    id: "new-wave-typography", nameZh: "新浪潮字体设计", nameEn: "New Wave Typography", type: "设计运动",
    period: "1970–1980 年代", year: 1980, region: "欧美", track: "商业与设计视觉",
    summary: "打破瑞士网格的中性秩序，用旋转、叠印和多重阅读路径制造视觉张力。",
    recognition: "断裂网格、斜排文字、尺度突变、图文叠压与强烈色块。",
    traits: ["不对称", "文字", "动态", "反叛"], fields: ["海报", "平面", "出版"],
    influencedBy: "瑞士国际主义、朋克和后现代设计", influenced: "实验排版、音乐视觉与数字编辑设计", related: ["swiss", "postmodernism"],
    palette: ["#e6463b", "#2e60a5", "#f0cd3d"], art: "constructivism",
    visualSpec: [["新浪潮字体设计", "New Wave Typography"], ["断裂网格与多重阅读路径", "broken grid with multiple reading paths"], ["旋转文字与尺度跳跃", "rotated type and abrupt scale shifts"], ["黑白配红蓝高对比", "black and white with red-blue contrast"], ["实验无衬线混排", "experimental mixed sans-serif typography"], ["错位叠印与纸张颗粒", "misregistered overprint and paper grain"]]
  }),
  buildMoreStyle({
    id: "punk-visual", nameZh: "朋克视觉", nameEn: "Punk Visual Style", type: "视觉文化",
    period: "1970 年代至今", year: 1977, region: "欧美", track: "商业与设计视觉",
    summary: "以低成本复制、剪贴和反权威文字构成直接、粗粝的 DIY 传播语言。",
    recognition: "撕纸拼贴、复印噪点、手写标语、安全别针和黑白红冲突。",
    traits: ["反叛", "粗粝", "文字", "强对比"], fields: ["音乐", "海报", "出版"],
    influencedBy: "达达、地下出版与朋克音乐", influenced: "独立杂志、时尚和抗议视觉", related: ["dada", "grunge-design"],
    palette: ["#171715", "#d8322d", "#dedbd1"], art: "constructivism",
    visualSpec: [["朋克 DIY 视觉", "punk DIY visual style"], ["反网格剪贴构图", "anti-grid cut-and-paste composition"], ["撕纸照片与手绘符号", "torn photos and hand-drawn marks"], ["黑白与单一猩红", "black and white with a single scarlet accent"], ["剪报字与粗暴手写", "ransom-note type and raw handwriting"], ["复印噪点胶带与折痕", "photocopy noise tape and fold marks"]]
  }),
  buildMoreStyle({
    id: "grunge-design", nameZh: "垃圾摇滚设计", nameEn: "Grunge Design", type: "视觉文化",
    period: "1990 年代", year: 1992, region: "欧美", track: "商业与设计视觉",
    summary: "以侵蚀字体、脏污纹理和非正式排版反抗数字设计的洁净与规则。",
    recognition: "磨损文字、污渍划痕、低清照片、叠印和暗沉土色。",
    traits: ["粗粝", "反叛", "不对称", "低饱和"], fields: ["音乐", "海报", "时尚"],
    influencedBy: "另类摇滚、朋克与早期桌面出版", influenced: "运动品牌、音乐视觉和复古网页", related: ["punk-visual", "digital-brutalism"],
    palette: ["#25231f", "#756b50", "#9e3d33"], art: "brutalism",
    visualSpec: [["九十年代垃圾摇滚设计", "1990s grunge design"], ["不稳定叠层与越界构图", "unstable layered composition with bleeding edges"], ["低清照片与侵蚀图形", "lo-fi photography and distressed graphics"], ["脏灰土褐与暗红", "dirty gray earth brown and dark red"], ["磨损粗体与打字机字", "distressed bold type and typewriter text"], ["划痕污渍与复印颗粒", "scratches stains and photocopy grain"]]
  }),
  buildMoreStyle({
    id: "skeuomorphism", nameZh: "拟物化设计", nameEn: "Skeuomorphism", type: "数字视觉趋势",
    period: "约 2007–2013 年", year: 2008, region: "全球", track: "数字与网络审美",
    summary: "用现实物件、材料和操作隐喻降低数字界面的学习成本。",
    recognition: "皮革木纹、金属按钮、缝线、高光阴影和立体控制件。",
    traits: ["写实", "高细节", "有机", "系统化"], fields: ["数字界面", "产品", "图标"],
    influencedBy: "工业产品、桌面隐喻与早期移动界面", influenced: "新拟物、游戏界面和数字怀旧", related: ["frutiger-aero", "neumorphism"],
    palette: ["#6c4e37", "#b9aa8d", "#496b78"], art: "y2k",
    visualSpec: [["拟物化数字设计", "skeuomorphic digital design"], ["实体控制面板式布局", "physical control-panel layout"], ["立体按钮旋钮与真实图标", "dimensional buttons knobs and realistic icons"], ["自然材质色与金属强调", "natural material colors with metallic accents"], ["清晰界面标签", "clear interface labeling"], ["皮革木纹金属与缝线", "leather wood metal and stitched texture"]]
  }),
  buildMoreStyle({
    id: "glassmorphism", nameZh: "玻璃拟态", nameEn: "Glassmorphism", type: "数字视觉趋势",
    period: "2020 年代", year: 2020, region: "全球", track: "数字与网络审美",
    summary: "以半透明表面、背景模糊和细亮边缘建立轻盈的数字层级。",
    recognition: "磨砂玻璃面板、透明叠层、柔和彩色背景与细白描边。",
    traits: ["未来", "轻盈", "系统化", "低饱和"], fields: ["数字界面", "品牌视觉", "广告"],
    influencedBy: "透明材质、系统界面和背景模糊技术", influenced: "金融科技、演示视觉与三维品牌", related: ["y2k", "neumorphism"],
    palette: ["#79a9cf", "#a888c4", "#e2e5e9"], art: "y2k",
    visualSpec: [["玻璃拟态视觉", "glassmorphism visual style"], ["半透明面板分层构图", "layered translucent panel composition"], ["圆角玻璃模块与悬浮界面", "rounded glass modules and floating interface"], ["冷蓝淡紫与柔白", "cool blue pale violet and soft white"], ["轻量无衬线界面字", "lightweight sans-serif interface type"], ["磨砂玻璃背景模糊与亮边", "frosted glass backdrop blur and luminous edges"]]
  }),
  buildMoreStyle({
    id: "neumorphism", nameZh: "新拟态", nameEn: "Neumorphism", type: "数字视觉趋势",
    period: "2019 年至今", year: 2019, region: "全球", track: "数字与网络审美",
    summary: "通过同色凸起、内凹和双向柔影，让界面控件仿佛从背景表面生长出来。",
    recognition: "低对比同色表面、柔和双阴影、内凹输入框和圆角按钮。",
    traits: ["克制", "系统化", "低饱和", "有机"], fields: ["数字界面", "图标", "产品"],
    influencedBy: "拟物化与极简界面", influenced: "概念 UI、仪表盘与三维图标", related: ["skeuomorphism", "glassmorphism"],
    palette: ["#d9dfe5", "#8fa3b4", "#f3f5f7"], art: "brutalism",
    visualSpec: [["新拟态界面", "neumorphic interface"], ["规则模块与充足间距", "regular modules with generous spacing"], ["同色凸起和内凹控件", "same-color raised and inset controls"], ["柔灰蓝低对比配色", "soft gray-blue low-contrast palette"], ["克制现代无衬线", "restrained modern sans-serif"], ["哑光表面与双向柔影", "matte surface with dual soft shadows"]]
  }),
  buildMoreStyle({
    id: "acid-graphics", nameZh: "酸性视觉", nameEn: "Acid Graphics", type: "数字视觉趋势",
    period: "2010 年代末至今", year: 2018, region: "全球", track: "数字与网络审美",
    summary: "以荧光色、液态金属、极端字体和数字噪声制造刺激而反常规的青年视觉。",
    recognition: "酸绿荧光色、镀铬变形、尖锐字体、过曝辉光和密集信息。",
    traits: ["高饱和", "反叛", "未来", "强对比"], fields: ["海报", "音乐", "时尚"],
    influencedBy: "锐舞文化、Y2K、实验排版和三维软件", influenced: "音乐节、潮流品牌与动态图形", related: ["y2k", "glitch-art"],
    palette: ["#b9f227", "#bd3ee5", "#202020"], art: "y2k",
    visualSpec: [["酸性视觉设计", "acid graphics"], ["密集越界与中心爆发构图", "dense edge-bleeding composition with central burst"], ["液态金属和尖锐变形图形", "liquid metal and sharp distorted forms"], ["酸绿电紫与深黑", "acid green electric violet and black"], ["极端压缩实验字体", "extreme condensed experimental typography"], ["镀铬辉光与数字噪点", "chrome glow and digital noise"]]
  }),
  buildMoreStyle({
    id: "steampunk", nameZh: "蒸汽朋克", nameEn: "Steampunk", type: "视觉文化",
    period: "1980 年代至今", year: 1987, region: "全球", track: "数字与网络审美",
    summary: "以维多利亚时代工业技术重写架空未来，将蒸汽机械、探险和手工工程结合。",
    recognition: "黄铜齿轮、蒸汽管线、皮革服饰、钟表结构和煤烟城市。",
    traits: ["未来", "怀旧", "精密", "戏剧"], fields: ["电影", "游戏", "插画"],
    influencedBy: "维多利亚工业、科幻文学与机械工艺", influenced: "角色设计、游戏和主题娱乐", related: ["retrofuturism", "cyberpunk"],
    palette: ["#8a5a32", "#b08a4a", "#30424a"], art: "baroque",
    visualSpec: [["蒸汽朋克视觉语言", "steampunk visual language"], ["机械结构层叠与深景构图", "layered mechanical structure with deep spatial composition"], ["黄铜齿轮管线与维多利亚服饰", "brass gears pipes and Victorian attire"], ["铜棕煤黑与暗青", "copper brown coal black and dark teal"], ["维多利亚衬线与机械铭牌", "Victorian serif and engraved machine labels"], ["黄铜皮革木材与煤烟", "brass leather wood and soot texture"]]
  }),
  buildMoreStyle({
    id: "retrofuturism", nameZh: "复古未来主义", nameEn: "Retrofuturism", type: "视觉文化",
    period: "20 世纪中期想象至今", year: 1960, region: "全球", track: "商业与设计视觉",
    summary: "从过去的科技想象回望未来，以乐观机器、太空旅行和年代错位制造魅力。",
    recognition: "流线飞船、圆顶城市、复古宇航服、射线图形和明亮工业色。",
    traits: ["未来", "怀旧", "几何", "明快"], fields: ["广告", "插画", "电影"],
    influencedBy: "太空时代广告、科幻杂志与工业设计", influenced: "游戏、品牌活动与当代科幻", related: ["atomic-age", "synthwave"],
    palette: ["#e0a931", "#3c8b93", "#d65c47"], art: "memphis",
    visualSpec: [["复古未来主义", "retrofuturism"], ["开阔地平线与英雄机器构图", "open horizon with heroic machine composition"], ["流线飞船圆顶与复古宇航服", "streamlined spacecraft domes and retro spacesuits"], ["暖黄青绿与珊瑚红", "warm yellow teal and coral red"], ["太空时代展示字体", "Space Age display typography"], ["喷漆金属与旧杂志印刷", "painted metal and vintage magazine print texture"]]
  }),
  buildMoreStyle({
    id: "anime", nameZh: "日系动画", nameEn: "Japanese Anime Aesthetic", type: "视觉文化",
    period: "20 世纪中期至今", year: 1980, region: "东亚", track: "数字与网络审美",
    summary: "以清晰角色设计、分镜语言和有限动画传统形成覆盖多题材的视觉体系。",
    recognition: "明确线稿、平涂阴影、夸张眼神、动态姿态和电影式背景。",
    traits: ["平面", "叙事", "动态", "高识别"], fields: ["动画", "插画", "游戏"],
    influencedBy: "漫画、电影分镜与有限动画", influenced: "全球动画、游戏和数字插画", related: ["manga", "superflat"],
    palette: ["#e96b70", "#5c8fc5", "#f0c85a"], art: "pop",
    visualSpec: [["日系动画视觉语言", "Japanese anime visual language"], ["电影分镜式动态构图", "cinematic storyboard-like dynamic composition"], ["清晰线稿与平涂角色", "clean linework and cel-shaded characters"], ["明快主色与环境色", "bright key colors with atmospheric hues"], ["简洁动画标题字", "clean anime title typography"], ["赛璐璐阴影与细腻背景", "cel shading with detailed painted background"]]
  }),
  buildMoreStyle({
    id: "manga", nameZh: "漫画视觉", nameEn: "Manga Aesthetic", type: "视觉文化",
    period: "20 世纪至今", year: 1960, region: "东亚", track: "商业与设计视觉",
    summary: "以分格、速度线、网点和表情符号组织连续叙事与强烈情绪。",
    recognition: "黑白线稿、漫画分格、速度线、网点阴影和夸张拟声字。",
    traits: ["平面", "动态", "叙事", "强对比"], fields: ["漫画", "出版", "插画"],
    influencedBy: "日本版画、连环画与电影剪辑", influenced: "动画、游戏和全球漫画文化", related: ["anime", "american-comics"],
    palette: ["#171715", "#f1efe8", "#cb3e36"], art: "ukiyo",
    visualSpec: [["漫画视觉语言", "manga visual language"], ["连续分格与速度线构图", "sequential panels and speed-line composition"], ["夸张表情与清晰墨线", "expressive faces and crisp ink linework"], ["黑白高对比配单一强调色", "high-contrast black and white with one accent"], ["拟声字与手绘标题", "sound-effect lettering and hand-drawn titles"], ["半调网点与印刷纸张", "halftone screentone and printed paper texture"]]
  }),
  buildMoreStyle({
    id: "american-comics", nameZh: "美式漫画", nameEn: "American Comic-book Art", type: "视觉文化",
    period: "1930 年代至今", year: 1940, region: "欧美", track: "商业与设计视觉",
    summary: "以英雄叙事、动态分格、粗重墨线和工业印刷色建立高冲击漫画语言。",
    recognition: "肌肉化人物、极端透视、粗黑轮廓、原色网点和爆炸拟声字。",
    traits: ["动态", "强对比", "高饱和", "叙事"], fields: ["漫画", "出版", "电影"],
    influencedBy: "报刊连环画、纸浆杂志与商业印刷", influenced: "电影、游戏和全球流行文化", related: ["pop-art", "manga"],
    palette: ["#d83b35", "#245e9b", "#edc63d"], art: "pop",
    visualSpec: [["美式漫画视觉语言", "American comic-book art"], ["动态分格与极端透视", "dynamic panels with extreme perspective"], ["英雄人物与粗黑墨线", "heroic figures with heavy black inks"], ["红黄蓝原色高对比", "high-contrast red yellow and blue primaries"], ["爆炸拟声字和粗体标题", "explosive sound effects and bold display type"], ["半调网点与旧漫画纸", "halftone dots and vintage comic paper"]]
  }),
  buildMoreStyle({
    id: "gothic-subculture", nameZh: "哥特亚文化视觉", nameEn: "Gothic Subculture Aesthetic", type: "视觉文化",
    period: "1980 年代至今", year: 1985, region: "欧美", track: "商业与设计视觉",
    summary: "从后朋克音乐、维多利亚意象与暗色浪漫中形成冷峻、戏剧化的身份视觉。",
    recognition: "黑色服饰、尖拱与蕾丝、苍白肤色、银饰和深红强调。",
    traits: ["戏剧", "低饱和", "神秘", "反叛"], fields: ["时尚", "音乐", "摄影"],
    influencedBy: "后朋克、哥特文学和维多利亚复兴", influenced: "时尚、音乐影像与网络亚文化", related: ["gothic", "dark-fantasy"],
    palette: ["#171719", "#6e2132", "#b8b6b0"], art: "baroque",
    visualSpec: [["哥特亚文化美学", "Gothic subculture aesthetic"], ["庄严中心与深暗留白", "solemn centered composition with deep dark space"], ["黑色蕾丝尖拱与银饰", "black lace pointed arches and silver jewelry"], ["黑灰酒红与苍白肤色", "black gray wine red and pale skin tones"], ["黑体与细长衬线混排", "blackletter mixed with elongated serif type"], ["天鹅绒蕾丝银器与旧石", "velvet lace silver and aged stone texture"]]
  }),
  buildMoreStyle({
    id: "dark-fantasy", nameZh: "暗黑奇幻", nameEn: "Dark Fantasy", type: "视觉文化",
    period: "20 世纪后期至今", year: 1980, region: "全球", track: "数字与网络审美",
    summary: "将奇幻世界与恐怖、衰败和道德不确定性结合，形成阴郁宏大的叙事视觉。",
    recognition: "巨大废墟、怪异生物、微小人物、冷暗天空和危险光源。",
    traits: ["戏剧", "神秘", "宏大", "低饱和"], fields: ["游戏", "电影", "插画"],
    influencedBy: "哥特文学、神话、恐怖和奇幻艺术", influenced: "游戏概念设计与影视美术", related: ["gothic-subculture", "surrealism"],
    palette: ["#20262b", "#5b3542", "#96733f"], art: "baroque",
    visualSpec: [["暗黑奇幻视觉语言", "dark fantasy visual language"], ["巨大环境压缩微小人物", "monumental environment dwarfing small figures"], ["废墟怪物与扭曲自然", "ruins creatures and distorted nature"], ["冷灰暗紫与旧金", "cold gray dark violet and aged gold"], ["古老尖锐衬线标题", "ancient sharp serif title"], ["风化石材盔甲与烟雾", "weathered stone armor and smoke texture"]]
  }),
  buildMoreStyle({
    id: "film-noir", nameZh: "黑色电影", nameEn: "Film Noir", type: "视觉文化",
    period: "1940–1950 年代", year: 1945, region: "欧美", track: "商业与设计视觉",
    summary: "以犯罪都市、道德暧昧和表现主义光影构成紧张而宿命的电影视觉。",
    recognition: "黑白高反差、百叶窗影、雨夜街道、倾斜机位和烟雾剪影。",
    traits: ["强对比", "戏剧", "神秘", "写实"], fields: ["电影", "摄影", "海报"],
    influencedBy: "德国表现主义、犯罪文学与都市摄影", influenced: "新黑色电影、广告和游戏视觉", related: ["expressionism", "cyberpunk"],
    palette: ["#171715", "#d8d7cf", "#7a252b"], art: "baroque",
    visualSpec: [["黑色电影视觉", "film noir visual style"], ["倾斜深景与强烈阴影构图", "canted deep-space composition with strong shadows"], ["侦探剪影与雨夜街道", "detective silhouette and rain-soaked street"], ["黑白高反差配暗红", "high-contrast black and white with dark red"], ["经典窄体电影标题", "classic condensed film title typography"], ["银盐颗粒烟雾与湿地反光", "silver-grain film smoke and wet reflections"]]
  }),
  buildMoreStyle({
    id: "cottagecore", nameZh: "田园核", nameEn: "Cottagecore", type: "数字视觉趋势",
    period: "2010 年代末至今", year: 2018, region: "全球", track: "数字与网络审美",
    summary: "以乡村手作、花园和缓慢生活回应数字压力，营造柔软理想化的日常。",
    recognition: "野花、亚麻、木屋、烘焙、柔和日光和低对比自然色。",
    traits: ["有机", "浪漫", "低饱和", "怀旧"], fields: ["摄影", "插画", "品牌视觉"],
    influencedBy: "乡村生活想象、手工复兴和社交媒体", influenced: "生活方式品牌、时尚和出版", related: ["romanticism", "wabi-sabi"],
    palette: ["#8ca077", "#d9b6a0", "#eee0bf"], art: "impressionism",
    visualSpec: [["田园核美学", "cottagecore aesthetic"], ["亲密自然场景与柔和留白", "intimate natural scene with soft breathing space"], ["野花木屋亚麻与手作物", "wildflowers cottage linen and handmade objects"], ["鼠尾草绿柔粉与奶白", "sage green dusty pink and creamy white"], ["温柔手写与古典衬线", "gentle script and classic serif type"], ["亚麻木材纸张与柔光颗粒", "linen wood paper and soft-light grain"]]
  }),
  buildMoreStyle({
    id: "dark-academia", nameZh: "暗黑学院", nameEn: "Dark Academia", type: "数字视觉趋势",
    period: "2010 年代至今", year: 2015, region: "全球", track: "数字与网络审美",
    summary: "将古典教育、旧图书馆和秋冬服饰组织成阴郁浪漫的知识生活想象。",
    recognition: "深木书架、旧书、呢料制服、烛光、阴天与棕黑调色。",
    traits: ["怀旧", "低饱和", "神秘", "克制"], fields: ["摄影", "时尚", "出版"],
    influencedBy: "古典学院、哥特文学与网络社群", influenced: "时尚、校园品牌与影视视觉", related: ["gothic-subculture", "cottagecore"],
    palette: ["#352c25", "#73543d", "#b39b75"], art: "baroque",
    visualSpec: [["暗黑学院美学", "Dark Academia aesthetic"], ["旧图书馆纵深与静态构图", "deep old-library setting with static composition"], ["旧书制服雕塑与烛台", "old books uniforms sculpture and candlesticks"], ["深棕墨绿与羊皮纸色", "deep brown forest green and parchment"], ["古典高对比衬线体", "classical high-contrast serif type"], ["深色木材呢料纸张与灰尘", "dark wood tweed paper and dust texture"]]
  }),
  buildMoreStyle({
    id: "dreamcore", nameZh: "梦核", nameEn: "Dreamcore", type: "数字视觉趋势",
    period: "2010 年代末至今", year: 2020, region: "全球", track: "数字与网络审美",
    summary: "用熟悉场景的错位、柔焦和低清图像模拟梦境中亲切又不稳定的体验。",
    recognition: "空旷草地、漂浮文字、柔焦天空、童年物件和不合逻辑尺度。",
    traits: ["超现实", "低保真", "神秘", "怀旧"], fields: ["数字艺术", "音乐", "插画"],
    influencedBy: "网络怀旧、超现实主义与低清影像", influenced: "短视频、音乐封面与独立游戏", related: ["weirdcore", "liminal-space"],
    palette: ["#8fb8cf", "#d8b4cc", "#d8d08a"], art: "surrealism",
    visualSpec: [["梦核美学", "dreamcore aesthetic"], ["空旷中心与不合逻辑空间", "empty centered composition with illogical space"], ["漂浮物童年符号与巨大天空", "floating objects childhood symbols and vast sky"], ["柔蓝粉紫与褪色黄", "soft blue pink-violet and faded yellow"], ["模糊低清提示文字", "blurred lo-fi prompt-like text"], ["柔焦压缩噪点与旧照片", "soft focus compression noise and old-photo texture"]]
  }),
  buildMoreStyle({
    id: "weirdcore", nameZh: "怪核", nameEn: "Weirdcore", type: "数字视觉趋势",
    period: "2010 年代末至今", year: 2020, region: "全球", track: "数字与网络审美",
    summary: "以低清拼贴、异常文本和不协调物体制造难以解释的网络陌生感。",
    recognition: "像素化房间、眼睛符号、乱码警告、强闪光和比例异常。",
    traits: ["反叛", "低保真", "强对比", "神秘"], fields: ["数字艺术", "音乐", "游戏"],
    influencedBy: "早期互联网、故障艺术与恐怖影像", influenced: "网络叙事、独立游戏与音乐视觉", related: ["dreamcore", "glitch-art"],
    palette: ["#6d8bb8", "#bc3d65", "#b7c445"], art: "y2k",
    visualSpec: [["怪核网络美学", "weirdcore internet aesthetic"], ["不稳定中心与异常裁切", "unstable centered composition with uncanny cropping"], ["眼睛符号乱码与错位物体", "eye symbols corrupted text and displaced objects"], ["脏蓝洋红与酸绿", "dirty blue magenta and acid green"], ["错误提示与像素文字", "error-message and pixel typography"], ["低清压缩闪光与扫描噪点", "lo-fi compression flash and scan noise"]]
  }),
  buildMoreStyle({
    id: "liminal-space", nameZh: "阈限空间", nameEn: "Liminal Space Aesthetic", type: "数字视觉趋势",
    period: "2010 年代末至今", year: 2019, region: "全球", track: "数字与网络审美",
    summary: "聚焦本应短暂停留却空无一人的过渡空间，触发熟悉、孤独与不安并存的感受。",
    recognition: "空走廊、夜间商场、重复门窗、荧光灯和没有人物的深层空间。",
    traits: ["写实", "留白", "神秘", "低饱和"], fields: ["摄影", "数字艺术", "游戏"],
    influencedBy: "建筑摄影、网络恐怖与集体怀旧", influenced: "独立游戏、电影场景和网络叙事", related: ["dreamcore", "film-noir"],
    palette: ["#b7ad83", "#6f8586", "#6d665d"], art: "surrealism",
    visualSpec: [["阈限空间美学", "liminal space aesthetic"], ["空旷重复透视构图", "empty repetitive perspective composition"], ["无人走廊门窗与过渡空间", "deserted corridors doorways and transitional spaces"], ["褪色黄绿与冷灰", "faded yellow-green and cool gray"], ["稀少功能标识", "sparse functional signage"], ["荧光灯噪点旧地毯与塑料", "fluorescent noise worn carpet and plastic texture"]]
  })
];

STYLE_DATA.push(...MORE_STYLE_DATA);

const LATEST_STYLE_IDS = [
  "ancient-egyptian", "classical-greek", "byzantine", "gothic", "renaissance", "mannerism", "baroque", "rococo", "neoclassicism", "romanticism",
  "realism", "pre-raphaelite", "impressionism", "post-impressionism", "symbolism", "arts-crafts", "art-nouveau", "fauvism", "expressionism", "cubism",
  "futurism", "dada", "constructivism", "suprematism", "de-stijl", "bauhaus", "surrealism", "art-deco", "abstract-expressionism", "color-field",
  "pop-art", "op-art", "minimalism", "conceptual-art", "neo-expressionism", "photorealism", "postmodernism", "lowbrow", "psychedelic", "street-art",
  "ink-wash", "gongbi", "dunhuang", "chinese-new-year-print", "guochao", "ukiyo-e", "rinpa", "nihonga", "wabi-sabi", "kawaii",
  "superflat", "korean-minhwa", "persian-miniature", "mughal-miniature", "madhubani", "islamic-geometry", "thangka", "mexican-muralism", "mexican-folk", "african-wax-print",
  "afrofuturism", "swiss", "mid-century-modern", "scandinavian-modern", "streamline-moderne", "atomic-age", "new-wave-typography", "memphis", "punk-visual", "grunge-design",
  "architectural-brutalism", "brutalism", "flat-design", "corporate-memphis", "material-design", "skeuomorphism", "glassmorphism", "neumorphism", "acid-graphics", "glitch-art",
  "generative-art", "cyberpunk", "steampunk", "solarpunk", "retrofuturism", "synthwave", "vaporwave", "y2k", "frutiger-aero", "anime",
  "manga", "american-comics", "gothic-subculture", "dark-fantasy", "film-noir", "cottagecore", "dark-academia", "dreamcore", "weirdcore", "liminal-space"
];

const latestStylesById = new Map(STYLE_DATA.map((style) => [style.id, style]));
const missingLatestStyles = LATEST_STYLE_IDS.filter((id) => !latestStylesById.has(id));
if (missingLatestStyles.length) throw new Error(`Missing latest styles: ${missingLatestStyles.join(", ")}`);

STYLE_DATA.splice(0, STYLE_DATA.length, ...LATEST_STYLE_IDS.map((id) => latestStylesById.get(id)));

const nameOverrides = {
  postmodernism: ["后现代主义", "Postmodernism"],
  psychedelic: ["迷幻艺术", "Psychedelic Art"],
  memphis: ["孟菲斯设计", "Memphis Design"],
  "architectural-brutalism": ["粗野主义", "Brutalism"]
};
Object.entries(nameOverrides).forEach(([id, [nameZh, nameEn]]) => {
  const style = STYLE_DATA.find((item) => item.id === id);
  style.nameZh = nameZh;
  style.nameEn = nameEn;
});

STYLE_DATA.find((style) => style.id === "material-design").type = "数字设计风格";

const relationOverrides = {
  "classical-greek": ["renaissance", "neoclassicism"],
  byzantine: ["gothic", "thangka"],
  cubism: ["expressionism", "futurism"],
  "grunge-design": ["punk-visual", "brutalism"]
};
Object.entries(relationOverrides).forEach(([id, related]) => {
  STYLE_DATA.find((style) => style.id === id).related = related;
});

FILTER_GROUPS.type = [...new Set(STYLE_DATA.map((style) => style.type))];
FILTER_GROUPS.region = [...new Set(STYLE_DATA.map((style) => style.region))];
FILTER_GROUPS.fields = [...new Set(STYLE_DATA.flatMap((style) => style.fields))];
