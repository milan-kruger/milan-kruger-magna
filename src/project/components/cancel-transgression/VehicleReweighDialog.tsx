import { memo } from "react";
import { Dialog, DialogActions, DialogContent, Grid, Stack } from "@mui/material";
import { toCamelCaseWords } from "../../../framework/utils";
import { useTranslation } from "react-i18next";
import TmButton from "../../../framework/components/button/TmButton";
import CancelIcon from "@mui/icons-material/Cancel";

type VehicleReweighProps = {
    isOpen: boolean
    onCancel: () => void
}

function VehicleReweighDialog({ isOpen, onCancel }: Readonly<VehicleReweighProps>) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <Stack direction="row" paddingLeft={10} paddingTop={5} paddingBottom={0}>
            <Grid container>
                <Dialog
                    id={toCamelCaseWords('vehicleReweigh', 'vehicleReweighDialog')}
                    open={isOpen}
                    onClose={onCancel}
                    sx={{
                        textAlign: "center"
                    }}
                    data-testid={toCamelCaseWords('vehicleReweigh', 'vehicleReweighDialog')}>

                    <DialogContent sx={{paddingTop: "40px"}} data-testid={toCamelCaseWords('vehicleReweigh', 'vehicleReweighDialogContent')}>
                        {t('reweighDescription')}
                    </DialogContent>

                    <DialogActions data-testid={toCamelCaseWords('vehicleReweigh', 'vehicleReweighDialogActions')}>
                        <TmButton
                            testid={toCamelCaseWords('vehicleReweigh', 'vehicleReweighDialogConfirmButton')}
                            startIcon={<CancelIcon />}
                            onClick={onCancel}
                        >
                            {t('close')}
                        </TmButton>
                    </DialogActions>

                </Dialog>
            </Grid>
        </Stack>
    )
}

export default memo(VehicleReweighDialog)
