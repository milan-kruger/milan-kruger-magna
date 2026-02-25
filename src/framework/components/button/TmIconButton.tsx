import { IconButton, IconButtonProps } from '@mui/material';
import { memo } from 'react';
import toCamelCase from '../../utils';

type Props = {
    testid: string;
    children: React.ReactNode;
} & IconButtonProps

const TmIconButton = ({ testid, children, ...props }: Props) => {
    return (
        <span id={toCamelCase(testid)}>
            <IconButton id={toCamelCase(testid)} data-testid={toCamelCase(testid)} {...props}>{children}</IconButton>
        </span>
    );
};

export default memo(TmIconButton)
