# Changelog

All notable changes to GlyphX are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Changed

- The README shows monthly npm downloads and a page-view counter.

### Fixed

- The documentation's script-tag example loaded GlyphX 0.3 from unpkg, so people who copied it got an old version. It now follows the current release.

## [0.5.0] - 2026-10-20

### Changed

- ⌘/Ctrl + K now opens the palette by default, as well as ⌘/Ctrl + Shift + P. Firefox keeps ⌘/Ctrl + Shift + P for a private window and never passes it to the page, so the default shortcut didn't work in Firefox. Some browsers use ⌘/Ctrl + K to focus their search box, but the page can take it over. If your app already uses ⌘/Ctrl + K, for example to insert a link in a text editor, pass `shortcut={{ key: "p", shift: true }}` to keep only the old default.
- The website uses the default shortcuts instead of adding ⌘/Ctrl + K itself. The README and documentation drop the Firefox workaround, and the documentation explains which shortcuts browsers keep for themselves.

## [0.4.0] - 2026-10-20

### Changed

- **License:** GlyphX is now licensed under the [PolyForm Noncommercial License 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0) (was MIT). It's free for personal and other noncommercial use; commercial use needs the author's permission ([email](mailto:aguptaworkspace@gmail.com?subject=GlyphX%20commercial%20license)). Versions up to and including 0.3.1 remain available under the MIT License.
- The README, website footer, privacy page and package metadata name the author, Ashutosh Gupta, with contact details. The website's palette has "Contact the developer" and "Ask about a commercial license" commands, and the docs FAQ explains commercial use.

## [0.3.1] - 2026-10-20

### Changed

- `Command.run` is typed `() => unknown` (was `() => void | Promise<void>`). One-liners whose result isn't void, such as `() => window.open(url)`, `() => element.classList.toggle("dark")` or the Pages Router's `() => router.push("/")`, were type errors. GlyphX still ignores the result and doesn't wait for promises. Code that compiled before still compiles.
- The README is shorter: features, installation, a usage example and key notes, with the full guide on the website. The bundle-size badge, which showed "rate limited", is replaced by TypeScript and documentation badges.
- New logo: a black tile showing a tiny command palette (a search field, a selected row and the next row), drawn in black and white. It replaces the terminal-prompt logo.

### Added

