import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const siteUrl = "https://styleatlas.art";
const lastModified = "2026-07-31";
const checkOnly = process.argv.includes("--check");
const dataFiles = ["data.js", "data-extra.js", "data-more.js", "visual-genes.js", "artworks.js", "aesthetic-styles.js", "chinese-visual-directions.js", "style-prompt-data.js"];

const context = vm.createContext({});
for (const file of dataFiles) {
  vm.runInContext(await readFile(resolve(root, file), "utf8"), context, { filename: file });
}

const styles = JSON.parse(JSON.stringify(vm.runInContext("STYLE_DATA", context)));
const stylesById = new Map(styles.map((style) => [style.id, style]));
const buildPrompt = vm.runInContext("buildStylePromptText", context);
const buildNegative = vm.runInContext("buildStyleNegativeText", context);
const stylePromptsById = new Map(styles.map((style) => [style.id, {
  zh: buildPrompt(style, { language: "zh" }),
  en: buildPrompt(style, { language: "en" }),
  negative: buildNegative("zh")
}]));
const expectedFiles = new Map();

for (const style of styles) {
  expectedFiles.set(`styles/${style.id}/index.html`, renderStylePage(style));
}
expectedFiles.set("styles/index.html", renderStyleIndex());
expectedFiles.set("sitemap.xml", renderSitemap());

const homepagePath = resolve(root, "index.html");
const homepage = await readFile(homepagePath, "utf8");
const directoryMarkup = styles
  .map((style) => `              <a href="styles/${style.id}/">${escapeHtml(style.nameZh)} · ${escapeHtml(style.nameEn)}</a>`)
  .join("\n");
const updatedHomepage = homepage.replace(
  /(<!-- STYLE_DIRECTORY_START -->)[\s\S]*?(<!-- STYLE_DIRECTORY_END -->)/,
  `$1\n${directoryMarkup}\n              $2`
);

if (updatedHomepage === homepage && !homepage.includes(directoryMarkup)) {
  throw new Error("Could not locate the style directory markers in index.html");
}
expectedFiles.set("index.html", updatedHomepage);

const mismatches = [];
for (const [relativePath, content] of expectedFiles) {
  const absolutePath = resolve(root, relativePath);
  if (checkOnly) {
    const existing = await readFile(absolutePath, "utf8").catch(() => null);
    if (existing !== content) mismatches.push(relativePath);
    continue;
  }
  await mkdir(dirname(absolutePath), { recursive: true });
  await writeFile(absolutePath, content);
}

if (checkOnly && mismatches.length) {
  console.error(`Generated style pages are stale or missing:\n${mismatches.join("\n")}`);
  process.exitCode = 1;
} else if (checkOnly) {
  console.log(`Validated ${styles.length} static style pages, directory links, and sitemap`);
} else {
  console.log(`Generated ${styles.length} static style pages plus the style directory and sitemap`);
}

