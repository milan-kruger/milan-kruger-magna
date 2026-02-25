import { ListItemText, ListItemTextProps } from '@mui/material';
import { memo } from 'react';

type Props = {
    testid: string;
} & ListItemTextProps

const TmListItemText = ({ testid, ...props }: Props) => {
    return <ListItemText id={testid} {...props}/>;
};

export default memo(TmListItemText)