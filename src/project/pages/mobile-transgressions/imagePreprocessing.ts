
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
/* BRIGHTNESS NORMALIZATION (MANDATORY CHECK)                  */
/* ----------------------------------------------------------- */

// export function normalizeBrightness(
//     imageData: ImageData,
//     minTargetBrightness = 128,  // Minimum desired average brightness
//     maxAdjustment = 1.5         // Maximum multiplier to avoid over-amplification
// ): ImageData {
//     const { data } = imageData;
//
//     // Calculate global average brightness
//     let sum = 0;
//     let count = 0;
//
//     for (let i = 0; i < data.length; i += 4) {
//         sum += data[i]; // Since it's grayscale, R=G=B
//         count++;
//     }
//
//     const avgBrightness = sum / count;
//
//     // If brightness is already above threshold, return unchanged
//     if (avgBrightness >= minTargetBrightness) {
//         return imageData;
//     }
//
//     // Calculate adjustment factor, but cap it to avoid over-amplification
//     const adjustment = Math.min(
//         minTargetBrightness / avgBrightness,
//         maxAdjustment
//     );
//
//     // Apply brightness boost
//     for (let i = 0; i < data.length; i += 4) {
//         const boosted = Math.min(255, Math.round(data[i] * adjustment));
//         data[i] = boosted;
//         data[i + 1] = boosted;
//         data[i + 2] = boosted;
//     }
//
//     return imageData;
// }

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

    // Pass 1: find min/max
    for (let i = 0; i < data.length; i += 4) {

        // this assumes the image is already grayscale, so we can just read the R channel for luminance
        const lum = data[i]; // grayscale, no recompute
        if (lum < min) min = lum;
        if (lum > max) max = lum;
    }

    if (max === min) return imageData;

    const scale = 255 / (max - min);

    // Pass 2: stretch
    for (let i = 0; i < data.length; i += 4) {
        const stretched = (data[i] - min) * scale;
        const v = stretched < 0 ? 0 : stretched > 255 ? 255 : stretched;

        data[i] = data[i + 1] = data[i + 2] = v;
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

            // Pass 1: collect stats
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

            // Pass 2: apply local stretch (+ optional threshold)
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
            const v = sum < 0 ? 0 : sum > 255 ? 255 : sum;

            data[idx] = data[idx + 1] = data[idx + 2] = v;
        }
    }

    return imageData;
}

/* ----------------------------------------------------------- */
/* GAMMA CORRECTION                                            */
/* ----------------------------------------------------------- */

function buildGammaLUT(gamma: number) {
    const inv = 1 / gamma;
    const lut = new Uint8ClampedArray(256);
    for (let i = 0; i < 256; i++) {
        lut[i] = Math.pow(i / 255, inv) * 255;
    }
    return lut;
}

const gamma075LUT = buildGammaLUT(0.75);

export function gamma(imageData: ImageData): ImageData {
    const { data } = imageData;

    for (let i = 0; i < data.length; i += 4) {
        const v = gamma075LUT[data[i]];
        data[i] = data[i+1] = data[i+2] = v;
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
                gamma(img)
            )
    },

    { name: 'gamma+sharpen+contrast', fn: (img) =>
            contrastStretch(
                sharpen(
                    gamma(img)
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
    // returns: "data:image/png;base64,iVBORw0KGgoAAAANS..."
}
