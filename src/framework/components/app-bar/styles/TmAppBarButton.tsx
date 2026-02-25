import { Button, ButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { forwardRef } from 'react';

export const StyledAppBarButton = styled(Button)(({ theme }) => ({
    my: 2,
    color: '#FFFFFFD6',
    display: 'block',
    fontWeight: '500',
    fontSize: '1rem',
    whiteSpace: 'nowrap',
    '&::before': {
        background:
            '#FFFFFF none repeat scroll 0 0',
        bottom: '0px',
        content: '""',
        height: '3px',
        left: 0,
        position: 'absolute',
        width: '0%',
        transition: '0.5s',
    },
    '&:hover': {
        color:
            theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.primary.contrastText,
        backgroundColor: 'transparent'
    },
    '.active &': {
        fontWeight: '600',
        color:
            theme.palette.mode === 'dark'
                ? theme.palette.primary.main
                : theme.palette.primary.contrastText
    },
    '.active &::before': {
        background:
            '#FFFFFF none repeat scroll 0 0',
        bottom: '0px',
        content: '""',
        height: '3px',
        left: 0,
        position: 'absolute',
        width: '100%',
    }
}));

type Props = {
    testid: string;
    children: React.ReactNode;
} & ButtonProps;

export const TmAppBarButton = forwardRef<HTMLButtonElement, Props>(({ testid, children, ...props }, ref) => {
    return (
        <StyledAppBarButton
            id={testid}
            disableRipple
            ref={ref}
            {...props}
        >
            {children}
        </StyledAppBarButton>
    );
});
