// Live palette recoloring for the "Accent: …" commands and the playground.
// It overrides GlyphX's CSS variables exactly the way an app would.

export type Rgb = string; // space-separated channels, e.g. "37 99 235"

export type Accent = {
  id: string;
  name: string;
  light: Rgb;
  dark: Rgb;
};

export const ACCENTS: Accent[] = [
  { id: "blue", name: "Blue (default)", light: "37 99 235", dark: "96 165 250" },
  { id: "violet", name: "Violet", light: "109 40 217", dark: "167 139 250" },
  { id: "emerald", name: "Emerald", light: "4 120 87", dark: "52 211 153" },
  { id: "rose", name: "Rose", light: "190 18 60", dark: "251 113 133" },
  { id: "amber", name: "Amber", light: "180 83 9", dark: "251 191 36" },
];

export const DEFAULT_ACCENT = ACCENTS[0];

// CSS that sets a variable for light mode, dark mode, and both fixed themes.
export function themedVariableCss(variable: string, light: Rgb, dark: Rgb) {
  return `:root, [data-glyphx-theme="light"] { ${variable}: ${light}; }
@media (prefers-color-scheme: dark) {
  :root:not([data-glyphx-theme="light"]) { ${variable}: ${dark}; }
}
[data-glyphx-theme="dark"] { ${variable}: ${dark}; }`;
}

// Applies (or, with the default accent, removes) an override in a <style>
// element added after GlyphX's stylesheet, so it wins.
export function applyAccent(accent: Accent, styleId = "site-accent") {
  let style = document.getElementById(styleId);
  if (accent.id === DEFAULT_ACCENT.id) {
    style?.remove();
    return;
  }
  if (!style) {
    style = document.createElement("style");
    style.id = styleId;
    document.head.appendChild(style);
  }
  style.textContent = themedVariableCss("--glyphx-accent", accent.light, accent.dark);
}