- A full website at [imashutoshgupta.github.io/glyphx](https://imashutoshgupta.github.io/glyphx/), published by GitHub Pages on every push to `main`. It replaces the single-page playground:
  - **Home:** what GlyphX does, a live demo and a quick start.
  - **Documentation:** installation, commands, search, shortcuts, controlled mode, theming, Next.js, script tags, TypeScript, accessibility, testing, tips, an FAQ and the API reference.
  - **Playground:** switch command sets (including 1,000 commands), themes, shortcuts and accent colors, with a live event log and generated code.
  - **Privacy and data:** what the site stores (only a theme choice) and confirmation that GlyphX collects nothing.
  - A monochrome design that follows light and dark mode, a palette with more than 50 commands on every page, link previews for social sites, and a 404 page.

  Every page is prerendered to HTML at build time, so its content shows before JavaScript runs and search engines can read it. The site lives in `site/` and imports `glyphx` from `src/`. `npm run dev` starts it, `npm run build:site` builds it into `dist-site/`, `npm run preview` serves that folder, and CI builds it on every push. The old playground files (`index.html`, `src/App.tsx`, `src/main.tsx`, `src/demo.css`) moved into it.

### Fixed

- The palette could appear behind sticky headers and other content with its own stacking order, because it had no `z-index`. The palette and its backdrop now have `z-index: 50`.
- Subtitles and shortcut labels on the selected row were slightly below the WCAG AA contrast ratio in light mode. The light `--glyphx-muted` is a little darker.
- An app's global focus style, such as `:focus-visible { outline: … }`, drew a box around the palette's search field. The field and dialog now keep their outline off; the text cursor shows where focus is.
- Setting `data-glyphx-theme="light"` on the `<html>` element didn't force light colors while the OS was in dark mode. Color overrides on `:root` still win over GlyphX's defaults in both modes, as long as they load after `glyphx/style.css`.
- The README said `<GlyphX>` could be rendered directly from a Next.js Server Component. Its commands contain functions, which Server Components can't pass to client components. The documentation now shows defining the commands in a small client component.

## [0.3.0] - 2026-10-20

### Changed

- **Breaking (theme overrides only):** GlyphX's CSS custom properties and animations are namespaced. `--bg`, `--fg`, `--muted`, `--border` and `--glass` are now `--glyphx-bg`, `--glyphx-fg`, `--glyphx-muted`, `--glyphx-border` and `--glyphx-glass`, and the `spotlight-in` / `spotlight-out` keyframes are now `glyphx-in` / `glyphx-out`. The old names were set on `:root` unprefixed, so they could clash with an app's own tokens of the same name (for example shadcn/ui's `--border` and `--muted`) and change the app's colors or GlyphX's. If you overrode them to theme GlyphX, rename your overrides.
- **Breaking (`<script>` tag only):** the UMD global is now `window.GlyphX` (was `window.Glyph`), and the file is `dist/index.umd.js` (was `dist/index.umd.cjs`). ESM and CommonJS imports are unchanged.
- **Breaking (controlled mode):** when you pass `open`, GlyphX now follows it and never opens or closes on its own. The shortcut, Escape, outside clicks and running a command call `onOpenChange` with the requested state. Before, the shortcut opened the palette even if the parent kept `open` at `false`, and running a command closed it without calling `onOpenChange(false)`. The parent's state then stayed `true`, so setting `open` to `true` again changed nothing and the palette couldn't be reopened.
- **Breaking (tests that query the DOM):** command rows are now `role="option"` elements in a `role="listbox"`, and the search input is a `role="combobox"` that points at the selected row with `aria-activedescendant`. Rows used to be `<button>`s, so tests that found them with `getByRole("button")` need `getByRole("option")`.
- `glyphx/style.css` no longer restyles the host page. It used to include Tailwind CSS, whose base reset changed headings, buttons, inputs, lists and images across the whole page, along with global utility classes such as `.flex` and `.fixed`. It is now plain CSS that styles only GlyphX's own `glyphx-*` classes and sets only `--glyphx-*` variables. It is 3.4 KB instead of 13 KB. Your own global styles also can't override the palette's any more: the old Tailwind styles were in a cascade layer, which any unlayered rule (such as `input { … }`) beats.
- The ESM and CommonJS builds import Radix, Zustand and fuzzysort instead of bundling copies of them, so your package manager installs one shared copy. The ESM bundle is 10 KB instead of 68 KB. The CommonJS entry point is now `dist/index.cjs`.
- Search matches the title, subtitle and keywords separately. Before, they were joined into one string, so a fuzzy match could take letters from more than one field ("homens" matched "Go **Hom**e" plus the keywords "**n**av **s**tart"). For equally good matches, a title match ranks above a subtitle match, which ranks above a keyword match. Matched letters are highlighted in the title, or in the subtitle when the title doesn't match.
- Moving the pointer over a row selects it. Before, hovering highlighted the row under the pointer while the keyboard selection stayed highlighted elsewhere.
- Commands run once the palette has closed, instead of while it is still open.
- CI runs on Node 22 and 24 (was Node 20, which reached end of life in April 2026) and uses `actions/checkout` and `actions/setup-node` v7.
- Development: Tailwind CSS, PostCSS and Autoprefixer are no longer used. `tailwind.config.ts` and `postcss.config.cjs` are removed. The playground has its own stylesheet, `src/demo.css`.
- Development dependencies are updated to versions without known security issues: `npm audit` reports 0 vulnerabilities (it reported 9 high and moderate ones, all in build and test tools; the published package was never affected).
- The playground is now also a website, published to [GitHub Pages](https://imashutoshgupta.github.io/glyphx/) on every push to `main`. It has an "Open the palette" button for phones and Firefox, ⌘/Ctrl + K as a second shortcut, the install command, and light/dark/system theme switches. `npm run build:site` builds it into `dist-site/`, and `npm run preview` serves that folder.
- The playground's "Toggle Dark Mode" command switches the palette and the page between light and dark. Before, it toggled a `dark` class that nothing used.
- The playground uses GlyphX branding throughout: page title (was `react-command-palette`), favicon (was a missing `vite.svg`), heading and copy. Its "Open GitHub" command opens the GlyphX repository.

### Fixed

- Command rows were unreadable in light mode. Rows used fixed dark colors (near-white text, dark selected background) that ignored the theme. They now use the theme variables, so they follow light and dark mode like the rest of the palette. Two new variables, `--glyphx-selected` (selected/hovered row background) and `--glyphx-accent` (matched-character highlight), can be overridden like the others. Group headings and shortcut labels now use `--glyphx-muted`.
- Clicking a command now closes the palette immediately, the same as pressing Enter. Before, a click waited for an async `run()` to finish, so the palette stayed open until a slow command completed.
- The ESM build (`dist/index.js`) no longer bundles React's JSX runtime. In 0.2.2 the bundled copy called `require("react")`, which throws in pure-ESM environments (for example Node ESM / SSR without a bundler). `react/jsx-runtime` and other React subpaths are now external, so GlyphX uses the consumer's React. The ESM bundle is also ~8 KB smaller.
- Fixed two ESLint errors (`no-case-declarations` in `usePaletteNavigation`, `no-unused-expressions` in `GlyphX`). No behavior change.
- Enter could run a different command than the highlighted one. Rows are displayed grouped, but Enter picked from the ungrouped, search-ranked order. Whenever commands from different groups were mixed, the two orders differed. For example, with Alpha (group X), Bravo (Y) and Charlie (X), pressing ↓ highlighted Charlie, but Enter ran Bravo.
- Passing a new `commands` array while the palette was open cleared the search results back to the full list, though the search box still showed the typed text. The search and the selected command are now kept. This happened on any parent re-render that created the array inline.
- Pressing Enter after tabbing to a row ran the keyboard-selected command instead of that row. Rows are no longer in the tab order; focus stays in the search input.
- Pressing Enter to confirm text in an input method editor (IME) for Chinese, Japanese, Korean and similar languages ran a command. Keys pressed while the IME is composing text are now left to it.
- Closing the palette left keyboard focus on the page body instead of returning it to where it was before opening, such as an editor or a form field.
- A command that moves focus, such as "Focus search", lost it: commands ran while the palette still held focus, and closing then moved focus away. Commands now run after the palette has closed and focus has returned to the page.
- The close animation never played: the palette and its backdrop disappeared at once. They now fade out, and both animations are skipped when the OS "reduce motion" setting is on.
- Shortcuts with `alt: true` never fired on macOS, because Option changes the typed character (Option + J types `∆`). The default shortcut also didn't fire on non-Latin keyboard layouts such as Russian. Both now match the key's position on a US keyboard when the typed character isn't a Latin letter or digit.
- The shortcut handler threw an error on the `keydown` events that browsers fire without a `key` while autofilling a form.
- TypeScript reported error TS1479 when GlyphX was imported from a CommonJS module with `"moduleResolution": "node16"` or `"nodenext"`. CommonJS consumers now get `.d.cts` declaration files.
- With `"moduleResolution": "node16"` or `"nodenext"`, TypeScript couldn't load GlyphX's types in ESM projects either, so imports were silently untyped. The declaration files imported each other without file extensions, which that resolution mode requires. They now include them.
- The UMD build expected a `ReactJSXRuntime` global that no page defines, so it failed when loaded with a `<script>` tag. It now needs only the `React` and `ReactDOM` globals.
- The CI type-check step checked nothing: `tsc --noEmit` on the root `tsconfig.json`, which lists no files of its own. CI now runs `npm run typecheck` (`tsc -b`), which also checks the tests and `vite.config.ts`.
- `vite.config.ts` used `environmentMatchGlobs`, which Vitest 4 removed. It now uses Vitest projects, so `.tsx` tests run in jsdom without a per-file `@vitest-environment` comment.
- Errors from a command's `run` are logged with a `[glyphx]` prefix (was `[command-palette]`).

### Added

- GlyphX logo (`assets/logo.svg`), used in the README header and as the playground favicon. The README also has npm version, CI, bundle-size and license badges.
- `repository`, `homepage`, `bugs` and `author` fields in `package.json`, so the npm page links to the GitHub repository and issue tracker.
- `theme` prop (`"system"`, `"light"` or `"dark"`), so the palette can follow your app's theme toggle instead of only the OS setting. The `GlyphXTheme` type is exported.
- `shortcut` accepts an array of shortcuts. Firefox reserves the default ⌘/Ctrl + Shift + P for a new private window, so pages never receive it. The README shows how to add ⌘/Ctrl + K alongside it.
- `npm run verify:dist` checks the build output:
  - the ESM and CommonJS builds start with `"use client"`, load, export `GlyphX`, and import their dependencies instead of bundling them;
  - TypeScript finds the types through both `import` and `require`;
  - the UMD build runs with only the `React` and `ReactDOM` globals and registers the `GlyphX` global;
  - the stylesheet only styles GlyphX's own elements.

  It runs in CI and in `prepublishOnly`.
- `npm run lint`, and a lint step in CI.
- `npm run typecheck`.
- The README documents the theme variables and how to load GlyphX with a `<script>` tag.
- Tests for `useCommandShortcut`, `usePaletteNavigation`, `useAutoScroll`, and for each fix above (97 tests total).

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

[Unreleased]: https://github.com/imAshutoshGupta/glyphx/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/imAshutoshGupta/glyphx/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/imAshutoshGupta/glyphx/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/imAshutoshGupta/glyphx/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/imAshutoshGupta/glyphx/compare/v0.2.2...v0.3.0
[0.2.2]: https://github.com/imAshutoshGupta/glyphx/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/imAshutoshGupta/glyphx/compare/v0.1.2...v0.2.1
[0.1.2]: https://github.com/imAshutoshGupta/glyphx/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/imAshutoshGupta/glyphx/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/imAshutoshGupta/glyphx/releases/tag/v0.1.0
