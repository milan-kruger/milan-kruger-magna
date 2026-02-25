import { Box, Dialog, DialogActions, DialogContent, DialogTitle, useTheme } from "@mui/material";
import { toCamelCaseWords } from "../../../framework/utils";
import TmButton from "../../../framework/components/button/TmButton";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import {
    ChangeEvent,
    forwardRef,
    memo,
    ReactNode,
    useCallback,
    useImperativeHandle,
} from "react";
import { useTranslation } from "react-i18next";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import { TransgressionDto } from "../../redux/api/transgressionsApi";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import TmAuthenticationDialog from "../../../framework/components/dialog/TmAuthenticationDialog";
import ReturnDocumentsDialog from "./ReturnDocumentsDialog";
import VehicleReweighDialog from "./VehicleReweighDialog";
import TmDialog from "../../../framework/components/dialog/TmDialog";
import tinycolor from 'tinycolor2';
import TmTextField from "../../../framework/components/textfield/TmTextField";
import useCancelTransgressionManager from "../../hooks/cancel-trangression/CancelTransgressionManager";

export interface CancelTransgressionRef {
    clearFields: () => void;
}

type CancelTransgressionDialogProps = {
    testId: string;
    isOpen: boolean;
    transgression: TransgressionDto;
    onCancelTransgression: () => void;
    sequenceNumber: number;
}

