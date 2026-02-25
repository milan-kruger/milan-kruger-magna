import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';
import CancelIcon from "@mui/icons-material/Cancel";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckIcon from '@mui/icons-material/Check';
import { Grid, Stack, SxProps, Theme, useMediaQuery, useTheme } from "@mui/material";
import { t } from "i18next";
import React, { ChangeEvent, ReactNode, useCallback, useEffect, useState } from "react";
import { Controller, FieldError, useForm } from "react-hook-form";
import TmIconButton from "../../../framework/components/button/TmIconButton";
import TmCheckbox from "../../../framework/components/selection/TmCheckbox";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import TmTextField from "../../../framework/components/textfield/TmTextField";
import TmTypography from "../../../framework/components/typography/TmTypography";
import toCamelCase, { toCamelCaseWords } from "../../../framework/utils";
import { Money } from "../../redux/api/transgressionsApi";
import Constants from '../../utils/Constants';
import TmAuthenticationDialog from '../../../framework/components/dialog/TmAuthenticationDialog';
import TmDialog from '../../../framework/components/dialog/TmDialog';
import useSupervisorAuthorizationManager from '../../hooks/SupervisorAuthorizationManager';
import { useChargeOperations } from '../../hooks/prosecution/useChargeOperations';
import { TmRtqsCharge } from './ChargeListEdit';

const AUTHORIZATION_ROLE = 'ROLE_UPDATETRANSGRESSION_OVERRIDE';
const AUTHORIZATION_REASON = 'Update Transgression';

export type ChargeRowProps = {
    charge: TmRtqsCharge;
    index: number;
    setSelectedIndex: (value: number) => void;
    setOpen: (value: boolean) => void;
    firstChargeValid: boolean;
    secondChargeSet: boolean;
    secondChargeValid: boolean;
    updateCharges: TmRtqsCharge[];
    validateField: (index: number, required: boolean, isValid: boolean, isDirty: boolean) => void;
    triggerValidation: () => void;
    disableEdit: boolean;
    supervisorAuthRequired: boolean;
    newTransgression: boolean;
    onTransferCanEdit: (supervisorApproval: boolean) => void;
    transferredPrevSupervisorApproval: boolean;
    allowArrestCase: boolean;
    arrestCaseFineAmount?: Money;
    resetVehicleParameters: () => void;
    steeringVehiclePlateNumber: string;
    chargeOps: ReturnType<typeof useChargeOperations>;
}

export type LinkToOption = {
    id: string;
    display: string;
    index: number;
    value: TmRtqsCharge | undefined;
    name?: string;
}

/**
 * ChargeRow Component
 *
 * Represents a single charge row in the RTQS transgression capture form.
 * Handles charge selection, plate number entry, alternative charge linking,
 * and supervisor authorization for editing existing charges.
 */
