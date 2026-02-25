import { Menu, MenuProps } from "@mui/material";
import { forwardRef, memo } from 'react';

type Props = {
  testid: string;
  children: React.ReactNode;
} & MenuProps;

const TmMenu = forwardRef<HTMLDivElement, Props>(({ testid, children, ...props }, ref) => {
  return (
    <Menu id={testid} {...props} ref={ref}>
      {children}
    </Menu>
  );
});

export default memo(TmMenu);
