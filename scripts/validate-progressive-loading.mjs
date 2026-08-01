import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const initialScriptSources = [...indexHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map((match) => match[1]);
const deferredModuleScripts = [
  "prompt-options.js",
  "visual-vocabulary-mechanics.js",
  "visual-vocabulary.js"
];

deferredModuleScripts.forEach((src) => {
  assert(!initialScriptSources.includes(src), `${src} must not block the initial page load`);
});
assert(initialScriptSources.includes("style-prompt-data.js"), "Unified prompt data must load before the atlas app");
assert(!initialScriptSources.includes("prompt-ai-data.js"), "Legacy prompt data must not load");
assert(!indexHtml.includes("contentModeControl"), "Prompt controls must not include the removed content-range option");
assert.match(indexHtml, /class="header-actions" id="headerActions"/, "Atlas-only header actions need a stable visibility target");
assert.match(appSource, /dom\.headerActions\.hidden = view !== "atlas"/, "Favorites and compare actions must hide outside the atlas");
assert.match(appSource, /data-toggle-gene/, "Prompt genes must remain available as persistent toggles");
assert.match(indexHtml, /lucide\.min\.js" async fetchpriority="low"/, "Lucide must remain non-blocking and low priority");

const context = vm.createContext({
  console,
  document: { addEventListener() {} },
  localStorage: { getItem() { return null; } },
  URLSearchParams
});

function runScript(filename) {
  const source = fs.readFileSync(path.join(rootDir, filename), "utf8");
  vm.runInContext(source, context, { filename });
}

[
  "data.js",
  "data-extra.js",
  "data-more.js",
  "visual-genes.js",
  "artworks.js",
  "aesthetic-styles.js",
  "chinese-visual-directions.js",
  "style-prompt-data.js",
  "app.js"
].forEach(runScript);

assert.equal(vm.runInContext("STYLE_DATA.length", context), 123, "The atlas must initialize all 123 styles without optional modules");
assert.equal(vm.runInContext("typeof PROMPT_CONTROL_GROUPS", context), "undefined", "Prompt controls must not load on the atlas view");
assert.equal(vm.runInContext("typeof VISUAL_VOCABULARY_GROUPS", context), "undefined", "Vocabulary data must not load on the atlas view");
assert.equal(vm.runInContext("Object.keys(STYLE_PROMPT_DATA).length", context), 123, "Unified prompt data must cover all styles");
assert.equal(vm.runInContext("Object.values(STYLE_PROMPT_DATA).filter((data) => !data.genes.some((gene) => gene.kind === 'core') || !data.genes.some((gene) => gene.kind === 'adjustable')).length", context), 0, "Every style must distinguish core and adjustable genes");
assert.equal(vm.runInContext("Object.values(STYLE_PROMPT_DATA).flatMap((data) => data.genes).filter((gene) => !gene.promptZh || !gene.promptEn || gene.promptZh === gene.labelZh || gene.promptEn === gene.labelEn).length", context), 0, "Every human-facing gene needs a distinct model instruction");
assert.equal(vm.runInContext("STYLE_DATA.filter((style) => ['prompt', 'promptZh', 'promptEn', 'aiPrompt', 'visualSpec'].some((field) => field in style)).length", context), 0, "Legacy prompt fields must not remain on styles");
assert.equal(vm.runInContext("STYLE_DATA.filter((style) => !getStylePromptData(style.id)).length", context), 0, "Every style must resolve through unified prompt data");

runScript("prompt-options.js");
assert.equal(vm.runInContext("PROMPT_CONTROL_GROUPS.length", context), 11, "Prompt controls must load on demand");
assert.equal(vm.runInContext("STYLE_DATA.filter((style) => !buildStylePromptText(style, { language: 'zh' })).length", context), 0, "Every style must build a prompt on demand");

runScript("visual-vocabulary-mechanics.js");
runScript("visual-vocabulary.js");
assert.equal(vm.runInContext("VISUAL_VOCABULARY_GROUPS.length", context), 11, "Vocabulary groups must load after their dependencies");
assert(vm.runInContext("VISUAL_VOCABULARY_COUNT", context) > 0, "Vocabulary entries must remain available");

console.log("Validated progressive loading for atlas, prompt, and vocabulary modules");
