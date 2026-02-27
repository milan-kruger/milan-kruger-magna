import CancelIcon from '@mui/icons-material/Cancel';
import { BsUpcScan } from 'react-icons/bs';
import { Box, useMediaQuery, CircularProgress } from '@mui/material';
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

// Optimized for PDF417 (driver's licenses)
const READER_OPTIONS: ReaderOptions = {
    formats: ['PDF417'],
    tryHarder: false, // Keep false for performance
    tryRotate: false,
    tryInvert: false,
    tryDownscale: true, // Enable downscaling for performance
    tryDenoise: true, // Enable denoising for better PDF417 reading
    isPure: false,
    binarizer: 'GlobalHistogram', // Better for PDF417 than LocalAverage
    textMode: 'Plain',
    maxNumberOfSymbols: 1,
    returnErrors: false,
};

// Adaptive scan frequency based on failures
const BASE_SCAN_INTERVAL = 100; // ms
const MAX_SCAN_INTERVAL = 500; // ms

// Warm up WASM
const _wasmReady: Promise<void> = (async () => {
    try {
        const blank = new ImageData(2, 2); // Slightly larger for better warmup
        await readBarcodes(blank, { formats: ['PDF417'], maxNumberOfSymbols: 1 });
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
    const scanTimeoutRef = useRef<number | null>(null);

    // Optimized canvas for cropping
    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    // Parse barcode when result changes - MOVED TO COMPONENT LEVEL
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

        if (scanTimeoutRef.current) {
            clearTimeout(scanTimeoutRef.current);
            scanTimeoutRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setScanning(false);
        setIsProcessing(false);
    }, []);

    // Memoize drawOverlay to prevent unnecessary recreations
    const drawOverlay = useCallback((canvas: HTMLCanvasElement, video: HTMLVideoElement) => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Redraw video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Calculate crop region (same as in processFrame)
        const cropWidth = Math.min(canvas.width * 0.9, 800);
        const cropHeight = cropWidth * 0.5;
        const sx = (canvas.width - cropWidth) / 2;
        const sy = canvas.height * 0.35;

        // Draw semi-transparent overlay
        ctx.fillStyle = 'rgba(0,0,0,0.5)';

        // Top
        ctx.fillRect(0, 0, canvas.width, sy);
        // Bottom
        ctx.fillRect(0, sy + cropHeight, canvas.width, canvas.height - (sy + cropHeight));
        // Left
        ctx.fillRect(0, sy, sx, cropHeight);
        // Right
        ctx.fillRect(sx + cropWidth, sy, canvas.width - (sx + cropWidth), cropHeight);

        // Draw scan region border
        ctx.strokeStyle = failedAttemptsRef.current > 10 ? 'orange' : 'lime';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.strokeRect(sx, sy, cropWidth, cropHeight);
        ctx.setLineDash([]);
    }, []); // No dependencies needed as it uses refs

    const processFrame = useCallback(async () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const offscreen = offscreenCanvasRef.current;
        const offscreenCtx = offscreenCtxRef.current;

        if (!video || !canvas || !offscreen || !offscreenCtx || !streamRef.current) {
            return;
        }

        if (video.readyState < video.HAVE_ENOUGH_DATA) {
            animationRef.current = requestAnimationFrame(processFrame);
            return;
        }

        // Throttle scan rate based on failures
        const now = Date.now();
        const scanInterval = Math.min(
            BASE_SCAN_INTERVAL + failedAttemptsRef.current * 20,
            MAX_SCAN_INTERVAL
        );

        if (now - lastScanTimeRef.current < scanInterval || isProcessing) {
            // Just draw overlay without processing
            drawOverlay(canvas, video);
            animationRef.current = requestAnimationFrame(processFrame);
            return;
        }

        setIsProcessing(true);
        lastScanTimeRef.current = now;

        try {
            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Draw video frame
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Calculate crop region optimized for driver's licenses
            const cropWidth = Math.min(canvas.width * 0.9, 800); // Limit max size for performance
            const cropHeight = cropWidth * 0.5; // PDF417 aspect ratio
            const sx = (canvas.width - cropWidth) / 2;
            const sy = canvas.height * 0.35; // Adjusted for better positioning

            // Resize offscreen canvas for processing
            // Use smaller dimensions for faster processing
            const processingWidth = 640;
            const processingHeight = (cropHeight / cropWidth) * processingWidth;

            offscreen.width = processingWidth;
            offscreen.height = processingHeight;

            // Draw and scale in one operation
            offscreenCtx.drawImage(
                canvas,
                sx, sy, cropWidth, cropHeight,
                0, 0, processingWidth, processingHeight
            );

            // Get image data
            let imageData = offscreenCtx.getImageData(
                0, 0, processingWidth, processingHeight
            );

            // Preprocess with adaptive parameters
            imageData = preprocessGreyscale(imageData, failedAttemptsRef.current);

            // Attempt to read barcode
            const results = await readBarcodes(imageData, READER_OPTIONS);

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

            // Increment failures on no result
            failedAttemptsRef.current += 1;
            setFailedAttempts(failedAttemptsRef.current);

        } catch (err) {
            // Only increment on actual errors
            if (err instanceof Error && !err.message.includes('No barcode found')) {
                failedAttemptsRef.current += 1;
                setFailedAttempts(failedAttemptsRef.current);
            }
        } finally {
            setIsProcessing(false);

            // Draw overlay
            drawOverlay(canvas, video);

            // Schedule next frame
            animationRef.current = requestAnimationFrame(processFrame);
        }
    }, [stopCamera, isProcessing, drawOverlay]);

    const startScanning = useCallback(async () => {
        setError(null);
        setResult(null);
        failedAttemptsRef.current = 0;
        setFailedAttempts(0);
        setIsProcessing(false);

        if (!videoRef.current) return;

        await _wasmReady;

        try {
            // Request higher resolution for better PDF417 reading
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { min: 640, ideal: 1280, max: 1920 },
                    height: { min: 480, ideal: 720, max: 1080 },
                    aspectRatio: { ideal: 4/3 },
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

            // Create optimized offscreen canvas
            const offscreen = document.createElement('canvas');
            const offscreenCtx = offscreen.getContext('2d', {
                willReadFrequently: true,
                alpha: false, // Disable alpha for performance
            });

            if (!offscreenCtx) return;

            offscreenCanvasRef.current = offscreen;
            offscreenCtxRef.current = offscreenCtx;

            setScanning(true);

            // Start processing loop
            animationRef.current = requestAnimationFrame(processFrame);
        } catch (err) {
            setError(t('barcodeScanner.cameraError') + (err instanceof Error ? `: ${err.message}` : ''));
            setScanning(false);
        }
    }, [t, processFrame]);

    useEffect(() => {
        return () => {
            stopCamera();
            // Clean up offscreen canvas
            offscreenCanvasRef.current = null;
            offscreenCtxRef.current = null;
        };
    }, [stopCamera]);

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

                        {/* Raw value - MOVED ABOVE PARSED DATA */}
                        <TmTypography
                            testid="barcodeScannerResultRawValue"
                            variant="body2"
                            sx={{ mt: 2, wordBreak: 'break-all' }}
                        >
                            <strong>Raw Value:</strong> {result.rawValue}
                        </TmTypography>

                        {/* Bytes display */}
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

          {/* Parsed barcode data - BELOW THE BYTES */}
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
