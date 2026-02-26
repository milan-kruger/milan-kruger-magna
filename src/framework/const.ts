// import.meta.env.BASE_URL is set by `base` in vite.config.ts (defaults to
// '/transgressions/') and can be overridden at build time via --base
// (e.g. --base=/milan-kruger-magna/ for GitHub Pages).
export const BASE_URL = (import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');
