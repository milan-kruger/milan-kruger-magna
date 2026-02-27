/**
 * Exhaustive combinatorial test suite for barcode image preprocessing.
 *
 * This test is designed for the develop branch — execution time is irrelevant.
 * It systematically tries every meaningful combination of:
 *
 *   • Resolutions        – 160×100, 320×200, 640×400, 1280×800, 1920×1080
 *   • Lighting casts     – neutral, warm (tungsten), cool (fluorescent), harsh (sodium)
 *   • Pipeline orderings – greyscale→whiteBalance, whiteBalance→greyscale, etc.
 *   • White-balance str. – 0.8, 1.0, 1.2, 1.5, 2.0
 *   • Contrast strengths – 0.25, 0.5, 0.75, 1.0
 *   • Threshold values   – 96, 112, 128, 144, 160, 192
 *
 * Success is measured by how well the pipeline separates the "black" bars from
 * the "white" background: mean luminance of known-white regions should be ≥ 200,
 * mean luminance of known-black regions should be ≤ 55.
 *
 * A summary matrix is logged at the end of each describe block.
 */

import { describe, test, expect } from 'vitest';
import {
    findChannelMinMax,
    whiteBalance,
    toGreyscale,
    applySCurveContrast,
    applyBinaryThreshold,
    preprocessGreyscale,
    GREYSCALE_LEVELS,
} from './imagePreprocessing';

// ─── Test image helpers ─────────────────────────────────────────────────────

type ColourCast = {
    name: string;
    r: number;  // multiplier 0–1
    g: number;
    b: number;
};

const COLOUR_CASTS: ColourCast[] = [
    { name: 'neutral',         r: 1.0,  g: 1.0,  b: 1.0  },
    { name: 'warm-tungsten',   r: 1.0,  g: 0.85, b: 0.65 },
    { name: 'cool-fluorescent',r: 0.75, g: 0.9,  b: 1.0  },
    { name: 'harsh-sodium',    r: 1.0,  g: 0.78, b: 0.4  },
];

const RESOLUTIONS: [number, number][] = [
    [160, 100],
    [320, 200],
    [640, 400],
    [1280, 800],
    [1920, 1080],
];

/**
 * Build a synthetic barcode-like image: vertical stripes alternating black and
 * white in bands of varying width (mimics PDF417 bar structure).
 *
 * Returns the raw ImageData AND arrays of x-coordinates that are known to be
 * "black bar" columns vs "white gap" columns so we can measure contrast after
 * preprocessing.
 */
function generateBarcodeImage(
    width: number,
    height: number,
    cast: ColourCast,
): { imageData: ImageData; blackCols: number[]; whiteCols: number[] } {
    const data = new Uint8ClampedArray(width * height * 4);
    const blackCols: number[] = [];
    const whiteCols: number[] = [];

    // Bar pattern: repeat groups of [black, black, white, black, white, white, white]
    const pattern = [0, 0, 255, 0, 255, 255, 255]; // 0 = black, 255 = white

    for (let x = 0; x < width; x++) {
        const isBlack = pattern[x % pattern.length] === 0;
        const baseR = isBlack ? 0 : 255;
        const baseG = isBlack ? 0 : 255;
        const baseB = isBlack ? 0 : 255;

        // Apply colour cast (simulating lighting conditions)
        const r = Math.round(baseR * cast.r);
        const g = Math.round(baseG * cast.g);
        const b = Math.round(baseB * cast.b);

        if (isBlack) blackCols.push(x);
        else whiteCols.push(x);

        for (let y = 0; y < height; y++) {
            const idx = (y * width + x) * 4;
            data[idx]     = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
            data[idx + 3] = 255;
        }
    }

    return { imageData: new ImageData(data, width, height), blackCols, whiteCols };
}

/** Sample the average luminance of specific columns across all rows. */
function sampleColumnLuminance(imageData: ImageData, cols: number[]): number {
    const { data, width, height } = imageData;
    let sum = 0;
    let count = 0;

    for (const x of cols) {
        for (let y = 0; y < height; y++) {
            const idx = (y * width + x) * 4;
            const lum = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
            sum += lum;
            count++;
        }
    }

    return count > 0 ? sum / count : 0;
}

// ─── Pipeline step definitions ──────────────────────────────────────────────

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

const WB_STRENGTHS      = [0.8, 1.0, 1.2, 1.5, 2.0];
const CONTRAST_STRENGTHS = [0.25, 0.5, 0.75, 1.0];
const THRESHOLDS         = [96, 112, 128, 144, 160, 192];

