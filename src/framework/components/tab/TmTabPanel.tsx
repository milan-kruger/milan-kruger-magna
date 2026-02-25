import { Box } from "@mui/material";
import { ReactNode, memo } from "react";

interface TabPanelProps {
    testid: string;
    children?: ReactNode;
    index: number;
    value: number;
}
  
function TmTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={props.testid}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default memo(TmTabPanel);
  