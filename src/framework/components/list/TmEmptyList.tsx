import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import TmTypography from '../typography/TmTypography';
import { toCamelCaseWords } from '../../utils';
import TmLoadingSpinner from '../progress/TmLoadingSpinner';

const EmptyListBox = styled(Box)(({ theme }) => ({
    overflowX: 'hidden',
    border: `1px solid ${theme.palette.grey[500]}`,
    borderRadius: '5px',
    padding: 0
}));

type Props = {
    height: string;
    isLoading: boolean;
    testId: string;
}

const TmEmptyList = ({ height, isLoading, testId}: Props) => {
    const { t } = useTranslation();
    return (
        <EmptyListBox
            height={height}
            sx={{display: 'flex', justifyContent: isLoading ? 'center' : 'start'}}
        >
            {
                isLoading ?
                <TmLoadingSpinner testid={toCamelCaseWords(testId, 'DialogListLoadSpinner')} />
                :   <TmTypography margin={5} testid={'emptyList'}>
                        {t('emptyList')}
                    </TmTypography>
            }
        </EmptyListBox>
    );
};

export default memo(TmEmptyList);