// ─── Unit tests for individual steps ────────────────────────────────────────

describe('imagePreprocessing – unit tests', () => {

    /** Helper: 2×2 RGBA ImageData from four [R,G,B] pixels. */
    function make2x2(...pixels: [number, number, number][]): ImageData {
        const data = new Uint8ClampedArray(16);
        pixels.forEach(([r, g, b], i) => {
            data[i * 4]     = r;
            data[i * 4 + 1] = g;
            data[i * 4 + 2] = b;
            data[i * 4 + 3] = 255;
        });
        return new ImageData(data, 2, 2);
    }

    test('findChannelMinMax – finds correct per-channel extremes', () => {
        const img = make2x2([10, 50, 200], [240, 30, 180], [100, 220, 5], [60, 90, 130]);
        const mm = findChannelMinMax(img.data);
        expect(mm.minR).toBe(10);  expect(mm.maxR).toBe(240);
        expect(mm.minG).toBe(30);  expect(mm.maxG).toBe(220);
        expect(mm.minB).toBe(5);   expect(mm.maxB).toBe(200);
    });

    test('whiteBalance – stretches channels to full range', () => {
        // Warm-cast "white" (240, 210, 160) and "black" (20, 15, 10)
        const img = make2x2([240, 210, 160], [20, 15, 10], [240, 210, 160], [20, 15, 10]);
        const result = whiteBalance(img);
        const d = result.data;
        // The brightest pixel should be close to 255,255,255
        expect(d[0]).toBeGreaterThanOrEqual(250);
        expect(d[1]).toBeGreaterThanOrEqual(250);
        expect(d[2]).toBeGreaterThanOrEqual(250);
        // The darkest pixel should be close to 0,0,0
        expect(d[4]).toBeLessThanOrEqual(5);
        expect(d[5]).toBeLessThanOrEqual(5);
        expect(d[6]).toBeLessThanOrEqual(5);
    });

    test('whiteBalance – strength > 1 over-stretches', () => {
        const img = make2x2([200, 200, 200], [50, 50, 50], [200, 200, 200], [50, 50, 50]);
        const result = whiteBalance(img, undefined, 2.0);
        const d = result.data;
        // Bright pixel should still be clamped to 255
        expect(d[0]).toBe(255);
        // Dark pixel should clamp to 0
        expect(d[4]).toBe(0);
    });

    test('toGreyscale – produces uniform R=G=B', () => {
        const img = make2x2([255, 0, 0], [0, 255, 0], [0, 0, 255], [128, 128, 128]);
        const result = toGreyscale(img);
        const d = result.data;
        for (let i = 0; i < 16; i += 4) {
            expect(d[i]).toBe(d[i + 1]);
            expect(d[i + 1]).toBe(d[i + 2]);
        }
    });

    test('toGreyscale – pure red has lower luminance than pure green', () => {
        const img = make2x2([255, 0, 0], [0, 255, 0], [0, 0, 0], [0, 0, 0]);
        const result = toGreyscale(img);
        const redLum = result.data[0];
        const greenLum = result.data[4];
        expect(greenLum).toBeGreaterThan(redLum);
    });

    test('applySCurveContrast – strength 0 returns near-identical values', () => {
        const img = make2x2([100, 100, 100], [200, 200, 200], [50, 50, 50], [150, 150, 150]);
        const result = applySCurveContrast(img, 0);
        const d = result.data;
        expect(d[0]).toBe(100);
        expect(d[4]).toBe(200);
    });

    test('applySCurveContrast – strength 1 pushes darks darker and lights lighter', () => {
        const img = make2x2([80, 80, 80], [200, 200, 200], [80, 80, 80], [200, 200, 200]);
        const result = applySCurveContrast(img, 1.0);
        expect(result.data[0]).toBeLessThan(80);    // dark got darker
        expect(result.data[4]).toBeGreaterThan(200); // light got lighter
    });

    test('applyBinaryThreshold – produces only 0 and 255', () => {
        const img = make2x2([50, 50, 50], [200, 200, 200], [127, 127, 127], [129, 129, 129]);
        const result = applyBinaryThreshold(img, 128);
        const d = result.data;
        for (let i = 0; i < 16; i += 4) {
            expect(d[i] === 0 || d[i] === 255).toBe(true);
        }
    });

    test('applyBinaryThreshold – low threshold makes more white', () => {
        const img = make2x2([100, 100, 100], [100, 100, 100], [100, 100, 100], [100, 100, 100]);
        const low = applyBinaryThreshold(img, 50);
        const high = applyBinaryThreshold(img, 150);
        expect(low.data[0]).toBe(255);   // 100 > 50 → white
        expect(high.data[0]).toBe(0);    // 100 < 150 → black
    });

    test('alpha channel is preserved through every step', () => {
        const data = new Uint8ClampedArray([100, 150, 200, 42, 50, 60, 70, 99, 0, 0, 0, 0, 255, 255, 255, 200]);
        const img = new ImageData(data, 2, 2);

        const steps: ((i: ImageData) => ImageData)[] = [
            (i) => whiteBalance(i),
            (i) => toGreyscale(i),
            (i) => applySCurveContrast(i, 0.5),
            (i) => applyBinaryThreshold(i),
        ];

        for (const step of steps) {
            const result = step(img);
            expect(result.data[3]).toBe(42);
            expect(result.data[7]).toBe(99);
            expect(result.data[11]).toBe(0);
            expect(result.data[15]).toBe(200);
        }
    });
});

