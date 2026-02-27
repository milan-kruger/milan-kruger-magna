import CancelIcon from '@mui/icons-material/Cancel';
import { BsUpcScan } from 'react-icons/bs';
import { Box, useMediaQuery, Stack , CircularProgress } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmIconButton from '../../../framework/components/button/TmIconButton';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import { preprocessGreyscale } from './imagePreprocessing';
import { parseDLBarcode } from './dlBarcodeParser.ts';
import { parseCarDiskBarcode, isCarDiskBarcode } from './carDiskBarcodeParser.ts';

type BarcodeResult = {
    rawValue: string;
    format: string;
    bytes: Uint8Array;
};

// Multiple reader configurations for different scenarios
const READER_CONFIGS: ReaderOptions[] = [
    // Fast scan - minimal processing
    {
        formats: ['PDF417'],
        tryHarder: false,
        tryRotate: false,
        tryInvert: false,
        tryDownscale: true,
        tryDenoise: false,
        isPure: false,
        binarizer: 'GlobalHistogram',
        textMode: 'Plain',
        maxNumberOfSymbols: 1,
        returnErrors: false,
    },
    // Medium scan - with denoising
    {
        formats: ['PDF417'],
        tryHarder: false,
        tryRotate: false,
        tryInvert: false,
        tryDownscale: true,
        tryDenoise: true,
        isPure: false,
        binarizer: 'GlobalHistogram',
        textMode: 'Plain',
        maxNumberOfSymbols: 1,
        returnErrors: false,
    },
    // Thorough scan - try harder if needed
    {
        formats: ['PDF417'],
        tryHarder: true,
        tryRotate: true,
        tryInvert: false,
        tryDownscale: true,
        tryDenoise: true,
        isPure: false,
        binarizer: 'GlobalHistogram',
        textMode: 'Plain',
        maxNumberOfSymbols: 1,
        returnErrors: false,
    }
];

// Much faster scan intervals
const BASE_SCAN_INTERVAL = 16; // ~60fps
const MAX_SCAN_INTERVAL = 100; // 10fps minimum
const CONCURRENT_SCANS = 5; // Number of concurrent scan attempts

// Warm up WASM with multiple formats
const _wasmReady: Promise<void> = (async () => {
    try {
        // Warm up with multiple small images to initialize all paths
        const blank1 = new ImageData(4, 4);
        const blank2 = new ImageData(4, 4);
        await Promise.allSettled([
            readBarcodes(blank1, READER_CONFIGS[0]),
            readBarcodes(blank2, READER_CONFIGS[1])
        ]);
    } catch {
        // warm cache
    }
})();

