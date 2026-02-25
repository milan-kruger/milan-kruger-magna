import { Stack } from "@mui/material";
import TmTypography from "../../../../framework/components/typography/TmTypography";
import { t } from "i18next";
import { toCamelCaseWords } from "../../../../framework/utils";

type Props = {
    testId: string;
};

const CaptureCorrectionReasonHeader = ({testId}: Props) => {
  return (
    <Stack gap={5}>
      <TmTypography
        testid={toCamelCaseWords(testId, "title")}
        variant="h5"
        color="error"
        fontWeight={"bold"}
      >
        {t("arrestCase")}
      </TmTypography>
      <TmTypography
        testid={toCamelCaseWords(testId, "description")}
        fontWeight={"bold"}
      >
        {t("arrestCaseCaptureDescription")}
      </TmTypography>
    </Stack>
  );
};

export default CaptureCorrectionReasonHeader;
