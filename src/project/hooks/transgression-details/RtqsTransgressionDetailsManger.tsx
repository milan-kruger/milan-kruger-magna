import { useCallback, useEffect, useState } from "react";
import {
    RetrieveRtqsTransgressionListApiArg, useRetrieveRtqsTransgressionListQuery,
    useRetrieveTransgressionDetailsMutation
} from "../../redux/api/transgressionsApi";
import { TransgressionStatus } from "../../enum/TransgressionStatus";
import dayjs from "dayjs";
import { TransgressionData } from "../../components/transgression-details/transgression-list/TransgressionsListTable";
import { ROUTE_NAMES } from "../../Routing";
import { useNavigate } from "react-router-dom";

function createData(date: string, noticeNo: string, plateNo: string, offenderName: string, status: string): TransgressionData {
    return { date, noticeNo, plateNo, offenderName, status };
}

const useRtqsTransgressionDetailsManager = (
    _noticeNo: string,
    setSearchValue: (value: string) => void,
    setNoticeNo: (value: string) => void
) => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const [retrieveRtqsTransgressionListRequest, setRetrieveRtqsTransgressionListRequest] = useState<RetrieveRtqsTransgressionListApiArg>({
        plateNumber: '',
        fromDate: dayjs().format('YYYY-MM-DDT00:00:00'),
        toDate: dayjs().format('YYYY-MM-DDT23:59:59'),
        status: '' as TransgressionStatus,
        sortDirection: 'ASC',
        page: 0,
        pageSize: -1,
        sortFields: ['transgressionDate']
    } as RetrieveRtqsTransgressionListApiArg);

    // Control when the list should be fetched
    const [shouldFetchList, setShouldFetchList] = useState(true);

    const { data: retrieveRtqsTransgressionListResponse, refetch: refetchTransgressionList, isFetching: isFetchingRtqsTransgressionList } =
        useRetrieveRtqsTransgressionListQuery(
            retrieveRtqsTransgressionListRequest,
            { skip: !shouldFetchList }
        );

    const [retrieveTransgressionDetails, { isLoading: retrieveTransgressionDetailsLoading }] = useRetrieveTransgressionDetailsMutation();

    useEffect(() => {
        setIsLoading(retrieveTransgressionDetailsLoading || isFetchingRtqsTransgressionList);
    }, [retrieveTransgressionDetailsLoading, isFetchingRtqsTransgressionList]);

    const onRetrieveTransgressionDetails = useCallback((noticeNumber: string) => {
        retrieveTransgressionDetails({
            retrieveTransgressionDetailsRequest: {
                noticeNumber
            }
        }).unwrap().then((response) => {
            if (response.transgression !== undefined) {
                setIsLoading(false);
                const transgressionDetails = response.transgression;
                const payload = {
                    transgressionDate: transgressionDetails?.transgressionDate,
                    charges: transgressionDetails?.snapshotCharges,
                    vehicleConfiguration: { vehicles: [{ ...transgressionDetails?.vehicle }] },
                    driver: transgressionDetails?.driver,
                    ...transgressionDetails?.operator,
                    transgressionStatus: transgressionDetails?.status,
                    operator: transgressionDetails?.operator,
                    route: transgressionDetails?.route,
                    noticeNumber: transgressionDetails?.noticeNumber,
                    transgressionLocation: transgressionDetails?.transgressionLocation,
                    transgressionVersion: transgressionDetails?.transgressionVersion,
                    gpsYCoordinate: transgressionDetails?.gpsYCoordinate,
                    gpsXCoordinate: transgressionDetails?.gpsXCoordinate,
                    authorityCode: transgressionDetails?.authorityCode
                };

                navigate(`/${ROUTE_NAMES.rtqsTransgressionDetails}/${response.transgression?.noticeNumber.number}`, {
                    replace: true,
                    state: {
                        transgressionDetails: payload,
                        overloadTransgression: transgressionDetails,
                        newTransgression: false,
                        noticeNo: response.transgression?.noticeNumber.number,
                    },
                });
            }
        })
    }, [retrieveTransgressionDetails, navigate]);

    const handleFindTransgressions = (findTransgressionCriteria: RetrieveRtqsTransgressionListApiArg) => {
        setRetrieveRtqsTransgressionListRequest(findTransgressionCriteria);
        setShouldFetchList(true);
        refetchTransgressionList();
    };

    const handleSearchTransgressions = (searchValue: string) => {
        setSearchValue(searchValue);
    };

    const handleTransgressionClick = (transgression: TransgressionData) => {
        setShouldFetchList(false); // Prevent list refetch when viewing details
        setNoticeNo(transgression.noticeNo);
        onRetrieveTransgressionDetails(transgression.noticeNo);
    };

    let rows: TransgressionData[] = [];
    if (retrieveRtqsTransgressionListResponse?.content) {
        rows = retrieveRtqsTransgressionListResponse.content?.map((transgression) => {
            const date = dayjs(transgression.transgressionDate).format('DD/MM/YYYY HH:mm');
            return createData(
                date,
                transgression.noticeNumber,
                transgression.plateNumber,
                transgression.offenderName ?? "",
                transgression.status,
            );
        });
    }

    return {
        rows,
        handleFindTransgressions,
        handleSearchTransgressions,
        handleTransgressionClick,
        isLoading,
        onRetrieveTransgressionDetails
    }

}

export default useRtqsTransgressionDetailsManager;
