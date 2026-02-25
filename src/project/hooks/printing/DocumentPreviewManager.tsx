import { useMediaQuery } from "@mui/material";
import { Theme } from "@mui/system";
import { useState } from "react";
import { toCamelCaseWords } from "../../../framework/utils";
import { useHotkeys } from "react-hotkeys-hook";
import { t } from "i18next";
import {PDFDocumentProxy} from "pdfjs-dist";

const useDocumentPreviewManager = (testId: string, initialScale: number, tabletScale: number, exitCallBack: () => void,
    printAllCallBack: () => void, printCallBack: () => void, showPrintAllButton: boolean, showPrintButton: boolean) => {
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

    const [numPages, setNumPages] = useState(0);
    const [pageNumber, setPageNumber] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [isDocumentReady, setIsDocumentReady] = useState(false);
    const maxScale = 4;
    const minScale = isMobile ? 1 : isTablet ? tabletScale : initialScale;
    const [scale, setScale] = useState(minScale);
    const scaleFactor = 0.2;
    const scrollFactor = 10;


    const onDocumentLoadSuccess = (pageData: PDFDocumentProxy) => {
        setNumPages(0);
        setPageNumber(1);
        setTotalPages(pageData._pdfInfo.numPages);
        setIsDocumentReady(true);
    };

    const onNextPage = () => {
        if (pageNumber < totalPages) {
            setPageNumber(pageNumber + 1);
        }
    };

    const onPreviousPage = () => {
        if (pageNumber > 1) {
            setPageNumber(pageNumber - 1);
        }
    };

    const onZoomIn = () => {
        if (scale < maxScale) {
            setScale(scale + scaleFactor);
        }
    };

    const onZoomOut = () => {
        if (scale > minScale) {
            setScale(scale - scaleFactor);
        }
    };

    const getScrollElement = (): Element | null => {
        return document.querySelector(
            `#${toCamelCaseWords(testId, "PdfDocumentContainer")}`
        );
    };

    const onScrollDown = () => {
        const view = getScrollElement();
        if (view) {
            view.scrollTo(view.scrollLeft, view.scrollTop + scrollFactor);
        }
    };

    const onScrollUp = () => {
        const view = getScrollElement();
        if (view) {
            view.scrollTo(view.scrollLeft, view.scrollTop - scrollFactor);
        }
    };

    const onScrollRight = () => {
        const view = getScrollElement();
        if (view) {
            view.scrollTo(view.scrollLeft + scrollFactor, view.scrollTop);
        }
    };

    const onScrollLeft = () => {
        const view = getScrollElement();
        if (view) {
            view.scrollTo(view.scrollLeft - scrollFactor, view.scrollTop);
        }
    };

    const exit = () => {
        exitCallBack();
    };

    //Hotkeys
    useHotkeys(
        "ArrowLeft",
        () => {
            onPreviousPage();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("previousPage")),
        }
    );

    useHotkeys(
        "ArrowRight",
        () => {
            onNextPage();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("nextPage")),
        }
    );

    useHotkeys(
        "Alt+ArrowDown",
        () => {
            onScrollDown();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: t("scrollDown"),
        }
    );

    useHotkeys(
        "Alt+ArrowUp",
        () => {
            onScrollUp();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: t("scrollUp"),
        }
    );

    useHotkeys(
        "Alt+ArrowRight",
        () => {
            onScrollRight();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: t("scrollRight"),
        }
    );

    useHotkeys(
        "Alt+ArrowLeft",
        () => {
            onScrollLeft();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: t("scrollLeft"),
        }
    );

    useHotkeys(
        "ALT+BACKSPACE",
        () => {
            setScale(minScale);
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("zoomReset")),
        }
    );

    useHotkeys(
        "ALT+=",
        () => {
            onZoomIn();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("zoomIn")),
        }
    );

    useHotkeys(
        "ALT+MINUS",
        () => {
            onZoomOut();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("zoomOut")),
        }
    );

    useHotkeys(
        "CTRL+P",
        () => {
            printCallBack();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("printDocument")),
            enabled: showPrintButton
        }
    );

    useHotkeys(
        "CTRL+SHIFT+P",
        () => {
            printAllCallBack();
        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("printAllDocuments")),
            enabled: showPrintAllButton
        }
    );

    return {
        isMobile,
        isTablet,
        onDocumentLoadSuccess,
        numPages,
        pageNumber,
        totalPages,
        scale,
        minScale,
        maxScale,
        setScale,
        onNextPage,
        onPreviousPage,
        onZoomIn,
        onZoomOut,
        exit,
        isDocumentReady
    };
}

export default useDocumentPreviewManager;
