import { useTranslation } from "react-i18next";
import {
    FindTransgressionConfigurationApiArg,
    OverloadTransgressionDto,
    RtqsTransgressionDto,
    TransgressionEntry,
    useFindTransgressionConfigurationQuery,
    useRetrieveTransgressionDetailsMutation
} from "../../redux/api/transgressionsApi";
import { useCallback, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { JsonObjectType } from "../../enum/JsonObjectType";
import { ChargebookType } from "../../enum/ChargebookType";

const useTransgressionHistoryManager = (entries: TransgressionEntry[]) => {
    const { t } = useTranslation();

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [selectedNoticeNo, setSelectedNoticeNo] = useState<string>('');
    const [selectedVersionNo, setSelectedVersionNo] = useState<number>(0);
    const [selectedTransgression, setSelectedTransgression] = useState<OverloadTransgressionDto | RtqsTransgressionDto>();
    const [selectedHistoryEntry, setSelectedHistoryEntry] = useState(entries[entries.length - 1]);
    const [selectedHistoryEntryIndex, setSelectedHistoryEntryIndex] = useState<number>(0);
    const [hasFieldUpdates, setHasFieldUpdates] = useState(false);
    const [previousData, setPreviousData] = useState<OverloadTransgressionDto | RtqsTransgressionDto>();
    const [retrieveCurrentTransgressionDetails] = useRetrieveTransgressionDetailsMutation();
    const [retrievePreviousTransgressionDetails] = useRetrieveTransgressionDetailsMutation();
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [viewTransgression, setViewTransgression] = useState(false);
    const [findTransgressionConfigurationRequest, setFindTransgressionConfigurationRequest] = useState<FindTransgressionConfigurationApiArg>({
        authorityCode: undefined,
        chargebookType: undefined
    })
    const { data: findTransgressionConfigurationResponse } = useFindTransgressionConfigurationQuery(findTransgressionConfigurationRequest!, {
        skip: !findTransgressionConfigurationRequest?.authorityCode || !findTransgressionConfigurationRequest?.chargebookType,
    });

    const fetchPreviousVersion = useCallback((versionNo: number, noticeNumber?: string): Promise<OverloadTransgressionDto> => {
        return new Promise((resolve, reject) => {
            retrievePreviousTransgressionDetails({
                retrieveTransgressionDetailsRequest : {
                    noticeNumber: noticeNumber ? noticeNumber : selectedNoticeNo as string,
                    transgressionVersion: versionNo
                }
            }).unwrap().then((res) => {
                const trans = {...res.transgression, type: 'OverloadTransgression'} as OverloadTransgressionDto;
                setPreviousData(trans);
                resolve(trans);
            }).catch((error) => reject(error));
        });
    }, [retrievePreviousTransgressionDetails, selectedNoticeNo]);

    const fetchCurrentVersion = useCallback((versionNo: number, noticeNumber: string): Promise<OverloadTransgressionDto | RtqsTransgressionDto> => {
        return new Promise((resolve, reject) => {
            retrieveCurrentTransgressionDetails({
                retrieveTransgressionDetailsRequest: {
                    noticeNumber: noticeNumber,
                    transgressionVersion: versionNo
                }
            }).unwrap().then((res) => {
                let transgression: OverloadTransgressionDto | RtqsTransgressionDto | undefined;
                if (res.transgression?.type === JsonObjectType.OverloadTransgressionDto) {
                    transgression = res.transgression as unknown as OverloadTransgressionDto;
                }
                else if (res.transgression?.type === JsonObjectType.RtqsTransgressionDto) {
                    transgression = res.transgression as unknown as RtqsTransgressionDto;
                }
                setSelectedTransgression(transgression);
                resolve(transgression as OverloadTransgressionDto | RtqsTransgressionDto);
            }).catch((error) => {
                reject(error);
            });
        })
    }, [retrieveCurrentTransgressionDetails]);

    const updatePreviousTransgressionDetails = useCallback((transgression: OverloadTransgressionDto | RtqsTransgressionDto, historyEntry?: TransgressionEntry) => {
        const transgressionCopy = JSON.parse(JSON.stringify(transgression)) as OverloadTransgressionDto | RtqsTransgressionDto;
        if (historyEntry) {
            transgressionCopy.status = historyEntry.status;
        }
        setPreviousData(transgressionCopy);
    }, [setPreviousData]);

    const updateTransgressionDetails = useCallback((transgression: OverloadTransgressionDto | RtqsTransgressionDto, historyEntry?: TransgressionEntry) => {
        const transgressionCopy = JSON.parse(JSON.stringify(transgression)) as OverloadTransgressionDto | RtqsTransgressionDto;
        if (historyEntry) {
            transgressionCopy.status = historyEntry.status;
        }
        const updateComments = ["Vehicle details updated", "Operator details updated", "Driver details updated", "Residential address details updated", "Business address details updated"];

        let hasFieldChanges = false;
        for (const comment of updateComments) {
            const testIncludes = historyEntry?.comments?.includes(comment) ?? false;
            if (testIncludes) {
                hasFieldChanges = true;
                break;
            }
        }

        setHasFieldUpdates(hasFieldChanges);
        setSelectedTransgression(transgressionCopy);
    }, []);

    const getTransgressionInformation = useCallback((versionNo: number, selectedIndex: number, noticeNumber?: string) => {
        setSelectedVersionNo(versionNo);

        setSelectedHistoryEntryIndex((entries.length - 1) - (selectedIndex));
        const currentHistoryEntry = entries[selectedIndex];
        setSelectedHistoryEntry(currentHistoryEntry);
        const prevHistoryEntry = selectedIndex < entries.length - 1 ? entries[selectedIndex + 1] : entries[selectedIndex];
        const noticeNo = noticeNumber ? noticeNumber : selectedNoticeNo as string;

        setIsLoading(true);
        const fetchCurrentVersionPromise = new Promise((resolve, reject) => {
            fetchCurrentVersion(versionNo, noticeNo).then((transgression) => {
                if (currentHistoryEntry.transgressionVersion === transgression.transgressionVersion) {
                    updateTransgressionDetails(transgression, currentHistoryEntry);
                }

                let chargebookType;
                if (transgression.type === JsonObjectType.OverloadTransgressionDto) {
                    chargebookType = ChargebookType.OVERLOAD;
                } else if (transgression.type === JsonObjectType.RtqsTransgressionDto) {
                    chargebookType = ChargebookType.RTQS;
                }

                setFindTransgressionConfigurationRequest({
                    authorityCode: transgression.authorityCode,
                    chargebookType: chargebookType
                })
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });

        const prevVersionNo = versionNo > 1 ? (versionNo - 1) : versionNo;
        const fetchPreviousVersionPromise = new Promise((resolve, reject) => {
            fetchPreviousVersion(prevVersionNo, noticeNo).then((prevTransgression) => {
                if (prevHistoryEntry.status !== prevTransgression.status) {
                    updatePreviousTransgressionDetails(prevTransgression, prevHistoryEntry);
                }
                resolve(true);
            }).catch((error) => {
                reject(error);
            });
        });

        Promise.all([fetchCurrentVersionPromise, fetchPreviousVersionPromise]).then(() => setIsLoading(false)).catch(() => setIsLoading(false));

    }, [entries, fetchPreviousVersion, selectedNoticeNo,
        updatePreviousTransgressionDetails, updateTransgressionDetails, fetchCurrentVersion]);

    const onSelectedEntry = useCallback((noticeNo: string, versionNo: number, selectedIndex: number) => {
        setSelectedNoticeNo(noticeNo);
        const pageSize = page * rowsPerPage;
        const index = selectedIndex + pageSize;
        setViewTransgression(true);

        getTransgressionInformation(versionNo, index, noticeNo);
    }, [getTransgressionInformation, page, rowsPerPage]);

    const onNextEntry = useCallback(() => {
        const index = (entries.length - 1) - selectedHistoryEntryIndex - 1;
        const entry = entries[index];

        getTransgressionInformation(entry.transgressionVersion, index);
    }, [selectedHistoryEntryIndex, getTransgressionInformation, entries]);

    const onPreviousEntry = useCallback(() => {
        const index = (entries.length - 1) - selectedHistoryEntryIndex + 1;
        const entry = entries[index];

        getTransgressionInformation(entry.transgressionVersion, index);

    }, [selectedHistoryEntryIndex, getTransgressionInformation, entries]);

    useHotkeys(
        "ArrowLeft",
        () => {
            if (selectedVersionNo >= 1 && selectedHistoryEntryIndex > 0) onPreviousEntry();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: t("previousTransgressionHistory")
        }
    );

    useHotkeys(
        "ArrowRight",
        () => {
            if (selectedHistoryEntryIndex < entries.length - 1) onNextEntry();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: t("nextTransgressionHistory")
        }
    );

    return {
        page, setPage, rowsPerPage, setRowsPerPage, viewTransgression, setViewTransgression,
        onNextEntry, onPreviousEntry, onSelectedEntry, isLoading, selectedVersionNo, selectedTransgression,
        previousData, selectedHistoryEntry, selectedHistoryEntryIndex, hasFieldUpdates,
        findTransgressionConfigurationResponse
    };
}

export default useTransgressionHistoryManager;
