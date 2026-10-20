import { useEffect, useState, type ReactNode } from "react";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import { render } from "../render";
import { Layout } from "../components/Layout";
import { Code, InstallTabs } from "../components/CodeBlock";
import { DOC_SECTIONS, type DocSectionId } from "../docsSections";
import { PAGES } from "../links";
import { MOD } from "../platform";
import { CSS_IMPORT, QUICK_START } from "../snippets";

const SECTION_IDS = DOC_SECTIONS.map((section) => section.id);
const titleOf = (id: DocSectionId) => DOC_SECTIONS.find((s) => s.id === id)!.title;

// The section being read: the last one whose heading has scrolled past a
// line just below the header. Checked at most once per frame.
function useActiveSection() {
  const [active, setActive] = useState<string>(SECTION_IDS[0]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string = SECTION_IDS[0];
      for (const id of SECTION_IDS) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= 140) current = id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return active;
}

function Section({ id, children }: { id: DocSectionId; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`}>
        {titleOf(id)}
        <a className="heading-anchor" href={`#${id}`} aria-hidden tabIndex={-1}>
          #
        </a>
      </h2>
      {children}
    </section>
  );
}

function Callout({ tone = "info", children }: { tone?: "info" | "tip" | "warning"; children: ReactNode }) {
  const Icon = tone === "tip" ? Lightbulb : tone === "warning" ? TriangleAlert : Info;
  return (
    <div className="callout">
      <Icon size={18} aria-hidden />
      <div>{children}</div>
    </div>
  );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Table">
      <table>
        <thead>
          <tr>
            {head.map((cell) => (
              <th key={cell} scope="col">
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const Kbd = ({ children }: { children: ReactNode }) => <kbd className="kbd">{children}</kbd>;

function Docs() {
  const active = useActiveSection();

  return (
    <div className="container">
      <header className="page-header">
        <h1>Documentation</h1>
        <p>
          Everything you need to add GlyphX to your app, make it look like
          yours, and get the most out of it.
        </p>
      </header>

      <div className="docs-layout">
        <nav className="docs-sidebar" aria-label="Documentation">
          <h2>On this page</h2>
          <ul>
            {DOC_SECTIONS.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} aria-current={active === section.id ? "true" : undefined}>
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="prose">
          <details className="docs-toc-mobile">
            <summary>On this page</summary>
            <ul>
              {DOC_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    onClick={(e) => {
                      // Close the list once a section is picked.
                      const details = e.currentTarget.closest("details");
                      if (details) details.open = false;
                    }}
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </details>

          <Section id="installation">
            <p>Install the package with your package manager:</p>
            <InstallTabs />
            <p>
              GlyphX works with React 18 and 19. It depends on Radix Dialog,
              Radix Visually Hidden, Zustand and fuzzysort, which your package
              manager shares with the rest of your app.
            </p>
            <p>Then import the stylesheet once, where your app starts:</p>
            <Code code={CSS_IMPORT} title="main.tsx" />
            <Callout>
              <p>
                The stylesheet only styles GlyphX's own elements and only
                defines <code>--glyphx-*</code> variables. It won't change
                anything else on your page.
              </p>
            </Callout>
          </Section>

          <Section id="quick-start">
            <p>
              Render one <code>GlyphX</code> component with a list of commands,
              anywhere in your app:
            </p>
            <Code code={QUICK_START} title="App.tsx" />
            <p>
              Press <Kbd>{MOD}</Kbd> <Kbd>Shift</Kbd> <Kbd>P</Kbd> to open it
              (Firefox keeps this shortcut for itself; see{" "}
              <a href="#shortcuts">Keyboard shortcuts</a>).
              Type to search, use <Kbd>↑</Kbd> <Kbd>↓</Kbd> to choose, press{" "}
              <Kbd>Enter</Kbd> to run a command and <Kbd>Esc</Kbd> to close.
            </p>
            <Callout tone="tip">
              <p>
                Define the commands outside your component, or wrap them in{" "}
                <code>useMemo</code>, so the array stays the same between
                renders. GlyphX re-indexes the list whenever it changes.
              </p>
            </Callout>
          </Section>

          <Section id="commands">
            <p>Each command is a plain object:</p>
            <Table
              head={["Field", "Type", "What it does"]}
              rows={[
                [<code>id</code>, <code>string</code>, "Unique and stable. Keeps the selection on the same command when the list changes."],
                [<code>title</code>, <code>string</code>, "The text people see and search first."],
                [<code>subtitle</code>, <code>string</code>, "Optional second line of detail. Also searched."],
                [<code>keywords</code>, <code>string[]</code>, "Optional extra search words, never shown. Great for synonyms."],
                [<code>shortcut</code>, <code>string</code>, "Optional label on the right, such as “⌘ S”. Display only: GlyphX doesn't bind it."],
                [<code>group</code>, <code>string</code>, "Optional heading to list the command under. Commands without one go under “Other”."],
                [<code>run</code>, <code>{"() => unknown"}</code>, "What the command does. It may return anything, including a promise; GlyphX ignores the result."],
              ]}
            />
          </Section>

          <Section id="groups-and-search">
            <Code
              title="commands.ts"
              code={`{
  id: "settings",
  title: "Open settings",
  subtitle: "Account, notifications and billing",
  keywords: ["preferences", "options", "config"],
  shortcut: "⌘ ,",
  group: "Navigation",
  run: () => router.push("/settings"),
}`}
            />
            <h3>How search works</h3>
            <ul>
              <li>
                Matching is fuzzy and ignores case and accents: “stngs” finds
                “Open settings”.
              </li>
              <li>
                Title, subtitle and keywords are matched separately. For
                equally good matches, the title wins over the subtitle, which
                wins over keywords.
              </li>
              <li>
                Words separated by spaces can match different fields: “settings
                billing” matches the title and the subtitle above.
              </li>
              <li>
                Matched letters are highlighted in the title, or in the
                subtitle when the title doesn't match. Keyword matches aren't
                highlighted, because keywords aren't shown.
              </li>
            </ul>
            <h3>How groups are ordered</h3>
            <p>
              With an empty search, groups appear in the order of their first
              command in your array, and commands keep your order. While
              searching, the group with the best match comes first. Put your
              most important commands first.
            </p>
          </Section>

          <Section id="running-commands">
            <p>
              When someone picks a command, GlyphX closes the palette, returns
              focus to where it was, and then calls <code>run</code>. Because
              the palette is gone by then, a command can freely move focus,
              open a dialog or navigate.
            </p>
            <ul>
              <li>
                <strong>It doesn't wait.</strong> If <code>run</code> returns a
                promise, the palette is already closed. Show progress your own
                way for long tasks.
              </li>
              <li>
                <strong>Errors are contained.</strong> If <code>run</code>{" "}
                throws or its promise rejects, GlyphX logs{" "}
                <code>[glyphx] Command failed: &lt;id&gt;</code> to the console
                and carries on. Catch errors yourself to show a message.
              </li>
            </ul>
            <Code
              title="An async command with feedback"
              code={`{
  id: "export-pdf",
  title: "Export as PDF",
  run: async () => {
    const id = toast.loading("Exporting…"); // any toast library
    try {
      await exportPdf();
      toast.success("Exported", { id });
    } catch {
      toast.error("Export failed", { id });
    }
  },
}`}
            />
            <p>
              Try it on this site: open the palette and run “Run a slow task” or
              “Run a command that fails”.
            </p>
          </Section>

          <Section id="shortcuts">
            <p>
              By default the palette opens with <Kbd>⌘</Kbd> <Kbd>Shift</Kbd>{" "}
              <Kbd>P</Kbd> on macOS and <Kbd>Ctrl</Kbd> <Kbd>Shift</Kbd>{" "}
              <Kbd>P</Kbd> elsewhere. Change it with the <code>shortcut</code>{" "}
              prop. The primary key (<Kbd>⌘</Kbd> on macOS, <Kbd>Ctrl</Kbd>{" "}
              elsewhere) is always part of it.
            </p>
            <Code
              code={`// ⌘/Ctrl + K
<GlyphX commands={commands} shortcut={{ key: "k" }} />

// Several shortcuts: ⌘/Ctrl + Shift + P or ⌘/Ctrl + K
<GlyphX
  commands={commands}
  shortcut={[{ key: "p", shift: true }, { key: "k" }]}
/>

type ShortcutConfig = {
  key: string;     // "k", "p", "j", "/" …
  shift?: boolean; // also require Shift
  alt?: boolean;   // also require Alt / Option
};`}
            />
            <Callout tone="warning">
              <p>
                <strong>Firefox</strong> keeps <Kbd>Ctrl/⌘</Kbd>{" "}
                <Kbd>Shift</Kbd> <Kbd>P</Kbd> for opening a private window and
                never passes it to the page. If your visitors use Firefox, add
                a second shortcut such as <Kbd>Ctrl/⌘</Kbd> <Kbd>K</Kbd>, like
                this website does.
              </p>
            </Callout>
            <p>
              Letters and digits work on every keyboard layout. On Dvorak or
              Colemak, people press the key labelled with the letter. On
              layouts that don't type Latin letters, such as Russian, and with
              Option on macOS, GlyphX uses the key in that letter's position.
            </p>
            <h3>Inside the palette</h3>
            <Table
              head={["Key", "Action"]}
              rows={[
                [<><Kbd>↑</Kbd> <Kbd>↓</Kbd></>, "Move the selection (wraps around)"],
                [<Kbd>Enter</Kbd>, "Run the selected command"],
                [<Kbd>Esc</Kbd>, "Close without running anything"],
                ["Mouse", "Hover to select, click to run"],
              ]}
            />
          </Section>

          <Section id="controlled-mode">
            <p>
              To open the palette from a button, or to know when it opens, pass{" "}
              <code>open</code> and <code>onOpenChange</code>:
            </p>
            <Code
              title="Header.tsx"
              code={`import { useState } from "react";
import { GlyphX } from "glyphx";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header>
      <button onClick={() => setOpen(true)}>Search… ⌘K</button>
      <GlyphX
        commands={commands}
        open={open}
        onOpenChange={setOpen}
        shortcut={{ key: "k" }}
      />
    </header>
  );
}`}
            />
            <p>
              Once you pass <code>open</code>, GlyphX follows it and never opens
              or closes on its own. The shortcut, <Kbd>Esc</Kbd>, clicking
              outside and running a command all call{" "}
              <code>onOpenChange</code> with the state they ask for, and you
              decide. Leave both props out and GlyphX manages itself.
            </p>
          </Section>

          <Section id="theming">
            <h3>Light, dark or system</h3>
            <p>
              GlyphX follows the device's light or dark setting. If your app
              has its own theme switch, pass <code>theme</code>:
            </p>
            <Code
              title="With next-themes"
              code={`"use client";
import { useTheme } from "next-themes";
import { GlyphX } from "glyphx";

export function CommandPalette() {
  const { resolvedTheme } = useTheme();
  return (
    <GlyphX
      commands={commands}
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}`}
            />
            <h3>Colors</h3>
            <p>
              Every color is a CSS variable holding space-separated RGB
              channels. Override them in CSS that loads after{" "}
              <code>glyphx/style.css</code>, with separate light and dark
              values:
            </p>
            <Code
              language="css"
              title="globals.css"
              code={`/* Light */
:root,
[data-glyphx-theme="light"] {
  --glyphx-accent: 147 51 234;    /* matched letters */
  --glyphx-selected: 243 232 255; /* selected row */
}

/* Dark: following the system… */
@media (prefers-color-scheme: dark) {
  :root:not([data-glyphx-theme="light"]) {
    --glyphx-accent: 192 132 252;
    --glyphx-selected: 59 7 100;
  }
}

/* …or with theme="dark" */
[data-glyphx-theme="dark"] {
  --glyphx-accent: 192 132 252;
  --glyphx-selected: 59 7 100;
}`}
            />
            <Table
              head={["Variable", "Used for"]}
              rows={[
                [<code>--glyphx-glass</code>, "Palette background (includes alpha, e.g. 255 255 255 / 0.92)"],
                [<code>--glyphx-fg</code>, "Text"],
                [<code>--glyphx-muted</code>, "Subtitles, group headings, shortcuts, placeholder"],
                [<code>--glyphx-border</code>, "Palette border"],
                [<code>--glyphx-selected</code>, "Selected row background"],
                [<code>--glyphx-accent</code>, "Matched letters"],
              ]}
            />
            <p>
              Try it here: open the palette and run an “Accent color” command.
              This site recolors GlyphX the same way, with a CSS variable.
            </p>
            <h3>Frosted glass</h3>
            <p>
              The palette's background is 92% opaque. For a frosted-glass look,
              like this website's, blur what's behind it:
            </p>
            <Code
              language="css"
              code={`.glyphx-content {
  backdrop-filter: blur(20px) saturate(160%);
}`}
            />
            <h3>Stacking</h3>
            <p>
              The palette and its backdrop use <code>z-index: 50</code>, which
              keeps them above most sticky headers. If something still covers
              them, raise it:
            </p>
            <Code
              language="css"
              code={`.glyphx-overlay,
.glyphx-content {
  z-index: 1000;
}`}
            />
          </Section>

          <Section id="nextjs">
            <p>
              GlyphX is marked <code>"use client"</code>, so it works in the App
              Router. Commands contain functions, though, and Next.js doesn't
              let a Server Component pass functions to a client component. So
              define your commands in a small client component, which also
              lets them use the router:
            </p>
            <Code
              title="app/command-palette.tsx"
              code={`"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GlyphX, type Command } from "glyphx";

export function CommandPalette() {
  const router = useRouter();

  const commands = useMemo<Command[]>(
    () => [
      { id: "home", title: "Home", group: "Pages", run: () => router.push("/") },
      { id: "blog", title: "Blog", group: "Pages", run: () => router.push("/blog") },
    ],
    [router]
  );

  return <GlyphX commands={commands} shortcut={{ key: "k" }} />;
}`}
            />
            <p>Then render it once from your root layout, which stays a Server Component:</p>
            <Code
              title="app/layout.tsx"
              code={`import "glyphx/style.css";
import { CommandPalette } from "./command-palette";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}`}
            />
          </Section>

          <Section id="script-tag">
            <p>
              For a page without a build step, load React 18 and GlyphX from a
              CDN. GlyphX then appears as the <code>GlyphX</code> global.
            </p>
            <Code
              language="html"
              title="index.html"
              code={`<link rel="stylesheet" href="https://unpkg.com/glyphx@0.3/dist/index.css" />
<div id="palette"></div>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/glyphx@0.3/dist/index.umd.js"></script>
<script>
  ReactDOM.createRoot(document.getElementById("palette")).render(
    React.createElement(GlyphX.GlyphX, {
      commands: [{ id: "hello", title: "Say hello", run: () => alert("Hello") }],
    })
  );
</script>`}
            />
            <p className="muted">
              React 19 doesn't publish these script-tag builds, so this needs
              React 18.
            </p>
          </Section>

          <Section id="typescript">
            <p>The package includes types for both <code>import</code> and <code>require</code>.</p>
            <Code
              code={`import type {
  Command,        // one command
  GlyphXProps,    // the component's props
  GlyphXTheme,    // "system" | "light" | "dark"
  ShortcutConfig, // one keyboard shortcut
} from "glyphx";

// Build commands from your own data, fully typed:
const toCommand = (page: { path: string; name: string }): Command => ({
  id: page.path,
  title: page.name,
  group: "Pages",
  run: () => navigate(page.path),
});`}
            />
          </Section>

          <Section id="accessibility">
            <p>GlyphX handles the accessibility details for you:</p>
            <ul>
              <li>It opens as a dialog with a name and description for screen readers.</li>
              <li>Focus moves into the search field, stays inside while open, and returns to where it was when the palette closes.</li>
              <li>The search field is a combobox linked to a listbox of options, so screen readers announce the selected command as you move.</li>
              <li>Each group is announced with its heading, and subtitles and shortcut labels are read as descriptions.</li>
              <li>“No matching commands” is announced when a search finds nothing.</li>
              <li>Animations are skipped when the device asks for reduced motion.</li>
            </ul>
            <p>
              Your part: write titles that make sense on their own (“Open
              settings”, not “Settings →”), and use subtitles for context.
            </p>
          </Section>

          <Section id="testing">
            <p>
              GlyphX uses standard roles, so Testing Library queries work as
              you'd expect. Three things to know: commands run just after the
              palette closes (use <code>waitFor</code>); jsdom lacks{" "}
              <code>scrollIntoView</code>, so stub it; and GlyphX keeps its
              state in one shared store, so close the palette after each test
              or the next test starts with it open.
            </p>
            <Code
              title="palette.test.tsx"
              code={`import { afterEach, expect, test, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { GlyphX } from "glyphx";

Element.prototype.scrollIntoView = vi.fn(); // jsdom doesn't have it

// GlyphX's state is shared, so close the palette after each test.
afterEach(() => {
  const search = screen.queryByRole("combobox");
  if (search) fireEvent.keyDown(search, { key: "Escape" });
});

test("runs a command from the palette", async () => {
  const run = vi.fn();
  render(<GlyphX commands={[{ id: "save", title: "Save file", run }]} />);

  // jsdom isn't macOS, so the shortcut uses Ctrl
  fireEvent.keyDown(window, { key: "p", ctrlKey: true, shiftKey: true });

  const search = screen.getByRole("combobox");
  fireEvent.change(search, { target: { value: "save" } });
  expect(screen.getByRole("option", { name: "Save file" })).toBeVisible();

  fireEvent.keyDown(search, { key: "Enter" });
  await waitFor(() => expect(run).toHaveBeenCalledOnce());
});`}
            />
          </Section>

          <Section id="tips">
            <ol className="tips">
              <li>
                <strong>Keep commands stable.</strong> Define the array outside
                your component or in <code>useMemo</code>. If it does change
                while the palette is open, the search and selection are kept.
              </li>
              <li>
                <strong>Use keywords for the words people actually type.</strong>{" "}
                Synonyms, abbreviations and old names: “prefs”, “config” and
                “options” for Settings.
              </li>
              <li>
                <strong>Generate commands from your data.</strong> Routes,
                projects, recent files and team members all make great commands.
              </li>
              <li>
                <strong>Make commands depend on context.</strong> Add or remove
                commands for the current page, the user's role or a feature
                flag. The palette updates live.
              </li>
              <li>
                <strong>Order groups on purpose.</strong> With an empty search,
                groups follow the order of their first command, so lead with
                what people need most.
              </li>
              <li>
                <strong>Show the shortcuts your app already has.</strong> The{" "}
                <code>shortcut</code> label teaches people faster ways to do
                things, even though GlyphX doesn't bind it.
              </li>
              <li>
                <strong>Give feedback for slow commands.</strong> The palette
                closes immediately, so show a toast or spinner while the work
                runs.
              </li>
              <li>
                <strong>Move focus freely.</strong> A command can call{" "}
                <code>.focus()</code> on any element; it runs after the palette
                has given focus back.
              </li>
              <li>
                <strong>Add <Kbd>Ctrl/⌘</Kbd> <Kbd>K</Kbd> for Firefox users</strong>{" "}
                with <code>{`shortcut={[{ key: "p", shift: true }, { key: "k" }]}`}</code>.
              </li>
              <li>
                <strong>Put a search button in your header.</strong> Not
                everyone knows the shortcut, and phones don't have one. Use
                controlled mode to open the palette from the button.
              </li>
              <li>
                <strong>Match your brand.</strong> Override{" "}
                <code>--glyphx-accent</code> and <code>--glyphx-selected</code>{" "}
                with your colors.
              </li>
              <li>
                <strong>Use one palette for the whole app.</strong> Render GlyphX
                once in your root layout and give it every command; it's
                designed to be the only one on the page.
              </li>
            </ol>
          </Section>

          <Section id="faq">
            <div className="faq">
              <details>
                <summary>The shortcut doesn't work in Firefox.</summary>
                <div>
                  <p>
                    Firefox reserves <Kbd>Ctrl/⌘</Kbd> <Kbd>Shift</Kbd>{" "}
                    <Kbd>P</Kbd>. Add <Kbd>Ctrl/⌘</Kbd> <Kbd>K</Kbd> as a
                    second shortcut (see <a href="#shortcuts">Keyboard shortcuts</a>).
                  </p>
                </div>
              </details>
              <details>
                <summary>The palette appears behind my header.</summary>
                <div>
                  <p>
                    Your header has a higher <code>z-index</code> than 50.
                    Raise GlyphX's (see <a href="#theming">Themes and colors</a>).
                  </p>
                </div>
              </details>
              <details>
                <summary>Next.js says functions can't be passed to client components.</summary>
                <div>
                  <p>
                    Define your commands inside a client component instead of
                    a Server Component (see <a href="#nextjs">Next.js</a>).
                  </p>
                </div>
              </details>
              <details>
                <summary>Can I have two palettes on one page?</summary>
                <div>
                  <p>
                    No. GlyphX keeps its state in one shared store, so two
                    instances would share it. Render one and give it all your
                    commands.
                  </p>
                </div>
              </details>
              <details>
                <summary>How do I open it from my own button?</summary>
                <div>
                  <p>
                    Pass <code>open</code> and <code>onOpenChange</code> (see{" "}
                    <a href="#controlled-mode">Opening it from your own UI</a>).
                  </p>
                </div>
              </details>
              <details>
                <summary>Importing the stylesheet changed the rest of my page.</summary>
                <div>
                  <p>
                    That was true up to version 0.2.2, which shipped a CSS reset.
                    Since 0.3.0 the stylesheet only styles the palette. Update
                    to the latest version.
                  </p>
                </div>
              </details>
              <details>
                <summary>TypeScript can't find GlyphX's types.</summary>
                <div>
                  <p>
                    With <code>"moduleResolution": "node16"</code> or{" "}
                    <code>"nodenext"</code>, versions before 0.3.0 had broken
                    type declarations. Update to the latest version.
                  </p>
                </div>
              </details>
              <details>
                <summary>Does GlyphX collect any data?</summary>
                <div>
                  <p>
                    No. It makes no network requests and stores nothing. Your
                    commands run your own code inside your app. See the{" "}
                    <a href={PAGES.privacy}>privacy page</a>.
                  </p>
                </div>
              </details>
            </div>
          </Section>

          <Section id="api">
            <h3>
              <code>{"<GlyphX />"}</code> props
            </h3>
            <Table
              head={["Prop", "Type", "Default", "Description"]}
              rows={[
                [<code>commands</code>, <code>Command[]</code>, "required", "The commands to show and search."],
                [<code>open</code>, <code>boolean</code>, "—", "Makes the palette controlled: it is open exactly when this is true."],
                [<code>onOpenChange</code>, <code>{"(open: boolean) => void"}</code>, "—", "Called with the requested state when the shortcut, Esc, an outside click or picking a command would open or close the palette. Not called when you change open yourself."],
                [<code>shortcut</code>, <code>{"ShortcutConfig | ShortcutConfig[]"}</code>, <code>{`{ key: "p", shift: true }`}</code>, "The key combinations that open the palette."],
                [<code>theme</code>, <code>{`"system" | "light" | "dark"`}</code>, <code>"system"</code>, "The color scheme."],
              ]}
            />
            <h3>Types</h3>
            <Code
              code={`type Command = {
  id: string;
  title: string;
  subtitle?: string;
  keywords?: string[];
  shortcut?: string;
  group?: string;
  run: () => unknown;
};

type ShortcutConfig = {
  key: string;
  shift?: boolean;
  alt?: boolean;
};

type GlyphXTheme = "system" | "light" | "dark";`}
            />
            <h3>Package entry points</h3>
            <Table
              head={["Entry point", "Contents"]}
              rows={[
                [<code>glyphx</code>, "The GlyphX component and its types (ESM and CommonJS)"],
                [<code>glyphx/style.css</code>, "The stylesheet"],
                [<code>https://unpkg.com/glyphx@0.3/dist/index.umd.js</code>, "The script-tag build (load it from a CDN; it can't be imported)"],
              ]}
            />
          </Section>
        </div>
      </div>
    </div>
  );
}

render(
  <Layout page="docs">
    <Docs />
  </Layout>
);
