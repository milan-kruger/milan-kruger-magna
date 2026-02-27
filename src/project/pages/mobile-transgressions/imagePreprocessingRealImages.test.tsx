/**
 * Real-image barcode preprocessing test suite.
 *
 * Drop real barcode photos (.png, .jpg, .jpeg, .bmp, .webp) into the
 * `test-images/` folder next to this file. This test will:
 *
 *  1. Load every image from that folder
 *  2. Run every preprocessing pipeline combination through zxing-wasm decoding
 *  3. Write full results to `barcode-results.json` (no large console output)
 *  4. Print only a compact summary to avoid WebSocket payload limits
 *
 * For full brute-force research with unlimited output, use the standalone runner:
 *   npm run barcode:research
 *
 * Run with:
 *   vitest --run --maxWorkers=100%
 */

import { describe, test, expect, afterAll } from 'vitest';
import { readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import {
    whiteBalance,
    toGreyscale,
    applySCurveContrast,
    applyBinaryThreshold,
} from './imagePreprocessing';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readdirSync } from 'fs';
import sharp from 'sharp';

// ─── Types ──────────────────────────────────────────────────────────────────

type StepFn = (img: ImageData) => ImageData;

type StepFactory = {
    name: string;
    build: (params: PipelineParams) => StepFn;
};

type PipelineParams = {
    wbStrength: number;
    contrastStrength: number;
    threshold: number;
};

type DecodeResult = {
    imageName: string;
    pipeline: string;
    wbStrength: number;
    contrastStrength: number;
    threshold: number;
    decoded: boolean;
    decodedText: string | null;
};

// ─── Pipeline step definitions ──────────────────────────────────────────────

const STEP_FACTORIES: StepFactory[] = [
    {
        name: 'whiteBalance',
        build: (p) => (img) => whiteBalance(img, undefined, p.wbStrength),
    },
    {
        name: 'greyscale',
        build: () => (img) => toGreyscale(img),
    },
    {
        name: 'contrast',
        build: (p) => (img) => applySCurveContrast(img, p.contrastStrength),
    },
    {
        name: 'threshold',
        build: (p) => (img) => applyBinaryThreshold(img, p.threshold),
    },
];

/** Generate all permutations of an array. */
function permutations<T>(arr: T[]): T[][] {
    if (arr.length <= 1) return [arr];
    const result: T[][] = [];
    for (let i = 0; i < arr.length; i++) {
        const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
        for (const perm of permutations(rest)) {
            result.push([arr[i], ...perm]);
        }
    }
    return result;
}

// ─── Parameter ranges ───────────────────────────────────────────────────────

const WB_STRENGTHS       = [0.8, 1.0, 1.2, 1.5, 2.0];
const CONTRAST_STRENGTHS = [0.25, 0.5, 0.75, 1.0];
const THRESHOLDS         = [96, 112, 128, 144, 160, 192];

// ─── Pipeline permutations ──────────────────────────────────────────────────

const twoStepPerms   = permutations([STEP_FACTORIES[0], STEP_FACTORIES[1]]);
const threeStepPerms = permutations([STEP_FACTORIES[0], STEP_FACTORIES[1], STEP_FACTORIES[2]]);
const fourStepPerms  = permutations(STEP_FACTORIES);
const allPipelinePerms = [...twoStepPerms, ...threeStepPerms, ...fourStepPerms];

// ─── Parameter combos ───────────────────────────────────────────────────────

const paramCombos: PipelineParams[] = [];
for (const wbStrength of WB_STRENGTHS) {
    for (const contrastStrength of CONTRAST_STRENGTHS) {
        for (const threshold of THRESHOLDS) {
            paramCombos.push({ wbStrength, contrastStrength, threshold });
        }
    }
}

// ─── zxing-wasm reader options (same as production) ─────────────────────────

const READER_OPTIONS: ReaderOptions = {
    formats: ['PDF417'],
    tryHarder: true,
    tryRotate: true,
    tryInvert: false,
    tryDownscale: true,
    downscaleFactor: 3,
    downscaleThreshold: 400,
    tryDenoise: true,
    isPure: false,
    binarizer: 'LocalAverage',
    minLineCount: 2,
    textMode: 'Plain',
    maxNumberOfSymbols: 1,
    returnErrors: false,
};

// ─── Image loading helpers ──────────────────────────────────────────────────

const __filename_ = fileURLToPath(import.meta.url);
const __dirname_ = dirname(__filename_);
const testImagesDir = resolve(__dirname_, 'test-images');

/** Discover all test images from the test-images/ folder using the filesystem. */
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|bmp|webp)$/i;
const imageFiles: { name: string; absolutePath: string }[] = (() => {
    try {
        return readdirSync(testImagesDir)
            .filter((f) => IMAGE_EXTENSIONS.test(f))
            .map((f) => ({ name: f, absolutePath: resolve(testImagesDir, f) }));
    } catch {
        return [];
    }
})();

/** Load an image from an absolute file path into ImageData using sharp. */
async function loadImageData(absolutePath: string): Promise<ImageData> {
    const image = sharp(absolutePath).ensureAlpha();
    const { width, height } = await image.metadata();
    if (!width || !height) throw new Error(`Could not read dimensions of ${absolutePath}`);
    const rawBuffer = await image.raw().toBuffer();
    const clampedArray = new Uint8ClampedArray(rawBuffer.buffer, rawBuffer.byteOffset, rawBuffer.byteLength);
    return new ImageData(clampedArray, width, height);
}

