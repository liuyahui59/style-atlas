const CHINESE_VISUAL_DIRECTION_CONFIGS = [
  {
    id: "blue-green-landscape", nameZh: "青绿山水", nameEn: "Blue-Green Landscape Painting",
    period: "7–18 世纪", year: 700, summary: "以层叠空间、细线轮廓与石青石绿矿物设色建立清峻明丽的东方空间感。", recognition: "高视点层叠空间、清晰轮廓、石青石绿块面与少量朱砂淡金细节。",
    traits: ["留白", "层叠", "低饱和", "手工"], fields: ["绘画", "插画", "出版", "品牌视觉"], related: ["ink-wash", "gongbi"], palette: ["#315F67", "#628B62", "#D7C8A4"], artworkRef: "ink-wash",
    influencedBy: "隋唐山水传统、矿物颜料与宫廷绘画", influenced: "后世山水设色、壁画修复与当代东方视觉",
    genes: { composition: ["高视点散点空间", "前中后层叠", "云水式负空间"], form: ["细线勾勒", "层叠块面", "概括体积"], color: ["石青", "石绿", "少量朱砂淡金"], type: ["克制题跋", "印章式点色"], texture: ["矿物颗粒", "绢本", "哑光设色"] },
    visualGenes: [["高视点层叠空间与流动负形分隔", "high-viewpoint layered space divided by flowing negative shapes"], ["细而连续的轮廓与概括块面体积", "fine continuous contours with simplified planar volume"], ["石青石绿配少量朱砂与淡金", "azurite blue and malachite green with restrained cinnabar and pale gold"], ["均匀平面光与克制的局部微光", "even flat illumination with restrained local glints"], ["矿物颗粒、绢本与哑光设色", "mineral granulation, silk ground, and matte color layers"], ["按需使用克制题跋或印章式点色", "restrained inscription or seal-like accent only when requested"]],
    controls: { composition: "采用高视点散点空间和前中后层叠关系，用云水式负空间分隔用户已有元素，保持一个明确主焦点。", form: "仅将用户已有对象处理为细而连续的轮廓、层叠块面和概括体积；若用户未指定山水，不新增山峰或亭台。", color: "石青、石绿、孔雀蓝、朱砂、绢本米白，淡金仅用于小面积轮廓或节点。", lighting: "均匀柔和的平面光，弱化投影，以矿物色深浅和金线微光区分层次。", material: "绢本或熟宣上的矿物颜料，细颗粒、哑光主体与局部淡金反光。", typography: "仅在用户要求文字时使用克制题跋或印章式点色，保持用户原文准确可读。", boundary: "用户未指定山水时，不新增山峰、流水、亭台、舟船或人物；只迁移层叠空间、轮廓方式与矿物设色。", negative: "新增山水题材，随机亭台人物，纯黑水墨，霓虹色，油画厚涂，照片写实，塑料渐变，满幅金色" }
  },
  {
    id: "song-court-painting", nameZh: "宋画院体", nameEn: "Song Court Painting Aesthetic",
    period: "10–13 世纪", year: 1000, summary: "以精微观察、小景聚焦和温润层染形成安静、克制而高度准确的视觉语言。", recognition: "小尺度焦点、大片静空、自然比例、精细轮廓与温润低饱和设色。",
    traits: ["留白", "精密", "低饱和", "自然"], fields: ["绘画", "插画", "出版", "文化展览"], related: ["gongbi", "blue-green-landscape"], palette: ["#D8CCB2", "#637364", "#A66D52"], artworkRef: "gongbi",
    influencedBy: "宋代院体绘画、格物观察与绢本设色", influenced: "工笔传统、博物绘画与当代东方插画",
    genes: { composition: ["偏心小景", "大片静空", "稳定浅空间"], form: ["自然比例", "精细轮廓", "透明层染"], color: ["绢本暖白", "淡赭", "灰绿"], type: ["小尺度题跋"], texture: ["细绢", "薄层矿物色", "透明水色"] },
    visualGenes: [["偏心小景与充足静空", "off-center intimate focus with generous quiet space"], ["自然比例、精细轮廓与柔和层染", "natural proportion, precise contours, and soft layered washes"], ["暖白淡赭配花青与灰绿", "warm white and pale ochre with muted blue and gray-green"], ["自然漫射光与轻透阴影", "natural diffuse light with light transparent shadows"], ["细绢、薄层矿物色与透明水色", "fine silk, thin mineral pigment, and transparent water color"], ["按需使用避开焦点的小尺度题跋", "small inscription kept clear of the focal point only when requested"]],
    controls: { composition: "以偏心小景或稳定浅空间组织用户已有元素，保留充足空域，避免平均铺满画面。", form: "保持用户主体真实比例，以精细轮廓、局部结构观察和柔和层染塑造，不进行卡通化或夸张变形。", color: "绢本暖白、淡赭、花青、灰绿和极少朱砂，整体低饱和、局部清亮。", lighting: "自然漫射光，明暗转折缓慢，阴影轻而透明，不使用强烈舞台聚光。", material: "细绢或熟宣、薄层矿物色与透明水色，表面细腻柔亮。", typography: "仅在用户要求文字时使用小尺度题跋，避开主体并保持原文不变。", boundary: "不因‘院体’自动增加花鸟、庭院、器物或古人；所有精微描绘只作用于用户已有主体。", negative: "新增花鸟庭院，粗黑轮廓，高饱和商业色，卡通比例，强烈聚光，复杂满版背景，油画厚涂" }
  },
  {
    id: "baimiao", nameZh: "白描", nameEn: "Baimiao Line Drawing",
    period: "9 世纪–当代", year: 900, summary: "以单色线条的粗细、浓淡、转折与疏密独立完成结构和体积表达。", recognition: "几乎不设色，以连续墨线的线宽、浓淡和节奏完整描述对象。",
    traits: ["留白", "线性", "克制", "手工"], fields: ["绘画", "插画", "出版", "纹样设计"], related: ["ink-wash", "gongbi"], palette: ["#242321", "#8D8980", "#E8E1D2"], artworkRef: "ink-wash",
    influencedBy: "中国人物画线描传统与书法用笔", influenced: "工笔画稿、连环画与当代线性插画",
    genes: { composition: ["开放留白", "轮廓层级", "单一重点"], form: ["线宽变化", "连续转折", "结构准确"], color: ["墨黑", "淡墨", "纸白"], type: ["细雅书写"], texture: ["细毫毛笔", "宣纸", "轻微渗化"] },
    visualGenes: [["开放留白与清晰轮廓层级", "open negative space with a clear contour hierarchy"], ["连续墨线的粗细、浓淡与转折变化", "continuous ink lines with controlled width, density, and turning rhythm"], ["墨黑淡墨与纸白的单色关系", "monochrome relationships among black ink, pale ink, and paper white"], ["不用写实投影并以线条疏密表达体积", "volume expressed through line density without realistic cast shadows"], ["细毫笔触、纸纤维与轻微墨线渗化", "fine brushwork, paper fiber, and subtle ink bleeding"], ["按需使用与线描一致的细雅书写", "delicate writing consistent with the line system only when requested"]],
    controls: { composition: "使用开放留白和清晰轮廓层级，减少背景信息，使用户主体与关键动作成为唯一视觉重点。", form: "严格保留主体数量、身份、结构和动作，仅用不同线宽、浓淡与转折表现外轮廓、内部结构和体积。", color: "墨黑、淡墨与纸白为主，可使用极少朱砂印记；不使用大面积彩色填充。", lighting: "不依赖写实光影，体积主要由线条疏密、转折与重叠关系表达。", material: "细毫毛笔、宣纸或绢本，保留轻微墨线渗化和干湿变化。", typography: "仅在用户要求文字时使用与线描一致的细雅书写，不添加无关题款。", boundary: "不改变用户主体解剖、轮廓和数量，不新增装饰背景；视觉变化必须由线条系统完成。", negative: "大面积设色，灰阶涂抹，炭笔素描，随机排线，草稿噪线，厚重阴影，断裂轮廓，新增装饰" }
  },
  {
    id: "jiehua", nameZh: "界画", nameEn: "Jiehua Architectural Drawing",
    period: "10–14 世纪", year: 1050, summary: "以尺规般的精密直线、模块重复和轴测层级把复杂结构转化为清晰秩序。", recognition: "稳定平行线、梁柱式模块、轴测空间与细密结构节点。",
    traits: ["精密", "几何", "系统化", "线性"], fields: ["绘画", "建筑", "插画", "信息设计"], related: ["structuralism", "gongbi"], palette: ["#252A28", "#A68C62", "#637D67"], artworkRef: "gongbi",
    influencedBy: "中国建筑绘画、尺规技术与工匠制图", influenced: "建筑表现、图谱插画与结构化视觉系统",
    genes: { composition: ["水平垂直轴线", "模块重复", "轴测层级"], form: ["精密框架", "板件节点", "平行线"], color: ["墨线", "淡赭", "石绿"], type: ["楷书", "工程标注式文字"], texture: ["尺规墨线", "熟宣", "薄层淡彩"] },
    visualGenes: [["严格轴线、模块重复与可读空间层级", "strict axes, repeated modules, and readable spatial hierarchy"], ["精密框架、板件节点与稳定平行线", "precise frames, panel joints, and stable parallel lines"], ["墨线纸白配淡赭石绿与低饱和朱红", "ink and paper white with pale ochre, mineral green, and muted vermilion"], ["均匀分析光与克制清晰的投影边缘", "even analytical light with restrained crisp shadow edges"], ["尺规墨线、细纸绢与薄层矿物淡彩", "ruled ink lines, fine paper or silk, and thin mineral washes"], ["按需使用小尺度楷书或标注式文字", "small regular-script or annotation-like type only when requested"]],
    controls: { composition: "以严格水平、垂直和斜向轴线组织用户已有元素，建立模块重复、前后遮挡与可读的结构层级。", form: "仅把用户已有对象转译为精密框架、板件、节点和重复模块；保留主体辨识度，不自动建筑化为宫殿。", color: "墨线、纸白、淡赭、石绿和低饱和朱红，颜色服务于结构分区。", lighting: "均匀分析性照明，投影边缘清楚但克制，用于解释结构深度。", material: "尺规墨线、熟宣或绢本、薄层矿物淡彩，表面平整细腻。", typography: "仅在用户要求文字时使用小尺度楷书或工程标注式文字，保持原文准确。", boundary: "用户未指定建筑时，不新增楼阁、宫殿、桥梁或家具；只借用精密线性结构和空间组织。", negative: "新增宫殿楼阁，透视畸变，歪斜手绘线，随机机械零件，复杂装饰堆叠，厚重写实材质，科幻界面" }
  },
  {
    id: "shanhaijing-compendium", nameZh: "山海经图谱美学", nameEn: "Shanhaijing Illustrated Compendium Aesthetic",
    period: "古代典籍想象–当代", year: 300, summary: "把古籍图谱的陈列、套色和纸面秩序转化为可控的视觉系统，而不自动添加神怪题材。", recognition: "图谱式陈列、清晰外轮廓、古籍分区与有限矿物套色。",
    traits: ["叙事", "平面", "手工", "怀旧"], fields: ["插画", "出版", "游戏", "文化展览"], related: ["chinese-new-year-print", "dunhuang"], palette: ["#C6AD78", "#8B352A", "#2F5960"], artworkRef: "chinese-new-year-print",
    influencedBy: "古代地理博物典籍、刻本图谱与民间想象", influenced: "神话出版、博物插画与当代世界观设计",
    genes: { composition: ["图谱陈列", "古籍分区", "边栏留白"], form: ["清晰外轮廓", "侧向观察", "概括纹理"], color: ["旧纸黄", "朱砂", "石青石绿"], type: ["篆隶", "刻本字形"], texture: ["木刻", "粗纤维纸", "套色错位"] },
    visualGenes: [["图谱式陈列、边栏分区与明确阅读顺序", "compendium-style display, marginal divisions, and a clear reading order"], ["清晰外轮廓、正交观察与概括纹理", "clear silhouettes, orthographic observation, and simplified textures"], ["旧纸黄配墨黑朱砂石青与石绿", "aged paper yellow with black ink, cinnabar, mineral blue, and green"], ["均匀平面光与清楚纸面层次", "even flat illumination with clearly separated paper layers"], ["木刻墨迹、粗纤维纸与轻微套色错位", "woodcut ink, coarse-fiber paper, and slight registration shifts"], ["仅按原文使用篆隶或刻本字形", "seal, clerical, or block-print type using exact supplied text only"]],
    controls: { composition: "将用户已有主体置于清晰图谱版面中，以留白、边栏和少量标记区建立阅读顺序；保持用户指定数量。", form: "仅以古代图谱式轮廓、侧向或正交观察和概括纹理描绘用户主体，不增加头、肢体、角、翼或其他异兽特征。", color: "旧纸黄、墨黑、朱砂、石青、石绿与少量赭色，采用有限套色。", lighting: "平面均匀光，不追求写实投影，以轮廓和纸面层次建立清晰度。", material: "古籍木刻、粗纤维纸、轻微套色错位、墨迹渗化与年代磨损。", typography: "只有用户提供文字时才生成对应原文，可使用篆隶或刻本字形；不生成伪古文和乱码。", boundary: "不自动添加异兽、神祇、山川、图腾或说明文字；用户主体是什么就描绘什么。", negative: "随机异兽，新增头角翅膀，西方奇幻怪物，伪古文乱码，霓虹色，3D 游戏建模，复杂背景叙事" }
  },
  {
    id: "archaic-bronze-mythic", nameZh: "上古青铜神话美学", nameEn: "Archaic Bronze Mythic Aesthetic",
    period: "公元前 16–前 2 世纪", year: -1200, summary: "以礼制对称、铸造线纹和铜绿金属表面建立厚重、神秘而可控的神话感。", recognition: "强轴线、厚重轮廓、重复线纹、青铜铜绿与少量错金银。",
    traits: ["对称", "粗粝", "装饰", "强对比"], fields: ["产品", "插画", "游戏", "空间"], related: ["shanhaijing-compendium", "cloisonne-enamel"], palette: ["#365B50", "#3A332A", "#B28A45"], artworkRef: "islamic-geometry",
    influencedBy: "商周青铜铸造、礼制器物与早期神话想象", influenced: "传统纹样、当代神话视觉与文化产品设计",
    genes: { composition: ["礼制轴线", "中心对称", "环形层级"], form: ["厚重块面", "凹凸线纹", "铸造接缝"], color: ["深青铜", "铜绿", "暗金"], type: ["铭文式方整字形"], texture: ["铸造青铜", "自然氧化", "错金银"] },
    visualGenes: [["礼制般稳定的轴线与环形层级", "ritual-like stable axes and concentric hierarchy"], ["厚重块面、凹凸线纹与铸造接缝", "weighty masses, recessed and raised lines, and cast seams"], ["深青铜铜绿焦黑配少量暗金", "dark bronze, verdigris, and charred black with restrained aged gold"], ["低调侧硬光与金属边缘擦光", "low-key hard sidelight with metallic edge glints"], ["自然氧化、细密腐蚀与局部抛光", "natural oxidation, fine corrosion, and selectively polished edges"], ["仅按原文使用方整铭文式字形", "square inscription-like type using exact supplied text only"]],
    controls: { composition: "使用礼制般稳定的中心、轴线或环形结构，令用户已有元素形成层级对称和紧凑重复节奏。", form: "仅将用户已有对象处理为厚重块面、凸起与凹入线纹、铸造接缝和对称几何，不新增具体图腾。", color: "深青铜、铜绿、焦黑、暗赭，少量错金银用于关键轮廓和节点。", lighting: "低调侧向硬光或擦边光，突出浮雕深度、氧化颗粒和金属边缘。", material: "铸造青铜、自然铜绿、细密腐蚀、错金银和局部抛光边缘。", typography: "仅在用户要求文字时使用铭文式方整字形，保持原文，不生成虚构铭文。", boundary: "不自动添加青铜器、饕餮、龙纹、祭祀人物或礼器；仅迁移对称结构、铸造线纹和金属表面。", negative: "新增礼器图腾，随机饕餮龙纹，崭新亮金，蒸汽朋克齿轮，塑料金属，霓虹灯，复杂祭祀场面" }
  },
  {
    id: "daoist-immortal-realm", nameZh: "道教仙境美学", nameEn: "Daoist Immortal-Realm Aesthetic",
    period: "4 世纪–当代", year: 400, summary: "通过层叠空域、流动曲线、青绿朱砂和柔和雾光建立超脱感，而不依赖固定神话角色。", recognition: "纵向深远空域、层层虚实、流动曲线、青绿朱砂与淡金柔光。",
    traits: ["留白", "流动", "梦境", "低饱和"], fields: ["插画", "游戏", "影视", "文化展览"], related: ["blue-green-landscape", "dunhuang"], palette: ["#315E67", "#607D5A", "#A13F31"], artworkRef: "dunhuang",
    influencedBy: "道教图像、山水空间与绢本矿物设色", influenced: "东方幻想、影视概念与沉浸式文化视觉",
    genes: { composition: ["纵向上升", "环形回游", "层叠深远"], form: ["修长轮廓", "柔和转折", "秩序曲线"], color: ["石青石绿", "朱砂", "少量淡金"], type: ["疏朗书写"], texture: ["绢本矿物色", "透明水色", "柔雾哑光"] },
    visualGenes: [["垂直上升、环形回游与层叠深远关系", "vertical ascent, circular flow, and layered spatial recession"], ["修长流动轮廓、柔和转折与秩序曲线", "elongated flowing contours, soft turns, and ordered curves"], ["石青石绿朱砂夜蓝与少量淡金", "mineral blue, green, cinnabar, night blue, and restrained pale gold"], ["柔和顶部天光、轮廓辉光与分层雾化", "soft top light, contour glow, and layered atmospheric diffusion"], ["绢本矿物色、透明水色与细金线", "mineral pigment on silk, transparent washes, and fine gold lines"], ["按需使用疏朗书写并保持原文", "spacious calligraphic treatment preserving exact text only when requested"]],
    controls: { composition: "以垂直上升、环形回游或层叠深远关系组织用户已有元素，保留大片呼吸空间和单一视觉中心。", form: "只让用户已有对象具有修长流动轮廓、柔和转折和秩序化曲线，不附加仙人、法器或神兽特征。", color: "石青、石绿、朱砂、夜蓝、云白与少量淡金，控制饱和度和金色面积。", lighting: "柔和顶部天光、局部轮廓辉光和分层雾化，不设置多个竞争光源。", material: "绢本矿物色、透明水色、细金线和柔雾般哑光表面。", typography: "仅在用户要求文字时使用疏朗书写或符图式排布，保持用户原文，不生成符咒。", boundary: "不自动添加仙人、宫阙、仙鹤、法器、符咒或可识别云纹；神话感只通过空间、曲线、色光表达。", negative: "新增仙人宫殿仙鹤，符咒乱码，西方天使城堡，霓虹科幻，过量云海，金色满版，多重强光源" }
  },
  {
    id: "cloisonne-enamel", nameZh: "景泰蓝美学", nameEn: "Cloisonne Enamel Aesthetic",
    period: "14 世纪–当代", year: 1450, summary: "以金属丝闭合分区、宝石色珐琅和受控高光形成精密而高识别的表面语言。", recognition: "细金属丝包围闭合色区，深蓝底与宝石色珐琅并置。",
    traits: ["装饰", "精密", "高饱和", "手工"], fields: ["产品", "包装", "品牌视觉", "数字艺术"], related: ["art-deco", "islamic-geometry"], palette: ["#165B82", "#267C70", "#B88A35"], artworkRef: "islamic-geometry",
    influencedBy: "金属掐丝工艺、珐琅烧制与宫廷器物", influenced: "珠宝、产品表面与数字材质设计",
    genes: { composition: ["闭合色区", "疏密分区", "清晰主轮廓"], form: ["连续金属丝", "闭合曲面", "结构分隔"], color: ["宝蓝", "孔雀绿", "朱红金色"], type: ["金丝字形"], texture: ["烧制珐琅", "釉面颗粒", "抛光金属"] },
    visualGenes: [["按结构划分大小有序的闭合色区", "ordered closed color cells divided according to structure"], ["连续金属丝分隔的清晰轮廓与曲面", "clear contours and curved cells divided by continuous metal wire"], ["宝蓝孔雀绿朱红象牙白与金色", "royal blue, peacock green, vermilion, ivory, and gold"], ["受控影棚光、釉面小高光与锐利金属反光", "controlled studio light, small enamel highlights, and crisp metallic reflections"], ["掐丝金属、烧制珐琅与细微釉面颗粒", "cloison wire, fired enamel, and fine glaze granulation"], ["按需使用清晰金丝字形或独立标签", "clear wire-formed lettering or a separate label only when requested"]],
    controls: { composition: "按用户主体自身结构划分大小有序的闭合色区，保持主轮廓清楚，避免平均碎片化。", form: "仅将用户已有对象的轮廓和内部结构转化为连续金属丝分隔的闭合曲面，不改变主体身份和数量。", color: "宝蓝、孔雀绿、朱红、象牙白和金色，以深蓝稳定大面积背景或主体色区。", lighting: "受控影棚光，珐琅产生小面积镜面高光，金属丝边缘锐利反光，阴影干净。", material: "掐丝金属、烧制珐琅、细微釉面颗粒和抛光金属边缘。", typography: "仅在用户要求文字时将原文作为清晰金丝字形或独立标签，不以纹样破坏可读性。", boundary: "不自动添加花瓶、盘器、龙凤、花卉或传统边框；景泰蓝语言只附着于用户已有对象。", negative: "新增花瓶龙凤花卉，缺少金属丝分区，塑料渐变，玻璃拟态，大面积刺眼高光，随机碎片，文字变纹样" }
  },
  {
    id: "mother-of-pearl-lacquer", nameZh: "螺钿漆器美学", nameEn: "Mother-of-Pearl Lacquer Aesthetic",
    period: "8 世纪–当代", year: 750, summary: "以黑漆留底、虹彩薄片和断续闪光形成深暗、精细且随视角变化的表面语言。", recognition: "大片黑漆负空间与沿轮廓聚集的青绿紫红虹彩嵌片。",
    traits: ["装饰", "强对比", "精密", "手工"], fields: ["产品", "包装", "品牌视觉", "数字艺术"], related: ["cloisonne-enamel", "art-deco"], palette: ["#111416", "#267C79", "#A45B85"], artworkRef: "art-deco",
    influencedBy: "漆艺、贝壳薄片镶嵌与东亚器物传统", influenced: "珠宝、收藏包装与高端数字材质",
    genes: { composition: ["黑漆留底", "局部高密度", "疏密对比"], form: ["薄片嵌纹", "断续轮廓", "关键节点闪光"], color: ["漆黑", "青绿蓝紫", "玫红银白"], type: ["嵌片字", "金线字"], texture: ["多层黑漆", "贝壳嵌片", "抛光表面"] },
    visualGenes: [["大片深色留底与局部高密度嵌片", "broad dark ground with locally dense inlay"], ["沿轮廓和结构节点排列的薄片嵌纹", "thin inlay fragments aligned to contours and structural nodes"], ["漆黑配青绿蓝紫玫红与银白虹彩", "lacquer black with teal, blue-violet, rose, and silver iridescence"], ["低调侧光、连续漆面反射与锐利彩光", "low-key sidelight, continuous lacquer reflection, and crisp colored glints"], ["多层黑漆、薄贝壳嵌片与细刻接缝", "layered black lacquer, thin shell inlay, and finely engraved joins"], ["按需使用可读嵌片字或金线字", "legible inlay or gold-line lettering only when requested"]],
    controls: { composition: "以黑漆大底和局部高密度嵌片形成疏密对比，让用户主体轮廓在暗色空间中清晰出现。", form: "仅沿用户已有对象的轮廓、内部结构和关键节点排列薄片嵌纹，保留大块完整黑面。", color: "漆黑为主，螺钿呈青绿、蓝紫、玫红和银白虹彩，可加极少金线。", lighting: "低调侧光，黑漆产生连续柔亮反射，贝壳碎片产生方向变化明显的锐利彩光。", material: "多层黑漆、薄贝壳嵌片、细刻线、抛光表面与微小手工接缝。", typography: "仅在用户要求文字时使用可读的嵌片或金线字，不生成无关题款。", boundary: "不自动添加漆盒、家具、花鸟、山水或装饰边框；只把黑漆与虹彩嵌片作用于现有主体。", negative: "新增漆盒家具花鸟，彩色亮片噪声，均匀满铺螺钿，白色背景，塑料表面，彩虹渐变，过曝闪光" }
  },
  {
    id: "chinese-papercut", nameZh: "剪纸美学", nameEn: "Chinese Papercut Aesthetic",
    period: "6 世纪–当代", year: 600, summary: "以连续剪影、正负形互锁和可剪切连接把对象压缩为清晰、可复制的平面语言。", recognition: "单色高对比剪影、内部镂空、连接桥与正负形节奏。",
    traits: ["平面", "手工", "强对比", "装饰"], fields: ["插画", "包装", "品牌视觉", "文化展览"], related: ["chinese-new-year-print", "baimiao"], palette: ["#B62F2A", "#F0E5D3", "#282421"], artworkRef: "chinese-new-year-print",
    influencedBy: "民间剪纸、节令装饰与纸张工艺", influenced: "图标、海报、包装与动态图形",
    genes: { composition: ["连续剪影", "正负形互锁", "相连整体"], form: ["内部镂空", "连接桥", "连续轮廓"], color: ["朱红", "纸白", "单色高对比"], type: ["可连接剪切字形"], texture: ["纤维纸", "剪切毛边", "手工折痕"] },
    visualGenes: [["一个或少量相连整体与正负形层级", "one or a few connected masses with a positive-negative hierarchy"], ["连续外轮廓、内部镂空与可靠连接桥", "continuous outer contours, internal cutouts, and reliable connecting bridges"], ["朱红纸白或用户指定的单色高对比", "vermilion and paper white or another user-specified monochrome contrast"], ["均匀平面光与极轻纸边投影", "even flat light with only a very slight paper-edge shadow"], ["纤维纸、细小剪切毛边与手工折痕", "fiber paper, fine cut edges, and handmade fold traces"], ["按需使用可连接可剪切且清晰的字形", "connected, cuttable, and legible lettering only when requested"]],
    controls: { composition: "将用户已有元素组织为一个或少量相连的整体剪影，以正负形和留白建立清晰层级。", form: "严格保留主体数量、动作和辨识特征，把内部细节简化为可剪切的孔洞、连接桥和连续轮廓。", color: "朱红与纸白为经典方案，也可使用用户指定的单色与高对比底色；避免多色竞争。", lighting: "平面均匀光，可使用极轻微纸边投影说明层次，不塑造写实体积。", material: "纤维纸、细小剪切毛边、手工折痕和哑光表面。", typography: "仅在用户要求文字时把原文设计为可连接、可剪切且清晰可读的字形。", boundary: "不自动增加花卉、生肖、窗花边框或节庆符号；所有镂空必须来自用户已有主体结构。", negative: "新增花卉生肖边框，断开漂浮碎片，多色渐变，写实体积，厚重阴影，塑料表面，随机孔洞，不可读文字" }
  },
  {
    id: "chinese-shadow-puppetry", nameZh: "皮影美学", nameEn: "Chinese Shadow Puppetry Aesthetic",
    period: "11 世纪–当代", year: 1050, summary: "以扁平侧向轮廓、合理分节、皮革镂刻和单一背光形成清晰的透光舞台语言。", recognition: "薄而平的侧向造型、关节分区、透明染色和暖色背光。",
    traits: ["平面", "叙事", "手工", "强对比"], fields: ["插画", "动画", "影视", "文化展览"], related: ["chinese-papercut", "chinese-new-year-print"], palette: ["#D2A852", "#A73D31", "#264B3D"], artworkRef: "chinese-new-year-print",
    influencedBy: "中国皮影戏、镂刻染色与民间舞台表演", influenced: "动画、戏剧视觉与当代光影装置",
    genes: { composition: ["浅层舞台", "侧向观察", "清晰剪影"], form: ["扁平分节", "镂刻孔洞", "描线结构"], color: ["暖黄", "朱红", "翠绿墨黑"], type: ["平面戏牌式字形"], texture: ["染色皮革", "细线连接", "半透明幕面"] },
    visualGenes: [["浅层舞台式空间与清晰剪影关系", "shallow stage-like space with clearly separated silhouettes"], ["薄而扁平的分节结构、镂刻孔洞与描线", "thin flat segmented construction with cutouts and drawn details"], ["暖黄朱红墨黑翠绿与少量蓝色", "warm yellow, vermilion, black, jade green, and restrained blue"], ["单一暖背光穿透半透明表面", "a single warm backlight transmitted through a translucent surface"], ["染色皮革、细线连接与轻微手工磨损", "dyed leather, fine connections, and subtle handmade wear"], ["按需使用清晰平面戏牌式字形", "clear flat playbill-style lettering only when requested"]],
    controls: { composition: "采用浅层舞台式空间和清晰剪影关系，用户指定镜头优先；未指定时可使用近侧向观察。", form: "仅将用户已有对象扁平化并按合理结构分节，以镂刻孔洞和描线表现细节，不新增肢体或操纵杆。", color: "暖黄、朱红、墨黑、翠绿与少量蓝色，色块透明但边缘清晰。", lighting: "单一背光穿透半透明皮革，轮廓深而清楚，背景均匀发亮，避免正面写实光。", material: "染色皮革、镂刻孔洞、细线连接、轻微磨损和半透明幕布。", typography: "仅在用户要求文字时使用平面戏牌式字形，保持原文可读，不添加戏台标题。", boundary: "不自动添加幕布、戏台、操纵杆、乐师或其他角色；皮影特征只改变已有主体的平面结构和透光材质。", negative: "新增戏台操纵杆角色，木偶线，厚重3D体积，不透明油画，多个光源，写实皮肤，复杂背景，随机关节" }
  },
  {
    id: "blue-white-porcelain", nameZh: "青花瓷美学", nameEn: "Blue-and-White Porcelain Aesthetic",
    period: "14 世纪–当代", year: 1350, summary: "以瓷白留底、钴蓝线描、浓淡分水和釉下柔边建立清爽稳定的双色视觉语言。", recognition: "温润瓷白、钴蓝轮廓与分水、轻微釉下晕散和克制高光。",
    traits: ["留白", "手工", "低饱和", "精密"], fields: ["产品", "包装", "插画", "品牌视觉"], related: ["gongbi", "cloisonne-enamel"], palette: ["#F0EEE7", "#245487", "#7C9AB2"], artworkRef: "nihonga",
    influencedBy: "元明清瓷器、釉下钴料与绘瓷工艺", influenced: "陶瓷设计、包装、时尚与当代平面视觉",
    genes: { composition: ["瓷白负空间", "环形节奏", "清晰主图"], form: ["钴蓝线描", "块面分水", "釉下柔边"], color: ["瓷白", "浓淡钴蓝", "少量灰蓝"], type: ["钴蓝书写", "印章式字形"], texture: ["白瓷胎", "釉下钴料", "光滑釉面"] },
    visualGenes: [["大面积瓷白负空间与清晰双色层级", "broad porcelain-white negative space with a clear two-color hierarchy"], ["钴蓝线描、浓淡分水与轻微柔边", "cobalt linework, graded washes, and subtly softened edges"], ["瓷白与不同浓度钴蓝的限定配色", "a limited palette of porcelain white and varied cobalt blue"], ["柔和漫射光与小面积釉面高光", "soft diffuse light with small controlled glaze highlights"], ["釉下钴料、白瓷胎与细小烧制差异", "underglaze cobalt, white porcelain body, and subtle firing variation"], ["按需使用清晰钴蓝书写或印章式字形", "clear cobalt writing or seal-like type only when requested"]],
    controls: { composition: "以瓷白负空间和钴蓝主图形成清晰层级，可使用环形或带状节奏，但用户指定构图优先。", form: "仅用钴蓝线描和块面分水处理用户已有对象，保持主体轮廓、数量、动作和身份，不把主体变成器皿。", color: "瓷白与不同浓度钴蓝为主，允许极少灰蓝；不加入多彩釉、大片金色或霓虹色。", lighting: "柔和漫射光与小面积釉面高光，阴影淡而干净，保留白瓷通透感。", material: "釉下钴料、白瓷胎、轻微水分晕散、细小烧制差异与光滑釉面。", typography: "仅在用户要求文字时使用清晰钴蓝书写或印章式字形，保持用户原文。", boundary: "不自动添加花瓶、盘沿、龙凤、莲花或缠枝纹；青花视觉只作用于用户已有主体和明确背景区域。", negative: "把主体变成花瓶盘子，新增龙凤莲花，多彩釉，大片金色，照片转印，过度裂纹，霓虹蓝，塑料陶瓷" }
  }
];

function createChineseVisualDirection(config) {
  const visualGenes = config.visualGenes.map(([zh, en]) => ({ zh, en }));
  return {
    ...config,
    type: "地域与传统",
    region: "东亚 · 中国",
    track: "东亚视觉传统",
    visualGenes,
    artwork: { src: `assets/artworks/${config.id}.png` }
  };
}

const chineseVisualDirections = CHINESE_VISUAL_DIRECTION_CONFIGS.map(createChineseVisualDirection);
STYLE_DATA.push(...chineseVisualDirections);

const traditionalCategory = STYLE_CATEGORY_GROUPS.find((group) => group.name === "地域与传统");
traditionalCategory?.ids.push(...chineseVisualDirections.map((style) => style.id));

FILTER_GROUPS.region = [...new Set(STYLE_DATA.map((style) => style.region))];
FILTER_GROUPS.traits = [...new Set(STYLE_DATA.flatMap((style) => style.traits))];
FILTER_GROUPS.fields = [...new Set(STYLE_DATA.flatMap((style) => style.fields))];
