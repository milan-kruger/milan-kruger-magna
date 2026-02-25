import { ChipProps, Chip } from '@mui/material';
import { memo } from 'react';

type Props = {
    testid: string;
} & ChipProps

const TmChip = ({ testid, ...props }: Props) => {
    return <Chip id={testid} {...props}/>;
};

export default memo(TmChip)