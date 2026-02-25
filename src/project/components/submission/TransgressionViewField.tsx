import { Box, SxProps, Tooltip,  } from "@mui/material";
import TmTextField from "../../../framework/components/textfield/TmTextField";
import { Theme } from "@mui/system";

type Props = {
    testId: string;
    label: string;
    value: string | string[] | undefined | number;
    readonly?: boolean;
    disabled?: boolean;
    sx?: SxProps<Theme>;
}

const TransgressionViewField = ({ testId, label, value, readonly=true, disabled=true, sx={} }: Props) => {

    return (
        <Box pr={2}>
            <Tooltip title={value}>
                <div>
                    <TmTextField
                        testid={testId}
                        label={label}
                        readonly={readonly}
                        disabled={disabled}
                        value={value}
                        fullWidth
                        sx={sx}
                    />
                </div>
            </Tooltip>
        </Box>
    );
}

export default TransgressionViewField;
