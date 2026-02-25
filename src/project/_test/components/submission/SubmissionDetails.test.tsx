import SubmissionDetails, { SubmissionDetailsData } from "../../../components/submission/SubmissionDetails";
import dayjs from "dayjs";
import { OverloadTransgressionDto, transgressionsApi } from "../../../redux/api/transgressionsApi";
import { render } from "vitest-browser-react";
import { ThemeProvider, createTheme } from "@mui/material";
import { Provider } from "react-redux";
import { setupListeners } from "@reduxjs/toolkit/query";
import { Middleware, Tuple, configureStore } from "@reduxjs/toolkit";
import { cleanup, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";


vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (str: string) => str,
        i18n: {
            changeLanguage: () => new Promise(() => { })
        }
    })
}));

vi.mock('../../../../framework/config/configSlice', () => ({
    selectConfigDevMode: () => false,
    selectConfigBaseUrl: () => 'http://testlocalhost:8080',
}));

vi.mock('../../../components/submission/TransgressionView', () => ({
    default: () => <div>TransgressionView</div>
}));


const mockComponentData = {
    submissionAlreadyExists: false,
    submissionDeadline: "2025-02-28",
    noticeNumber: "notice1",
    transgressionDate: "2025-02-01",
    offenderName: "John Doe",
    transgressionStatus: "ISSUED",
    submissionDate: dayjs("2025-02-15"),
    submissionDateValid: true,
    submissionReason: "",
    submissionStatus: undefined,
    submissionRegistrationDate: undefined,
    submissionOutcome: undefined,
    transgression: {
        noticeNumber: {number: "notice1"},
    } as OverloadTransgressionDto
} as SubmissionDetailsData;

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
                <SubmissionDetails
                    componentData={mockComponentData}
                    onSubmissionReasonChange={vi.fn()}
                    onResetSearch={vi.fn()}
                    onResetFields={vi.fn()}
                    {...props}
                />
            </Provider>
        </ThemeProvider>
    );
};

beforeEach(() => {
    vi.clearAllMocks();
});

afterEach(() => {
    vi.clearAllMocks();
    cleanup();
});