// ─── Orchestrator regression tests ──────────────────────────────────────────

describe('imagePreprocessing – preprocessGreyscale orchestrator', () => {

    test('level 0 returns identical reference', () => {
        const img = new ImageData(new Uint8ClampedArray(16), 2, 2);
        const result = preprocessGreyscale(img, 0);
        expect(result).toBe(img); // same reference
    });

    test('cycles every GREYSCALE_LEVELS attempts', () => {
        const img = new ImageData(new Uint8ClampedArray([200, 180, 100, 255, 20, 15, 10, 255, 200, 180, 100, 255, 20, 15, 10, 255]), 2, 2);
        const result0 = preprocessGreyscale(img, 0);
        const result4 = preprocessGreyscale(img, GREYSCALE_LEVELS);
        // Both level-0 → same data
        expect(result0).toBe(img);
        expect(result4).toBe(img);
    });

    test.each(COLOUR_CASTS.map(c => [c.name, c] as const))(
        'all 4 levels produce greyscale output for %s lighting',
        (_name, cast) => {
            const { imageData } = generateBarcodeImage(100, 20, cast);
            for (let level = 1; level < GREYSCALE_LEVELS; level++) {
                const result = preprocessGreyscale(imageData, level);
                // Spot-check: R === G === B for every pixel
                for (let i = 0; i < result.data.length; i += 4) {
                    expect(result.data[i]).toBe(result.data[i + 1]);
                    expect(result.data[i + 1]).toBe(result.data[i + 2]);
                }
            }
        },
    );

    test('higher levels produce more contrast (or equal) than lower levels', () => {
        const { imageData, blackCols, whiteCols } = generateBarcodeImage(200, 40, COLOUR_CASTS[1]); // warm
        const contrasts: number[] = [];

        for (let level = 1; level < GREYSCALE_LEVELS; level++) {
            const result = preprocessGreyscale(imageData, level);
            const whiteLum = sampleColumnLuminance(result, whiteCols);
            const blackLum = sampleColumnLuminance(result, blackCols);
            contrasts.push(whiteLum - blackLum);
        }

        // Each successive level should produce >= contrast than the previous
        for (let i = 1; i < contrasts.length; i++) {
            expect(contrasts[i]).toBeGreaterThanOrEqual(contrasts[i - 1] - 1); // 1px tolerance
        }
    });
});

// ─── Exhaustive combinatorial pipeline tests ────────────────────────────────