// ─── Collect image entries ──────────────────────────────────────────────────

const imageEntries = imageFiles.map(({ name, absolutePath }) => ({
    name,
    url: absolutePath,
}));

// ─── Build the flat list of all test combos ─────────────────────────────────

type TestCombo = {
    /** Display label for test.each */
    label: string;
    imageName: string;
    imageUrl: string;
    pipelineSteps: StepFactory[];
    pipelineName: string;
    params: PipelineParams;
};

const allTestCombos: TestCombo[] = [];

for (const entry of imageEntries) {
    // Raw (no preprocessing) test per image
    allTestCombos.push({
        label: `${entry.name} | (raw — no preprocessing)`,
        imageName: entry.name,
        imageUrl: entry.url,
        pipelineSteps: [],
        pipelineName: '(raw — no preprocessing)',
        params: { wbStrength: 0, contrastStrength: 0, threshold: 0 },
    });

    // All pipeline × params combos
    for (const pipelineSteps of allPipelinePerms) {
        for (const params of paramCombos) {
            const pipelineName = pipelineSteps.map(s => s.name).join(' → ');
            allTestCombos.push({
                label: `${entry.name} | ${pipelineName} | wb=${params.wbStrength} con=${params.contrastStrength} thr=${params.threshold}`,
                imageName: entry.name,
                imageUrl: entry.url,
                pipelineSteps,
                pipelineName,
                params,
            });
        }
    }
}

// ─── Shared results array (module-scoped, collected in afterAll) ────────────

const allResults: DecodeResult[] = [];

// ─── Counters for minimal progress reporting ────────────────────────────────

// (counts tracked via allResults in afterAll)


// ─── Image cache to avoid re-fetching per combo ────────────────────────────

const imageCache = new Map<string, Promise<ImageData>>();

function getImageData(url: string): Promise<ImageData> {
    let cached = imageCache.get(url);
    if (!cached) {
        cached = loadImageData(url);
        imageCache.set(url, cached);
    }
    return cached;
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Real-image barcode preprocessing pipeline', () => {

    if (imageEntries.length === 0) {
        test('⚠️  No test images found — add .png/.jpg/.jpeg/.bmp/.webp files to test-images/', () => {
            console.log('No images found in test-images/ folder. Drop barcode photos there and re-run.');
            expect(true).toBe(true);
        });
    } else {
        console.log(`📸 ${imageEntries.length} images, ${allPipelinePerms.length} pipelines × ${paramCombos.length} params = ${allTestCombos.length} combos`);

        // Each combo is its own concurrent test — Vitest parallelises these
        test.concurrent.each(
            allTestCombos.map(combo => [combo.label, combo] as const),
        )(
            '%s',
            async (_label, combo) => {
                const imageData = await getImageData(combo.imageUrl);
                expect(imageData.width).toBeGreaterThan(0);
                expect(imageData.height).toBeGreaterThan(0);

                // Apply preprocessing pipeline (if any)
                let processed = imageData;
                if (combo.pipelineSteps.length > 0) {
                    const steps = combo.pipelineSteps.map(sf => sf.build(combo.params));
                    for (const step of steps) {
                        processed = step(processed);
                    }
                }

                // Attempt barcode decoding
                let decoded = false;
                let decodedText: string | null = null;
                try {
                    const barcodeResults = await readBarcodes(processed, READER_OPTIONS);
                    if (barcodeResults.length > 0) {
                        decoded = true;
                        decodedText = barcodeResults[0].text;
                    }
                } catch {
                    // decode failed — that's fine
                }

                const result: DecodeResult = {
                    imageName: combo.imageName,
                    pipeline: combo.pipelineName,
                    wbStrength: combo.params.wbStrength,
                    contrastStrength: combo.params.contrastStrength,
                    threshold: combo.params.threshold,
                    decoded,
                    decodedText,
                };

                allResults.push(result);

                // Soft assertion — we don't fail the test if decoding fails
                expect(imageData.width).toBeGreaterThan(0);
            },
            120_000, // 2 min per individual combo should be plenty
        );

        // ─── Summary (runs after all concurrent tests complete) ─────────

        afterAll(async () => {
            if (allResults.length === 0) {
                console.log('⚠️  No results collected.');
                return;
            }

            // Write full results to file — avoids sending megabytes over WebSocket/IPC
            try {
                const { writeFileSync } = await import('fs');
                writeFileSync(
                    './barcode-results.json',
                    JSON.stringify(allResults, null, 2),
                );
                console.log(`📁 Full results written to barcode-results.json`);
            } catch {
                // fs may not be available in browser mode — that's OK
                console.log('⚠️  Could not write results file (browser mode). See summary below.');
            }

            // Print only a compact summary (keeps IPC payload small)
            const decoded = allResults.filter(r => r.decoded);
            console.log(`✅ ${decoded.length}/${allResults.length} decoded (${((decoded.length / allResults.length) * 100).toFixed(1)}%)`);

            const imageNames = [...new Set(allResults.map(r => r.imageName))];
            for (const imgName of imageNames) {
                const imgResults = allResults.filter(r => r.imageName === imgName);
                const imgDecoded = imgResults.filter(r => r.decoded);
                const status = imgDecoded.length > 0 ? '✅' : '❌';
                console.log(`  ${status} ${imgName}: ${imgDecoded.length}/${imgResults.length}`);
            }
        });
    }
});

