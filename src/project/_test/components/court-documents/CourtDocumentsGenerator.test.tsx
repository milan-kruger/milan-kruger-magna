import { render, screen, cleanup } from '@testing-library/react';
import { CourtDocumentsView } from '../../../enum/CourtDocumentsView';
import CourtDocumentsGenerator from '../../../components/court-documents/CourtDocumentsGenerator';
import TestingPageWrapper from '../../TestingPageWrapper';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { initialConfigState } from '../../mocks/config.mock';
import { rootReducer } from '../../../../framework/redux/store';

// Mock MUI hooks
vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => false),
    };
});

// Mock subcomponents
vi.mock('../../../../project/components/court-documents/CourtDocumentDetails', () => ({
    __esModule: true,
    default: () => <div data-testid="CourtDocumentDetails" />
}));

vi.mock('../../../../project/components/court-documents/ControlDocumentDetails', () => ({
    __esModule: true,
    default: () => <div data-testid="ControlDocumentDetails" />
}));

vi.mock('../../../../project/components/court-documents/CourtDocumentsGeneratorAction', () => ({
    __esModule: true,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ disabled, onClick }: any) => (
        <button data-testid="GeneratorAction" disabled={disabled} onClick={onClick}>
            Generate
        </button>
    )
}));

vi.mock('../../../../framework/components/progress/TmLoadingSpinner', () => ({
    __esModule: true,
    default: () => <div data-testid="TmLoadingSpinner" />
}));

vi.mock('../../../assets/images/scroll_text_icon', () => ({
    default: () => <div data-testid="TmScrollTextIcon" />
}));

vi.mock('react-icons/pi', () => ({
    PiGavelFill: () => <div data-testid="PiGavelFill" />
}));

vi.mock('react-icons/gi', () => ({
    GiArchiveRegister: () => <div data-testid="GiArchiveRegister" />
}));

const initializeStore = () => configureStore({
    reducer: rootReducer,
});

afterEach(() => {
    cleanup();
});

describe('CourtDocumentsGenerator', () => {
    let store: EnhancedStore;

    const defaultProps = {
        heading: 'Test Heading',
        subHeading: 'Test Subheading',
        isLoading: false,
        handleGenerateDocuments: vi.fn(),
        adjudicationTimeFence: 60,
        courts: [],
        courtNameList: ['Court A'],
        view: CourtDocumentsView.COURT_REGISTER,
        courtRegisterNotFound: 'No register found',
        showNoCourtRegisterFound: true,
        maxCourtDate: undefined
    };

    beforeEach(() => {
        store = initializeStore();
        vi.clearAllMocks();
    });

    it('renders heading and subheading correctly', () => {
        render(<CourtDocumentsGenerator {...defaultProps} />);
        expect(screen.getByTestId('courtDocumentHeading')).toHaveTextContent('Test Heading');
        expect(screen.getByText('Test Subheading')).toBeInTheDocument();
    });

    it('renders spinner when loading', () => {
        render(<CourtDocumentsGenerator {...defaultProps} isLoading={true} />);
        expect(screen.getByTestId('TmLoadingSpinner')).toBeInTheDocument();
    });

    it('renders CourtDocumentDetails and action button', () => {
        render(<CourtDocumentsGenerator {...defaultProps} />);
        expect(screen.getByTestId('CourtDocumentDetails')).toBeInTheDocument();
        expect(screen.getByTestId('GeneratorAction')).toBeInTheDocument();
    });

    it('shows icon based on view', () => {
        render(
            <TestingPageWrapper store={store} initialConfigState={initialConfigState}>
                <CourtDocumentsGenerator {...defaultProps} view={CourtDocumentsView.COURT_RESULTS} />
            </TestingPageWrapper>
        );
        expect(screen.getByTestId('PiGavelFill')).toBeInTheDocument();
    });

    it('renders ControlDocumentDetails if view is CONTROL_DOCUMENTS', () => {
        render(<CourtDocumentsGenerator {...defaultProps} view={CourtDocumentsView.CONTROL_DOCUMENTS} />);
        expect(screen.getByTestId('ControlDocumentDetails')).toBeInTheDocument();
    });

    it('disables Generate button if courtNameError is true', () => {
        vi.mock('../../../../project/components/court-documents/CourtDocumentsGeneratorManager', () => ({
            default: vi.fn().mockReturnValue({
                courtNameError: () => true,
                helperTextMessage: () => 'Helper text',
            }),
        }));

        render(<CourtDocumentsGenerator {...defaultProps} />);
        const button = screen.getByTestId('GeneratorAction');
        expect(button).toBeDisabled();
    });

    it('does not render ControlDocumentDetails if view is not CONTROL_DOCUMENTS', () => {
        render(<CourtDocumentsGenerator {...defaultProps} view={CourtDocumentsView.COURT_REGISTER} />);
        expect(screen.queryByTestId('ControlDocumentDetails')).not.toBeInTheDocument();
    });

    it('renders courtRegisterNotFound text when showNoCourtRegisterFound is true and view is CONTROL_DOCUMENTS', () => {
        render(<CourtDocumentsGenerator
            {...defaultProps}
            view={CourtDocumentsView.CONTROL_DOCUMENTS}
            showNoCourtRegisterFound={true}
            courtRegisterNotFound="No data for court"
        />);
        expect(screen.getByText('No data for court')).toBeInTheDocument();
    });

    it('disables Generate button based on courtDateErrorWarrant in WARRANT_OF_ARREST_REGISTER view', () => {
        vi.doMock('../../../../project/components/court-documents/CourtDocumentsGeneratorManager', () => ({
            default: vi.fn().mockReturnValue({
                courtDateError: () => false,
                courtDateErrorWarrant: () => true,
                helperTextMessage: () => 'Helper text',
                courtNameError: () => false,
                courtRoomError: () => false,
                noticeTypeError: () => false,
            }),
        }));

        render(<CourtDocumentsGenerator {...defaultProps} view={CourtDocumentsView.WARRANT_OF_ARREST_REGISTER} />);
        expect(screen.getByTestId('GeneratorAction')).toBeDisabled();
    });

});
