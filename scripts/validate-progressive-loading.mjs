import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { loadClassicScripts, runClassicScripts, STYLE_PROMPT_SOURCE_FILES } from "./lib/classic-script-loader.mjs";

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
assert(initialScriptSources.includes("strict-catalog.js"), "Strict catalog classification must load before the atlas app");
assert(initialScriptSources.indexOf("strict-catalog.js") < initialScriptSources.indexOf("artworks.js"), "Strict catalog must filter styles before artwork mapping");
assert(!initialScriptSources.includes("prompt-ai-data.js"), "Legacy prompt data must not load");
assert(!indexHtml.includes("contentModeControl"), "Prompt controls must not include the removed content-range option");
assert.match(indexHtml, /class="header-actions" id="headerActions"/, "Atlas-only header actions need a stable visibility target");
assert.match(indexHtml, /id="timelineGrid"/, "Visual history map needs a shared time grid");
assert.match(indexHtml, /横轴为时间、纵轴为大地域/, "Visual history map must expose its two approved axes accessibly");
assert.match(appSource, /dom\.headerActions\.hidden = view !== "atlas"/, "Favorites and compare actions must hide outside the atlas");
assert(!appSource.includes("style.track ==="), "Visual history map must not use the removed mixed cultural tracks");
assert.match(appSource, /data-toggle-gene/, "Prompt genes must remain available as persistent toggles");
assert.match(indexHtml, /lucide\.min\.js" async fetchpriority="low"/, "Lucide must remain non-blocking and low priority");

async function loadAppContext(storage) {
  const globals = {
    console,
    document: { addEventListener() {} },
    URLSearchParams
  };
  if (storage !== undefined) globals.localStorage = storage;
  return loadClassicScripts(rootDir, [...STYLE_PROMPT_SOURCE_FILES, "app.js"], globals);
}

const context = await loadAppContext({ getItem() { return null; } });

assert.equal(vm.runInContext("STYLE_DATA.length", context), vm.runInContext("STRICT_STYLE_COUNT", context), "The atlas must initialize the complete strict catalog");
assert.equal(vm.runInContext("Object.keys(FILTER_GROUPS).join(',')", context), "type,region,visualHistory", "Atlas filters must expose only the three approved axes");
assert.equal(vm.runInContext("typeof PROMPT_CONTROL_GROUPS", context), "undefined", "Prompt controls must not load on the atlas view");
assert.equal(vm.runInContext("typeof VISUAL_VOCABULARY_GROUPS", context), "undefined", "Vocabulary data must not load on the atlas view");
assert.equal(vm.runInContext("Object.keys(STYLE_PROMPT_DATA).length", context), vm.runInContext("STYLE_DATA.length", context), "Unified prompt data must cover all styles");
assert.equal(vm.runInContext("Object.values(STYLE_PROMPT_DATA).filter((data) => !data.genes.some((gene) => gene.kind === 'core') || !data.genes.some((gene) => gene.kind === 'adjustable')).length", context), 0, "Every style must distinguish core and adjustable genes");
assert.equal(vm.runInContext("Object.values(STYLE_PROMPT_DATA).flatMap((data) => data.genes).filter((gene) => !gene.promptZh || !gene.promptEn || gene.promptZh === gene.labelZh || gene.promptEn === gene.labelEn).length", context), 0, "Every human-facing gene needs a distinct model instruction");
assert.equal(vm.runInContext("STYLE_DATA.filter((style) => ['prompt', 'promptZh', 'promptEn', 'aiPrompt', 'visualSpec'].some((field) => field in style)).length", context), 0, "Legacy prompt fields must not remain on styles");
assert.equal(vm.runInContext("STYLE_DATA.filter((style) => !getStylePromptData(style.id)).length", context), 0, "Every style must resolve through unified prompt data");
assert.equal(vm.runInContext("JSON.stringify(TIMELINE_REGIONS)", context), vm.runInContext("JSON.stringify(FILTER_GROUPS.region)", context), "Timeline regions must match the approved broad-region axis");
assert.equal(vm.runInContext("STYLE_DATA.filter((style) => !TIMELINE_REGIONS.includes(getTimelineRegion(style))).length", context), 0, "Every style must resolve to one timeline region");
assert.equal(vm.runInContext("STYLE_DATA.filter((style) => style.broadRegions.length > 1 && getTimelineRegion(style) !== '全球/跨地域').length", context), 0, "Multi-region styles must appear once in the cross-region lane");
assert.equal(vm.runInContext("STYLE_DATA.map((style) => style.year).sort((a, b) => a - b).every((year, index, years) => index === 0 || timelinePosition(years[index - 1]) <= timelinePosition(year))", context), true, "Timeline positions must move monotonically from past to present");

await runClassicScripts(context, rootDir, ["prompt-options.js"]);
assert.equal(vm.runInContext("PROMPT_CONTROL_GROUPS.length", context), 11, "Prompt controls must load on demand");
assert.equal(vm.runInContext("STYLE_DATA.filter((style) => !buildStylePromptText(style, { language: 'zh' })).length", context), 0, "Every style must build a prompt on demand");

await runClassicScripts(context, rootDir, ["visual-vocabulary-mechanics.js", "visual-vocabulary.js"]);
assert.equal(vm.runInContext("VISUAL_VOCABULARY_GROUPS.length", context), 11, "Vocabulary groups must load after their dependencies");
assert(vm.runInContext("VISUAL_VOCABULARY_COUNT", context) > 0, "Vocabulary entries must remain available");

const unavailableStorage = {
  getItem() { throw new Error("storage unavailable"); },
  setItem() { throw new Error("storage unavailable"); }
};
const storageContext = await loadAppContext(unavailableStorage);
assert.equal(vm.runInContext("state.favorites.size", storageContext), 0, "Unavailable storage must not prevent startup");
assert.doesNotThrow(() => vm.runInContext("saveFavoriteIds(new Set(['bauhaus']))", storageContext), "Unavailable storage must not break favorite updates");

const corruptStorageContext = await loadAppContext({ getItem() { return "{broken"; } });
assert.equal(vm.runInContext("state.favorites.size", corruptStorageContext), 0, "Corrupt favorite data must not prevent startup");

const staleStorageContext = await loadAppContext({ getItem() { return '["bauhaus","removed-style",42,"bauhaus"]'; } });
assert.equal(
  vm.runInContext("[...state.favorites].join(',')", staleStorageContext),
  "bauhaus",
  "Favorite data must retain only known style ids"
);

console.log("Validated progressive loading for atlas, prompt, and vocabulary modules");
