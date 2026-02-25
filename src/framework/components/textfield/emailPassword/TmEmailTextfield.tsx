import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import TmTextField from '../TmTextField';
import Constants from '../../../../project/utils/Constants';

type Props = {
    testid: string;
    email?: string,
    setEmailValue: (value: string) => void,
    setEmailError: (error: boolean) => void,
    emailError: boolean,
    disabled?: boolean,
    readonly?: boolean
}

function TmEmailTextfield({ testid, email, setEmailValue, setEmailError, emailError, disabled, readonly }: Props) {

    const { t } = useTranslation();

    const handleValidateEmailField = (value: string) => {
        if (value.trim() === '' || !Constants.emailRegex.exec(value)) {
            setEmailError(true);
        }
        else {
            setEmailError(false);
        }
        setEmailValue(value);
    }

    return (
        <TmTextField
            testid={testid}
            required
            fullWidth
            disabled={disabled}
            readonly={readonly}
            label={t('email')}
            value={email}
            onChange={(event) => handleValidateEmailField(event.target.value)}
            error={emailError}
            helperText={emailError ? t('notAValidEmailFormat') : ' '}
        />
    );
}

export default memo(TmEmailTextfield);
