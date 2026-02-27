import CancelIcon from '@mui/icons-material/Cancel';
import { BsUpcScan } from 'react-icons/bs';
import { Box, Stack, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmIconButton from '../../../framework/components/button/TmIconButton';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import { parseDLBarcode } from './dlBarcodeParser';
import { preprocessGreyscale } from './imagePreprocessing';

type BarcodeResult = {
    rawValue: string;
    format: string;
    bytes: Uint8Array;
};

/** Shared reader options (allocated once) */
const READER_OPTIONS: ReaderOptions = {
    formats: ['PDF417'],
    tryHarder: true,
    tryRotate: true,
    tryInvert: false,        // printed barcodes don't need inversion — saves ~15-20%
    tryDownscale: true,
    downscaleFactor: 3,      // more aggressive downscale for faster decode
    downscaleThreshold: 400,
    tryDenoise: true,
    isPure: false,
    binarizer: 'LocalAverage',
    minLineCount: 2,         // slightly lower → faster first-hit; still reliable for PDF417
    textMode: 'Plain',
    maxNumberOfSymbols: 1,
    returnErrors: false,
};


/**
 * Pre-warm the WASM module at import time so the binary is fetched,
 * compiled, and instantiated before the user ever taps "Scan".
 * The promise is intentionally fire-and-forget.
 */
const _wasmReady: Promise<void> = (async () => {
    try {
        // A minimal no-op call that forces the WASM module to load.
        // 1×1 transparent ImageData won't find any barcode but will
        // trigger download + compilation of the .wasm file.
        const blank = new ImageData(1, 1);
        await readBarcodes(blank, { formats: ['PDF417'], maxNumberOfSymbols: 1 });
    } catch {
        // ignore — module is still cached for subsequent real calls
    }
})();

function BarcodeScanner() {
    const { t } = useTranslation();
    const isPortrait = useMediaQuery('(orientation: portrait)');

    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<BarcodeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parsedBarcode = useMemo(
        () => (result ? parseDLBarcode(result.rawValue) : null),
        [result]
    );

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanTimerRef = useRef<number>(0);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const failedAttemptsRef = useRef<number>(0);

    const stopCamera = useCallback(() => {
        clearTimeout(scanTimerRef.current);
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

        if (!videoRef.current) return;

        // Ensure WASM is ready before we start scanning frames
        await _wasmReady;

        try {
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { exact: 'environment' },
                        // 1080p is plenty for PDF417 and processes ~4× faster than 4K
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                });
            } catch {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 1920 },
                        height: { ideal: 1080 },
                    },
                });
            }

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setScanning(true);

            // Reuse a single canvas + context across frames to avoid GC pressure
            if (!canvasRef.current) {
                canvasRef.current = document.createElement('canvas');
                ctxRef.current = canvasRef.current.getContext('2d', { willReadFrequently: true })!;
            }
            const canvas = canvasRef.current;
            const ctx = ctxRef.current!;

            const SCAN_INTERVAL_MS = 120; // tighter loop since each frame is cheaper

            const scan = async () => {
                const video = videoRef.current;
                if (!video || !streamRef.current) return;

                if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    try {
                        const rawImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const imageData = preprocessGreyscale(rawImageData, failedAttemptsRef.current);
                        const results = await readBarcodes(imageData, READER_OPTIONS);

                        if (results.length > 0) {
                            failedAttemptsRef.current = 0;
                            const decoded = results[0];
                            setResult({
                                rawValue: decoded.text,
                                format: decoded.format,
                                bytes: decoded.bytes,
                            });
                            stopCamera();
                            return;
                        }

                        failedAttemptsRef.current++;
                    } catch {
                        failedAttemptsRef.current++;
                        // No barcode in this frame, keep scanning
                    }
                }

                scanTimerRef.current = globalThis.setTimeout(scan, SCAN_INTERVAL_MS);
            };

            scanTimerRef.current = globalThis.setTimeout(scan, 0);
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
            display='flex'
            flexDirection='column'
            alignItems='center'
            justifyContent='center'
            height='80vh'
            gap={3}
        >
            {!scanning && !result && (
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
                    {error && (
                        <TmTypography variant='body2' testid='barcodeScannerError' color='error'>
                            {error}
                        </TmTypography>
                    )}
                </>
            )}

            <Box width='100%' maxWidth={500} display={scanning ? 'block' : 'none'}>
                <video
                    ref={videoRef}
                    style={{
                        width: '100%',
                        height: isPortrait ? '70vh' : 'auto',
                        objectFit: isPortrait ? 'cover' : 'unset',
                        borderRadius: 8,
                        display: 'block',
                    }}
                    playsInline
                    muted
                />
                <Box textAlign='center' mt={2} display='flex' flexDirection='column' alignItems='center' gap={1}>
                    <TmTypography variant='body1' testid='barcodeScannerScanning'>
                        {t('barcodeScanner.scanning')}
                    </TmTypography>
                    <TmIconButton testid='stopScanButton' onClick={stopCamera} color='error'>
                        <CancelIcon />
                    </TmIconButton>
                </Box>
            </Box>

            {result && (
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
                                {t('barcodeScanner.format')}: {result.format}
                            </TmTypography>
                            <Stack>
                                <TmTypography variant='body1' testid='barcodeScannerResultTitle' color='textSecondary'>
                                    Raw Value:
                                </TmTypography>
                                <TmTypography variant='body1' testid='barcodeScannerResultValue' sx={{ mt: 1, wordBreak: 'break-all' }}>
                                    {result.rawValue}
                                </TmTypography>
                            </Stack>
                            <Stack>
                                <TmTypography variant='body1' testid='barcodeScannerResultRawBytesTitle' color='textSecondary'>
                                    Raw Bytes:
                                </TmTypography>
                                <TmTypography variant='body2' testid='barcodeScannerResultRawBytes' sx={{ mt: 1, wordBreak: 'break-all', fontFamily: 'monospace' }}>
                                    {Array.from(result.bytes).map(b => b.toString(16).padStart(2, '0')).join(' ')}
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
