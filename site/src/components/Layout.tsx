import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  GlyphX,
  type Command,
  type GlyphXProps,
  type GlyphXTheme,
} from "glyphx";
import { CodeXml, Menu, Monitor, Moon, Search, Sun, X } from "lucide-react";
import logoUrl from "../../../assets/logo.svg";
import { buildSiteCommands } from "../commands";
import { SiteContext, type SiteContextValue } from "../context";
import {
  AUTHOR,
  AUTHOR_EMAIL,
  AUTHOR_GITHUB,
  CHANGELOG_URL,
  COMMERCIAL_URL,
  CONTACT_URL,
  ISSUES_URL,
  LICENSE_URL,
  NPM_URL,
  PAGES,
  REPO_URL,
  VERSION,
} from "../links";
import { useMod } from "../platform";
import { applyTheme, readStoredTheme, storeTheme } from "../theme";
import { typeIntoPalette } from "../typeIntoPalette";

export type Page = "home" | "docs" | "playground" | "privacy" | "not-found";

const NEXT_THEME: Record<GlyphXTheme, GlyphXTheme> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const THEME_LABEL: Record<GlyphXTheme, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

type LayoutProps = {
  page: Page;
  children: ReactNode;
  // Extra commands for this page, listed first. Keep the array stable.
  pageCommands?: Command[];
  // Replaces the site's palette setup (the playground configures its own).
  palette?: Partial<Pick<GlyphXProps, "commands" | "shortcut" | "theme" | "onOpenChange">>;
};

let nextToastId = 0;

