import { Box, Stack, SvgIconProps, Typography, useTheme } from "@mui/material";
import { toCamelCaseWords } from "../../../framework/utils";
import { ReactElement } from "react";


type Props = {
    testId: string;
    label: string;
    values: string[];
    icon?: ReactElement<SvgIconProps>;
};

const SubmissionDetailItem = ({ testId, label, values, icon }: Props) => {

    const theme = useTheme();

    return (
        <Box border={1} borderColor={theme.palette.grey[500]} borderRadius={3} p={2} mt={2} pl={15}>
              <Typography id={toCamelCaseWords(testId, 'Label')} variant='subtitle2'>
                    {label}
                </Typography>
            {values.map((value, index) => (
                    <Stack direction={'row'} gap={2} alignItems={'center'} key={value+index}>
                    {icon}
                    <Typography id={toCamelCaseWords(testId, 'Value', index.toString())} variant='body2'>
                        {value}
                    </Typography>
                </Stack>
            ))}
        </Box>
    );
}

export default SubmissionDetailItem;
