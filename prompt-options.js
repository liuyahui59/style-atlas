const PROMPT_CONTROL_GROUPS = [
  {
    id: "composition", label: "构图", color: "#d44b3e",
    options: [
      ["中心构图", "centered composition"],
      ["对称构图", "symmetrical composition"],
      ["三分法构图", "rule-of-thirds composition"],
      ["动态对角线构图", "dynamic diagonal composition"],
      ["稳定三角形构图", "stable triangular composition"],
      ["强引导线构图", "strong leading-line composition"],
      ["框中框构图", "frame-within-a-frame composition"],
      ["大面积留白", "generous negative space"],
      ["满版构图", "full-bleed all-over composition"],
      ["前中后景层叠", "layered foreground midground and background"],
      ["放射式构图", "radial composition"],
      ["严格网格构图", "strict grid composition"]
    ]
  },
  {
    id: "viewpoint", label: "视点", color: "#bc6b2d",
    options: [
      ["平视视点", "eye-level viewpoint"],
      ["低机位仰视", "low-angle viewpoint"],
      ["高机位俯视", "high-angle viewpoint"],
      ["正上方俯拍", "top-down overhead view"],
      ["鸟瞰视点", "bird's-eye view"],
      ["贴地虫视", "worm's-eye view"],
      ["荷兰角倾斜视点", "Dutch-angle viewpoint"],
      ["主观第一人称视点", "first-person point of view"]
    ]
  },
  {
    id: "shot", label: "景别", color: "#a47a28",
    options: [
      ["极近特写", "extreme close-up"],
      ["特写", "close-up shot"],
      ["近景", "medium close-up"],
      ["中景", "medium shot"],
      ["全身景别", "full-body shot"],
      ["全景", "wide shot"],
      ["大远景建立镜头", "extreme wide establishing shot"]
    ]
  },
  {
    id: "lens", label: "镜头", color: "#77772f",
    options: [
      ["14mm 超广角镜头", "14mm ultra-wide-angle lens"],
      ["24mm 广角镜头", "24mm wide-angle lens"],
      ["35mm 纪实镜头", "35mm documentary lens"],
      ["50mm 标准镜头", "50mm standard lens"],
      ["85mm 人像镜头", "85mm portrait lens"],
      ["135mm 长焦镜头", "135mm telephoto lens"],
      ["微距镜头", "macro lens"],
      ["鱼眼镜头", "fisheye lens"],
      ["移轴镜头", "tilt-shift lens"]
    ]
  },
  {
    id: "depth", label: "景深", color: "#4d8351",
    options: [
      ["浅景深、背景虚化", "shallow depth of field with background bokeh"],
      ["深景深、全画面清晰", "deep focus with the entire scene sharp"],
      ["柔和散景光斑", "soft bokeh highlights"],
      ["焦点由前景过渡到主体", "focus transition from foreground to subject"],
      ["微缩模型式浅景深", "miniature-effect shallow depth of field"]
    ]
  },
  {
    id: "lighting", label: "光照", color: "#2c8472",
    options: [
      ["自然日光", "natural daylight"],
      ["柔和漫射光", "soft diffused lighting"],
      ["硬质方向光", "hard directional lighting"],
      ["低调光", "low-key lighting"],
      ["高调光", "high-key lighting"],
      ["强烈逆光", "strong backlighting"],
      ["戏剧性侧光", "dramatic side lighting"],
      ["轮廓光", "rim lighting"],
      ["伦勃朗光", "Rembrandt lighting"],
      ["体积光束", "volumetric light rays"],
      ["霓虹侧光与轮廓光", "neon side light and rim light"],
      ["黄金时刻暖光", "warm golden-hour lighting"],
      ["蓝调时刻冷光", "cool blue-hour lighting"],
      ["摄影棚柔光箱", "studio softbox lighting"]
    ]
  },
  {
    id: "color", label: "色彩关系", color: "#2f6fb0",
    options: [
      ["单色配色", "monochromatic color palette"],
      ["邻近色配色", "analogous color palette"],
      ["互补色配色", "complementary color palette"],
      ["分裂互补配色", "split-complementary color palette"],
      ["三角色配色", "triadic color palette"],
      ["低饱和配色", "muted low-saturation palette"],
      ["高饱和配色", "high-saturation palette"],
      ["冷色调", "cool color palette"],
      ["暖色调", "warm color palette"],
      ["强烈冷暖对比", "strong warm-cool contrast"],
      ["柔和粉彩配色", "soft pastel palette"],
      ["黑白配单一强调色", "black and white with a single accent color"]
    ]
  },
  {
    id: "form", label: "造型", color: "#5c63a8",
    options: [
      ["自然写实造型", "naturalistic realistic forms"],
      ["基础几何造型", "geometric forms"],
      ["柔软有机造型", "soft organic forms"],
      ["扁平化造型", "flat simplified forms"],
      ["夸张比例造型", "exaggerated proportions"],
      ["流线型造型", "streamlined forms"],
      ["碎片化切面造型", "fragmented faceted forms"],
      ["模块化重复造型", "modular repeated forms"],
      ["抽象非具象造型", "abstract non-representational forms"]
    ]
  },
  {
    id: "medium", label: "媒介与技法", color: "#8d5b9e",
    options: [
      ["写实摄影", "realistic photography"],
      ["油画厚涂", "impasto oil painting"],
      ["透明水彩", "transparent watercolor painting"],
      ["水墨画", "ink wash painting"],
      ["不透明水粉", "opaque gouache painting"],
      ["木版画", "woodblock print"],
      ["丝网印刷", "screen print"],
      ["混合媒介拼贴", "mixed-media collage"],
      ["纯色矢量插画", "flat vector illustration"],
      ["像素艺术", "pixel art"],
      ["黏土三维渲染", "clay-style 3D render"],
      ["照片级三维渲染", "photorealistic 3D render"]
    ]
  },
  {
    id: "texture", label: "材质与纹理", color: "#a24f73",
    options: [
      ["洁净光滑表面", "clean smooth surface"],
      ["细腻纸张颗粒", "fine paper grain"],
      ["粗粝印刷纹理", "rough printed texture"],
      ["可见画布纹理", "visible canvas texture"],
      ["拉丝金属", "brushed metal texture"],
      ["镜面铬金属", "mirror-polished chrome"],
      ["透明与磨砂玻璃", "clear and frosted glass"],
      ["柔软半透明塑料", "soft translucent plastic"],
      ["天然木纹", "natural wood grain"],
      ["粗糙混凝土", "rough concrete texture"],
      ["织物纤维", "woven fabric texture"],
      ["模拟胶片颗粒", "analog film grain"]
    ]
  },
  {
    id: "mood", label: "氛围与情绪", color: "#935542",
    options: [
      ["宁静克制", "calm and restrained atmosphere"],
      ["紧张压迫", "tense and oppressive atmosphere"],
      ["神秘幽深", "mysterious and enigmatic atmosphere"],
      ["浪漫柔和", "romantic and gentle atmosphere"],
      ["怀旧温暖", "nostalgic and warm atmosphere"],
      ["梦幻超现实", "dreamlike surreal atmosphere"],
      ["诡异不安", "uncanny and unsettling atmosphere"],
      ["活泼俏皮", "playful and energetic atmosphere"],
      ["庄严肃穆", "solemn and ceremonial atmosphere"],
      ["宏大史诗", "grand epic atmosphere"],
      ["明亮乐观", "bright optimistic atmosphere"],
      ["忧郁孤独", "melancholic and solitary atmosphere"]
    ]
  }
].map((group) => ({
  ...group,
  options: group.options.map(([zh, en]) => ({ zh, en }))
}));
