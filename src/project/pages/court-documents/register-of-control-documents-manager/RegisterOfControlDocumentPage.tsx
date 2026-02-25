import { Box } from "@mui/material";
import CourtDocumentsGenerator from "../../../components/court-documents/CourtDocumentsGenerator";
import { t } from "i18next";
import TmDialog from "../../../../framework/components/dialog/TmDialog";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { CourtDocumentsView } from "../../../enum/CourtDocumentsView";
import useRegisterOfControlDocumentsManager from "../../../hooks/court-documents/RegisterOfControlDocumentsManager";

const RegisterOfControlDocumentPage = () => {
    const {
        isLoading,
        generateRegisterOfControlDocuments,
        adjudicationTimeFence,
        courtNameList,
        courts,
        showNoCourtRegisterFound,
        showTransgressionsNotFoundDialog,
        setShowTransgressionsNotFoundDialog
    } = useRegisterOfControlDocumentsManager();

    return (
        <Box width={"100%"}>
            <CourtDocumentsGenerator
                heading={t("controlDocumentsHeading")}
                subHeading={t("controlDocumentsSubHeading")}
                isLoading={isLoading}
                handleGenerateDocuments={generateRegisterOfControlDocuments}
                adjudicationTimeFence={adjudicationTimeFence}
                courtNameList={courtNameList}
                courts={courts}
                showNoCourtRegisterFound={showNoCourtRegisterFound}
                courtRegisterNotFound={t("courtRegisterNotFound")}
                view={CourtDocumentsView.CONTROL_DOCUMENTS}
            />

            <TmDialog
                testid={'transgressionsNotFoundDialog'}
                title={''}
                message={t('noTransgressionsFound')}
                isOpen={showTransgressionsNotFoundDialog}
                cancelLabel={t('close')}
                cancelIcon={<CancelOutlinedIcon />}
                onCancel={() => setShowTransgressionsNotFoundDialog(false)}
            />
        </Box>)
}

export default RegisterOfControlDocumentPage;
