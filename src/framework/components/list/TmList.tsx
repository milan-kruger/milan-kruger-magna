import { styled } from '@mui/material/styles';
import { List } from 'react-window';

export const TmList = styled(List)(({ theme }) => ({
    overflowX: 'hidden',
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: '5px',
    padding: 0,
}));
