/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";

export default defineConfig({
  plugins: [
    react(),
    dts({ tsconfigPath: "./tsconfig.build.json" }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Glyph",
      fileName: "index"
    },
    rollupOptions: {
      // Match subpaths too (react/jsx-runtime, react-dom/client, ...). Listing
      // only "react" bundles React's JSX runtime into dist, and its CJS
      // require("react") then throws in pure-ESM environments.
      external: [/^react(\/.*)?$/, /^react-dom(\/.*)?$/],
      output: {
        // Global names for the UMD build (used when loaded via <script> tag).
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "ReactJSXRuntime",
        },
        // GlyphX is entirely interactive (hooks + Radix Dialog), so the whole
        // bundle is a client module. This banner makes the published output a
        // valid Next.js App Router client boundary, so consumers can import it
        // directly into a Server Component without wrapping it themselves.
        // Applied on the shared output so both ES and UMD/CJS builds get it.
        banner: '"use client";'
      }
    }
  },
  test: {
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    environmentMatchGlobs: [
      ["src/**/*.test.tsx", "jsdom"],
      ["src/**/*.test.ts", "node"],
    ],
  }
});
