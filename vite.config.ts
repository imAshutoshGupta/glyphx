/// <reference types="vitest/config" />
import { existsSync, readFileSync, writeFileSync } from "fs";
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { dirname, resolve } from "path";

const pkg = JSON.parse(readFileSync(resolve(__dirname, "package.json"), "utf8"));
const entry = resolve(__dirname, "src/index.ts");

// GlyphX is entirely interactive (hooks + Radix Dialog), so the whole
// bundle is a client module. This banner makes the published output a
// valid Next.js App Router client boundary, so consumers can import it
// directly into a Server Component without wrapping it themselves.
const banner = '"use client";';

// The npm builds import their dependencies instead of bundling them, so the
// consumer's package manager installs each one once and shares it (one
// React, one Radix). Subpaths count too: bundling react/jsx-runtime is what
// made the 0.2.2 ESM build call require("react").
const dependencies = [
  ...Object.keys(pkg.dependencies),
  ...Object.keys(pkg.peerDependencies),
];
const isDependency = (id: string) =>
  dependencies.some((dep) => id === dep || id.startsWith(`${dep}/`));

// TypeScript resolves declaration files the way Node resolves modules, so
// their relative imports need full file names, which tsc doesn't add:
// - ESM consumers read the .d.ts files; their imports get a .js extension
//   (TypeScript then reads the matching .d.ts).
// - CommonJS consumers get a .d.cts copy of each file, because TypeScript
//   treats a .d.ts in a "type": "module" package as ESM, which `require`
//   can't load. The copies' imports name the .cjs file, so they stay
//   CommonJS too.
const RELATIVE_IMPORT = /(from\s+|import\()(["'])(\.{1,2}\/[^"']+)\2/g;

function writeDeclarations(emittedFiles: Map<string, string>) {
  for (const [file, content] of emittedFiles) {
    if (!file.endsWith(".d.ts")) continue;
    const withExtension = (extension: string) =>
      content.replace(RELATIVE_IMPORT, (_, before, quote, specifier) => {
        const path = existsSync(resolve(dirname(file), `${specifier}.d.ts`))
          ? specifier
          : `${specifier}/index`;
        return `${before}${quote}${path}${extension}${quote}`;
      });
    writeFileSync(file, withExtension(".js"));
    writeFileSync(file.replace(/\.d\.ts$/, ".d.cts"), withExtension(".cjs"));
  }
}

// `vite build`: the ESM and CommonJS builds that npm consumers import.
const libraryConfig: UserConfig = {
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      afterBuild: writeDeclarations,
    }),
  ],
  build: {
    lib: {
      entry,
      formats: ["es", "cjs"],
      fileName: "index",
    },
    rolldownOptions: {
      external: isDependency,
      output: { banner },
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["src/**/*.test.ts"], environment: "node" },
      },
      {
        extends: true,
        test: { name: "dom", include: ["src/**/*.test.tsx"], environment: "jsdom" },
      },
    ],
  },
};

// `vite build --mode umd`: the <script> tag build. It needs only the React
// and ReactDOM globals (React 18's UMD builds; React 19 ships none) and
// bundles everything else.
const umdConfig: UserConfig = {
  plugins: [react()],
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  resolve: {
    alias: {
      "react/jsx-runtime": resolve(__dirname, "src/umd/jsx-runtime.ts"),
    },
  },
  build: {
    // Keep the npm build's files.
    emptyOutDir: false,
    lib: {
      entry,
      name: "GlyphX",
      formats: ["umd"],
      fileName: () => "index.umd.js",
      cssFileName: "index",
    },
    rolldownOptions: {
      external: ["react", "react-dom"],
      output: {
        banner,
        globals: { react: "React", "react-dom": "ReactDOM" },
      },
    },
  },
};

// `vite --mode site` / `vite build --mode site`: the website in site/,
// published to GitHub Pages at https://imashutoshgupta.github.io/glyphx/.
// It imports "glyphx" from this repository's source, so it always shows the
// current code, and its examples read exactly like an app's.
const siteRoot = resolve(__dirname, "site");
const siteConfig: UserConfig = {
  root: siteRoot,
  base: "/glyphx/",
  plugins: [react()],
  define: { __GLYPHX_VERSION__: JSON.stringify(pkg.version) },
  resolve: {
    alias: [
      { find: /^glyphx\/style\.css$/, replacement: resolve(__dirname, "src/index.css") },
      { find: /^glyphx$/, replacement: resolve(__dirname, "src/index.ts") },
    ],
  },
  build: {
    outDir: resolve(__dirname, "dist-site"),
    emptyOutDir: true,
    rolldownOptions: {
      input: {
        home: resolve(siteRoot, "index.html"),
        docs: resolve(siteRoot, "docs/index.html"),
        playground: resolve(siteRoot, "playground/index.html"),
        privacy: resolve(siteRoot, "privacy/index.html"),
        notFound: resolve(siteRoot, "404.html"),
      },
    },
  },
};

export default defineConfig(({ mode }) =>
  mode === "umd" ? umdConfig : mode === "site" ? siteConfig : libraryConfig
);
