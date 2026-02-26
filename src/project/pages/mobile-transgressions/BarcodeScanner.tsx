import CancelIcon from '@mui/icons-material/Cancel';
import { BsUpcScan } from 'react-icons/bs';
import { Box, Stack, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmIconButton from '../../../framework/components/button/TmIconButton';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import { parseDLBarcode } from './dlBarcodeParser';

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
 * Greyscale preprocessing levels — each more aggressive than the last.
 * The level is chosen based on how many consecutive frames failed to decode.
 *
 * Every level ≥ 1 first performs per-channel white-balance normalisation:
 * the darkest and lightest R, G, B values are found and each channel is
 * independently stretched to [0…255].  This neutralises colour casts from
 * warm/cool/fluorescent lighting so a yellowish "white" becomes true white
 * before greyscale conversion.
 *
 *  0 – no preprocessing (raw colour frame)
 *  1 – white-balance + simple luminance greyscale
 *  2 – white-balance + greyscale + S-curve contrast push (gentle)
 *  3 – white-balance + greyscale + S-curve contrast push (heavy) + binary threshold
 *
 * The cycle repeats so every 4th frame is raw again, giving the decoder a
 * chance with the original data before re-escalating.
 */
const GREYSCALE_LEVELS = 4;

function preprocessGreyscale(imageData: ImageData, failedAttempts: number): ImageData {
    const level = failedAttempts % GREYSCALE_LEVELS;

    // Level 0 — pass-through
    if (level === 0) return imageData;

    const { data, width, height } = imageData;

    // ── Pass 1: per-channel min/max to detect lighting colour cast ──
    // e.g. warm light makes "white" ≈ (240, 230, 180) and "black" ≈ (40, 35, 20)
    // By stretching each channel independently we normalise the white-balance
    // so yellowish whites become true 255,255,255 before greyscale conversion.
    let minR = 255, maxR = 0;
    let minG = 255, maxG = 0;
    let minB = 255, maxB = 0;

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        if (r < minR) minR = r; if (r > maxR) maxR = r;
        if (g < minG) minG = g; if (g > maxG) maxG = g;
        if (b < minB) minB = b; if (b > maxB) maxB = b;
    }

    // Per-channel scale factors (avoid division by zero for flat channels)
    const rangeR = maxR - minR; const scaleR = rangeR > 1 ? 255 / rangeR : 1;
    const rangeG = maxG - minG; const scaleG = rangeG > 1 ? 255 / rangeG : 1;
    const rangeB = maxB - minB; const scaleB = rangeB > 1 ? 255 / rangeB : 1;

    // ── Pass 2: white-balance → greyscale → escalating contrast ──
    const out = new ImageData(new Uint8ClampedArray(data), width, height);
    const d = out.data;

    for (let i = 0; i < d.length; i += 4) {
        // White-balance: stretch each channel from its own [min…max] → [0…255]
        // This removes colour casts from warm/cool/fluorescent lighting so that
        // the barcode's "white" is mapped to true white regardless of light colour.
        const nr = (d[i]     - minR) * scaleR;
        const ng = (d[i + 1] - minG) * scaleG;
        const nb = (d[i + 2] - minB) * scaleB;

        // ITU-R BT.709 luminance on the corrected channels
        let lum = 0.2126 * nr + 0.7152 * ng + 0.0722 * nb;

        if (level >= 2) {
            // S-curve contrast push — widens the gap between dark and light
            const norm = lum / 255;
            // Strength increases with level: gentle at 2, aggressive at 3+
            const strength = level === 2 ? 0.5 : 1.0;
            // Blend between linear (norm) and S-curve
            const sCurve = norm < 0.5
                ? 2 * norm * norm
                : 1 - 2 * (1 - norm) * (1 - norm);
            lum = (norm + (sCurve - norm) * strength) * 255;
        }

        if (level >= 3) {
            // Hard binary threshold — pure black-and-white for maximum edge contrast
            lum = lum < 128 ? 0 : 255;
        }

        // Clamp
        lum = lum < 0 ? 0 : lum > 255 ? 255 : lum;

        d[i] = d[i + 1] = d[i + 2] = lum;
        // alpha (d[i+3]) stays unchanged
    }

    return out;
}

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
