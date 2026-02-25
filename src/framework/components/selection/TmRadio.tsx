import { RadioProps, Radio } from '@mui/material';
import { memo } from 'react';
import toCamelCase from '../../utils';

type Props = {
    testid: string;
} & RadioProps

const TmRadio = ({ testid, ...props }: Props) => {
    return <Radio id={toCamelCase(testid)} {...props}/>;
};

export default memo(TmRadio)