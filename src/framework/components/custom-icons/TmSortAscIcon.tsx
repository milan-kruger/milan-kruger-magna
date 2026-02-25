import { SvgIcon } from "@mui/material";
import { AiOutlineSortAscending } from "react-icons/ai";

const TmSortAscIcon = (props: any) => {
    return (
        <SvgIcon {...props}>
            <AiOutlineSortAscending size='0.8em'/>
        </SvgIcon>
    );
};

export default TmSortAscIcon;