const CancelTransgressionDialog = forwardRef<CancelTransgressionRef, CancelTransgressionDialogProps>((props: CancelTransgressionDialogProps, ref) => {
    const theme = useTheme();
    const { t } = useTranslation();

    useImperativeHandle(ref, () => ({
        clearFields
    }));

    const {
        openSupervisorDialog,
        openReturnDocumentsDialog,
        openReweighDialog,
        transgression,
        cancellationReason,
        supervisorUsername,
        supervisorPassword,
        invalidReason,
        isIncorrectOverloadPlateNo,
        isErrorAuthentication,
        newPlateNumber,
        notApproved,
        transgressionCancelReasons,
        invalidDriverPlateNo,
        cancelAuthErrorDialogVisible,
        clearFields,
        onChangeReason,
        onPlateNumberChange,
        displayPlateNumbers,
        setSupervisorUsername,
        setSupervisorPassword,
        getTransgressionReasonValue,
        handleOnInputChange,
        handleSupervisorAuthDialogClose,
        handleReturnDocumentsDialogClose,
        handleVehicleReweighDialogClose,
        handleSupervisorAuthConfirm,
        handleCloseAuthErrorDialog,
        handleOnConfirm,
        handleCloseDialog,
        isLoading
    } = useCancelTransgressionManager(props.transgression, props.onCancelTransgression);

    return (
        <>
                <Dialog
                    id={toCamelCaseWords(props.testId, 'cancelNoticeDialog')}
                    open={props.isOpen}
                    onClose={handleCloseDialog}
                    data-testid={toCamelCaseWords(props.testId, 'cancelNoticeDialog')}>

                    <DialogTitle
                        id={toCamelCaseWords(props.testId, 'cancelNotice')}
                        style={{ color: theme.palette.primary.main }}
                        data-testid={toCamelCaseWords(props.testId, 'dialogTitle')}
                    >
                        {t('cancelNotice')}
                    </DialogTitle>

                    <DialogContent data-testid={toCamelCaseWords(props.testId, 'dialogContent')}>
                        <TmAutocomplete
                            {...transgressionCancelReasons}
                            label={t('cancelReasonLabel')}
                            testid={toCamelCaseWords('cancel', 'cancelNoticeDropdown')}
                            value={getTransgressionReasonValue(cancellationReason) ?? null}
                            onChange={onChangeReason}
                            onInputChange={handleOnInputChange}
                            disabled={false}
                            readonly={false}
                            required={true}
                            renderInput={useCallback((): ReactNode => { return }, [])}
                            error={invalidReason}
                            isOptionEqualToValue={(option, value) => option.lookupValue === value.lookupValue}
                            getOptionLabel={(option) => {
                                if (!option || !option.lookupValue) return '';
                                const description = option.lookupValue
                                    .toLowerCase()
                                    .split(' ')
                                    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');
                                return option.lookupCode ? `${option.lookupCode} - ${description}` : description;
                            }}
                            helperText={''}
                            alternative={true}
                            sx={{
                                width: '25em',
                                '& .MuiFormHelperText-root': {
                                    marginTop: 0,
                                    lineHeight: 1.1,
                                    marginBottom: 5,
                                }
                            }}
                        />
                        {(isIncorrectOverloadPlateNo && cancellationReason) &&
                            <Box>
                                <p>{t('currentPlateNumber')}: {props.transgression.vehicle.plateNumber}</p>
                                <TmTextField
                                    testid={'captureCorrectPlateNumberOnCancel'}
                                    label={t('capturePlateNumberLabel')}
                                    value={newPlateNumber}
                                    onChange={onPlateNumberChange}
                                    required={true}
                                    disabled={false}
                                    readonly={false}
                                    helperText={""}
                                    maxLength={16}
                                    error={invalidDriverPlateNo}
                                    sx={{
                                        width: '25em',
                                        '& .MuiFormHelperText-root': {
                                            marginTop: 0,
                                            lineHeight: 1.1,
                                        },
                                        '& .MuiInputBase-input': {
                                            padding: '0px !important',
                                            textOverflow: 'ellipsis',
                                            background: invalidDriverPlateNo ? tinycolor(theme.palette.error.light).darken(10).setAlpha(0.20).toRgbString() : 'inherit'
                                        },
                                    }}
                                />
                            </Box>

                        }
                    </DialogContent>

                    <DialogActions data-testid={toCamelCaseWords(props.testId, 'dialogActions')}>
                        <TmButton
                            sx={{ color: theme.palette.secondary.main }}
                            testid={toCamelCaseWords(props.testId, 'dialogConfirmButton')}
                            startIcon={<CheckIcon />}
                            onClick={handleOnConfirm}
                            disabled={isIncorrectOverloadPlateNo ? (invalidReason || invalidDriverPlateNo) : invalidReason}
                        >
                            {t('confirm')}
                        </TmButton>

                        <TmButton
                            testid={toCamelCaseWords(props.testId, 'dialogCloseButton')}
                            startIcon={<CancelIcon />}
                            onClick={handleCloseDialog}
                        >
                            {t('close')}
                        </TmButton>
                    </DialogActions>

                </Dialog>

                <TmAuthenticationDialog
                    testid="supervisor"
                    isOpen={openSupervisorDialog}
                    onCancel={handleSupervisorAuthDialogClose}
                    title={t('cancelNotice')}
                    message={t('cancelNoticeSubTitle')}
                    message2={
                        `${t('cancellationReason')}: ${t(cancellationReason as string)}
                        ${isIncorrectOverloadPlateNo ? displayPlateNumbers() : ''}`
                    }
                    username={supervisorUsername}
                    password={supervisorPassword}
                    cancelLabel={t('cancel')}
                    confirmLabel={t('confirm')}
                    medium={true}
                    cancelIcon={<CancelOutlinedIcon />}
                    confirmIcon={<CheckIcon />}
                    onConfirm={handleSupervisorAuthConfirm}
                    handlePasswordOnChange={(value: string) => {
                        setSupervisorPassword(value);
                    }}
                    handleUsernameOnChange={(event: ChangeEvent<HTMLInputElement>) => {
                        setSupervisorUsername(event.target.value?.toUpperCase())
                    }}
                    isAuthenticationError={isErrorAuthentication || notApproved}
                    isLoading={isLoading}
                />

                <ReturnDocumentsDialog
                    isOpen={openReturnDocumentsDialog}
                    onCancelComplete={handleReturnDocumentsDialogClose}
                    transgression={transgression}
                    supervisorUsername={supervisorUsername}
                    supervisorPassword={supervisorPassword}
                    cancellationReason={cancellationReason as string}
                    plateNumber={newPlateNumber}
                />


                <VehicleReweighDialog
                    isOpen={openReweighDialog}
                    onCancel={handleVehicleReweighDialogClose}
                />

                <TmDialog
                    testid={'cancelAuthErrorDialog'}
                    title={t('authOverridePermissionDenied')}
                    message={t('authOverridePermissionDeniedMessage')}
                    isOpen={cancelAuthErrorDialogVisible}
                    onCancel={handleCloseAuthErrorDialog}
                    cancelLabel={t('close')}
                    cancelIcon={<CancelIcon />}
                />
        </>
    )
})

export default memo(CancelTransgressionDialog);
