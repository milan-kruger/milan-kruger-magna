import react from '@vitejs/plugin-react-swc';
import { defineConfig, Plugin } from 'vite';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import checker from "vite-plugin-checker";
import { viteStaticCopy } from 'vite-plugin-static-copy';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Rewrites every occurrence of the LOCAL_BASE placeholder inside manifest.json
 * to the Vite base path that was supplied at build time (e.g. /milan-kruger-magna/).
 * This keeps the manifest correct for both local dev (/transgressions/) and
 * any deployment base (e.g. GitHub Pages).
 */
function rewriteManifestPlugin(): Plugin {
    const LOCAL_BASE = '/transgressions/';
    let base = LOCAL_BASE;
    return {
        name: 'rewrite-manifest',
        configResolved(config) {
            // config.base is the resolved base (e.g. '/milan-kruger-magna/' or '/')
            base = config.base === '/' ? LOCAL_BASE : config.base;
        },
        generateBundle(_options, bundle) {
            const manifestAsset = bundle['manifest.json'];
            if (manifestAsset && manifestAsset.type === 'asset' && typeof manifestAsset.source === 'string') {
                manifestAsset.source = manifestAsset.source.replaceAll(LOCAL_BASE, base);
            }
        },
        // Also rewrite during dev (vite serve) via the transform hook on the served file
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url?.includes('manifest.json')) {
                    const __dirname = path.dirname(fileURLToPath(import.meta.url));
                    const file = path.resolve(__dirname, 'public/manifest.json');
                    const content = fs.readFileSync(file, 'utf-8').replaceAll(LOCAL_BASE, base);
                    res.setHeader('Content-Type', 'application/json');
                    res.end(content);
                    return;
                }
                next();
            });
        }
    };
}

// https://vite.dev/config/
export default defineConfig({
    define: {
        global: "window",
    },
    server: {
        port: 3000,
        base: '/transgressions/'
    },
    preview: {
        port: 3000
    },
    plugins: [
        react(),
        svgr(),
        visualizer(),
        rewriteManifestPlugin(),
        checker({
            typescript: {
                tsconfigPath: './tsconfig.app.json',
                buildMode: false,
            }
        }),
        viteStaticCopy({
            targets: [
                {
                    src: 'node_modules/pdfjs-dist/build/pdf.worker.min.mjs',
                    dest: 'assets/pdfjs',
                },
                {
                    src: 'node_modules/pdfjs-dist/build/pdf.worker.mjs.map',
                    dest: 'assets/pdfjs',
                },
            ],
        }),
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    react: [
                        'react',
                        'react-dom'
                    ],
                    pdf: [
                        'pdfjs-dist',
                        'react-pdf',
                        'print-js'
                    ],
                    roboto: [
                        '@fontsource/roboto/latin-300.css',
                        '@fontsource/roboto/latin-400.css',
                        '@fontsource/roboto/latin-500.css',
                        '@fontsource/roboto/latin-700.css'
                    ],
                    flags: [
                        'react-world-flags'
                    ],
                }
            }
        }
    }
});
