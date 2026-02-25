import CancelIcon from '@mui/icons-material/Cancel';
import { BsUpcScan } from 'react-icons/bs';
import { Box, Stack, useMediaQuery } from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import TmIconButton from '../../../framework/components/button/TmIconButton';
import TmTypography from '../../../framework/components/typography/TmTypography';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { parseDLBarcode } from './dlBarcodeParser';

type BarcodeResult = {
    rawValue: string;
    format: string;
};

const hints = new Map<DecodeHintType, unknown>();
hints.set(DecodeHintType.TRY_HARDER, true);
hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.PDF_417]);
const codeReader = new BrowserMultiFormatReader(hints);

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

        if (!videoRef.current) return;

        try {
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: { exact: 'environment' },
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                    },
                });
            } catch {
                // Fallback: try any available camera at max resolution
                stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 3840 },
                        height: { ideal: 2160 },
                    },
                });
            }

            streamRef.current = stream;
            videoRef.current.srcObject = stream;
            await videoRef.current.play();
            setScanning(true);

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;

            const SCAN_INTERVAL_MS = 200;

            const scan = async () => {
                const video = videoRef.current;
                if (!video || !streamRef.current) return;

                if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
//
// // --- Grayscale + contrast boost ---
//                     const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
//                     const data = imageData.data;
//
//                     const contrast = 1.4; // 1.0 = none, try 1.2–1.6
//                     const intercept = 128 * (1 - contrast);
//
//                     for (let i = 0; i < data.length; i += 4) {
//                         // Convert to luminance (perceptual weighting)
//                         const gray =
//                             0.299 * data[i] +
//                             0.587 * data[i + 1] +
//                             0.114 * data[i + 2];
//
//                         // Apply contrast
//                         const enhanced = contrast * gray + intercept;
//
//                         data[i] = data[i + 1] = data[i + 2] = enhanced;
//                     }
//
//                     ctx.putImageData(imageData, 0, 0);

                    try {
                        console.log(canvas.toDataURL())

                        const decoded = await codeReader.decodeFromCanvas(canvas);
                        setResult({
                            rawValue: decoded.getText(),
                            format: BarcodeFormat[decoded.getBarcodeFormat()] ?? String(decoded.getBarcodeFormat())
                        });
                        stopCamera();
                        return;
                    } catch {
                        // NotFoundException — no barcode in this frame, keep scanning
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
