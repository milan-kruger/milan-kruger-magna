import CancelIcon from '@mui/icons-material/Cancel';
import { BsUpcScan } from 'react-icons/bs';
import { Box, Stack, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmIconButton from '../../../framework/components/button/TmIconButton';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { readBarcodes, type ReaderOptions } from 'zxing-wasm/reader';
import { parseDLBarcode } from './dlBarcodeParser';
import { isCarDiskBarcode, parseCarDiskBarcode } from './carDiskBarcodeParser';
import { preprocessGreyscale } from './imagePreprocessing';

type BarcodeResult = {
    rawValue: string;
    format: string;
    bytes: Uint8Array;
};

const READER_OPTIONS: ReaderOptions = {
    formats: ['PDF417'],
    tryHarder: true,
    tryRotate: true,
    tryInvert: false,
    tryDownscale: false,
    downscaleFactor: 1,
    downscaleThreshold: 0,
    tryDenoise: true,
    isPure: false,
    binarizer: 'GlobalHistogram',
    minLineCount: 2,
    textMode: 'Plain',
    maxNumberOfSymbols: 1,
    returnErrors: false,
};

const _wasmReady: Promise<void> = (async () => {
    try {
        const blank = new ImageData(1, 1);
        await readBarcodes(blank, { formats: ['PDF417'], maxNumberOfSymbols: 1 });
    } catch {
        // ignore — module is still cached for subsequent real calls
    }
})();

// function upscaleImageData(imageData: ImageData, scale: number): ImageData {
//   const canvas = document.createElement('canvas');
//   const ctx = canvas.getContext('2d')!;
//   canvas.width = imageData.width;
//   canvas.height = imageData.height;
//   ctx.putImageData(imageData, 0, 0);
//
//   const scaledCanvas = document.createElement('canvas');
//   scaledCanvas.width = imageData.width * scale;
//   scaledCanvas.height = imageData.height * scale;
//   const scaledCtx = scaledCanvas.getContext('2d')!;
//   scaledCtx.imageSmoothingEnabled = false;
//   scaledCtx.drawImage(canvas, 0, 0, scaledCanvas.width, scaledCanvas.height);
//
//   return scaledCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
// }

function BarcodeScanner() {
    const { t } = useTranslation();
    const isPortrait = useMediaQuery('(orientation: portrait)');

    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<BarcodeResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const parsedBarcode = useMemo(() => {
        if (!result) return null;
        if (isCarDiskBarcode(result.rawValue)) return parseCarDiskBarcode(result.rawValue);
        return parseDLBarcode(result.rawValue);
    }, [result]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const scanTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
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

        await _wasmReady;

        try {
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { exact: 'environment' },
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

            if (!canvasRef.current) {
                canvasRef.current = document.createElement('canvas');
                ctxRef.current = canvasRef.current.getContext('2d', { willReadFrequently: true })!;
            }
            const canvas = canvasRef.current;
            const ctx = ctxRef.current!;

            const SCAN_INTERVAL_MS = 200;

            const scan = async () => {
                const video = videoRef.current;
                if (!video || !streamRef.current) return;

                if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                    try {
                        const cropWidth = canvas.width * 0.8;
                        const cropHeight = canvas.height * 0.4;

                        const sx = (canvas.width - cropWidth) / 2;
                        const sy = (canvas.height - cropHeight) / 2;

                        const rawImageData = ctx.getImageData(
                          sx,
                          sy,
                          cropWidth,
                          cropHeight
                        );
                        const preprocessedGrey = preprocessGreyscale(rawImageData, failedAttemptsRef.current);
//                         const upscaled = upscaleImageData(preprocessedGrey, 2);
                        const results = await readBarcodes(preprocessedGrey, READER_OPTIONS);

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
