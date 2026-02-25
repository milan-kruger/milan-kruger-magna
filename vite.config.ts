import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { visualizer } from 'rollup-plugin-visualizer';
import checker from "vite-plugin-checker";
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
    base: '/transgressions',
    define: {
        global: "window",
    },
    server: {
        port: 3000
    },
    preview: {
        port: 3000
    },
    plugins: [
        react(),
        svgr(),
        visualizer(),
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
