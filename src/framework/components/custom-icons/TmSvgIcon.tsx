import { SvgIcon as MuiSvgIcon, styled, SvgIconProps } from "@mui/material";

// only use if you want to add your own svg path inside SVG icon
const StyledSvgIcon = styled(MuiSvgIcon, {
    name: "SvgIcon",
    shouldForwardProp: (prop) => prop !== "fill",
})(() => ({
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeWidth: "1.5",
}));

const TmSvgIcon = (props: SvgIconProps) => (
    <StyledSvgIcon
        viewBox="0 0 24 24"
        focusable="false"
        aria-hidden="true"
        {...props}
    />
);

export default TmSvgIcon;
