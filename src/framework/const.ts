// import.meta.env.BASE_URL is injected by Vite's --base flag at build time.
// In dev it is always '/', so fall back to '/transgressions' to keep
// localhost:3000/transgressions working unchanged.
const viteBase = import.meta.env.BASE_URL ?? '/';
export const BASE_URL = viteBase === '/' ? '/transgressions' : viteBase.replace(/\/$/, '');
