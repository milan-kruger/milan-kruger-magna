import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Box, Stack, useMediaQuery, useTheme } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import TmTypography from '../../components/typography/TmTypography';
import { getPasswordValidationRules } from '../../components/textfield/emailPassword/PasswordValidationList';

interface PasswordRequirementsProps {
    password: string;
    username?: string;
    currentPassword?: string;
}

function PasswordRequirements({ password, username = '', currentPassword }: Readonly<PasswordRequirementsProps>) {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const requirements = useMemo(() => {
        const validationRules = getPasswordValidationRules(username, currentPassword);
        return validationRules.map(rule => {
            if (rule.translationKey === 'notSameAsUsername' || rule.translationKey === 'notSameAsCurrentPassword') {
                return {
                    met: password.length > 0 && rule.regex.test(password),
                    label: t(rule.translationKey)
                };
            }
            return {
                met: rule.regex.test(password),
                label: t(rule.translationKey)
            };
        });
    }, [username, currentPassword, password, t]);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMobile ? 'flex-start' : 'center',
            px: isMobile ? 0 : 2
        }}>
            <Box>
                <TmTypography
                    variant="body1"
                    sx={{ mb: 2, fontWeight: 500, alignSelf: isMobile ? 'flex-start' : 'center' }}
                    testid="passwordRequirementsTitle"
                >
                    {t('passwordMustContainAtLeast')}:
                </TmTypography>
                <Stack spacing={1} alignItems="flex-start">
                    {requirements.map((req, index) => {
                        let icon;
                        if (req.met) {
                            icon = (
                                <CheckIcon
                                    sx={{
                                        fontSize: 20,
                                        color: 'success.main'
                                    }}
                                />
                            );
                        } else if (password.length === 0) {
                            icon = (
                                <FiberManualRecordIcon
                                    sx={{
                                        fontSize: 8,
                                        color: 'text.secondary'
                                    }}
                                />
                            );
                        } else {
                            icon = (
                                <CloseIcon
                                    sx={{
                                        fontSize: 20,
                                        color: 'error.main'
                                    }}
                                />
                            );
                        }

                        return (
                            <Box
                                key={index + req.label}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5
                                }}
                            >
                                {icon}
                                <TmTypography
                                    variant="body1"
                                    sx={{
                                        color: password.length === 0 ? 'text.secondary' : (req.met ? 'success.main' : 'text.secondary'),
                                        fontSize: '1rem'
                                    }}
                                    testid={`passwordRequirement${index}`}
                                >
                                    {req.label}
                                </TmTypography>
                            </Box>
                        );
                    })}
                </Stack>
            </Box>
        </Box>
    );
}

export default PasswordRequirements;