function renderStylePage(style) {
  const title = `${style.nameZh}（${style.nameEn}）：视觉特征、历史与 AI Prompt | 风格谱`;
  const description = `${style.nameZh}风格图鉴：${style.summary}${style.recognition} 查看构图、造型、配色、字体、材质与 AI 绘图 Prompt。`;
  const canonical = `${siteUrl}/styles/${style.id}/`;
  const optimizedImagePath = getArtworkVariantPath(style, "optimized");
  const thumbnailImagePath = getArtworkVariantPath(style, "thumbs");
  const imageUrl = `${siteUrl}/${optimizedImagePath}`;
  const promptOutput = stylePromptsById.get(style.id);
  const relatedStyles = style.related.map((id) => stylesById.get(id)).filter(Boolean);
  const coreGuide = buildCoreGuide(style);
  const recognitionAxes = buildRecognitionAxes(style);
  const geneGuides = buildGeneGuides(style);
  const palettePlan = buildPalettePlan(style);
  const contentFitGuides = buildContentFitGuides(style);
  const riskGuides = getRiskGuides(style);
  const comparisonGuides = buildComparisonGuides(style, relatedStyles);
  const mediaTranslations = buildMediaTranslations(style, recognitionAxes);
  const promptParts = buildPromptRecipe(style, recognitionAxes);
  const promptErrors = buildPromptErrors(style, relatedStyles);
  const historyGuide = buildHistoryGuide(style);
  const keywords = [style.nameZh, style.nameEn, style.type, style.region, ...style.traits, ...style.fields].join(", ");
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: `${style.nameZh}（${style.nameEn}）风格图鉴`,
        description,
        image: imageUrl,
        url: canonical,
        inLanguage: "zh-CN",
        dateModified: lastModified,
        author: { "@type": "Organization", name: "风格谱 Style Atlas", url: siteUrl },
        publisher: { "@type": "Organization", name: "风格谱 Style Atlas", url: siteUrl },
        mainEntityOfPage: canonical,
        about: [style.type, style.region, ...style.traits],
        keywords
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "风格谱", item: `${siteUrl}/` },
          { "@type": "ListItem", position: 2, name: "风格图鉴", item: `${siteUrl}/#atlas` },
          { "@type": "ListItem", position: 3, name: style.nameZh, item: canonical }
        ]
      }
    ]
  };

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="keywords" content="${escapeHtml(keywords)}" />
    <meta name="theme-color" content="#f3f3f0" />
    <meta property="og:type" content="article" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:site_name" content="风格谱 Style Atlas" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${imageUrl}" />
    <meta property="og:image:alt" content="${escapeHtml(`${style.nameZh}风格视觉示例`)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href="${canonical}" />
    <link rel="icon" href="../../assets/favicon.svg" type="image/svg+xml" />
    <link rel="preload" as="image" href="../../${thumbnailImagePath}" media="(max-width: 720px)" fetchpriority="high" />
    <link rel="preload" as="image" href="../../${optimizedImagePath}" media="(min-width: 721px)" fetchpriority="high" />
    <link rel="manifest" href="../../site.webmanifest" />
    <link rel="stylesheet" href="../../styles.css" />
    <link rel="stylesheet" href="../../style-pages.css" />
    <title>${escapeHtml(title)}</title>
    <script type="application/ld+json">${safeJson(structuredData)}</script>
    ${renderAnalytics()}
    ${renderLocalFileLinks()}
  </head>
  <body>
    ${renderHeader("profile")}
    <main class="style-profile-page">
      <nav class="breadcrumb" aria-label="面包屑">
        <a href="../../index.html">风格谱</a><span aria-hidden="true">/</span><a href="../../index.html#atlas">风格图鉴</a><span aria-hidden="true">/</span><span aria-current="page">${escapeHtml(style.nameZh)}</span>
      </nav>
      <article>
        <header class="style-page-hero">
          <div>
            <div class="detail-tags"><span class="chip">${escapeHtml(style.type)}</span><span class="chip">${escapeHtml(style.period)}</span><span class="chip">${escapeHtml(style.region)}</span></div>
            <h1>${escapeHtml(style.nameZh)}</h1>
            <div class="detail-en">${escapeHtml(style.nameEn)}</div>
            <p class="detail-summary">${escapeHtml(style.summary)}</p>
            <p class="detail-recognition"><strong>一眼识别：</strong>${escapeHtml(style.recognition)}</p>
            <div class="detail-actions">
              <a class="primary-button" href="../../?style=${style.id}#prompt">用这个风格生成 Prompt</a>
              <a class="secondary-button" href="../../index.html#atlas">返回风格图鉴</a>
            </div>
          </div>
          <figure class="detail-visual has-artwork">
            <picture>
              <source media="(max-width: 720px)" srcset="../../${thumbnailImagePath}" />
              <img src="../../${optimizedImagePath}" alt="${escapeHtml(`${style.nameZh}（${style.nameEn}）风格视觉示例`)}" width="1200" height="900" fetchpriority="high" decoding="async" />
            </picture>
          </figure>
        </header>

        <div class="style-page-content">
          <div class="detail-body">
            <section class="detail-section" id="definition" aria-labelledby="definitionTitle">
              <p class="section-kicker">01 · CORE DEFINITION</p>
              <h2 id="definitionTitle">${escapeHtml(style.nameZh)}解决什么视觉问题</h2>
              <div class="core-definition">
                <div><span>视觉任务</span><strong>${escapeHtml(coreGuide.problem)}</strong></div>
                <div><span>解决方式</span><strong>${escapeHtml(coreGuide.method)}</strong></div>
                <div><span>核心气质</span><strong>${escapeHtml(coreGuide.temperament)}</strong></div>
                <div><span>边界</span><strong>${escapeHtml(coreGuide.boundary)}</strong></div>
              </div>
            </section>

            <section class="detail-section" id="recognition" aria-labelledby="recognitionTitle">
              <p class="section-kicker">02 · RECOGNITION GUIDE</p>
              <h2 id="recognitionTitle">如何识别${escapeHtml(style.nameZh)}</h2>
              <p class="section-lead">${escapeHtml(style.recognition)} 判断时不要只看题材，要逐项核对下面的视觉结构。</p>
              <div class="recognition-axis-grid">
                ${recognitionAxes.map((axis) => `<article><span>${escapeHtml(axis.label)}</span><strong>${escapeHtml(axis.zh)}</strong><p>${escapeHtml(axis.explanation)}</p></article>`).join("\n                ")}
              </div>
            </section>

            <section class="detail-section" id="genes" aria-labelledby="genesTitle">
              <p class="section-kicker">03 · KEY VISUAL GENES</p>
              <h2 id="genesTitle">关键视觉基因：特征、作用与使用方式</h2>
              <p class="section-lead">生成或设计时至少选择三项共同工作，不要只复制一个表面符号。</p>
              <div class="gene-guide-list">
                ${geneGuides.map((gene) => `<div class="gene-guide-item">
                  <h3>${escapeHtml(gene.feature)}</h3>
                  <p><span>作用</span>${escapeHtml(gene.effect)}</p>
                  <p><span>使用</span>${escapeHtml(gene.usage)}</p>
                </div>`).join("\n                ")}
              </div>
            </section>

            <section class="detail-section" id="palette" aria-labelledby="paletteTitle">
              <p class="section-kicker">04 · COLOR SYSTEM</p>
              <h2 id="paletteTitle">常见配色方案与使用比例</h2>
              <p class="section-lead">比例是起始建议，不是硬性规范。先用面积建立层级，再根据媒介明度和可读性微调。</p>
              <div class="palette-guide">
                ${palettePlan.map((color) => `<div class="palette-color"><i style="background:${escapeHtml(color.hex)}"></i><span>${escapeHtml(color.role)} · ${escapeHtml(color.ratio)}%</span><code>${escapeHtml(color.hex.toUpperCase())}</code><p>${escapeHtml(color.usage)}</p></div>`).join("\n                ")}
              </div>
            </section>

            <section class="detail-section" id="applications" aria-labelledby="applicationsTitle">
              <p class="section-kicker">05 · CONTENT FIT</p>
              <h2 id="applicationsTitle">你的内容适合这种风格吗</h2>
              <p class="section-lead">先判断要表达的主题、情绪与观看预期，再决定是否使用这种风格。媒介只是载体，不应成为选择风格的唯一理由。</p>
              <div class="application-grid">
                ${contentFitGuides.map((item) => `<article><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(item.guidance)}</p></article>`).join("\n                ")}
              </div>
            </section>

            <section class="detail-section" id="risks" aria-labelledby="risksTitle">
              <p class="section-kicker">06 · UNSUITABLE USES & RISKS</p>
              <h2 id="risksTitle">不适用场景与执行风险</h2>
              <div class="fit-risk-grid">
                <div>
                  <h3>慎用场景</h3>
                  <p>${escapeHtml(buildUnsuitableUse(style))}</p>
                </div>
                <div>
                  <h3>具体风险</h3>
                  <ul>${riskGuides.map((risk) => `<li>${escapeHtml(risk)}</li>`).join("")}</ul>
                </div>
              </div>
            </section>

            <section class="detail-section" id="comparison" aria-labelledby="comparisonTitle">
              <p class="section-kicker">07 · COMPARISON</p>
              <h2 id="comparisonTitle">容易与哪些风格混淆</h2>
              <div class="comparison-guide">
                ${comparisonGuides.map((comparison) => `<article>
                  <h3>${escapeHtml(style.nameZh)} vs ${escapeHtml(comparison.related.nameZh)}</h3>
                  <div class="comparison-points"><p><span>${escapeHtml(style.nameZh)}</span>${escapeHtml(comparison.current)}</p><p><span>${escapeHtml(comparison.related.nameZh)}</span>${escapeHtml(comparison.other)}</p></div>
                  <p class="comparison-key"><strong>关键差异：</strong>${escapeHtml(comparison.key)}</p>
                  <a href="../${comparison.related.id}/">查看${escapeHtml(comparison.related.nameZh)}完整指南</a>
                </article>`).join("\n                ")}
              </div>
            </section>

            <section class="detail-section" id="intensity" aria-labelledby="intensityTitle">
              <p class="section-kicker">08 · STYLE INTENSITY</p>
              <h2 id="intensityTitle">风格强度变化</h2>
              <div class="intensity-guide">
                <article><span>轻度借鉴</span><h3>保留 1–2 个主基因</h3><p>保留${escapeHtml(style.genes.composition[0])}和 ${escapeHtml(style.palette[0].toUpperCase())} 强调色；继续使用项目原有字体和组件，避免加入完整年代装饰。</p></article>
                <article><span>明显使用</span><h3>联动 3–4 个变量</h3><p>同时使用${escapeHtml(style.genes.composition[0])}、${escapeHtml(style.genes.form[0])}、${escapeHtml(style.genes.color[0])}和${escapeHtml(style.genes.texture[0])}，但保留清晰的信息层级。</p></article>
                <article><span>视觉主导</span><h3>统一整套视觉语法</h3><p>构图、比例、轮廓、光线、色彩、字体和材质全部遵循${escapeHtml(style.nameZh)}，仅适合主视觉、封面和沉浸式核心场景。</p></article>
              </div>
            </section>

            <section class="detail-section" id="translation" aria-labelledby="translationTitle">
              <p class="section-kicker">09 · MEDIA TRANSLATION</p>
              <h2 id="translationTitle">不同媒介怎样转译</h2>
              <p class="section-lead">同一种风格进入不同媒介时，应该保留核心基因，同时主动降低与媒介任务冲突的部分。</p>
              <div class="media-translation-grid">
                ${mediaTranslations.map((item) => `<article><h3>${escapeHtml(item.medium)}</h3><dl><div><dt>必须保留</dt><dd>${escapeHtml(item.keep)}</dd></div><div><dt>需要调整</dt><dd>${escapeHtml(item.adjust)}</dd></div></dl></article>`).join("\n                ")}
              </div>
            </section>

            <section class="detail-section" id="prompt" aria-labelledby="promptTitle">
              <p class="section-kicker">10 · PROMPT RECIPE</p>
              <h2 id="promptTitle">Prompt 配方：逐项控制，而不是只写风格名</h2>
              <div class="prompt-parts">
                ${promptParts.map((part) => `<div><span>${escapeHtml(part.label)}</span><strong>${escapeHtml(part.value)}</strong></div>`).join("\n                ")}
              </div>
              <div class="prompt-output-block"><span>中文 AI 可执行提示词</span><p>${escapeHtml(promptOutput.zh)}</p></div>
              <div class="prompt-output-block"><span>English AI-executable prompt</span><p lang="en">${escapeHtml(promptOutput.en)}</p></div>
              <div class="prompt-output-block prompt-negative"><span>通用画面破坏项</span><p>${escapeHtml(promptOutput.negative)}</p></div>
            </section>

            <section class="detail-section" id="prompt-errors" aria-labelledby="promptErrorsTitle">
              <p class="section-kicker">11 · PROMPT ERRORS</p>
              <h2 id="promptErrorsTitle">常见错误 Prompt：问题在哪里，怎样修正</h2>
              <div class="prompt-error-list">
                ${promptErrors.map((item) => `<article><span>错误写法</span><code>${escapeHtml(item.bad)}</code><p><strong>问题：</strong>${escapeHtml(item.problem)}</p><p><strong>修正：</strong>${escapeHtml(item.fix)}</p></article>`).join("\n                ")}
              </div>
            </section>

            <section class="detail-section" id="history" aria-labelledby="historyTitle">
              <p class="section-kicker">12 · HISTORICAL CONTEXT</p>
              <h2 id="historyTitle">历史脉络</h2>
              <div class="history-timeline">
                <div><span>形成背景</span><strong>${escapeHtml(historyGuide.formation)}</strong></div>
                <div><span>关键转变</span><strong>${escapeHtml(historyGuide.shift)}</strong></div>
                <div><span>后续影响</span><strong>${escapeHtml(historyGuide.influence)}</strong></div>
              </div>
            </section>

            <section class="detail-section" id="related" aria-labelledby="relatedTitle">
              <p class="section-kicker">13 · RELATED & DERIVED STYLES</p>
              <h2 id="relatedTitle">来源、相邻与衍生风格</h2>
              <div class="relation-network"><div><span>来源</span><p>${renderStyleReferences(style.influencedBy)}</p></div><div><span>后续影响</span><p>${renderStyleReferences(style.influenced)}</p></div></div>
              <div class="related-style-grid">
                ${relatedStyles.map((related) => renderRelatedCard(related)).join("\n                ")}
              </div>
            </section>
          </div>
          <aside class="style-page-aside" aria-label="风格资料">
            <dl class="style-facts">
              <div><dt>英文名</dt><dd>${escapeHtml(style.nameEn)}</dd></div>
              <div><dt>时期</dt><dd>${escapeHtml(style.period)}</dd></div>
              <div><dt>地域</dt><dd>${escapeHtml(style.region)}</dd></div>
              <div><dt>分类</dt><dd>${escapeHtml(style.type)}</dd></div>
              <div><dt>视觉特征</dt><dd>${style.traits.map(escapeHtml).join("、")}</dd></div>
              <div><dt>适用领域</dt><dd>${style.fields.map(escapeHtml).join("、")}</dd></div>
            </dl>
            <nav class="style-page-toc" aria-label="本页内容">
              <strong>本页内容</strong>
              <a href="#definition">核心定义</a><a href="#recognition">视觉识别</a><a href="#genes">关键基因</a><a href="#palette">配色方案</a><a href="#applications">内容适配</a><a href="#risks">风险</a><a href="#comparison">风格辨析</a><a href="#intensity">风格强度</a><a href="#translation">媒介转译</a><a href="#prompt">Prompt 配方</a><a href="#prompt-errors">错误 Prompt</a><a href="#history">历史脉络</a><a href="#related">相关风格</a>
            </nav>
            <a class="back-link-aside" href="../../index.html#atlas">返回风格图鉴</a>
          </aside>
        </div>
      </article>
    </main>
    ${renderFooter()}
  </body>
