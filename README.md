<p align="center">
  <img src="https://raw.githubusercontent.com/imAshutoshGupta/glyphx/main/assets/logo.svg" width="72" height="72" alt="GlyphX logo" />
</p>

<h1 align="center">GlyphX</h1>

<p align="center">
  A fast, keyboard-first, Spotlight-style command palette for React.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/glyphx"><img src="https://img.shields.io/npm/v/glyphx" alt="npm version" /></a>
  <a href="https://github.com/imAshutoshGupta/glyphx/actions/workflows/ci.yml"><img src="https://github.com/imAshutoshGupta/glyphx/actions/workflows/ci.yml/badge.svg" alt="CI status" /></a>
  <a href="https://www.npmjs.com/package/glyphx"><img src="https://img.shields.io/npm/types/glyphx" alt="TypeScript types included" /></a>
  <a href="https://github.com/imAshutoshGupta/glyphx/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/glyphx" alt="MIT license" /></a>
  <a href="https://imashutoshgupta.github.io/glyphx/docs/"><img src="https://img.shields.io/badge/docs-website-blue" alt="Documentation" /></a>
</p>

<p align="center">
  <a href="https://imashutoshgupta.github.io/glyphx/"><b>Try it in your browser</b></a> ·
  <a href="https://imashutoshgupta.github.io/glyphx/docs/"><b>Documentation</b></a> ·
  <a href="https://imashutoshgupta.github.io/glyphx/playground/"><b>Playground</b></a>
</p>

## Features

- Opens with a keyboard shortcut (`⌘/Ctrl + Shift + P` by default, configurable)
- Fuzzy search across titles, subtitles and keywords
- Groups, subtitles and shortcut labels
- Light and dark themes, customizable with CSS variables
- Accessible: focus management and screen-reader support
- React 18 and 19, Next.js App Router, ESM and CommonJS, TypeScript

## Install

```bash
npm install glyphx
```

## Usage

```tsx
import { GlyphX, type Command } from "glyphx";
import "glyphx/style.css";

const commands: Command[] = [
  { id: "home", title: "Go to Home", group: "Navigation", run: () => window.location.assign("/") },
  { id: "settings", title: "Open Settings", keywords: ["preferences"], group: "Navigation", run: openSettings },
];

export function App() {
  return <GlyphX commands={commands} />;
}
```

Press `⌘ + Shift + P` (macOS) or `Ctrl + Shift + P` (Windows/Linux) to open it.

## Good to know

- **Firefox** keeps `Ctrl/⌘ + Shift + P` for itself. Add a second shortcut: `shortcut={[{ key: "p", shift: true }, { key: "k" }]}`.
- **Next.js:** commands contain functions, so define them in a client component ([example](https://imashutoshgupta.github.io/glyphx/docs/#nextjs)).
- **Open it from your own button** with the `open` and `onOpenChange` props ([controlled mode](https://imashutoshgupta.github.io/glyphx/docs/#controlled-mode)).
- **One palette per page:** GlyphX keeps its state in a shared store.

Everything else, including theming, the script-tag build, testing, tips and the API reference, is in the **[documentation](https://imashutoshgupta.github.io/glyphx/docs/)**.

## Development

```bash
npm install
npm run dev     # the website (site/), using the library source in src/
npm test
npm run build   # the library, into dist/
```

CI runs lint, type-check, tests and builds on every push. See the [changelog](https://github.com/imAshutoshGupta/glyphx/blob/main/CHANGELOG.md) for release history.

## License

[MIT](https://github.com/imAshutoshGupta/glyphx/blob/main/LICENSE)
