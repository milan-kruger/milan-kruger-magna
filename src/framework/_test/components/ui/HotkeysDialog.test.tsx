import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { screen } from '@testing-library/dom';
import HotkeysDialog from "../../../components/help/HotkeysDialog";

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

test('Render HotkeysDialog', () => {
    render(
        <HotkeysDialog
            isOpen={true}
            onClose={() => { }}
            pageTitle={'test-element'}
        />
    );
    expect(screen.getByText(/test-element/)).toBeInTheDocument();
});
