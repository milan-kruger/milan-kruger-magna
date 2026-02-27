/**
 * Skew detection and correction for PDF417 barcodes.
 *
 * PDF417 has a strong horizontal line structure (stacked rows), making it
 * ideal for projection-profile-based angle detection.  We sweep candidate
 * angles from −15° to +15° and pick the one whose row-projection has the
 * highest variance — that's the angle at which the horizontal bars align.
 *
 * The detection runs on a 4× downsampled greyscale + Sobel-Y edge image
 * so it typically completes in < 10 ms even on mobile devices.
 */

// ─── Constants ──────────────────────────────────────────────────────────────

/** Maximum skew angle we attempt to detect (degrees). */
const MAX_ANGLE_DEG = 15;

/** Angular resolution of the sweep (degrees). */
const ANGLE_STEP_DEG = 0.5;

/** Angles smaller than this are not worth correcting. */
const MIN_CORRECTION_DEG = 0.5;

/** Downsample factor (4 → each dimension is quartered → 16× fewer pixels). */
const DS_FACTOR = 4;

// ─── Detect skew angle ─────────────────────────────────────────────────────

/**
 * Estimate the skew angle (in degrees) of horizontal barcode lines
 * within the image.
 *
 * @returns Angle in degrees.  Positive = clockwise rotation of the barcode
 *          (i.e. we need to rotate the image counter-clockwise by this amount
 *          to deskew it).
 */
export function detectSkewAngle(imageData: ImageData): number {
    const { width, height, data } = imageData;

    // ── 1. Downsample to greyscale ──────────────────────────────────────
    const dsW = Math.floor(width / DS_FACTOR);
    const dsH = Math.floor(height / DS_FACTOR);

    if (dsW < 8 || dsH < 8) return 0; // image too small

    const grey = new Float32Array(dsW * dsH);

    for (let dy = 0; dy < dsH; dy++) {
        const srcRowStart = dy * DS_FACTOR * width;
        for (let dx = 0; dx < dsW; dx++) {
            // Average the DS_FACTOR × DS_FACTOR block
            let sum = 0;
            const srcColStart = dx * DS_FACTOR;
            for (let by = 0; by < DS_FACTOR; by++) {
                const rowOff = (srcRowStart + by * width + srcColStart) * 4;
                for (let bx = 0; bx < DS_FACTOR; bx++) {
                    const px = rowOff + bx * 4;
                    // BT.709 luminance
                    sum += 0.2126 * data[px] + 0.7152 * data[px + 1] + 0.0722 * data[px + 2];
                }
            }
            grey[dy * dsW + dx] = sum / (DS_FACTOR * DS_FACTOR);
        }
    }

    // ── 2. Sobel-Y vertical gradient (highlights horizontal edges) ─────
    const edge = new Float32Array(dsW * dsH);

    for (let y = 1; y < dsH - 1; y++) {
        for (let x = 0; x < dsW; x++) {
            const above = grey[(y - 1) * dsW + x];
            const below = grey[(y + 1) * dsW + x];
            edge[y * dsW + x] = Math.abs(below - above);
        }
    }

    // ── 3. Projection-profile angle sweep ──────────────────────────────
    //
    // For each candidate angle θ we virtually rotate each edge pixel's
    // y-coordinate:  y' = -x·sin(θ) + y·cos(θ)
    // Then we accumulate the edge value into a 1-D row projection.
    // The angle with the sharpest (highest-variance) projection wins.

    const centerX = dsW / 2;
    const centerY = dsH / 2;

    let bestAngle = 0;
    let bestVariance = -1;

    // Pre-compute the number of candidate angles
    const angleCount = Math.floor(2 * MAX_ANGLE_DEG / ANGLE_STEP_DEG) + 1;
    // Projection buffer — reuse across angles
    const maxBins = dsH + dsW; // generous upper-bound
    const proj = new Float64Array(maxBins);
    const projCount = new Float64Array(maxBins);

    for (let ai = 0; ai < angleCount; ai++) {
        const angleDeg = -MAX_ANGLE_DEG + ai * ANGLE_STEP_DEG;
        const angleRad = (angleDeg * Math.PI) / 180;
        const sinA = Math.sin(angleRad);
        const cosA = Math.cos(angleRad);

        // Reset projection
        proj.fill(0);
        projCount.fill(0);

        let usedBins = 0;

        for (let y = 1; y < dsH - 1; y++) {
            const dy = y - centerY;
            for (let x = 0; x < dsW; x++) {
                const e = edge[y * dsW + x];
                if (e < 5) continue; // skip weak edges for speed

                const dx = x - centerX;
                // Rotated y-coordinate → bin index
                const yRot = -dx * sinA + dy * cosA;
                const bin = Math.round(yRot) + maxBins / 2;
                if (bin >= 0 && bin < maxBins) {
                    proj[bin] += e;
                    projCount[bin]++;
                    if (bin >= usedBins) usedBins = bin + 1;
                }
            }
        }

        // Compute variance of the projection (higher = sharper lines)
        let sum = 0;
        let sumSq = 0;
        let n = 0;
        for (let b = 0; b < usedBins; b++) {
            if (projCount[b] > 0) {
                sum += proj[b];
                sumSq += proj[b] * proj[b];
                n++;
            }
        }

        if (n > 1) {
            const mean = sum / n;
            const variance = sumSq / n - mean * mean;
            if (variance > bestVariance) {
                bestVariance = variance;
                bestAngle = angleDeg;
            }
        }
    }

    return bestAngle;
}

