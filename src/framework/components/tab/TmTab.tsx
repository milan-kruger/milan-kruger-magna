import { Tab, TabProps } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';

export const StyledTab = styled(Tab)(({ theme }) => ({
    justifyContent: 'start',
    gap: theme.spacing(10)
}));

type Props = {
    testid: string;
} & TabProps

const TmTab = ({ testid, ...props }: Props) => {
    return <StyledTab id={testid} data-testid={testid} {...props}/>;
};

export default memo(TmTab)
