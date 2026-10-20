import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import type { Command, GlyphXTheme, ShortcutConfig } from "glyphx";
import { render } from "../render";
import { Layout } from "../components/Layout";
import { Code } from "../components/CodeBlock";
import { useSite } from "../context";
import { ACCENTS, DEFAULT_ACCENT, applyAccent, themedVariableCss, type Accent } from "../accent";
import { useMod } from "../platform";

// ─── Options ─────────────────────────────────────────────────────────────────

type CommandSet = "starter" | "kitchen-sink" | "large" | "flat";

const COMMAND_SETS: { id: CommandSet; label: string; description: string }[] = [
  { id: "starter", label: "Starter", description: "8 everyday commands in 3 groups" },
  { id: "kitchen-sink", label: "Kitchen sink", description: "Slow tasks, errors, focus and new tabs" },
  { id: "large", label: "Large app", description: "1,000 commands in 20 groups" },
  { id: "flat", label: "Flat list", description: "No groups at all" },
];

// `keys` follow the platform's primary key (⌘ or Ctrl) in the labels.
const SHORTCUT_OPTIONS: { id: string; keys: string; config: ShortcutConfig }[] = [
  { id: "shift-p", keys: "Shift P", config: { key: "p", shift: true } },
  { id: "k", keys: "K", config: { key: "k" } },
  { id: "j", keys: "J", config: { key: "j" } },
  { id: "slash", keys: "/", config: { key: "/" } },
];

const THEMES: GlyphXTheme[] = ["system", "light", "dark"];

type Display = { subtitles: boolean; keywords: boolean; shortcuts: boolean };

type Log = (text: string) => void;

// ─── Command sets ────────────────────────────────────────────────────────────

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function starterCommands(log: Log, mod: string, grouped = true): Command[] {
  const commands: Command[] = [
    { id: "home", title: "Go to Home", subtitle: "The start page", keywords: ["start", "dashboard"], shortcut: `${mod} H`, group: "Navigation", run: () => log("Navigated home (pretend)") },
    { id: "settings", title: "Open Settings", subtitle: "Account, notifications and billing", keywords: ["preferences", "options", "config"], shortcut: `${mod} ,`, group: "Navigation", run: () => log("Opened settings (pretend)") },
    { id: "profile", title: "View Profile", subtitle: "Your public page", keywords: ["account", "me", "user"], group: "Navigation", run: () => log("Opened profile (pretend)") },
    { id: "new-doc", title: "New Document", subtitle: "Start from a blank page", keywords: ["create", "add", "file"], shortcut: `${mod} N`, group: "Actions", run: () => log("Created a document (pretend)") },
    { id: "save", title: "Save", subtitle: "Save your changes", keywords: ["store", "write"], shortcut: `${mod} S`, group: "Actions", run: () => log("Saved (pretend)") },
    { id: "share", title: "Copy Share Link", subtitle: "Anyone with the link can view", keywords: ["url", "invite", "clipboard"], group: "Actions", run: () => log("Copied a share link (pretend)") },
    { id: "shortcuts", title: "Keyboard Shortcuts", subtitle: "See every shortcut", keywords: ["keys", "hotkeys", "help"], shortcut: "?", group: "Help", run: () => log("Opened the shortcut list (pretend)") },
    { id: "support", title: "Contact Support", subtitle: "We usually reply within a day", keywords: ["help", "email", "chat"], group: "Help", run: () => log("Opened support (pretend)") },
  ];
  return grouped ? commands : commands.map((command) => ({ ...command, group: undefined }));
}

