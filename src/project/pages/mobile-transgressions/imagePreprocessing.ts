
/* ----------------------------------------------------------- */
/* BRIGHTNESS NORMALIZATION                                    */
/* ----------------------------------------------------------- */

export function normalizeBrightness(
    imageData: ImageData,
    minTargetBrightness = 128,
    maxAdjustment = 1.5
): ImageData {
    const { data } = imageData;

    let sum = 0;
    let count = 0;

    for (let i = 0; i < data.length; i += 4) {
        sum += data[i];
        count++;
    }

    const avgBrightness = sum / count;

    if (avgBrightness >= minTargetBrightness) {
        return imageData;
    }

    const adjustment = Math.min(
        minTargetBrightness / avgBrightness,
        maxAdjustment
    );

    for (let i = 0; i < data.length; i += 4) {
        const boosted = Math.min(255, Math.round(data[i] * adjustment));
        data[i] = boosted;
        data[i + 1] = boosted;
        data[i + 2] = boosted;
    }

    return imageData;
}

/* ----------------------------------------------------------- */
/* BASIC GRAYSCALE                                              */
/* ----------------------------------------------------------- */

export function toGrayscale(imageData: ImageData): ImageData {
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
        const gray =
            (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;

        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }

    return imageData;
}


// ─────────────────────────────────────────────────────────────
// FAST IMAGE PREPROCESSING PIPELINE
// 2 passes instead of 4–5
// ─────────────────────────────────────────────────────────────

export type PreprocessFn = (imageData: ImageData) => ImageData;

export function cloneImageData(imageData: ImageData): ImageData {
    return new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
}

// ─────────────────────────────────────────────────────────────
// LUT UTILITIES
// ─────────────────────────────────────────────────────────────

function buildGammaLUT(gamma: number) {
    const lut = new Uint8ClampedArray(256);
    const inv = 1 / gamma;

    for (let i = 0; i < 256; i++) {
        lut[i] = Math.min(255, Math.pow(i / 255, inv) * 255);
    }

    return lut;
}

// ─────────────────────────────────────────────────────────────
// FAST PIPELINE
// PASS 1: grayscale + gamma + min/max
// PASS 2: contrast stretch (+ optional sharpen)
// ─────────────────────────────────────────────────────────────

export function fastPipeline(
    imageData: ImageData,
    {
        gamma = 1,
        sharpen = false,
    }: {
        gamma?: number;
        sharpen?: boolean;
    } = {}
): ImageData {

    const { data, width, height } = imageData;
    const len = data.length;

    const gammaLUT = gamma !== 1 ? buildGammaLUT(gamma) : null;

    let min = 255;
    let max = 0;

    // ─────────────────────────────────────────
    // PASS 1
    // grayscale + gamma + min/max
    // ─────────────────────────────────────────

    for (let i = 0; i < len; i += 4) {

        let gray =
            (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;

        if (gammaLUT) {
            gray = gammaLUT[gray];
        }

        data[i] = data[i + 1] = data[i + 2] = gray;

        if (gray < min) min = gray;
        if (gray > max) max = gray;
    }

    if (max === min) return imageData;

    const scale = 255 / (max - min);

    // ─────────────────────────────────────────
    // PASS 2
    // contrast stretch
    // ─────────────────────────────────────────

    for (let i = 0; i < len; i += 4) {

        let v = (data[i] - min) * scale;

        v = v < 0 ? 0 : v > 255 ? 255 : v;

        data[i] = data[i + 1] = data[i + 2] = v;
    }

    // ─────────────────────────────────────────
    // OPTIONAL SHARPEN
    // ─────────────────────────────────────────

    if (sharpen) {

        const copy = new Uint8ClampedArray(data);

        const kernel = [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ];

        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {

                let sum = 0;
                let k = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {

                        const idx =
                            ((y + ky) * width + (x + kx)) * 4;

                        sum += copy[idx] * kernel[k++];
                    }
                }

                const idx = (y * width + x) * 4;

                const v = Math.max(0, Math.min(255, sum));

                data[idx] =
                    data[idx + 1] =
                        data[idx + 2] = v;
            }
        }
    }

    return imageData;
}

// ─────────────────────────────────────────────────────────────
// DECLARATIVE PREPROCESSOR LIST
// ─────────────────────────────────────────────────────────────

export const preprocessors: { name: string; fn: PreprocessFn }[] = [
    { name: 'none', fn: (img) => img },

    {
        name: 'contrast',
        fn: (img) => fastPipeline(img)
    },

    {
        name: 'gamma+contrast',
        fn: (img) => fastPipeline(img, { gamma: 0.75 })
    },

    {
        name: 'gamma+sharpen+contrast',
        fn: (img) =>
            fastPipeline(img, {
                gamma: 0.75,
                sharpen: true
            })
    },
];
