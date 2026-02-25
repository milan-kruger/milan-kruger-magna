import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright'


export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.test.tsx'],
        exclude: ['**/node_modules/**',
            // TODO: Reevaluate these exclusions later
            // Exclude due to Vitest v4 browser mode bug when running many tests at once:
            // https://github.com/vitest-dev/vitest/issues/8745
            'src/project/_test/hooks/AdjudicateSubmissionManager.test.tsx',
            'src/project/_test/pages/**/*.test.tsx',
            'src/project/_test/components/**/*.test.tsx'
        ],
        setupFiles: ['./vitest-setup-file.ts'],
        fileParallelism: false, // disable parallelization as running on multiple threads can cause test failures
        browser: {
            enabled: true,
            provider: playwright(),
            headless: process.env.HEADLESS === 'true',
            instances: [
                { browser: 'chromium' }
            ]
        },
        reporters: [
            'default',
            ['vitest-sonar-reporter', { outputFile: 'coverage/sonar-report.xml' }]
        ],
        coverage: {
            include: ['src/**/*.tsx'],
            reporter: ['text', 'lcov']
        },
        includeSource: ['src/**/*.{ts,tsx}'],
    },
    optimizeDeps: {
        include: [
            'react/jsx-dev-runtime',
            'src/framework/redux/store.ts',
            'async-mutex'
        ],
    }
});
