import CancelIcon from '@mui/icons-material/Cancel';
import { BsUpcScan } from 'react-icons/bs';
import { Box, Stack } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmIconButton from '../../../framework/components/button/TmIconButton';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import {
    decodeNamibiaLicenceForUI as decodeNamibiaLicence,
    type ParsedField
} from './dlBarcodeParser';
import { parseCarDiskBarcode, isCarDiskBarcode } from './carDiskBarcodeParser';
import {cloneImageData, preprocessors, toGrayscale} from './imagePreprocessing';
import { perspectiveCorrect, OpenCVModule } from './cvProcessing';
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
    tryDownscale: true,
    tryDenoise: true,      // experimental; expensive on mobile CPUs
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

// Define a centered rectangular ROI that covers most of the screen, with different aspect ratios for portrait vs landscape.
// This helps ZXing focus on the barcode and ignore irrelevant background clutter,
// improving both performance and accuracy.
function getROI(width: number, height: number) {
    const isPortrait = height > width;

    if (isPortrait) {
        // For portrait: wider rectangle in the middle horizontally
        const roiWidth = 0.8;  // 80% of screen width
        const roiHeight = 0.15; // 15% of screen height

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

// Optionally shrink the ROI slightly to avoid edge artifacts that can interfere with decoding.
function shrinkROI(
    roi: ReturnType<typeof getROI>,
    shrinkFactor = 0.1 // 10% smaller
) {
    const newWidth = roi.width * (1 - shrinkFactor);
    const newHeight = roi.height * (1 - shrinkFactor);

    return {
        x: roi.x + (roi.width - newWidth) / 2,
        y: roi.y + (roi.height - newHeight) / 2,
        width: newWidth,
        height: newHeight
    };
}

type DecodeSuccess = {
    text: string;
    format: string;
    preprocessor: string;
    binarizer: 'LocalAverage' | 'GlobalHistogram';
};

/** Try decoding with primary binarizer, then fallback binarizer. */
async function tryDecodeSingle(
    originalImageData: ImageData,
    preprocessorIndex: number
): Promise<DecodeSuccess | null> {

    const { name, fn } = preprocessors[preprocessorIndex];

    // const imageData = toGrayscale(cloneImageData(originalImageData));

    const imageData = cloneImageData(originalImageData);


    try {
        fn(imageData);
    } catch {
        return null;
    }

    let results = await readBarcodes(imageData, wasmReaderOptions);

    if (results.length > 0 && results[0].isValid && results[0].text) {
        return {
            text: results[0].text,
            format: results[0].format,
            preprocessor: name,
            binarizer: 'LocalAverage'
        };
    }

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

    return null;
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
        return decodeNamibiaLicence(rawValue);
    }, [rawValue]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanTimerRef = useRef<number>(0);

    const [openCvReady, setOpenCvReady] = useState(false);
    const visualRoi = roi ? shrinkROI(roi, 0.1) : null;

    const preprocessorIndexRef = useRef(0);


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

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
            const MAX_DECODE_WIDTH = 2048;

            preprocessorIndexRef.current = 0;

            const TARGET_FPS = 6;
            const FRAME_INTERVAL = 1000 / TARGET_FPS;

            const scan = async () => {
                const video = videoRef.current;
                if (!video || !streamRef.current) return;

                if (video.readyState < video.HAVE_ENOUGH_DATA || video.videoWidth === 0) {
                    scanTimerRef.current = globalThis.setTimeout(scan, 50);
                    return;
                }

                const frameStart = performance.now();

                // Draw frame
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
                    let frame = ctx.getImageData(0, 0, canvas.width, canvas.height);

                    // Do perspective correction if OpenCV is ready, otherwise just grayscale.
                    // Perspective correction can help with angled barcodes but is expensive, so we only do it when OpenCV is available and skip it on fallback attempts.
                    // This naturally means frame is always grayscale when passed to ZXing, which is a nice optimization since ZXing doesn't care about color and it saves us from having to convert back and forth for OpenCV.
                    if (openCvReady) {
                        const corrected = perspectiveCorrect(canvas, openCvReady);
                        if (corrected) {
                            frame = corrected; // already grayscale
                        } else {
                            frame = toGrayscale(frame);
                        }
                    } else {
                        frame = toGrayscale(frame);
                    }
                    const idx = preprocessorIndexRef.current;

                    decoded = await tryDecodeSingle(frame, idx);

                    // Advance for next frame
                    preprocessorIndexRef.current =
                        (preprocessorIndexRef.current + 1) % preprocessors.length;

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

                const elapsed = performance.now() - frameStart;
                const delay = Math.max(0, FRAME_INTERVAL - elapsed);

                if (streamRef.current) {
                    scanTimerRef.current = globalThis.setTimeout(scan, delay);
                }
            };
            scanTimerRef.current = setTimeout(scan, 0);
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
                                // Visual ROI is a slightly smaller rectangle inside the actual ROI to avoid edge artifacts that can interfere with decoding.
                                left: `${visualRoi!.x * 100}%`,
                                top: `${visualRoi!.y * 100}%`,
                                width: `${visualRoi!.width * 100}%`,
                                height: `${visualRoi!.height * 100}%`,
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
                                        parsedBarcode.fields.map((f: ParsedField) => (
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
