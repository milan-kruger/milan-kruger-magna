import { render } from "@testing-library/react";
import TmSearch from "../../../components/list/TmSearch";

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

test('Render TmSearch', () => {
    const { getByRole } = render(
        <TmSearch
            testid={'search'}
            searchValue='tm-search'
            onDebouncedChange={() => { }}
        />
    );
    const input = getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('tm-search');
});
