// Sanity-checks the published build in dist/. Run after `npm run build`.
//
// Guards the guarantees the README makes about the package:
// - the ESM and CommonJS builds start with the "use client" directive, so
//   Next.js App Router Server Components can import GlyphX directly (the
//   directive only counts when it is the very first statement in the file)
// - the ESM and CommonJS entry points both load and export GlyphX, and import
//   their dependencies instead of bundling copies of them
// - TypeScript finds the types through both `import` and `require`
// - the UMD build runs with only the React and ReactDOM globals and registers
//   the `GlyphX` global for <script> tag use
// - the stylesheet only styles GlyphX's own elements
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import vm from "node:vm";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = (file) => resolve(root, "dist", file);
const require = createRequire(import.meta.url);
const pkg = JSON.parse(readFileSync(resolve(root, "package.json"), "utf8"));

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};
const read = (file) => {
  if (existsSync(dist(file))) return readFileSync(dist(file), "utf8");
  failures.push(`dist/${file} is missing`);
  return null;
};

for (const file of ["index.d.ts", "index.d.cts"]) {
  check(existsSync(dist(file)), `dist/${file} is missing`);
}

for (const file of ["index.js", "index.cjs"]) {
  const source = read(file);
  if (source === null) continue;
  check(
    /^\s*["']use client["'];/.test(source),
    `dist/${file} does not start with the "use client" directive`
  );
  for (const dependency of Object.keys(pkg.dependencies)) {
    check(
      source.includes(`"${dependency}"`),
      `dist/${file} bundles ${dependency} instead of importing it`
    );
  }
}

if (existsSync(dist("index.js"))) {
  const esm = await import(dist("index.js"));
  check(typeof esm.GlyphX === "function", "ESM build does not export GlyphX");
}

if (existsSync(dist("index.cjs"))) {
  const cjs = require(dist("index.cjs"));
  check(typeof cjs.GlyphX === "function", "CommonJS build does not export GlyphX");
}

// The fixtures import "glyphx" from inside this package, so TypeScript
// resolves it through package.json "exports", like an installed copy.
try {
  execFileSync(
    process.execPath,
    [require.resolve("typescript/bin/tsc"), "-p", resolve(root, "scripts/type-consumers")],
    { stdio: "pipe" }
  );
} catch (error) {
  failures.push(`TypeScript can't use the published types:\n${error.stdout}`);
}

const umd = read("index.umd.js");
if (umd !== null) {
  // Run it like a <script> tag after React 18's UMD builds: no module
  // system, just the React and ReactDOM globals.
  const React = require("react");
  const window = { React, ReactDOM: require("react-dom") };
  try {
    vm.runInNewContext(umd, window);
    const GlyphX = window.GlyphX?.GlyphX;
    check(typeof GlyphX === "function", "UMD build does not register the GlyphX global");
    if (typeof GlyphX === "function") {
      // React's development build reports problems (such as missing keys)
      // through console.error.
      const errors = [];
      const consoleError = console.error;
      console.error = (...args) => errors.push(args.join(" "));
      try {
        require("react-dom/server").renderToString(
          React.createElement(GlyphX, { commands: [] })
        );
      } finally {
        console.error = consoleError;
      }
      for (const error of errors) failures.push(`UMD build: React reported: ${error}`);
    }
  } catch (error) {
    failures.push(`UMD build fails with only the React and ReactDOM globals: ${error.message}`);
  }
}

const css = read("index.css");
if (css !== null) {
  // Every rule must target GlyphX's own elements, or set --glyphx-*
  // variables on :root, so importing the stylesheet can't restyle the page.
  const rules = css.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g);
  for (const [, selectors, body] of rules) {
    for (const selector of selectors.split(",").map((s) => s.trim())) {
      if (/^(from|to|[\d.]+%)$/.test(selector)) continue; // keyframe steps
      if (selector.startsWith(":root")) {
        const properties = body.split(";").map((d) => d.trim()).filter(Boolean);
        check(
          properties.every((d) => d.startsWith("--glyphx-")),
          "dist/index.css sets more than --glyphx-* variables on :root"
        );
        continue;
      }
      check(
        selector.includes("glyphx"),
        `dist/index.css styles elements outside GlyphX: ${selector}`
      );
    }
  }
}

if (failures.length) {
  console.error("dist verification failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("dist verification passed");
