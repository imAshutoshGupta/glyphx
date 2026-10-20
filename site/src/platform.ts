import { useSyncExternalStore } from "react";

const nav =
  typeof navigator === "undefined"
    ? undefined
    : (navigator as Navigator & { userAgentData?: { platform: string } });

export const IS_MAC = /^mac/i.test(nav?.userAgentData?.platform ?? nav?.platform ?? "");

// The primary modifier key, as GlyphX matches it. For text that only appears
// in the browser (commands, toasts).
export const MOD = IS_MAC ? "⌘" : "Ctrl";

const subscribe = () => () => {};

// For text in the prerendered pages: "⌘" at build time and while the page
// attaches, then the visitor's key, so the HTML and the first render match.
export const useMod = () => useSyncExternalStore(subscribe, () => MOD, () => "⌘");
