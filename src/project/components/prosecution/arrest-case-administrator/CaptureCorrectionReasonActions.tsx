import { Stack, SxProps, Theme } from "@mui/material";
import TmButton from "../../../../framework/components/button/TmButton";
import { toCamelCaseWords } from "../../../../framework/utils";
import { t } from "i18next";
import { CheckCircleOutline, HighlightOff } from "@mui/icons-material";

type Props = {
  testId: string;
  onSubmit: () => void;
  onCancel: () => void;
};

const CaptureCorrectionReasonActions = ({
  testId,
  onSubmit,
  onCancel,
}: Props) => {
  const buttonStyle: SxProps<Theme> = {
    height: "fit-content",
    alignSelf: "end",
  };

  return (
    <Stack direction={"row"} justifyContent={"end"} flex={1}>
      <TmButton
        color="secondary"
        testid={toCamelCaseWords("btn", testId, "confirm")}
        type="submit"
        size="large"
        startIcon={<CheckCircleOutline />}
        onClick={onSubmit}
        sx={buttonStyle}
      >
        {t("confirm")}
      </TmButton>
      <TmButton
        testid={toCamelCaseWords("btn", testId, "cancel")}
        startIcon={<HighlightOff />}
        size="large"
        onClick={onCancel}
        sx={buttonStyle}
      >
        {t("cancel")}
      </TmButton>
    </Stack>
  );
};

export default CaptureCorrectionReasonActions;
