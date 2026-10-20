import { useMemo, useRef, type RefObject } from "react";
import type { Command } from "glyphx";
import { ArrowRight, Search } from "lucide-react";
import { render } from "../render";
import { Layout } from "../components/Layout";
import { Code, InstallTabs } from "../components/CodeBlock";
import { useSite } from "../context";
import { CHANGELOG_URL, PAGES, VERSION } from "../links";
import { MOD } from "../platform";
import { QUICK_START } from "../snippets";

const FEATURES = [
  {
    key: "↵",
    title: "Keyboard-first",
    text: `Opens with ${MOD} Shift P by default (this site adds ${MOD} K), then arrows, Enter and Esc. Pick your own shortcuts.`,
  },
  {
    key: "≈",
    title: "Fuzzy search",
    text: "“tgl drk” finds “Toggle light and dark”. For equally good matches, titles rank above subtitles and keywords.",
  },
  {
    key: "≡",
    title: "Groups and subtitles",
    text: "Organize commands under headings, with an optional second line of detail.",
  },
  {
    key: "◐",
    title: "Light and dark",
    text: "Follows the system or your app's theme toggle. Every color is a CSS variable.",
  },
  {
    key: "⇥",
    title: "Accessible",
    text: "Focus stays inside while it's open and returns when it closes. Screen readers announce the selected command.",
  },
  {
    key: "KB",
    title: "Small and scoped",
    text: "About 10 KB of its own JavaScript (around 17 KB gzipped with its dependencies) and 3 KB of CSS that only styles the palette, never your page.",
  },
  {
    key: "</>",
    title: "Ready for Next.js",
    text: "Marked “use client”, so it works in the App Router. Define commands in a small client component and render it from your root layout.",
  },
  {
    key: "TS",
    title: "TypeScript",
    text: "Typed props and commands, for ESM and CommonJS projects alike.",
  },
];

const THINGS_TO_TRY = [
  { query: "theme", text: "Switch between light and dark." },
  { query: "accent", text: "Recolor the palette live, through a CSS variable." },
  { query: "slow", text: "Run an async command; the palette closes right away." },
  { query: "docs", text: "Jump to any section of the documentation." },
  { query: "copy", text: "Copy the install command or a full example." },
  { query: "tgl drk", text: "Fuzzy search: letters don't need to be next to each other." },
];

// A picture of the palette, built from GlyphX's own classes so it matches
// the real thing in both themes. Clicking it opens the real one.
function PalettePreview() {
  const { openPalette } = useSite();

  return (
    <button
      type="button"
      className="preview"
      onClick={() => openPalette()}
      aria-label="Open the command palette"
    >
      <div className="preview-window" aria-hidden>
        <div className="preview-input">
          <Search size={16} />
          <span>dark</span>
          <span className="preview-caret" />
        </div>
        <div className="preview-list">
          <div className="glyphx-group-heading">Appearance</div>
          <div className="glyphx-item preview-selected">
            <span className="glyphx-item-text">
              <span>
                Switch to <span className="glyphx-highlight">dark</span> theme
              </span>
            </span>
          </div>
          <div className="glyphx-item">
            <span className="glyphx-item-text">
              <span>
                Toggle light and <span className="glyphx-highlight">dark</span>
              </span>
            </span>
          </div>
          <div className="glyphx-group-heading">Documentation</div>
          <div className="glyphx-item">
            <span className="glyphx-item-text">
              <span>Themes and colors</span>
              <span className="glyphx-item-subtitle">Documentation</span>
            </span>
          </div>
        </div>
      </div>
      <span className="preview-hint keyboard-only" aria-hidden>
        Click it, or press {MOD} K
      </span>
    </button>
  );
}

