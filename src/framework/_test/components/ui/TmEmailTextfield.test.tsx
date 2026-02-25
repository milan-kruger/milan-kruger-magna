import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import TmEmailTextfield from "../../../components/textfield/emailPassword/TmEmailTextfield";

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => {
            return false;
        }),
    };
});

test('Render TmEmailTextfield', async () => {
    render(
        <TmEmailTextfield
            testid={'email'}
            setEmailValue={() => { }}
            setEmailError={() => { }}
            emailError={false}
        />
    );
    expect(document.getElementById('email')).toBeInTheDocument();
});
