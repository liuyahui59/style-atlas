# 风格谱 Style Atlas

面向视觉创作者的艺术设计风格图鉴与 AI Prompt 翻译工具。

## 项目结构

- `index.html`：可交互高保真原型
- `local/`：Style Atlas 本地版介绍、交互体验与下载页面
- `styles.css`：响应式视觉与组件样式
- `data.js`、`data-extra.js`、`data-more.js`、`aesthetic-styles.js`、`chinese-visual-directions.js`、`data-expansion.js`：原始候选内容
- `strict-catalog.js`：已审定风格的白名单、风格分类、大地域与视觉史数据
- `visual-genes.js`：经过逐条审校的中英文视觉基因
- `prompt-options.js`：构图、视角、镜头、光照、色彩等独立控制项
- `app.js`：筛选、详情、收藏、对比和 Prompt 生成交互
- `billing.mjs`：额度账户、订单、Webhook 幂等、额度冻结与结算
- `billing-ui.js`：Prompt 工坊和风格混合器共用的额度购买入口
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

### Runware 图片生成

`server.mjs` 是 GitHub Pages 之外的 API 服务。它负责保存 Runware 密钥、返回可选模型，并代理 `/api/generate`；浏览器只收到图片 URL、模型和本次成本。前端默认把生产 API 指向 `https://api.styleatlas.art`，本地运行时自动使用当前 origin。

1. 复制 `.env.example` 为 `.env.local`，填入 `RUNWARE_API_KEY`、随机的 `SESSION_SECRET` 和支付平台密钥。密钥只放 API 服务环境变量，不放 GitHub Pages。
2. 根据实际部署域名设置 `ALLOWED_ORIGINS`，并把 `RUNWARE_MODELS` 配成要开放给用户的 Runware AIR 模型 JSON 数组。
3. 海外支付配置 Stripe Checkout 的 `STRIPE_SECRET_KEY` 和 `STRIPE_WEBHOOK_SECRET`；大陆支付配置 Ping++ 的 `PINGXX_SECRET_KEY`、`PINGXX_APP_ID` 和 `PINGXX_PUBLIC_KEY`。两边都需要在平台后台把 Webhook 指向：`/api/billing/webhooks/stripe`、`/api/billing/webhooks/pingxx`。
4. 在一台可运行 Node 22+ 的服务上执行 `npm start`，将 `api.styleatlas.art` 指向该服务；GitHub Pages 继续发布本目录的静态文件。账务默认写入 `data/style-atlas.sqlite`，该文件已加入 `.gitignore`。

仓库同时提供 `Dockerfile` 和 `render.yaml`。当前 Blueprint 使用 Render 免费实例，便于在没有银行卡时先验证 Runware 生图和模型切换；该模式关闭强制额度扣减，且免费实例没有持久化磁盘，不适合正式收费。正式上线时，将 `plan` 改为支持持久化磁盘的套餐、恢复 `/app/data` 磁盘并设置 `BILLING_REQUIRED=true`，再填入 `RUNWARE_API_KEY`、`SESSION_SECRET`、Stripe 和 Ping++ 密钥。Render 服务生成后，在域名 DNS 中添加 `api.styleatlas.art` 的 CNAME，指向 Render 提供的服务域名。其他 VPS 或 Railway 等平台也可以直接使用 Dockerfile，务必给 `/app/data` 配置持久化磁盘。

### 收费与生图流程

用户首次访问会获得一个服务端签名的游客会话。购买窗口提供海外 Stripe 和大陆微信/支付宝两种地区通道；支付平台的服务端 Webhook 验证成功后，订单才会给账户增加额度。生图前服务端冻结预计额度，Runware 成功后按实际 `cost` 结算，失败或超时释放冻结额度。支付成功跳转页本身不会给账户加钱。

当前实现适合单实例 MVP。SQLite 适合先上线验证需求；需要多实例、后台对账和正式会员登录时，应把 `billing.mjs` 的存储层迁移到 Postgres，并将游客会话替换成正式登录（例如 Supabase Auth、Clerk 或自有邮箱登录）。Ping++ 的商户资质、微信/支付宝通道和退款规则需要在大陆主体下单独申请，Stripe 也需要按账户地区完成商户审核。

默认模型包括 GPT Image 2.5 Flare、GPT Image 2.5 Sunburst、GPT Image 2、Recraft V4.1 和 FLUX 3 Image。模型下拉框来自 `/api/models`，因此新增模型无需改前端代码。服务端用 Runware 的 `imageInference` REST 请求，并通过 `includeCost: true` 将单次实际成本回传到页面。

本地检查接口：

```bash
curl http://localhost:4173/api/models
curl http://localhost:4173/api/health
curl -X POST http://localhost:4173/api/generate \
  -H 'Content-Type: application/json' \
  -d '{"prompt":"a modern poster for a design festival","ratio":"方形 1:1","model":"openai:gpt-image@2.5-flare"}'
```

如果 API 不部署在 `api.styleatlas.art`，修改公开配置文件 `api-config.js` 中的 `window.STYLE_ATLAS_API_BASE` 即可切换前端 API 地址；这里不要放 Runware 密钥。

修改风格或 Prompt 数据后，可运行：

```bash
node scripts/validate-content.mjs
```

## 部署

项目根目录包含 GitHub Pages 所需的 `CNAME`、`.nojekyll`、`404.html`、`robots.txt` 和 `sitemap.xml`。自定义域名配置为 `styleatlas.art`。

- 正式域名：`https://styleatlas.art/`
- 本地版页面：`https://styleatlas.art/local/`
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
