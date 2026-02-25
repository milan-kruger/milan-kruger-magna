import { renderHook, waitFor } from '@testing-library/react';
import { describe, test, expect, beforeEach, vi } from 'vitest';
import useManualPaymentsManager from '../../hooks/payments/ManualPaymentsManager';
import { act } from 'react';

const mockNavigate = vi.fn();
const mockSetOpenDialog = vi.fn();
const mockSetDialogTitle = vi.fn();
const mockSetDialogMessage = vi.fn();
const mockSetTransgressionDetails = vi.fn();
const mockSetPaymentReceipt = vi.fn();

const mockTriggerRetrieveTransgressionDetails = vi.fn();
const mockHandleProcessManualPayment = vi.fn();

const mockRetrieveTransgressionDetailsResponse = {
    transgression: {
        status: 'CREATED',
        authorityCode: 'AUTH',
    }
};

const mockValidateTransgressionResponse = {
    isValid: true,
    elaborations: ['Some elaboration']
};

const mockProcessManualPaymentResponse = {
    paymentSuccessful: true,
    paymentReceipt: { receiptNumber: 'RCPT123' }
};

const mockProvidePaymentReceiptResponse = {
    encodedPdf: 'PDFDATA'
};

vi.mock('react-router-dom', () => ({
    ...vi.importActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

vi.mock('../../redux/api/transgressionsApi', () => {
    const originalModule = vi.importActual('../../redux/api/transgressionsApi');
    return {
        ...originalModule,
        useRetrieveTransgressionDetailsMutation: vi.fn(() => [
            mockTriggerRetrieveTransgressionDetails,
            {
                data: mockRetrieveTransgressionDetailsResponse,
                isLoading: false,
                isSuccess: true
            }
        ]),
        useValidateTransgressionQuery: vi.fn(() => ({
            data: mockValidateTransgressionResponse,
            isFetching: false
        })),
        useProcessManualPaymentMutation: vi.fn(() => [
            mockHandleProcessManualPayment,
            {
                data: mockProcessManualPaymentResponse,
                isLoading: false,
                isError: false,
                isSuccess: true
            }
        ]),
        useProvidePaymentRequestQuery: vi.fn(() => ({
            data: mockProvidePaymentReceiptResponse,
            isFetching: false
        }))
    };
});

describe('useManualPaymentsManager', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test('initializes with default values', () => {
        const { result } = renderHook(() =>
            useManualPaymentsManager(
                mockSetOpenDialog,
                mockSetDialogTitle,
                mockSetDialogMessage,
                mockSetTransgressionDetails,
                mockSetPaymentReceipt
            )
        );
        expect(result.current).toBeDefined();
        expect(result.current.accessRoles).toContain('MANUALPAYMENT_MAINTAIN');
        expect(result.current.accessRoles).toContain('MANUALPAYMENT_VIEW');
        expect(result.current.navigate).toBe(mockNavigate);
        expect(typeof result.current.triggerRetrieveTransgressionDetails).toBe('function');
        expect(typeof result.current.handleProcessManualPayment).toBe('function');
        expect(result.current.processPaymentLoading).toBe(false);
    });

    test('triggerRetrieveTransgressionDetails is called', () => {
        const { result } = renderHook(() =>
            useManualPaymentsManager(
                mockSetOpenDialog,
                mockSetDialogTitle,
                mockSetDialogMessage,
                mockSetTransgressionDetails,
                mockSetPaymentReceipt
            )
        );
        act(() => {
            result.current.triggerRetrieveTransgressionDetails({
                retrieveTransgressionDetailsRequest: {
                    noticeNumber: 'NOTICE123'
                }
            });
        });
        expect(mockTriggerRetrieveTransgressionDetails).toHaveBeenCalled();
    });

    test('handleProcessManualPayment is called with correct params', () => {
        const { result } = renderHook(() =>
            useManualPaymentsManager(
                mockSetOpenDialog,
                mockSetDialogTitle,
                mockSetDialogMessage,
                mockSetTransgressionDetails,
                mockSetPaymentReceipt
            )
        );
        act(() => {
            result.current.handleProcessManualPayment('NOTICE123', 100, 'ZAR');
        });
        expect(mockHandleProcessManualPayment).toHaveBeenCalledWith({
            processManualPaymentRequest: {
                noticeNumber: 'NOTICE123',
                amount: { amount: 100, currency: 'ZAR' },
                receiptRequired: true
            }
        });
    });

    test('sets dialog and validation state for already paid transgression', async () => {
        const paidRetrieveTransgressionDetailsResponse = { ...mockRetrieveTransgressionDetailsResponse };
        paidRetrieveTransgressionDetailsResponse.transgression.status = 'PAID';
        Object.assign(mockRetrieveTransgressionDetailsResponse, paidRetrieveTransgressionDetailsResponse);

        renderHook(() =>
            useManualPaymentsManager(
                mockSetOpenDialog,
                mockSetDialogTitle,
                mockSetDialogMessage,
                mockSetTransgressionDetails,
                mockSetPaymentReceipt
            )
        );
        await waitFor(() => {
            expect(mockSetOpenDialog).toHaveBeenCalledWith(true);
            expect(mockSetDialogTitle).toHaveBeenCalledWith('transgressionAlreadyPaidTitle');
            expect(mockSetDialogMessage).toHaveBeenCalledWith('transgressionAlreadyPaidMessage');
        });
    });

    test('sets dialog for not found transgression', async () => {
        const notFoundRetrieveTransgressionDetailsResponse = {
            transgression: undefined
        };
        Object.assign(mockRetrieveTransgressionDetailsResponse, notFoundRetrieveTransgressionDetailsResponse);

        renderHook(() =>
            useManualPaymentsManager(
                mockSetOpenDialog,
                mockSetDialogTitle,
                mockSetDialogMessage,
                mockSetTransgressionDetails,
                mockSetPaymentReceipt
            )
        );
        await waitFor(() => {
            expect(mockSetOpenDialog).toHaveBeenCalledWith(true);
            expect(mockSetDialogTitle).toHaveBeenCalledWith('transgressionNotFoundTitle');
            expect(mockSetDialogMessage).toHaveBeenCalledWith('transgressionNotFound');
        });
    });

    test('sets transgression details if validation is valid', async () => {
        renderHook(() =>
            useManualPaymentsManager(
                mockSetOpenDialog,
                mockSetDialogTitle,
                mockSetDialogMessage,
                mockSetTransgressionDetails,
                mockSetPaymentReceipt
            )
        );
        await waitFor(() => {
            expect(mockSetTransgressionDetails).toHaveBeenCalledWith(mockRetrieveTransgressionDetailsResponse);
        });
    });

    test('sets dialog if validation is invalid', async () => {
        const invalidValidateTransgressionResponse = {...mockValidateTransgressionResponse};
        invalidValidateTransgressionResponse.isValid = false;
        invalidValidateTransgressionResponse.elaborations = ["Invalid!"];
        Object.assign(mockValidateTransgressionResponse, invalidValidateTransgressionResponse);

        renderHook(() =>
            useManualPaymentsManager(
                mockSetOpenDialog,
                mockSetDialogTitle,
                mockSetDialogMessage,
                mockSetTransgressionDetails,
                mockSetPaymentReceipt
            )
        );
        await waitFor(() => {
            expect(mockSetOpenDialog).toHaveBeenCalledWith(true);
            expect(mockSetDialogTitle).toHaveBeenCalledWith('transgressionStatusInvalidTitle');
            expect(mockSetDialogMessage).toHaveBeenCalledWith('Invalid!');
        });
    });

    test('sets payment receipt when receipt is available', async () => {
        renderHook(() =>
            useManualPaymentsManager(
                mockSetOpenDialog,
                mockSetDialogTitle,
                mockSetDialogMessage,
                mockSetTransgressionDetails,
                mockSetPaymentReceipt
            )
        );
        await waitFor(() => {
            expect(mockSetPaymentReceipt).toHaveBeenCalledWith('PDFDATA');
        });
    });

    test('sets receipt number when payment is successful', async () => {
        renderHook(() =>
            useManualPaymentsManager(
                mockSetOpenDialog,
                mockSetDialogTitle,
                mockSetDialogMessage,
                mockSetTransgressionDetails,
                mockSetPaymentReceipt
            )
        );
        // The effect should set the receipt number internally, but since it's not exposed, we just check that the payment receipt query is called and the receipt is set
        await waitFor(() => {
            expect(mockSetPaymentReceipt).toHaveBeenCalledWith('PDFDATA');
        });
    });
});