export const ChargeRow = ({
    charge, index, setSelectedIndex, setOpen,
    firstChargeValid, secondChargeValid, secondChargeSet, updateCharges,
    validateField, triggerValidation, disableEdit, supervisorAuthRequired, newTransgression,
    onTransferCanEdit, transferredPrevSupervisorApproval, allowArrestCase, arrestCaseFineAmount,
    resetVehicleParameters, steeringVehiclePlateNumber, chargeOps
}: ChargeRowProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
    const isLaptop = useMediaQuery<Theme>((theme) => theme.breakpoints.down('lg'));

    const [alternative, setAlternative] = useState(charge?.isAlternative ?? false);

    //supervisor
    const { onSupervisorAuthorization, isError: isErrorAuthentication } = useSupervisorAuthorizationManager();
    const [isSupervisorAuthDialogOpen, setIsSupervisorAuthDialogOpen] = useState(false);
    const [supervisorUsername, setSupervisorUsername] = useState<string>('');
    const [supervisorPassword, setSupervisorPassword] = useState<string>('');
    const [notApproved, setNotApproved] = useState(false);

    type FormProps = {
        chargeCode: string;
        plateNo: string;
        linkedTo: string | undefined;
    }

    const { control, setValue, watch, formState: { errors, isDirty } } = useForm<FormProps>({
        mode: "onBlur",
        reValidateMode: "onChange",
        defaultValues: {
            plateNo: "",
            chargeCode: "",
            linkedTo: "",
        }
    });

    // Simplified: No longer needs to manipulate snapshot charges
    const resetAlternativeCharge = useCallback(() => {
        const lastIndex = updateCharges.length - 1;
        chargeOps.resetAlternativeCharge(lastIndex, false);
    }, [updateCharges.length, chargeOps]);

    const getLinkedToOptions = useCallback(() => {
        const options = updateCharges.slice(0, 2).filter(charge => !charge.isNew && !charge.isAlternative && charge.chargeCode != '')
            .map((charge, index) => {
                return {
                    id: charge.chargeCode,
                    display: `${t('charge')} ${index + 1}`,
                    value: charge,
                    key: toCamelCaseWords('charge', index.toString()),
                    index: index,
                };
            });
        return {
            options: options,
            getOptionLabel: (option: LinkToOption) => option.display,
        };
    }, [updateCharges]);


    useEffect(() => {
        const lastIndex = updateCharges.length - 1;
        const lastCharge = updateCharges[lastIndex];
        if (!firstChargeValid || !secondChargeValid) {
            const isValidLink = lastCharge.linkedTo ? updateCharges.filter(item => item.chargeCode == lastCharge.linkedTo).length > 0 : false;
            const option = getLinkedToOptions().options.find(item => item.id === lastCharge.linkedTo);
            setValue("linkedTo", isValidLink ? option?.display : undefined);
            const isLinked = updateCharges.find((charge) => charge.chargeCode === option?.id);
            if (lastCharge.isAlternative && !isLinked) {
                resetAlternativeCharge();
            }
        }
    }, [firstChargeValid, setValue, resetAlternativeCharge, updateCharges, secondChargeSet, secondChargeValid, getLinkedToOptions]);

    const handleAlternativeChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const isAlternative = event.target.checked;
        if (isAlternative) {
            chargeOps.resetAlternativeCharge(index, isAlternative);
        }
        else {
            setValue("linkedTo", undefined);
            resetAlternativeCharge();
        }
        setAlternative(isAlternative);
    }, [index, chargeOps, resetAlternativeCharge, setValue]);


    const getLinkedToValue = useCallback((id: string | undefined) => {
        if (getLinkedToOptions()) {
            return getLinkedToOptions().options.find((option) => {
                return option.id === id;
            })
        }
        return null;
    }, [getLinkedToOptions])


    const onLickedToChange = useCallback((value: LinkToOption) => {
        const rtqsCharge = value?.value as TmRtqsCharge;
        if (rtqsCharge) {
            if (rtqsCharge.actualCharge) {
                chargeOps.updateAlternativeCharge(index, rtqsCharge.actualCharge, value.index, undefined, alternative ?? true);
            }
            setValue("linkedTo", value.display);
        } else {
            setValue("linkedTo", undefined);
            chargeOps.updateAlternativeCharge(index, undefined, value.index, undefined, alternative ?? true);
        }
    }, [index, chargeOps, setValue, alternative]);

    const onDelete = useCallback((index: number) => {
        chargeOps.clearCharge(
            index,
            notApproved,
            transferredPrevSupervisorApproval ?? notApproved,
            steeringVehiclePlateNumber
        );
    }, [chargeOps, notApproved, transferredPrevSupervisorApproval, steeringVehiclePlateNumber]);

    const watchChargeCode = watch("chargeCode");
    const watchPlateNo = watch("plateNo");
    const watchLinkedTo = watch("linkedTo");

    // Simplified: Initialize form values from charge data
    // Dependencies include specific charge properties to ensure updates when they change
    useEffect(() => {
        setValue("chargeCode", charge.chargeCode);
        setValue("plateNo", charge.isNew ? "" : charge.plateNumber ?? "");

        if (!charge.isNew && !newTransgression) {
            setAlternative(charge.isAlternative);
        }
    }, [charge.chargeCode, charge.isNew, charge.plateNumber, charge.isAlternative, setValue, newTransgression, setAlternative]);

    // Simplified: Set linked-to options for alternative charges
    useEffect(() => {
        if (charge.linkedTo && charge.linkedToIndex !== undefined) {
            const option = getLinkedToOptions().options.find(item => item.id === charge.linkedTo);
            if (option) {
                setValue("linkedTo", option.display);
                if (!alternative) {
                    setAlternative(true);
                }
            }
        }
    }, [charge, getLinkedToOptions, setValue, setAlternative, alternative]);

    useEffect(() => {
        const linkedToValid = alternative ? (watchLinkedTo !== undefined && watchLinkedTo !== '') && errors.linkedTo === undefined : true;

        // Check both form value AND charge object value to avoid race conditions during state updates
        const formHasPlateNumber = watchPlateNo !== undefined && watchPlateNo !== '';
        const chargeHasPlateNumber = charge.plateNumber !== undefined && charge.plateNumber !== '';
        const hasPlateNumber = formHasPlateNumber || chargeHasPlateNumber;

        const isValid = hasPlateNumber && errors.plateNo === undefined && linkedToValid;
        const fieldRequired = watchChargeCode !== '';

        validateField(index, fieldRequired, isValid, isDirty);
        triggerValidation();
    }, [errors, setValue, isDirty, index, watchChargeCode, watchPlateNo, watchLinkedTo, alternative, validateField, triggerValidation, charge.plateNumber]);

    const fieldHasError = (value: string | undefined, error: FieldError | undefined): boolean => {
        return (value === undefined || value === '') || error !== undefined
    }

    const linkToHasError = (value: string | undefined, charge: TmRtqsCharge, error: FieldError | undefined): boolean => {
        return (value === undefined || value === '' || charge.linkedTo === undefined) || error !== undefined
    }

    const showLinkedTo = useCallback(() => {
        return alternative && watchPlateNo !== '' && watchPlateNo !== undefined && firstChargeValid
    }, [alternative, watchPlateNo, firstChargeValid]);

    const transformValue = (value: string) => {
        return value.toUpperCase().replace(/\s/g, '');
    }

    // Memoize canEdit result to prevent excessive re-renders
    const canEditResult = React.useMemo(() => {
        const item = updateCharges[index];

        // New charges in new transgressions are always editable
        // But new charges in existing transgressions need supervisor approval
        if (item?.isNew && !supervisorAuthRequired) {
            return true;
        }

        // For existing charges OR new charges in existing transgression, check supervisor approval
        if (supervisorAuthRequired) {
            const supervisorApproval = item?.supervisorApproval ?? notApproved;
            const chargePrevSupervisorApproval = item?.chargePrevSupervisorApproval ?? (disableEdit ? false : transferredPrevSupervisorApproval);
            return supervisorApproval || chargePrevSupervisorApproval;
        }

        return true;
    }, [updateCharges, index, supervisorAuthRequired, notApproved, disableEdit, transferredPrevSupervisorApproval]);

    const canEdit = useCallback((checkIndex: number) => {
        if (checkIndex === index) {
            return canEditResult;
        }
        // For other indices (shouldn't happen but fallback)
        return true;
    }, [index, canEditResult]);

    const handleSupervisorAuthDialogClose = () => {
        setSupervisorUsername('');
        setSupervisorPassword('');
        setIsSupervisorAuthDialogOpen(false);
    }

    const handleSupervisorAuthConfirm = () => {
        onSupervisorAuthorization(supervisorUsername, supervisorPassword, AUTHORIZATION_ROLE, AUTHORIZATION_REASON)
            .then((response) => {
                if (response) {
                    setNotApproved(response);
                    // Update the charge's supervisor approval in the state
                    chargeOps.updateSupervisorApproval(index, response);
                }
                handleSupervisorAuthDialogClose();
            });
    }

    const [updateAuthErrorDialogVisible, setUpdateAuthErrorDialogVisible] = useState(false);

    const handleCloseAuthErrorDialog = useCallback(() => {
        setUpdateAuthErrorDialogVisible(false);
    }, []);

    const handleOnChargeEdit = () => {
        setIsSupervisorAuthDialogOpen(true);
    }

    const disableTextStyle: SxProps<Theme> = {
        opacity: disableEdit ? 0.4 : 1
    };

    const getAmountPayable = () => {
        // When arrest case is NOT allowed but charge has zero amount
        if (!allowArrestCase && charge.fineAmount?.amount === 0) {
            // New transgression: charge has been added (not new anymore)
            if (newTransgression && !charge.isNew) {
                return arrestCaseFineAmount?.currency + " " + arrestCaseFineAmount?.amount;
            }
            // Existing transgression: charge has been updated in this session
            if (!newTransgression && charge.updatedInSession) {
                return arrestCaseFineAmount?.currency + " " + arrestCaseFineAmount?.amount;
            }
        }
        // Otherwise: display the actual stored amount
        return charge.fineAmount?.currency + " " + charge.fineAmount?.amount;
    };

    const renderEditButton = (
        disableEdit: boolean,
        handleOnChargeEdit: () => void
    ) => {
        return (
            <TmIconButton
                testid={"rtqsEditCharge" + index.toString()}
                size="small"
                disabled={disableEdit}
                onClick={handleOnChargeEdit}
            >
                <EditIcon fontSize="inherit" />
            </TmIconButton>
        );
    };

    return (
        <>
            <Grid container gap={1} alignItems={"end"}>
                <Grid size={{ xs: 6, sm: 0.5, lg: 0.3 }} paddingBottom={(isLaptop && index < 2) ? "0.5rem" : "unset"}>
                    <>{index === 2 ?
                        <TmCheckbox
                            disabled={!canEdit(index) || !firstChargeValid}
                            testid={toCamelCaseWords("rtqs", "active", index.toString())}
                            sx={{ padding: "0" }}
                            onChange={handleAlternativeChange}
                            checked={alternative}
                            tooltipTitle={t('altCharge')}
                        ></TmCheckbox> : null}</>
                </Grid>
                <Grid size={{ xs: 6, md: 3, lg: 2 }}>
                    <Stack direction={isMobile ? 'column' : 'row'}>
                        <TmTypography
                            sx={disableTextStyle}
                            fontWeight="500"
                            testid={toCamelCaseWords("rtqs", "chargeNumber", index.toString())}
                        >
                            {alternative ? t('altCharge') : t('charge') + " " + (index + 1)}:
                        </TmTypography>

                        <Controller
                            name="chargeCode"
                            control={control}
                            rules={{ required: index === 0 }}
                            render={({ field: { onChange, value }, fieldState: { error } }) => (
                                <TmTextField
                                    disabled
                                    onChange={onChange}
                                    error={index === 0 && fieldHasError(value, error)}
                                    sx={{ WebkitTextFillColor: `${theme.palette.text.primary} !important`, width: 130 }}
                                    hiddenLabel type="text" value={value} testid={toCamelCase("chargeCode" + index.toString())} placeholder={t("chargeCode")}
                                    endadornment={
                                        canEdit(index) ?
                                            <Stack direction="row">
                                                <TmIconButton sx={{ padding: 0 }} onClick={() => {
                                                    // Save current form values to charge object before opening search
                                                    chargeOps.savePlateNumberBeforeSearch(index, watchPlateNo);

                                                    setSelectedIndex(index);
                                                    resetVehicleParameters();
                                                    setOpen(true);
                                                    onTransferCanEdit(canEdit(index))
                                                }} testid={toCamelCaseWords("rtqs", "addCharge", index.toString())}
                                                    disabled={(index >= 1 && !firstChargeValid) || disableEdit}>
                                                    <SearchIcon />
                                                </TmIconButton>
                                                {
                                                    !charge.isNew && <TmIconButton sx={{ padding: 0 }} onClick={() => {
                                                        onDelete(index);
                                                    }} testid={toCamelCaseWords("rtqs", "removeCharge", index.toString())}
                                                        disabled={(index >= 1 && !firstChargeValid) || disableEdit}>
                                                        <ClearIcon />
                                                    </TmIconButton>
                                                }
                                            </Stack> : <></>
                                    } />
                            )} />
                        {
                            (supervisorAuthRequired && charge.isNew && !canEdit(index)) &&
                            renderEditButton(disableEdit, handleOnChargeEdit)
                        }
                    </Stack>

                </Grid>
                {
                    charge.isNew ? null :
                        <>
                            <Grid size={{ xs: 12, md: 4, lg: 3 }}>
                                <TmTypography
                                    sx={disableTextStyle}
                                    fontWeight="500"
                                    testid={toCamelCaseWords("rtqs", "chargeTitle", index.toString())}
                                >
                                    {charge.chargeTitle}
                                </TmTypography>
                            </Grid>
                            <Grid size={{ xs: 6, md: 4, lg: 1.8 }}>
                                <TmTypography
                                    sx={disableTextStyle}
                                    fontWeight="500"
                                    testid={toCamelCaseWords("rtqs", "fineAmountTitle", index.toString())}
                                >
                                    {t("amountPayable")}: {getAmountPayable()}
                                </TmTypography>
                            </Grid>

                            <Grid size={{ xs: 6, md: 3, lg: 2 }} marginLeft={isLaptop ? "2.5rem" : 'inherit'}>
                                <Stack direction={"row"}>
                                    <TmTypography
                                        sx={disableTextStyle}
                                        fontWeight="500"
                                        testid={toCamelCaseWords("rtqs", "plateNo", index.toString())}
                                    >
                                        {t("plateNo")} {!disableEdit && <span>*</span>}
                                    </TmTypography>
                                    <Controller
                                        control={control}
                                        name="plateNo"
                                        rules={{ required: true, pattern: /^[\w\s]*$/gm }}
                                        render={({ field: { value, onChange }, fieldState: { error } }) => {
                                            const isDisabled = (!canEdit(index) || index > 0 && !firstChargeValid) || disableEdit;
                                            return (
                                                <TmTextField
                                                    disabled={isDisabled}
                                                    hiddenLabel
                                                    maxLength={Constants.plateNumberMaxLength}
                                                    testid={toCamelCase("chargeVehiclePlateNo" + index.toString())}
                                                    error={fieldHasError(transformValue(value), error)}
                                                    value={transformValue(value)}
                                                    onChange={(event) => {
                                                        onChange(event);
                                                        chargeOps.updatePlateNumber(index, event.target.value);
                                                    }}
                                                    placeholder={t("plateNo")}
                                                    sx={{
                                                        width: 120
                                                    }}
                                                />
                                            );
                                        }}
                                    />
                                    {
                                        ((supervisorAuthRequired && index < 2 && !canEdit(index)) || (supervisorAuthRequired && index === 2 && !alternative && !canEdit(index))) &&
                                        renderEditButton(disableEdit, handleOnChargeEdit)
                                    }
                                </Stack>
                            </Grid>

                            {showLinkedTo() &&
                                <Grid size={{ xs: 10, md: 4, lg: 2.8 }}>
                                    <Stack direction={"row"} gap={3}
                                        sx={{ alignItems: "end" }}
                                        maxHeight={28}>
                                        <TmTypography
                                            sx={disableTextStyle}
                                            fontWeight="500"
                                            testid={toCamelCaseWords("rtqs", "linkedTo", index.toString())}
                                        >
                                            {t("linkedTo")}*
                                        </TmTypography>
                                        <Stack sx={{ width: "60%" }}>
                                            <Controller
                                                control={control}
                                                name="linkedTo"
                                                rules={{ required: alternative }}
                                                render={({ field: { value }, fieldState: { error } }) => (
                                                    <TmAutocomplete
                                                        {...getLinkedToOptions()}
                                                        disabled={(!canEdit(index) || index > 0 && !firstChargeValid) || disableEdit}
                                                        value={charge.linkedTo ? getLinkedToValue(charge.linkedTo) : null}
                                                        testid="chargeLinkedTo"
                                                        onChange={(_event, newValue) => {
                                                            onLickedToChange(newValue);
                                                        }}
                                                        error={linkToHasError(value, charge, error)}
                                                        label={t('charge')}
                                                        renderInput={(): ReactNode => { return }}
                                                        sx={{
                                                            '& label.MuiInputLabel-shrink': {
                                                                display: "none"
                                                            }
                                                        }}
                                                    />
                                                )}
                                            />
                                        </Stack>
                                        {
                                            (supervisorAuthRequired && index === 2 && !canEdit(index)) &&
                                            renderEditButton(disableEdit, handleOnChargeEdit)
                                        }
                                    </Stack>
                                </Grid>
                            }

                        </>
                }
            </Grid>
            <TmAuthenticationDialog
                testid="chargeDetailsSupervisorAuthDialog"
                isOpen={isSupervisorAuthDialogOpen}
                onCancel={handleSupervisorAuthDialogClose}
                title={t('updateNotice')}
                message={t('updateNoticeSubTitleSuffix', { suffix: t('chargeFields') })}
                username={supervisorUsername}
                password={supervisorPassword}
                cancelLabel={t('cancel')}
                confirmLabel={t('confirm')}
                medium={true}
                cancelIcon={<CancelOutlinedIcon />}
                confirmIcon={<CheckIcon />}

                onConfirm={() => {
                    handleSupervisorAuthConfirm();
                }}

                handlePasswordOnChange={(value: string) => {
                    setSupervisorPassword(value);
                }}

                handleUsernameOnChange={(event: ChangeEvent<HTMLInputElement>) => {
                    setSupervisorUsername(event.target.value?.toUpperCase())
                }}
                isAuthenticationError={isErrorAuthentication || notApproved}
            />
            <TmDialog
                testid={'updateAuthErrorDialog'}
                title={t('authOverridePermissionDenied')}
                message={t('authOverridePermissionDeniedMessage')}
                isOpen={updateAuthErrorDialogVisible}
                onCancel={handleCloseAuthErrorDialog}
                cancelLabel={t('close')}
                cancelIcon={<CancelIcon />}
            />
        </>
    );
}
