import { execFileSync } from "node:child_process";
import { readdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { evaluateClassicExpression, loadClassicScripts, STYLE_SOURCE_FILES } from "./lib/classic-script-loader.mjs";

const root = resolve(fileURLToPath(new URL("../", import.meta.url)));
const sourceDir = resolve(root, "../配图");
const artworkDir = resolve(root, "assets/artworks");
const manifestPath = resolve(artworkDir, "manifest.json");
const replaceExisting = process.argv.includes("--replace");
const onlyArgument = process.argv.find((argument) => argument.startsWith("--only="));
const onlyStyleIds = onlyArgument
  ? new Set(onlyArgument.slice("--only=".length).split(",").filter(Boolean))
  : null;

const aliases = new Map([
  ["木板年画", "chinese-new-year-print"],
  ["诧寂", "wabi-sabi"]
]);

const rejected = new Map([
  ["X 光艺术", "文件内容是医学放射影像，不是澳大利亚原住民 X-ray art 透视式绘画"]
]);

function cleanStem(filename) {
  return filename.replace(/\.(?:jpe?g|png|webp|avif).*$/i, "").trim();
}

function localSourceUrl(filename) {
  return `../配图/${encodeURIComponent(filename)}`;
}

const context = await loadClassicScripts(root, STYLE_SOURCE_FILES);
const styles = JSON.parse(JSON.stringify(evaluateClassicExpression(context, "STYLE_DATA")));
const styleIdsByName = new Map(styles.map((style) => [style.nameZh.trim(), style.id]));
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const files = (await readdir(sourceDir, { withFileTypes: true }))
  .filter((entry) => entry.isFile() && /\.(?:jpe?g|png|webp|avif)/i.test(entry.name))
  .map((entry) => entry.name)
  .sort((a, b) => a.localeCompare(b, "zh-CN"));

let imported = 0;
for (const filename of files) {
  const stem = cleanStem(filename);
  if (rejected.has(stem)) {
    console.log(`Rejected ${filename}: ${rejected.get(stem)}`);
    continue;
  }

  const styleId = aliases.get(stem) || styleIdsByName.get(stem);
  if (!styleId) {
    console.log(`Unmatched ${filename}`);
    continue;
  }
  if (onlyStyleIds && !onlyStyleIds.has(styleId)) continue;
  if (manifest[styleId]?.src && !replaceExisting) continue;

  const sourcePath = resolve(sourceDir, filename);
  const outputPath = resolve(artworkDir, `${styleId}.jpg`);
  execFileSync("sips", ["-s", "format", "jpeg", "-s", "formatOptions", "88", sourcePath, "--out", outputPath], {
    stdio: "ignore"
  });

  manifest[styleId] = {
    src: `assets/artworks/${styleId}.jpg`,
    title: basename(filename),
    creator: "",
    date: "",
    institution: "Project-provided asset",
    license: "Usage rights to be verified by project owner",
    licenseUrl: "",
    sourceUrl: localSourceUrl(filename),
    originalUrl: localSourceUrl(filename),
    attribution: "",
    searchQuery: ""
  };
  imported += 1;
  console.log(`Imported ${stem} -> ${styleId}`);
}

await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`Imported ${imported} local artworks`);
