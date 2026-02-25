import { Box } from "@mui/material";
import CourtDocumentsGenerator from "../../../components/court-documents/CourtDocumentsGenerator";
import { t } from "i18next";
import { CourtDocumentsView } from "../../../enum/CourtDocumentsView";
import useCourtResultManager from "../../../hooks/court-results/CourtResultManager";
import dayjs from "dayjs";

const CourtResultPage = () => {
    const {
        isLoading,
        generateCourtResults,
        adjudicationTimeFence,
        courtNameList,
        showNoCourtRegisterFound,
        courts
    } = useCourtResultManager();

    return (
        <Box width={"100%"}>
            <CourtDocumentsGenerator
                heading={t("generateCourtResults")}
                subHeading={t("courtResultSubHeading")}
                isLoading={isLoading}
                handleGenerateDocuments={generateCourtResults}
                adjudicationTimeFence={adjudicationTimeFence}
                courtNameList={courtNameList}
                courts={courts}
                view={CourtDocumentsView.COURT_RESULTS}
                maxCourtDate={dayjs().endOf('day')}
                showNoCourtRegisterFound={showNoCourtRegisterFound}
                courtRegisterNotFound={t("courtRegisterNotFoundInCourtResult")}
            />
        </Box>)
}

export default CourtResultPage;
