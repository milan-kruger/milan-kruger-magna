import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const MobileScreenBox = styled(Box)(({ theme }) => ({
    [theme.breakpoints.up('xs')]: {
        display: 'flex'
    },
    [theme.breakpoints.up('md')]: {
        display: 'none'
    }
}));
