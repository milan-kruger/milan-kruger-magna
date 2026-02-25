import { Box, Stack, Theme, Typography, useMediaQuery, useTheme, Grid } from "@mui/material";
import TmTextField from "../../../framework/components/textfield/TmTextField";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import TmNumberField from "../../../framework/components/textfield/TmNumberField";
import TmDatePicker from "../../../framework/components/textfield/date-time/TmDatePicker";
import TmTextArea from "../../../framework/components/textfield/TmTextArea";
import TmChargeList from "../prosecution/ChargeList";
import toCamelCase, { removeUnderscores, titleCaseWord, toCamelCaseWords } from "../../../framework/utils";
import { t } from "i18next";
import { useAppDispatch, useAppSelector } from "../../../framework/redux/hooks";
import { ChangeEvent, ReactNode, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { captureCourtResultSlice, FormState } from "../../redux/capture-court-result/CaptureCourtResultSlice";
import { CourtResult, FinaliseCourtResultRequest, Money, SnapshotCharge } from "../../redux/api/transgressionsApi";
import { CaptureCourtResultValidation } from "../../redux/capture-court-result/CaptureCourtResultValidation";
import { CourtOutCome } from "../../enum/CourtOutCome";
import { SentenceTimePeriod } from "../../enum/SentenceTimePeriod";
import { TransgressionStatus } from "../../enum/TransgressionStatus";
import dayjs, { Dayjs } from "dayjs";
import { GetLookupsApiArg, LookupResponse, useGetLookupsQuery } from "../../redux/api/coreApi";
import { MIN_LOOKUP_PAGE_SIZE } from "../../../framework/components/list/util";
import TmReloadElement from "../ReloadElement";

const COURT_FINE = "Court Fine";
const COURT_PAYMENT = "Court Payment";
const ONLINE_PAYMENT = "Online Payment";

type Props = {
    testIdPrefix: string,
    sx: object,
    transgressionDetails?: {
        status: string,
        courtAppearanceDate: string,
        noticeNumber: string,
        snapshotCharges: SnapshotCharge[],
        totalAmountPayable: number,
        paymentReference: string
    },
    fieldWith: string,
    form: FormState,
    courtResult?: CourtResult,
    showWarrantNumber?: boolean,
    courtDateList?: dayjs.Dayjs[],
    contemptOfCourtFee?: Money,
    readonly?: boolean
}

const CaptureCourtResultsForm = ({ testIdPrefix, sx, transgressionDetails, fieldWith, form, courtResult,
    showWarrantNumber, courtDateList, contemptOfCourtFee, readonly = false }: Readonly<Props>) => {
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
    const theme = useTheme();
    const hasEditedRef = useRef(false);

    useEffect(() => {
        return () => {
            // Clear form data when component unmounts
            dispatch(captureCourtResultSlice.actions.clearForm());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Lookups
    const [sentenceRequest] = useState<GetLookupsApiArg>({
        lookupType: "SENTENCE",
        page: 0,
        pageSize: MIN_LOOKUP_PAGE_SIZE,
        sortDirection: 'ASC',
        sortFields: ['lookupType', 'lookupValue'],
        isValid: true
    });

    const [sentenceTypeRequest] = useState<GetLookupsApiArg>({
        lookupType: "SENTENCE_TYPE",
        page: 0,
        pageSize: MIN_LOOKUP_PAGE_SIZE,
        sortDirection: 'ASC',
        sortFields: ['lookupType', 'lookupValue'],
        isValid: true
    });

    const [paymentMethodRequest] = useState<GetLookupsApiArg>({
        lookupType: "PAYMENT_METHOD",
        page: 0,
        pageSize: MIN_LOOKUP_PAGE_SIZE,
        sortDirection: 'ASC',
        sortFields: ['lookupType', 'lookupValue'],
        isValid: true
    });

    const { data: sentenceResponse, isFetching: isSentenceFetching } = useGetLookupsQuery(sentenceRequest);
    const { data: sentenceTypeResponse, isFetching: isSentenceTypeFetching } = useGetLookupsQuery(sentenceTypeRequest);
    const { data: paymentMethodResponse, isFetching: isPaymentMethodFetching } = useGetLookupsQuery(paymentMethodRequest);

    const [outcome, setOutcome] = useState<CourtOutCome>((courtResult ? courtResult.courtOutcome : '') as CourtOutCome);
    const [period, setPeriod] = useState<SentenceTimePeriod>((courtResult ? courtResult.sentenceTimePeriod : '') as SentenceTimePeriod);
    const [sentence, setSentence] = useState<string>((courtResult?.sentence ? courtResult.sentence : ''));
    const [sentenceType, setSentenceType] = useState<string>((courtResult?.sentenceType ? courtResult.sentenceType : ''));
    const [paymentMethod, setPaymentMethod] = useState<string>((courtResult?.paymentMethod ? courtResult.paymentMethod : ''));
    const [transgressionStatus, setTransgressionStatus] = useState((courtResult?.transgressionStatus ? courtResult.transgressionStatus : transgressionDetails?.status))
    const [charges] = useState((courtResult?.snapshotCharges ? courtResult.snapshotCharges : transgressionDetails?.snapshotCharges))


    const outcomes: CourtOutCome[] = Object.values(CourtOutCome);
    const sentenceTimePeriod: SentenceTimePeriod[] = Object.values(SentenceTimePeriod);

    // FormData
    const formCaseNumber = useAppSelector(() => (courtResult?.caseNumber ?? (form.formData as FinaliseCourtResultRequest).caseNumber));
    const formSentence = useAppSelector(() => (form.formData as FinaliseCourtResultRequest).sentence);
    const formSentenceType = useAppSelector(() => (courtResult?.sentenceType ?? (form.formData as FinaliseCourtResultRequest).sentenceType));
    const formNewCourtDate = useAppSelector(() => (courtResult?.newCourtDate ?? (form.formData as FinaliseCourtResultRequest).newCourtDate));
    const formWarrantNumber = useAppSelector(() => (courtResult?.warrantNumber ?? (form.formData as FinaliseCourtResultRequest).warrantNumber));
    const formSentenceLength = useAppSelector(() => (courtResult?.sentenceLength ? courtResult.sentenceLength : (form.formData as FinaliseCourtResultRequest).sentenceLength));
    const formReason = useAppSelector(() => (courtResult?.reason ? courtResult?.reason : (form.formData as FinaliseCourtResultRequest).reason));
    const formReceiptNo = useAppSelector(() => (courtResult?.paymentMethod === ONLINE_PAYMENT ? transgressionDetails?.noticeNumber : courtResult?.receiptNumber ?? (form.formData as FinaliseCourtResultRequest).receiptNumber));
    const formAmountPaid = useAppSelector(() => {
        if (courtResult?.amountPaid?.amount) {
            return courtResult.amountPaid.amount;
        }

        if (transgressionDetails?.totalAmountPayable) {
            return transgressionDetails.totalAmountPayable;
        }

        return (form.formData as FinaliseCourtResultRequest).amountPaid?.amount;
    });

    const formContemptCourtFee = useAppSelector(() => {
        if (courtResult?.contemptOfCourtFee?.amount) {
            return courtResult.contemptOfCourtFee.amount;
        }

        return (form.formData as FinaliseCourtResultRequest).contemptOfCourtFee?.amount;
    });

    // Validation
    const formCaseNumberValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).caseNumber);
    const formCourtOutcomeValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).courtOutcome);
    const formSentenceValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).sentence);
    const formSentenceTypeValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).sentenceType);
    const formPaymentMethodValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).paymentMethod);
    const formNewCourtDateValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).newCourtDate);
    const formWarrantNumberValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).warrantNumber);
    const formContemptCourtFeeValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).contemptOfCourtFee);
    const formSentenceLengthValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).sentenceLength);
    const formPeriodValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).period);
    const formReceiptNoValidation = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).receiptNumber);
    const formAmountPaidError = useAppSelector(() => (form.formValidation as CaptureCourtResultValidation).amountPaid);

    useEffect(() => {
        if (transgressionDetails) {
            setTransgressionStatus(transgressionDetails.status)
        }

        if (courtResult) {
            setTransgressionStatus(courtResult.transgressionStatus)
        }
    }, [transgressionDetails, courtResult])

    // Onchange events
    const caseNoOnChange = (event: ChangeEvent<HTMLInputElement>) => {
        const eventValue = event.target.value;
        const upperCasedValue = eventValue.toUpperCase();
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "caseNumber", value: upperCasedValue }));
    }

    const onChangeReceiptNo = (event: ChangeEvent<HTMLInputElement>) => {
        const eventValue = event.target.value;
        const upperCasedValue = eventValue.toUpperCase();
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "receiptNumber", value: upperCasedValue }));
    }

    const onChangeAmountPaid = (value: number) => {
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "amountPaid.amount", value: value }));
    }

    const onChangeLength = (value: number) => {
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentenceLength", value: value }));
    }

    const handlePeriodChange = (_event: React.SyntheticEvent<Element, Event>, value: string | null,): void => {
        if (value != null) {
            setPeriod(value as SentenceTimePeriod);
        } else {
            setPeriod('' as SentenceTimePeriod);
        }
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentenceTimePeriod", value: value ?? undefined }));
    };

    const onChangeSentence = useCallback((_event: SyntheticEvent<Element, Event>, value: LookupResponse | null) => {
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentence", value: value ? value.lookupValue : undefined }));
        if (outcome === CourtOutCome.GUILTY && (value && value.lookupValue === "Fine") &&
            transgressionStatus === TransgressionStatus.ISSUED) {
            setSentenceType(COURT_FINE)
            setPaymentMethod(COURT_PAYMENT)
            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentenceType", value: COURT_FINE }));
            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "paymentMethod", value: COURT_PAYMENT }));
        }
    }, [dispatch, outcome, transgressionStatus]);

    useEffect(() => {
        if (courtResult?.sentence) {
            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentence", value: courtResult.sentence }));
        }
    }, [courtResult, dispatch])

    const onChangeSentenceType = useCallback((_event: SyntheticEvent<Element, Event>, value: LookupResponse | null) => {
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentenceType", value: value ? value.lookupValue : undefined }));
    }, [dispatch]);

    const onChangePaymentMethod = useCallback((_event: SyntheticEvent<Element, Event>, value: LookupResponse | null) => {
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "paymentMethod", value: value ? value.lookupValue : undefined }));
    }, [dispatch]);

    const onChangeDate = useCallback(
        (date: Dayjs | null) => {
            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "newCourtDate", value: date ? date.format("YYYY-MM-DD") : undefined }));
        }, [dispatch]);

    const onChangeWarrantNumber = (event: ChangeEvent<HTMLInputElement>) => {
        const eventValue = event.target.value;
        const upperCasedValue = eventValue.toUpperCase();
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "warrantNumber", value: upperCasedValue }));
    }

    const onChangeContemptCourtFee = (value: number) => {
        hasEditedRef.current = true;
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "contemptOfCourtFee.amount", value: value }));
    }

    const onChangeReason = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const eventValue = event.target.value;
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "reason", value: eventValue }));
    }

    function formatEnumToText(enumValue: string) {
        // Replace underscores with spaces without changing the case of the letters
        return enumValue.replace(/_/g, ' ');
    }

    const sentences = useMemo(() => {
        return {
            options: sentenceResponse?.content ? sentenceResponse.content : [],
            getOptionLabel: (option: LookupResponse) => t(option.lookupCode) + " - " + t(option.lookupValue),
        };

    }, [sentenceResponse])

    const sentenceTypes = useMemo(() => {
        return {
            options: sentenceTypeResponse?.content ? sentenceTypeResponse.content : [],
            getOptionLabel: (option: LookupResponse) => t(option.lookupCode) + " - " + t(option.lookupValue),
        };

    }, [sentenceTypeResponse])

    const paymentMethods = useMemo(() => {
        return {
            options: paymentMethodResponse?.content ? paymentMethodResponse.content : [],
            getOptionLabel: (option: LookupResponse) => t(option.lookupCode) + " - " + t(option.lookupValue),
        };

    }, [paymentMethodResponse])

    const sentenceValue = useCallback((lookupValue: string | undefined) => {
        if (sentences) {
            const c = sentences.options.find((code: LookupResponse) => {
                return code.lookupValue.toLowerCase() === lookupValue?.toLowerCase()
            })
            return c;
        }
        return null;
    }, [sentences])

    const sentenceTypeValue = useCallback((lookupValue: string | undefined) => {
        if (sentenceTypes) {
            const c = sentenceTypes.options.find((code: LookupResponse) => {
                return code.lookupValue.toLowerCase() === lookupValue?.toLowerCase()
            })
            return c;
        }
        return null;
    }, [sentenceTypes])

    const paymentMethodValue = useCallback((lookupValue: string | undefined) => {
        if (paymentMethods) {
            const c = paymentMethods.options.find((code: LookupResponse) => {
                return code.lookupValue.toLowerCase() === lookupValue?.toLowerCase()
            })
            return c;
        }
        return null;
    }, [paymentMethods])

    const clearFields = () => {
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "newCourtDate", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "amountPaid", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "reason", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentence", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentenceType", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "paymentMethod", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentenceLength", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentenceTimePeriod", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "warrantNumber", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "receiptNumber", value: null }));
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "contemptOfCourtFee", value: null }));
    }

    const handleOutcomeChange = (_event: React.SyntheticEvent<Element, Event>, value: string | null,): void => {
        if (value != null) {
            setOutcome(value as CourtOutCome);
        } else {
            setOutcome('' as CourtOutCome);
        }
        dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "courtOutcome", value: value }));
        clearFields();
    };

    // Validation
    const invalidCaseNo = !formCaseNumber || formCaseNumber === "";
    const invalidCourtOutcome = !outcome || outcome === null;
    const invalidSentence = outcome && outcome === CourtOutCome.GUILTY && (!formSentence || formSentence === "");
    const invalidSentencePeriod = (formSentence && formSentence === "Prison") && (!period || period === null);
    const invalidSentenceLength = (formSentence && formSentence === "Prison") && (!formSentenceLength || formSentenceLength === null);
    const invalidReceiptNo = (outcome === CourtOutCome.GUILTY && formSentence === "Fine") &&
        (transgressionStatus === TransgressionStatus.ISSUED) && (formReceiptNo === '' || !formReceiptNo)
    const invalidNewCourtDate = (outcome && outcome === CourtOutCome.POSTPONED) &&
        (formNewCourtDate === null || dayjs(formNewCourtDate).isBefore(dayjs().add(1, 'day')) ||
        (!courtDateList?.some((date) => date.isSame(dayjs(formNewCourtDate), 'day')) ||
        !courtDateList?.some((date) => date.isSame(dayjs(formNewCourtDate), 'month')) ||
        !courtDateList?.some((date) => date.isSame(dayjs(formNewCourtDate), 'year'))));

    const invalidAmountPaid = (outcome === CourtOutCome.GUILTY && formSentence === "Fine") &&
        (transgressionStatus === TransgressionStatus.ISSUED) && (formAmountPaid === null || !formAmountPaid)

    const invalidWarrantNumber = ((outcome === CourtOutCome.WARRANT_OF_ARREST && !showWarrantNumber) && (formWarrantNumber === '' || !formWarrantNumber))
    const invalidContemptOfCourtFee = ((outcome === CourtOutCome.WARRANT_OF_ARREST) && (formContemptCourtFee === undefined || !formContemptCourtFee || formContemptCourtFee === 0))

    useEffect(() => {
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "caseNumber", value: invalidCaseNo }));
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "courtOutcome", value: invalidCourtOutcome }));
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "sentence", value: invalidSentence }));
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "period", value: invalidSentencePeriod }));
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "sentenceLength", value: invalidSentenceLength }));
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "receiptNumber", value: invalidReceiptNo }));
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "newCourtDate", value: invalidNewCourtDate }));
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "amountPaid", value: invalidAmountPaid }));
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "warrantNumber", value: invalidWarrantNumber }));
        dispatch(captureCourtResultSlice.actions.setFormFieldValidation({ key: "contemptOfCourtFee", value: invalidContemptOfCourtFee }));

    }, [dispatch, invalidCaseNo, invalidCourtOutcome, invalidSentence,
        invalidSentencePeriod, invalidSentenceLength, invalidReceiptNo,
        invalidNewCourtDate, invalidAmountPaid, invalidWarrantNumber, invalidContemptOfCourtFee
    ])

    useEffect(() => {
        if (outcome && ((outcome === CourtOutCome.GUILTY && formSentence === "Fine") ||
            transgressionStatus === TransgressionStatus.PAID || courtResult
        )) {

            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "amountPaid.amount", value: courtResult?.amountPaid?.amount ? courtResult?.amountPaid.amount : transgressionDetails?.totalAmountPayable }));
        }

        if (outcome && (outcome === CourtOutCome.WARRANT_OF_ARREST)) {
            if (!hasEditedRef.current && contemptOfCourtFee?.amount != null) {
                dispatch(
                    captureCourtResultSlice.actions.setFormDataField({
                        key: "contemptOfCourtFee.amount",
                        value: contemptOfCourtFee.amount,
                    })
                );
            }
        }

        if ((transgressionStatus === TransgressionStatus.PAID &&
            sentenceResponse && sentenceTypeResponse &&
            paymentMethodResponse)) {
            setOutcome(CourtOutCome.GUILTY);
            setSentence(courtResult?.sentence ?? "Fine");
            setSentenceType(courtResult?.sentenceType ?? "AoG Paid");
            setPaymentMethod(courtResult?.paymentMethod ?? "Online Payment");
            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "courtOutcome", value: CourtOutCome.GUILTY }));
            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentence", value: sentence }));
            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "sentenceType", value: sentenceType }));
            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "paymentMethod", value: paymentMethod }));
            dispatch(captureCourtResultSlice.actions.setFormDataField({ key: "receiptNumber", value: courtResult?.receiptNumber ? courtResult?.receiptNumber : transgressionDetails?.paymentReference }));
        }

    }, [dispatch, transgressionDetails, outcome, sentence, sentenceType,
        paymentMethod, formSentence, sentenceResponse, sentenceTypeResponse,
        paymentMethodResponse, transgressionStatus, courtResult, contemptOfCourtFee])

    const styleToShowHideDropdownArrow = (transgressionStatus === TransgressionStatus.PAID || formSentence === "Fine" || readonly) ? 'none' : 'inherit';

    return (
        <Box sx={sx}>
            <Grid container>
                <Grid size={{ sm: 12, md: 3 }}>
                    <Grid display={'flex'}>
                        <TmTextField
                            testid={toCamelCaseWords(testIdPrefix, 'caseNo')}
                            maxLength={20}
                            label={t('caseNo')}
                            value={formCaseNumber}
                            onChange={caseNoOnChange}
                            error={formCaseNumberValidation}
                            disabled={readonly}
                            required
                            sx={{
                                marginBottom: '10px',
                                width: fieldWith,
                                '& .MuiFormHelperText-root': {
                                    marginTop: 0,
                                    lineHeight: 1.1,
                                }
                            }}
                        />
                    </Grid>

                    <Grid display={'flex'}>
                        <TmAutocomplete
                            testid={'courtOutcome'}
                            id={'courtOutcome'}
                            label={t('courtOutcome')}
                            options={outcomes}
                            renderInput={(): ReactNode => { return <></>; }}
                            required={true}
                            disabled={transgressionStatus === TransgressionStatus.PAID || readonly}
                            onChange={handleOutcomeChange}
                            value={outcome}
                            error={formCourtOutcomeValidation}
                            getOptionLabel={(option: CourtOutCome) => {
                                if (!option) return ''; // Handle undefined values gracefully

                                const label = t(removeUnderscores(option));
                                if (!label) return ''; // Ensure label is not undefined

                                return label.split(' ')
                                    .map((word) => titleCaseWord(word))
                                    .join(' ');
                            }}
                            alternative={true}
                            sx={{
                                marginBottom: '10px',
                                width: fieldWith,
                                '& .MuiFormHelperText-root': {
                                    marginTop: 0,
                                    lineHeight: 1.1,
                                },
                                '& .MuiAutocomplete-endAdornment': {
                                    display: (transgressionStatus === TransgressionStatus.PAID || readonly) ? 'none' : 'inherit'
                                }
                            }}
                        />
                    </Grid>

                    {(outcome === CourtOutCome.GUILTY) &&
                        <>
                            <Grid display={'flex'}>
                                <TmReloadElement showImidiately={!readonly || isSentenceFetching}>
                                    <TmAutocomplete
                                        {...sentences}
                                        testid={toCamelCaseWords(testIdPrefix, toCamelCase('sentence'))}
                                        label={t('sentence')}
                                        value={sentenceValue(sentence)}
                                        onChange={onChangeSentence}
                                        required={outcome !== null}
                                        disabled={transgressionStatus === TransgressionStatus.PAID || readonly}
                                        renderInput={(): ReactNode => { return <></>; }}
                                        error={formSentenceValidation}
                                        isOptionEqualToValue={(option, value) => option.lookupValue === value.lookupValue}
                                        sx={{
                                            width: fieldWith,
                                            '& .MuiFormHelperText-root': {
                                                marginTop: 0,
                                                lineHeight: 1.1,
                                            },
                                            marginBottom: '10px',
                                            '& .MuiAutocomplete-endAdornment': {
                                                display: (transgressionStatus === TransgressionStatus.PAID || readonly) ? 'none' : 'inherit'
                                            }
                                        }}
                                    />
                                </TmReloadElement>
                            </Grid>

                            {(formSentence === "Prison") &&
                                <Stack direction={'row'} spacing={2} maxWidth={fieldWith} sx={{ marginBottom: 5 }}>
                                    <TmAutocomplete
                                        testid={'sentencePeriod'}
                                        id={'sentencePeriod'}
                                        label={t('sentencePeriod')}
                                        options={sentenceTimePeriod.map(period => formatEnumToText(period))}
                                        renderInput={(): ReactNode => { return <></>; }}
                                        required={formSentence !== null}
                                        onChange={handlePeriodChange}
                                        value={period}
                                        error={formPeriodValidation}
                                        getOptionLabel={(option: CourtOutCome) => {
                                            return t(removeUnderscores(option)).split(' ')
                                                .map((word) => titleCaseWord(word))
                                                .join(' ');
                                        }}
                                        sx={{
                                            width: isMobile ? '60%' : '70%',
                                            '& .MuiFormHelperText-root': {
                                                marginTop: 0,
                                                lineHeight: 1.1,
                                            },
                                            marginBottom: '10px',
                                        }}
                                        disabled={readonly}
                                    />
                                    <TmNumberField
                                        testid={'sentenceLength'}
                                        value={formSentenceLength}
                                        label={t("")}
                                        error={formSentenceLengthValidation}
                                        required={formSentence !== null}
                                        sx={{
                                            width: isMobile ? '40%' : '30%',
                                            '& .MuiInputBase-input.MuiOutlinedInput-input': {
                                                padding: '12px !important'
                                            }
                                        }}
                                        onChange={onChangeLength}
                                        disabled={readonly}
                                    ></TmNumberField>
                                </Stack>
                            }

                            {(((formSentence === "Fine") && transgressionStatus === TransgressionStatus.ISSUED) ||
                                transgressionStatus === TransgressionStatus.PAID) &&
                                <>
                                    <Grid display={'flex'}>
                                        <TmReloadElement showImidiately={!readonly || isSentenceTypeFetching}>
                                            <TmAutocomplete
                                                {...sentenceTypes}
                                                testid={toCamelCaseWords(testIdPrefix, toCamelCase('sentenceType'))}
                                                label={t('sentenceType')}
                                                value={sentenceTypeValue(sentenceType)}
                                                onChange={onChangeSentenceType}
                                                renderInput={(): ReactNode => { return <></>; }}
                                                error={formSentenceTypeValidation}
                                                disabled={true}
                                                isOptionEqualToValue={(option, value) => option.lookupValue === value.lookupValue}
                                                sx={{
                                                    width: fieldWith,
                                                    '& .MuiFormHelperText-root': {
                                                        marginTop: 0,
                                                        lineHeight: 1.1,
                                                        marginBottom: '10px',
                                                    },
                                                    '& .MuiAutocomplete-endAdornment': {
                                                        display: styleToShowHideDropdownArrow
                                                    }
                                                }}
                                                required={formSentence !== null}
                                            />
                                        </TmReloadElement>
                                    </Grid>
                                    <Grid display={'flex'}>
                                        <TmReloadElement showImidiately={!readonly || isPaymentMethodFetching}>
                                            <TmAutocomplete
                                                {...paymentMethods}
                                                testid={toCamelCaseWords(testIdPrefix, toCamelCase('paymentMethod'))}
                                                label={t('paymentMethod')}
                                                value={paymentMethodValue(paymentMethod)}
                                                onChange={onChangePaymentMethod}
                                                renderInput={(): ReactNode => { return <></>; }}
                                                error={formPaymentMethodValidation}
                                                isOptionEqualToValue={(option, value) => option === value}
                                                disabled={true}
                                                required={formSentenceType !== null}
                                                sx={{
                                                    width: fieldWith,
                                                    '& .MuiFormHelperText-root': {
                                                        marginTop: 0,
                                                        lineHeight: 1.1,
                                                        marginBottom: '10px',
                                                    },
                                                    '& .MuiAutocomplete-endAdornment': {
                                                        display: styleToShowHideDropdownArrow
                                                    }
                                                }}
                                            />
                                        </TmReloadElement>
                                    </Grid>

                                    <Grid display={'flex'}>
                                        <TmTextField
                                            maxLength={20}
                                            testid={toCamelCaseWords(testIdPrefix, 'receiptNo')}
                                            label={transgressionStatus === TransgressionStatus.PAID && paymentMethod === ONLINE_PAYMENT ? t('referenceNumber') : t('receiptNo')}
                                            value={formReceiptNo ?? ''}
                                            required={formSentence === "Fine"}
                                            disabled={transgressionStatus === TransgressionStatus.PAID || readonly}
                                            onChange={onChangeReceiptNo}
                                            error={formReceiptNoValidation}
                                            sx={{
                                                width: fieldWith,
                                                '& .MuiFormHelperText-root': {
                                                    marginTop: 0,
                                                    lineHeight: 1.1,
                                                    marginBottom: '10px',
                                                }
                                            }}
                                        />
                                    </Grid>
                                    <Grid display={'flex'}>
                                        <TmNumberField
                                            testid={toCamelCaseWords(testIdPrefix, 'amountPaid')}
                                            minimumValue={1}
                                            maxLength={10}
                                            label={t('amountPaid')}
                                            value={formAmountPaid}
                                            onChange={onChangeAmountPaid}
                                            variant="standard"
                                            showEndAdornment={false}
                                            error={formAmountPaidError}
                                            required={transgressionStatus === TransgressionStatus.PAID || formSentence === "Fine"}
                                            disabled={transgressionStatus === TransgressionStatus.PAID || readonly}
                                            sx={{
                                                marginTop: '10px',
                                                marginBottom: '10px',
                                                width: fieldWith,
                                                '& .MuiFormHelperText-root': {
                                                    marginTop: 0,
                                                    lineHeight: 1.1,
                                                }
                                            }}
                                        />
                                    </Grid>
                                </>
                            }
                        </>
                    }

                    {(outcome === CourtOutCome.POSTPONED) &&
                        <Grid display={'flex'}>
                            <TmDatePicker
                                sx={{
                                    minHeight: "51px",
                                    width: fieldWith,
                                    '& .MuiFormHelperText-root': {
                                        marginTop: 0,
                                        lineHeight: 1.1,
                                    },
                                    marginBottom: '10px',
                                }}
                                testid={"newCourtDate"}
                                label={t('newCourtDate')}
                                setDateValue={onChangeDate}
                                required={outcome !== null && outcome === CourtOutCome.POSTPONED}
                                // If the court appearance date is in the past, set postponed minimum date to tomorrow
                                minDate={dayjs().isAfter(transgressionDetails?.courtAppearanceDate) ? dayjs().add(1, 'day')
                                    : dayjs(transgressionDetails?.courtAppearanceDate).add(1, 'day')}
                                dateValue={formNewCourtDate ? dayjs(formNewCourtDate) : null}
                                shouldDisableDate={(date: Dayjs) => {
                                    return !courtDateList?.some((courtDate) => courtDate.isSame(date, 'day'));
                                }}
                                shouldDisableMonth={(date: Dayjs) => {
                                    return !courtDateList?.some((courtDate) => courtDate.isSame(date, 'month'));
                                }}
                                shouldDisableYear={(date: Dayjs) => {
                                    return !courtDateList?.some((courtDate) => courtDate.isSame(date, 'year'));
                                }}
                                error={readonly? false : formNewCourtDateValidation}
                                disabled={readonly}
                            />
                        </Grid>
                    }

                    {(outcome === CourtOutCome.WITHDRAWN || outcome === CourtOutCome.STRUCK_OFF_ROLL) &&
                        <Grid container sx={{ marginBottom: 5 }}>
                            <Grid size={{ xs: 12 }}>
                                <Typography sx={{ WebkitTextFillColor: readonly ? theme.palette.text.disabled : 'inherit' }}>{t('courtResultReason')}</Typography>
                            </Grid>
                            <Grid display={'flex'}>
                                <TmTextArea
                                    testId={"courtResultReason"}
                                    placeholder={formReason ? t('noReasonProvided') : t('courtResultReason')}
                                    value={formReason ?? ''}
                                    onChange={onChangeReason}
                                    style={{ fontSize: 'inherit', width: fieldWith }}
                                    disabled={readonly}
                                />
                            </Grid>
                        </Grid>
                    }

                    {outcome === CourtOutCome.WARRANT_OF_ARREST &&
                        <>
                            {!showWarrantNumber &&
                                <Grid display={'flex'}>
                                    <TmTextField
                                        maxLength={20}
                                        testid={toCamelCaseWords(testIdPrefix, 'warrantNumber')}
                                        label={t('warrantNumber')}
                                        value={formWarrantNumber ?? ''}
                                        onChange={onChangeWarrantNumber}
                                        error={formWarrantNumberValidation}
                                        required={outcome === CourtOutCome.WARRANT_OF_ARREST}
                                        sx={{
                                            width: fieldWith,
                                            '& .MuiFormHelperText-root': {
                                                marginTop: 0,
                                                lineHeight: 1.1,
                                            },
                                            marginBottom: '10px',
                                        }}
                                        disabled={readonly}
                                    />
                                </Grid>
                            }

                            <Grid display={'flex'}>
                                <Grid display={'flex'}>
                                    <TmNumberField
                                        testid={toCamelCaseWords(testIdPrefix, 'contemptOfCourtFee')}
                                        minimumValue={1}
                                        maxLength={10}
                                        label={t('contemptOfCourtFee')}
                                        value={formContemptCourtFee}
                                        onChange={onChangeContemptCourtFee}
                                        variant="standard"
                                        showEndAdornment={false}
                                        error={formContemptCourtFeeValidation}
                                        required={outcome === CourtOutCome.WARRANT_OF_ARREST}
                                        disabled={transgressionStatus === TransgressionStatus.PAID || readonly}
                                        sx={{
                                            marginTop: '10px',
                                            marginBottom: '10px',
                                            width: fieldWith,
                                            '& .MuiFormHelperText-root': {
                                                marginTop: 0,
                                                lineHeight: 1.1,
                                            }
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </>

                    }
                </Grid>
                <Grid size={{ sm: 12, md: 9 }} paddingLeft={4}>
                    <TmChargeList
                        sx={{ marginTop: 5 }}
                        testid={toCamelCaseWords(testIdPrefix, 'charges')}
                        charges={charges || []}
                        vehicleCharges={charges || []}
                    />
                </Grid>
            </Grid>
        </Box>
    )
}

export default CaptureCourtResultsForm;
