import { FormHelperText, FormHelperTextProps } from '@mui/material';
import { memo, ReactNode } from 'react';

type Props = {
    testid: string;
    children: ReactNode;
} & FormHelperTextProps

const TmFormHelperText = ({ testid, children, ...props }: Props) => {
    return <FormHelperText id={testid} {...props}>{children}</FormHelperText>;
};

export default memo(TmFormHelperText)