</html>
`;
}

function renderStyleIndex() {
  const title = "123 种艺术设计风格与视觉方向图鉴 | 风格谱 Style Atlas";
  const description = "浏览 123 种艺术、设计与视觉文化风格及视觉方向。每种风格都有独立页面，包含历史、识别特征、配色、构图、材质和 AI 绘图 Prompt。";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: `${siteUrl}/styles/`,
    inLanguage: "zh-CN",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: styles.length,
      itemListElement: styles.map((style, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `${style.nameZh}（${style.nameEn}）`,
        url: `${siteUrl}/styles/${style.id}/`
      }))
    }
  };

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${description}" />
    <meta name="theme-color" content="#f3f3f0" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="zh_CN" />
    <meta property="og:site_name" content="风格谱 Style Atlas" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${siteUrl}/styles/" />
    <meta property="og:image" content="${siteUrl}/assets/og-cover.svg" />
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href="${siteUrl}/styles/" />
    <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
    <link rel="stylesheet" href="../styles.css" />
    <link rel="stylesheet" href="../style-pages.css" />
    <title>${title}</title>
    <script type="application/ld+json">${safeJson(structuredData)}</script>
    ${renderAnalytics()}
    ${renderLocalFileLinks()}
  </head>
  <body>
    ${renderHeader("index")}
    <main class="style-index-page">
      <header class="style-index-intro">
        <p class="eyebrow">ART · DESIGN · VISUAL CULTURE</p>
        <h1>123 种艺术设计风格与视觉方向</h1>
        <p>${description}</p>
      </header>
      <section class="static-style-grid" aria-label="全部风格">
        ${styles.map((style, index) => `<a class="static-style-card" href="${style.id}/">
          <img src="../${getArtworkVariantPath(style, "thumbs")}" alt="${escapeHtml(`${style.nameZh}风格视觉示例`)}" width="720" height="540" ${index === 0 ? 'loading="eager" fetchpriority="high"' : 'loading="lazy" fetchpriority="low"'} decoding="async" />
          <strong>${escapeHtml(style.nameZh)}</strong><small>${escapeHtml(style.nameEn)}</small><span>${escapeHtml(style.summary)}</span>
        </a>`).join("\n        ")}
      </section>
    </main>
    ${renderFooter("../")}
  </body>
</html>
`;
}