describe("SubmissionDetails", () => {
    test("should render", () => {
        renderComponent();
    });

    test("should render with existing submission", () => {
        renderComponent({
            componentData: {
                ...mockComponentData,
                submissionAlreadyExists: true,
            },
        });

        // Try to find the submission status
        const submissionReason = screen.getByRole('textbox');

        // Check that the submission reason is rendered and readonly
        expect(submissionReason).toHaveAttribute('placeholder', 'noReasonProvided');
        expect(submissionReason).toHaveAttribute('readonly');
    });

    test("should render register submission button when submission is not already registered", () => {
        renderComponent({
            componentData: {
                ...mockComponentData,
                submissionAlreadyExists: false,
            },
        });

        // Try to find the register submission button
        const registerSubmissionBtn = screen.getByTestId('registerSubmission');

        // Check that the button is rendered
        expect(registerSubmissionBtn).toBeInTheDocument();
    });

    test("should not render register submission button when submission is already registered", () => {
        renderComponent({
            componentData: {
                ...mockComponentData,
                submissionAlreadyExists: true,
            },
        });

        // Try to find the register submission button
        const registerSubmissionBtn = screen.queryByTestId('registerSubmission');

        // Check that the button is not rendered
        expect(registerSubmissionBtn).not.toBeInTheDocument();
    });

    test("should render confirm submission dialog when register submission button is clicked", async() => {
        renderComponent({
            componentData: {
                ...mockComponentData,
                submissionAlreadyExists: false,
            },
        });

        // Click the register submission button
        const registerSubmissionBtn = screen.getByTestId('registerSubmission');
        userEvent.click(registerSubmissionBtn);

        // Wait for the dialog to be rendered
        const confirmDialog = await screen.findByRole("dialog");

        // Check that the dialog is rendered
        expect(confirmDialog).toBeInTheDocument();
        expect(screen.getByText('confirmSubmission')).toBeInTheDocument();
    });

    test("should close confirm submission dialog when cancel button is clicked", async() => {
        renderComponent({
            componentData: {
                ...mockComponentData,
                submissionAlreadyExists: false,
            },
        });

        // Click the register submission button
        const registerSubmissionBtn = screen.getByTestId('registerSubmission');
        userEvent.click(registerSubmissionBtn);

        // Wait for the dialog to be rendered
        const confirmDialog = await screen.findByRole("dialog");
        expect(confirmDialog).toBeInTheDocument();

        // Click the cancel button
        const cancelBtn = screen.getByText('cancel');
        userEvent.click(cancelBtn);

        // Wait for the dialog to be removed from the DOM
        waitFor(() => {
            expect(confirmDialog).not.toBeInTheDocument();
        });
    });

    test("should render on successful register submission dialog when confirm button is clicked", async () => {
        vi.doMock("../../../redux/api/transgressionsApi", () => ({
            transgressionsApi: {
                useRegisterSubmissionMutation: () => ({
                    mutate: vi.fn().mockImplementation(() => Promise.resolve({})),
                }),
            },
        }));

        renderComponent({
            componentData: {
                ...mockComponentData,
                submissionAlreadyExists: false,
            },
        });

        const registerSubmissionBtn = screen.getByTestId("registerSubmission");
        await userEvent.click(registerSubmissionBtn);

        // Ensure confirm dialog appears
        const confirmDialog = await screen.findByTestId("confirmSubmissionDialog");
        expect(confirmDialog).toBeInTheDocument();

        const confirmBtn = screen.getByText("confirm");
        await userEvent.click(confirmBtn);

        // Wait for confirmDialog to be removed
        await waitFor(() => {
            expect(screen.queryByRole("confirmSubmissionDialog")).not.toBeInTheDocument();
        });

        // Ensure the feedback dialog appears
        const feedbackDialog = await screen.findByTestId("feedbackDialog");
        expect(feedbackDialog).toBeInTheDocument();
        expect(screen.getByText("submissionRegistered")).toBeInTheDocument();
    });

    test("should close the successful register submission feedback dialog when close button is clicked", async() => {

        vi.doMock("../../../redux/api/transgressionsApi", () => ({
            transgressionsApi: {
                useRegisterSubmissionMutation: () => ({
                    mutate: vi.fn().mockImplementation(() => Promise.resolve({})),
                }),
            },
        }));

        renderComponent({
            componentData: {
                ...mockComponentData,
                submissionAlreadyExists: false,
            },
        });

        const registerSubmissionBtn = screen.getByTestId("registerSubmission");
        await userEvent.click(registerSubmissionBtn);

        // Ensure confirm dialog appears
        const confirmDialog = await screen.findByTestId("confirmSubmissionDialog");
        expect(confirmDialog).toBeInTheDocument();

        const confirmBtn = screen.getByText("confirm");
        await userEvent.click(confirmBtn);

        // Wait for confirmDialog to be removed
        await waitFor(() => {
            expect(screen.queryByRole("confirmSubmissionDialog")).not.toBeInTheDocument();
        });

        // Ensure the feedback dialog appears
        const feedbackDialog = await screen.findByTestId("feedbackDialog");
        expect(feedbackDialog).toBeInTheDocument();
        expect(screen.getByText("submissionRegistered")).toBeInTheDocument();

        // Click the close button
        const closeBtn = screen.getByText('close');
        await userEvent.click(closeBtn);

        // Wait for the dialog to be removed from the DOM
        waitFor(() => {
            expect(feedbackDialog).not.toBeInTheDocument();
        });
    });

    test("should render view transgression dialog when view transgression button is clicked", async() => {
        renderComponent({
            componentData: {
                ...mockComponentData,
                submissionAlreadyExists: true,
            },
        });

        // Click the view transgression button
        const viewTransgressionBtn = screen.getByTestId('viewTransgression');
        userEvent.click(viewTransgressionBtn);

        // Wait for the dialog to be rendered
        const viewTransgressionDialog = await screen.findByRole("dialog");

        // Check that the dialog is rendered
        expect(viewTransgressionDialog).toBeInTheDocument();
        expect(screen.getByText('TransgressionView')).toBeInTheDocument();
    });

    test("should close view transgression dialog when close button is clicked", async() => {
        renderComponent({
            componentData: {
                ...mockComponentData,
                submissionAlreadyExists: true,
            },
        });

        // Click the view transgression button
        const viewTransgressionBtn = screen.getByTestId('viewTransgression');
        userEvent.click(viewTransgressionBtn);

        // Wait for the dialog to be rendered
        const viewTransgressionDialog = await screen.findByRole("dialog");
        expect(viewTransgressionDialog).toBeInTheDocument();

        // Click the close button
        const closeBtn = screen.getByText('close');
        userEvent.click(closeBtn);

        // Wait for the dialog to be removed from the DOM
        waitFor(() => {
            expect(viewTransgressionDialog).not.toBeInTheDocument();
        });
    });
});
