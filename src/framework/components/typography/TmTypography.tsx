import { Typography, TypographyProps } from "@mui/material";
import { memo } from 'react';

type Props = {
    testid: string;
    children: any;
} & TypographyProps;

const TmTypography = ({ testid, children, ...props }: Props) => {
    return (
    <Typography 
    id={testid} 
    data-testid={testid}
    {...props}>
        {children}
    </Typography>);
};

export default memo(TmTypography)