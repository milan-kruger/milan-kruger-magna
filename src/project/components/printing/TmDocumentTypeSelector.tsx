import { Stack, Theme, useMediaQuery, useTheme } from "@mui/material";
import { memo, useState } from "react";
import { toCamelCaseWords } from "../../../framework/utils";
import TmButton from "../../../framework/components/button/TmButton";
import TmTypography from "../../../framework/components/typography/TmTypography";
import TmCheckbox from "../../../framework/components/selection/TmCheckbox";

export type TDocumentType = (
  | "OFFENDER_COPY"
  | "OFFICE_COPY_RED"
  | "OFFICE_COPY_GREEN"
  | "CONTROL_COPY"
  | "CHARGE_SHEET"
)

export type WarrantDocumentType = (
  | "UNSIGNED_WARRANT_OF_ARREST"
  | "SIGNED_WARRANT_OF_ARREST"
  | "WARRANT_OF_ARREST_REGISTER"
)

export type CourtDocumentType = (
  | "COURT_REGISTER"
  | "CONTROL_DOCUMENT"
  | "COURT_SCHEDULE"
)

export type AllDocumentTypes = TDocumentType | WarrantDocumentType | CourtDocumentType;

export interface DocumentTypeOption {
  label: string;
  type: AllDocumentTypes;
  id: string;
  disabled?: boolean | undefined;
}

type Props = {
  testId: string;
  printHeader: string;
  documentTypeOptions: DocumentTypeOption[];
  setPreviewDocumentType: (documentType: DocumentTypeOption) => void;
  printDocumentTypes: string[];
  setPrintDocumentTypes: (documentType: AllDocumentTypes) => void;
  selectionEnabled: boolean;
  width?: number;
};

function TmDocumentTypeSelector({
  testId,
  printHeader,
  documentTypeOptions,
  setPreviewDocumentType,
  printDocumentTypes,
  setPrintDocumentTypes,
  selectionEnabled,
  width
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

  const [selectedDocumentType, setSelectedDocumentType] = useState(
    documentTypeOptions[0].type
  );
  const handleChange = (option: AllDocumentTypes) => {
    setPrintDocumentTypes(option);
  };
  const onSelect = (documentType: DocumentTypeOption) => {
    setSelectedDocumentType(documentType.type);
    setPreviewDocumentType(documentType);
    if (selectionEnabled) {
      handleChange(documentType.type);
    }
  };

  const style = {
    container: {
      paddingBottom: isMobile ? 10 : 0,
      textAlign: "center",
      minWidth: isMobile ? "100%" : width ?? 150,
      maxWidth: isMobile ? "100%" : width ?? 150
    },
    text: { fontSize: 14, fontWeight: "bold" }
  };

  return (
    <Stack
      id={toCamelCaseWords(testId, "Selector")}
      data-testid={toCamelCaseWords(testId, "Selector")}
      sx={style.container}
    >
      <Stack alignItems={"center"} marginTop={10}>
        <TmTypography
          sx={{ color: theme.palette.primary.main }}
          testid={toCamelCaseWords(testId, "SelectorTitle")}
          variant="h5"
          fontWeight={"bold"}
        >
          {printHeader ?? ""}
        </TmTypography>
      </Stack>
      {documentTypeOptions.length > 1 && (
        <Stack spacing={5} paddingX={10} marginTop={10}>
          {documentTypeOptions.map((documentType) => (
            <Stack direction="row" key={documentType.type}>
              <TmButton
                sx={{
                  flex: 1,
                  color:
                    selectedDocumentType === documentType.type
                      ? theme.palette.primary.contrastText
                      : theme.palette.text.primary,
                  backgroundColor:
                    selectedDocumentType === documentType.type
                      ? theme.palette.primary.main
                      : theme.palette.background.default,
                  borderColor: "inherit",
                  borderRadius: 2,
                  paddingY: 5,
                }}
                disabled={documentType.disabled}
                variant="outlined"
                testid={toCamelCaseWords("btn", documentType.id)}
                onClick={() => onSelect(documentType)}
              >
                <TmTypography
                  sx={style.text}
                  testid={toCamelCaseWords("btnText", documentType.id)}
                >
                  {documentType.label}
                </TmTypography>
              </TmButton>
              <TmCheckbox
                tabIndex={-1}
                testid={toCamelCaseWords("checkbox", documentType.id)}
                checked={printDocumentTypes.includes(documentType.type)}
              />
            </Stack>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

export default memo(TmDocumentTypeSelector);