function kitchenSinkCommands(log: Log, focusTarget: RefObject<HTMLInputElement | null>): Command[] {
  return [
    { id: "slow-2", title: "Slow task (2 seconds)", subtitle: "Returns a promise; the palette doesn't wait", keywords: ["async", "wait"], group: "Async", run: async () => { await pause(2000); log("Slow task finished after 2 seconds"); } },
    { id: "slow-5", title: "Very slow task (5 seconds)", subtitle: "Open the palette again while it runs", keywords: ["async", "wait", "long"], group: "Async", run: async () => { await pause(5000); log("Very slow task finished after 5 seconds"); } },
    { id: "throws", title: "Command that throws", subtitle: "GlyphX catches it and logs it to the console", keywords: ["error", "exception"], group: "Errors", run: () => { throw new Error("Thrown on purpose"); } },
    { id: "rejects", title: "Command that rejects", subtitle: "A failed promise, caught the same way", keywords: ["error", "promise", "async"], group: "Errors", run: async () => { await pause(300); throw new Error("Rejected on purpose"); } },
    { id: "focus", title: "Focus the text field", subtitle: "Commands run after the palette closes, so this works", keywords: ["input", "cursor", "type"], group: "Focus", run: () => focusTarget.current?.focus() },
    { id: "new-tab", title: "Open example.com in a new tab", subtitle: "Commands can do anything a click can", keywords: ["link", "browser", "window"], group: "Browser", run: () => { window.open("https://example.com", "_blank", "noopener,noreferrer"); } },
    { id: "copy-number", title: "Copy a random number", subtitle: "Writes to your clipboard", keywords: ["clipboard", "random"], group: "Browser", run: async () => { const n = Math.floor(Math.random() * 1_000_000); await navigator.clipboard.writeText(String(n)); log(`Copied ${n} to the clipboard`); } },
    { id: "alert", title: "Show a browser alert", subtitle: "A blocking dialog, after the palette has closed", keywords: ["dialog", "popup", "message"], group: "Browser", run: () => window.alert("Hello from a GlyphX command!") },
  ];
}

const AREAS = [
  "Project", "Issue", "Pull request", "User", "Team", "Invoice", "Report", "Dashboard", "Alert", "Deployment",
  "Domain", "Database", "Bucket", "Log stream", "Setting", "Integration", "Webhook", "API key", "Document", "Workspace",
];
const VERBS = ["Open", "Create", "Rename", "Duplicate", "Archive"];

function largeCommands(log: Log): Command[] {
  const commands: Command[] = [];
  for (const area of AREAS) {
    const group = `${area}s`;
    for (let i = 1; i <= 10; i++) {
      for (const verb of VERBS) {
        const title = `${verb} ${area.toLowerCase()} #${i}`;
        commands.push({
          id: `${area}-${verb}-${i}`,
          title,
          subtitle: `${group} › ${area} #${i}`,
          keywords: [verb.toLowerCase(), area.toLowerCase()],
          group,
          run: () => log(`${title} (pretend)`),
        });
      }
    }
  }
  return commands;
}

// ─── Generated code ──────────────────────────────────────────────────────────

const quote = (value: string) => JSON.stringify(value);

function generatedTsx(commands: Command[], shortcuts: ShortcutConfig[], theme: GlyphXTheme) {
  const sample = commands.slice(0, 2).map((command) => {
    const lines = [`    id: ${quote(command.id)},`, `    title: ${quote(command.title)},`];
    if (command.subtitle) lines.push(`    subtitle: ${quote(command.subtitle)},`);
    if (command.keywords) lines.push(`    keywords: [${command.keywords.map(quote).join(", ")}],`);
    if (command.shortcut) lines.push(`    shortcut: ${quote(command.shortcut)},`);
    if (command.group) lines.push(`    group: ${quote(command.group)},`);
    lines.push("    run: () => {\n      // your code\n    },");
    return `  {\n${lines.join("\n")}\n  },`;
  });
  if (commands.length > 2) sample.push(`  // …and ${commands.length - 2} more`);

  const props = ["commands={commands}"];
  const isDefaultShortcut = shortcuts.length === 1 && shortcuts[0].key === "p" && shortcuts[0].shift;
  if (!isDefaultShortcut) {
    const list = shortcuts.map((s) => `{ key: ${quote(s.key)}${s.shift ? ", shift: true" : ""} }`);
    props.push(`shortcut={[${list.join(", ")}]}`);
  }
  if (theme !== "system") props.push(`theme=${quote(theme)}`);
  props.push("open={open}", "onOpenChange={setOpen}");

  return `import { useState } from "react";
import { GlyphX, type Command } from "glyphx";
import "glyphx/style.css";

const commands: Command[] = [
${sample.join("\n")}
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open the palette</button>
      <GlyphX
${props.map((prop) => `        ${prop}`).join("\n")}
      />
    </>
  );
}`;
}

// ─── Page ────────────────────────────────────────────────────────────────────

