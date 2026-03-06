
// ─────────────────────────────────────────────────────────────
// PREPROCESSING PIPELINE
// ─────────────────────────────────────────────────────────────

export type PreprocessFn = (imageData: ImageData) => ImageData;

export function cloneImageData(imageData: ImageData): ImageData {
    return new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
}

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

/* ----------------------------------------------------------- */
/* CONTRAST STRETCH                                             */
/* ----------------------------------------------------------- */

export function contrastStretch(imageData: ImageData): ImageData {
    const { data } = imageData;

    let min = 255;
    let max = 0;

    for (let i = 0; i < data.length; i += 4) {
        const lum =
            (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;

        if (lum < min) min = lum;
        if (lum > max) max = lum;
    }

    if (max === min) return imageData;

    const scale = 255 / (max - min);

    for (let i = 0; i < data.length; i += 4) {
        const lum =
            (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;

        const stretched = Math.max(
            0,
            Math.min(255, (lum - min) * scale)
        );

        data[i] = stretched;
        data[i + 1] = stretched;
        data[i + 2] = stretched;
    }

    return imageData;
}


/* ----------------------------------------------------------- */
/* ADAPTIVE LOCAL CONTRAST + THRESHOLD                         */
/* ----------------------------------------------------------- */

export function adaptiveLocalContrastAndThreshold(
    imageData: ImageData,
    tileSize = 32,
    applyThreshold = true
): ImageData {
    const { width, height, data } = imageData;

    for (let ty = 0; ty < height; ty += tileSize) {
        for (let tx = 0; tx < width; tx += tileSize) {

            let min = 255;
            let max = 0;
            let sum = 0;
            let count = 0;

            const yEnd = Math.min(ty + tileSize, height);
            const xEnd = Math.min(tx + tileSize, width);

            for (let y = ty; y < yEnd; y++) {
                for (let x = tx; x < xEnd; x++) {
                    const idx = (y * width + x) * 4;
                    const lum = data[idx];

                    if (lum < min) min = lum;
                    if (lum > max) max = lum;
                    sum += lum;
                    count++;
                }
            }

            if (max === min) continue;

            const avg = sum / count;
            const scale = 255 / (max - min);

            for (let y = ty; y < yEnd; y++) {
                for (let x = tx; x < xEnd; x++) {
                    const idx = (y * width + x) * 4;
                    const lum = data[idx];

                    const stretched = Math.max(
                        0,
                        Math.min(255, (lum - min) * scale)
                    );

                    let finalValue = stretched;

                    if (applyThreshold) {
                        const threshold =
                            Math.max(0, Math.min(255, (avg - min) * scale));
                        finalValue = stretched >= threshold ? 255 : 0;
                    }

                    data[idx] = finalValue;
                    data[idx + 1] = finalValue;
                    data[idx + 2] = finalValue;
                }
            }
        }
    }

    return imageData;
}

/* ----------------------------------------------------------- */
/* GAUSSIAN BLUR (for noise reduction)                         */
/* ----------------------------------------------------------- */

export function gaussianBlur(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const copy = new Uint8ClampedArray(data);

    const kernel = [
        1, 2, 1,
        2, 4, 2,
        1, 2, 1
    ];
    const kernelSum = 16;

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let sum = 0;
            let k = 0;

            for (let ky = -1; ky <= 1; ky++) {
                const rowOffset = (y + ky) * width * 4;
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = rowOffset + (x + kx) * 4;
                    sum += copy[idx] * kernel[k++];
                }
            }

            const idx = (y * width + x) * 4;
            const v = Math.round(sum / kernelSum);

            data[idx] = data[idx + 1] = data[idx + 2] = v;
        }
    }

    return imageData;
}


/* ----------------------------------------------------------- */
/* SHARPEN                                                     */
/* ----------------------------------------------------------- */


export function sharpen(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;
    const copy = new Uint8ClampedArray(data);

    const kernel = [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
    ];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            for (let c = 0; c < 3; c++) {
                let sum = 0;
                let k = 0;

                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const idx = ((y + ky) * width + (x + kx)) * 4 + c;
                        sum += copy[idx] * kernel[k++];
                    }
                }

                const idx = (y * width + x) * 4 + c;
                data[idx] = Math.max(0, Math.min(255, sum));
            }
        }
    }

    return imageData;
}

/* ----------------------------------------------------------- */
/* GAMMA CORRECTION                                            */
/* ----------------------------------------------------------- */


export function gamma(imageData: ImageData, gamma = 0.7): ImageData {
    const { data } = imageData;
    const inv = 1 / gamma;

    for (let i = 0; i < data.length; i += 4) {
        const v = data[i] / 255;
        const corrected = Math.pow(v, inv) * 255;
        data[i] = data[i+1] = data[i+2] = corrected;
    }
    return imageData;
}

/* ----------------------------------------------------------- */
/* DECLARATIVE PREPROCESSOR LIST                                */
/* ----------------------------------------------------------- */

export const preprocessors: { name: string; fn: PreprocessFn }[] = [
    { name: 'none', fn: (img) => img },

    { name: 'contrast', fn: (img) =>
            contrastStretch(img)
    },

    { name: 'gamma+contrast', fn: (img) =>
            contrastStretch(
                gamma(
                    img,
                    0.75
                )
            )
    },

    { name: 'gamma+sharpen+contrast', fn: (img) =>
            contrastStretch(
                sharpen(
                    gamma(
                        img,
                        0.75
                    )
                )
            )
    },

    { name: 'adaptive-128', fn: (img) =>
            adaptiveLocalContrastAndThreshold(
                img,
                128,
                false
            )
    },

    { name: 'adaptive-64', fn: (img) =>
            adaptiveLocalContrastAndThreshold(
                img,
                64,
                false,
            )
    },

    { name: 'adaptive-32', fn: (img) =>
            adaptiveLocalContrastAndThreshold(
                img,
                32,
                false
            )
    },
];


export function imageDataToBase64(imageData: ImageData): string {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL('image/png');
}
