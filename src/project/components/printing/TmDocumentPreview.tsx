import { Stack, useTheme } from "@mui/material";
import { memo, useLayoutEffect, useState } from "react";
import TmTypography from "../../../framework/components/typography/TmTypography";
import { Document, Page, pdfjs } from "react-pdf";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import TmButton from "../../../framework/components/button/TmButton";
import "./TmDocumentPreview.css";
import TmIconButton from "../../../framework/components/button/TmIconButton";
import {
  Add,
  ArrowLeft,
  ArrowRight,
  CancelTwoTone,
  FullscreenExit,
  Print,
  Remove,
} from "@mui/icons-material";
import { toCamelCaseWords } from "../../../framework/utils";
import { t } from "i18next";
import useDocumentPreviewManager from "../../hooks/printing/DocumentPreviewManager";


pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}/assets/pdfjs/pdf.worker.min.mjs`;

type Props = {
  testId: string;
  data: string | string[];
  printAllCallBack: () => void;
  printCallBack: () => void;
  showPrintAllButton: boolean;
  showPrintButton: boolean;
  disablePrintButton: boolean;
  exitCallBack: () => void;
  width: number;
  initialScale?: number;
  tabletScale?: number;
  offsetPrintControls?: string;
  isDocumentReady?: boolean;
};
function TmDocumentPreview({
  testId,
  data,
  printAllCallBack,
  printCallBack,
  showPrintAllButton,
  showPrintButton,
  disablePrintButton,
  exitCallBack,
  width,
  initialScale = 1,
  tabletScale = 2.6,
  offsetPrintControls = "18vw"
}: Props) {


  function useWindowSize() {
    const [size, setSize] = useState(() => ({
      width: window.innerWidth,
      height: window.innerHeight,
      availableHeight: calculateAvailableHeight(),
    }));

    function calculateAvailableHeight() {
      const header = document.querySelector("#desktopTrafmanLogoIcon")?.parentElement;
      const availableHeight = header ? window.innerHeight - header.clientHeight : window.innerHeight;
      return (availableHeight / 100) * 97;
    }

    useLayoutEffect(() => {
      function updateSize() {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
          availableHeight: calculateAvailableHeight(),
        });
      }

      window.addEventListener("resize", updateSize);
      updateSize();
      return () => window.removeEventListener("resize", updateSize);
    }, []);
    return size;
  }

  const { width: windowWidth, availableHeight } = useWindowSize();

  const theme = useTheme();


  const {
    isMobile,
    isTablet,
    onDocumentLoadSuccess,
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
  } = useDocumentPreviewManager(testId, initialScale, tabletScale, exitCallBack, printAllCallBack, printCallBack, showPrintAllButton, showPrintButton);

  const style = {
    pagination: {
      icon: {
        fontSize: "25px",
      },
      text: {
        fontSize: "18px",
        fontWeight: "bold",
      },
    },
    buttonGroup: {
      button: {
        minWidth: "unset",
        width: 30,
        height: isMobile ? 30 : 40,
        borderRadius: "100%",
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.background.default,
        padding: isMobile ? "14px" : "8px 22px",
      },
      icon: {
        fontSize: isMobile ? "18px" : "25px",
      },
      text: {
        fontSize: isMobile ? "10px" : "14px",
        fontWeight: "bold",
      },
    },
    print: {
      button: {
        color: theme.palette.secondary.main,
      }
    },
  };


  return (
    <>
      <Stack
        id={toCamelCaseWords(testId, "RenderedDocument")}
        data-testid={toCamelCaseWords(testId, "RenderedDocument")}
        direction={"column"}
      >
        <Stack
          sx={{
            paddingTop: 10,
            backgroundColor: "rgba(190, 190, 190, 0.3)",
            display: "grid",
            maxWidth: isMobile ? windowWidth : width,
            overflow: "auto",
            minHeight: availableHeight,
            paddingBottom: isMobile ? 0 : "55px"
          }}
        >
          <Stack alignItems={"center"} direction={"column"} spacing={2}
            paddingBottom={isMobile ? 30 : 0}>
            <Stack
              id={toCamelCaseWords(testId, "PdfDocumentContainer")}
              data-testid={toCamelCaseWords(testId, "PdfDocumentContainer")}
              sx={{
                maxWidth: isMobile ? windowWidth : width,
                overflow: "auto",
                justifyContent: isMobile ? "center" : "normal",
              }}
            >
              <Document
                key={`${data}`}
                onLoadSuccess={onDocumentLoadSuccess}
                file={`data:application/pdf;base64,${data}`}
                aria-label={`Alternative text for the PDF document`}
              >
                {isDocumentReady && (
                  <Page
                    scale={scale}
                    width={isMobile ? windowWidth : (width / 100) * 35}
                    key={`page_${pageNumber}`}
                    pageNumber={pageNumber}
                  />
                )}
              </Document>
            </Stack>

            {/* Stack for pagination controls */}
            <Stack
              direction={"row"}
              spacing={2}
              alignItems={"center"}
              sx={{ marginTop: 0, marginBottom: 0 }}
            >
              <TmIconButton
                tabIndex={1}
                disabled={pageNumber === 1}
                testid={toCamelCaseWords(testId, "BtnPreviousPage")}
                size="large"
                aria-label={t("previousPage") ?? ""}
                aria-haspopup="true"
                onClick={onPreviousPage}
                color="inherit"
              >
                <ArrowLeft sx={{ fontSize: style.pagination.icon.fontSize }} />
              </TmIconButton>
              <TmTypography
                sx={{ fontSize: style.pagination.text.fontSize }}
                testid={toCamelCaseWords(testId, "PdfPaginationInfo")}
              >
                {t("pagination", { currentPage: pageNumber, totalPages }) ?? ""}
              </TmTypography>
              <TmIconButton
                tabIndex={2}
                disabled={pageNumber === totalPages}
                testid={toCamelCaseWords(testId, "BtnNextPage")}
                size="large"
                aria-label={t("nextPage") ?? ""}
                aria-haspopup="true"
                onClick={onNextPage}
                color="inherit"
              >
                <ArrowRight sx={{ fontSize: style.pagination.icon.fontSize }} />
              </TmIconButton>
            </Stack>
          </Stack>
        </Stack>

        {/* Stack for scale control */}
        <Stack
          direction={"column"}
          sx={{
            position: "fixed",
            bottom: isMobile ? "0px" : "100px",  // Adjust based on your layout
            right: isMobile ? "1vw" : isTablet ? "28px" : "40px",
            justifyContent: "end",
            marginBottom: "20px",
            alignItems: "center",
            backgroundColor: "white",
            padding: "10px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
          }}
          spacing={5}
        >
          <TmButton
            tabIndex={3}
            variant="contained"
            sx={style.buttonGroup.button}
            testid={toCamelCaseWords(testId, "BtnResetZoom")}
            size="large"
            aria-label={t("zoomReset") ?? ""}
            aria-haspopup="true"
            onClick={() => setScale(minScale)}
            color="inherit"
          >
            <FullscreenExit sx={style.buttonGroup.icon} />
          </TmButton>
          <TmButton
            tabIndex={4}
            variant="contained"
            sx={style.buttonGroup.button}
            disabled={scale === maxScale}
            testid={toCamelCaseWords(testId, "BtnZoomIn")}
            size="large"
            aria-label={t("zoomIn") ?? ""}
            aria-haspopup="true"
            onClick={onZoomIn}
            color="inherit"
          >
            <Add sx={style.buttonGroup.icon} />
          </TmButton>
          <TmButton
            tabIndex={5}
            variant="contained"
            sx={style.buttonGroup.button}
            disabled={scale === minScale}
            testid={toCamelCaseWords(testId, "BtnZoomOut")}
            size="large"
            aria-label={t("zoomOut") ?? ""}
            aria-haspopup="true"
            onClick={onZoomOut}
            color="inherit"
          >
            <Remove sx={style.buttonGroup.icon} />
          </TmButton>
        </Stack>

        {/* Stack for print and exit buttons */}
        <Stack
          direction={"row"}
          spacing={2}
          justifyContent={"end"}
          sx={{
            position: "fixed",
            bottom: isMobile ? "20px" : "40px",
            right: isMobile ? offsetPrintControls : isTablet ? "28px" : "30px",
            backgroundColor: "white",
            padding: isMobile ? "5px" : "10px",
            borderRadius: "8px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          {showPrintAllButton && (
            <TmButton
              tabIndex={6}
              sx={style.print.button}
              testid={toCamelCaseWords(testId, "BtnPrintAll")}
              style={{ gap: "10px" }}
              onClick={printAllCallBack}
            >
              <Print />
              <TmTypography
                testid={toCamelCaseWords(testId, "BtnPrintAllText")}
                sx={style.buttonGroup.text}
              >
                {t("printAll") ?? ""}
              </TmTypography>
            </TmButton>
          )}
          {showPrintButton && (
            <TmButton
              tabIndex={7}
              disabled={disablePrintButton}
              sx={style.print.button}
              testid={toCamelCaseWords(testId, "BtnPrint")}
              style={{ gap: "10px" }}
              onClick={printCallBack}
            >
              <Print />
              <TmTypography
                testid={toCamelCaseWords(testId, "BtnPrintText")}
                sx={style.buttonGroup.text}
              >
                {t("print") ?? ""}
              </TmTypography>
            </TmButton>
          )}
          <TmButton
            tabIndex={8}
            testid={toCamelCaseWords(testId, "BtnExit")}
            style={{ gap: "10px" }}
            onClick={exit}
          >
            <CancelTwoTone />
            <TmTypography
              testid={toCamelCaseWords(testId, "BtnExitText")}
              sx={style.buttonGroup.text}
            >
              {t("exit") ?? ""}
            </TmTypography>
          </TmButton>
        </Stack>
      </Stack>
    </>
  );
}

export default memo(TmDocumentPreview);
