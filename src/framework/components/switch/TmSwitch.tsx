import { Switch, SwitchProps } from '@mui/material';
import { memo } from 'react';

type Props = {
    testid: string;
} & SwitchProps

const TmSwitch = ({ testid, ...props }: Props) => {
    return <Switch
        {...props}
        slotProps={{ root: { id: testid } }}
        data-testid={testid}
    />;
};

export default memo(TmSwitch)
