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
        const roiWidth = 0.4;  // 40% of screen width
        const roiHeight = 0.7; // 80% of screen height

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

/** Try decoding with primary binarizer, then fallback binarizer. */
async function tryDecode(
    originalImageData: ImageData
): Promise<{ text: string; format: string } | null> {

    for (const { name, fn } of preprocessors) {

        const imageData = cloneImageData(originalImageData);

        try {
            fn(imageData);
        } catch {
            continue;
        }
        console.log(`Preprocessor: ${name}`);
        console.log(imageDataToBase64(imageData));
        // Try LocalAverage first
        let results = await readBarcodes(imageData, wasmReaderOptions);

        if (results.length > 0 && results[0].isValid && results[0].text) {
            return { text: results[0].text, format: results[0].format };
        }

        // Only fallback for lightweight passes
        if (name === 'none' || name === 'contrast') {
            results = await readBarcodes(imageData, wasmReaderOptionsFallback);

            if (results.length > 0 && results[0].isValid && results[0].text) {
                return { text: results[0].text, format: results[0].format };
            }
        }
    }

    return null;
}
type OpenCVModule = typeof cv & {
    onRuntimeInitialized?: () => void;
};

function perspectiveCorrect(
    canvas: HTMLCanvasElement,
    openCvReady: boolean
): ImageData | null {

    if (!openCvReady) return null;

    const src = cv.imread(canvas);
    const gray = new cv.Mat();
    const blurred = new cv.Mat();
    const edges = new cv.Mat();
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();

    try {
        cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
        cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0);
        cv.Canny(blurred, edges, 75, 200);

        cv.findContours(
            edges,
            contours,
            hierarchy,
            cv.RETR_EXTERNAL,
            cv.CHAIN_APPROX_SIMPLE
        );

        let biggest = null;
        let maxArea = 0;

        for (let i = 0; i < contours.size(); i++) {
            const cnt = contours.get(i);
            const area = cv.contourArea(cnt);

            if (area > maxArea) {
                const approx = new cv.Mat();
                cv.approxPolyDP(cnt, approx, 0.02 * cv.arcLength(cnt, true), true);

                if (approx.rows === 4) {
                    biggest = approx;
                    maxArea = area;
                } else {
                    approx.delete();
                }
            }
        }

        if (!biggest) {
            return null;
        }

        const width = 1000;
        const height = 400;

        const srcTri = cv.matFromArray(4, 1, cv.CV_32FC2, biggest.data32F);
        const dstTri = cv.matFromArray(4, 1, cv.CV_32FC2, [
            0, 0,
            width, 0,
            width, height,
            0, height
        ]);

        const M = cv.getPerspectiveTransform(srcTri, dstTri);
        const warped = new cv.Mat();
        cv.warpPerspective(src, warped, M, new cv.Size(width, height));

        const result = new ImageData(
            new Uint8ClampedArray(warped.data),
            warped.cols,
            warped.rows
        );

        // Cleanup
        src.delete();
        gray.delete();
        blurred.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
        biggest.delete();
        srcTri.delete();
        dstTri.delete();
        M.delete();
        warped.delete();

        return result;
    } catch {
        src.delete();
        gray.delete();
        blurred.delete();
        edges.delete();
        contours.delete();
        hierarchy.delete();
        return null;
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
                let decoded: { text: string; format: string } | null = null;
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
                    setState({ phase: 'result', barcode: { rawValue: decoded.text, format: decoded.format } });
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
