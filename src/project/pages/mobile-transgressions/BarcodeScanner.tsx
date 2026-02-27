import CancelIcon from '@mui/icons-material/Cancel';
import { BsUpcScan } from 'react-icons/bs';
import { Box, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmIconButton from '../../../framework/components/button/TmIconButton';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import { preprocessGreyscale } from './imagePreprocessing';

type BarcodeResult = {
    rawValue: string;
    format: string;
    bytes: Uint8Array;
};

const READER_OPTIONS: ReaderOptions = {
    formats: ['PDF417'],
    tryHarder: false,
    tryRotate: false,
    tryInvert: false,
    tryDownscale: false,
    tryDenoise: false,
    isPure: false,
    binarizer: 'LocalAverage',
    textMode: 'Plain',
    maxNumberOfSymbols: 1,
    returnErrors: false,
};

const _wasmReady: Promise<void> = (async () => {
    try {
        const blank = new ImageData(1, 1);
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

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const offscreenCtxRef = useRef<CanvasRenderingContext2D | null>(null);

    const failedAttemptsRef = useRef<number>(0);

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

        setScanning(false);
    }, []);

    const startScanning = useCallback(async () => {
        setError(null);
        setResult(null);
        failedAttemptsRef.current = 0;
        setFailedAttempts(0);

        if (!videoRef.current) return;

        await _wasmReady;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: 'environment' },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setScanning(true);

            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (!ctx) return;

            // Create reusable offscreen canvas
            const offscreen = document.createElement('canvas');
            const offscreenCtx = offscreen.getContext('2d', {
                willReadFrequently: true,
            });

            if (!offscreenCtx) return;

            offscreenCanvasRef.current = offscreen;
            offscreenCtxRef.current = offscreenCtx;

            const scan = async () => {
                const video = videoRef.current;
                const stream = streamRef.current;
                const offscreen = offscreenCanvasRef.current;
                const offscreenCtx = offscreenCtxRef.current;

                if (!video || !stream || !offscreen || !offscreenCtx) return;

                if (video.readyState >= video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    // Draw video frame
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    const cropWidth = canvas.width * 0.85;
                    const cropHeight = canvas.height * 0.45;
                    const sx = (canvas.width - cropWidth) / 2;
                    const sy = canvas.height * 0.4;

                    // Copy crop into offscreen canvas
                    offscreen.width = cropWidth;
                    offscreen.height = cropHeight;

                    offscreenCtx.drawImage(
                        canvas,
                        sx, sy, cropWidth, cropHeight,
                        0, 0, cropWidth, cropHeight
                    );

                    let imageData = offscreenCtx.getImageData(
                        0,
                        0,
                        cropWidth,
                        cropHeight
                    );

                    imageData = preprocessGreyscale(
                        imageData,
                        failedAttemptsRef.current
                    );

                    try {
                        const results = await readBarcodes(
                            imageData,
                            READER_OPTIONS
                        );

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

                        failedAttemptsRef.current += 1;
                        setFailedAttempts(failedAttemptsRef.current);
                    } catch {
                        failedAttemptsRef.current += 1;
                        setFailedAttempts(failedAttemptsRef.current);
                    }

// ---- DRAW OVERLAY (NO clearRect) ----
                    ctx.fillStyle = 'rgba(0,0,0,0.35)';

// Top
                    ctx.fillRect(0, 0, canvas.width, sy);

// Bottom
                    ctx.fillRect(0, sy + cropHeight, canvas.width, canvas.height - (sy + cropHeight));

// Left
                    ctx.fillRect(0, sy, sx, cropHeight);

// Right
                    ctx.fillRect(sx + cropWidth, sy, canvas.width - (sx + cropWidth), cropHeight);

// Border
                    ctx.strokeStyle = 'lime';
                    ctx.lineWidth = 3;
                    ctx.strokeRect(sx, sy, cropWidth, cropHeight);
                }

                animationRef.current = requestAnimationFrame(scan);
            };

            animationRef.current = requestAnimationFrame(scan);
        } catch {
            setError(t('barcodeScanner.cameraError'));
            setScanning(false);
        }
    }, [t, stopCamera]);

    useEffect(() => {
        return () => stopCamera();
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
                maxWidth={500}
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
                        {t('barcodeScanner.scanning')}
                    </TmTypography>

                    <TmTypography
                        testid="barcodeScannerFailures"
                        variant="body2"
                    >
                        Failures: {failedAttempts}
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
                    maxWidth={500}
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
                    >
                        <TmTypography
                            testid="barcodeScannerResultFormat"
                            variant="body2"
                            color="textSecondary"
                        >
                            Format: {result.format}
                        </TmTypography>

                        <TmTypography
                            testid="barcodeScannerResultRawValue"
                            variant="body2"
                            sx={{ mt: 1, wordBreak: 'break-all' }}
                        >
                            {result.rawValue}
                        </TmTypography>

                        <TmTypography
                            testid="barcodeScannerResultBytes"
                            variant="body2"
                            sx={{
                                mt: 2,
                                wordBreak: 'break-all',
                                fontFamily: 'monospace',
                            }}
                        >
                            {Array.from(result.bytes)
                                .map(b => b.toString(16).padStart(2, '0'))
                                .join(' ')}
                        </TmTypography>
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