function BarcodeScanner() {
    const { t } = useTranslation();
    const isPortrait = useMediaQuery('(orientation: portrait)');

    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<BarcodeResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [failedAttempts, setFailedAttempts] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const lastScanTimeRef = useRef<number>(0);
    const failedAttemptsRef = useRef<number>(0);
    const frameCountRef = useRef<number>(0);
    const scanResultsRef = useRef<BarcodeResult[]>([]);
    const processingQueueRef = useRef<boolean>(false);

    // Multiple offscreen canvases for concurrent processing
    const offscreenCanvasesRef = useRef<HTMLCanvasElement[]>([]);
    const offscreenContextsRef = useRef<CanvasRenderingContext2D[]>([]);

    // Parse barcode when result changes
    const parsedBarcode = useMemo(() => {
        if (!result) return null;
        if (isCarDiskBarcode(result.rawValue)) return parseCarDiskBarcode(result.rawValue);
        return parseDLBarcode(result.rawValue);
    }, [result]);

    const stopCamera = useCallback(() => {
        if (animationRef.current !== null) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        // Clean up offscreen canvases
        offscreenCanvasesRef.current = [];
        offscreenContextsRef.current = [];

        setScanning(false);
        setIsProcessing(false);
        processingQueueRef.current = false;
    }, []);

    // Optimized drawOverlay with minimal operations
    const drawOverlay = useCallback((canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear and draw video frame
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Calculate crop region
        const cropWidth = Math.min(canvas.width * 0.9, 800);
        const cropHeight = cropWidth * 0.5;
        const sx = (canvas.width - cropWidth) / 2;
        const sy = canvas.height * 0.35;

        // Draw overlay with pre-calculated dimensions
        ctx.fillStyle = 'rgba(0,0,0,0.5)';

        // Batch fill operations
        ctx.fillRect(0, 0, canvas.width, sy);
        ctx.fillRect(0, sy + cropHeight, canvas.width, canvas.height - (sy + cropHeight));
        ctx.fillRect(0, sy, sx, cropHeight);
        ctx.fillRect(sx + cropWidth, sy, canvas.width - (sx + cropWidth), cropHeight);

        // Draw border
        ctx.strokeStyle = failedAttemptsRef.current > 10 ? 'orange' : 'lime';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(sx, sy, cropWidth, cropHeight);
        ctx.setLineDash([]);
    }, []);

    // Concurrent frame processing
    const processFrameConcurrent = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !streamRef.current || processingQueueRef.current) {
            animationRef.current = requestAnimationFrame(processFrameConcurrent);
            return;
        }

        if (video.readyState < video.HAVE_ENOUGH_DATA) {
            animationRef.current = requestAnimationFrame(processFrameConcurrent);
            return;
        }

        // Throttle based on failures, but much faster
        const now = Date.now();
        const scanInterval = Math.min(
            BASE_SCAN_INTERVAL + failedAttemptsRef.current,
            MAX_SCAN_INTERVAL
        );

        if (now - lastScanTimeRef.current < scanInterval) {
            drawOverlay(canvas, video);
            animationRef.current = requestAnimationFrame(processFrameConcurrent);
            return;
        }

        lastScanTimeRef.current = now;
        frameCountRef.current++;

        // Set canvas dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return;

        // Draw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Calculate crop region
        const cropWidth = Math.min(canvas.width * 0.9, 800);
        const cropHeight = cropWidth * 0.5;
        const sx = (canvas.width - cropWidth) / 2;
        const sy = canvas.height * 0.35;

        // Prepare multiple processing sizes for concurrent scanning
        const processingSizes = [
            { width: 640, height: 320 }, // Very fast
            { width: 960, height: 480 }, // Medium
            { width: 1280, height: 640 }, // Standard
        ];

        // Ensure we have enough offscreen canvases
        while (offscreenCanvasesRef.current.length < CONCURRENT_SCANS) {
            const offscreen = document.createElement('canvas');
            const offscreenCtx = offscreen.getContext('2d', {
                willReadFrequently: true,
                alpha: false,
            });
            if (offscreenCtx) {
                offscreenCanvasesRef.current.push(offscreen);
                offscreenContextsRef.current.push(offscreenCtx);
            }
        }

        // Queue concurrent scans
        processingQueueRef.current = true;
        setIsProcessing(true);

        try {
            // Prepare image data for each size concurrently
            const scanPromises = [];

            for (let i = 0; i < CONCURRENT_SCANS; i++) {
                const size = processingSizes[i % processingSizes.length];
                const offscreenCanvas = offscreenCanvasesRef.current[i];
                const offscreenCtx = offscreenContextsRef.current[i];

                if (!offscreenCanvas || !offscreenCtx) continue;

                offscreenCanvas.width = size.width;
                offscreenCanvas.height = size.height;

                // Draw and scale in one operation
                offscreenCtx.drawImage(
                    canvas,
                    sx, sy, cropWidth, cropHeight,
                    0, 0, size.width, size.height
                );

                // Get image data
                let imageData = offscreenCtx.getImageData(0, 0, size.width, size.height);

                // Apply preprocessing based on failure count
                if (failedAttemptsRef.current > 5) {
                    imageData = preprocessGreyscale(imageData, failedAttemptsRef.current);
                }

                // Use different reader configs for different scans
                const configIndex = Math.min(i, READER_CONFIGS.length - 1);

                scanPromises.push(
                    readBarcodes(imageData, READER_CONFIGS[configIndex])
                        .then(results => ({ results, configIndex }))
                        .catch(() => ({ results: [], configIndex }))
                );
            }

            // Wait for all concurrent scans to complete
            const scanResults = await Promise.all(scanPromises);

            // Check if any scan found a barcode
            for (const { results } of scanResults) {
                if (results.length > 0) {
                    const decoded = results[0];
                    setResult({
                        rawValue: decoded.text,
                        format: decoded.format,
                        bytes: decoded.bytes,
                    });
                    stopCamera();
                    return;
                }
            }

            // No barcode found - increment failures
            failedAttemptsRef.current += 1;
            setFailedAttempts(failedAttemptsRef.current);

        } catch (err) {
            if (err instanceof Error && !err.message.includes('No barcode found')) {
                failedAttemptsRef.current += 1;
                setFailedAttempts(failedAttemptsRef.current);
            }
        } finally {
            setIsProcessing(false);
            processingQueueRef.current = false;
            drawOverlay(canvas, video);
            animationRef.current = requestAnimationFrame(processFrameConcurrent);
        }
    }, [stopCamera, drawOverlay]);

    const startScanning = useCallback(async () => {
        setError(null);
        setResult(null);
        failedAttemptsRef.current = 0;
        setFailedAttempts(0);
        setIsProcessing(false);
        processingQueueRef.current = false;
        scanResultsRef.current = [];

        if (!videoRef.current) return;

        await _wasmReady;

        try {
            // Request higher frame rate
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 },
                    frameRate: { ideal: 30, max: 60 }, // Request higher FPS
                },
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;

            // Wait for video to be ready
            await new Promise((resolve) => {
                if (!videoRef.current) return;
                videoRef.current.onloadedmetadata = resolve;
            });

            await videoRef.current.play();

            // Pre-create offscreen canvases
            for (let i = 0; i < CONCURRENT_SCANS; i++) {
                const offscreen = document.createElement('canvas');
                const offscreenCtx = offscreen.getContext('2d', {
                    willReadFrequently: true,
                    alpha: false,
                });
                if (offscreenCtx) {
                    offscreenCanvasesRef.current.push(offscreen);
                    offscreenContextsRef.current.push(offscreenCtx);
                }
            }

            setScanning(true);

            // Start processing loop
            animationRef.current = requestAnimationFrame(processFrameConcurrent);
        } catch (err) {
            setError(t('barcodeScanner.cameraError') + (err instanceof Error ? `: ${err.message}` : ''));
            setScanning(false);
        }
    }, [t, processFrameConcurrent]);

    useEffect(() => {
        return () => {
            stopCamera();
        };
    }, [stopCamera]);

    // Rest of the JSX remains exactly the same...
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            height="80vh"
            gap={3}
        >
            {!scanning && !result && (
                <>
                    <TmTypography
                        testid="barcodeScannerTitle"
                        variant="h5"
                    >
                        {t('barcodeScanner.title')}
                    </TmTypography>

                    <TmIconButton
                        testid="scanBarcodeButton"
                        size="large"
                        color="primary"
                        onClick={startScanning}
                    >
                        <BsUpcScan size={64} />
                    </TmIconButton>

                    <TmTypography
                        testid="barcodeScannerScanPrompt"
                        variant="body1"
                        color="textSecondary"
                    >
                        {t('barcodeScanner.tapToScan')}
                    </TmTypography>

                    {error && (
                        <TmTypography
                            testid="barcodeScannerError"
                            variant="body2"
                            color="error"
                        >
                            {error}
                        </TmTypography>
                    )}
                </>
            )}

            <Box
                width="100%"
                maxWidth={600}
                display={scanning ? 'block' : 'none'}
            >
                <video
                    ref={videoRef}
                    style={{ display: 'none' }}
                    playsInline
                    muted
                />

                <canvas
                    ref={canvasRef}
                    style={{
                        width: '100%',
                        height: isPortrait ? '70vh' : 'auto',
                        maxHeight: '70vh',
                        objectFit: 'contain',
                        borderRadius: 8,
                        display: 'block',
                    }}
                />

                <Box textAlign="center" mt={2}>
                    <TmTypography
                        testid="barcodeScannerScanning"
                        variant="body1"
                    >
                        {isProcessing ? t('barcodeScanner.processing') : t('barcodeScanner.scanning')}
                    </TmTypography>

                    {isProcessing && (
                        <CircularProgress size={20} sx={{ ml: 1 }} />
                    )}

                    <TmTypography
                        testid="barcodeScannerFailures"
                        variant="body2"
                        color={failedAttempts > 20 ? 'warning' : 'textSecondary'}
                    >
                        {t('barcodeScanner.attempts')}: {failedAttempts}
                    </TmTypography>

                    <TmIconButton
                        testid="stopScanButton"
                        onClick={stopCamera}
                        color="error"
                    >
                        <CancelIcon />
                    </TmIconButton>
                </Box>
            </Box>

            {result && !scanning && (
                <Box
                    width="100%"
                    maxWidth={600}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={2}
                >
                    <TmTypography
                        testid="barcodeScannerResultTitle"
                        variant="h6"
                        color="primary"
                    >
                        {t('barcodeScanner.resultTitle')}
                    </TmTypography>

                    <Box
                        p={3}
                        border="1px solid"
                        borderColor="divider"
                        borderRadius={2}
                        width="100%"
                        maxHeight="60vh"
                        overflow="auto"
                        bgcolor="background.paper"
                    >
                        <TmTypography
                            testid="barcodeScannerResultFormat"
                            variant="body2"
                            color="textSecondary"
                        >
                            {t('barcodeScanner.format')}: {result.format}
                        </TmTypography>

                        <TmTypography
                            testid="barcodeScannerResultRawValue"
                            variant="body2"
                            sx={{ mt: 2, wordBreak: 'break-all' }}
                        >
                            <strong>Raw Value:</strong> {result.rawValue}
                        </TmTypography>

                        {result.bytes.length > 0 && (
                            <TmTypography
                                testid="barcodeScannerResultBytes"
                                variant="caption"
                                sx={{
                                    mt: 2,
                                    wordBreak: 'break-all',
                                    fontFamily: 'monospace',
                                    display: 'block',
                                    bgcolor: 'action.hover',
                                    p: 1,
                                    borderRadius: 1,
                                }}
                            >
                                <strong>Bytes:</strong> {Array.from(result.bytes)
                                    .slice(0, 50)
                                    .map(b => b.toString(16).padStart(2, '0'))
                                    .join(' ')}
                                {result.bytes.length > 50 && '...'}
                            </TmTypography>
                        )}

                        {parsedBarcode && (
                            <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                <TmTypography
                                    variant='body1'
                                    testid='barcodeScannerResultDecodedTitle'
                                    color='textSecondary'
                                >
                                    Decoded Value:
                                </TmTypography>
                                <Stack sx={{ mt: 1 }} gap={0.5} data-testid='barcodeScannerResultDecodedValue'>
                                    {parsedBarcode.parsed ? (
                                        parsedBarcode.fields.map(f => (
                                            <TmTypography
                                                key={f.label}
                                                testid={`barcodeScannerField-${f.label}`}
                                                variant='body2'
                                            >
                                                <strong>{f.label}:</strong> {f.value}
                                            </TmTypography>
                                        ))
                                    ) : (
                                        <TmTypography
                                            testid='barcodeScannerNoStructuredData'
                                            variant='body2'
                                            color='textSecondary'
                                        >
                                            No structured data detected
                                        </TmTypography>
                                    )}
                                </Stack>
                            </Box>
                        )}
                    </Box>

                    <TmIconButton
                        testid="scanAgainButton"
                        size="large"
                        color="primary"
                        onClick={startScanning}
                    >
                        <BsUpcScan size={48} />
                    </TmIconButton>

                    <TmTypography
                        testid="barcodeScannerScanAgain"
                        variant="body2"
                        color="textSecondary"
                    >
                        {t('barcodeScanner.scanAgain')}
                    </TmTypography>
                </Box>
            )}
        </Box>
    );
}

export default BarcodeScanner;
