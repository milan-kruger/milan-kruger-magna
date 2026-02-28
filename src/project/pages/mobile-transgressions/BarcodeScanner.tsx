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
    tryDownscale: true,
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
async function tryDecode(imageData: ImageData): Promise<{ text: string; format: string } | null> {

    const base64 = imageDataToBase64(imageData);

    console.log('Base64 Image:', base64);
    console.log('Base64 only:', base64.split(',')[1]); // optional

    let results = await readBarcodes(imageData, wasmReaderOptions);
    if (results.length === 0 || !results[0].isValid) {
        results = await readBarcodes(imageData, wasmReaderOptionsFallback);
    }
    if (results.length > 0 && results[0].isValid && results[0].text) {
        return { text: results[0].text, format: results[0].format };
    }
    return null;
}

function getROI(width: number, height: number) {
    const isPortrait = height > width;

    if (isPortrait) {
        // For portrait: wider rectangle in the middle vertically
        const roiWidth = 0.4;  // 80% of screen width
        const roiHeight = 0.7; // 40% of screen height

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
//
// function toGrayscale(imageData: ImageData): ImageData {
//     const data = imageData.data;
//
//     for (let i = 0; i < data.length; i += 4) {
//         // Standard luminance formula (Rec. 709)
//         const gray = (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;
//
//         data[i] = gray;     // Red
//         data[i + 1] = gray; // Green
//         data[i + 2] = gray; // Blue
//         // data[i + 3] is alpha, leave unchanged
//     }
//
//     return imageData;
// }
//
// function contrastStretch(imageData: ImageData): ImageData {
//     const data = imageData.data;
//
//     let min = 255;
//     let max = 0;
//
//     // First pass: compute luminance min/max
//     for (let i = 0; i < data.length; i += 4) {
//         const lum = (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;
//         if (lum < min) min = lum;
//         if (lum > max) max = lum;
//     }
//
//     if (max === min) return imageData;
//
//     const scale = 255 / (max - min);
//
//     // Second pass: apply stretch
//     for (let i = 0; i < data.length; i += 4) {
//         const lum = (77 * data[i] + 150 * data[i + 1] + 29 * data[i + 2]) >> 8;
//         const stretched = Math.max(0, Math.min(255, (lum - min) * scale));
//
//         data[i] = stretched;
//         data[i + 1] = stretched;
//         data[i + 2] = stretched;
//     }
//
//     return imageData;
// }

// function adaptiveLocalContrastAndThreshold(imageData: ImageData, tileSize = 32): ImageData {
//     const { width, height, data } = imageData;
//
//     for (let ty = 0; ty < height; ty += tileSize) {
//         for (let tx = 0; tx < width; tx += tileSize) {
//
//             let min = 255;
//             let max = 0;
//             let sum = 0;
//             let count = 0;
//
//             const yEnd = Math.min(ty + tileSize, height);
//             const xEnd = Math.min(tx + tileSize, width);
//
//             // First pass: find min, max, and sum
//             for (let y = ty; y < yEnd; y++) {
//                 for (let x = tx; x < xEnd; x++) {
//                     const idx = (y * width + x) * 4;
//                     const lum = (77 * data[idx] + 150 * data[idx + 1] + 29 * data[idx + 2]) >> 8;
//
//                     if (lum < min) min = lum;
//                     if (lum > max) max = lum;
//                     sum += lum;
//                     count++;
//                 }
//             }
//
//             if (max === min) continue;
//
//             const avg = sum / count;
//             const scale = 255 / (max - min);
//
//             // Second pass: apply contrast stretch AND threshold
//             for (let y = ty; y < yEnd; y++) {
//                 for (let x = tx; x < xEnd; x++) {
//                     const idx = (y * width + x) * 4;
//                     const lum = (77 * data[idx] + 150 * data[idx + 1] + 29 * data[idx + 2]) >> 8;
//
//                     // First stretch the contrast
//                     const stretched = Math.max(0, Math.min(255, (lum - min) * scale));
//
//                     // Then threshold based on the stretched value
//                     // Using the local average as threshold (but adjusted to stretched range)
//                     const threshold = Math.max(0, Math.min(255, (avg - min) * scale));
//                     const final = stretched >= threshold ? 255 : 0;
//
//                     data[idx] = final;
//                     data[idx + 1] = final;
//                     data[idx + 2] = final;
//                 }
//             }
//         }
//     }
//
//     return imageData;
// }

function multiPassAdaptiveThreshold(imageData: ImageData): ImageData {
    const { width, height, data } = imageData;

    // Create a working copy if you want to preserve original
    const workingData = new Uint8ClampedArray(data);

    // First pass: large tiles for overall lighting compensation
    const largeTileResults = new Float32Array(width * height);

    // Pass 1: Large tiles (128) - capture overall lighting
    for (let ty = 0; ty < height; ty += 128) {
        for (let tx = 0; tx < width; tx += 128) {
            const yEnd = Math.min(ty + 128, height);
            const xEnd = Math.min(tx + 128, width);

            // Calculate local average for large tile
            let sum = 0;
            let count = 0;
            for (let y = ty; y < yEnd; y++) {
                for (let x = tx; x < xEnd; x++) {
                    const idx = (y * width + x) * 4;
                    sum += workingData[idx];
                    count++;
                }
            }
            const avg = sum / count;

            // Store the average for each pixel in this tile
            for (let y = ty; y < yEnd; y++) {
                for (let x = tx; x < xEnd; x++) {
                    largeTileResults[y * width + x] = avg;
                }
            }
        }
    }

    // Pass 2: Small tiles (32) - capture fine details
    for (let ty = 0; ty < height; ty += 32) {
        for (let tx = 0; tx < width; tx += 32) {
            const yEnd = Math.min(ty + 32, height);
            const xEnd = Math.min(tx + 32, width);

            // Calculate local average for small tile
            let sum = 0;
            let count = 0;
            for (let y = ty; y < yEnd; y++) {
                for (let x = tx; x < xEnd; x++) {
                    const idx = (y * width + x) * 4;
                    sum += workingData[idx];
                    count++;
                }
            }
            const smallAvg = sum / count;

            // Apply threshold using weighted combination
            for (let y = ty; y < yEnd; y++) {
                for (let x = tx; x < xEnd; x++) {
                    const idx = (y * width + x) * 4;
                    const pixelValue = workingData[idx];

                    // Blend large and small tile averages
                    // Small tile has more weight for detail, large tile prevents over-segmentation
                    const blendedThreshold = (smallAvg * 0.7 + largeTileResults[y * width + x] * 0.3);

                    const final = pixelValue >= blendedThreshold ? 255 : 0;

                    data[idx] = final;
                    data[idx + 1] = final;
                    data[idx + 2] = final;
                }
            }
        }
    }

    return imageData;
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
                    video: { facingMode: { exact: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } }
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

            const SCAN_INTERVAL_MS = 150;
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
            const MAX_DECODE_WIDTH = 1440;

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

                    // toGrayscale(imageData);

                    //contrastStretch(imageData);

                    //adaptiveLocalContrastAndThreshold(imageData, 16);

                    multiPassAdaptiveThreshold(imageData);


                    decoded = await tryDecode(imageData);
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
    }, [t, stopStream]);

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