function renderHeader(page) {
  const prefix = page === "profile" ? "../../" : "../";
  const homeHref = `${prefix}index.html`;
  if (page === "profile") {
    return `<header class="site-header style-page-header style-detail-header">
      <a class="brand" href="${homeHref}" aria-label="风格谱首页">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <span><b>风格谱</b><small>STYLE ATLAS</small></span>
      </a>
      <a class="back-to-atlas" href="${homeHref}#atlas"><span aria-hidden="true">←</span>返回风格图鉴</a>
    </header>`;
  }
  return `<header class="site-header style-page-header">
      <a class="brand" href="${homeHref}" aria-label="风格谱首页">
        <span class="brand-mark" aria-hidden="true"><i></i><i></i><i></i></span>
        <span><b>风格谱</b><small>STYLE ATLAS</small></span>
      </a>
      <nav class="primary-nav" aria-label="主要导航">
        <a class="nav-item is-active" href="${homeHref}#atlas" aria-current="page">风格图鉴</a>
        <a class="nav-item" href="${homeHref}#timeline">时间脉络</a>
        <a class="nav-item" href="${homeHref}#prompt">Prompt 工坊</a>
      </nav>
    </header>`;
}

function renderFooter(prefix = "../../") {
  return `<footer class="site-footer">
      <span>风格谱 · Style Atlas</span>
      <span class="footer-note">配图仅用于呈现风格特征。</span>
      <a class="footer-feedback" href="${prefix}index.html#atlas">浏览全部 123 种风格与视觉方向</a>
    </footer>`;
}

function renderAnalytics() {
  return `<script>
      var _hmt = _hmt || [];
      (function() {
        var hm = document.createElement("script");
        hm.src = "https://hm.baidu.com/hm.js?8035eab9df85edd545862187c3d27658";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(hm, s);
      })();
    </script>`;
}

function renderLocalFileLinks() {
  return `<script>
      document.addEventListener("DOMContentLoaded", function() {
        if (window.location.protocol !== "file:") return;
        document.querySelectorAll('a[href$="/"]').forEach(function(link) {
          link.setAttribute("href", link.getAttribute("href") + "index.html");
        });
        document.querySelectorAll('a[href^="../../?"]').forEach(function(link) {
          link.setAttribute("href", "../../index.html" + link.getAttribute("href").slice(6));
        });
      });
    </script>`;
}

function renderRelatedCard(style) {
  return `<a class="related-style-card" href="../${style.id}/">
    <img src="../../${getArtworkVariantPath(style, "thumbs")}" alt="${escapeHtml(`${style.nameZh}风格视觉示例`)}" width="720" height="540" loading="lazy" decoding="async" />
    <strong>${escapeHtml(style.nameZh)}</strong><small>${escapeHtml(style.nameEn)}</small>
  </a>`;
}

function getArtworkVariantPath(style, variant) {
  return style.artwork.src
    .replace("assets/artworks/", `assets/artworks/${variant}/`)
    .replace(/\.[^.]+$/, ".webp");
}

function buildGeneGuides(style) {
  return style.visualGenes.map((gene) => ({
    feature: gene.zh,
    effect: explainGeneEffect(gene.zh),
    usage: explainGeneUsage(gene.zh, style)
  }));
}

function buildCoreGuide(style) {
  const genes = style.visualGenes.slice(0, 3).map((gene) => gene.zh);
  return {
    problem: stripEndingPunctuation(style.summary),
    method: `通过${genes.join("、")}把抽象气质转化为稳定、可重复的画面规则。`,
    temperament: `${style.traits.slice(0, 5).join("、")}；视觉重点是${style.recognition}`,
    boundary: `它不等于简单加入“${style.nameZh}元素”。如果构图、比例、色彩与材质没有同时遵循同一逻辑，结果只会像表面模仿。`
  };
}

function buildRecognitionAxes(style) {
  const genesByAxis = new Map();
  for (const gene of style.visualGenes) {
    const axis = classifyVisualGene(gene.zh);
    if (!genesByAxis.has(axis)) genesByAxis.set(axis, gene);
  }
  const axes = [
    { label: "构图", fallbackZh: style.genes.composition.join("、"), fallbackEn: inferCompositionEn(style) },
    { label: "比例", fallbackZh: inferProportion(style), fallbackEn: inferProportionEn(style) },
    { label: "轮廓与造型", fallbackZh: style.genes.form.join("、"), fallbackEn: inferFormEn(style) },
    { label: "色彩", fallbackZh: style.genes.color.join("、"), fallbackEn: inferColorEn(style) },
    { label: "光线", keywords: ["光", "阴影", "明暗", "照明", "高光", "辉光", "曝光"], fallbackZh: inferLighting(style).zh, fallbackEn: inferLighting(style).en },
    { label: "字体", fallbackZh: style.genes.type.join("、"), fallbackEn: inferTypographyEn(style) },
    { label: "材质", fallbackZh: style.genes.texture.join("、"), fallbackEn: inferMaterialEn(style) },
    { label: "装饰密度", fallbackZh: inferDensity(style).zh, fallbackEn: inferDensity(style).en }
  ];
  return axes.map((axis) => {
    const gene = genesByAxis.get(axis.label);
    return {
      label: axis.label,
      zh: gene?.zh || axis.fallbackZh,
      en: gene?.en || axis.fallbackEn,
      explanation: getAxisExplanation(axis.label, style)
    };
  });
}

function buildPalettePlan(style) {
  const ratios = style.traits.some((trait) => ["克制", "留白", "低饱和", "轻盈"].includes(trait))
    ? [70, 25, 5]
    : style.traits.some((trait) => ["高饱和", "强对比", "满版", "华丽"].includes(trait)) ? [55, 30, 15] : [60, 30, 10];
  const roles = ["主色", "辅助色", "强调色"];
  const usages = [
    `用于背景、最大形体或主要材质，承担${style.nameZh}的整体气质。`,
    "用于区分层级、支撑主体和建立冷暖或明度关系，不与主色平均竞争。",
    "只用于标题、焦点、交互状态或关键细节；面积越小，识别信号越明确。"
  ];
  return style.palette.slice(0, 3).map((hex, index) => ({ hex, role: roles[index], ratio: ratios[index], usage: usages[index] }));
}

function buildTypographyGuide(style) {
  const traits = new Set(style.traits);
  const weight = traits.has("强对比") || traits.has("反叛") || traits.has("文字") ? "标题 700–900，正文 400–500" : traits.has("轻盈") || traits.has("克制") ? "标题 500–600，正文 350–450" : "标题 600–700，正文 400–500";
  const scale = traits.has("戏剧") || traits.has("高识别") ? "标题约为正文的 4–5 倍；只保留一个超大层级" : traits.has("克制") ? "标题约为正文的 2–3 倍；靠间距而非字号跳变建立层级" : "标题约为正文的 3–4 倍；副标题介于两者之间";
  const alignment = traits.has("对称") || traits.has("中心构图") ? "以中心或轴线对齐为主，避免无依据的偏移" : traits.has("网格") || traits.has("理性") ? "左对齐并服从稳定网格，标题、正文和图像共享基线" : traits.has("动态") || traits.has("不对称") ? "允许偏心或斜向排列，但必须保持视觉重量平衡" : "选择一种主对齐方式贯穿页面，不混用多个视觉轴";
  const rhythm = traits.has("满版") || traits.has("高细节") ? "信息区保持紧凑，但正文行高至少 1.5；装饰区和阅读区明确分离" : traits.has("留白") ? "段落间距大于行距，使用少量层级和稳定留白形成慢节奏" : "正文行高 1.5–1.7，标题前后间距形成可重复节奏";
  const avoid = traits.has("手工") ? "过度机械、无个性的通用系统字体，以及与手工纹理完全脱节的超细字重" : traits.has("几何") || traits.has("理性") ? "装饰性过强、笔画结构松散或字重变化无规律的字体" : traits.has("华丽") || traits.has("装饰") ? "同时混用多种展示字体；装饰字体只承担短标题" : "与画面轮廓、年代感和信息密度相冲突的字体类型";
  return { family: style.genes.type.join("、"), weight, scale, alignment, rhythm, avoid };
}

