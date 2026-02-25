import { memo } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  Stack,
  useTheme,
} from "@mui/material";
import { toCamelCaseWords } from "../../../framework/utils";
import { useTranslation } from "react-i18next";
import TmButton from "../../../framework/components/button/TmButton";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import {
  TransgressionDto,
} from "../../redux/api/transgressionsApi";
import useCancelTransgressionManager from "../../hooks/cancel-trangression/CancelTransgressionManager";
import { JsonObjectType } from "../../enum/JsonObjectType";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";

type ReturnDocumentsDialogProps = {
  onCancelComplete: (isCancelled: boolean) => void;
  isOpen: boolean;
  transgression: TransgressionDto;
  supervisorUsername: string;
  supervisorPassword: string,
  cancellationReason: string;
  plateNumber?: string;
};

function ReturnDocumentsDialog({
  onCancelComplete,
  isOpen,
  transgression,
  supervisorUsername,
  supervisorPassword,
  cancellationReason,
  plateNumber
}: Readonly<ReturnDocumentsDialogProps>) {
  const theme = useTheme();
  const { t } = useTranslation();

  const {
    handleCancelOverloadTransgression,
    handleCancelRtqsTransgression,
    isLoading
  } = useCancelTransgressionManager(transgression, () => { });

  const handleDocumentsReturned = (returnedDocuments: boolean) => {
    const reason = returnedDocuments ? t('documentsReturned') : t("documentsNotReturned");
    let reasonsArray: string[] = [];
    reasonsArray.push(cancellationReason);
    reasonsArray = [...reasonsArray, reason];

    if (transgression.type === JsonObjectType.OverloadTransgressionDto) {
      handleCancelOverloadTransgression(reasonsArray, supervisorUsername, supervisorPassword, plateNumber?.toUpperCase())
        .then((response) => {
          onCancelComplete(response);
        }
        );
    }
    else if (transgression.type === JsonObjectType.RtqsTransgressionDto) {
      handleCancelRtqsTransgression(reasonsArray, supervisorUsername, supervisorPassword)
        .then((response) => {
          onCancelComplete(response);
        }
        );
    }
  };

  return (
    <Stack direction="row" paddingLeft={10} paddingTop={5} paddingBottom={0}>
      <Grid container>
        <Dialog
          id={toCamelCaseWords("returnDocuments", "returnDocumentsDialog")}
          open={isOpen}
          onClose={() => handleDocumentsReturned(false)}
          data-testid={toCamelCaseWords("returnDocuments", "returnDocumentsDialog")}
        >
          <DialogTitle
            id={toCamelCaseWords("returnDocuments", "returnDocumentsHeading")}
            style={{ color: theme.palette.primary.main }}
            data-testid={toCamelCaseWords("returnDocuments", "confirmReturnDocumentsId")}
          >
            {t("confirmReturnHeading")}
          </DialogTitle>

          <DialogContent data-testid={toCamelCaseWords("returnDocuments", "confirmReturnDocumentsContentId")}>
            {isLoading ? <TmLoadingSpinner testid={"loadingSpinner"} /> :
              <DialogContentText
                style={{ marginBottom: "15px" }}
                color={theme.palette.text.primary}
              >
                {t("confirmReturnSubHeading")}
              </DialogContentText>
            }
          </DialogContent>

          <DialogActions data-testid={toCamelCaseWords("returnDocuments", "confirmReturnDocumentsActionsId")}>
            <TmButton
              sx={{ color: theme.palette.secondary.main }}
              testid={toCamelCaseWords(
                "returnDocumentsConfirmBtn",
                "confirmReturnDocumentsId"
              )}
              startIcon={<CheckIcon />}
              onClick={() => handleDocumentsReturned(true)}
              disabled={isLoading}
            >
              {t("yes")}
            </TmButton>

            <TmButton
              testid={toCamelCaseWords(
                "returnDocumentsCancelBtn",
                "confirmReturnDocumentsCancelId"
              )}
              startIcon={<CancelIcon />}
              onClick={() => handleDocumentsReturned(false)}
              disabled={isLoading}
            >
              {t("no")}
            </TmButton>
          </DialogActions>
        </Dialog>
      </Grid>
    </Stack>
  );
}

export default memo(ReturnDocumentsDialog);
