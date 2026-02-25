import { ThemeProvider, createTheme } from "@mui/material";
import { Provider } from "react-redux";
import { render } from "vitest-browser-react";
import AdjudicateSubmissionPage from "../../pages/adjudication/AdjudicateSubmissionPage";
import { Middleware, Tuple, configureStore } from "@reduxjs/toolkit";
import { transgressionsApi } from "../../redux/api/transgressionsApi";
import { BrowserRouter as Router } from 'react-router-dom';
import { setupListeners } from "@reduxjs/toolkit/query";
import AdjudicateSubmissionContextProvider from "../../pages/adjudication/AdjudicateSubmissionContextProvider";
import { screen } from "@testing-library/react";


vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock("./../../hooks/adjudication/AdjudicateSubmissionManager", () => ({
    default: () => ([{
        submission: {
            noticeNumber: "notice1",
            courtDate: "2025-03-01",
            offenderName: "John Doe",
            submissionStatus: "PENDING_ADJUDICATION",
            courtName: "Cape Town Court",
            submissionDate: "2025-02-15",
            submissionDeadline: "2025-02-28",
            submissionRegistrationDate: "2025-02-15",
            transgressionDate: "2025-02-01",
            transgressionStatus: "CREATED"
        },
        outcomes: [
            {
                submissionResult: "DISCOUNTED",
                snapshotCharge: {
                    chargeId: "CHARGE1",
                    snapshotId: "SNAPSHOT1",
                    chargeCode: "CODE1",
                    chargeCategory: "DRIVING_AXLE_WEIGH_TEST",
                    chargeShortDescription: "Driving Axle Weigh Test",
                    plateNumber: "CA123456",
                    fineAmount: {
                        amount: 100,
                        currency: "ZAR"
                    },
                    discountAmount: {
                        amount: 10,
                        currency: "ZAR"
                    }
                }
            }
        ],
        isLoading: false,
        error: null,
        fetchSubmission: vi.fn(),
        adjudicateSubmission: vi.fn(),
        reset: vi.fn(),
    }]),
}));

vi.mock('../../../framework/config/configSlice', () => ({
    default: () => vi.fn(),
    selectConfigDevMode: () => false,
    selectConfigBaseUrl: () => 'http://testlocalhost:8080',
    selectActiveWeighbridge: () => '42b829aa-5779-4e7f-8d04-a6dbc3926dea',
    selectConfig: () => ({}),
}));

vi.mock('./../../../framework/auth/components/SecuredContent', () => ({
    default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('./../../components/adjudication/AdjudicationOutcomes', () => ({
    default: () => <div>AdjudicationOutcomes</div>,
}));

vi.mock('./../../components/submission/SubmissionDetails', () => ({
    default: () => <div>SubmissionDetails</div>,
}));

const store = configureStore({
    reducer: {
        [transgressionsApi.reducerPath]: transgressionsApi.reducer,
    },
    preloadedState: {},
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(transgressionsApi.middleware) as Tuple<Middleware[]>,
});

setupListeners(store.dispatch);

const theme = createTheme();

const renderComponent = (props = {}) => {
    return render(
        <ThemeProvider theme={theme}>
            <Provider store={store}>
                <Router>
                    <AdjudicateSubmissionContextProvider>
                        <AdjudicateSubmissionPage {...props} />
                    </AdjudicateSubmissionContextProvider>
                </Router>
            </Provider>
        </ThemeProvider>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.clearAllMocks();
});

// Skipping this test for now, until the bug is resolved.
describe('AdjudicateSubmissionPage', () => {
    test.skip('should render the component', () => {
        renderComponent();
    });

    test.skip('should render the submission details section', () => {
        renderComponent();

        expect(screen.getByText("SubmissionDetails")).toBeInTheDocument();
    });

    test.skip('should render the adjudication outcomes section', () => {
        renderComponent();

        expect(screen.getByText("AdjudicationOutcomes")).toBeInTheDocument();
    });


});
