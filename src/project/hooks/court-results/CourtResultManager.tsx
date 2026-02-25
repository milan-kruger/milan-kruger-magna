import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Court, InitialiseCourtDocumentsResponse,
    useInitialiseCourtDocumentsMutation, useProvideCourtCaseListMutation
} from "../../redux/api/transgressionsApi";
import { Dayjs } from "dayjs";

export interface CourtData {
    courtName: string,
    courtRoom: string,
    courtDate: string
}

const useCourtResultManager = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [courts, setCourts] = useState<Court[]>([]);
    const [adjudicationTimeFence, setAdjudicationTimeFence] = useState<number>(0);
    const [courtNameList, setCourtNameList] = useState<string[]>([]);
    const [showNoCourtRegisterFound, setNoCourtRegisterFound] = useState(false);

    const [initialiseCourtDocuments, { isLoading: initialiseLoader }] = useInitialiseCourtDocumentsMutation();
    const [retrieveCourtCaseList, { isLoading: loadingCourtCaseList }] = useProvideCourtCaseListMutation();


    useEffect(() => {
        setIsLoading(initialiseLoader || loadingCourtCaseList)
    }, [initialiseLoader, loadingCourtCaseList]);

    useEffect(() => {
        initialiseCourtDocuments().unwrap()
            .then((response: InitialiseCourtDocumentsResponse) => {
                setCourts(response.courts);
                setAdjudicationTimeFence(response.adjudicationTimeFence);
                setCourtNameList(response.courts.map((court: Court) => court.courtName));
            });

    }, [initialiseCourtDocuments]);

    const generateCourtResults = (courtName: string, courtRoom: string, courtDate: Dayjs
    ) => {
        const courtData: CourtData = {
            courtName: courtName,
            courtRoom: courtRoom,
            courtDate: courtDate.format('YYYY-MM-DD')
        }
        retrieveCourtCaseList({
            provideCourtCaseListRequest: courtData
        }).unwrap().then((response) => {
            if (!response.courtRegisterFound) {
                // Display message
                setNoCourtRegisterFound(true);
                return;
            } else {
                setNoCourtRegisterFound(false);
                navigate("court-case-list", {
                    state: {
                        courtCaseList: response.courtCaseList,
                        courtData,
                        courts,
                    }
                });
            }
        })
    }

    return {
        isLoading,
        generateCourtResults,
        courts,
        adjudicationTimeFence,
        courtNameList,
        showNoCourtRegisterFound
    };
}

export default useCourtResultManager;
