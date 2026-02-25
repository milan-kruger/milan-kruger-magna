import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { TransgressionStatus } from "../../enum/TransgressionStatus";
import {
    FindTransgressionConfigurationApiArg,
    OverloadTransgressionDto,
    RetrieveOverloadTransgressionListApiArg,
    useFindTransgressionConfigurationQuery,
    useRetrieveOverloadTransgressionListQuery,
    useRetrieveTransgressionDetailsMutation,
} from "../../redux/api/transgressionsApi";
import { TransgressionData } from "../../components/transgression-details/transgression-list/TransgressionsListTable";
import useGenerateMenuItems from "../../components/app-bar/menuItems";
import { useNavigate } from "react-router-dom";
import { ROUTE_NAMES } from "../../Routing";;
import { ChargebookType } from "../../enum/ChargebookType";

function createData( date: string, sequenceNo: number, noticeNo: string, plateNo: string, status: string, offenderName?: string ): TransgressionData {
  return { date, sequenceNo, noticeNo, plateNo, status, offenderName };
}

const useOverloadTransgressionListManager = (
    noticeNo: string,
    setSearchValue: (value: string) => void,
    setNoticeNo: (value: string) => void
) => {
    const navigate = useNavigate();
    const menuItems = useGenerateMenuItems();

    const [ retrieveTransgressionListRequest, setRetrieveTransgressionListRequest ] = useState<RetrieveOverloadTransgressionListApiArg>({
        plateNumber: '',
        fromDate: dayjs().format('YYYY-MM-DDT00:00:00'),
        toDate: dayjs().format('YYYY-MM-DDT23:59:59'),
        status: '' as TransgressionStatus,
        sortDirection: 'ASC',
        page: 0,
        pageSize: -1,
        sortFields: ['transgressionDate']
    } as RetrieveOverloadTransgressionListApiArg);

    // Control when the list should be fetched
    const [shouldFetchList, setShouldFetchList] = useState(true);

    const { data: retrieveTransgressionListResponse, refetch: refetchTransgressionList, isFetching: isFetchingTransgressionList } =
        useRetrieveOverloadTransgressionListQuery(retrieveTransgressionListRequest, { skip: !shouldFetchList });

    const handleFindTransgressions = (findTransgressionCriteria: RetrieveOverloadTransgressionListApiArg) => {
        setRetrieveTransgressionListRequest(findTransgressionCriteria);
        setShouldFetchList(true);
        refetchTransgressionList();
    };

    const handleSearchTransgressions = (searchValue: string) => {
        setSearchValue(searchValue);
    };

    const [retrieveTransgressionDetails, {
        data: retrieveTransgressionDetailsResponse,
        isLoading: isRetrieveTransgressionDetailsLoading,
    }] = useRetrieveTransgressionDetailsMutation();

    const [findTransgressionConfigurationRequest, setFindTransgressionConfigurationRequest] = useState<FindTransgressionConfigurationApiArg>(
        { authorityCode: undefined, chargebookType: undefined }
    );

    const { data: findTransgressionConfigurationResponse, isLoading: isTransgressionConfigLoading } = useFindTransgressionConfigurationQuery(
        findTransgressionConfigurationRequest!, {
            skip: !findTransgressionConfigurationRequest.authorityCode || !findTransgressionConfigurationRequest.chargebookType,
            refetchOnMountOrArgChange: true,
        }
    );

    useEffect(() => {
        if (noticeNo) {
            // Trigger mutation with the request body structure
            retrieveTransgressionDetails({
                retrieveTransgressionDetailsRequest: {
                    noticeNumber: noticeNo
                }
            }).unwrap().then((response) => {
                setFindTransgressionConfigurationRequest({
                    authorityCode: response.transgression?.authorityCode,
                    chargebookType: ChargebookType.OVERLOAD
                });
            });
        }
    }, [noticeNo, retrieveTransgressionDetails]);


    const handleTransgressionClick = (transgression: TransgressionData) => {
        setShouldFetchList(false); // Prevent list refetch when viewing details
        setNoticeNo(transgression.noticeNo);
    };

    useEffect(() => {
        if (!isRetrieveTransgressionDetailsLoading && !isTransgressionConfigLoading &&
            retrieveTransgressionDetailsResponse && findTransgressionConfigurationResponse) {

            const transgressionDetails = {...retrieveTransgressionDetailsResponse.transgression, type: 'OverloadTransgressionDto'} as OverloadTransgressionDto;

            const payload = {
                transgressionDate: transgressionDetails?.transgressionDate,
                charges: transgressionDetails?.snapshotCharges,
                vehicleConfiguration: { vehicles: [{...transgressionDetails?.vehicle}] },
                driver: transgressionDetails?.driver,
                ...transgressionDetails?.operator,
                transgressionStatus: transgressionDetails.status,
                operator: transgressionDetails?.operator,
                route: transgressionDetails.route,
                noticeNumber: transgressionDetails.noticeNumber,
                transgressionLocation: transgressionDetails.transgressionLocation,
                transgressionVersion: transgressionDetails.transgressionVersion,
                gpsYCoordinate: transgressionDetails.gpsYCoordinate,
                gpsXCoordinate: transgressionDetails.gpsXCoordinate,
                authorityCode: transgressionDetails.authorityCode,
                sequenceNumber: transgressionDetails.sequenceNumber,
                transgressionConfiguration: findTransgressionConfigurationResponse.transgressionConfigurations?.[0]
            };

            menuItems.push({
                title: 'Transgression Details',
                url: '/transgression-details'
            })

            navigate(`/transgression-details/${noticeNo}`, {
                state: {
                    transgressionDetails: payload,
                    overloadTransgression: transgressionDetails,
                    newTransgression: false,
                    from: ROUTE_NAMES.transgressions
                }
            });
        }
    }, [
        isRetrieveTransgressionDetailsLoading,
        isTransgressionConfigLoading,
        retrieveTransgressionDetailsResponse,
        findTransgressionConfigurationResponse,
        noticeNo,
        menuItems,
        navigate
    ]);

    let rows: TransgressionData[] = [];
    if (retrieveTransgressionListResponse?.content) {
        rows = retrieveTransgressionListResponse.content?.map((transgression) => {
        const date = dayjs(transgression.transgressionDate).format('DD/MM/YYYY HH:mm');
            return createData(
                date,
                transgression.sequenceNumber,
                transgression.noticeNumber,
                transgression.plateNumber,
                transgression.status,
                transgression.offenderName ?? ""
            );
        });
    }

    return {
        rows,
        handleFindTransgressions,
        handleSearchTransgressions,
        handleTransgressionClick,
        isFetchingTransgressionList
    }
};

export default useOverloadTransgressionListManager;
