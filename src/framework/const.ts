// import.meta.env.BASE_URL is injected by Vite from the --base flag (prod)
// or server.base (dev). Strip the trailing slash for use as a router basename
// and fetch prefix.
export const BASE_URL = (import.meta.env.BASE_URL ?? '/transgressions/').replace(/\/$/, '');
