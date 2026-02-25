import { ToggleButton, ToggleButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';

export const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
    borderColor: theme.palette.grey[500],
    color: theme.palette.text.primary,
    '&.Mui-selected': {
        backgroundColor: theme.palette.mode === 'light' ? theme.palette.primary.light : theme.palette.primary.dark,
        borderColor: theme.palette.mode === 'light' ? theme.palette.primary.dark : theme.palette.primary.light,
        color: theme.palette.primary.contrastText
    },
    '&.Mui-selected:hover': {
        backgroundColor: theme.palette.primary.main
    },
    '&:hover': {
        backgroundColor: theme.palette.mode === 'light' ? '#00000017' : '#FFFFFF24'
    }
}));

type Props = {
    testid: string;
    children: React.ReactNode;
} & ToggleButtonProps

const TmToggleButton = ({ testid, children, ...props }: Props) => {
    return <StyledToggleButton id={testid} {...props}>{children}</StyledToggleButton>;
};

export default memo(TmToggleButton)