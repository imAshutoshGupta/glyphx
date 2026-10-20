/// <reference types="vitest/config" />
import { copyFileSync, readFileSync } from "fs";
import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";

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

// `vite build`: the ESM and CommonJS builds that npm consumers import.
const libraryConfig: UserConfig = {
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.build.json",
      // One self-contained declaration file, copied to index.d.cts for
      // CommonJS consumers: TypeScript treats a .d.ts in a "type": "module"
      // package as ESM, which `require` can't load.
      bundleTypes: true,
      afterBuild: () =>
        copyFileSync(
          resolve(__dirname, "dist/index.d.ts"),
          resolve(__dirname, "dist/index.d.cts")
        ),
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

export default defineConfig(({ mode }) =>
  mode === "umd" ? umdConfig : libraryConfig
);
