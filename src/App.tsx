import { GlyphX } from "./palette/CommandPaletteProvider";
import type { Command } from "./engine";

export default function App() {
  const commands: Command[] = [
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
        document.documentElement.classList.toggle("dark"),
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
  ];

  return (
    <>
      <main
        className="
          min-h-screen
          bg-[rgb(var(--glyphx-bg))]
          text-[rgb(var(--glyphx-fg))]
          flex
          items-center
          justify-center
        "
      >
        <div className="text-center max-w-md">
          <img
            src="/assets/logo.svg"
            alt=""
            width={48}
            height={48}
            className="mx-auto mb-4"
          />
          <h1 className="text-lg font-medium">GlyphX Playground</h1>

          <p className="mt-2 text-sm text-[rgb(var(--glyphx-muted))]">
            Press <kbd className="rounded border px-1.5 py-0.5">⌘</kbd> +{" "}
            <kbd className="rounded border px-1.5 py-0.5">Shift</kbd> +{" "}
            <kbd className="rounded border px-1.5 py-0.5">P</kbd> to open the
            palette
          </p>

          <p className="mt-4 text-xs text-[rgb(var(--glyphx-muted))]">
            This is a minimal host environment for testing and showcasing
            GlyphX.
          </p>
        </div>
      </main>

      <GlyphX commands={commands} />
    </>
  );
}
