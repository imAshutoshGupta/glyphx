import type { Command, GlyphXTheme } from "glyphx";
import { ACCENTS, applyAccent } from "./accent";
import { DOC_SECTIONS, type DocSectionId } from "./docsSections";
import {
  CHANGELOG_URL,
  INSTALL_COMMANDS,
  LICENSE_URL,
  NEW_ISSUE_URL,
  NPM_URL,
  PAGES,
  REPO_URL,
  type PackageManager,
} from "./links";
import { MOD } from "./platform";
import { CSS_IMPORT, QUICK_START } from "./snippets";
import { resolveTheme } from "./theme";

type Deps = {
  toast: (message: string) => void;
  theme: GlyphXTheme;
  setTheme: (theme: GlyphXTheme) => void;
};

// Extra search words for the docs sections, so "dark" finds theming, etc.
const DOC_KEYWORDS: Record<DocSectionId, string[]> = {
  installation: ["install", "npm", "pnpm", "yarn", "bun", "setup"],
  "quick-start": ["start", "example", "hello world", "setup"],
  commands: ["command object", "id", "title", "run"],
  "groups-and-search": ["group", "subtitle", "keywords", "fuzzy", "ranking"],
  "running-commands": ["run", "async", "promise", "errors", "focus"],
  shortcuts: ["keyboard", "hotkey", "cmd k", "ctrl k", "firefox"],
  "controlled-mode": ["open", "onOpenChange", "button", "controlled", "state"],
  theming: ["theme", "dark", "light", "colors", "css variables", "accent"],
  nextjs: ["next", "app router", "server components", "use client", "ssr"],
  "script-tag": ["umd", "cdn", "unpkg", "html", "no bundler"],
  typescript: ["types", "ts", "typings"],
  accessibility: ["a11y", "screen reader", "aria", "focus"],
  testing: ["jest", "vitest", "testing library", "tests"],
  tips: ["tricks", "best practices", "patterns", "recipes"],
  faq: ["help", "troubleshooting", "problems", "questions"],
  api: ["props", "reference", "types", "interface"],
};

const openInNewTab = (url: string) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

