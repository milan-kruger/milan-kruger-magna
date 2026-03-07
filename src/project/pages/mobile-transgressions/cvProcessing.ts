import cv from "@techstark/opencv-js";

export type OpenCVModule = typeof cv & {
    onRuntimeInitialized?: () => void;
};

export function distance(
    a: { x: number; y: number },
    b: { x: number; y: number }
) {
    if (!a || !b) return 0;

    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function orderPoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
    if (!points || points.length < 4) {
        return points;
    }

    try {
        const center = points.reduce(
            (acc, p) => {
                if (!p) return acc;
                return {
                    x: acc.x + (p.x || 0) / 4,
                    y: acc.y + (p.y || 0) / 4
                };
            },
            { x: 0, y: 0 }
        );

        const validPoints = points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');

        if (validPoints.length < 4) {
            return points;
        }

        const withAngle = validPoints.map(p => ({
            ...p,
            angle: Math.atan2(p.y - center.y, p.x - center.x)
        }));

        withAngle.sort((a, b) => a.angle - b.angle);

        return [
            withAngle[0] || { x: 0, y: 0 },
            withAngle[1] || { x: 0, y: 0 },
            withAngle[2] || { x: 0, y: 0 },
            withAngle[3] || { x: 0, y: 0 }
        ].map(({ x, y }) => ({ x, y }));

    } catch {
        return points;
    }
}

export function isBlurry(
    grayMat: cv.Mat,
    threshold: number = 80
): boolean {
    const laplacian = new cv.Mat();
    try {
        cv.Laplacian(grayMat, laplacian, cv.CV_64F);

        const mean = new cv.Mat();
        const stddev = new cv.Mat();
        cv.meanStdDev(laplacian, mean, stddev);

        const variance = Math.pow(stddev.doubleAt(0, 0), 2);

        mean.delete();
        stddev.delete();

        return variance < threshold;
    } finally {
        laplacian.delete();
    }
}

export function stage1Preprocess(src: cv.Mat) {
    const gray = new cv.Mat();
    const blurred = new cv.Mat();
    const edges = new cv.Mat();
    const dilated = new cv.Mat();

    try {

        const imgW = src.cols;

        const REF_WIDTH = 1280;
        const scaleFactor = imgW / REF_WIDTH;

        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        let blurSize = Math.round(5 * scaleFactor);

        if (blurSize % 2 === 0) blurSize += 1;

        blurSize = Math.max(3, blurSize);
        blurSize = Math.min(7, blurSize);

        cv.GaussianBlur(
            gray,
            blurred,
            new cv.Size(blurSize, blurSize),
            0
        );

        const cannyLow = 30;
        const cannyHigh = 150;

        cv.Canny(
            blurred,
            edges,
            cannyLow,
            cannyHigh,
            3
        );

        let dilateSize = Math.round(5 * scaleFactor);

        dilateSize = Math.max(3, dilateSize);
        dilateSize = Math.min(7, dilateSize);

        const kernel = cv.getStructuringElement(
            cv.MORPH_RECT,
            new cv.Size(dilateSize, dilateSize)
        );

        cv.dilate(
            edges,
            dilated,
            kernel,
            new cv.Point(-1, -1),
            2
        );

        kernel.delete();

        return {
            gray,
            edges,
            dilated
        };

    } catch (error) {

        gray.delete();
        blurred.delete();
        edges.delete();
        dilated.delete();

        throw error;
    }
}

export function stage2FindBestContour(
    dilated: cv.Mat
): cv.Mat | null {
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    let bestContour: cv.Mat | null = null;
    let bestScore = 0;

    try {

        cv.findContours(
            dilated,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE
        );

        if (contours.size() === 0) {
            contours.delete();
            hierarchy.delete();
            return null;
        }

        const imageArea = dilated.rows * dilated.cols;
        const minArea = imageArea * 0.03;

        for (let i = 0; i < contours.size(); i++) {

            const cnt = contours.get(i);

            const area = cv.contourArea(cnt);
            if (area < minArea) {
                cnt.delete();
                continue;
            }

            const perimeter = cv.arcLength(cnt, true);

            let bestApproxForContour: cv.Mat | null = null;

            for (let epsilon = 0.01; epsilon <= 0.05; epsilon += 0.01) {

                const approx = new cv.Mat();

                cv.approxPolyDP(
                    cnt,
                    approx,
                    epsilon * perimeter,
                    true
                );

                if (
                    approx.rows === 4 ||
                    approx.rows === 5 ||
                    approx.rows === 6
                ) {

                    bestApproxForContour = approx.clone();
                    approx.delete();
                    break;

                }

                approx.delete();
            }

            if (!bestApproxForContour) {
                cnt.delete();
                continue;
            }

            const br = cv.boundingRect(cnt);

            let aspect = 0;
            if (br.height !== 0) {
                aspect = br.width / br.height;
            }

            let score = area;

            if (aspect > 2 && aspect < 12) {
                score *= 1.4;
            }

            if (bestApproxForContour.rows === 4) {
                score *= 1.5;
            }

            if (score > bestScore) {

                bestScore = score;

                if (bestContour) {
                    bestContour.delete();
                }

                bestContour = bestApproxForContour.clone();
            }

            bestApproxForContour.delete();
            cnt.delete();
        }

        contours.delete();
        hierarchy.delete();

        return bestContour;

    } catch {

        contours.delete();
        hierarchy.delete();

        if (bestContour) {
            bestContour.delete();
        }

        return null;
    }
}