function buildUnsuitableUse(style) {
  if (style.traits.some((trait) => ["怪诞", "反叛", "戏剧", "强对比"].includes(trait))) return `需要长期阅读、低刺激、制度信任或严肃中立表达的场景不宜让${style.nameZh}主导；可只保留色彩或局部材质作为强调。`;
  if (style.traits.some((trait) => ["华丽", "装饰", "满版", "高细节"].includes(trait))) return `小屏界面、密集数据表格、无障碍优先或制作预算有限的项目不适合完整复刻${style.nameZh}；应先降低装饰密度。`;
  if (style.traits.some((trait) => ["克制", "留白", "低饱和"].includes(trait))) return `强促销、节庆、即时行动号召或需要在拥挤环境中抢夺注意力的项目，不适合只使用${style.nameZh}的低刺激表达。`;
  if (style.traits.some((trait) => ["怀旧", "低保真", "粗粝"].includes(trait))) return `强调尖端技术、无瑕精度或高洁净医疗感的场景，需要谨慎使用${style.nameZh}的旧化与低保真信号。`;
  return `当项目要求完全中性、跨文化无歧义或极高信息效率时，不宜让${style.nameZh}覆盖全部界面；应以轻度借鉴为主。`;
}

function buildContentFitGuides(style) {
  return [
    {
      label: "适合表达",
      guidance: `这种风格的原始命题是“${stripEndingPunctuation(style.summary)}”。当你的内容也需要讨论相近的冲突、价值或观看方式时，风格与主题才真正匹配。`
    },
    {
      label: "适合营造",
      guidance: `适合营造${buildMoodWords(style).join("、")}的观看感受。它会主动改变信息压力和观看节奏，不只是给画面增加一种气氛。`
    },
    {
      label: "适合展示",
      guidance: `更适合把${buildDisplayFocus(style).join("；")}作为核心内容；主体需要允许${style.genes.composition[0]}和${style.genes.form[0]}参与叙事。`
    },
    {
      label: "传播场景",
      guidance: buildCommunicationScene(style)
    },
    {
      label: "受众预期",
      guidance: buildAudienceExpectation(style)
    },
    {
      label: "选择依据",
      guidance: `如果内容同时需要“${style.traits.slice(0, 3).join("、")}”，并能让${style.genes.composition[0]}、${style.genes.color[0]}和${style.genes.texture[0]}承担表达任务，这种风格是合适的；如果只是喜欢其中一种颜色，建议轻度借鉴。`
    }
  ];
}

function buildMoodWords(style) {
  const moodByTrait = {
    "未来": "未来感与技术张力",
    "强对比": "冲突、紧张与强烈焦点",
    "满版": "拥挤、压迫与持续刺激",
    "戏剧": "戏剧性与悬念",
    "克制": "克制、安静与观看距离",
    "留白": "疏朗、停顿与精神性",
    "低饱和": "沉静、含蓄与耐看",
    "轻盈": "轻快、通透与呼吸感",
    "高饱和": "兴奋、活力与即时吸引",
    "华丽": "丰盛、仪式感与感官刺激",
    "装饰": "精致、繁复与连续节奏",
    "反叛": "反叛、冲撞与非主流态度",
    "怪诞": "陌生、不安与黑色幽默",
    "理性": "秩序、效率与可信度",
    "几何": "精确、清晰与结构感",
    "怀旧": "怀旧、时间感与文化记忆",
    "自然": "亲近、舒缓与生命感",
    "有机": "流动、柔和与生长感",
    "写实": "可信、具体与现场感",
    "梦境": "暧昧、漂浮与潜意识感",
    "高细节": "沉浸、探索与丰富层次"
  };
  return [...new Set(style.traits.map((trait) => moodByTrait[trait] || `${trait}感`))].slice(0, 4);
}

function buildDisplayFocus(style) {
  const focusByField = {
    "品牌": "品牌主张、价值立场与核心产品",
    "品牌视觉": "品牌主张、价值立场与核心产品",
    "海报": "活动主题、核心观点与行动号召",
    "广告": "产品差异、消费情境与传播主张",
    "包装": "产品个性、材料体验与系列关系",
    "产品": "产品功能、材料特征与使用体验",
    "数字界面": "数字产品概念、内容层级与交互状态",
    "电影": "世界观、角色冲突与关键场景",
    "动画": "世界观、角色关系与叙事节奏",
    "游戏": "世界观、角色系统与探索空间",
    "插画": "叙事主题、人物关系与概念设定",
    "绘画": "情绪、观念与视觉实验",
    "摄影": "人物状态、环境线索与时代气氛",
    "建筑": "空间秩序、材料观念与公共体验",
    "空间": "空间主题、动线体验与材料氛围",
    "书籍": "封面主题、章节气氛与文化内容",
    "出版": "专题观点、阅读节奏与文化内容",
    "音乐": "声音气质、艺人形象与现场氛围",
    "时尚": "身份态度、廓形语言与材料观念"
  };
  const focuses = style.fields.map((field) => focusByField[field] || `${field}中的核心主题与叙事对象`);
  return [...new Set(focuses)].slice(0, 3);
}

function buildCommunicationScene(style) {
  if (style.traits.some((trait) => ["强对比", "满版", "戏剧", "反叛"].includes(trait))) return "适合发布会主视觉、展览、演出、影视游戏宣发等需要迅速建立强烈印象的场景；不适合要求长时间低刺激阅读的主体页面。";
  if (style.traits.some((trait) => ["克制", "留白", "低饱和", "轻盈"].includes(trait))) return "适合文化机构、高端品牌、出版专题、静态展陈等允许观众停留和细看内容的场景；强促销环境中需要额外建立焦点。";
  if (style.traits.some((trait) => ["华丽", "装饰", "高细节"].includes(trait))) return "适合节庆主视觉、文化展览、收藏包装和沉浸式空间等允许丰富细节展开的场景；小尺寸传播物需要准备简化版本。";
  if (style.traits.some((trait) => ["理性", "几何", "模块化", "系统化"].includes(trait))) return "适合设计展览、教育传播、品牌系统与产品说明等需要把观点组织得清楚有序的场景。";
  if (style.traits.some((trait) => ["怀旧", "低保真"].includes(trait))) return "适合音乐视觉、复古主题活动、文化回顾与青年内容等依赖年代记忆的传播场景；需要明确具体年代，避免通用复古滤镜。";
  return "适合主题明确的品牌主视觉、文化活动、编辑内容和展览传播；使用前应确认风格气质不会压过核心信息。";
}

