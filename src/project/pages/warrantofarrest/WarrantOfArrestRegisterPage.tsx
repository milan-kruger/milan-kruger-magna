import { Box } from "@mui/material"
import { t } from "i18next"
import useWarrantOfArrestRegisterManager from "../../hooks/warrant-of-arrest/WarrantOfArrestRegisterManager"
import CourtDocumentsGenerator from "../../components/court-documents/CourtDocumentsGenerator";
import { CourtDocumentsView } from "../../enum/CourtDocumentsView";
import dayjs from "dayjs";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import { useMemo } from "react";

const WarrantOfArrestRegisterPage = () => {
    const {
        courtNameList,
        courts,
        adjudicationTimeFence,
        isLoading,
        handleGenerateWarrantOfArrestRegister
    } = useWarrantOfArrestRegisterManager();

    return (
        <SecuredContent
            accessRoles={useMemo(() => ['WARRANTOFARRESTREGISTER_MAINTAIN', 'WARRANTOFARRESTREGISTER_VIEW'], [])}>
            <Box width={"100%"}>
                <CourtDocumentsGenerator
                    heading={t("warrantOfArrestRegister")}
                    subHeading={t("generateWarrantsOfArrestRegisterDescription")}
                    isLoading={isLoading}
                    handleGenerateDocuments={handleGenerateWarrantOfArrestRegister}
                    adjudicationTimeFence={adjudicationTimeFence}
                    courtNameList={courtNameList}
                    courts={courts}
                    view={CourtDocumentsView.WARRANT_OF_ARREST_REGISTER}
                    maxCourtDate={dayjs().subtract(1, 'days')}
                />
            </Box>
        </SecuredContent>
    )
}

export default WarrantOfArrestRegisterPage;
