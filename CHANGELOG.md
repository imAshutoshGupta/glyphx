# Changelog

All notable changes to GlyphX are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- **Breaking (theme overrides only):** GlyphX's CSS custom properties and animations are namespaced. `--bg`, `--fg`, `--muted`, `--border` and `--glass` are now `--glyphx-bg`, `--glyphx-fg`, `--glyphx-muted`, `--glyphx-border` and `--glyphx-glass`, and the `spotlight-in` / `spotlight-out` keyframes are now `glyphx-in` / `glyphx-out`. The old names were set on `:root` unprefixed, so they could clash with an app's own tokens of the same name (for example shadcn/ui's `--border` and `--muted`) and change the app's colors or GlyphX's. If you overrode them to theme GlyphX, rename your overrides.
- **Breaking (`<script>` tag only):** the UMD global is now `window.GlyphX` (was `window.Glyph`). ESM and CommonJS imports are unchanged.
- The playground uses GlyphX branding throughout: page title (was `react-command-palette`), favicon (was a missing `vite.svg`), heading and copy. Its "Open GitHub" command opens the GlyphX repository.

### Fixed

- Command rows were unreadable in light mode. Rows used fixed dark colors (near-white text, dark selected background) that ignored the theme. They now use the theme variables, so they follow light and dark mode like the rest of the palette. Two new variables, `--glyphx-selected` (selected/hovered row background) and `--glyphx-accent` (matched-character highlight), can be overridden like the others. Group headings and shortcut labels now use `--glyphx-muted`.
- Clicking a command now closes the palette immediately, the same as pressing Enter. Before, a click waited for an async `run()` to finish, so the palette stayed open until a slow command completed.
- The ESM build (`dist/index.js`) no longer bundles React's JSX runtime. In 0.2.2 the bundled copy called `require("react")`, which throws in pure-ESM environments (for example Node ESM / SSR without a bundler). `react/jsx-runtime` and other React subpaths are now external, so GlyphX uses the consumer's React. The ESM bundle is also ~8 KB smaller.
- Fixed two ESLint errors (`no-case-declarations` in `usePaletteNavigation`, `no-unused-expressions` in `GlyphX`). No behavior change.

### Added

- GlyphX logo (`assets/logo.svg`), used in the README header and as the playground favicon. The README also has npm version, CI, bundle-size and license badges.
- `repository`, `homepage`, `bugs` and `author` fields in `package.json`, so the npm page links to the GitHub repository and issue tracker.
- `npm run verify:dist` checks the build output: both bundles start with `"use client"`, the ESM and CommonJS entry points load and export `GlyphX`, the UMD build registers the `GlyphX` global, and the type declarations and stylesheet are present. It runs in CI and in `prepublishOnly`.
- `npm run lint`, and a lint step in CI.
- Tests for `useCommandShortcut`, `usePaletteNavigation` and `useAutoScroll` (64 tests total).

## [0.2.2] - 2026-06-13

### Added

- The published bundle is marked `"use client"`, so `<GlyphX>` can be imported directly into Next.js App Router Server Components.
- README compatibility table (React 18/19, Next.js 13.4+) and an explanation of the React 18 floor (Zustand v5 needs `useSyncExternalStore`).
- `prepublishOnly` guard (build + test) to prevent publishing a stale `dist`.

### Changed

- Upgraded Vite 7 → 8 and set UMD globals. `npm audit` is clean.

### Known issues

- The ESM build throws `Calling require for "react"` in pure-ESM environments. Fixed in the next release.

## [0.2.1] - 2026-06-07

### Added

- `shortcut` prop (`ShortcutConfig`) to configure the key combination that opens the palette.
- Subtitle fuzzy-match characters are highlighted alongside title matches.
- `aria-label` on `CommandItem` for a correct accessible name.
- Type declaration files (`.d.ts`) generated with `vite-plugin-dts`.
- GitHub Actions CI (type-check → test → build).
- 49 tests covering the engine, store, result grouping and the `GlyphX` component.

### Changed

- **Breaking:** the default shortcut changed from `⌘/Ctrl + K` to `⌘/Ctrl + Shift + P` to avoid the browser's address-bar shortcut. Pass `shortcut={{ key: "k" }}` to keep the old one.
- Removed the unused `clsx` and `cmdk` dependencies.

### Fixed

- `close()` did not reset the results, so the palette now shows all commands when reopened.

## [0.1.2] - 2026-01-11

### Changed

- Package metadata updates.

## [0.1.1] - 2026-01-11

### Changed

- Added package keywords and revised the README.

## [0.1.0] - 2026-01-11

### Added

- Initial release: keyboard-first command palette with fuzzy search, grouped commands, arrow-key navigation with auto-scroll, light/dark mode and a Radix Dialog for accessibility.

[Unreleased]: https://github.com/imAshutoshGupta/glyphx/compare/v0.2.2...HEAD
[0.2.2]: https://github.com/imAshutoshGupta/glyphx/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/imAshutoshGupta/glyphx/compare/v0.1.2...v0.2.1
[0.1.2]: https://github.com/imAshutoshGupta/glyphx/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/imAshutoshGupta/glyphx/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/imAshutoshGupta/glyphx/releases/tag/v0.1.0
