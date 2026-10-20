import { useMemo, useState } from "react";
import { GlyphX } from "./palette/CommandPaletteProvider";
import type { Command } from "./engine";
import type { GlyphXTheme } from "./palette/types";

const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export default function App() {
  const [theme, setTheme] = useState<GlyphXTheme>("system");

  const commands: Command[] = useMemo(
    () => [
      {
        id: "open-github",
        title: "Open GitHub",
        subtitle: "Go to the GlyphX repository",
        keywords: ["repo", "source", "code"],
        group: "Navigation",
        run: () =>
          window.open("https://github.com/imAshutoshGupta/glyphx", "_blank"),
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
        id: "scroll-top",
        title: "Scroll to Top",
        keywords: ["up", "beginning"],
        group: "Navigation",
        run: () => window.scrollTo({ top: 0, behavior: "smooth" }),
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
        id: "clear-storage",
        title: "Clear Local Storage",
        subtitle: "Wipe all data stored in localStorage",
        keywords: ["cache", "reset", "storage"],
        group: "Developer",
        run: () => {
          localStorage.clear();
          console.log("localStorage cleared");
        },
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
          <img src="/assets/logo.svg" alt="" width={48} height={48} />
          <h1>GlyphX Playground</h1>

          <p>
            Press <kbd>⌘</kbd> + <kbd>Shift</kbd> + <kbd>P</kbd> to open the
            palette
          </p>

          <p className="demo-note">
            This is a minimal host environment for testing and showcasing
            GlyphX.
          </p>
        </div>
      </main>

      <GlyphX commands={commands} theme={theme} />
    </>
  );
}
