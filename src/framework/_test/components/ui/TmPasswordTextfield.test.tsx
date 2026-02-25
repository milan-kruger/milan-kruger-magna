import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import TmPasswordTextfield from "../../../components/textfield/emailPassword/TmPasswordTextfield";

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

test('Render TmPasswordTextfield', () => {
    render(
        <TmPasswordTextfield
            testid={'testPassword'}
            setPasswordValue={() => { }}
            validations={[]}
            label={""}
            helperText={""}
            setPasswordError={() => { }}
            passwordError={false}
        />
    );
    expect(document.getElementById('testPassword')).toBeInTheDocument();
});
