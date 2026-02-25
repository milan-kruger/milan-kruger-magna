import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { Role } from "../../auth/roles";
import {
  RetrieveTransgressionDetailsApiResponse,
  useProcessManualPaymentMutation,
  useProvidePaymentRequestQuery,
  useRetrieveTransgressionDetailsMutation,
  useValidateTransgressionQuery,
  ValidateTransgressionApiArg
} from "../../redux/api/transgressionsApi";

export type ManualPaymentsState = {
  accessRoles: Role[];
  confirmMessage?: string;
  returnPath?: string;
  invalidNoticeNumber?: boolean;
  setOpenDialog?: boolean;
  setDialogTitle?: string;
  setDialogMessage?: string;
};

const useManualPaymentsManager = (
  setOpenDialog: (value: boolean) => void,
  setDialogTitle: (value: string) => void,
  setDialogMessage: (value: string) => void,
  setTransgressionDetails: (
    value: RetrieveTransgressionDetailsApiResponse
  ) => void,
  setPaymentReceipt: Dispatch<SetStateAction<string | undefined>>
) => {
  const navigate = useNavigate();
  const accessRoles: Role[] = ["MANUALPAYMENT_MAINTAIN", "MANUALPAYMENT_VIEW"];
  const [receiptNumber, setReceiptNumber] = useState<string>("");

  const [transgressionResponse, setTransgressionResponse] = useState<RetrieveTransgressionDetailsApiResponse>({});
  const [validateTransgressionRequest, setValidateTransgressionRequest] = useState<ValidateTransgressionApiArg>({
    status:"",
    authorityCode:""
  } as ValidateTransgressionApiArg);


  const [triggerRetrieveTransgressionDetails, {
    data: retrieveTransgressionDetailsResponse,
    isLoading: isLoadingTransgressions,
    isSuccess: isTransgressionSuccess
  }] = useRetrieveTransgressionDetailsMutation();

  useEffect(() => {
    if (retrieveTransgressionDetailsResponse?.transgression && !isLoadingTransgressions) {
      if (retrieveTransgressionDetailsResponse.transgression.status === "PAID") {
        setOpenDialog(true);
        setDialogTitle("transgressionAlreadyPaidTitle");
        setDialogMessage("transgressionAlreadyPaidMessage");
      }
      else {
        setValidateTransgressionRequest({
            status:retrieveTransgressionDetailsResponse.transgression.status,
            authorityCode:retrieveTransgressionDetailsResponse.transgression.authorityCode,
        });
        setTransgressionResponse(retrieveTransgressionDetailsResponse);
      }
    }
    else if ((retrieveTransgressionDetailsResponse == null || !retrieveTransgressionDetailsResponse?.transgression) && isTransgressionSuccess) {
        setOpenDialog(true);
        setDialogTitle("transgressionNotFoundTitle");
        setDialogMessage("transgressionNotFound");
    }
  }, [isLoadingTransgressions, isTransgressionSuccess, retrieveTransgressionDetailsResponse, setDialogMessage, setDialogTitle, setOpenDialog]);

  const {
      data: validateTransgressionResponse,
      isFetching: isFetchingValidation
  } = useValidateTransgressionQuery(validateTransgressionRequest, {
      skip: !validateTransgressionRequest.authorityCode ||
            !validateTransgressionRequest.status ||
            !isTransgressionSuccess,
      refetchOnMountOrArgChange:true,
  });

  useEffect(() => {
    if(validateTransgressionResponse){
      if(validateTransgressionResponse.isValid && !isFetchingValidation){
        setTransgressionDetails(transgressionResponse);
      } else if(!validateTransgressionResponse.isValid && !isFetchingValidation){
        setOpenDialog(true);
        setDialogTitle("transgressionStatusInvalidTitle");
        setDialogMessage(validateTransgressionResponse.elaborations?.[0] ?? "transgressionStatusInvalidMessage");
      }
    }
  },[isFetchingValidation, setDialogMessage, setDialogTitle, setOpenDialog, setTransgressionDetails, transgressionResponse, validateTransgressionResponse]);

  const [
      processManualPaymentRequest,
       {
        data: processManualPaymentResponse,
        isLoading: processPaymentLoading,
        isError: processPaymentError,
        isSuccess: processPaymentSuccess,
      },
    ] = useProcessManualPaymentMutation();

  const {
      data: providePaymentReceiptResponse,
      isFetching: isFetchingReceipt
  } = useProvidePaymentRequestQuery({ receiptNumber }, {
      skip: !processPaymentSuccess || !receiptNumber,
      refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    if (providePaymentReceiptResponse?.encodedPdf && !isFetchingReceipt) {
        setPaymentReceipt(providePaymentReceiptResponse.encodedPdf.toString());
    }
  }, [isFetchingReceipt, providePaymentReceiptResponse, setDialogMessage, setDialogTitle, setOpenDialog, setPaymentReceipt]);

  const handleProcessManualPayment = (
    noticeNumber: string,
    amount: number,
    currency: string
  ) => {
    if (noticeNumber !== "") {
      processManualPaymentRequest({
        processManualPaymentRequest: {
          noticeNumber: noticeNumber,
          amount: {
            amount: amount,
            currency: currency,
          },
          receiptRequired: true,
        },
      });
    }
  };

  useEffect(() => {
    if (
      processPaymentSuccess &&
      !processPaymentLoading &&
      !processPaymentError &&
      processManualPaymentResponse.paymentSuccessful
    ) {
      setReceiptNumber(
        processManualPaymentResponse.paymentReceipt?.receiptNumber ?? ""
      );
    }
  }, [
    processManualPaymentResponse,
    processPaymentError,
    processPaymentLoading,
    processPaymentSuccess,
    setDialogMessage,
    setDialogTitle,
    setOpenDialog,
    setPaymentReceipt,
  ]);

  return {
    accessRoles,
    navigate,
    triggerRetrieveTransgressionDetails,
    handleProcessManualPayment,
    processPaymentLoading
  };
};

export default useManualPaymentsManager;
