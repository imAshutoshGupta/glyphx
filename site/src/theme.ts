import type { GlyphXTheme } from "glyphx";

// The visitor's light/dark choice is the only thing this website stores
// (see the privacy page). An inline script in each page's <head> applies it
// before the page renders, so there is no flash of the wrong theme.
export const THEME_STORAGE_KEY = "glyphx-site-theme";

export function readStoredTheme(): GlyphXTheme {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : "system";
  } catch {
    return "system";
  }
}

export function storeTheme(theme: GlyphXTheme) {
  try {
    if (theme === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private windows, blocked site data).
  }
}

// The same attribute GlyphX uses, so one switch themes the page and the palette.
export function applyTheme(theme: GlyphXTheme) {
  const root = document.documentElement;
  if (theme === "system") delete root.dataset.glyphxTheme;
  else root.dataset.glyphxTheme = theme;
}

export const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export const resolveTheme = (theme: GlyphXTheme) =>
  theme === "system" ? systemTheme() : theme;