// ─── Rotate ImageData ───────────────────────────────────────────────────────

/**
 * Lazily-created offscreen canvases for rotation.
 * `srcCanvas` holds the un-rotated source so we can `drawImage` from it.
 * `dstCanvas` is where the rotated result is rendered.
 */
let srcCanvas: HTMLCanvasElement | null = null;
let srcCtx: CanvasRenderingContext2D | null = null;
let dstCanvas: HTMLCanvasElement | null = null;
let dstCtx: CanvasRenderingContext2D | null = null;

/**
 * Rotate an ImageData by `angleDeg` degrees around its centre and return
 * a new ImageData of the same dimensions.
 *
 * Uses dedicated offscreen canvases so the caller's canvas is untouched.
 */
export function rotateImageData(imageData: ImageData, angleDeg: number): ImageData {
    const { width, height } = imageData;

    // Lazily create the two helper canvases
    if (!srcCanvas) {
        srcCanvas = document.createElement('canvas');
        srcCtx = srcCanvas.getContext('2d')!;
    }
    if (!dstCanvas) {
        dstCanvas = document.createElement('canvas');
        dstCtx = dstCanvas.getContext('2d', { willReadFrequently: true })!;
    }

    // Size the source canvas and stamp the image onto it
    srcCanvas.width = width;
    srcCanvas.height = height;
    srcCtx!.putImageData(imageData, 0, 0);

    // Size the destination canvas, clear, rotate, and draw
    dstCanvas.width = width;
    dstCanvas.height = height;
    const ctx = dstCtx!;
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    ctx.rotate((-angleDeg * Math.PI) / 180); // negate: rotate opposite to the detected skew
    ctx.translate(-width / 2, -height / 2);
    ctx.drawImage(srcCanvas, 0, 0);
    ctx.restore();

    return ctx.getImageData(0, 0, width, height);
}

// ─── Convenience: detect + correct ──────────────────────────────────────────

/**
 * Detect the skew angle and, if it exceeds the minimum threshold,
 * rotate the image to correct it.
 *
 * @returns An object with the corrected ImageData and the detected angle.
 */
export function deskew(imageData: ImageData): { imageData: ImageData; angleDeg: number } {
    const angleDeg = detectSkewAngle(imageData);

    if (Math.abs(angleDeg) < MIN_CORRECTION_DEG) {
        return { imageData, angleDeg: 0 };
    }

    return {
        imageData: rotateImageData(imageData, angleDeg),
        angleDeg,
    };
}


