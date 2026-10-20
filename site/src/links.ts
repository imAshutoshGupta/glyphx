// Addresses used across the website. BASE_URL is "/glyphx/" (vite.config.ts).
const BASE = import.meta.env.BASE_URL;

export const PAGES = {
  home: BASE,
  docs: `${BASE}docs/`,
  playground: `${BASE}playground/`,
  privacy: `${BASE}privacy/`,
} as const;

export const SITE_URL = "https://imashutoshgupta.github.io/glyphx/";
export const REPO_URL = "https://github.com/imAshutoshGupta/glyphx";
export const NPM_URL = "https://www.npmjs.com/package/glyphx";
export const CHANGELOG_URL = `${REPO_URL}/blob/main/CHANGELOG.md`;
export const LICENSE_URL = `${REPO_URL}/blob/main/LICENSE`;
export const ISSUES_URL = `${REPO_URL}/issues`;
export const NEW_ISSUE_URL = `${REPO_URL}/issues/new`;
export const GITHUB_PRIVACY_URL =
  "https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement";

export const VERSION = __GLYPHX_VERSION__;

export const INSTALL_COMMANDS = {
  npm: "npm install glyphx",
  pnpm: "pnpm add glyphx",
  yarn: "yarn add glyphx",
  bun: "bun add glyphx",
} as const;

export type PackageManager = keyof typeof INSTALL_COMMANDS;
