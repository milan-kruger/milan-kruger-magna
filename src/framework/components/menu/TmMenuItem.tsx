import { MenuItem, MenuItemProps } from "@mui/material";
import { memo } from 'react';

type Props = {
    testid: string;
    children: React.ReactNode;
} & MenuItemProps

const TmMenu = ({ testid, children, ...props }: Props) => {
    return <MenuItem id={testid} {...props}>{children}</MenuItem>;
};

export default memo(TmMenu)