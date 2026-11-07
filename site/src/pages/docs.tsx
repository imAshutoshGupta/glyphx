import { useEffect, useState, type ReactNode } from "react";
import { Info, Lightbulb, TriangleAlert } from "lucide-react";
import { render } from "../render";
import { Layout } from "../components/Layout";
import { Code, InstallTabs } from "../components/CodeBlock";
import { DOC_GROUPS, DOC_SECTIONS, type DocSectionId } from "../docsSections";
import { COMMERCIAL_URL, LICENSE_URL, PAGES, VERSION } from "../links";
import { useMod } from "../platform";
import { CSS_IMPORT, QUICK_START } from "../snippets";

// The script-tag examples load the current release line, e.g. "0.5" for 0.5.0,
// so they never point at an old version.
const CDN_VERSION = VERSION.split(".").slice(0, 2).join(".");

const titleOf = (id: DocSectionId) => DOC_SECTIONS.find((s) => s.id === id)!.title;

// Every heading the sidebar links to, in page order: each section, then its
// subsections. `section` is the section the heading belongs to.
const HEADINGS = DOC_SECTIONS.flatMap((section) => [
  { id: section.id as string, section: section.id as string },
  ...("subsections" in section ? section.subsections : []).map((sub) => ({
    id: sub.id as string,
    section: section.id as string,
  })),
]);

