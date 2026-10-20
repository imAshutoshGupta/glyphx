// Sanity-checks the published build in dist/. Run after `npm run build`.
//
// Guards the guarantees the README makes about the package:
// - both bundles start with the "use client" directive, so Next.js App Router
//   Server Components can import GlyphX directly (the directive only counts
//   when it is the very first statement in the file)
// - the ESM and CommonJS entry points both load and export GlyphX
// - type declarations and the stylesheet are present
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const dist = (file) => resolve(root, "dist", file);

const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
};

for (const file of ["index.js", "index.umd.cjs"]) {
  const path = dist(file);
  if (!existsSync(path)) {
    failures.push(`dist/${file} is missing`);
    continue;
  }
  const source = readFileSync(path, "utf8");
  check(
    /^\s*["']use client["'];/.test(source),
    `dist/${file} does not start with the "use client" directive`
  );
}

for (const file of ["index.d.ts", "index.css"]) {
  check(existsSync(dist(file)), `dist/${file} is missing`);
}

if (existsSync(dist("index.js"))) {
  const esm = await import(dist("index.js"));
  check(typeof esm.GlyphX === "function", "ESM build does not export GlyphX");
}

if (existsSync(dist("index.umd.cjs"))) {
  const cjs = createRequire(import.meta.url)(dist("index.umd.cjs"));
  check(typeof cjs.GlyphX === "function", "CommonJS build does not export GlyphX");
}

if (failures.length) {
  console.error("dist verification failed:");
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log("dist verification passed");
