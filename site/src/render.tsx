import { StrictMode, type ReactNode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
// Typefaces are bundled and served from this site (no font CDN).
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "glyphx/style.css";
import "./site.css";

// The page passed to render() in the prerender build (see prerender.ts).
let lastPage: ReactNode = null;
export const renderedPage = () => lastPage;

// Each page's entry file calls this with its page component.
export function render(page: ReactNode) {
  const tree = <StrictMode>{page}</StrictMode>;
  if (import.meta.env.SSR) {
    lastPage = tree;
    return;
  }
  const root = document.getElementById("root")!;
  // The built pages already contain their HTML, so attach to it.
  if (root.firstElementChild) hydrateRoot(root, tree);
  else createRoot(root).render(tree);
}
