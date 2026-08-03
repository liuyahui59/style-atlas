# 风格谱 Style Atlas

面向视觉创作者的艺术设计风格图鉴与 AI Prompt 翻译工具。

## 项目结构

- `index.html`：可交互高保真原型
- `styles.css`：响应式视觉与组件样式
- `data.js`、`data-extra.js`、`data-more.js`、`aesthetic-styles.js`、`chinese-visual-directions.js`、`data-expansion.js`：原始候选内容
- `strict-catalog.js`：已审定风格的白名单、风格分类、大地域与视觉史数据
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

浏览器只加载生成后的 `style-runtime-data.js`。修改风格源数据后，依次运行：

```bash
npm run build:runtime
npm run build:prompts
npm run build:styles
npm run check
```

不要把原始数据脚本重新加入 `index.html`；它们只用于生成、审校和校验。

## 风格配图

主库风格只在拥有一一对应的配图时显示图片，未匹配条目显示“暂无配图”。网页只展示风格图片，不显示作品、作者、年代、机构、版权或来源信息；`assets/artworks/manifest.json` 仅作为项目内部维护记录。
