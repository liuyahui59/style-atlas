# 风格谱 Style Atlas

面向视觉创作者的艺术设计风格图鉴与 AI Prompt 翻译工具。

## 项目结构

- `index.html`：可交互高保真原型
- `styles.css`：响应式视觉与组件样式
- `data.js`、`data-extra.js`、`data-more.js`、`aesthetic-styles.js`、`chinese-visual-directions.js`：123 种风格与视觉方向内容及分类数据
- `visual-genes.js`：经过逐条审校的中英文视觉基因
- `prompt-options.js`：构图、视角、镜头、光照、色彩等独立控制项
- `app.js`：筛选、详情、收藏、对比和 Prompt 生成交互
- `artworks.js`：基础风格配图数据
- `assets/artworks/`：风格配图与内部维护记录
- `assets/`：站点图标、分享封面与风格配图
- `scripts/`：内容校验与配图处理脚本

## 运行

直接打开 `index.html` 即可使用。为了获得与测试环境一致的效果，也可以在本目录运行：

```bash
python3 -m http.server 4173
```

然后访问 `http://localhost:4173`。

修改风格或 Prompt 数据后，可运行：

```bash
node scripts/validate-content.mjs
```

## 部署

项目根目录包含 GitHub Pages 所需的 `CNAME`、`.nojekyll`、`404.html`、`robots.txt` 和 `sitemap.xml`。自定义域名配置为 `styleatlas.art`。

- 正式域名：`https://styleatlas.art/`
- Pages 备用地址：`https://liuyahui59.github.io/style-atlas/`
- GitHub Pages 从 `main` 分支根目录直接发布。

## 风格配图

123 种风格与视觉方向均配置了用于呈现视觉语言的配图。网页只展示风格图片，不显示作品、作者、年代、机构、版权或来源信息；`assets/artworks/manifest.json` 仅作为项目内部维护记录。
