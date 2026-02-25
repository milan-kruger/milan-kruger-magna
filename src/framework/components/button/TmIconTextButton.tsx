import { Box, IconButton, IconButtonProps, SvgIconProps } from '@mui/material';
import { ReactElement, memo } from 'react';
import { toCamelCaseWords } from '../../utils';
import TmTypography from '../typography/TmTypography';

type Props = {
    testid: string;
    icon: ReactElement<SvgIconProps>;
    text: string;
    color: string;
    onClick: () => void;
} & IconButtonProps

const TmIconTextButton = ({ testid, icon, text, color, onClick, ...props }: Props) => {
    return (
        <Box sx={{cursor: 'pointer', width: 'fit-content'}} onClick={onClick}>
            <IconButton id={testid} {...props} color={color}>{icon}</IconButton>
            <TmTypography
                testid={toCamelCaseWords(testid, 'Text')}
                color={color}
                sx={{
                    fontStyle: 'italic',
                    display: 'inline-table'
                }}
            >
                {text}
            </TmTypography>
        </Box>
    );
};

export default memo(TmIconTextButton)