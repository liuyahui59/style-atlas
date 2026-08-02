import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateClassicExpression, loadClassicScripts, STYLE_SOURCE_FILES } from "./lib/classic-script-loader.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const stylesRoot = resolve(root, "styles");
const styleIndexPath = resolve(stylesRoot, "index.html");
const expectedSections = [
  "definition",
  "recognition",
  "genes",
  "palette",
  "applications",
  "risks",
  "comparison",
  "intensity",
  "translation",
  "prompt",
  "prompt-errors",
  "history",
  "related"
];

const styleContext = await loadClassicScripts(root, STYLE_SOURCE_FILES);
const styleIds = JSON.parse(JSON.stringify(evaluateClassicExpression(styleContext, "STYLE_DATA.map((style) => style.id)")));
const strictStyleCount = evaluateClassicExpression(styleContext, "STRICT_STYLE_COUNT");
const pagePaths = styleIds.map((id) => resolve(stylesRoot, id, "index.html")).sort();
const failures = [];
const seenTitles = new Set();
const seenDescriptions = new Set();
const seenCanonicals = new Set();

if (pagePaths.length !== strictStyleCount) failures.push(`Expected ${strictStyleCount} strict style detail pages, found ${pagePaths.length}`);

for (const pagePath of pagePaths) {
  const html = await readFile(pagePath, "utf8");
  const relative = pagePath.slice(root.length + 1);

  for (const id of expectedSections) {
    const count = (html.match(new RegExp(`<section class="detail-section" id="${id}"`, "g")) || []).length;
    if (count !== 1) failures.push(`${relative}: section #${id} appears ${count} times`);
  }

  if (html.includes('class="primary-nav"')) failures.push(`${relative}: product navigation must not appear on a detail page`);
  if (!html.includes('class="back-to-atlas"')) failures.push(`${relative}: missing header return link`);
  if (!html.includes('href="../../index.html#atlas"')) failures.push(`${relative}: missing explicit return link to the main atlas`);
  if (/href="\.\.\/\.\.\/#(?:atlas|timeline|prompt)"/.test(html)) failures.push(`${relative}: file-mode module link targets a directory`);
  if (/上一项|下一项/.test(html)) failures.push(`${relative}: contains disallowed previous/next controls`);
  if ((html.match(/<h1>/g) || []).length !== 1) failures.push(`${relative}: must contain exactly one h1`);

  collectUniqueMeta(html, relative, /<title>(.*?)<\/title>/s, "title", seenTitles);
  collectUniqueMeta(html, relative, /<meta name="description" content="(.*?)" \/>/s, "description", seenDescriptions);
  collectUniqueMeta(html, relative, /<link rel="canonical" href="(.*?)" \/>/s, "canonical", seenCanonicals);

  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  if (!jsonLd) {
    failures.push(`${relative}: missing JSON-LD`);
  } else {
    try {
      JSON.parse(jsonLd);
    } catch (error) {
      failures.push(`${relative}: invalid JSON-LD (${error.message})`);
    }
  }

  if (html.includes('id="typography"')) failures.push(`${relative}: removed typography module is still present`);
  if (html.includes('id="prompt-examples"')) failures.push(`${relative}: removed Prompt examples module is still present`);

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const reference = match[1];
    if (/^(?:https?:|data:|mailto:|tel:|javascript:|#)/.test(reference)) continue;
    const cleanPath = reference.split(/[?#]/, 1)[0];
    if (!cleanPath) continue;
    const target = resolve(dirname(pagePath), cleanPath, cleanPath.endsWith("/") ? "index.html" : "");
    try {
      await access(target);
    } catch {
      failures.push(`${relative}: broken local reference ${reference}`);
    }
  }
}

const styleIndexHtml = await readFile(styleIndexPath, "utf8");
for (const view of ["atlas", "timeline", "prompt"]) {
  if (!styleIndexHtml.includes(`href="../index.html#${view}"`)) {
    failures.push(`styles/index.html: missing explicit main-site link for #${view}`);
  }
}
if (/href="\.\.\/#(?:atlas|timeline|prompt)"/.test(styleIndexHtml)) {
  failures.push("styles/index.html: file-mode module link targets a directory");
}

if (failures.length) {
  console.error(`Style page validation failed:\n${failures.join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`Validated ${pagePaths.length} detail pages, ${expectedSections.length} sections each, SEO metadata, JSON-LD, and local links`);
}

function collectUniqueMeta(html, relative, pattern, label, seen) {
  const value = html.match(pattern)?.[1];
  if (!value) {
    failures.push(`${relative}: missing ${label}`);
    return;
  }
  if (seen.has(value)) failures.push(`${relative}: duplicate ${label}`);
  seen.add(value);
}
