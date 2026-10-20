<p align="center">
  <img src="https://raw.githubusercontent.com/imAshutoshGupta/glyphx/main/assets/logo.svg" width="72" height="72" alt="GlyphX logo" />
</p>

<h1 align="center">GlyphX</h1>

<p align="center">
  A fast, keyboard-first, Spotlight-style command palette for React.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/glyphx"><img src="https://img.shields.io/npm/v/glyphx?color=18181b" alt="npm version" /></a>
  <a href="https://github.com/imAshutoshGupta/glyphx/actions/workflows/ci.yml"><img src="https://github.com/imAshutoshGupta/glyphx/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <a href="https://bundlephobia.com/package/glyphx"><img src="https://img.shields.io/bundlephobia/minzip/glyphx?color=18181b" alt="Bundle size" /></a>
  <a href="https://github.com/imAshutoshGupta/glyphx/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/glyphx?color=18181b" alt="MIT license" /></a>
</p>

GlyphX provides a clean, accessible, and native-feeling command menu inspired by macOS Spotlight and modern desktop tools.

**[Try it in your browser →](https://imashutoshgupta.github.io/glyphx/)**

## Features

- Keyboard-first UX (default `⌘ + Shift + P` / `Ctrl + Shift + P`, configurable)
- Fuzzy search with ranked results
- Arrow-key navigation with auto-scroll
- Grouped commands with optional subtitles
- Light and dark mode: follows the system, or set it with the [`theme`](#theme) prop
- Glass-style UI
- Accessible: Radix Dialog focus handling, and combobox/listbox markup so screen readers announce the selected command
- Smooth, GPU-composited animations
- A self-contained stylesheet that never restyles the rest of your page

## Compatibility

| Requirement | Supported |
| --- | --- |
| **React** | 18 and 19 |
| **Next.js** | 13.4+ (App Router) and 14 — also works on 15 via React 19 |
| **Module formats** | ESM (`import`) and CommonJS (`require`), each with TypeScript types; UMD for a [`<script>` tag](#script-tag) |

> **Why React 18 is the floor:** GlyphX depends on Zustand v5, which uses the native `useSyncExternalStore` API and therefore requires React 18 or newer. React 16/17 are not supported.

The published bundle is marked as a client module (`"use client"`), so you can import `<GlyphX>` directly into a **Next.js App Router Server Component** — no manual `"use client"` wrapper needed.

## Installation

```bash
npm install glyphx
```
or
```bash
pnpm add glyphx
```

## Setup

Import the stylesheet once at your app's entry point — it contains the theme variables and animations GlyphX needs:

```ts
import "glyphx/style.css";
```

**Next.js (App Router):** import the stylesheet once in your root layout (`app/layout.tsx`):

```tsx
// app/layout.tsx
import "glyphx/style.css";
```

`<GlyphX>` ships with `"use client"` baked in, so you can render it from a Server Component (e.g. directly in a layout or page) without adding your own client wrapper.

## Basic Usage

```tsx
import { GlyphX } from "glyphx";
import type { Command } from "glyphx";
import { useMemo } from "react";

export default function App() {
  const commands: Command[] = useMemo(
    () => [
      {
        id: "home",
        title: "Go to Home",
        group: "Navigation",
        run: () => {
          console.log("Navigate to home");
        },
      },
    ],
    []
  );

  return <GlyphX commands={commands} />;
}
```

> **Note:** Pass a stable (memoized) `commands` array. A new array reference on every render makes GlyphX re-index the commands each time. (The current search and selection are kept, so it costs time, not correctness.)

Press ⌘ + Shift + P on macOS or Ctrl + Shift + P on Windows/Linux to open the palette. (The default avoids ⌘/Ctrl + K, which collides with the browser address-bar shortcut.) You can change it with the [`shortcut`](#custom-shortcut) prop. **Firefox** reserves this combination for opening a private window and never passes it to the page, so add a second shortcut if your users are on Firefox (see [Custom Shortcut](#custom-shortcut)).

---

## Controlled Usage

```tsx
<GlyphX
  commands={commands}
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

When you pass `open`, GlyphX follows it and never opens or closes on its own. The shortcut, Escape, clicking outside and running a command all call `onOpenChange` with the requested state; update `open` there, as above.

## Custom Shortcut

By default the palette opens on `⌘ + Shift + P` (macOS) / `Ctrl + Shift + P` (Windows/Linux). The leading modifier is `⌘` on macOS and `Ctrl` elsewhere — detected automatically. Override the rest with the `shortcut` prop:

```tsx
// opens on ⌘/Ctrl + J
<GlyphX commands={commands} shortcut={{ key: "j" }} />
```

Pass an array to accept several shortcuts. For example, to keep the default and also open on ⌘/Ctrl + K, which works in Firefox:

```tsx
<GlyphX commands={commands} shortcut={[{ key: "p", shift: true }, { key: "k" }]} />
```

```ts
type ShortcutConfig = {
  key: string;     // the non-modifier key, e.g. "k", "p", "j"
  shift?: boolean; // also require Shift (default: false)
  alt?: boolean;   // also require Alt/Option (default: false)
};
```

The primary modifier (`⌘` on macOS, `Ctrl` on Windows/Linux) is always required and is not configurable.

A letter or digit `key` matches the key that types it, so Dvorak or Colemak users press the key labelled with that letter. When the pressed key types something else — on a non-Latin layout such as Russian, or with Option on macOS (Option + J types `∆`) — GlyphX matches the key in that letter's position on a US keyboard instead.

## Theme

GlyphX follows the system's light or dark setting. To match your app's theme toggle instead, pass `theme`:

```tsx
<GlyphX commands={commands} theme={isDark ? "dark" : "light"} />
```

`theme` is `"system"` (the default), `"light"` or `"dark"`.

The colors are CSS variables holding space-separated RGB channels. Override any of them on `:root` (or, with a fixed `theme`, on `[data-glyphx-theme="light"]` / `[data-glyphx-theme="dark"]`):

```css
:root {
  --glyphx-accent: 147 51 234; /* matched characters */
}
```

| Variable | Used for |
| --- | --- |
| `--glyphx-glass` | palette background (with alpha, e.g. `255 255 255 / 0.92`) |
| `--glyphx-fg` | text |
| `--glyphx-muted` | subtitles, group headings, shortcuts, placeholder |
| `--glyphx-border` | palette border |
| `--glyphx-selected` | selected row background |
| `--glyphx-accent` | matched characters |
| `--glyphx-bg` | page background (not used by the palette itself) |

## Command Shape

```ts
type Command = {
  id: string;
  title: string;
  subtitle?: string;   // shown below the title
  keywords?: string[]; // extra search terms, not displayed
  shortcut?: string;   // displayed on the right (e.g. "⌘ K")
  group?: string;      // groups commands under a heading
  run: () => void | Promise<void>;
};
```

`run` is called once the palette has closed and focus is back on the page, so a command can move focus (for example into an editor or a search field). GlyphX doesn't wait for a returned promise. If `run` throws or rejects, the error is logged to the console with a `[glyphx]` prefix.

Title matches rank above subtitle matches, which rank above keyword matches.

### `keywords`

`keywords` add invisible search aliases. They boost discoverability without cluttering the UI — useful for synonyms, abbreviations, or legacy names:

```ts
{
  id: "theme",
  title: "Toggle Dark Mode",
  keywords: ["appearance", "night mode", "theme", "colors"],
  run: toggleTheme,
}
```

A user typing "appearance" or "night mode" will surface this command even though neither word appears in the title.

## Design Goals

- Minimal visual noise
- Keyboard dominance
- Instant feedback
- Native-feeling motion
- Easy to integrate and customize

GlyphX is intended as a foundational UI primitive, not a full application.

## Upgrading from 0.1.x

The default keyboard shortcut changed from `⌘/Ctrl + K` to `⌘/Ctrl + Shift + P` to avoid conflicting with the browser's address-bar shortcut. If you want to keep the old shortcut, pass it explicitly:

```tsx
<GlyphX commands={commands} shortcut={{ key: "k" }} />
```

## Script Tag

The package also has a UMD build for pages without a bundler. It needs React 18's UMD builds loaded first (React 19 ships none) and defines a `GlyphX` global:

```html
<link rel="stylesheet" href="https://unpkg.com/glyphx/dist/index.css" />
<div id="palette"></div>
<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/glyphx/dist/index.umd.js"></script>
<script>
  const root = ReactDOM.createRoot(document.getElementById("palette"));
  root.render(
    React.createElement(GlyphX.GlyphX, {
      commands: [{ id: "hello", title: "Say hello", run: () => alert("Hello") }],
    })
  );
</script>
```

## Known Limitations

- **Single instance per page:** GlyphX uses a module-level state store. Rendering two `<GlyphX>` components on the same page will cause them to share state (commands, open/closed status, query). Use one instance per page.
- **0.2.2 in pure-ESM environments:** the 0.2.2 ESM build throws `Calling require for "react"` when loaded without a bundler (for example Node ESM / SSR). Apps that bundle GlyphX resolve the call at build time and are not affected. Fixed in 0.3.0.

## Development

```bash
npm install
npm run dev          # playground app (src/App.tsx)
npm run build:site   # playground as a static website, into dist-site/
npm run preview      # serve dist-site/ locally
npm test             # unit and component tests
npm run lint         # ESLint
npm run typecheck    # TypeScript, including tests and vite.config.ts
npm run build        # library build into dist/: ESM, CommonJS, UMD, types, CSS
npm run verify:dist  # check dist (see scripts/verify-dist.mjs)
```

`verify:dist` checks that the ESM and CommonJS builds start with `"use client"`, load, and import their dependencies instead of bundling them; that TypeScript finds the types through both `import` and `require`; that the UMD build runs with only the `React` and `ReactDOM` globals; and that the stylesheet only styles GlyphX's own elements.

CI runs lint → type-check → test → build → verify:dist on Node 22 and 24 for every push and pull request to `main`. `prepublishOnly` runs build, verify:dist and test before publishing.

Every push to `main` also publishes the playground to [GitHub Pages](https://imashutoshgupta.github.io/glyphx/) (`.github/workflows/pages.yml`).

See [CHANGELOG.md](https://github.com/imAshutoshGupta/glyphx/blob/main/CHANGELOG.md) for release history.

## Status

GlyphX is in early development.  
APIs may change until a stable release is published.

## License

MIT
