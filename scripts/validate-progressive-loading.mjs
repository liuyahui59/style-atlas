import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const indexHtml = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const initialScriptSources = [...indexHtml.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/g)].map((match) => match[1]);
const deferredModuleScripts = [
  "prompt-ai-data.js",
  "prompt-options.js",
  "visual-vocabulary-mechanics.js",
  "visual-vocabulary.js"
];

deferredModuleScripts.forEach((src) => {
  assert(!initialScriptSources.includes(src), `${src} must not block the initial page load`);
});
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
  "app.js"
].forEach(runScript);

assert.equal(vm.runInContext("STYLE_DATA.length", context), 123, "The atlas must initialize all 123 styles without optional modules");
assert.equal(vm.runInContext("typeof PROMPT_CONTROL_GROUPS", context), "undefined", "Prompt controls must not load on the atlas view");
assert.equal(vm.runInContext("typeof VISUAL_VOCABULARY_GROUPS", context), "undefined", "Vocabulary data must not load on the atlas view");

runScript("prompt-options.js");
runScript("prompt-ai-data.js");
assert.equal(vm.runInContext("PROMPT_CONTROL_GROUPS.length", context), 11, "Prompt controls must load on demand");
assert.equal(vm.runInContext("STYLE_DATA.filter((style) => !style.aiPrompt).length", context), 0, "Every style must retain an AI prompt after on-demand loading");

runScript("visual-vocabulary-mechanics.js");
runScript("visual-vocabulary.js");
assert.equal(vm.runInContext("VISUAL_VOCABULARY_GROUPS.length", context), 11, "Vocabulary groups must load after their dependencies");
assert(vm.runInContext("VISUAL_VOCABULARY_COUNT", context) > 0, "Vocabulary entries must remain available");

console.log("Validated progressive loading for atlas, prompt, and vocabulary modules");
