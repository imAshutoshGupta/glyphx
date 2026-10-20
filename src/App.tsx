import { useMemo, useState } from "react";
import { GlyphX } from "./palette/CommandPaletteProvider";
import type { Command } from "./engine";
import type { GlyphXTheme, ShortcutConfig } from "./palette/types";
import logoUrl from "../assets/logo.svg";

const REPO_URL = "https://github.com/imAshutoshGupta/glyphx";
const NPM_URL = "https://www.npmjs.com/package/glyphx";
const INSTALL_COMMAND = "npm install glyphx";

// ⌘/Ctrl + K as well as the default: Firefox keeps ⌘/Ctrl + Shift + P for
// itself and never passes it to the page.
const SHORTCUTS: ShortcutConfig[] = [{ key: "p", shift: true }, { key: "k" }];

const nav = navigator as Navigator & { userAgentData?: { platform: string } };
const MOD = /^mac/i.test(nav.userAgentData?.platform ?? navigator.platform)
  ? "⌘"
  : "Ctrl";

const THEMES: { value: GlyphXTheme; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export default function App() {
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<GlyphXTheme>("system");
  const [copied, setCopied] = useState(false);

  const copyInstallCommand = async () => {
    await navigator.clipboard.writeText(INSTALL_COMMAND);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const commands: Command[] = useMemo(
    () => [
      {
        id: "open-github",
        title: "Open GitHub",
        subtitle: "Go to the GlyphX repository",
        keywords: ["repo", "source", "code"],
        group: "Navigation",
        run: () => window.open(REPO_URL, "_blank"),
      },
      {
        id: "open-npm",
        title: "Open npm",
        subtitle: "See the package on npmjs.com",
        keywords: ["package", "install", "registry"],
        group: "Navigation",
        run: () => window.open(NPM_URL, "_blank"),
      },
      {
        id: "copy-install",
        title: "Copy Install Command",
        subtitle: INSTALL_COMMAND,
        keywords: ["clipboard", "npm", "setup"],
        group: "Navigation",
        run: () => navigator.clipboard.writeText(INSTALL_COMMAND),
      },
      {
        id: "copy-url",
        title: "Copy Page URL",
        subtitle: "Copy the current URL to clipboard",
        keywords: ["clipboard", "link", "share"],
        group: "Navigation",
        run: () => navigator.clipboard.writeText(window.location.href),
      },
      {
        id: "toggle-dark",
        title: "Toggle Dark Mode",
        subtitle: "Switch between light and dark theme",
        keywords: ["theme", "light", "dark", "appearance"],
        group: "Appearance",
        run: () =>
          setTheme((current) =>
            (current === "system" ? systemTheme() : current) === "dark"
              ? "light"
              : "dark"
          ),
      },
      {
        id: "system-theme",
        title: "Use System Theme",
        subtitle: "Follow the operating system's light or dark setting",
        keywords: ["theme", "auto", "appearance"],
        group: "Appearance",
        run: () => setTheme("system"),
      },
      {
        id: "reload",
        title: "Reload Page",
        keywords: ["refresh", "restart"],
        group: "Appearance",
        run: () => window.location.reload(),
      },
      {
        id: "log-time",
        title: "Log Current Time",
        subtitle: "Print the current time to the console",
        keywords: ["date", "now", "timestamp"],
        group: "Developer",
        run: () => console.log("Current time:", new Date().toLocaleTimeString()),
      },
      {
        id: "copy-ua",
        title: "Copy User Agent",
        subtitle: "Copy the browser user agent string",
        keywords: ["browser", "agent", "debug"],
        group: "Developer",
        run: () => navigator.clipboard.writeText(navigator.userAgent),
      },
    ],
    []
  );

  return (
    <>
      <main
        className="demo"
        data-glyphx-theme={theme === "system" ? undefined : theme}
      >
        <div className="demo-intro">
          <img src={logoUrl} alt="" width={56} height={56} />
          <h1>GlyphX</h1>
          <p className="demo-tagline">
            A fast, keyboard-first, Spotlight-style command palette for React.
          </p>

          <button
            type="button"
            className="demo-primary"
            onClick={() => setOpen(true)}
          >
            Open the palette
          </button>

          <p className="demo-hint">
            or press <kbd>{MOD}</kbd> <kbd>Shift</kbd> <kbd>P</kbd> or{" "}
            <kbd>{MOD}</kbd> <kbd>K</kbd>
          </p>

          <div className="demo-install">
            <code>{INSTALL_COMMAND}</code>
            <button type="button" onClick={copyInstallCommand}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <div className="demo-themes" role="group" aria-label="Theme">
            {THEMES.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                aria-pressed={theme === value}
                onClick={() => setTheme(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <nav className="demo-links">
            <a href={REPO_URL}>GitHub</a>
            <a href={NPM_URL}>npm</a>
            <a href={`${REPO_URL}#readme`}>Documentation</a>
          </nav>
        </div>
      </main>

      <GlyphX
        commands={commands}
        open={open}
        onOpenChange={setOpen}
        shortcut={SHORTCUTS}
        theme={theme}
      />
    </>
  );
}
