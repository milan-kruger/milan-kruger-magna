import { List } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';

export const StyledAppBarList = styled(List)(({ theme }) => ({
    padding: theme.spacing(2),
    '& .MuiListItemText-root': {
        color: theme.palette.text.primary
    },
    '& .active .MuiListItemIcon-root': {
        color: theme.palette.primary.main
    },
    '& .active .MuiListItemText-root': {
        color: theme.palette.primary.main
    },
    '& .active .MuiTypography-root': {
        fontWeight: '600'
    }
}));

type Props = {
    testid: string;
    children: React.ReactNode;
}

const TmAppBarList = ({ testid, children }: Props) => {
    return <StyledAppBarList id={testid}>{children}</StyledAppBarList>;
};

export default memo(TmAppBarList);
