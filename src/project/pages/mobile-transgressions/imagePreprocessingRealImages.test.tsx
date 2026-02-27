/**
 * Real-image barcode preprocessing test suite.
 *
 * Drop real barcode photos (.png, .jpg, .jpeg, .bmp, .webp) into the
 * `test-images/` folder next to this file. This test will:
 *
 *  1. Load every image from that folder
 *  2. Run curated preprocessing pipelines with relevant parameter combos
 *  3. Write full results to `barcode-results.json` (no large console output)
 *  4. Print only a compact summary to avoid WebSocket payload limits
 *
 * By default uses a curated set of ~8 pipelines with coarse parameter grids
 * and early-exits after finding successful decodes per image (~50–100× faster).
 *
 * For full brute-force research, set FULL_SWEEP=true:
 *   FULL_SWEEP=true npm run barcode:research
 *
 * Run with:
 *   npm run barcode:research
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

// ─── Config: FULL_SWEEP mode ────────────────────────────────────────────────

const FULL_SWEEP = process.env.FULL_SWEEP === 'true';

/** Max successful decodes per image before skipping remaining combos. 0 = no limit. */
const EARLY_EXIT_COUNT = FULL_SWEEP ? 0 : 5;

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

const WB_STEP: StepFactory = {
    name: 'whiteBalance',
    build: (p) => (img) => whiteBalance(img, undefined, p.wbStrength),
};

const GREY_STEP: StepFactory = {
    name: 'greyscale',
    build: () => (img) => toGreyscale(img),
};

const CONTRAST_STEP: StepFactory = {
    name: 'contrast',
    build: (p) => (img) => applySCurveContrast(img, p.contrastStrength),
};

const THRESHOLD_STEP: StepFactory = {
    name: 'threshold',
    build: (p) => (img) => applyBinaryThreshold(img, p.threshold),
};

// ─── Curated pipelines (replaces all-permutations brute force) ──────────────

type Pipeline = { name: string; steps: StepFactory[] };

const CURATED_PIPELINES: Pipeline[] = [
    { name: 'greyscale',                                   steps: [GREY_STEP] },
    { name: 'whiteBalance → greyscale',                    steps: [WB_STEP, GREY_STEP] },
    { name: 'greyscale → contrast',                        steps: [GREY_STEP, CONTRAST_STEP] },
    { name: 'whiteBalance → greyscale → contrast',         steps: [WB_STEP, GREY_STEP, CONTRAST_STEP] },
    { name: 'greyscale → threshold',                       steps: [GREY_STEP, THRESHOLD_STEP] },
    { name: 'greyscale → contrast → threshold',            steps: [GREY_STEP, CONTRAST_STEP, THRESHOLD_STEP] },
    { name: 'whiteBalance → greyscale → contrast → threshold', steps: [WB_STEP, GREY_STEP, CONTRAST_STEP, THRESHOLD_STEP] },
    { name: 'contrast → greyscale → threshold',            steps: [CONTRAST_STEP, GREY_STEP, THRESHOLD_STEP] },
];

// ─── Parameter ranges ───────────────────────────────────────────────────────

const WB_STRENGTHS       = FULL_SWEEP ? [0.8, 1.0, 1.2, 1.5, 2.0] : [1.0, 1.5, 2.0];
const CONTRAST_STRENGTHS = FULL_SWEEP ? [0.25, 0.5, 0.75, 1.0]     : [0.25, 0.5, 1.0];
const THRESHOLDS         = FULL_SWEEP ? [96, 112, 128, 144, 160, 192] : [96, 128, 160];

// ─── Build relevant parameter combos per pipeline ───────────────────────────

function buildParamCombos(pipeline: Pipeline): PipelineParams[] {
    const stepNames = new Set(pipeline.steps.map(s => s.name));
    const wbValues       = stepNames.has('whiteBalance') ? WB_STRENGTHS       : [1.0];
    const contrastValues = stepNames.has('contrast')     ? CONTRAST_STRENGTHS : [0.5];
    const thresholdValues = stepNames.has('threshold')   ? THRESHOLDS         : [128];

    const combos: PipelineParams[] = [];
    for (const wbStrength of wbValues) {
        for (const contrastStrength of contrastValues) {
            for (const threshold of thresholdValues) {
                combos.push({ wbStrength, contrastStrength, threshold });
            }
        }
    }
    return combos;
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
    const arrayBuffer = rawBuffer.buffer.slice(rawBuffer.byteOffset, rawBuffer.byteOffset + rawBuffer.byteLength) as ArrayBuffer;
    const clampedArray = new Uint8ClampedArray(arrayBuffer);
    return new ImageData(clampedArray, width, height);
}