type Event = { id: number; time: string; text: string };

type ContentProps = {
  commandSet: CommandSet;
  setCommandSet: (set: CommandSet) => void;
  display: Display;
  setDisplay: (display: Display) => void;
  theme: GlyphXTheme;
  setTheme: (theme: GlyphXTheme) => void;
  shortcutIds: string[];
  setShortcutIds: (ids: string[]) => void;
  accent: Accent;
  setAccent: (accent: Accent) => void;
  events: Event[];
  clearEvents: () => void;
  commands: Command[];
  shortcuts: ShortcutConfig[];
  focusTarget: RefObject<HTMLInputElement | null>;
  log: Log;
};

function Playground({
  commandSet,
  setCommandSet,
  display,
  setDisplay,
  theme,
  setTheme,
  shortcutIds,
  setShortcutIds,
  accent,
  setAccent,
  events,
  clearEvents,
  commands,
  shortcuts,
  focusTarget,
  log,
}: ContentProps) {
  const { openPalette } = useSite();
  const mod = useMod();

  const toggleShortcut = (id: string) =>
    setShortcutIds(
      shortcutIds.includes(id) ? shortcutIds.filter((s) => s !== id) : [...shortcutIds, id]
    );

  const css =
    accent.id === DEFAULT_ACCENT.id
      ? null
      : themedVariableCss("--glyphx-accent", accent.light, accent.dark);

  return (
    <div className="container">
      <header className="page-header">
        <h1>Playground</h1>
        <p>
          Change any option and open the palette to see the result. The event
          log shows what GlyphX does, and the code updates to match.
        </p>
      </header>

      <div className="pg-layout">
        <section className="panel pg-options" aria-labelledby="options-title">
          <div className="panel-header">
            <h2 id="options-title">Options</h2>
          </div>
          <div className="panel-body">
            <fieldset>
              <legend>Commands</legend>
              <div className="choices">
                {COMMAND_SETS.map((set) => (
                  <label key={set.id} className="choice">
                    <input
                      type="radio"
                      name="command-set"
                      checked={commandSet === set.id}
                      onChange={() => setCommandSet(set.id)}
                    />
                    <span>
                      {set.label}
                      <small>{set.description}</small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Show</legend>
              <div className="choices">
                {(
                  [
                    ["subtitles", "Subtitles"],
                    ["keywords", "Keywords (searchable, not shown)"],
                    ["shortcuts", "Shortcut labels"],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="choice">
                    <input
                      type="checkbox"
                      checked={display[key]}
                      onChange={() => setDisplay({ ...display, [key]: !display[key] })}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Theme</legend>
              <div className="segmented">
                {THEMES.map((option) => (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={theme === option}
                    onClick={() => setTheme(option)}
                  >
                    {option[0].toUpperCase() + option.slice(1)}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Opens with</legend>
              <div className="choices">
                {SHORTCUT_OPTIONS.map((option) => (
                  <label key={option.id} className="choice">
                    <input
                      type="checkbox"
                      checked={shortcutIds.includes(option.id)}
                      onChange={() => toggleShortcut(option.id)}
                    />
                    <span>
                      {mod} {option.keys}
                      {option.id === "shift-p" && " (default)"}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend>Accent color</legend>
              <div className="swatches">
                {ACCENTS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className="swatch"
                    style={{ background: `rgb(${option.light})` }}
                    aria-pressed={accent.id === option.id}
                    aria-label={option.name}
                    title={option.name}
                    onClick={() => setAccent(option)}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        </section>

        <div className="pg-column">
          <section className="panel pg-try" aria-labelledby="try-title">
            <div className="panel-header">
              <h2 id="try-title">Try it</h2>
              <span className="muted" style={{ fontSize: 13 }}>
                {commands.length.toLocaleString()} commands
              </span>
            </div>
            <div className="pg-open">
              <button
                type="button"
                className="button button-primary"
                onClick={() => {
                  // Controlled mode: this is your code opening it, so GlyphX
                  // doesn't call onOpenChange.
                  log("Button clicked: your code set open to true");
                  openPalette();
                }}
              >
                Open the palette
              </button>
              <p>
                {shortcuts.length > 0
                  ? `or press ${SHORTCUT_OPTIONS.filter((o) => shortcutIds.includes(o.id))
                      .map((o) => `${mod} ${o.keys}`)
                      .join(" or ")}`
                  : "No shortcut selected: only the button opens it."}
              </p>
            </div>
            {commandSet === "kitchen-sink" && (
              <label className="pg-focus-target">
                Focus target
                <input ref={focusTarget} placeholder="“Focus the text field” puts the cursor here" />
              </label>
            )}
          </section>

          <section className="panel" aria-labelledby="events-title">
            <div className="panel-header">
              <h2 id="events-title">Event log</h2>
              <button type="button" className="text-button" onClick={clearEvents}>
                Clear
              </button>
            </div>
            {events.length === 0 && (
              <p className="event-log-empty">
                Open the palette and run something. Events appear here, newest first.
              </p>
            )}
            {/* Always rendered, so screen readers announce the first event too. */}
            <ol className="event-log" aria-live="polite">
              {events.map((event) => (
                <li key={event.id}>
                  <time>{event.time}</time>
                  <span>{event.text}</span>
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="code-title">
            <h2 id="code-title" className="visually-hidden">
              Your code
            </h2>
            <Code
              code={generatedTsx(commands, shortcuts, theme)}
              title="Your code · CommandPalette.tsx"
            />
          </section>

          {css && (
            <section aria-labelledby="css-title">
              <h2 id="css-title" className="visually-hidden">
                Your CSS
              </h2>
              <Code code={css} language="css" title="Your CSS · styles.css" />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

let nextEventId = 0;

function PlaygroundPage() {
  const [commandSet, setCommandSet] = useState<CommandSet>("starter");
  const [display, setDisplay] = useState<Display>({ subtitles: true, keywords: true, shortcuts: true });
  const [theme, setTheme] = useState<GlyphXTheme>("system");
  const [shortcutIds, setShortcutIds] = useState(["shift-p", "k"]);
  const [accent, setAccent] = useState<Accent>(DEFAULT_ACCENT);
  const [events, setEvents] = useState<Event[]>([]);
  const focusTarget = useRef<HTMLInputElement>(null);
  const mod = useMod();

  const log = useCallback((text: string) => {
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    setEvents((current) => [{ id: ++nextEventId, time, text }, ...current].slice(0, 50));
  }, []);

  useEffect(() => applyAccent(accent, "playground-accent"), [accent]);

  const commands = useMemo(() => {
    const base =
      commandSet === "starter"
        ? starterCommands(log, mod)
        : commandSet === "flat"
          ? starterCommands(log, mod, false)
          : commandSet === "kitchen-sink"
            ? kitchenSinkCommands(log, focusTarget)
            : largeCommands(log);

    return base.map((command): Command => ({
      ...command,
      subtitle: display.subtitles ? command.subtitle : undefined,
      keywords: display.keywords ? command.keywords : undefined,
      shortcut: display.shortcuts ? command.shortcut : undefined,
      // Log every run, and errors too (rethrown so GlyphX still logs them).
      run: async () => {
        log(`Ran “${command.title}”`);
        try {
          await command.run();
        } catch (error) {
          log(`“${command.title}” failed: ${(error as Error).message} (see the console)`);
          throw error;
        }
      },
    }));
  }, [commandSet, display, log, mod]);

  const shortcuts = useMemo(
    () => SHORTCUT_OPTIONS.filter((o) => shortcutIds.includes(o.id)).map((o) => o.config),
    [shortcutIds]
  );

  const palette = useMemo(
    () => ({
      commands,
      shortcut: shortcuts,
      theme,
      onOpenChange: (open: boolean) => log(`onOpenChange(${open})`),
    }),
    [commands, shortcuts, theme, log]
  );

  return (
    <Layout page="playground" palette={palette}>
      <Playground
        commandSet={commandSet}
        setCommandSet={setCommandSet}
        display={display}
        setDisplay={setDisplay}
        theme={theme}
        setTheme={setTheme}
        shortcutIds={shortcutIds}
        setShortcutIds={setShortcutIds}
        accent={accent}
        setAccent={setAccent}
        events={events}
        clearEvents={() => setEvents([])}
        commands={commands}
        shortcuts={shortcuts}
        focusTarget={focusTarget}
        log={log}
      />
    </Layout>
  );
}

render(<PlaygroundPage />);
