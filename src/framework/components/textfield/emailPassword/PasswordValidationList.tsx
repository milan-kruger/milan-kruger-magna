export interface PasswordValidation {
    label: string;
    regex: RegExp;
    translationKey: string;
}

export const getPasswordValidationRules = (username: string, currentPassword?: string): Omit<PasswordValidation, 'label'>[] => {
    const rules: Omit<PasswordValidation, 'label'>[] = [
        { translationKey: '1uppercase', regex: /[A-Z]/ },
        { translationKey: '1lowercase', regex: /[a-z]/ },
        { translationKey: '1specialCharacter', regex: /[!@#$%^&*()_+\-=[\]{};':'\\|,.<>/?]/ },
        { translationKey: '1numericalCharacter', regex: /\d/ },
        { translationKey: 'minimum8Characters', regex: /.{8,}/ },
        {
            translationKey: 'notSameAsCurrentPassword',
            regex: new RegExp(`^(?!${currentPassword?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$)`)
        }
    ];

    if (username && username.length > 0) {
        rules.push({
            translationKey: 'notSameAsUsername',
            regex: new RegExp(`^(?!${username.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$)`)
        });
    }

    return rules;
};
