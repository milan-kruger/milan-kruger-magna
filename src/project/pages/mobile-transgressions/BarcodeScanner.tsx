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

/** Try decoding with primary binarizer, then fallback binarizer. */
async function tryDecode(imageData: ImageData): Promise<{ text: string; format: string } | null> {
    let results = await readBarcodes(imageData, wasmReaderOptions);
    if (results.length === 0 || !results[0].isValid) {
        results = await readBarcodes(imageData, wasmReaderOptionsFallback);
    }
    if (results.length > 0 && results[0].isValid && results[0].text) {
        return { text: results[0].text, format: results[0].format };
    }
    return null;
}

// ─────────────────────────────────────────────────────────────────────────────

function BarcodeScanner() {
    const { t } = useTranslation();

    const [state, setState] = useState<ScannerState>({ phase: 'idle' });

    const barcode = state.phase === 'result' ? state.barcode : null;
    const rawValue = barcode?.rawValue;
    const parsedBarcode = useMemo(() => {
        if (!result) return null;
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

                const scale = Math.min(1, MAX_DECODE_WIDTH / video.videoWidth);
                canvas.width = Math.round(video.videoWidth * scale);
                canvas.height = Math.round(video.videoHeight * scale);
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

                // Decode outside try/catch so state transitions are never silently swallowed.
                let decoded: { text: string; format: string } | null = null;
                try {
                    decoded = await tryDecode(ctx.getImageData(0, 0, canvas.width, canvas.height));
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
                <video
                    ref={videoRef}
                    style={{ width: '100%', borderRadius: 8, display: 'block' }}
                    playsInline
                    muted
                />
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