// The heading being read: the last one that has scrolled past a line just
// below the header. Checked at most once per frame.
function useActiveHeading() {
  const [active, setActive] = useState(HEADINGS[0]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = HEADINGS[0];
      for (const heading of HEADINGS) {
        const element = document.getElementById(heading.id);
        if (element && element.getBoundingClientRect().top <= 140) current = heading;
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

// A subsection heading. Its id must match one in docsSections.ts.
function Sub({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id}>
      {children}
      <a className="heading-anchor" href={`#${id}`} aria-hidden tabIndex={-1}>
        #
      </a>
    </h3>
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

// A type in a table, kept on one line.
const Type = ({ children }: { children: ReactNode }) => <code className="nowrap">{children}</code>;

function Docs() {
  const active = useActiveHeading();
  const mod = useMod();

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
          {DOC_GROUPS.map((group) => (
            <div key={group.title} className="docs-sidebar-group">
              <h2>{group.title}</h2>
              <ul>
                {group.sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      aria-current={active.id === section.id ? "true" : undefined}
                      // Still marked while one of its subsections is the one being read.
                      className={active.section === section.id ? "is-open" : undefined}
                    >
                      {section.title}
                    </a>
                    {/* The section being read shows its subsections. */}
                    {section.subsections && active.section === section.id && (
                      <ul className="docs-sidebar-subs">
                        {section.subsections.map((sub) => (
                          <li key={sub.id}>
                            <a
                              href={`#${sub.id}`}
                              aria-current={active.id === sub.id ? "true" : undefined}
                            >
                              {sub.title}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="prose">
          <details className="docs-toc-mobile">
            <summary>On this page</summary>
            {DOC_GROUPS.map((group) => (
              <div key={group.title}>
                <h2>{group.title}</h2>
                <ul>
                  {group.sections.map((section) => (
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
              </div>
            ))}
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
              Press <Kbd>{mod}</Kbd> <Kbd>K</Kbd> to open it. Type to search,
              use <Kbd>↑</Kbd> <Kbd>↓</Kbd> to choose, press{" "}
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
                [<code>id</code>, <Type>string</Type>, "Unique and stable. Keeps the selection on the same command when the list changes."],
                [<code>title</code>, <Type>string</Type>, "The text people see and search first."],
                [<code>subtitle</code>, <Type>string</Type>, "Optional second line of detail. Also searched."],
                [<code>keywords</code>, <Type>string[]</Type>, "Optional extra search words, never shown. Great for synonyms."],
                [<code>shortcut</code>, <Type>string</Type>, "Optional label on the right, such as “⌘ S”. Display only: GlyphX doesn't bind it."],
                [<code>group</code>, <Type>string</Type>, "Optional heading to list the command under. Commands without one go under “Other”."],
                [<code>run</code>, <Type>{"() => unknown"}</Type>, "What the command does. It may return anything, including a promise; GlyphX ignores the result."],
              ]}
            />
          </Section>

          <Section id="groups-and-search">
            <p>Here's a command that uses every field:</p>
            <Code
              title="commands.ts"
              code={`{
  id: "settings",
  title: "Open settings",
  subtitle: "Account and billing",
  keywords: ["preferences", "config"],
  shortcut: "⌘ ,",
  group: "Navigation",
  run: () => router.push("/settings"),
}`}
            />
            <Sub id="how-search-works">How search works</Sub>
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
            <Sub id="how-groups-are-ordered">How groups are ordered</Sub>
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
    // Any toast library works
    const id = toast.loading("Exporting…");
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
            <p>By default, either of these opens the palette:</p>
            <Table
              head={["System", "Shortcuts"]}
              rows={[
                ["macOS", <><Kbd>⌘</Kbd> <Kbd>K</Kbd> or <Kbd>⌘</Kbd> <Kbd>Shift</Kbd> <Kbd>P</Kbd></>],
                ["Windows and Linux", <><Kbd>Ctrl</Kbd> <Kbd>K</Kbd> or <Kbd>Ctrl</Kbd> <Kbd>Shift</Kbd> <Kbd>P</Kbd></>],
              ]}
            />
            <p>
              Pressing the shortcut while the palette is open does nothing.
              Close it with <Kbd>Esc</Kbd> or a click outside.
            </p>

            <Sub id="change-the-shortcut">Change the shortcut</Sub>
            <p>
              Pass the <code>shortcut</code> prop. It replaces both defaults.
              You choose the key, and optionally <code>shift</code> or{" "}
              <code>alt</code>; <Kbd>⌘</Kbd> on macOS or <Kbd>Ctrl</Kbd>{" "}
              elsewhere is always added.
            </p>
            <Code
              code={`// Only ⌘/Ctrl + K
<GlyphX
  commands={commands}
  shortcut={{ key: "k" }}
/>

// ⌘/Ctrl + K or ⌘/Ctrl + /
<GlyphX
  commands={commands}
  shortcut={[{ key: "k" }, { key: "/" }]}
/>

// ⌘/Ctrl + Shift + P
<GlyphX
  commands={commands}
  shortcut={{ key: "p", shift: true }}
/>`}
            />
            <p>
              GlyphX handles its shortcuts before the rest of the page. If a
              text editor in your app uses <Kbd>{mod}</Kbd> <Kbd>K</Kbd> to
              insert a link, use the last example instead.
            </p>
            <Callout tone="warning">
              <p>
                <strong>Some shortcuts never reach the page.</strong> Browsers
                keep these for themselves:
              </p>
              <ul>
                <li>
                  <Kbd>{mod}</Kbd> <Kbd>N</Kbd>, <Kbd>T</Kbd> and <Kbd>W</Kbd>{" "}
                  (new window, new tab, close tab) in every browser
                </li>
                <li>
                  <Kbd>{mod}</Kbd> <Kbd>Shift</Kbd> <Kbd>P</Kbd> in Firefox
                  (private window), so Firefox users use <Kbd>{mod}</Kbd>{" "}
                  <Kbd>K</Kbd>
                </li>
              </ul>
              <p>
                Also avoid ones people rely on, such as copy, paste, save, find
                and print, and try your shortcut in each browser.
              </p>
            </Callout>

            <Sub id="inside-the-palette">Inside the palette</Sub>
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
      <button onClick={() => setOpen(true)}>
        Search… ⌘K
      </button>
      <GlyphX
        commands={commands}
        open={open}
        onOpenChange={setOpen}
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
            <Sub id="light-dark-system">Light, dark or system</Sub>
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
  const dark = resolvedTheme === "dark";

  return (
    <GlyphX
      commands={commands}
      theme={dark ? "dark" : "light"}
    />
  );
}`}
            />

            <Sub id="colors">Colors</Sub>
            <p>Every color GlyphX uses is a CSS variable:</p>
            <Table
              head={["Variable", "Used for"]}
              rows={[
                [<code>--glyphx-accent</code>, "Matched letters"],
                [<code>--glyphx-selected</code>, "Selected row background"],
                [<code>--glyphx-fg</code>, "Text"],
                [<code>--glyphx-muted</code>, "Subtitles, group headings, shortcuts, placeholder"],
                [<code>--glyphx-border</code>, "Palette border"],
                [<code>--glyphx-glass</code>, "Palette background, with see-through amount (e.g. 255 255 255 / 0.92)"],
              ]}
            />
            <p>
              Each value is three numbers from 0 to 255, for red, green and
              blue: <code>139 92 246</code> is purple. To change a color, set
              it in your own CSS, loaded after <code>glyphx/style.css</code>.
              This changes the accent in both light and dark:
            </p>
            <Code
              language="css"
              title="globals.css"
              code={`:root,
[data-glyphx-theme] {
  --glyphx-accent: 139 92 246;
}`}
            />
            <p>
              Try it here: open the palette and run an “Accent color” command.
              This site recolors GlyphX the same way.
            </p>

            <Sub id="dark-mode-colors">Different colors in dark mode</Sub>
            <p>
              To use one color in light mode and another in dark, set each
              separately. Dark mode needs two rules: one for when GlyphX follows
              the device setting, and one for <code>theme="dark"</code>.
            </p>
            <Code
              language="css"
              title="globals.css"
              code={`/* Light */
:root,
[data-glyphx-theme="light"] {
  --glyphx-accent: 147 51 234;
  --glyphx-selected: 243 232 255;
}

/* Dark, following the device */
@media (prefers-color-scheme: dark) {
  :root:not([data-glyphx-theme="light"]) {
    --glyphx-accent: 192 132 252;
    --glyphx-selected: 59 7 100;
  }
}

/* Dark, with theme="dark" */
[data-glyphx-theme="dark"] {
  --glyphx-accent: 192 132 252;
  --glyphx-selected: 59 7 100;
}`}
            />

            <Sub id="styling-parts">Styling individual parts</Sub>
            <p>
              For changes the color variables don't cover, target these class
              names in your own CSS, loaded after <code>glyphx/style.css</code>:
            </p>
            <Table
              head={["Class", "Element"]}
              rows={[
                [<code>.glyphx-overlay</code>, "The dimmed backdrop behind the palette"],
                [<code>.glyphx-content</code>, "The palette box itself"],
                [<code>.glyphx-hint</code>, "The “Esc to close” hint"],
                [<code>.glyphx-input</code>, "The search field"],
                [<code>.glyphx-list</code>, "The scrolling list of results"],
                [<code>.glyphx-group-heading</code>, "A group's heading"],
                [<code>.glyphx-item</code>, "One command row (aria-selected=\"true\" when selected)"],
                [<code>.glyphx-item-subtitle</code>, "A command's subtitle"],
                [<code>.glyphx-item-shortcut</code>, "A command's shortcut label"],
                [<code>.glyphx-highlight</code>, "The matched letters"],
                [<code>.glyphx-empty</code>, "The “No matching commands” message"],
              ]}
            />
            <Code
              language="css"
              title="Example"
              code={`.glyphx-content {
  border-radius: 8px;
}
.glyphx-input {
  font-size: 18px;
}`}
            />

            <Sub id="frosted-glass">Frosted glass</Sub>
            <p>
              The palette's background is slightly see-through (92% opaque).
              For a frosted-glass look, like this website's, blur what's behind
              it:
            </p>
            <Code
              language="css"
              code={`.glyphx-content {
  backdrop-filter: blur(20px);
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
              title="app/palette.tsx"
              code={`"use client";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GlyphX, type Command } from "glyphx";

export function CommandPalette() {
  const router = useRouter();

  const commands = useMemo<Command[]>(
    () => [
      {
        id: "home",
        title: "Home",
        group: "Pages",
        run: () => router.push("/"),
      },
      {
        id: "blog",
        title: "Blog",
        group: "Pages",
        run: () => router.push("/blog"),
      },
    ],
    [router]
  );

  return <GlyphX commands={commands} />;
}`}
            />
            <p>Then render it once from your root layout, which stays a Server Component:</p>
            <Code
              title="app/layout.tsx"
              code={`import "glyphx/style.css";
import { CommandPalette } from "./palette";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
              code={`<link
  rel="stylesheet"
  href="https://unpkg.com/glyphx@${CDN_VERSION}/dist/index.css"
/>
<div id="palette"></div>

<script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
<script src="https://unpkg.com/glyphx@${CDN_VERSION}/dist/index.umd.js"></script>
<script>
  const root = document.getElementById("palette");
  ReactDOM.createRoot(root).render(
    React.createElement(GlyphX.GlyphX, {
      commands: [
        {
          id: "hello",
          title: "Say hello",
          run: () => alert("Hello"),
        },
      ],
    })
  );
</script>`}
            />
            <p className="muted">
              React 19 doesn't publish these script-tag builds, so this needs
              React 18.
            </p>
          </Section>

          <Section id="testing">
            <p>
              GlyphX uses standard roles, so Testing Library queries work as
              you'd expect. Four things to know:
            </p>
            <ul>
              <li>
                Commands run just after the palette closes, so use{" "}
                <code>waitFor</code>.
              </li>
              <li>
                jsdom lacks <code>scrollIntoView</code>, so stub it.
              </li>
              <li>
                GlyphX keeps its state in one shared store, so close the
                palette after each test, or the next test starts with it open.
              </li>
              <li>
                Unless Vitest's <code>globals</code> option is on, Testing
                Library doesn't remove rendered components between tests, so
                call <code>cleanup</code> yourself. Otherwise palettes from
                earlier tests stay on the page, still listening for the
                shortcut, which can make later tests fail in confusing ways.
              </li>
            </ul>
            <Code
              title="palette.test.tsx"
              code={`import {
  afterEach, expect, test, vi,
} from "vitest";
import "@testing-library/jest-dom/vitest";
import {
  cleanup, render, screen, fireEvent, waitFor,
} from "@testing-library/react";
import { GlyphX } from "glyphx";

// jsdom doesn't have scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// GlyphX's state is shared: close the
// palette after each test, then clean up.
afterEach(() => {
  const search =
    screen.queryByRole("combobox");
  if (search) {
    fireEvent.keyDown(search, {
      key: "Escape",
    });
  }
  cleanup();
});

test("runs a command", async () => {
  const run = vi.fn();
  render(
    <GlyphX
      commands={[
        { id: "save", title: "Save", run },
      ]}
    />
  );

  // jsdom isn't a Mac: the shortcut is Ctrl
  fireEvent.keyDown(window, {
    key: "k",
    ctrlKey: true,
  });

  const search = screen.getByRole("combobox");
  fireEvent.change(search, {
    target: { value: "save" },
  });
  const option = screen.getByRole("option", {
    name: "Save",
  });
  expect(option).toBeVisible();

  fireEvent.keyDown(search, { key: "Enter" });
  await waitFor(() =>
    expect(run).toHaveBeenCalledOnce()
  );
});`}
            />
          </Section>

          <Section id="api">
            <Sub id="api-props">
              <code>{"<GlyphX />"}</code> props
            </Sub>
            <Table
              head={["Prop", "Type", "Default", "Description"]}
              rows={[
                [<code>commands</code>, <code>Command[]</code>, "required", "The commands to show and search."],
                [<code>open</code>, <code>boolean</code>, "—", "Makes the palette controlled: it is open exactly when this is true."],
                [<code>onOpenChange</code>, <code>{"(open: boolean) => void"}</code>, "—", "Called with the requested state when the shortcut, Esc, an outside click or picking a command would open or close the palette. Not called when you change open yourself."],
                [<code>shortcut</code>, <code>{"ShortcutConfig | ShortcutConfig[]"}</code>, <code>{`[{ key: "k" }, { key: "p", shift: true }]`}</code>, "The key combinations that open the palette. Passing it replaces the defaults."],
                [<code>theme</code>, <code>{`"system" | "light" | "dark"`}</code>, <code>"system"</code>, "The color scheme."],
              ]}
            />
            <Sub id="api-types">Types</Sub>
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
  key: string;     // "k", "p", "/" …
  shift?: boolean; // also require Shift
  alt?: boolean;   // also require Alt
};

type GlyphXTheme = "system" | "light" | "dark";`}
            />
            <Sub id="api-entry-points">Package entry points</Sub>
            <Table
              head={["Entry point", "Contents"]}
              rows={[
                [<code>glyphx</code>, "The GlyphX component and its types (ESM and CommonJS)"],
                [<code>glyphx/style.css</code>, "The stylesheet"],
                [<code>{`https://unpkg.com/glyphx@${CDN_VERSION}/dist/index.umd.js`}</code>, "The script-tag build (load it from a CDN; it can't be imported)"],
              ]}
            />
          </Section>

          <Section id="typescript">
            <p>The package includes types for both <code>import</code> and <code>require</code>.</p>
            <Code
              code={`import type {
  Command,        // one command
  GlyphXProps,    // the component's props
  GlyphXTheme,    // "system", "light", "dark"
  ShortcutConfig, // one keyboard shortcut
} from "glyphx";

// Build commands from your own data:
type Page = { path: string; name: string };

const toCommand = (page: Page): Command => ({
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

          <Section id="tips">
            <ol className="tips">
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
                flag. The palette updates live, and keeps the search and
                selection if it's open.
              </li>
              <li>
                <strong>Show the shortcuts your app already has.</strong> The{" "}
                <code>shortcut</code> label teaches people faster ways to do
                things, even though GlyphX doesn't bind it.
              </li>
              <li>
                <strong>Put a search button in your header.</strong> Not
                everyone knows the shortcut, and phones don't have one. Use{" "}
                <a href="#controlled-mode">controlled mode</a> to open the
                palette from the button.
              </li>
              <li>
                <strong>Match your brand.</strong> Override{" "}
                <code>--glyphx-accent</code> and <code>--glyphx-selected</code>{" "}
                with your <a href="#colors">colors</a>.
              </li>
            </ol>
          </Section>

          <Section id="faq">
            <div className="faq">
              <details>
                <summary>The shortcut doesn't work in Firefox.</summary>
                <div>
                  <p>
                    Firefox keeps <Kbd>Ctrl/⌘</Kbd> <Kbd>Shift</Kbd>{" "}
                    <Kbd>P</Kbd> for a private window and never passes it to
                    the page. Use <Kbd>Ctrl/⌘</Kbd> <Kbd>K</Kbd>, which GlyphX
                    also listens for by default. If you set your own{" "}
                    <code>shortcut</code>, include one Firefox doesn't keep
                    (see <a href="#shortcuts">Keyboard shortcuts</a>).
                  </p>
                </div>
              </details>
              <details>
                <summary>Does the shortcut work with non-English keyboards?</summary>
                <div>
                  <p>
                    Yes. Letters and digits work on every keyboard layout. On
                    Dvorak or Colemak, people press the key labelled with the
                    letter. On layouts that don't type Latin letters, such as
                    Russian, and with Option on macOS, GlyphX uses the key in
                    that letter's position.
                  </p>
                </div>
              </details>
              <details>
                <summary>The palette appears behind my header.</summary>
                <div>
                  <p>
                    The palette and its backdrop use <code>z-index: 50</code>,
                    which keeps them above most sticky headers. If your header
                    is higher, raise GlyphX's:
                  </p>
                  <Code
                    language="css"
                    code={`.glyphx-overlay,
.glyphx-content {
  z-index: 1000;
}`}
                  />
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
                    instances would share it. Render one, in your root layout,
                    and give it all your commands.
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
                <summary>Can I translate or change the palette's built-in text?</summary>
                <div>
                  <p>
                    Not yet. The placeholder (“Type a command…”), the empty
                    message (“No matching commands”) and the “Esc to close”
                    hint are always in English. Your command titles, subtitles
                    and group names can be in any language, and search works
                    with them.
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
                <summary>Can I use GlyphX at my company?</summary>
                <div>
                  <p>
                    GlyphX is under the{" "}
                    <a href={LICENSE_URL}>PolyForm Noncommercial License</a>:
                    it's free for personal and other noncommercial use.
                    Commercial use, including inside a company, needs
                    permission. <a href={COMMERCIAL_URL}>Email the developer</a>{" "}
                    to ask.
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
