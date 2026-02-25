import { useLocation, useNavigate } from "react-router-dom";
import { Court, FindTransgressionParameterApiArg, Money, ProvideCourtCaseListRequest, useFinaliseCourtResultMutation, useFindTransgressionParameterQuery, useProvideCourtCaseListMutation } from "../../redux/api/transgressionsApi";
import { useAppDispatch, useAppSelector } from "../../../framework/redux/hooks";
import { captureCourtResultSlice, selectForm } from "../../redux/capture-court-result/CaptureCourtResultSlice";
import { useEffect, useMemo, useState } from "react";
import { CaptureCourtResultValidation } from "../../redux/capture-court-result/CaptureCourtResultValidation";
import { CourtData } from "./CourtResultManager";
import dayjs, { Dayjs } from "dayjs";
import { ROUTE_NAMES } from "../../Routing.tsx";

const useCaptureCourtResultsManager = (
    setShowConfirmResults: (value: boolean) => void,
    setShowDiscardChanges: (value: boolean) => void,
    courts: Court[]
) => {
    const navigate = useNavigate();
    const location = useLocation();

    // States
    const form = useAppSelector(selectForm);
    const dispatch = useAppDispatch();
    const formValidation = useAppSelector(() => form.formValidation as CaptureCourtResultValidation);

    const [generateWarrantNumber, setGenerateWarrantNumber] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const transgressionDetails = useMemo(() => {
        return location.state.courtCaseDetails;
    }, [location]);

    const courtData = useMemo(() => {
        return (location.state.courtData ?? {}) as CourtData;
    }, [location]);

    const [finaliseCourtResults, { isLoading: loadingFinaliseCourtResult }] = useFinaliseCourtResultMutation();
    const [retrieveCourtCaseList, { isLoading: loadingCourtCaseList }] = useProvideCourtCaseListMutation();

    const [findTransgressionParameterRequest] = useState<FindTransgressionParameterApiArg>({
        name: "WARRANT_NUMBER_GENERATION"
    });

    const warrantNumberGeneration = useFindTransgressionParameterQuery(findTransgressionParameterRequest)

    const [courtDateList, setCourtDateList] = useState<Dayjs[]>([]);

    const [roomContemptOfCourtFee, setRoomContemptOfCourtFee] = useState<Money>();

    useEffect(() => {
        if (warrantNumberGeneration.data?.value === "TRUE") {
            setGenerateWarrantNumber(true);
        } else {
            setGenerateWarrantNumber(false);
        }
    }, [setGenerateWarrantNumber, warrantNumberGeneration])

    useEffect(() => {
        const selectedCourt = courts.find(
            (court: Court) => court.courtName === courtData.courtName
        );

        const selectedRoom = selectedCourt?.courtRooms.find(
            (courtRoom) => courtRoom.room === courtData.courtRoom
        );

        if (selectedRoom) {
            setRoomContemptOfCourtFee(selectedRoom.courtRoomParameters.contemptOfCourtFee);
            setCourtDateList(
                selectedRoom.courtRoomBookings.map((booking) =>
                    dayjs(booking.operatingDate)
                )
            );
        } else {
            setCourtDateList([]);
        }

    }, [courts, courtData])

    useEffect(() => {
        const formValidation: CaptureCourtResultValidation = {
            caseNumber: true,
            courtOutcome: true,
            sentence: false,
            newCourtDate: false,
            sentenceType: false,
            amountPaid: false,
            reason: false,
            receiptNumber: false,
            paymentMethod: false,
            sentenceLength: false,
            sentenceTimePeriod: false,
            warrantNumber: false,
            period: false,
            contemptOfCourtFee: false
        }
        dispatch(
            captureCourtResultSlice.actions.setFormValidations(formValidation)
        );
    }, [dispatch])

    useEffect(() => {
        const formPassedValidation = Object.values(formValidation).every(
            (value) => !value
        );
        if (formPassedValidation) {
            dispatch(captureCourtResultSlice.actions.setFormValidation(false));
        } else {
            dispatch(captureCourtResultSlice.actions.setFormValidation(true));
        }
    }, [dispatch, formValidation]);

    useEffect(() => {
        setIsLoading(loadingFinaliseCourtResult || loadingCourtCaseList);
    }, [loadingFinaliseCourtResult, loadingCourtCaseList])

    const onSubmitResults = () => {
        setShowConfirmResults(true);
    }

    const provideCourtCaseList = (request: ProvideCourtCaseListRequest) => {
        const courtData: CourtData = {
            courtName: request.courtName,
            courtRoom: request.courtRoom,
            courtDate: request.courtDate
        }

        retrieveCourtCaseList({
            provideCourtCaseListRequest: request
        }).unwrap().then((response) => {
            if (response.courtCaseList) {
                navigate("/court-documents/court-results/court-case-list", {
                    replace: true,
                    state: {
                        courtCaseList: response.courtCaseList,
                        courtData,
                        courtDateList: courtDateList ?? [],
                        courts: courts
                    }
                });
            }
        })

    }

    const onConfirmResults = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = form.formData as any;
        const amountPaid: Money = {
            currency: transgressionDetails.totalAmountPayable.currency,
            amount: data.amountPaid ? data.amountPaid.amount : data.amountPaid
        };

        const contemptCourtFee: Money = {
            currency: transgressionDetails.totalAmountPayable.currency,
            amount: data.contemptOfCourtFee ? data.contemptOfCourtFee.amount : data.contemptOfCourtFee
        }

        finaliseCourtResults({
            finaliseCourtResultRequest: {
                noticeNumber: transgressionDetails.noticeNumber.number,
                courtOutcome: data.courtOutcome,
                caseNumber: data.caseNumber,
                newCourtDate: data.newCourtDate,
                amountPaid: data.amountPaid ? amountPaid : undefined,
                reason: data.reason,
                receiptNumber: data.receiptNumber,
                sentence: data.sentence,
                sentenceType: data.sentenceType,
                paymentMethod: data.paymentMethod,
                sentenceLength: data.sentenceLength,
                sentenceTimePeriod: data.sentenceTimePeriod,
                warrantNumber: data.warrantNumber,
                warrantNumberGeneration: generateWarrantNumber,
                contemptOfCourtFee: data.contemptOfCourtFee ? contemptCourtFee : undefined
            }
        }).unwrap().then((response) => {
            if (response.courtResultCaptured) {
                provideCourtCaseList({
                    courtName: courtData.courtName,
                    courtRoom: courtData.courtRoom,
                    courtDate: courtData.courtDate
                });
            }
        })

    }

    const onCancelCourtResults = () => {
        setShowDiscardChanges(true);
    }

    const onDiscardChanges = () => {
        navigate(`/${ROUTE_NAMES.courtCaseList}`, {
            replace: false,
            state: {
                courtCaseList: location.state.courtCaseList,
                courtData: location.state.courtData,
                courtDateList: location.state.courtDateList,
                courts: location.state.courts
            }
        });
    }

    return {
        transgressionDetails,
        generateWarrantNumber,
        onSubmitResults,
        onCancelCourtResults,
        onConfirmResults,
        onDiscardChanges,
        courtDateList,
        roomContemptOfCourtFee,
        isLoading
    }
}

export default useCaptureCourtResultsManager;
