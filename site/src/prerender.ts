import { renderToString } from "react-dom/server";
import { renderedPage } from "./render";

// Built for Node by `vite build --mode prerender`. scripts/prerender-site.mjs
// calls it for each page and writes the HTML into dist-site/, so pages show
// their content before JavaScript runs and search engines can read them.
const PAGES = {
  home: () => import("./pages/home"),
  docs: () => import("./pages/docs"),
  playground: () => import("./pages/playground"),
  privacy: () => import("./pages/privacy"),
  "not-found": () => import("./pages/not-found"),
};

export async function prerender(page: keyof typeof PAGES) {
  // Importing a page runs its render() call, which (in this build) records
  // the page instead of mounting it.
  await PAGES[page]();
  return renderToString(renderedPage());
}
