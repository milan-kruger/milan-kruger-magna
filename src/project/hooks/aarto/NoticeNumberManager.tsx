import { SyntheticEvent, useCallback, useEffect, useState } from "react";
import { NoticeNumberData } from "../../pages/aarto/notice-management/NoticeNumbersListPage";
import { LookupResponse } from "../../redux/api/coreApi";
import { AartoNoticeNumber, CountryRegionIndex, RequestNoticeNumberResponse, useProvideAartoNoticeNumberMutation, useRequestNoticeNumberMutation } from "../../redux/api/transgressionsApi";

const useNoticeNumberManager = () => {
    const [isLoading, setIsLoading] = useState(false);

    const [rows, setRows] = useState<NoticeNumberData[]>([]);
    const [provideAartoNoticeNumber, { isLoading: isProviding }] = useProvideAartoNoticeNumberMutation();

    const fetchNoticeNumbers = useCallback(() => {
        provideAartoNoticeNumber({ status: 'AVAILABLE', chargeCount: 10000 })
            .unwrap()
            .then((response: AartoNoticeNumber[]) => {
                const grouped = response.reduce<Record<string, number>>((acc, item) => {
                    acc[item.aartoNoticeType] = (acc[item.aartoNoticeType] || 0) + 1;
                    return acc;
                }, {});
                setRows(
                    Object.entries(grouped).map(([noticeType, remainingNoticeNumbers]) => ({
                        noticeType,
                        remainingNoticeNumbers,
                    }))
                );
            });
    }, [provideAartoNoticeNumber]);

    // View state
    const [showForm, setShowForm] = useState(false);
    const [showResultDialog, setShowResultDialog] = useState(false);
    const [requestSuccess, setRequestSuccess] = useState(false);

    // Form state
    const [region, setRegion] = useState<CountryRegionIndex | null>(null);
    const [noticeType, setNoticeType] = useState<string>('');
    const [noticeTypeCode, setNoticeTypeCode] = useState<string>('');
    const [numberOfNoticeNumbers, setNumberOfNoticeNumbers] = useState<number | undefined>(undefined);

    // Handlers
    const handleRegionChange = useCallback((_event: SyntheticEvent<Element, Event>, newValue: CountryRegionIndex | null) => {
        setRegion(newValue);
    }, []);

    const handleNoticeTypeChange = useCallback((_event: SyntheticEvent<Element, Event>, value: LookupResponse | null) => {
        setNoticeType(value ? value.lookupValue : '');
        setNoticeTypeCode(value ? value.lookupCode : '');
    }, []);


    const handleNumberOfNoticeNumbersChange = (value: number | null) => {
        setNumberOfNoticeNumbers(value ?? undefined);
    };

    // Validation
    const regionError = () => !region;
    const noticeTypeError = () => !noticeType;
    const numberOfNoticeNumbersError = () => numberOfNoticeNumbers === undefined || numberOfNoticeNumbers <= 0;

    const [requestNoticeNumber, { isLoading: isRequesting }] = useRequestNoticeNumberMutation();

    useEffect(() => {
        setIsLoading(isRequesting || isProviding);
    }, [isRequesting, isProviding]);

    const handleRequestNoticeNumbers = () => {
        setShowForm(true);
    };

    const handleBackToList = () => {
        setRegion(null);
        setNoticeType('');
        setNoticeTypeCode('');
        setNumberOfNoticeNumbers(undefined);
        setShowForm(false);
    };

    const handleSendRequest = useCallback(() => {
        if (!region || !noticeType || !noticeTypeCode || !numberOfNoticeNumbers || numberOfNoticeNumbers <= 0) {
            return;
        }

        requestNoticeNumber({
            requestNoticeNumberRequest: {
                numberOfNotices: numberOfNoticeNumbers,
                aartoNoticeType: noticeType,
                aartoNoticeTypeCode: noticeTypeCode,
                countryRegionIndex: region,
            }
        }).unwrap().then((response: RequestNoticeNumberResponse) => {
            setRequestSuccess(response.noticesRetrieved);
            setShowResultDialog(true);
        });
    }, [region, noticeType, noticeTypeCode, numberOfNoticeNumbers, requestNoticeNumber]);

    const handleResultDialogClose = useCallback(() => {
        setShowResultDialog(false);
        if (requestSuccess) {
            setShowForm(false);
            setRegion(null);
            setNoticeType('');
            setNoticeTypeCode('');
            setNumberOfNoticeNumbers(undefined);
            fetchNoticeNumbers();
        }
    }, [requestSuccess, fetchNoticeNumbers]);

    return {
        isLoading,
        rows,
        fetchNoticeNumbers,
        showForm,
        region,
        handleRegionChange,
        regionError,
        noticeType,
        handleNoticeTypeChange,
        noticeTypeError,
        numberOfNoticeNumbers,
        handleNumberOfNoticeNumbersChange,
        numberOfNoticeNumbersError,
        handleRequestNoticeNumbers,
        handleBackToList,
        handleSendRequest,
        showResultDialog,
        requestSuccess,
        handleResultDialogClose
    }
}

export type NoticeNumberManager = ReturnType<typeof useNoticeNumberManager>;

export default useNoticeNumberManager;
