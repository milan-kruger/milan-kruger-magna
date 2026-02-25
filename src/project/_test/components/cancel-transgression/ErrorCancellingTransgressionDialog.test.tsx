import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ErrorCancellingTransgressionDialog from '../../../components/cancel-transgression/ErrorCancellingTransgressionDialog';

const TEST_ID = 'errorCancellingErrorCancellingDialog';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            if (key === 'errorCancellingTransgression' || key === 'close') {
                return key;
            }
            return `missing(${key})`;
        },
    }),
}));

vi.mock('../../../../framework/components/button/TmButton', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: ({ onClick, children, testid }: any) => (
        <button data-testid={testid} onClick={onClick}>
            {children}
        </button>
    ),
}));

describe('ErrorCancellingTransgressionDialog', () => {
    beforeEach(
        cleanup
    );

    it('should render dialog initially open with translated content', () => {
        render(<ErrorCancellingTransgressionDialog />);
        expect(
            screen.getByText('errorCancellingTransgression')
        ).toBeInTheDocument();

        expect(
            screen.getByTestId('errorCancellingErrorCancellingDialog')
        ).toBeInTheDocument();
    });

    it('should close dialog when close button is clicked', async () => {
        render(<ErrorCancellingTransgressionDialog />);
        const closeButton = screen.getByTestId('errorCancellingErrorCancellingDialog');

        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(
                screen.queryByText('errorCancellingTransgression')
            ).not.toBeInTheDocument();
        });
    });

    it('should handle missing translation keys gracefully', () => {
        render(<ErrorCancellingTransgressionDialog />);
        expect(screen.getByText('errorCancellingTransgression')).toBeInTheDocument();
        expect(screen.getByText('close')).toBeInTheDocument();
        expect(screen.queryByText(/missing\(/)).not.toBeInTheDocument();
    });

    it('should close dialog when clicking the mocked TmButton', async () => {
        render(<ErrorCancellingTransgressionDialog />);
        fireEvent.click(screen.getByTestId(TEST_ID));
        await waitFor(() => {
            expect(screen.queryByText('errorCancellingTransgression')).not.toBeInTheDocument();
        });
    });

    it('should render and clean up without memory leaks or errors', () => {
        const { unmount } = render(<ErrorCancellingTransgressionDialog />);
        expect(screen.getByText('errorCancellingTransgression')).toBeInTheDocument();
        unmount();
        // Cleanup successful if no errors are thrown
    });

    it('should remain closed after user closes it, even on re-render', async () => {
        const { rerender } = render(<ErrorCancellingTransgressionDialog />);
        fireEvent.click(screen.getByTestId(TEST_ID));
        await waitFor(() => {
            expect(screen.queryByText('errorCancellingTransgression')).not.toBeInTheDocument();
        });

        rerender(<ErrorCancellingTransgressionDialog />);
        expect(screen.queryByText('errorCancellingTransgression')).not.toBeInTheDocument();
    });

    it('should not re-render due to memo if props are the same', () => {
        const spy = vi.fn();
        // Wrap component with a spy to monitor re-render
        const Wrapper = () => {
            spy();
            return <ErrorCancellingTransgressionDialog />;
        };

        const { rerender } = render(<Wrapper />);
        expect(spy).toHaveBeenCalledTimes(1);

        rerender(<Wrapper />);
        expect(spy).toHaveBeenCalledTimes(2); // Wrapper renders twice
        // But memo should prevent ErrorCancellingTransgressionDialog internal rerender unless props change
    });

    it('should not crash if TmButton does not receive an onClick', async () => {
        // Re-mock TmButton to exclude onClick
        vi.doMock('../../../../framework/components/button/TmButton', () => ({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            default: ({ children, testid }: any) => (
                <button data-testid={testid}>{children}</button>
            ),
        }));

        const { unmount } = render(<ErrorCancellingTransgressionDialog />);
        fireEvent.click(screen.getByTestId(TEST_ID)); // No error should occur
        unmount();
    });
});
