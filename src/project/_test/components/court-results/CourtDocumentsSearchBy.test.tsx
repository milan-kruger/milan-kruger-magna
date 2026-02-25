import { render, fireEvent, screen } from '@testing-library/react';
import { TmCourtDocumentsSearchBy } from '../../../components/court-results/CourtDocumentsSearchBy';
import { act } from 'react';

vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => false),
    };
});

vi.mock('../../../../framework/components/progress/TmLoadingSpinner', () => ({
    default: vi.fn(() => <div data-testid="loadingSpinner">Loading...</div>)
}));

vi.mock('../../../../framework/components/textfield/TmAutocomplete', () => ({
    default: vi.fn(({ onChange, value }) => (
        <input
            data-testid="searchBy"
            value={value}
            onChange={(e) => onChange(e, e.target.value)}
        />
    ))
}));

vi.mock('../../../../framework/components/button/TmButton', () => ({
    default: vi.fn(({ onClick, disabled }) => (
        <button
            data-testid="submitButton"
            disabled={disabled}
            onClick={onClick}
        >
            Submit
        </button>
    ))
}));

vi.mock('../../../../framework/components/textfield/TmTextField', () => ({
    default: vi.fn(({ onChange, value }) => (
        <input
            data-testid="searchText"
            value={value}
            onChange={onChange}
        />
    ))
}));
const onSubmit = vi.fn();
const onChange = vi.fn();

const renderComponent = () => {
    render(
        <TmCourtDocumentsSearchBy
            id="test"
            heading="Test Heading"
            subHeading="Test Subheading"
            onSubmit={onSubmit}
            onChange={onChange}
            searchBy="Notice No"
            searchText="12345ABC1ABC2345"
        />
    );
}

describe('TmCourtDocumentsSearchBy', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should call onSubmit when submit button is clicked', async () => {
        renderComponent()

        const searchByInput = screen.getByTestId('searchBy');
        const searchTextInput = screen.getByTestId('searchText');
        const submitButton = screen.getByTestId('submitButton');

        // Simulate user input
        await act(async () => {
            fireEvent.change(searchByInput, { target: { value: 'Warrant No' } });
            fireEvent.change(searchTextInput, { target: { value: 'W123456' } });
        });

        expect(submitButton).not.toBeDisabled();

        await act(async () => {
            fireEvent.click(submitButton);
        });

        expect(onSubmit).toHaveBeenCalledWith('Warrant No', 'W123456');
    });

    it('should call onChange when the searchBy or searchText changes', async () => {
        renderComponent()

        const searchByInput = screen.getByTestId('searchBy');
        const searchTextInput = screen.getByTestId('searchText');

        await act(async () => {
            fireEvent.change(searchByInput, { target: { value: 'Warrant No' } });
            fireEvent.change(searchTextInput, { target: { value: 'W123456' } });
        });

        expect(onChange).toHaveBeenCalledWith('Warrant No', 'W123456', true);
    });
});
