import { Alert, AlertColor, Slide, SlideProps, Snackbar, styled } from '@mui/material';

type TmSnackbarProps = {
    testid: string;
    snackbarType: AlertColor;
    message: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function TmSnackbar({ testid, snackbarType, message, isOpen, onClose }: TmSnackbarProps) {
    return (
        <Snackbar
            id={`${testid}Snackbar`}
            open={isOpen}
            autoHideDuration={2000}
            onClose={onClose}
            TransitionComponent={SlideTransition}
        >
            <TmAlert id={`${testid}SnackbarMessage`} onClose={onClose} severity={snackbarType}>
                {message}
            </TmAlert>
        </Snackbar>
    );
}

const TmAlert = styled(Alert)(({ theme }) => ({
    fontSize: 16,
    border: `1px solid ${theme.palette.grey[500]}`
}));

function SlideTransition(props: SlideProps) {
    return <Slide {...props} direction='right' />;
}