function buildAudienceExpectation(style) {
  if (style.traits.some((trait) => ["未来", "反叛", "怪诞"].includes(trait))) return "更容易吸引关注科技文化、青年文化、亚文化或世界观叙事的受众；面向强调稳定与普适信任的人群时，应降低风格强度。";
  if (style.traits.some((trait) => ["理性", "几何", "系统化"].includes(trait))) return "适合重视清晰秩序、功能逻辑和现代专业感的受众；需要亲密、随性或手作温度时，应加入更柔和的信号。";
  if (style.type === "地域与传统" || style.fields.includes("宗教艺术")) return "适合关注文化语境、传统工艺和象征含义的受众；跨文化传播时必须解释符号来源，避免把传统元素当作通用装饰。";
  if (style.traits.some((trait) => ["自然", "手工", "有机"].includes(trait))) return "适合重视自然、材料触感、手工价值和生活方式的受众；强调尖端效率或无瑕精度的内容需要谨慎使用。";
  if (style.traits.some((trait) => ["华丽", "装饰", "高细节"].includes(trait))) return "适合期待仪式感、收藏感和丰富视觉体验的受众；偏好极简效率的人群可能感到信息负担。";
  return `适合希望感受到${style.traits.slice(0, 3).join("、")}的受众；正式采用前应先用一张核心画面测试主题理解是否准确。`;
}

function buildComparisonGuides(style, relatedStyles) {
  return relatedStyles.map((related) => ({
    related,
    current: `${style.genes.composition[0]}；${style.genes.form[0]}；${style.genes.color.slice(0, 2).join("、")}；${style.genes.texture[0]}。`,
    other: `${related.genes.composition[0]}；${related.genes.form[0]}；${related.genes.color.slice(0, 2).join("、")}；${related.genes.texture[0]}。`,
    key: `${style.nameZh}的识别重心是“${stripEndingPunctuation(style.recognition)}”；${related.nameZh}则是“${stripEndingPunctuation(related.recognition)}”。先比较空间结构和边缘处理，再比较题材。`
  }));
}

function buildMediaTranslations(style, axes) {
  const composition = findAxis(axes, "构图").zh;
  const form = findAxis(axes, "轮廓与造型").zh;
  const color = findAxis(axes, "色彩").zh;
  const light = findAxis(axes, "光线").zh;
  const type = findAxis(axes, "字体").zh;
  const texture = findAxis(axes, "材质").zh;
  return [
    { medium: "海报", keep: joinUniquePhrases([composition, color, type]), adjust: "把风格集中到主图和标题；正文保持高可读性，远距离先读到主题，再读到装饰细节。" },
    { medium: "品牌视觉", keep: joinUniquePhrases([form, "主辅色比例", "一个稳定的材质信号"]), adjust: "把复杂画面提炼成标志形、色板和版式规则；不要要求每个触点都复刻完整作品。" },
    { medium: "数字界面", keep: joinUniquePhrases([`${composition}的层级逻辑`, color, `局部使用${texture}`]), adjust: "降低装饰密度和纹理强度；正文、按钮、状态色及键盘焦点必须优先满足可读性和一致性。" },
    { medium: "插画", keep: joinUniquePhrases([form, light, texture]), adjust: "允许风格主导造型与气氛，但主体轮廓、叙事动作和前后景关系必须清楚。" }
  ];
}

function buildPromptRecipe(style, axes) {
  return [
    { label: "主体", value: "具体对象 + 动作/状态 + 使用场景；不要只写抽象情绪" },
    { label: "构图", value: findAxis(axes, "构图").zh },
    { label: "比例", value: findAxis(axes, "比例").zh },
    { label: "造型", value: findAxis(axes, "轮廓与造型").zh },
    { label: "色彩", value: `${findAxis(axes, "色彩").zh}；建议面积比例 ${buildPalettePlan(style).map((item) => item.ratio).join("/")}` },
    { label: "光线", value: findAxis(axes, "光线").zh },
    { label: "材质", value: findAxis(axes, "材质").zh },
    { label: "字体", value: `${style.genes.type.join("、")}；${buildTypographyGuide(style).alignment}` },
    { label: "媒介", value: `明确写海报、品牌主视觉、数字界面或插画，不让模型自行猜测输出类型` }
  ];
}

function buildPromptErrors(style, relatedStyles) {
  const relatedName = relatedStyles[0]?.nameZh || "另一种相邻风格";
  const mixedStyles = [...new Set([style.nameZh, relatedName, "赛博朋克", "极简主义", "复古未来主义"])];
  const conflict = style.traits.includes("留白")
    ? "大面积留白、同时填满复杂装饰和密集信息"
    : style.traits.includes("平面") ? "纯平面语言、同时要求写实 3D 体积和镜面高光" : style.traits.includes("低饱和") ? "低饱和克制配色、同时要求彩虹霓虹高饱和" : "极简低密度构图、同时要求满版高细节装饰";
  return [
    {
      bad: `一个${style.nameZh}风格的海报，高级感，设计感，氛围感`,
      problem: "只有风格名和主观形容词，没有告诉模型构图、比例、颜色、光线与材质怎样变化。",
      fix: `至少加入“${style.genes.composition[0]}、${style.genes.form[0]}、${style.genes.color.slice(0, 2).join("与")}、${style.genes.texture[0]}”。`
    },
    {
      bad: conflict,
      problem: "同一控制维度出现相反要求，模型只能随机选择或折中，结果通常两边都不像。",
      fix: `先确定${style.nameZh}为主风格；冲突属性只保留一项，并明确风格强度。`
    },
    {
      bad: mixedStyles.join(" + "),
      problem: "堆叠多个风格名称没有说明谁控制构图、谁控制材质，容易产生拼贴式表面符号。",
      fix: `保留${style.nameZh}作为结构主导；如需混合，只让${relatedName}负责一个明确变量，例如色彩或材质。`
    }
  ];
}

function buildHistoryGuide(style) {
  return {
    formation: `${style.period}，${style.region}语境。主要来源包括${style.influencedBy}。`,
    shift: `${stripEndingPunctuation(style.summary)}；视觉语言由此集中到${style.visualGenes.slice(0, 3).map((gene) => gene.zh).join("、")}。`,
    influence: `${style.influenced}。今天使用时应继承这些结构原则，而不是机械复刻年代符号。`
  };
}

function renderStyleReferences(value) {
  const source = String(value);
  const candidates = styles
    .filter((style) => source.includes(style.nameZh))
    .sort((a, b) => b.nameZh.length - a.nameZh.length);
  if (!candidates.length) return escapeHtml(source);
  let cursor = 0;
  let output = "";
  while (cursor < source.length) {
    const matches = candidates
      .map((style) => ({ style, index: source.indexOf(style.nameZh, cursor) }))
      .filter((item) => item.index >= 0)
      .sort((a, b) => a.index - b.index || b.style.nameZh.length - a.style.nameZh.length);
    if (!matches.length) {
      output += escapeHtml(source.slice(cursor));
      break;
    }
    const match = matches[0];
    output += escapeHtml(source.slice(cursor, match.index));
    output += `<a href="../${match.style.id}/">${escapeHtml(match.style.nameZh)}</a>`;
    cursor = match.index + match.style.nameZh.length;
  }
  return output;
}

function findAxis(axes, label) {
  return axes.find((axis) => axis.label === label);
}

function inferProportion(style) {
  if (style.traits.includes("垂直")) return "纵向拉长比例与向上动势";
  if (style.traits.includes("宏大")) return "主体与环境形成显著尺度反差";
  if (style.traits.includes("轻盈")) return "细长、轻量并保留充足呼吸空间";
  if (style.traits.includes("几何")) return "比例服从基础几何和模块关系";
  if (style.traits.includes("夸张") || style.traits.includes("动态")) return "主次体量拉开差距，以局部夸张制造动势";
  if (style.traits.includes("写实") || style.traits.includes("自然")) return "主体保持可信比例，以远近尺度变化建立空间";
  return "主次体量保持清楚，尺寸差服务视觉层级";
}