function Home({ scratchpad }: { scratchpad: RefObject<HTMLInputElement | null> }) {
  const { openPalette } = useSite();

  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <a className="eyebrow" href={CHANGELOG_URL}>
              What's new in v{VERSION}
              <ArrowRight size={14} aria-hidden />
            </a>
            <h1>The command palette for your React app.</h1>
            <p className="hero-lead">
              GlyphX adds a Spotlight-style command menu to any React app, with
              fuzzy search, groups, keyboard navigation, light and dark themes,
              and screen-reader support. It's one component.
            </p>
            <div className="hero-actions">
              <button type="button" className="button button-primary" onClick={() => openPalette()}>
                Try it now
                <kbd className="kbd keyboard-only">{MOD} K</kbd>
              </button>
              <a className="button button-secondary" href={`${PAGES.docs}#installation`}>
                Get started
              </a>
            </div>
            <div className="hero-install">
              <InstallTabs />
            </div>
          </div>
          <PalettePreview />
        </div>
      </section>

      <section className="section" aria-labelledby="features-title">
        <div className="container">
          <div className="section-header">
            <p className="section-kicker">Why GlyphX</p>
            <h2 id="features-title">Everything a command palette needs. Nothing it doesn't.</h2>
            <p className="section-lead">
              Give it a list of commands and it handles the rest: search,
              ranking, grouping, keyboard and mouse, focus and theming.
            </p>
          </div>
          <div className="feature-grid">
            {FEATURES.map(({ key, title, text }) => (
              <div key={title} className="feature">
                <span className="feature-key" aria-hidden>
                  {key}
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="try-title">
        <div className="container">
          <div className="section-header">
            <p className="section-kicker">Try it</p>
            <h2 id="try-title">This whole website runs on GlyphX</h2>
            <p className="section-lead">
              Press <kbd className="kbd">{MOD}</kbd> <kbd className="kbd">K</kbd> or
              use the search button at the top, then type one of these, or click
              a card to try it. There are more than 50 commands to explore.
            </p>
          </div>
          <div className="try-grid">
            {THINGS_TO_TRY.map(({ query, text }) => (
              <button
                key={query}
                type="button"
                className="try-card"
                onClick={() => openPalette(query)}
              >
                <strong>
                  Type <code>{query}</code>
                </strong>
                <span>{text}</span>
              </button>
            ))}
          </div>
          <div className="scratchpad">
            <label htmlFor="scratchpad">Scratchpad</label>
            <input
              id="scratchpad"
              ref={scratchpad}
              placeholder="Run “Focus the scratchpad”"
            />
            <span className="muted" style={{ fontSize: 14 }}>
              Commands run after the palette closes, so they can move the cursor,
              open dialogs or navigate.
            </span>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="start-title">
        <div className="container">
          <div className="section-header">
            <p className="section-kicker">Quick start</p>
            <h2 id="start-title">Up and running in a minute</h2>
          </div>
          <div className="steps">
            <div className="step">
              <h3>Install</h3>
              <p>Add the package with npm, pnpm, yarn or bun.</p>
            </div>
            <div className="step">
              <h3>Add the styles</h3>
              <p>
                Import <code>glyphx/style.css</code> once. It only styles the
                palette.
              </p>
            </div>
            <div className="step">
              <h3>List your commands</h3>
              <p>Render one GlyphX component with an array of commands.</p>
            </div>
          </div>
          <Code code={QUICK_START} title="App.tsx" />
          <a className="button button-secondary" href={PAGES.docs}>
            Read the full guide
            <ArrowRight size={16} aria-hidden />
          </a>
        </div>
      </section>

      <section className="container" aria-labelledby="cta-title">
        <div className="cta">
          <h2 id="cta-title">See every option in action</h2>
          <p>
            Switch themes, shortcuts and command sets, load 1,000 commands, and
            watch the events and the code update as you go.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={PAGES.playground}>
              Open the playground
            </a>
            <a className="button button-secondary" href={PAGES.docs}>
              Read the docs
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

function HomePage() {
  const scratchpad = useRef<HTMLInputElement>(null);

  const pageCommands = useMemo<Command[]>(
    () => [
      {
        id: "focus-scratchpad",
        title: "Focus the scratchpad",
        subtitle: "Moves the cursor into the text field on this page",
        keywords: ["input", "text field", "cursor", "type", "demo"],
        group: "Try it",
        run: () => {
          scratchpad.current?.scrollIntoView({ block: "center" });
          scratchpad.current?.focus({ preventScroll: true });
        },
      },
    ],
    []
  );

  return (
    <Layout page="home" pageCommands={pageCommands}>
      <Home scratchpad={scratchpad} />
    </Layout>
  );
}

render(<HomePage />);
