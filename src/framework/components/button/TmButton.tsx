import { Button, ButtonProps, Tooltip } from '@mui/material';
import { memo } from 'react';

type Props = {
    testid: string;
    children: React.ReactNode;
    showTooltip?: boolean,
    toolTipMessage?: string
} & ButtonProps

const TmButton = ({ testid, children, showTooltip, toolTipMessage, ...props }: Props) => {
    if (showTooltip) {
        return <Tooltip title={toolTipMessage} followCursor>
            <span>
                <Button style={showTooltip ? { pointerEvents: 'auto' } : {}} id={testid} data-testid={testid} {...props}>{children}</Button>
            </span>
        </Tooltip>
    }

    return <Button id={testid} data-testid={testid} {...props}>{children}</Button>;
};

export default memo(TmButton)
