import { memo, useState } from "react";
import { Dialog, DialogActions, DialogContent, Grid, Stack } from "@mui/material";
import { toCamelCaseWords } from "../../../framework/utils";
import { useTranslation } from "react-i18next";
import TmButton from "../../../framework/components/button/TmButton";
import CancelIcon from "@mui/icons-material/Cancel";

function ErrorCancellingTransgressionDialog() {
    const { t } = useTranslation();
    const [openError, setOpenError] = useState(true);


    const handleCloseDialog = () => {
        setOpenError(false)
    }

    return (
        <Stack direction="row" paddingLeft={10} paddingTop={5} paddingBottom={0}>
            <Grid container>
            <Dialog
                    id={toCamelCaseWords('errorCancelling', 'errorCancellingDialog')}
                    open={openError}
                    onClose={handleCloseDialog}>

                    <DialogContent>
                    {t('errorCancellingTransgression')}
                    </DialogContent>

                    <DialogActions>
                        <TmButton
                            testid={toCamelCaseWords('errorCancelling', 'errorCancellingDialog')}
                            startIcon={<CancelIcon />}
                            onClick={handleCloseDialog}
                        >
                            {t('close')}
                        </TmButton>
                    </DialogActions>

                </Dialog>
            </Grid>
        </Stack>
    )
}

export default memo(ErrorCancellingTransgressionDialog)