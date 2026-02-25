import printJS from "print-js";
import { useLocation, useNavigate } from "react-router-dom";
import { AllDocumentTypes, DocumentTypeOption } from "../../components/printing/TmDocumentTypeSelector";
import { Role } from "../../auth/roles";
import { useCallback, useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { FinalisePrintWarrantOfArrestRequest, FinaliseRegisterOfControlDocumentsRequest, UpdateRegisterOfControlDocumentsHistoryApiArg, FinaliseCourtRegisterRequest,
    UpdateCourtRegisterHistoryApiArg, useFinalisePrintWarrantOfArrestMutation, useUpdateRegisterOfControlDocumentsHistoryMutation, useUpdateCourtRegisterHistoryMutation, useUpdateWarrantRegisterHistoryMutation, UpdateWarrantRegisterHistoryApiArg } from "../../redux/api/transgressionsApi";

export type OnSuccessAction = {
    name: string;
    request: FinalisePrintWarrantOfArrestRequest | FinaliseRegisterOfControlDocumentsRequest | UpdateRegisterOfControlDocumentsHistoryApiArg |
    FinaliseCourtRegisterRequest | UpdateCourtRegisterHistoryApiArg;
}

export type PrintDocumentsState = {
    accessRoles: Role[];
    printHeader: string;
    confirmMessage: string;
    documents: DocumentInfo[];
    returnPath?: string;
    onSuccessAction?: OnSuccessAction;
}

export type DocumentInfo = {
    label: string;
    type: AllDocumentTypes;
    id: string;
    base64: string[];
    disabled?: boolean;
}

const usePrintDocumentsManager = (
    setOpenDialog: (value: boolean) => void
) => {

    const location = useLocation();
    const navigate = useNavigate();

    const {
        accessRoles,
        printHeader,
        confirmMessage,
        documents,
        returnPath,
        onSuccessAction
    } = location.state.printDocumentsState as PrintDocumentsState;

    const [base64, setBase64] = useState<string | string[]>(documents[0].base64);

    const [previewDocumentType, setPreviewDocumentType] = useState<DocumentTypeOption>(documents[0]);
    const [printDocuments, setPrintDocuments] = useState<AllDocumentTypes[]>([documents[0].type]);

    const [finalisePrintWarrantOfArrest, { isLoading: finalisePrintWarrantOfArrestLoader }] = useFinalisePrintWarrantOfArrestMutation();
    const [updateRegisterOfControlDocumentsHistory, { isLoading: updateRegisterOfControlDocumentsHistoryLoader }] = useUpdateRegisterOfControlDocumentsHistoryMutation();
    const [updateCourtRegisterHistory, { isLoading: updateCourtRegisterHistoryLoader }] = useUpdateCourtRegisterHistoryMutation();
    const [updateWarrantRegisterHistory, { isLoading: updateWarrantRegisterHistoryLoader }] = useUpdateWarrantRegisterHistoryMutation();

    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(finalisePrintWarrantOfArrestLoader || updateRegisterOfControlDocumentsHistoryLoader || updateCourtRegisterHistoryLoader || updateWarrantRegisterHistoryLoader);
    }, [finalisePrintWarrantOfArrestLoader, updateRegisterOfControlDocumentsHistoryLoader, updateCourtRegisterHistoryLoader, updateWarrantRegisterHistoryLoader]);

    const setSelectedDocuments = (documentType: AllDocumentTypes) => {
        const documents = [...(printDocuments)];

        if (documents.includes(documentType)) {
            documents.splice(documents.indexOf(documentType), 1);
        } else {
            documents.push(documentType);
        }

        setPrintDocuments(documents);
    };

    const uint8ArrayToBase64 = (uint8Array: Uint8Array): Promise<string> => {
        return new Promise((resolve) => {
            // Create a new ArrayBuffer from the Uint8Array to guarantee compatibility
            const arrayBuffer = new ArrayBuffer(uint8Array.length);
            const view = new Uint8Array(arrayBuffer);
            view.set(uint8Array);
            const blob = new Blob([arrayBuffer], { type: "application/pdf" });
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result!.toString().split(",")[1]);
            reader.readAsDataURL(blob);
        });
    };

    const mergePdfs = async (base64Pdfs: string[]): Promise<string> => {
        const mergedPdf = await PDFDocument.create();

        for (const base64Pdf of base64Pdfs) {
            const pdfBytes = Uint8Array.from(atob(base64Pdf), (c) => c.charCodeAt(0));
            const pdfDoc = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }

        const mergedPdfBytes = await mergedPdf.save();
        return await uint8ArrayToBase64(mergedPdfBytes);
    };

    const print = () => {

        if (printDocuments.length < 1) {
            return;
        }
        else if (printDocuments.length === 1) {
            printJS({
                printable: documents.filter(doc => doc.type === printDocuments[0])[0].base64,
                type: "pdf",
                base64: true,
            });
        }
        else {
            const pdfs = documents.filter(doc => printDocuments.includes(doc.type)).map(doc => doc.base64 as unknown as string);
            mergePdfs(pdfs).then((pdf) => {
                printJS({
                    printable: pdf,
                    type: "pdf",
                    base64: true,
                });
            });
        }

        setOpenDialog(true);
    };

    const onPrintSuccessful = () => {
        if (onSuccessAction) {
            switch (onSuccessAction.name) {
                case 'finalisePrintWarrantOfArrest':
                    onFinalisePrintWarrantOfArrest(onSuccessAction);
                    break;
                case 'updateRegisterOfControlDocumentsHistory':
                    onUpdateRegisterOfControlDocumentsHistory(onSuccessAction);
                    break;
                case 'updateCourtRegisterHistory':
                    onUpdateCourtRegisterHistory(onSuccessAction);
                    break;
                case 'updateWarrantRegisterHistory':
                    onUpdateWarrantRegisterHistory(onSuccessAction);
                    break;
            }
        }
        else {
            navigate((returnPath || -1) as string, { replace: true });
        }
    };

    const onFinalisePrintWarrantOfArrest = useCallback((onSuccessAction: OnSuccessAction) => {
        const request = JSON.parse(JSON.stringify(onSuccessAction.request)) as FinalisePrintWarrantOfArrestRequest;
        request.warrantOfArrestDocumentInformation.forEach(info => {
            if (!printDocuments.includes("SIGNED_WARRANT_OF_ARREST")) {
                info.signedWarrantDocumentId = undefined;
            }
            if (!printDocuments.includes("UNSIGNED_WARRANT_OF_ARREST")) {
                info.unsignedWarrantDocumentId = undefined;
            }
        })

        finalisePrintWarrantOfArrest({ finalisePrintWarrantOfArrestRequest: request })
            .unwrap().then(() => {
                navigate((returnPath || -1) as string, { replace: true });
            });
    }, [finalisePrintWarrantOfArrest, navigate, printDocuments, returnPath]);

    const onUpdateRegisterOfControlDocumentsHistory = useCallback((onSuccessAction: OnSuccessAction) => {
        const request = JSON.parse(JSON.stringify(onSuccessAction.request)) as UpdateRegisterOfControlDocumentsHistoryApiArg;

        updateRegisterOfControlDocumentsHistory(
            { updateTransgressionHistoryRequest: request.updateTransgressionHistoryRequest })
            .unwrap().then(() => {
                navigate((returnPath || -1) as string, { replace: true });
            });
    }, [updateRegisterOfControlDocumentsHistory, navigate, returnPath]);

    const onUpdateCourtRegisterHistory = useCallback((onSuccessAction: OnSuccessAction) => {
        const request = JSON.parse(JSON.stringify(onSuccessAction.request)) as UpdateCourtRegisterHistoryApiArg;

        updateCourtRegisterHistory(
            { updateTransgressionHistoryRequest: request.updateTransgressionHistoryRequest })
            .unwrap().then(() => {
                navigate((returnPath || -1) as string, { replace: true });
            });
    }, [updateCourtRegisterHistory, navigate, returnPath]);

    const onUpdateWarrantRegisterHistory = useCallback((onSuccessAction: OnSuccessAction) => {
        const request = JSON.parse(JSON.stringify(onSuccessAction.request)) as UpdateWarrantRegisterHistoryApiArg;

        updateWarrantRegisterHistory(
            { updateTransgressionHistoryRequest: request.updateTransgressionHistoryRequest })
            .unwrap().then(() => {
                navigate((returnPath || -1) as string, { replace: true });
            });
    }, [updateWarrantRegisterHistory, navigate, returnPath]);

    useEffect(() => {
        setBase64(documents.find(doc => doc.type === previewDocumentType.type)?.base64 || "");
    }, [previewDocumentType, documents]);

    return {
        accessRoles,
        base64,
        printHeader,
        confirmMessage,
        returnPath,
        documents,
        printDocuments,
        navigate,
        print,
        setPreviewDocumentType,
        setSelectedDocuments,
        onPrintSuccessful,
        isLoading
    }
}

export default usePrintDocumentsManager;