function inferProportionEn(style) {
  if (style.traits.includes("垂直")) return "elongated vertical proportion and upward movement";
  if (style.traits.includes("宏大")) return "pronounced scale contrast between subject and environment";
  if (style.traits.includes("轻盈")) return "slender lightweight proportions with breathing room";
  if (style.traits.includes("几何")) return "proportions governed by elementary geometry and modules";
  if (style.traits.includes("夸张") || style.traits.includes("动态")) return "clear scale hierarchy with selective exaggeration for movement";
  if (style.traits.includes("写实") || style.traits.includes("自然")) return "credible subject proportions with spatial scale variation";
  return "clear primary-to-secondary scale hierarchy";
}

function inferCompositionEn(style) {
  if (style.traits.includes("对称") || style.traits.includes("中心构图")) return "centered axial composition with controlled symmetry";
  if (style.traits.includes("不对称")) return "asymmetrical composition balanced by visual weight";
  if (style.traits.includes("动态")) return "dynamic composition with a clear directional flow";
  if (style.traits.includes("满版")) return "full-field composition with deliberately reserved reading zones";
  if (style.traits.includes("留白")) return "sparse composition with generous negative space";
  return "structured composition with a clear focal and reading order";
}

function inferFormEn(style) {
  if (style.traits.includes("几何")) return "elementary geometric forms with controlled contours";
  if (style.traits.includes("有机") || style.traits.includes("自然")) return "organic forms with continuous natural contours";
  if (style.traits.includes("写实")) return "observational forms with credible volume and silhouette";
  if (style.traits.includes("夸张") || style.traits.includes("怪诞")) return "exaggerated silhouettes with intentional distortion";
  return "distinct silhouettes governed by the style's shape language";
}

function inferColorEn(style) {
  const palette = style.palette.slice(0, 3).map((color) => color.toUpperCase()).join(", ");
  if (style.traits.includes("低饱和")) return `muted low-saturation palette led by ${palette}`;
  if (style.traits.includes("高饱和") || style.traits.includes("原色")) return `high-chroma controlled palette led by ${palette}`;
  if (style.traits.includes("强对比")) return `high-contrast palette led by ${palette}`;
  return `controlled palette led by ${palette}`;
}

function inferTypographyEn(style) {
  const source = style.genes.type.join("、");
  const families = [];
  if (source.includes("无衬线")) families.push(source.includes("几何") ? "geometric sans-serif" : source.includes("窄体") ? "condensed sans-serif" : "sans-serif");
  if (source.includes("衬线") && !source.includes("无衬线")) families.push("serif display type");
  if (/书法|题跋|手写/.test(source)) families.push("calligraphic display lettering");
  if (/像素|终端/.test(source)) families.push("pixel or terminal-style display type");
  if (/镀铬|霓虹/.test(source)) families.push("effect-driven display lettering");
  if (!families.length && style.traits.includes("几何")) families.push("geometric sans-serif typography");
  if (!families.length && style.traits.includes("手工")) families.push("hand-rendered display type");
  if (!families.length) families.push("display typography aligned with the style's shape language");
  return [...new Set(families)].join(" with ");
}

function inferMaterialEn(style) {
  if (style.traits.includes("手工")) return "visible handmade texture with material-specific variation";
  if (style.traits.includes("低保真") || style.traits.includes("粗粝")) return "grainy imperfect surface with controlled wear";
  if (style.traits.includes("写实")) return "material-specific surfaces with credible reflection and texture";
  if (style.traits.includes("平面")) return "flat printed surface with restrained texture";
  return "a consistent material finish applied only to relevant surfaces";
}

function inferLighting(style) {
  if (style.traits.includes("戏剧") || style.traits.includes("强对比")) return { zh: "低调方向光、局部高光与深阴影", en: "low-key directional light, selective highlights, and deep shadows" };
  if (style.traits.includes("明亮") || style.traits.includes("轻盈")) return { zh: "高调漫射光、浅阴影与通透边缘", en: "high-key diffused light, pale shadows, and translucent edges" };
  if (style.traits.includes("自然")) return { zh: "柔和自然光与可辨的局部阴影", en: "soft natural light with legible local shadows" };
  return { zh: "均匀主光配克制阴影，避免无依据的多光源", en: "even key light with restrained shadows and no arbitrary mixed lighting" };
}

function inferDensity(style) {
  if (style.traits.some((trait) => ["满版", "高细节", "装饰", "华丽"].includes(trait))) return { zh: "高密度连续组织，阅读区需要主动留出", en: "high continuous density with deliberately reserved reading zones" };
  if (style.traits.some((trait) => ["留白", "克制", "轻盈"].includes(trait))) return { zh: "低密度、少量焦点与大面积呼吸空间", en: "low density, few focal events, and generous breathing room" };
  return { zh: "中等装饰密度，重点区域与安静区域交替", en: "moderate density alternating active and quiet zones" };
}

function getAxisExplanation(label, style) {
  const explanations = {
    "构图": "决定视线从哪里进入、信息按什么顺序被读取。",
    "比例": "决定主体的力量感、亲近感以及人与空间的关系。",
    "轮廓与造型": "决定风格在缩略图和纯剪影状态下是否仍可识别。",
    "色彩": "决定第一情绪和区域层级，不能只作为最后滤镜。",
    "光线": "决定空间深度、材质可信度和戏剧程度。",
    "字体": "把风格延伸到信息层级；文字与图像必须属于同一系统。",
    "材质": "提供触感、媒介和年代线索，增强风格可信度。",
    "装饰密度": `控制信息压力与观看速度；${style.nameZh}需要在识别度和可读性之间保持平衡。`
  };
  return explanations[label];
}

function explainGeneEffect(gene) {
  const effects = {
    "字体": "把风格延伸到标题和信息结构，影响阅读顺序与节奏。",
    "材质": "提供媒介、触感与年代线索，避免画面只有抽象形状。",
    "光线": "建立明暗层级、空间深度和情绪强度。",
    "色彩": "建立第一情绪、视觉焦点和区域层级。",
    "比例": "控制主体的力量感、亲近感以及与环境的关系。",
    "轮廓与造型": "建立缩略图级别的识别度，决定主体看起来如何。",
    "装饰密度": "控制观看速度、信息压力和画面节奏。",
    "构图": "组织观看路径和前后关系，是风格成立的结构基础。"
  };
  return effects[classifyVisualGene(gene)];
}

function explainGeneUsage(gene, style) {
  const usageByAxis = {
    "字体": `让“${gene}”只承担标题和层级；正文仍需满足实际阅读尺寸。`,
    "材质": `把“${gene}”附着到合理对象和表面，不要作为统一滤镜覆盖文字与留白。`,
    "光线": `先确定唯一主光方向，再用“${gene}”塑造主体；不要叠加互相冲突的光源。`,
    "色彩": `将“${gene}”落实为主色、辅助色和强调色面积，不要让所有颜色平均竞争。`,
    "比例": `在草图阶段先锁定“${gene}”，再进入细节；比例错误无法靠后期纹理补救。`,
    "轮廓与造型": `用纯黑剪影检查“${gene}”是否清楚，再补充色彩与材质。`,
    "装饰密度": `先划定阅读区，再安排“${gene}”；在缩略图和移动端分别检查信息压力。`,
    "构图": `先用“${gene}”搭建大结构，再添加${style.genes.texture[0]}等表面信息。`
  };
  return usageByAxis[classifyVisualGene(gene)];
}