// ─── Collect image entries ──────────────────────────────────────────────────

const imageEntries = imageFiles.map(({ name, absolutePath }) => ({
    name,
    url: absolutePath,
}));

// ─── Count total combos for logging ─────────────────────────────────────────

const totalCombosPerImage = 1 /* raw */ + CURATED_PIPELINES.reduce(
    (sum, p) => sum + buildParamCombos(p).length, 0,
);

// ─── Shared results array (module-scoped, collected in afterAll) ────────────

const allResults: DecodeResult[] = [];

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('Real-image barcode preprocessing pipeline', () => {

    if (imageEntries.length === 0) {
        test('⚠️  No test images found — add .png/.jpg/.jpeg/.bmp/.webp files to test-images/', () => {
            console.log('No images found in test-images/ folder. Drop barcode photos there and re-run.');
            expect(true).toBe(true);
        });
    } else {
        const totalCombos = imageEntries.length * totalCombosPerImage;
        console.log(
            `📸 ${imageEntries.length} images × ${totalCombosPerImage} combos/image = ${totalCombos} combos` +
            (FULL_SWEEP ? ' (FULL_SWEEP)' : ` (early-exit after ${EARLY_EXIT_COUNT} successes/image)`),
        );

        // One test per image — inner loop over pipelines × params with early exit
        test.concurrent.each(
            imageEntries.map(entry => [entry.name, entry] as const),
        )(
            '%s',
            async (_label, entry) => {
                const imageData = await loadImageData(entry.url);
                expect(imageData.width).toBeGreaterThan(0);
                expect(imageData.height).toBeGreaterThan(0);

                const imageResults: DecodeResult[] = [];
                let successCount = 0;

                // Helper: attempt decode and record result; returns true if early-exit triggered
                const tryDecode = async (
                    processed: ImageData,
                    pipelineName: string,
                    params: PipelineParams,
                ): Promise<boolean> => {
                    let decoded = false;
                    let decodedText: string | null = null;
                    try {
                        const barcodeResults = await readBarcodes(processed, READER_OPTIONS);
                        if (barcodeResults.length > 0) {
                            decoded = true;
                            decodedText = barcodeResults[0].text;
                            successCount++;
                        }
                    } catch {
                        // decode failed — that's fine
                    }

                    const result: DecodeResult = {
                        imageName: entry.name,
                        pipeline: pipelineName,
                        wbStrength: params.wbStrength,
                        contrastStrength: params.contrastStrength,
                        threshold: params.threshold,
                        decoded,
                        decodedText,
                    };
                    imageResults.push(result);

                    return EARLY_EXIT_COUNT > 0 && successCount >= EARLY_EXIT_COUNT;
                };

                // 1. Try raw (no preprocessing)
                const rawParams: PipelineParams = { wbStrength: 0, contrastStrength: 0, threshold: 0 };
                let earlyExit = await tryDecode(imageData, '(raw — no preprocessing)', rawParams);

                // 2. Try each curated pipeline × relevant params
                if (!earlyExit) {
                    outer:
                    for (const pipeline of CURATED_PIPELINES) {
                        const paramCombos = buildParamCombos(pipeline);
                        for (const params of paramCombos) {
                            // Apply preprocessing pipeline
                            let processed = imageData;
                            const steps = pipeline.steps.map(sf => sf.build(params));
                            for (const step of steps) {
                                processed = step(processed);
                            }

                            earlyExit = await tryDecode(processed, pipeline.name, params);
                            if (earlyExit) break outer;
                        }
                    }
                }

                // Collect results for the summary
                allResults.push(...imageResults);

                // Log compact per-image status
                const imgDecoded = imageResults.filter(r => r.decoded).length;
                const status = imgDecoded > 0 ? '✅' : '❌';
                const skipped = earlyExit ? ` (early-exit, ${imageResults.length}/${totalCombosPerImage} tested)` : '';
                console.log(`  ${status} ${entry.name}: ${imgDecoded}/${imageResults.length} decoded${skipped}`);
            },
            300_000, // 5 min per image
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

