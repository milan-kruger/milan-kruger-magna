import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const DesktopScreenBox = styled(Box)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        display: 'none'
    },
    [theme.breakpoints.up('md')]: {
        display: 'flex'
    }
}));
