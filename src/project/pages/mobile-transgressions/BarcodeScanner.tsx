import CancelIcon from '@mui/icons-material/Cancel';
import { BsUpcScan } from 'react-icons/bs';
import { Box, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmIconButton from '../../../framework/components/button/TmIconButton';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import { parseDLBarcode } from './dlBarcodeParser';
import { parseCarDiskBarcode, isCarDiskBarcode } from './carDiskBarcodeParser';
import cv from "@techstark/opencv-js";

type BarcodeResult = {
    rawValue: string;
    format: string;
    preprocessor?: string;
    binarizer?: string;
};

type ScannerState =
    | { phase: 'idle'; error?: string }
    | { phase: 'scanning' }
    | { phase: 'result'; barcode: BarcodeResult };

// ── zxing-wasm (C++ WASM, same decoder on every platform) ────────────────────
// Uses the ZXing C++ engine compiled to WebAssembly — dramatically better at
// dense/complex PDF417 (e.g. driver's licences) than the pure-JS @zxing/library.
const wasmReaderOptions: ReaderOptions = {
    formats: ['PDF417'],
    tryHarder: true,
    tryRotate: true,
    tryDownscale: false,
    tryDenoise: false,      // experimental; expensive on mobile CPUs
    maxNumberOfSymbols: 1,
    textMode: 'Plain',
    binarizer: 'LocalAverage',
};

// Fallback binarizer for when LocalAverage (block-based local threshold) fails.
// GlobalHistogram uses a single global threshold — can succeed under uniform
// lighting or overexposure where LocalAverage fails, and vice versa.
const wasmReaderOptionsFallback: ReaderOptions = {
    ...wasmReaderOptions,
    binarizer: 'GlobalHistogram',
};

function getROI(width: number, height: number) {
    const isPortrait = height > width;

    if (isPortrait) {
        // For portrait: wider rectangle in the middle vertically
        const roiWidth = 1.0;  // 40% of screen width
        const roiHeight = 1.0; // 80% of screen height

        return {
            x: (1 - roiWidth) / 2,      // Centered horizontally
            y: (1 - roiHeight) / 2,      // Centered vertically
            width: roiWidth,
            height: roiHeight
        };
    }

    // For landscape: wider rectangle in the middle horizontally
    const roiWidth = 0.7;  // 70% of screen width
    const roiHeight = 0.4; // 40% of screen height

    return {
        x: (1 - roiWidth) / 2,      // Centered horizontally
        y: (1 - roiHeight) / 2,      // Centered vertically
        width: roiWidth,
        height: roiHeight
    };
}

// ─────────────────────────────────────────────────────────────
// PREPROCESSING PIPELINE
// ─────────────────────────────────────────────────────────────

type PreprocessFn = (imageData: ImageData) => ImageData;

function cloneImageData(imageData: ImageData): ImageData {
    return new ImageData(
        new Uint8ClampedArray(imageData.data),
        imageData.width,
        imageData.height
    );
}

/* ----------------------------------------------------------- */
/* BASIC GRAYSCALE                                              */
/* ----------------------------------------------------------- */

function toGrayscale(imageData: ImageData): ImageData {
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

function contrastStretch(imageData: ImageData): ImageData {
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

function adaptiveLocalContrastAndThreshold(
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


function sharpen(imageData: ImageData): ImageData {
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


function gamma(imageData: ImageData, gamma = 0.7): ImageData {
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

const preprocessors: { name: string; fn: PreprocessFn }[] = [
    { name: 'none', fn: (img) => img },

    { name: 'contrast', fn: (img) =>
            contrastStretch(toGrayscale(img))
    },

    { name: 'gamma+contrast', fn: (img) =>
            contrastStretch(
                gamma(
                    toGrayscale(img),
                    0.75
                )
            )
    },

    { name: 'gamma+sharpen+contrast', fn: (img) =>
            contrastStretch(
                sharpen(
                    gamma(
                        toGrayscale(img),
                        0.75
                    )
                )
            )
    },

    { name: 'adaptive-128', fn: (img) =>
            adaptiveLocalContrastAndThreshold(
                toGrayscale(img),
                128,
                false
            )
    },

    { name: 'adaptive-64', fn: (img) =>
            adaptiveLocalContrastAndThreshold(
                toGrayscale(img),
                64,
                false,
            )
    },

    { name: 'adaptive-32', fn: (img) =>
            adaptiveLocalContrastAndThreshold(
                toGrayscale(img),
                32,
                false
            )
    },
];


function imageDataToBase64(imageData: ImageData): string {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;

    const ctx = canvas.getContext('2d')!;
    ctx.putImageData(imageData, 0, 0);

    return canvas.toDataURL('image/png');
    // returns: "data:image/png;base64,iVBORw0KGgoAAAANS..."
}

type DecodeSuccess = {
    text: string;
    format: string;
    preprocessor: string;
    binarizer: 'LocalAverage' | 'GlobalHistogram';
};

/** Try decoding with primary binarizer, then fallback binarizer. */
async function tryDecode(
    originalImageData: ImageData
): Promise<DecodeSuccess | null> {

    for (const { name, fn } of preprocessors) {

        const imageData = cloneImageData(originalImageData);

        try {
            fn(imageData);
        } catch {
            continue;
        }
        // console.log(`Preprocessor: ${name}`);
        // console.log(imageDataToBase64(imageData));
        // Try LocalAverage first
        let results = await readBarcodes(imageData, wasmReaderOptions);

        if (results.length > 0 && results[0].isValid && results[0].text) {
            return {
                text: results[0].text,
                format: results[0].format,
                preprocessor: name,
                binarizer: 'LocalAverage'
            };
        }

        // Only fallback for lightweight passes
        if (name === 'none' || name === 'contrast') {
            results = await readBarcodes(imageData, wasmReaderOptionsFallback);

            if (results.length > 0 && results[0].isValid && results[0].text) {
                return {
                    text: results[0].text,
                    format: results[0].format,
                    preprocessor: name,
                    binarizer: 'GlobalHistogram'
                };
            }
        }
    }

    return null;
}
type OpenCVModule = typeof cv & {
    onRuntimeInitialized?: () => void;
};

function distance(
    a: { x: number; y: number },
    b: { x: number; y: number }
) {
    if (!a || !b) return 0;
    return Math.hypot(a.x - b.x, a.y - b.y);
}

function orderPoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
    if (!points || points.length < 4) {
        console.warn('Not enough points for ordering', points);
        return points;
    }

    try {
        // Calculate center point
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

        // Filter out invalid points and add angle
        const validPoints = points.filter(p => p && typeof p.x === 'number' && typeof p.y === 'number');

        if (validPoints.length < 4) {
            console.warn('Not enough valid points after filtering');
            return points;
        }

        const withAngle = validPoints.map(p => ({
            ...p,
            angle: Math.atan2(p.y - center.y, p.x - center.x)
        }));

        // Sort by angle
        withAngle.sort((a, b) => a.angle - b.angle);

        // Reorder: top-left (smallest angle), top-right, bottom-right, bottom-left
        return [
            withAngle[0] || { x: 0, y: 0 },
            withAngle[1] || { x: 0, y: 0 },
            withAngle[2] || { x: 0, y: 0 },
            withAngle[3] || { x: 0, y: 0 }
        ].map(({ x, y }) => ({ x, y }));

    } catch (error) {
        console.error('Error ordering points:', error);
        return points;
    }
}

function perspectiveCorrect(
    canvas: HTMLCanvasElement,
    openCvReady: boolean
): ImageData | null {
    if (!openCvReady) return null;

    // Create a copy of the canvas to work with
    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const edges = new cv.Mat();
    const blurred = new cv.Mat();
    const threshold = new cv.Mat();
    const dilated = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    // Declare variables that need to be accessible in cleanup
    let maxContour: cv.Mat | null = null;

    try {


        // Optional debug
        console.log('Original Image:', canvas.toDataURL('image/png'));
        // -------- Stage 1: Aggressive preprocessing --------
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);

        // Apply strong Gaussian blur to reduce noise
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);

        // Use Canny edge detection with aggressive thresholds
        cv.Canny(blurred, edges, 30, 150, 3);

        // Dilate edges to connect nearby lines
        const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(5, 5));
        cv.dilate(edges, dilated, kernel, new cv.Point(-1, -1), 2);
        kernel.delete();

        // Find contours on the dilated edges
        cv.findContours(
            dilated,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE
        );

        if (contours.size() === 0) {
            console.log('No contours found');
            cleanup();
            return null;
        }

        // -------- Stage 2: Aggressive contour finding --------
        let maxArea = 0;
        let maxPerimeter = 0;
        const imageArea = src.rows * src.cols;
        const minArea = imageArea * 0.05; // Reduced to 5% to catch smaller regions

        for (let i = 0; i < contours.size(); i++) {
            const cnt = contours.get(i);
            const area = cv.contourArea(cnt);
            const perimeter = cv.arcLength(cnt, true);

            if (area < minArea) continue;

            // Approximate contour to polygon with varying precision
            for (let epsilon = 0.01; epsilon <= 0.05; epsilon += 0.01) {
                const approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, epsilon * perimeter, true);

                // Check if it's a quadrilateral (4 corners) or try to find one with 4-6 corners
                if ((approx.rows === 4 || approx.rows === 5 || approx.rows === 6) &&
                    area > maxArea &&
                    perimeter > maxPerimeter) {

                    maxArea = area;
                    maxPerimeter = perimeter;
                    if (maxContour) maxContour.delete();
                    maxContour = approx.clone();
                    break; // Found a good approximation
                }

                approx.delete();
            }
        }

        // If no quadrilateral found, try a different approach
        if (!maxContour) {
            console.log('No quadrilateral found, trying minAreaRect approach');
            // Find the largest contour and try to fit a rectangle
            let largestContour: cv.Mat | null = null;
            maxArea = 0;

            for (let i = 0; i < contours.size(); i++) {
                const cnt = contours.get(i);
                const area = cv.contourArea(cnt);
                if (area > maxArea) {
                    maxArea = area;
                    if (largestContour) largestContour.delete();
                    largestContour = cnt.clone();
                }
            }

            if (largestContour) {
                // Get the minimum area rectangle
                const rect = cv.minAreaRect(largestContour);
                // boxPoints returns an array of Point, not a Mat
                const boxPoints = cv.boxPoints(rect);

                // Convert the box points array to a Mat
                const boxMat = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    boxPoints[0].x, boxPoints[0].y,
                    boxPoints[1].x, boxPoints[1].y,
                    boxPoints[2].x, boxPoints[2].y,
                    boxPoints[3].x, boxPoints[3].y
                ]);

                maxContour = boxMat;
                largestContour.delete();
            }
        }

        if (!maxContour) {
            console.log('No contour found for perspective correction');
            cleanup();
            return null;
        }

        // -------- Stage 3: Extract and order the corner points --------
        const points: { x: number; y: number }[] = [];

        // Check the type of matrix and extract points accordingly
        if (maxContour.type() === cv.CV_32FC2 || maxContour.type() === cv.CV_32F) {
            for (let i = 0; i < maxContour.rows; i++) {
                const ptr = maxContour.floatPtr(i, 0);
                if (ptr && ptr.length >= 2) {
                    points.push({
                        x: Math.round(ptr[0]),
                        y: Math.round(ptr[1])
                    });
                }
            }
        } else {
            for (let i = 0; i < maxContour.rows; i++) {
                const ptr = maxContour.intPtr(i, 0);
                if (ptr && ptr.length >= 2) {
                    points.push({
                        x: ptr[0],
                        y: ptr[1]
                    });
                }
            }
        }

        if (points.length < 4) {
            console.log('Not enough points extracted:', points.length);
            cleanup();
            return null;
        }

        // If we have more than 4 points, reduce to 4 corners
        if (points.length > 4) {
            console.log('Reducing', points.length, 'points to 4 corners');
            // Find convex hull
            const pointsMat = cv.matFromArray(points.length, 1, cv.CV_32SC2,
                points.flatMap(p => [p.x, p.y]));
            const hull = new cv.Mat();
            cv.convexHull(pointsMat, hull, false, true);

            points.length = 0;
            for (let i = 0; i < hull.rows; i++) {
                const ptr = hull.intPtr(i, 0);
                if (ptr && ptr.length >= 2) {
                    points.push({ x: ptr[0], y: ptr[1] });
                }
            }
            hull.delete();
            pointsMat.delete();
        }

        // Ensure we have exactly 4 points
        if (points.length !== 4) {
            console.log('Invalid number of points after processing:', points.length);
            cleanup();
            return null;
        }

        // Order points
        const ordered = orderPoints(points);

        // Validate ordered points
        if (!ordered || ordered.length !== 4) {
            console.log('Invalid ordered points');
            cleanup();
            return null;
        }

        // Calculate destination dimensions
        const width1 = distance(ordered[0], ordered[1]);
        const width2 = distance(ordered[3], ordered[2]);
        if (width1 === 0 || width2 === 0) {
            console.log('Invalid width calculation');
            cleanup();
            return null;
        }

        const maxWidth = Math.max(Math.round(width1), Math.round(width2));
        // Increase width by 20% for better detail
        const targetWidth = Math.round(maxWidth * 1.2);

        const height1 = distance(ordered[0], ordered[3]);
        const height2 = distance(ordered[1], ordered[2]);
        const maxHeight = Math.max(Math.round(height1), Math.round(height2));
        // Maintain aspect ratio
        const targetHeight = Math.round((maxHeight / maxWidth) * targetWidth);

        // -------- Stage 4: Apply perspective transform --------
        const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            ordered[0].x, ordered[0].y,
            ordered[1].x, ordered[1].y,
            ordered[2].x, ordered[2].y,
            ordered[3].x, ordered[3].y
        ]);

        const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            targetWidth - 1, 0,
            targetWidth - 1, targetHeight - 1,
            0, targetHeight - 1
        ]);

        const M = cv.getPerspectiveTransform(srcTri, dstTri);
        const warped = new cv.Mat();

        cv.warpPerspective(
            src,
            warped,
            M,
            new cv.Size(targetWidth, targetHeight),
            cv.INTER_CUBIC,
            cv.BORDER_CONSTANT,
            new cv.Scalar(255, 255, 255, 255)
        );

        // -------- Stage 5: Aggressive post-processing --------
        // Convert to grayscale
        const warpedGray = new cv.Mat();
        cv.cvtColor(warped, warpedGray, cv.COLOR_RGBA2GRAY);

        // Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)
        const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
        const claheResult = new cv.Mat();
        clahe.apply(warpedGray, claheResult);

        // Apply sharpening
        const sharpKernel = cv.matFromArray(3, 3, cv.CV_32F, [
            0, -1, 0,
            -1, 5, -1,
            0, -1, 0
        ]);
        const sharpened = new cv.Mat();
        cv.filter2D(claheResult, sharpened, cv.CV_8U, sharpKernel);

        // Apply adaptive threshold for maximum contrast
        const final = new cv.Mat();
        cv.adaptiveThreshold(
            sharpened,
            final,
            255,
            cv.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv.THRESH_BINARY,
            15,
            5
        );

        // Convert warped Mat directly to ImageData
        const imgData = new ImageData(
            new Uint8ClampedArray(warped.data),
            warped.cols,
            warped.rows
        );

        // Optional debug
        console.log('Perspective correction applied:', imageDataToBase64(imgData));

        // Clean up transform matrices
        srcTri.delete();
        dstTri.delete();
        M.delete();
        warped.delete();

        cleanup();
        return imgData;

    } catch (error) {
        console.error('Perspective correction failed:', error);
        cleanup();
        return null;
    }

    function cleanup() {
        // Safely delete all matrices
        [src, gray, edges, blurred, threshold, dilated, hierarchy].forEach(mat => {
            if (mat && !mat.isDeleted()) mat.delete();
        });

        // Delete contours
        for (let i = 0; i < contours.size(); i++) {
            const cnt = contours.get(i);
            if (cnt && !cnt.isDeleted()) cnt.delete();
        }
        contours.delete();

        // Delete maxContour if it exists
        if (maxContour && !maxContour.isDeleted()) {
            maxContour.delete();
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────

function BarcodeScanner() {
    const { t } = useTranslation();

    const [state, setState] = useState<ScannerState>({ phase: 'idle' });

    const [roi, setRoi] = useState<ReturnType<typeof getROI> | null>(null);

    const barcode = state.phase === 'result' ? state.barcode : null;
    const rawValue = barcode?.rawValue;
    const parsedBarcode = useMemo(() => {
        if (!rawValue) return null;
        if (isCarDiskBarcode(rawValue)) return parseCarDiskBarcode(rawValue);
        return parseDLBarcode(rawValue);
    }, [rawValue]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanTimerRef = useRef<number>(0);

    const [openCvReady, setOpenCvReady] = useState(false);

    useEffect(() => {
        const cvModule = cv as OpenCVModule;

        if (cvModule.onRuntimeInitialized) {
            cvModule.onRuntimeInitialized = () => {
                console.log("OpenCV ready");
                setOpenCvReady(true);
            };
        } else {
            setOpenCvReady(true);
        }
    }, []);

    /** Stop camera hardware only — no React state changes. */
    const stopStream = useCallback(() => {
        clearTimeout(scanTimerRef.current);
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    }, []);

    const startScanning = useCallback(async () => {
        setState({ phase: 'idle' });

        if (!videoRef.current) return;

        try {
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: { exact: 'environment' },
                        width: { ideal: 2560 },
                        height: { ideal: 1440 }
                    }
                });
            } catch {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1920 }, height: { ideal: 1080 } }
                });
            }

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setState({ phase: 'scanning' });

            const SCAN_INTERVAL_MS = 250;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
            const MAX_DECODE_WIDTH = 2048;

            const scan = async () => {
                const video = videoRef.current;
                if (!video || !streamRef.current) return;

                if (video.readyState < video.HAVE_ENOUGH_DATA || video.videoWidth === 0) {
                    scanTimerRef.current = globalThis.setTimeout(scan, SCAN_INTERVAL_MS);
                    return;
                }

                const width = video.videoWidth;
                const height = video.videoHeight;

                const roi = getROI(width, height);
                setRoi(roi);
                const roiX = width * roi.x;
                const roiY = height * roi.y;
                const roiWidth = width * roi.width;
                const roiHeight = height * roi.height;

                const scale = Math.min(1, MAX_DECODE_WIDTH / roiWidth);

                canvas.width = Math.round(roiWidth * scale);
                canvas.height = Math.round(roiHeight * scale);

                ctx.drawImage(
                    video,
                    roiX,
                    roiY,
                    roiWidth,
                    roiHeight,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );


                // Decode outside try/catch so state transitions are never silently swallowed.
                let decoded: DecodeSuccess | null = null;
                try {
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    // Try normal decode first
                    decoded = await tryDecode(imageData);

                    if (!openCvReady) {
                        scanTimerRef.current = globalThis.setTimeout(scan, 250);
                        return;
                    }
                    // If normal fails and OpenCV is ready → attempt perspective correction
                    if (!decoded && openCvReady) {
                        const corrected = perspectiveCorrect(canvas, openCvReady);
                        if (corrected) {
                            decoded = await tryDecode(corrected);
                        }
                    }
                } catch {
                    // no barcode detected this frame
                }

                if (!streamRef.current) return;

                if (decoded) {
                    stopStream();
                    setState({
                        phase: 'result',
                        barcode: {
                            rawValue: decoded.text,
                            format: decoded.format,
                            preprocessor: decoded.preprocessor,
                            binarizer: decoded.binarizer
                        }
                    });
                    return;
                }

                if (streamRef.current) {
                    scanTimerRef.current = globalThis.setTimeout(scan, SCAN_INTERVAL_MS);
                }
            };

            scanTimerRef.current = globalThis.setTimeout(scan, 0);
        } catch {
            setState({ phase: 'idle', error: t('barcodeScanner.cameraError') });
        }
    }, [t, stopStream, openCvReady]);

    useEffect(() => {
        return () => stopStream();
    }, [stopStream]);

    return (
        <Box
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            height='80vh'
            gap={3}
        >
            {state.phase === 'idle' && (
                <>
                    <TmTypography variant='h5' testid='barcodeScannerTitle'>
                        {t('barcodeScanner.title')}
                    </TmTypography>
                    <TmIconButton
                        testid='scanBarcodeButton'
                        size='large'
                        color='primary'
                        onClick={startScanning}
                    >
                        <BsUpcScan size={64} />
                    </TmIconButton>
                    <TmTypography variant='body1' testid='barcodeScannerScanPrompt' color='textSecondary'>
                        {t('barcodeScanner.tapToScan')}
                    </TmTypography>
                    {state.error && (
                        <TmTypography variant='body2' testid='barcodeScannerError' color='error'>
                            {state.error}
                        </TmTypography>
                    )}
                </>
            )}

            <Box width='100%' maxWidth={500} display={state.phase === 'scanning' ? 'block' : 'none'}>
                <Box position="relative" width="100%">
                    <video
                        ref={videoRef}
                        style={{
                            width: '100%',
                            height: 'auto',
                            display: 'block',
                            borderRadius: 8,
                        }}
                        playsInline
                        muted
                    />

                    {state.phase === 'scanning' && roi && (
                        <Box
                            sx={{
                                position: 'absolute',
                                border: '3px solid #00ff88',
                                borderRadius: 2,
                                pointerEvents: 'none',
                                left: `${roi?.x * 100}%`,
                                top: `${roi?.y * 100}%`,
                                width: `${roi?.width * 100}%`,
                                height: `${roi?.height * 100}%`,
                                boxSizing: 'border-box',
                                transform: 'translate(0, 0)',
                            }}
                        />
                    )}
                </Box>
                <Box textAlign='center' mt={2} display='flex' flexDirection='column' alignItems='center' gap={1}>
                    <TmTypography variant='body1' testid='barcodeScannerScanning'>
                        {t('barcodeScanner.scanning')}
                    </TmTypography>
                    <TmIconButton testid='stopScanButton' onClick={() => { stopStream(); setState({ phase: 'idle' }); }} color='error'>
                        <CancelIcon />
                    </TmIconButton>
                </Box>
            </Box>

            {state.phase === 'result' && (
                <Stack gap={2} alignItems='center' width='100%' maxWidth={500}>
                    <TmTypography variant='h6' testid='barcodeScannerResultTitle' color='primary'>
                        {t('barcodeScanner.resultTitle')}
                    </TmTypography>
                    <Box
                        p={3}
                        border='1px solid'
                        borderColor='divider'
                        borderRadius={2}
                        width='100%'
                        maxHeight='60vh'
                        overflow='auto'
                    >
                        <Stack gap={10}>
                            <TmTypography variant='body2' testid='barcodeScannerResultFormat' color='textSecondary'>
                                {t('barcodeScanner.format')}: {state.barcode.format}
                            </TmTypography>
                            <Stack>
                                <TmTypography variant='body1' testid='barcodeScannerResultTitle' color='textSecondary'>
                                    Raw Value:
                                </TmTypography>
                                <TmTypography variant='body1' testid='barcodeScannerResultValue' sx={{ mt: 1, wordBreak: 'break-all' }}>
                                    {state.barcode.rawValue}
                                </TmTypography>
                            </Stack>
                            <Stack>
                                <TmTypography variant='body1' testid='barcodeScannerResultDecodedTitle' color='textSecondary'>
                                    Decoded Value:
                                </TmTypography>
                                <Stack sx={{ mt: 1 }} gap={0.5} data-testid='barcodeScannerResultDecodedValue'>
                                    {parsedBarcode?.parsed ? (
                                        parsedBarcode.fields.map(f => (
                                            <TmTypography key={f.label} testid={`barcodeScannerField-${f.label}`} variant='body2'>
                                                <strong>{f.label}:</strong> {f.value}
                                            </TmTypography>
                                        ))
                                    ) : (
                                        <TmTypography testid='barcodeScannerNoStructuredData' variant='body2' color='textSecondary'>
                                            No structured data detected
                                        </TmTypography>
                                    )}
                                </Stack>
                            </Stack>
                            <Stack>
                                <TmTypography testid='barcodeScannerNoStructuredData' variant='body1' color='textSecondary'>
                                    Debug Info:
                                </TmTypography>

                                <TmTypography testid='barcodeScannerNoStructuredData' variant='body2' sx={{ mt: 1 }}>
                                    <strong>Preprocessor:</strong> {state.barcode.preprocessor}
                                </TmTypography>

                                <TmTypography testid='barcodeScannerNoStructuredData' variant='body2'>
                                    <strong>Binarizer:</strong> {state.barcode.binarizer}
                                </TmTypography>
                            </Stack>
                        </Stack>
                    </Box>
                    <TmIconButton
                        testid='scanAgainButton'
                        size='large'
                        color='primary'
                        onClick={startScanning}
                    >
                        <BsUpcScan size={48} />
                    </TmIconButton>
                    <TmTypography variant='body2' testid='barcodeScannerScanAgain' color='textSecondary'>
                        {t('barcodeScanner.scanAgain')}
                    </TmTypography>
                </Stack>
            )}
        </Box>
    );
}

export default BarcodeScanner;