describe('imagePreprocessing – combinatorial pipeline exploration', () => {

    // We generate all permutations of 2-step pipelines (wb + grey ordering),
    // 3-step pipelines (+ contrast), and 4-step pipelines (+ threshold).
    // For each we try every parameter combination × resolution × colour cast.

    type PipelineResult = {
        resolution: string;
        cast: string;
        pipeline: string;
        wbStrength: number;
        contrastStrength: number;
        threshold: number;
        whiteMeanLum: number;
        blackMeanLum: number;
        separation: number;
        pass: boolean;
    };

    const allResults: PipelineResult[] = [];

    // Build pipeline subsets of different lengths
    const twoStepPerms = permutations([STEP_FACTORIES[0], STEP_FACTORIES[1]]);           // wb, grey
    const threeStepPerms = permutations([STEP_FACTORIES[0], STEP_FACTORIES[1], STEP_FACTORIES[2]]); // + contrast
    const fourStepPerms = permutations(STEP_FACTORIES);                                    // all 4

    const allPipelinePerms = [...twoStepPerms, ...threeStepPerms, ...fourStepPerms];

    // Use a representative subset of parameter combos to keep test count manageable
    // but still cover the full range.
    const paramCombos: PipelineParams[] = [];
    for (const wbStrength of WB_STRENGTHS) {
        for (const contrastStrength of CONTRAST_STRENGTHS) {
            for (const threshold of THRESHOLDS) {
                paramCombos.push({ wbStrength, contrastStrength, threshold });
            }
        }
    }

    // Build the test matrix
    const testCases: {
        label: string;
        resolution: [number, number];
        cast: ColourCast;
        pipelineSteps: StepFactory[];
        params: PipelineParams;
    }[] = [];

    for (const resolution of RESOLUTIONS) {
        for (const cast of COLOUR_CASTS) {
            for (const pipelineSteps of allPipelinePerms) {
                for (const params of paramCombos) {
                    const pipelineName = pipelineSteps.map(s => s.name).join(' → ');
                    testCases.push({
                        label: `${resolution[0]}×${resolution[1]} | ${cast.name} | ${pipelineName} | wb=${params.wbStrength} con=${params.contrastStrength} thr=${params.threshold}`,
                        resolution,
                        cast,
                        pipelineSteps,
                        params,
                    });
                }
            }
        }
    }

    // Run all combinations inside batched tests (one per resolution) to avoid
    // exceeding the WebSocket payload limit that test.each with 76k entries triggers.
    test.each(RESOLUTIONS.map(r => [`${r[0]}×${r[1]}`, r] as const))(
        'all combos at %s',
        (_label, resolution) => {
            const casesForRes = testCases.filter(tc => tc.resolution === resolution);
            console.log(`\n📊 Testing ${casesForRes.length} pipeline combinations at ${_label}\n`);

            for (const tc of casesForRes) {
                const { imageData, blackCols, whiteCols } = generateBarcodeImage(
                    tc.resolution[0],
                    tc.resolution[1],
                    tc.cast,
                );

                // Build and execute the pipeline
                const steps = tc.pipelineSteps.map(sf => sf.build(tc.params));
                let result = imageData;
                for (const step of steps) {
                    result = step(result);
                }

                // Measure separation
                const whiteMeanLum = sampleColumnLuminance(result, whiteCols);
                const blackMeanLum = sampleColumnLuminance(result, blackCols);
                const separation = whiteMeanLum - blackMeanLum;
                const pass = whiteMeanLum >= 200 && blackMeanLum <= 55;

                allResults.push({
                    resolution: `${tc.resolution[0]}×${tc.resolution[1]}`,
                    cast: tc.cast.name,
                    pipeline: tc.pipelineSteps.map(s => s.name).join(' → '),
                    wbStrength: tc.params.wbStrength,
                    contrastStrength: tc.params.contrastStrength,
                    threshold: tc.params.threshold,
                    whiteMeanLum: Math.round(whiteMeanLum * 100) / 100,
                    blackMeanLum: Math.round(blackMeanLum * 100) / 100,
                    separation: Math.round(separation * 100) / 100,
                    pass,
                });

                // Assert that the pipeline doesn't crash and produces valid pixel data
                expect(result.width).toBe(tc.resolution[0]);
                expect(result.height).toBe(tc.resolution[1]);
                expect(result.data.length).toBe(tc.resolution[0] * tc.resolution[1] * 4);

                // Pixel values must be in valid range
                for (let i = 0; i < result.data.length; i++) {
                    expect(result.data[i]).toBeGreaterThanOrEqual(0);
                    expect(result.data[i]).toBeLessThanOrEqual(255);
                }
            }
        },
        // Generous timeout for large resolutions
        120_000,
    );

    // After all tests, log a summary
    describe('summary', () => {
        test('log results matrix', () => {
            const passed = allResults.filter(r => r.pass);
            const failed = allResults.filter(r => !r.pass);

            console.log('\n' + '═'.repeat(100));
            console.log('PREPROCESSING PIPELINE RESULTS SUMMARY');
            console.log('═'.repeat(100));
            console.log(`Total combos tested : ${allResults.length}`);
            console.log(`PASS (white≥200 & black≤55) : ${passed.length}`);
            console.log(`FAIL                        : ${failed.length}`);
            console.log('─'.repeat(100));

            // Best combos by separation
            const sorted = [...allResults].sort((a, b) => b.separation - a.separation);
            console.log('\n🏆 TOP 20 BEST SEPARATION:');
            console.log(
                '  ' +
                'Resolution'.padEnd(12) +
                'Cast'.padEnd(18) +
                'Pipeline'.padEnd(52) +
                'WB'.padEnd(6) +
                'Con'.padEnd(6) +
                'Thr'.padEnd(6) +
                'White'.padEnd(9) +
                'Black'.padEnd(9) +
                'Sep'.padEnd(9) +
                'Pass',
            );
            for (const r of sorted.slice(0, 20)) {
                console.log(
                    '  ' +
                    r.resolution.padEnd(12) +
                    r.cast.padEnd(18) +
                    r.pipeline.padEnd(52) +
                    String(r.wbStrength).padEnd(6) +
                    String(r.contrastStrength).padEnd(6) +
                    String(r.threshold).padEnd(6) +
                    String(r.whiteMeanLum).padEnd(9) +
                    String(r.blackMeanLum).padEnd(9) +
                    String(r.separation).padEnd(9) +
                    (r.pass ? '✅' : '❌'),
                );
            }

            // Worst 10 that still passed
            const worstPassing = sorted.filter(r => r.pass).slice(-10);
            if (worstPassing.length > 0) {
                console.log('\n⚠️  BOTTOM 10 PASSING COMBOS (worst separation that still passes):');
                for (const r of worstPassing) {
                    console.log(
                        '  ' +
                        r.resolution.padEnd(12) +
                        r.cast.padEnd(18) +
                        r.pipeline.padEnd(52) +
                        `wb=${r.wbStrength} con=${r.contrastStrength} thr=${r.threshold}  ` +
                        `W=${r.whiteMeanLum} B=${r.blackMeanLum} sep=${r.separation}`,
                    );
                }
            }

            // Group pass-rate by pipeline ordering
            const byPipeline = new Map<string, { pass: number; total: number }>();
            for (const r of allResults) {
                const entry = byPipeline.get(r.pipeline) ?? { pass: 0, total: 0 };
                entry.total++;
                if (r.pass) entry.pass++;
                byPipeline.set(r.pipeline, entry);
            }
            console.log('\n📋 PASS RATE BY PIPELINE ORDERING:');
            const pipelineEntries = [...byPipeline.entries()].sort(
                (a, b) => (b[1].pass / b[1].total) - (a[1].pass / a[1].total),
            );
            for (const [pipeline, stats] of pipelineEntries) {
                const rate = ((stats.pass / stats.total) * 100).toFixed(1);
                console.log(`  ${pipeline.padEnd(52)} ${stats.pass}/${stats.total} (${rate}%)`);
            }

            // Group pass-rate by cast
            const byCast = new Map<string, { pass: number; total: number }>();
            for (const r of allResults) {
                const entry = byCast.get(r.cast) ?? { pass: 0, total: 0 };
                entry.total++;
                if (r.pass) entry.pass++;
                byCast.set(r.cast, entry);
            }
            console.log('\n🔆 PASS RATE BY LIGHTING CONDITION:');
            for (const [cast, stats] of byCast) {
                const rate = ((stats.pass / stats.total) * 100).toFixed(1);
                console.log(`  ${cast.padEnd(20)} ${stats.pass}/${stats.total} (${rate}%)`);
            }

            // Group pass-rate by white-balance strength
            const byWb = new Map<number, { pass: number; total: number }>();
            for (const r of allResults) {
                const entry = byWb.get(r.wbStrength) ?? { pass: 0, total: 0 };
                entry.total++;
                if (r.pass) entry.pass++;
                byWb.set(r.wbStrength, entry);
            }
            console.log('\n⚖️  PASS RATE BY WHITE-BALANCE STRENGTH:');
            for (const [wb, stats] of [...byWb.entries()].sort((a, b) => a[0] - b[0])) {
                const rate = ((stats.pass / stats.total) * 100).toFixed(1);
                console.log(`  strength=${wb}  ${stats.pass}/${stats.total} (${rate}%)`);
            }

            console.log('\n' + '═'.repeat(100));

            // This test always passes — it's for logging
            expect(allResults.length).toBeGreaterThan(0);
        });
    });
});

