// import.meta.env.BASE_URL is set by Vite's --base flag at build time.
// Locally it is '/' so we fall back to '/transgressions' to keep the dev
// experience unchanged (localhost:3000/transgressions).
const viteBase = import.meta.env.BASE_URL ?? '/';
export const BASE_URL = viteBase === '/' ? '/transgressions' : viteBase.replace(/\/$/, '');
