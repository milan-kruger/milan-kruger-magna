/**
 * Composable image preprocessing steps for barcode scanning.
 *
 * Each function takes an ImageData and returns a **new** ImageData (non-mutating).
 * Steps can be chained in any order to explore which pipeline works best
 * under different lighting / resolution conditions.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export type ChannelMinMax = {
    minR: number; maxR: number;
    minG: number; maxG: number;
    minB: number; maxB: number;
};

// ─── Step 0: Channel statistics ─────────────────────────────────────────────

/** Scan every pixel and return the per-channel min / max values. */
export function findChannelMinMax(data: Uint8ClampedArray): ChannelMinMax {
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r < minR) minR = r; if (r > maxR) maxR = r;
        if (g < minG) minG = g; if (g > maxG) maxG = g;
        if (b < minB) minB = b; if (b > maxB) maxB = b;
    }

    return { minR, maxR, minG, maxG, minB, maxB };
}

// ─── Step 1: White-balance ──────────────────────────────────────────────────

/**
 * Per-channel histogram stretch: map each R, G, B channel from its own
 * [min…max] range to [0…255].  This neutralises colour casts from
 * warm / cool / fluorescent lighting.
 *
 * @param strength 1.0 = full stretch, <1 = softer, >1 = overshoot
 *                 (clips to 0–255 regardless)
 */
export function whiteBalance(
    imageData: ImageData,
    minMax?: ChannelMinMax,
    strength: number = 1.0,
): ImageData {
    const { data, width, height } = imageData;
    const mm = minMax ?? findChannelMinMax(data);

    const rangeR = mm.maxR - mm.minR;
    const rangeG = mm.maxG - mm.minG;
    const rangeB = mm.maxB - mm.minB;
    const scaleR = rangeR > 1 ? (255 / rangeR) * strength : 1;
    const scaleG = rangeG > 1 ? (255 / rangeG) * strength : 1;
    const scaleB = rangeB > 1 ? (255 / rangeB) * strength : 1;

    const out = new ImageData(new Uint8ClampedArray(data), width, height);
    const d = out.data;

    for (let i = 0; i < d.length; i += 4) {
        d[i]     = clamp((d[i]     - mm.minR) * scaleR);
        d[i + 1] = clamp((d[i + 1] - mm.minG) * scaleG);
        d[i + 2] = clamp((d[i + 2] - mm.minB) * scaleB);
    }

    return out;
}

// ─── Step 2: Greyscale ──────────────────────────────────────────────────────

/** Convert to greyscale using ITU-R BT.709 luminance weights. */
export function toGreyscale(imageData: ImageData): ImageData {
    const { data, width, height } = imageData;
    const out = new ImageData(new Uint8ClampedArray(data), width, height);
    const d = out.data;

    for (let i = 0; i < d.length; i += 4) {
        const lum = clamp(0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]);
        d[i] = d[i + 1] = d[i + 2] = lum;
    }

    return out;
}

// ─── Step 3: S-curve contrast ───────────────────────────────────────────────

/**
 * Apply an S-curve to the luminance channel to widen the gap between
 * dark and light pixels.
 *
 * @param strength 0 = no change, 1 = full S-curve
 */
export function applySCurveContrast(imageData: ImageData, strength: number = 0.5): ImageData {
    const { data, width, height } = imageData;
    const out = new ImageData(new Uint8ClampedArray(data), width, height);
    const d = out.data;

    for (let i = 0; i < d.length; i += 4) {
        d[i]     = sCurveChannel(d[i], strength);
        d[i + 1] = sCurveChannel(d[i + 1], strength);
        d[i + 2] = sCurveChannel(d[i + 2], strength);
    }

    return out;
}

function sCurveChannel(value: number, strength: number): number {
    const norm = value / 255;
    const curved = norm < 0.5
        ? 2 * norm * norm
        : 1 - 2 * (1 - norm) * (1 - norm);
    return clamp((norm + (curved - norm) * strength) * 255);
}

// ─── Step 4: Binary threshold ───────────────────────────────────────────────

/**
 * Hard black/white threshold — every pixel becomes 0 or 255.
 *
 * @param threshold cut-off value (0–255, default 128)
 */
export function applyBinaryThreshold(imageData: ImageData, threshold: number = 128): ImageData {
    const { data, width, height } = imageData;
    const out = new ImageData(new Uint8ClampedArray(data), width, height);
    const d = out.data;

    for (let i = 0; i < d.length; i += 4) {
        const v = (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) < threshold ? 0 : 255;
        d[i] = d[i + 1] = d[i + 2] = v;
    }

    return out;
}

// ─── Orchestrator (used at runtime) ─────────────────────────────────────────

/**
 * Cycling preprocessor used in the live scan loop.
 *
 *  Level 0 – raw pass-through
 *  Level 1 – white-balance + greyscale
 *  Level 2 – white-balance + greyscale + S-curve (gentle)
 *  Level 3 – white-balance + greyscale + S-curve (heavy) + binary threshold
 */
export const GREYSCALE_LEVELS = 4;

export function preprocessGreyscale(imageData: ImageData, failedAttempts: number): ImageData {
    const level = failedAttempts % GREYSCALE_LEVELS;

    if (level === 0) return imageData;

    const minMax = findChannelMinMax(imageData.data);
    let result = whiteBalance(imageData, minMax);
    result = toGreyscale(result);

    if (level >= 2) {
        const strength = level === 2 ? 0.5 : 1.0;
        result = applySCurveContrast(result, strength);
    }

    if (level >= 3) {
        result = applyBinaryThreshold(result);
    }

    return result;
}

// ─── Utility ────────────────────────────────────────────────────────────────

function clamp(v: number): number {
    return v < 0 ? 0 : v > 255 ? 255 : v;
}

