import { IconButton, IconButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';

export const StyledIconButton = styled(IconButton)(({ color, theme }) => {
    const paletteColor = color === 'secondary' ? 'secondary' : 'primary';
    return {
        color: theme.palette[paletteColor].light,
        '& .MuiSvgIcon-root': {
            fontSize: '2rem'
        },
        '&:hover': {
            color: theme.palette[paletteColor].main,
        }
    };
});

type Props = {
    testid: string;
    children: React.ReactNode;
} & IconButtonProps

const TmActionIconButton = ({ testid, children, ...props }: Props) => {
    return <StyledIconButton id={testid} {...props}>{children}</StyledIconButton>;
};

export default memo(TmActionIconButton)