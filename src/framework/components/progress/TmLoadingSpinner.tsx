import { Box, BoxProps, CircularProgress, styled } from '@mui/material';

type Props = {
    testid: string;
    size?: number;
} & BoxProps;

export default function TmLoadingSpinner({ testid, size, ...props }: Props) {
    return (
        <WrapperBox data-testid={testid} id={testid} {...props}>
            <CircularProgress size={size ?? 80} />
        </WrapperBox>
    );
}

const WrapperBox = styled(Box)(() => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 8
}));
