import { darken, lighten, ListSubheader } from '@mui/material';
import { styled } from '@mui/material/styles';

export const TmListSubheader = styled(ListSubheader)(({ theme }) => ({
    paddingTop: theme.spacing(2),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    overflowWrap: 'anywhere',
    '& .MuiPaper-root': {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.mode === 'light' ? lighten(theme.palette.grey[100], 0.5) : darken(theme.palette.grey[900], 0.65),
        border: `2px solid ${theme.palette.mode === 'light' ? theme.palette.grey[400] : theme.palette.grey[700]}`
    }
}));

