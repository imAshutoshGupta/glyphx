// Code samples shown on the website and copied by palette commands.

export const CSS_IMPORT = `import "glyphx/style.css";`;

export const QUICK_START = `import { GlyphX, type Command } from "glyphx";
import "glyphx/style.css";

// Defined outside the component, so the array stays the same between renders.
const commands: Command[] = [
  {
    id: "home",
    title: "Go to Home",
    group: "Navigation",
    run: () => window.location.assign("/"),
  },
  {
    id: "dark-mode",
    title: "Toggle dark mode",
    subtitle: "Switch between light and dark",
    keywords: ["theme", "appearance", "night"],
    group: "Settings",
    // Your app's own dark mode. Pass theme={…} to make GlyphX follow it.
    run: () => {
      document.documentElement.classList.toggle("dark");
    },
  },
];

export function App() {
  return <GlyphX commands={commands} />;
}`;
