/**
 * Dedicated Vitest config for the brute-force barcode research test.
 *
 * Key differences from the main config:
 *  - Browser mode DISABLED — avoids WebSocket payload limits
 *  - Worker isolation disabled — avoids IPC serialisation limits
 *  - Only includes the real-images research test
 *  - Longer timeout (the full matrix can take a while)
 *
 * Run with:
 *   npx vitest run --config vitest.barcode-research.config.ts
 *   OR: npm run barcode:research
 */
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        include: [
            'src/project/pages/mobile-transgressions/imagePreprocessingRealImages.test.tsx',
        ],
        setupFiles: ['./vitest-setup-file-node.ts'],
        fileParallelism: false,
        isolate: false,
        maxConcurrency: 16,   // one test per image — parallelise across images
        testTimeout: 300_000, // 5 min per image should be plenty
        reporters: ['default'],
        // NO browser mode — this is the critical fix
        // browser: { enabled: false } is the default, so we just omit it
    },
    optimizeDeps: {
        include: [
            'react/jsx-dev-runtime',
            'src/framework/redux/store.ts',
            'async-mutex',
        ],
    },
});

