# GlyphX

A fast, keyboard-first, Spotlight-style command palette for React.

GlyphX provides a clean, accessible, and native-feeling command menu inspired by macOS Spotlight and modern desktop tools.

## Features

- Keyboard-first UX (default `⌘ + Shift + P` / `Ctrl + Shift + P`, configurable)
- Fuzzy search with ranked results
- Arrow-key navigation with auto-scroll
- Grouped commands with optional subtitles
- System light / dark mode support
- Glass-style UI
- Accessible by default (Radix Dialog)
- Smooth, GPU-composited animations

## Compatibility

| Requirement | Supported |
| --- | --- |
| **React** | 18 and 19 |
| **Next.js** | 13.4+ (App Router) and 14 — also works on 15 via React 19 |
| **Module formats** | ESM (`import`) and CommonJS (`require`) |

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

> **Note:** Pass a stable (memoized) `commands` array. A new array reference on every render causes unnecessary re-normalization.

Press ⌘ + Shift + P on macOS or Ctrl + Shift + P on Windows/Linux to open the palette. (The default avoids ⌘/Ctrl + K, which collides with the browser address-bar shortcut.) You can change it with the [`shortcut`](#custom-shortcut) prop.

---

## Controlled Usage

```tsx
<GlyphX
  commands={commands}
  open={isOpen}
  onOpenChange={setIsOpen}
/>
```

## Custom Shortcut

By default the palette opens on `⌘ + Shift + P` (macOS) / `Ctrl + Shift + P` (Windows/Linux). The leading modifier is `⌘` on macOS and `Ctrl` elsewhere — detected automatically. Override the rest with the `shortcut` prop:

```tsx
// opens on ⌘/Ctrl + J
<GlyphX commands={commands} shortcut={{ key: "j" }} />
```

```ts
type ShortcutConfig = {
  key: string;     // the non-modifier key, e.g. "k", "p", "j"
  shift?: boolean; // also require Shift (default: false)
  alt?: boolean;   // also require Alt/Option (default: false)
};
```

The primary modifier (`⌘` on macOS, `Ctrl` on Windows/Linux) is always required and is not configurable.

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

## Known Limitations

- **Single instance per page:** GlyphX uses a module-level state store. Rendering two `<GlyphX>` components on the same page will cause them to share state (commands, open/closed status, query). Use one instance per page.
- **0.2.2 in pure-ESM environments:** the 0.2.2 ESM build throws `Calling require for "react"` when loaded without a bundler (for example Node ESM / SSR). Apps that bundle GlyphX resolve the call at build time and are not affected. This is fixed in the next release.

## Development

```bash
npm install
npm run dev          # playground app (src/App.tsx)
npm test             # unit and component tests
npm run lint         # ESLint
npm run build        # library build into dist/
npm run verify:dist  # check dist: "use client" banner, ESM + CJS entry points, types, CSS
```

CI runs lint → type-check → test → build → verify:dist on every push and pull request to `main`. `prepublishOnly` runs build, verify:dist and test before publishing.

See [CHANGELOG.md](CHANGELOG.md) for release history.

## Status

GlyphX is in early development.  
APIs may change until a stable release is published.

## License

MIT