export function stage3ExtractCorners(
    contour: cv.Mat
): { x: number; y: number }[] | null {
    const points: { x: number; y: number }[] = [];

    try {

        if (
            contour.type() === cv.CV_32FC2 ||
            contour.type() === cv.CV_32F
        ) {
            for (let i = 0; i < contour.rows; i++) {

                const ptr = contour.floatPtr(i, 0);

                if (ptr && ptr.length >= 2) {
                    points.push({
                        x: Math.round(ptr[0]),
                        y: Math.round(ptr[1])
                    });
                }
            }

        } else {

            for (let i = 0; i < contour.rows; i++) {

                const ptr = contour.intPtr(i, 0);

                if (ptr && ptr.length >= 2) {
                    points.push({
                        x: ptr[0],
                        y: ptr[1]
                    });
                }
            }
        }

        if (points.length < 4) {
            return null;
        }

        if (points.length > 4) {

            const pointsMat = cv.matFromArray(
                points.length,
                1,
                cv.CV_32SC2,
                points.flatMap(p => [p.x, p.y])
            );

            const hull = new cv.Mat();

            cv.convexHull(
                pointsMat,
                hull,
                false,
                true
            );

            const hullPoints: { x: number; y: number }[] = [];

            for (let i = 0; i < hull.rows; i++) {

                const ptr = hull.intPtr(i, 0);

                if (ptr && ptr.length >= 2) {
                    hullPoints.push({
                        x: ptr[0],
                        y: ptr[1]
                    });
                }
            }

            hull.delete();
            pointsMat.delete();

            if (hullPoints.length === 4) {
                return orderPoints(hullPoints);
            }

            const src = hullPoints.length > 0
                ? hullPoints
                : points;

            const minX = Math.min(...src.map(p => p.x));
            const maxX = Math.max(...src.map(p => p.x));
            const minY = Math.min(...src.map(p => p.y));
            const maxY = Math.max(...src.map(p => p.y));

            const closest = (tx: number, ty: number) =>
                src.reduce((best, p) => {

                    const dx = p.x - tx;
                    const dy = p.y - ty;
                    const d = Math.sqrt(dx * dx + dy * dy);

                    return d < best.d
                        ? { p, d }
                        : best;

                }, { p: src[0], d: Infinity }).p;

            const corners = [
                closest(minX, minY),
                closest(maxX, minY),
                closest(maxX, maxY),
                closest(minX, maxY)
            ];

            return orderPoints(corners);
        }

        if (points.length === 4) {
            return orderPoints(points);
        }

        return null;

    } catch {
        return null;
    }

}

export function stage4PerspectiveWarp(
    src: cv.Mat,
    corners: { x: number; y: number }[]
): cv.Mat | null {

    if (!corners || corners.length !== 4) {
        return null;
    }

    try {

        const width1 = distance(corners[0], corners[1]);
        const width2 = distance(corners[3], corners[2]);

        if (width1 === 0 || width2 === 0) {
            return null;
        }

        const maxWidth = Math.max(
            Math.round(width1),
            Math.round(width2)
        );

        const height1 = distance(corners[0], corners[3]);
        const height2 = distance(corners[1], corners[2]);

        const maxHeight = Math.max(
            Math.round(height1),
            Math.round(height2)
        );

        if (maxWidth === 0 || maxHeight === 0) {
            return null;
        }

        const MAX_WARP_WIDTH = 1200;

        const rawWidth = Math.round(maxWidth * 1.2);

        const scale =
            rawWidth > MAX_WARP_WIDTH
                ? MAX_WARP_WIDTH / rawWidth
                : 1;

        const targetWidth = Math.round(rawWidth * scale);
        const targetHeight = Math.round(
            (maxHeight / maxWidth) * targetWidth
        );

        const srcTri = cv.matFromArray(
            4,
            1,
            cv.CV_32FC2,
            [
                corners[0].x, corners[0].y,
                corners[1].x, corners[1].y,
                corners[2].x, corners[2].y,
                corners[3].x, corners[3].y
            ]
        );

        const dstTri = cv.matFromArray(
            4,
            1,
            cv.CV_32FC2,
            [
                0, 0,
                targetWidth - 1, 0,
                targetWidth - 1, targetHeight - 1,
                0, targetHeight - 1
            ]
        );

        const transform = cv.getPerspectiveTransform(
            srcTri,
            dstTri
        );

        const warped = new cv.Mat();

        cv.warpPerspective(
            src,
            warped,
            transform,
            new cv.Size(targetWidth, targetHeight),
            cv.INTER_LINEAR,
            cv.BORDER_CONSTANT,
            new cv.Scalar(255, 255, 255, 255)
        );

        srcTri.delete();
        dstTri.delete();
        transform.delete();

        return warped;

    } catch {

        return null;
    }
}

