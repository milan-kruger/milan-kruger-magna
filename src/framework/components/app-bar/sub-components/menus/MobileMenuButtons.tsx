import { useTheme } from '@mui/material';
import TmButton from '../../../button/TmButton';
import { JSX, MouseEvent } from 'react';

type Props = {
    testid: string;
    onClick: (event: MouseEvent<HTMLElement>) => void;
    icon: JSX.Element;
    label: string;
}

export function MobileMenuButtons({ testid, onClick, icon, label } : Readonly<Props>) {
    const theme = useTheme();
    return (
        <TmButton
            testid={testid}
            onClick={onClick}
            startIcon={icon}
            size='large'
            sx={{
                justifyContent: 'left',
                '&.MuiButtonBase-root' : { paddingX: '18px !important', gap: 5 },
                color: theme.palette.text.primary
            }}
        >
            {label}
        </TmButton>
    )
}