function classifyVisualGene(gene) {
  const source = String(gene);
  const classifiers = [
    ["字体", /字体|排版|文字|字号|字距|行距|衬线|标题|字形|字母|题跋|书法|像素字|终端字/],
    ["材质", /材质|质感|表面|哑光|磨砂|光泽|镜面|反射|笔触|颗粒|印刷|金属|玻璃|纸|油彩|颜料|纹理|织物|纤维|水滴|雨水|锈蚀|陶质|石质|木纹|马赛克|金箔|镀铬|压缩|噪点|扫描纹|扫描线|色差|像素化/],
    ["光线", /光线|照明|阴影|投影|明暗|逆光|侧光|顶光|漫射光|聚光|高光|辉光|曝光|暗部|亮部|轮廓光|透光|柔光|硬光|闪光/],
    ["色彩", /配色|色彩|墨色|彩色|深色|浅色|冷色|暖色|色调|色面|色域|综合色|色度|明度|单色|无彩|原色|互补色|冷暖|纯度|饱和|红|橙|黄|绿|青|蓝|紫|粉|黑|灰|棕|褐|赭|群青|洋红|金色|银色|铜色|肤色|石灰白|纸白/],
    ["比例", /比例|尺度|体量|拉长|缩短|细长|矮胖|大小|层级尺度/],
    ["轮廓与造型", /轮廓|形体|几何|曲线|形态|造型|边缘|剪影|体积|圆|方|三角|折线|线条|褶线|形状|结构关系/],
    ["装饰密度", /密度|留白|重复|满版|装饰|稀疏|低事件|连续图案|层级分区/]
  ];
  for (const [axis, pattern] of classifiers) {
    if (pattern.test(source)) return axis;
  }
  return "构图";
}

function joinUniquePhrases(values) {
  return [...new Set(values.filter(Boolean))].join("、");
}

function getRiskGuides(style) {
  const riskByTrait = {
    "高饱和": "高饱和色同时大面积使用会削弱信息层级，应明确主色和小面积强调色。",
    "强对比": "强对比适合建立焦点，但连续使用会造成视觉疲劳，并可能影响长文本阅读。",
    "满版": "满版结构容易挤压标题和功能信息，需要预先划定不可侵占的阅读区域。",
    "高细节": "细节密度在小尺寸和移动端会迅速丢失，应准备可简化的响应式版本。",
    "华丽": "装饰层次过多会让内容退居其次，应把华丽集中在核心画面而非所有触点。",
    "装饰": "装饰元素需要服从结构，随意叠加容易只剩表面模仿。",
    "低饱和": "低饱和可能不足以支撑促销、节庆或强行动号召，需要额外的强调色。",
    "克制": "过度克制会削弱识别与情绪，在竞争激烈的信息环境中需要更明确的焦点。",
    "留白": "留白必须与信息优先级配合，不能简单理解为空内容或低信息量。",
    "反叛": "反叛语气不适合强调稳定、权威和普适信任的正式沟通。",
    "怪诞": "怪诞造型可能造成受众排斥，应先确认品牌语气和文化语境是否允许。",
    "戏剧": "戏剧化光影和构图容易压过产品信息，功能性页面需要降低强度。",
    "抽象": "抽象表达可能降低主体辨识度，说明性任务应增加具象锚点。",
    "象征": "象征元素依赖文化背景，跨地区传播前需要确认不会产生误读。",
    "低保真": "低保真质感可能被理解为制作粗糙，必须让粗粝显得有意而为。",
    "粗粝": "粗粝纹理会降低小字号和细线的清晰度，应将文字置于干净底层。",
    "写实": "写实画面成本较高，快速迭代时应先确定光线、镜头与材质标准。",
    "精密": "精密结构对对齐和制作误差敏感，不适合缺少统一规范的临时拼接。",
    "几何": "几何秩序过强可能显得僵硬，需要通过尺度变化或留白建立呼吸感。",
    "对称": "对称布局稳定但容易缺少动势，可以用信息层级而不是破坏轴线来制造变化。",
    "不对称": "不对称需要清晰的视觉重量平衡，否则容易被误读为随意摆放。",
    "怀旧": "怀旧符号容易变成通用复古滤镜，应确认年代、媒介和材质线索彼此一致。",
    "未来": "未来感元素更新很快，避免依赖短期流行的霓虹、镀铬或界面装饰。",
    "手工": "手工不等于无规则，需要保留重复方式、材料边界和制作逻辑。",
    "自然": "自然元素如果只作为背景装饰，会削弱主题，应让形态或材料真正参与系统。",
    "文字": "文字主导的画面必须优先保证阅读顺序、字距与多语言适配。",
    "模块化": "模块化系统容易显得重复，需要为重点内容设计明确的例外规则。",
    "系统化": "系统规则应服务内容差异，避免所有页面因为过度一致而失去重点。"
  };
  const risks = style.traits.map((trait) => riskByTrait[trait]).filter(Boolean);
  const fallbacks = [
    `不要同时混入过多相邻风格，优先守住${style.genes.composition[0]}和${style.genes.form[0]}。`,
    `先验证标题、正文和主体在小尺寸下是否清晰，再增加${style.genes.texture[0]}等表面效果。`,
    "涉及地域传统或宗教符号时，应核对文化语境，避免把有明确含义的元素当作通用装饰。"
  ];
  return [...new Set([...risks, ...fallbacks])].slice(0, 3);
}

function getNegativePrompt(style) {
  const items = ["无关风格混搭", "通用模板感", "主体与背景层级不清", "不可读文字"];
  if (style.traits.includes("低饱和")) items.push("过度霓虹高饱和");
  if (style.traits.includes("高饱和")) items.push("所有颜色平均抢占注意力");
  if (style.traits.includes("平面")) items.push("无必要的写实三维高光");
  if (style.traits.includes("手工")) items.push("过度光滑的通用 CGI 表面");
  if (style.traits.includes("几何")) items.push("缺乏对齐关系的随机形状");
  if (style.traits.includes("写实")) items.push("塑料感材质与错误反射");
  if (style.traits.includes("留白")) items.push("装饰填满所有空白区域");
  return items.slice(0, 6);
}

function renderSitemap() {
  const entries = [
    { path: "/", changefreq: "weekly", priority: "1.0" },
    { path: "/mixer.html", changefreq: "weekly", priority: "0.9" },
    { path: "/styles/", changefreq: "weekly", priority: "0.9" },
    ...styles.map((style) => ({ path: `/styles/${style.id}/`, changefreq: "monthly", priority: "0.8" }))
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => `  <url>
    <loc>${siteUrl}${entry.path}</loc>
    <lastmod>${lastModified}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`).join("\n")}
</urlset>
`;
}

function stripEndingPunctuation(value) {
  return String(value).replace(/[。！？.!?]+$/, "");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}
