import { AiOutlineSortDescending } from "react-icons/ai";
import { memo } from "react";
import { SvgIcon } from "@mui/material";

const TmSortDescIcon = (props: any) => {
    return (
        <SvgIcon {...props}>
            <AiOutlineSortDescending size='0.8em'/>
        </SvgIcon>
    );
};

export default memo(TmSortDescIcon);
