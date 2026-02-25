
import { ListItemButton } from '@mui/material';
import { darken, styled } from '@mui/material/styles';

export const TmListItemButton = styled(ListItemButton)(({ theme }) => ({
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: '5px',
    margin: theme.spacing(2),
    overflowWrap: 'anywhere',
    '&.Mui-selected': {
        border: `1px solid ${theme.palette.primary.dark}`,
        borderRadius: '5px',
        backgroundColor: `${theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.dark}`,
        color: theme.palette.primary.contrastText,
    },
    '&.Mui-selected .MuiListItemIcon-root': {
        color: theme.palette.primary.contrastText,
    },
    '&.Mui-selected .MuiTypography-root': {
        fontWeight: 600,
        color: theme.palette.primary.contrastText
    },
    '&.Mui-selected .MuiListItemText-secondary': {
        color: darken(theme.palette.primary.contrastText, 0.10)
    },
    '&.Mui-selected.Mui-focusVisible': {
        backgroundColor: `${theme.palette.primary.main}`
    },
    '&.Mui-selected .MuiIconButton-root': {
        color: theme.palette.secondary.main
    },
    '&.Mui-selected:hover .MuiIconButton-root': {
        color: theme.palette.secondary.light
    },
    '&.Mui-selected:hover': {
        backgroundColor: darken(theme.palette.primary.main, 0.25)
    },
    '&:hover': {
        backgroundColor: `${theme.palette.mode === 'light' ? '#00000017' : '#FFFFFF24'}`
    }
}));
