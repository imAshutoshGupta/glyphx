const nav = navigator as Navigator & { userAgentData?: { platform: string } };

export const IS_MAC = /^mac/i.test(
  nav.userAgentData?.platform ?? navigator.platform
);

// The primary modifier key, as GlyphX matches it.
export const MOD = IS_MAC ? "⌘" : "Ctrl";