export function stage5Enhance(
    warped: cv.Mat
): ImageData | null {

    const gray = new cv.Mat();
    const claheResult = new cv.Mat();
    const sharpened = new cv.Mat();

    try {
        cv.cvtColor(warped, gray, cv.COLOR_RGBA2GRAY);

        const clahe = new cv.CLAHE(
            1.2,
            new cv.Size(8, 8)
        );

        clahe.apply(gray, claheResult);
        clahe.delete();

        const kernel = cv.matFromArray(
            3,
            3,
            cv.CV_32F,
            [
                0, -0.25, 0,
                -0.25, 2, -0.25,
                0, -0.25, 0
            ]
        );

        cv.filter2D(
            claheResult,
            sharpened,
            cv.CV_8U,
            kernel
        );

        kernel.delete();

        const rgba = new cv.Mat();
        cv.cvtColor(sharpened, rgba, cv.COLOR_GRAY2RGBA);

        const imageData = new ImageData(
            new Uint8ClampedArray(rgba.data),
            rgba.cols,
            rgba.rows
        );

        rgba.delete();

        return imageData;

    } catch (e) {

        console.error("Stage5Enhance error", e);
        return null;

    } finally {

        gray.delete();
        claheResult.delete();
        sharpened.delete();
    }
}

export function perspectiveCorrect(
    canvas: HTMLCanvasElement,
    openCvReady: boolean
): ImageData | null {

    if (!openCvReady) return null;

    const src = cv.imread(canvas);

    let stage1;
    let contour: cv.Mat | null = null;
    let warped: cv.Mat | null = null;

    try {
        const t0 = performance.now();
        stage1 = stage1Preprocess(src);

        const t1 = performance.now();
        contour = stage2FindBestContour(stage1.dilated);
        if (!contour) return null;

        const t2 = performance.now();
        const corners = stage3ExtractCorners(contour);
        if (!corners) return null;

        const t3 = performance.now();
        warped = stage4PerspectiveWarp(src, corners);
        if (!warped) return null;

        const t4 = performance.now();
        const result = stage5Enhance(warped);
        if (!result) return null;

        const t5 = performance.now();
        console.log(
            `Timings: stage1=${(t1 - t0).toFixed(2)}ms, ` +
            `stage2=${(t2 - t1).toFixed(2)}ms, ` +
            `stage3=${(t3 - t2).toFixed(2)}ms, ` +
            `stage4=${(t4 - t3).toFixed(2)}ms, ` +
            `stage5=${(t5 - t4).toFixed(2)}ms`
        );

        return result;

    } catch {
        return null;
    } finally {
        src.delete();
        if (stage1) {
            stage1.gray.delete();
            stage1.edges.delete();
            stage1.dilated.delete();
        }
        if (contour) contour.delete();
        if (warped) warped.delete();
    }
}
//
// function debugMat(label: string, mat: cv.Mat) {
//     try {
//         const base64 = imageDataToBase64(matToImageData(mat));
//         //console.log(label, base64);
//     } catch (e) {
//         //console.log(label, "debug failed", e);
//     }
// }
//
//
// function matToImageData(mat: cv.Mat): ImageData {
//     const rgba = new cv.Mat();
//
//     if (mat.channels() === 1) {
//         cv.cvtColor(mat, rgba, cv.COLOR_GRAY2RGBA);
//     } else if (mat.channels() === 3) {
//         cv.cvtColor(mat, rgba, cv.COLOR_RGB2RGBA);
//     } else {
//         mat.copyTo(rgba);
//     }
//
//     const imgData = new ImageData(
//         new Uint8ClampedArray(rgba.data),
//         rgba.cols,
//         rgba.rows
//     );
//
//     rgba.delete();
//     return imgData;
// }
//
// export function imageDataToBase64(imageData: ImageData): string {
//     const canvas = document.createElement("canvas");
//     canvas.width = imageData.width;
//     canvas.height = imageData.height;
//
//     const ctx = canvas.getContext("2d");
//     if (!ctx) throw new Error("Could not get canvas context");
//
//     ctx.putImageData(imageData, 0, 0);
//
//     return canvas.toDataURL("image/png"); // returns base64 data URL
// }