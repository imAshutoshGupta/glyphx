import { createContext, useContext } from "react";
import type { GlyphXTheme } from "glyphx";

export type SiteContextValue = {
  // Opens the palette, optionally with a search already typed.
  openPalette: (query?: string) => void;
  toast: (message: string) => void;
  theme: GlyphXTheme;
  setTheme: (theme: GlyphXTheme) => void;
};

export const SiteContext = createContext<SiteContextValue | null>(null);

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite() must be used inside <Layout>");
  return value;
}
