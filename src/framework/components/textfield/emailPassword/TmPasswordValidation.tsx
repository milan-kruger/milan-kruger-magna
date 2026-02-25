import { CancelOutlined, CheckCircleOutline } from '@mui/icons-material';
import { Stack, useTheme } from '@mui/material';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import TmTypography from '../../typography/TmTypography';
import toCamelCase from '../../../utils';

const Title = memo(() => {
    const { t } = useTranslation();
    return (
        <TmTypography testid={'passwordValidationTitle'} variant='body2'>
            {t('passwordMustContainAtLeast')}
        </TmTypography>
    );
});

type RequirementsProps = {
    validation: boolean,
    req: {
        label: string;
        regex: RegExp;
    }
}

const Requirements = memo(({ validation, req }: RequirementsProps) => {
    const theme = useTheme();
    return (
        <>
            {
                validation ?
                    <CheckCircleOutline
                        style={{
                            alignSelf: 'center',
                            fontSize: '0.8em',
                            color: theme.palette.success.main
                        }}
                    /> :
                    <CancelOutlined
                        style={{
                            alignSelf: 'center',
                            fontSize: '0.8em',
                            color: theme.palette.text.primary
                        }}
                    />
            }
            <TmTypography
                testid={`${toCamelCase(req.label)}ReqLabel`}
                key={req.label}
                style={{ color: validation ? theme.palette.success.main : theme.palette.text.primary }}
                variant='caption'
            >
                {req.label}
            </TmTypography>
        </>
    );
});

type Props = {
    validations: boolean[],
    passwordRequirements: {
        label: string;
        regex: RegExp;
    }[]
}

export default function TmPasswordValidation({ validations, passwordRequirements }: Props) {

    return (
        <Stack>
            <Title />
            {passwordRequirements.map((req, index) => (
                <Stack direction='row' key={req.label} gap={2}>
                    <Requirements validation={validations[index]} req={req} />
                </Stack>
            ))}
        </Stack>
    );
}