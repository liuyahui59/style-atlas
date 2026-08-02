import { readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";

const IGNORED_TERMS = new Set([
  "aesthetic", "style", "visual", "art", "artwork", "painting", "design", "museum",
  "photography", "photo", "cinema", "film", "architecture", "architectural", "traditional",
  "tradition", "modern", "new", "school", "movement"
]);

const ALLOWED_LICENSE_PATTERNS = [
  ["CC0 1.0", /CC0 1\.0/i],
  ["CC BY-SA 4.0", /CC BY-SA 4\.0/i],
  ["CC BY-SA 3.0", /CC BY-SA 3\.0/i],
  ["CC BY-SA 2.0", /CC BY-SA 2\.0/i],
  ["CC BY 4.0", /CC BY 4\.0/i],
  ["CC BY 3.0", /CC BY 3\.0/i],
  ["CC BY 2.0", /CC BY 2\.0/i],
  ["Public domain", /public domain/i]
];

function styleTerms(id) {
  return id.split("-").filter((term) => term.length > 2 && !IGNORED_TERMS.has(term));
}

function queryTerms(query) {
  return query.toLowerCase().split(/[^a-z0-9]+/).filter((term) =>
    term.length > 2 && !IGNORED_TERMS.has(term) && !["ink", "scroll", "print"].includes(term)
  );
}

function candidateScore(candidate, id, query) {
  const filename = decodeURIComponent(candidate.href).toLowerCase();
  const styleMatches = styleTerms(id).filter((term) => filename.includes(term)).length;
  const queryMatches = queryTerms(query).filter((term) => filename.includes(term)).length;
  return styleMatches * 10 + queryMatches * 12 - candidate.index;
}

async function readFilePage(tab) {
  return tab.playwright.evaluate(() => {
    const content = document.querySelector("#mw-content-text") || document.body;
    const text = content.innerText || "";
    const images = Array.from(content.querySelectorAll("img"))
      .map((image) => ({
        src: image.currentSrc || image.src,
        width: image.naturalWidth,
        height: image.naturalHeight,
        area: image.naturalWidth * image.naturalHeight
      }))
      .filter((image) => image.src.includes("upload.wikimedia.org") && image.width >= 400 && image.height >= 250)
      .sort((left, right) => right.area - left.area);

    const rows = {};
    for (const row of Array.from(content.querySelectorAll("tr")).slice(0, 120)) {
      const cells = row.querySelectorAll("th,td");
      if (cells.length < 2) continue;
      const key = (cells[0].innerText || "").trim().replace(/\s+/g, " ");
      const value = (cells[1].innerText || "").trim().replace(/\s+/g, " ");
      if (key && value && key.length < 60 && !rows[key]) rows[key] = value.slice(0, 500);
    }

    const links = Array.from(content.querySelectorAll("a[href]"));
    const originalUrl = links.find((link) =>
      (link.innerText || "").includes("Original file") && link.href.includes("upload.wikimedia.org")
    )?.href || "";
    const licenseUrl = links.find((link) =>
      link.href.includes("creativecommons.org/licenses/") || link.href.includes("creativecommons.org/publicdomain/")
    )?.href || "";

    return {
      title: (document.querySelector("h1")?.innerText || "").replace(/^File:/, ""),
      text,
      rows,
      preview: images[0] || null,
      originalUrl,
      licenseUrl
    };
  });
}

function detectLicense(text) {
  return ALLOWED_LICENSE_PATTERNS.find(([, pattern]) => pattern.test(text))?.[0] || "";
}

export async function createBrowserArtworkSourcer(options) {
  const root = options.root;
  const manifestPath = `${root}/assets/artworks/manifest.json`;
  const planPath = `${root}/assets/artworks/search-plan.json`;
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const plan = JSON.parse(await readFile(planPath, "utf8"));

  async function saveManifest() {
    await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  }

  async function sourceOne(tab, id, queryOverride = "") {
    const query = queryOverride || plan[id]?.query;
    if (!query) return { id, status: "pending", reason: "missing search query" };

    try {
      const searchUrl = `https://commons.wikimedia.org/w/index.php?${new URLSearchParams({
        search: query,
        title: "Special:MediaSearch",
        type: "image"
      })}`;
      await tab.goto(searchUrl);
      await tab.playwright.waitForLoadState({ state: "domcontentloaded" });
      await tab.playwright.waitForTimeout(700);
      const candidates = await tab.playwright.evaluate(() => {
        const seen = new Set();
        return Array.from(document.querySelectorAll('a[href*="/wiki/File:"]'))
          .map((link) => ({ href: link.href, image: link.querySelector("img")?.src || "" }))
          .filter((item) => item.image && !seen.has(item.href) && seen.add(item.href))
          .slice(0, 12);
      });
      const ranked = candidates
        .map((candidate, index) => ({ ...candidate, index }))
        .sort((left, right) => candidateScore(right, id, query) - candidateScore(left, id, query));

      let selected = null;
      for (const candidate of ranked.slice(0, 4)) {
        await tab.goto(candidate.href);
        await tab.playwright.waitForLoadState({ state: "domcontentloaded" });
        await tab.playwright.waitForTimeout(700);
        const page = await readFilePage(tab);
        const license = detectLicense(page.text);
        if (license && page.preview) {
          selected = { ...page, license, sourceUrl: candidate.href };
          break;
        }
      }
      if (!selected) return { id, status: "pending", reason: "no licensed image candidate" };

      await tab.goto(selected.preview.src);
      await tab.playwright.waitForLoadState({ state: "domcontentloaded" });
      const rect = await tab.playwright.evaluate(() => {
        const image = document.querySelector("img");
        if (!image) return null;
        const bounds = image.getBoundingClientRect();
        return {
          x: Math.max(0, Math.round(bounds.x)),
          y: Math.max(0, Math.round(bounds.y)),
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
          viewportWidth: innerWidth,
          viewportHeight: innerHeight
        };
      });
      if (!rect) return { id, status: "pending", reason: "image did not render" };

      const screenshot = await tab.screenshot({ fullPage: false });
      const left = Math.min(rect.x, rect.viewportWidth - 1);
      const top = Math.min(rect.y, rect.viewportHeight - 1);
      const width = Math.min(rect.width, rect.viewportWidth - left);
      const height = Math.min(rect.height, rect.viewportHeight - top);
      if (width < 240 || height < 180) return { id, status: "pending", reason: "preview too small" };

      const crop = sharp(Buffer.from(screenshot)).extract({ left, top, width, height });
      await Promise.all([
        crop.clone().jpeg({ quality: 88 }).toFile(`${root}/assets/artworks/${id}.jpg`),
        crop.clone().resize({ width: 720, height: 720, fit: "inside", withoutEnlargement: true }).webp({ quality: 70 })
          .toFile(`${root}/assets/artworks/thumbs/${id}.webp`),
        crop.clone().resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true }).webp({ quality: 78 })
          .toFile(`${root}/assets/artworks/optimized/${id}.webp`)
      ]);

      const rows = selected.rows || {};
      const creator = rows.Artist || rows.Author || rows.Creator || "Creator not stated";
      manifest[id] = {
        src: `assets/artworks/${id}.jpg`,
        title: selected.title || id,
        creator,
        date: rows.Date || "Date shown on source page",
        institution: rows.Collection || rows.Institution || rows.Source || "Wikimedia Commons",
        license: selected.license,
        licenseUrl: selected.licenseUrl,
        sourceUrl: selected.sourceUrl,
        originalUrl: selected.originalUrl || selected.preview.src,
        attribution: creator,
        searchQuery: query
      };
      return { id, status: "sourced", title: selected.title, license: selected.license, width, height };
    } catch (error) {
      return { id, status: "pending", reason: error instanceof Error ? error.message : String(error) };
    }
  }

  async function sourceBatch(tabs, requests) {
    const results = await Promise.all(requests.map((request, index) =>
      sourceOne(tabs[index % tabs.length], request.id, request.query)
    ));
    await saveManifest();
    return results;
  }

  function remove(id) {
    delete manifest[id];
  }

  return { manifest, plan, remove, saveManifest, sourceBatch, sourceOne };
}
