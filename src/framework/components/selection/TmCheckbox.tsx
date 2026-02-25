import { CheckboxProps, Checkbox, Tooltip } from '@mui/material';
import { memo } from 'react';
import toCamelCase from '../../utils';

type Props = {
    testid: string;
    tooltipTitle?: string;
} & CheckboxProps

const TmCheckbox = ({ testid, tooltipTitle, ...props }: Props) => {
    return <Tooltip title={tooltipTitle ?? ''}>
        <span id={toCamelCase(testid)}>
            <Checkbox id={toCamelCase(testid)} data-testid={toCamelCase(testid)} {...props} />
        </span>
    </Tooltip>;
};

export default memo(TmCheckbox)