export function buildSiteCommands(
  { toast, theme, setTheme }: Deps,
  pageCommands: Command[] = []
): Command[] {
  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast(`Copied ${what}`);
    } catch {
      toast("Your browser blocked clipboard access.");
    }
  };

  const pages: Command[] = [
    {
      id: "go-home",
      title: "Home",
      subtitle: "The GlyphX homepage",
      keywords: ["start", "landing", "index", "main"],
      group: "Go to",
      run: () => window.location.assign(PAGES.home),
    },
    {
      id: "go-docs",
      title: "Documentation",
      subtitle: "Guides, tips and the API reference",
      keywords: ["docs", "guide", "help", "manual", "learn"],
      group: "Go to",
      run: () => window.location.assign(PAGES.docs),
    },
    {
      id: "go-playground",
      title: "Playground",
      subtitle: "Try every option live",
      keywords: ["demo", "test", "sandbox", "try", "configure"],
      group: "Go to",
      run: () => window.location.assign(PAGES.playground),
    },
    {
      id: "go-privacy",
      title: "Privacy and data",
      subtitle: "What this website stores (almost nothing)",
      keywords: ["policy", "cookies", "gdpr", "tracking", "data", "terms"],
      group: "Go to",
      run: () => window.location.assign(PAGES.privacy),
    },
  ];

  const docs: Command[] = DOC_SECTIONS.map((section) => ({
    id: `docs-${section.id}`,
    title: section.title,
    subtitle: "Documentation",
    keywords: ["docs", ...DOC_KEYWORDS[section.id]],
    group: "Documentation",
    run: () => window.location.assign(`${PAGES.docs}#${section.id}`),
  }));

  const appearance: Command[] = [
    {
      id: "theme-toggle",
      title: "Toggle light and dark",
      keywords: ["theme", "dark mode", "light mode", "appearance", "night"],
      group: "Appearance",
      run: () => setTheme(resolveTheme(theme) === "dark" ? "light" : "dark"),
    },
    {
      id: "theme-light",
      title: "Switch to light theme",
      keywords: ["theme", "appearance", "day"],
      group: "Appearance",
      run: () => setTheme("light"),
    },
    {
      id: "theme-dark",
      title: "Switch to dark theme",
      keywords: ["theme", "appearance", "night"],
      group: "Appearance",
      run: () => setTheme("dark"),
    },
    {
      id: "theme-system",
      title: "Use the system theme",
      subtitle: "Follow your device's light or dark setting",
      keywords: ["theme", "appearance", "auto", "os"],
      group: "Appearance",
      run: () => setTheme("system"),
    },
    ...ACCENTS.map((accent) => ({
      id: `accent-${accent.id}`,
      title: `Accent color: ${accent.name}`,
      subtitle: "Recolors matched letters, using a CSS variable",
      keywords: ["color", "highlight", "accent", "theme", "customize"],
      group: "Appearance",
      run: () => {
        applyAccent(accent);
        toast(`Accent set to ${accent.name}. Search for something to see it.`);
      },
    })),
  ];

  const copying: Command[] = [
    ...(Object.keys(INSTALL_COMMANDS) as PackageManager[]).map((manager) => ({
      id: `copy-install-${manager}`,
      title: `Copy install command (${manager})`,
      subtitle: INSTALL_COMMANDS[manager],
      keywords: ["install", "clipboard", "setup", "package"],
      group: "Copy to clipboard",
      run: () => copy(INSTALL_COMMANDS[manager], "the install command"),
    })),
    {
      id: "copy-css",
      title: "Copy the stylesheet import",
      subtitle: CSS_IMPORT,
      keywords: ["css", "style", "clipboard"],
      group: "Copy to clipboard",
      run: () => copy(CSS_IMPORT, "the stylesheet import"),
    },
    {
      id: "copy-quick-start",
      title: "Copy a quick-start example",
      subtitle: "A complete component you can paste into your app",
      keywords: ["example", "code", "snippet", "clipboard", "starter"],
      group: "Copy to clipboard",
      run: () => copy(QUICK_START, "the quick-start example"),
    },
    {
      id: "copy-link",
      title: "Copy a link to this page",
      keywords: ["url", "share", "clipboard"],
      group: "Copy to clipboard",
      run: () => copy(window.location.href, "the link"),
    },
  ];

  const tryIt: Command[] = [
    {
      id: "say-hello",
      title: "Say hello",
      subtitle: "Shows a message, like any command in your app could",
      keywords: ["greeting", "toast", "demo"],
      group: "Try it",
      run: () => toast("Hello from GlyphX!"),
    },
    {
      id: "slow-task",
      title: "Run a slow task (2 seconds)",
      subtitle: "The palette closes right away; the task finishes later",
      keywords: ["async", "promise", "wait", "loading", "demo"],
      group: "Try it",
      run: async () => {
        toast("Working on it…");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast("Slow task finished.");
      },
    },
    {
      id: "failing-command",
      title: "Run a command that fails",
      subtitle: "GlyphX catches the error and logs it to the console",
      keywords: ["error", "throw", "exception", "demo"],
      group: "Try it",
      run: () => {
        toast("This command threw an error. Open the browser console to see it.");
        throw new Error("This command failed on purpose.");
      },
    },
    {
      id: "count-commands",
      title: "How many commands are there?",
      keywords: ["count", "total", "number"],
      group: "Try it",
      run: () => toast(`This palette has ${all.length} commands.`),
    },
    {
      id: "roll-die",
      title: "Roll a die",
      keywords: ["random", "dice", "game", "fun"],
      group: "Try it",
      run: () => toast(`You rolled a ${1 + Math.floor(Math.random() * 6)}.`),
    },
    {
      id: "what-time",
      title: "What time is it?",
      keywords: ["clock", "date", "now"],
      group: "Try it",
      run: () => toast(`It's ${new Date().toLocaleTimeString()}.`),
    },
    {
      id: "window-size",
      title: "Show the window size",
      keywords: ["viewport", "screen", "dimensions", "resolution"],
      group: "Try it",
      run: () => toast(`${window.innerWidth} × ${window.innerHeight} pixels`),
    },
    {
      id: "keyboard-help",
      title: "Show keyboard shortcuts",
      keywords: ["keys", "hotkeys", "help", "cheatsheet"],
      group: "Try it",
      run: () =>
        toast(
          `${MOD} K or ${MOD} Shift P: open the palette\n↑ ↓: move the selection\nEnter: run the command\nEsc: close`
        ),
    },
    {
      id: "scroll-top",
      title: "Scroll to the top",
      keywords: ["up", "beginning", "start"],
      group: "Try it",
      run: () => window.scrollTo({ top: 0 }),
    },
    {
      id: "scroll-bottom",
      title: "Scroll to the bottom",
      keywords: ["down", "end", "footer"],
      group: "Try it",
      run: () => window.scrollTo({ top: document.body.scrollHeight }),
    },
    {
      id: "print",
      title: "Print this page",
      keywords: ["pdf", "paper", "save"],
      group: "Try it",
      run: () => window.print(),
    },
  ];

  const links: Command[] = [
    {
      id: "open-github",
      title: "Open the GitHub repository",
      subtitle: "Source code, issues and releases",
      keywords: ["source", "code", "repo", "star"],
      group: "Links",
      run: () => openInNewTab(REPO_URL),
    },
    {
      id: "open-npm",
      title: "Open the npm package",
      keywords: ["package", "registry", "download"],
      group: "Links",
      run: () => openInNewTab(NPM_URL),
    },
    {
      id: "open-changelog",
      title: "Read the changelog",
      subtitle: "What changed in each version",
      keywords: ["releases", "history", "versions", "news"],
      group: "Links",
      run: () => openInNewTab(CHANGELOG_URL),
    },
    {
      id: "report-issue",
      title: "Report a bug or request a feature",
      keywords: ["issue", "bug", "feedback", "feature", "help"],
      group: "Links",
      run: () => openInNewTab(NEW_ISSUE_URL),
    },
    {
      id: "open-license",
      title: "View the MIT License",
      keywords: ["license", "legal", "terms", "copyright"],
      group: "Links",
      run: () => openInNewTab(LICENSE_URL),
    },
  ];

  const all = [...pageCommands, ...pages, ...docs, ...appearance, ...copying, ...tryIt, ...links];
  return all;
}
