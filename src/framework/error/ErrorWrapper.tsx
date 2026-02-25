import { ReactElement, useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TmDialog from "../components/dialog/TmDialog";
import { selectConfigDevMode } from '../config/configSlice';
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { BackendErrorData, RtkError, removeAllErrors, selectErrors } from "./errorSlice";
import CancelIcon from '@mui/icons-material/Cancel';

type Props = {
    children: ReactElement;
}

function ErrorWrapper({ children }: Readonly<Props>) {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const devMode = useAppSelector(selectConfigDevMode);

    const errors = useAppSelector(selectErrors);
    const [isOpen, setIsOpen] = useState(false);

    if (errors.length > 0) {
        console.error('ERRORS:', errors);
    }

    useEffect(() => {
        if (errors.length > 0 && errors[0].payload.status.toString() !== '403') {
            setIsOpen(true);
        }
    }, [errors]);

    const closeDialog = useCallback(() => {
        dispatch(removeAllErrors());
        setIsOpen(false);
    }, [dispatch]);

    // Construct the error messages and details
    let errorMessages = '';
    let errorDetails = '*** DEVELOPMENT DETAILS ***';
    errors.forEach((error: RtkError) => {
        if (error.payload.error) {
            // From FE
            errorMessages += `${t(`error${error.error.message}`)}
`;
            errorDetails += `
${error.meta.baseQueryMeta.request.method} ${error.meta.baseQueryMeta.request.url}
${error.payload.status} - ${error.meta.arg.endpointName}
${error.payload.error}
`;
        }
        if (error.payload.data) {
            // From BE
            errorMessages += `${t(`error${error.error.message}`)}
`;
            errorDetails += `
${error.meta.baseQueryMeta.request.method} (${error.payload.status}) ${error.meta.baseQueryMeta.request.url}
${error.meta.arg.endpointName}: ${error.payload.data.message}
${error.payload.data.status}
Exception: ${error.payload.data.exception}
`;
            if (error.payload.data.errors) {
                const nestedErrors = error.payload.data.errors ?? [];
                nestedErrors.forEach((backendError: BackendErrorData) => {
                    errorMessages += `${t(backendError.message)}`;
                    errorDetails += `
    Type: ${backendError.type} (${backendError.context})
    Code: ${backendError.code}
    Target: ${backendError.target}
`;
                });
            }
        }
    });

    // RENDER
    return (
        <>
            {children}
            <TmDialog
                testid={'errorDialog'}
                title={t('error')}
                message={errorMessages ?? t('unknownError')}
                details={devMode ? errorDetails : undefined}
                isOpen={isOpen}
                onCancel={closeDialog}
                showConfirmButton={false}
                cancelLabel={t('close')}
                cancelIcon={<CancelIcon />}
            />
        </>
    );
}

export default ErrorWrapper;
