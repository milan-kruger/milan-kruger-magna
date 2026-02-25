import { Stack, Theme, useMediaQuery } from "@mui/material";
import FocusTrap from "@mui/material/Unstable_TrapFocus";
import TmDocumentTypeSelector, { CourtDocumentType, TDocumentType, WarrantDocumentType } from "../../components/printing/TmDocumentTypeSelector";
import TmDocumentPreview from "../../components/printing/TmDocumentPreview";
import usePrintDocumentsManager from "../../hooks/printing/PrintDocumentsManager";
import TmDialog from "../../../framework/components/dialog/TmDialog";
import { CancelOutlined, CheckCircleOutline } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";


const PrintCourtDocumentsPage = () => {

    const { t } = useTranslation();
    const [openDialog, setOpenDialog] = useState(false);
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

    const {
        accessRoles,
        base64,
        printHeader,
        confirmMessage,
        returnPath,
        documents,
        printDocuments,
        print,
        navigate,
        setPreviewDocumentType,
        setSelectedDocuments,
        onPrintSuccessful,
        isLoading
    } = usePrintDocumentsManager(setOpenDialog);

    useHotkeys(
        "ESCAPE",
        () => {
            navigate(-1);
        },
        {
            preventDefault: false,
            enableOnFormTags: true,
            description: t("closePage"),
        }
    );

    return (
        <SecuredContent
            accessRoles={useMemo(() => accessRoles, [accessRoles])}
        >
            {isLoading ? <TmLoadingSpinner testid="printDocumentsLoader" /> : <FocusTrap open>
                <Stack
                    direction={"row"}
                >
                    <TmDialog
                        testid="confirmPrintDialog"
                        cancelIcon={<CancelOutlined />}
                        cancelLabel={t("cancel")}
                        confirmIcon={<CheckCircleOutline />}
                        confirmLabel={t("confirm")}
                        title={t("confirmPrint")}
                        message={confirmMessage}
                        onConfirm={onPrintSuccessful}
                        onCancel={() => setOpenDialog(false)}
                        isOpen={openDialog}
                        showConfirmButton={true}
                    />
                    <Stack
                        sx={{ display: isMobile ? "flex" : "grid", gridTemplateColumns: "1.5fr 6fr" }}
                        width={"100%"}
                    >
                        <Stack>
                            <TmDocumentTypeSelector
                                testId="documentType"
                                printHeader={printHeader}
                                documentTypeOptions={documents.map(doc => ({ label: doc.label, id: doc.id, type: doc.type, disabled: doc.disabled }))}
                                setPreviewDocumentType={documents.length > 1 ? setPreviewDocumentType : () => { }}
                                setPrintDocumentTypes={setSelectedDocuments as (documentType: TDocumentType | WarrantDocumentType | CourtDocumentType) => void}
                                printDocumentTypes={printDocuments}
                                selectionEnabled={true}
                                width={(document.documentElement.clientWidth / 100) * 20}
                            />
                        </Stack>
                        <Stack sx={{ height: "20%" }}>
                            {base64 !== "" && (
                                <TmDocumentPreview
                                    testId="renderedPdf"
                                    data={base64}
                                    printAllCallBack={() => { }}
                                    printCallBack={print}
                                    showPrintButton={true}
                                    showPrintAllButton={false}
                                    disablePrintButton={false}
                                    exitCallBack={() => navigate((returnPath || -1) as string, { replace: true })}
                                    width={(document.documentElement.clientWidth / 100) * 80}
                                    initialScale={2}
                                    offsetPrintControls={"25vw"}
                                ></TmDocumentPreview>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </FocusTrap>}

        </SecuredContent>
    );
};

export default PrintCourtDocumentsPage;
