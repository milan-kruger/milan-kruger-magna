import { memo } from "react";
import TmSvgIcon from "./TmSvgIcon";

const TmArrowCircleRightIcon = (props: any) => {
    return (
        <TmSvgIcon {...props} sx={{strokeWidth: '1'}}>
              <path d="M 9.854 8.146 l 4.353 4.354 l -4.354 4.354 l -0.707 -0.707 l 3.647 -3.647 l -3.647 -3.646 l 0.708 -0.708 z M 20 12.5 c 0 4.687 -3.813 8.5 -8.5 8.5 s -8.5 -3.813 -8.5 -8.5 s 3.813 -8.5 8.5 -8.5 s 8.5 3.813 8.5 8.5 z M 19 12.5 c 0 -4.136 -3.364 -7.5 -7.5 -7.5 s -7.5 3.364 -7.5 7.5 s 3.364 7.5 7.5 7.5 s 7.5 -3.364 7.5 -7.5 z"/>
        </TmSvgIcon>
    );
};

export default memo(TmArrowCircleRightIcon);
