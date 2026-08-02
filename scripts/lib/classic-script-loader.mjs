import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import vm from "node:vm";

export const RAW_STYLE_SOURCE_FILES = Object.freeze([
  "data.js",
  "data-extra.js",
  "data-more.js",
  "visual-genes.js",
  "aesthetic-styles.js",
  "chinese-visual-directions.js",
  "data-expansion.js",
  "style-editorial-reviews.js"
]);

export const STYLE_SOURCE_FILES = Object.freeze([
  ...RAW_STYLE_SOURCE_FILES,
  "strict-catalog.js",
  "artworks.js"
]);

export const STYLE_PROMPT_SOURCE_FILES = Object.freeze([
  ...STYLE_SOURCE_FILES,
  "style-prompt-data.js"
]);

function getSourcePath(root, file) {
  return root instanceof URL ? new URL(file, root) : resolve(root, file);
}

export async function runClassicScripts(context, root, files) {
  for (const file of files) {
    const source = await readFile(getSourcePath(root, file), "utf8");
    vm.runInContext(source, context, { filename: file });
  }
  return context;
}

export async function loadClassicScripts(root, files, globals = {}) {
  const context = vm.createContext(globals);
  return runClassicScripts(context, root, files);
}

export function evaluateClassicExpression(context, expression) {
  return vm.runInContext(expression, context);
}
