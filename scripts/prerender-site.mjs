// Fills each built website page in dist-site/ with its rendered HTML, so
// pages show their content before JavaScript runs and search engines can
// read it. Run by `npm run build:site`, after `vite build --mode site` and
// `vite build --mode prerender`.
import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ssrDir = resolve(root, "dist-site-ssr");
const { prerender } = await import(pathToFileURL(resolve(ssrDir, "prerender.js")).href);

const PAGES = [
  ["home", "index.html"],
  ["docs", "docs/index.html"],
  ["playground", "playground/index.html"],
  ["privacy", "privacy/index.html"],
  ["not-found", "404.html"],
];

const EMPTY_ROOT = '<div id="root"></div>';

for (const [page, file] of PAGES) {
  const path = resolve(root, "dist-site", file);
  const html = readFileSync(path, "utf8");
  if (!html.includes(EMPTY_ROOT)) throw new Error(`dist-site/${file} has no empty #root to fill`);
  const body = await prerender(page);
  // A function, so "$" in the page (code samples) isn't read as a pattern.
  writeFileSync(path, html.replace(EMPTY_ROOT, () => `<div id="root">${body}</div>`));
  console.log(`prerendered dist-site/${file} (${Math.round(body.length / 1024)} KB)`);
}

rmSync(ssrDir, { recursive: true, force: true });
