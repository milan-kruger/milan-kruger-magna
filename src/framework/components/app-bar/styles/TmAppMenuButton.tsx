import { MenuItem, MenuItemProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';

export const StyledAppMenuButton = styled(MenuItem)(({ theme }) => ({
    '&.MuiButtonBase-root': {
        color: theme.palette.text.primary,
        padding: theme.spacing(3),
        justifyContent: 'center'
    },
    '.active &.MuiButtonBase-root': {
        color: theme.palette.primary.main,
    },
    '& .MuiStack-root': {
        alignItems: 'center'
    },
    '& .MuiSvgIcon-root': {
        fontSize: '2.5rem'
    }
}));

type Props = {
    testid: string;
    children: React.ReactNode;
} & MenuItemProps;

const TmAppMenuButton = ({ testid, children, ...props }: Props) => {
    return <StyledAppMenuButton id={testid} {...props}>{children}</StyledAppMenuButton>;
};

export default memo(TmAppMenuButton);