export function Layout({ page, children, pageCommands, palette }: LayoutProps) {
  const mod = useMod();
  // Starts as "system" to match the prerendered HTML; the stored choice is
  // already applied to the page by the inline script in <head>.
  const [theme, setThemeState] = useState<GlyphXTheme>("system");
  useEffect(() => setThemeState(readStoredTheme()), []);
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);

  const setTheme = useCallback((next: GlyphXTheme) => {
    storeTheme(next);
    applyTheme(next);
    setThemeState(next);
  }, []);

  const toast = useCallback((message: string) => {
    const id = ++nextToastId;
    setToasts((current) => [...current.slice(-2), { id, message }]);
    // Longer messages stay up longer.
    window.setTimeout(
      () => setToasts((current) => current.filter((t) => t.id !== id)),
      4000 + message.length * 50
    );
  }, []);

  const siteCommands = useMemo(
    () => buildSiteCommands({ toast, setTheme, theme }, pageCommands),
    [toast, setTheme, theme, pageCommands]
  );

  const openPalette = useCallback((query?: string) => {
    setOpen(true);
    if (query) typeIntoPalette(query);
  }, []);

  const context: SiteContextValue = useMemo(
    () => ({ openPalette, toast, theme, setTheme }),
    [openPalette, toast, theme, setTheme]
  );

  const nav = [
    { page: "docs", href: PAGES.docs, label: "Docs" },
    { page: "playground", href: PAGES.playground, label: "Playground" },
  ] as const;

  return (
    <SiteContext.Provider value={context}>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <header className="site-header">
        <div className="container site-header-inner">
          <a className="brand" href={PAGES.home}>
            <img src={logoUrl} alt="" width={28} height={28} />
            GlyphX
            <span className="brand-version">v{VERSION}</span>
          </a>

          <nav className="site-nav" aria-label="Main">
            {nav.map((item) => (
              <a
                key={item.page}
                href={item.href}
                aria-current={page === item.page ? "page" : undefined}
              >
                {item.label}
              </a>
            ))}
            <a href={REPO_URL}>
              <CodeXml size={15} aria-hidden />
              GitHub
            </a>
          </nav>

          <div className="header-actions">
            <button
              type="button"
              className="search-button"
              onClick={() => openPalette()}
            >
              <Search size={15} aria-hidden />
              <span className="search-label">Search or run a command…</span>
              <span className="search-shortcut" aria-hidden>
                <kbd className="kbd">{mod}</kbd>
                <kbd className="kbd">K</kbd>
              </span>
            </button>

            <button
              type="button"
              className="icon-button"
              onClick={() => setTheme(NEXT_THEME[theme])}
              aria-label={`${THEME_LABEL[theme]}. Switch to ${THEME_LABEL[NEXT_THEME[theme]].toLowerCase()}.`}
              title={THEME_LABEL[theme]}
            >
              {theme === "light" ? (
                <Sun size={16} aria-hidden />
              ) : theme === "dark" ? (
                <Moon size={16} aria-hidden />
              ) : (
                <Monitor size={16} aria-hidden />
              )}
            </button>

            <button
              type="button"
              className="icon-button menu-button"
              onClick={() => setMenuOpen((value) => !value)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label="Menu"
            >
              {menuOpen ? <X size={16} aria-hidden /> : <Menu size={16} aria-hidden />}
            </button>
          </div>
        </div>

        <nav
          id="mobile-nav"
          className="container mobile-nav"
          data-open={menuOpen}
          aria-label="Main"
        >
          <a href={PAGES.home} aria-current={page === "home" ? "page" : undefined}>
            Home
          </a>
          {nav.map((item) => (
            <a
              key={item.page}
              href={item.href}
              aria-current={page === item.page ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
          <a href={PAGES.privacy} aria-current={page === "privacy" ? "page" : undefined}>
            Privacy and data
          </a>
          <a href={REPO_URL}>GitHub</a>
        </nav>
      </header>

      <main id="main" tabIndex={-1}>
        {children}
      </main>

      <footer className="site-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <a className="brand" href={PAGES.home}>
                <img src={logoUrl} alt="" width={24} height={24} />
                GlyphX
              </a>
              <p>
                A fast, keyboard-first command palette for React. Free for
                personal and noncommercial use.
              </p>
            </div>

            <div className="footer-column">
              <h2>Product</h2>
              <ul>
                <li>
                  <a href={PAGES.docs}>Documentation</a>
                </li>
                <li>
                  <a href={PAGES.playground}>Playground</a>
                </li>
                <li>
                  <a href={CHANGELOG_URL}>Changelog</a>
                </li>
                <li>
                  <a href={NPM_URL}>npm package</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h2>Guides</h2>
              <ul>
                <li>
                  <a href={`${PAGES.docs}#quick-start`}>Quick start</a>
                </li>
                <li>
                  <a href={`${PAGES.docs}#theming`}>Themes and colors</a>
                </li>
                <li>
                  <a href={`${PAGES.docs}#nextjs`}>Next.js</a>
                </li>
                <li>
                  <a href={`${PAGES.docs}#tips`}>Tips and tricks</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h2>Project</h2>
              <ul>
                <li>
                  <a href={REPO_URL}>GitHub</a>
                </li>
                <li>
                  <a href={ISSUES_URL}>Issues</a>
                </li>
                <li>
                  <a href={PAGES.privacy}>Privacy and data</a>
                </li>
                <li>
                  <a href={LICENSE_URL}>License</a>
                </li>
              </ul>
            </div>

            <div className="footer-column">
              <h2>Developer</h2>
              <ul>
                <li>
                  <a href={AUTHOR_GITHUB}>{AUTHOR}</a>
                </li>
                <li>
                  <a href={CONTACT_URL}>{AUTHOR_EMAIL}</a>
                </li>
                <li>
                  <a href={COMMERCIAL_URL}>Ask about commercial use</a>
                </li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <span>
              © 2026 {AUTHOR}. Designed and built by <a href={AUTHOR_GITHUB}>{AUTHOR}</a>.
            </span>
            <span className="keyboard-only">
              Press <kbd className="kbd">{mod}</kbd> <kbd className="kbd">K</kbd>{" "}
              on any page to open the palette.
            </span>
          </div>
        </div>
      </footer>

      <ol className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <li key={t.id} className="toast">
            {t.message}
          </li>
        ))}
      </ol>

      <GlyphX
        commands={palette?.commands ?? siteCommands}
        shortcut={palette?.shortcut}
        theme={palette?.theme ?? theme}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          palette?.onOpenChange?.(next);
        }}
      />
    </SiteContext.Provider>
  );
}
