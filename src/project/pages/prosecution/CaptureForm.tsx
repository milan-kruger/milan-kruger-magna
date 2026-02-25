import { Box, Stack, Theme, useMediaQuery, useTheme } from "@mui/material"
import tinycolor from "tinycolor2";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import toCamelCase, { toCamelCaseWords } from "../../../framework/utils";
import TransgressionTopDetails from "../../components/prosecution/TransgressionTopDetails";
import {
    LoadCharge,
    Money,
    OverloadTransgressionDto,
    RetrieveTransgressionInformationResponse,
    RtqsCharge,
    SnapshotCharge,
    SpeedCharge,
    TransgressionConfiguration,
    VehicleChargeDto
} from "../../redux/api/transgressionsApi";
import TmTypography from "../../../framework/components/typography/TmTypography";
import { t } from "i18next";
import { FormState, transgressionSlice } from "../../redux/transgression/transgressionSlice";
import VehicleDetails from "../../components/prosecution/VehicleDetails";
import OperatorDetails from "../../components/prosecution/OperatorDetails";
import DriverDetails from "../../components/prosecution/DriverDetails";
import PhysicalAddress from "../../components/prosecution/PhysicalAddress";
import TmBusinessAddressDetails from "../../components/prosecution/BusinessAddressDetails";
import { TransgressionValidation } from "../../redux/transgression/TransgressionValidation";
import { Dispatch, Fragment, memo, SetStateAction, useCallback, useEffect, useRef, useState } from "react";
import { FindAllIdentityTypesApiResponse, IdTypeResponse } from "../../redux/api/coreApi";
import TmChargeListEdit, { TmRtqsCharge } from "../../components/prosecution/ChargeListEdit";
import TmDialog from "../../../framework/components/dialog/TmDialog";
import CheckIcon from "@mui/icons-material/Check";
import CancelIcon from "@mui/icons-material/Cancel";
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import EditIcon from "@mui/icons-material/Edit";
import HistoryIcon from "@mui/icons-material/History";
import PrintIcon from "@mui/icons-material/Print";
import { TransgressionStatus } from "../../enum/TransgressionStatus";
import AuthService from "../../../framework/auth/authService";
import TmButton from "../../../framework/components/button/TmButton";
import { useTranslation } from "react-i18next";
import TmSnackbar from "../../../framework/components/snackbar/TmSnackbar";
import TmChargeList from "../../components/prosecution/ChargeList";
import { TransgressionType } from "../../enum/TransgressionType";
import { useAppDispatch } from "../../../framework/redux/hooks";
import {
    displayBusinessSection,
    displayDriverSection,
    displayOperatorSection,
    displayResidentialSection,
    displayVehicleSection
} from "../../utils/TransgressionHelpers";

type Props = {
    transgressionStatus: string;
    form: FormState;
    officerName: string;
    plateNumber: string;
    isEditable: boolean;
    setFormDataField: (fieldKey: string, fieldValue: string | number | boolean | null | undefined) => void;
    setFormFieldValidation: (fieldKey: keyof TransgressionValidation, fieldValue: boolean | "" | undefined) => void;
    setSupervisor: Dispatch<SetStateAction<string | undefined>>;
    transgressionConfig: TransgressionConfiguration | undefined;
    lookupVehicleConfiguration: (data: RetrieveTransgressionInformationResponse) => void;
    idTypes: {
        options: FindAllIdentityTypesApiResponse;
        getOptionLabel: (option: IdTypeResponse) => string;
    };
    getIdTypeValue: (idTypeName: string | undefined | null) => IdTypeResponse | null | undefined;
    lookupDriverDetails: (data: RetrieveTransgressionInformationResponse) => void;
    setDrivingLicenceCodeId: Dispatch<SetStateAction<string | undefined>>;
    lookupOperatorDetails: (data: RetrieveTransgressionInformationResponse) => void;
    captureCharges?: TmRtqsCharge[];
    props: {
        exitDialogState?: boolean;
        openDialogState?: boolean;
        handleOpenSaveDialog?: () => void;
        handleOpenExitDialog?: () => void;
        handleOpenHistoryDialog?: () => void;
        handleReprint?: () => void;
        closeSaveDialog?: () => void;
        closeExitDialog?: () => void;
        handleOpenCancelDialog?: () => void;
        handleEdit?: (isEditing: boolean) => void;
    },
    handleSaveDialogConfirm: () => void;
    handleConfirmDialogConfirm: () => void;
    showValidationSnackbar: boolean;
    setShowValidationSnackbar: Dispatch<SetStateAction<boolean>>;
    onEdit: () => void;
    isNew: boolean;
    transgressionType: TransgressionType;
    charges?: SnapshotCharge[];
    vehicleCharges?: VehicleChargeDto[];
    rtqsCharges?: (LoadCharge | RtqsCharge | SpeedCharge)[];
    rtqsAllowArrestCase?: boolean;
    rtqsArrestCaseFineAmount?: Money;
    setFormChargesValid?: Dispatch<SetStateAction<boolean>>;
}

const breakpoints = {
    flex: {
        xs: "100%",
        sm: "calc(50% - 50px)",
        md: "calc(33% - 50px)",
        lg: "calc(25% - 50px)"
    },
};

export const TransgressionCaptureFormLoader = () => {
    return (
        <Box sx={breakpoints}>
            <TmLoadingSpinner testid={toCamelCaseWords('EditChildrenLoadingSpinner')} />
        </Box>
    );
}

const TransgressionCaptureForm = ({ transgressionStatus, form, officerName, plateNumber, isEditable,
    setFormDataField, setFormFieldValidation, setSupervisor, transgressionConfig, lookupVehicleConfiguration,
    idTypes, getIdTypeValue, lookupDriverDetails, setDrivingLicenceCodeId, lookupOperatorDetails,
    captureCharges, props, handleSaveDialogConfirm, handleConfirmDialogConfirm, showValidationSnackbar,
    setShowValidationSnackbar, onEdit, isNew, transgressionType, charges, vehicleCharges, rtqsCharges, setFormChargesValid,
    rtqsAllowArrestCase, rtqsArrestCaseFineAmount
}: Props) => {
    const theme = useTheme();
    const [chargeList, setChargeList] = useState<TmRtqsCharge[]>(captureCharges ?? []);
    const displayOptionalFields = transgressionConfig?.displayOptionalFields as boolean;
    const dispatch = useAppDispatch();

    // Media query hooks (already optimized by MUI with resize listeners)
    const isLaptop = useMediaQuery('(min-width:1024px)');
    const isDesktop = useMediaQuery('(min-width:1600px)');
    const isMobile = useMediaQuery('(min-width:800px)');
    const isMiniMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

    // This ensures callbacks maintain stable references for React.memo() optimization
    const formRef = useRef(form);
    formRef.current = form;

    // Using formRef ensures callbacks stay stable even as form data changes
    const handleVehicleFieldChange = useCallback(() => {
        lookupVehicleConfiguration(formRef.current.formData as RetrieveTransgressionInformationResponse);
    }, [lookupVehicleConfiguration]);

    const handleDriverFieldChange = useCallback(() => {
        lookupDriverDetails(formRef.current.formData as RetrieveTransgressionInformationResponse);
    }, [lookupDriverDetails]);

    const handleOperatorFieldChange = useCallback(() => {
        lookupOperatorDetails(formRef.current.formData as RetrieveTransgressionInformationResponse);
    }, [lookupOperatorDetails]);

    useEffect(() => {
        if (!displayVehicleSection(transgressionConfig)) {
            setFormFieldValidation("vehicleTypeError", false);
            setFormFieldValidation("vehicleMakeError", false);
            setFormFieldValidation("vehicleModelError", false);
            setFormFieldValidation("vehicleColorError", false);
            setFormFieldValidation("originOfCargoError", false);
            setFormFieldValidation("destinationOfCargoError", false);
            setFormFieldValidation("cargoError", false);
        }
        if (!displayOperatorSection(transgressionConfig)) {
            setFormFieldValidation("depotNumberError", false);
            setFormFieldValidation("depotNameError", false);
            setFormFieldValidation("operatorNameError", false);
            setFormFieldValidation("operatorDiscNumberError", false);
            setFormFieldValidation("operatorEmailError", false);
        }
        if (!displayDriverSection(transgressionConfig)) {
            setFormFieldValidation("firstNamesError", false);
            setFormFieldValidation("surnameError", false);
            setFormFieldValidation("identificationTypeLookupError", false);
            setFormFieldValidation("identificationNumberError", false);
            setFormFieldValidation("identificationCountryOfIssueError", false);
            setFormFieldValidation("dateOfBirthError", false);
            setFormFieldValidation("genderLookupError", false);
            setFormFieldValidation("occupationError", false);
            setFormFieldValidation("contactNumberTypeError", false);
            setFormFieldValidation("contactNumberError", false);
            setFormFieldValidation("contactDialingCodeError", false);
            setFormFieldValidation("driverCountryOfIssueError", false);
            setFormFieldValidation("licenceCodeError", false);
            setFormFieldValidation("licenceNoError", false);
            setFormFieldValidation("driverPrdpCodeError", false);
            setFormFieldValidation("driverPrdpNoError", false);
        }
        if (!displayResidentialSection(transgressionConfig)) {
            setFormFieldValidation("physicalAddressLine1Error", false);
            setFormFieldValidation("physicalAddressLine2Error", false);
            setFormFieldValidation("physicalAddressCityError", false);
            setFormFieldValidation("physicalAddressCodeError", false);
            setFormFieldValidation("physicalAddressCountryError", false);
        }
        if (!displayBusinessSection(transgressionConfig)) {
            setFormFieldValidation("businessAddressLine1Error", false);
            setFormFieldValidation("businessAddressLine2Error", false);
            setFormFieldValidation("businessAddressCityError", false);
            setFormFieldValidation("businessAddressCodeError", false);
            setFormFieldValidation("businessAddressCountryError", false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const containerBorderStyle = {
        border: `2px solid ${theme.palette.primary.main}`,
        padding: '5px',
        borderRadius: '5px',
        margin: '0 0 5px',
        backgroundColor: theme.palette.mode === 'dark' ? tinycolor(theme.palette.background.default).lighten(25).toRgbString() : 'rgb(254 248 238)'
    }
    const headingsFontSize = '1.2rem';

    const onUpdateRtqsCharges = useCallback((charges: TmRtqsCharge[]) => {
        setChargeList(charges);
        // Store the raw charges - backend will compile snapshots at submission time
        dispatch(transgressionSlice.actions.setFormDataField({ key: "charges", value: charges }))
    }, [setChargeList, dispatch]);

    const [chargesValid, setChargesValid] = useState<boolean>(false);

    const isFormValid = useCallback(() => {
        const isFormValid = form.isDirty ? !form.validationErrors : !form.isDirty;
        if (transgressionType === TransgressionType.OVERLOAD) {
            return isFormValid;
        } else {
            return isFormValid && chargesValid;
        }
    }, [form, transgressionType, chargesValid]);

    // Update parent state when form validity changes (in useEffect to avoid calling setState during render)
    useEffect(() => {
        if (transgressionType !== TransgressionType.OVERLOAD && setFormChargesValid) {
            const isFormValid = form.isDirty ? !form.validationErrors : !form.isDirty;
            const isValid = isFormValid && chargesValid;
            setFormChargesValid(isValid);
        }
    }, [form.isDirty, form.validationErrors, chargesValid, transgressionType, setFormChargesValid]);

    return (
        <Box width="100%">
            <Box sx={{
                position: 'static',
                height: isDesktop ? '80vh' : isLaptop ? '75vh' : 'auto',
                overflowX: 'hidden',
                paddingRight: 10,
                '&body::-webkit-scrollbar-thumb': { width: 1 }
            }}>
                <Box sx={breakpoints}>
                    <TransgressionTopDetails
                        data={form.formData as RetrieveTransgressionInformationResponse | OverloadTransgressionDto}
                        status={transgressionStatus}
                        officerName={officerName}
                        team="Unknown"
                        plateNumber={plateNumber}
                        transgressionType={transgressionType}
                    />
                </Box>
                {/* Vehicle Section */}
                {(displayVehicleSection(transgressionConfig) && transgressionType === TransgressionType.OVERLOAD) && (
                    <Box sx={breakpoints}>
                        <Stack direction={isMiniMobile ? 'column' : 'row'} gap={isMobile ? 5 : 15}>
                            <TmTypography
                                testid={toCamelCaseWords('editHeading', toCamelCase(t('vehicleTitle')))}
                                fontWeight='bold'
                                color={theme.palette.primary.main}
                                fontSize={headingsFontSize}
                            >
                                {t('vehicleTitle')}
                            </TmTypography>
                        </Stack>
                        <Box sx={containerBorderStyle}>
                            <VehicleDetails
                                disableEdit={!isEditable}
                                setFormDataField={setFormDataField}
                                setFormFieldValidation={setFormFieldValidation}
                                setSupervisor={setSupervisor}
                                transgressionConfig={transgressionConfig}
                                supervisorAuthorizationRequired={!isNew}
                                onComponentFieldChanges={handleVehicleFieldChange}
                                transgressionType={transgressionType}
                                displayOptionalFields={displayOptionalFields}
                            />
                        </Box>
                    </Box>
                )}

                {transgressionType === TransgressionType.RTQS && (
                    <Box sx={breakpoints}>
                        <Stack direction={isMiniMobile ? 'column' : 'row'} gap={isMobile ? 5 : 15}>
                            <TmTypography
                                testid={toCamelCaseWords('editHeading', toCamelCase(t('vehicleTitle')))}
                                fontWeight='bold'
                                color={theme.palette.primary.main}
                                fontSize={headingsFontSize}
                            >
                                {t('vehicleTitle')}
                            </TmTypography>
                        </Stack>
                        <Box sx={containerBorderStyle}>
                            <VehicleDetails
                                disableEdit={!isEditable}
                                setFormDataField={setFormDataField}
                                setFormFieldValidation={setFormFieldValidation}
                                setSupervisor={setSupervisor}
                                transgressionConfig={transgressionConfig}
                                supervisorAuthorizationRequired={!isNew}
                                onComponentFieldChanges={handleVehicleFieldChange}
                                transgressionType={transgressionType}
                                displayOptionalFields={displayOptionalFields}
                            />
                        </Box>
                    </Box>
                )}

                {/* Operator Section */}
                {displayOperatorSection(transgressionConfig) && (
                    <Box sx={breakpoints}>
                        <Stack direction={isMiniMobile ? 'column' : 'row'} gap={isMobile ? 5 : 15}>
                            <TmTypography
                                testid={toCamelCaseWords('editHeading', toCamelCase(t('operatorTitle')))}
                                fontWeight='bold'
                                color={theme.palette.primary.main}
                                fontSize={headingsFontSize}
                            >
                                {t('operatorTitle')}
                            </TmTypography>
                        </Stack>
                        <Box sx={containerBorderStyle}>
                            <OperatorDetails
                                disableEdit={!isEditable}
                                setFormDataField={setFormDataField}
                                setFormFieldValidation={setFormFieldValidation}
                                transgressionConfig={transgressionConfig}
                                displayOptionalFields={displayOptionalFields}
                            />
                        </Box>
                    </Box>
                )}

                {/* Driver Section */}
                {displayDriverSection(transgressionConfig) && (
                    <Box sx={breakpoints}>
                        <Stack direction={isMiniMobile ? 'column' : 'row'} gap={isMobile ? 5 : 15}>
                            <TmTypography
                                testid={toCamelCaseWords(
                                    "editHeading",
                                    toCamelCase(t("driverTitle"))
                                )}
                                fontWeight="bold"
                                color={theme.palette.primary.main}
                                fontSize={headingsFontSize}
                            >
                                {t("driverTitle")}
                            </TmTypography>
                        </Stack>
                        <Box sx={containerBorderStyle}>
                            <DriverDetails
                                disableEdit={!isEditable}
                                setFormDataField={setFormDataField}
                                setFormFieldValidation={setFormFieldValidation}
                                transgressionConfig={transgressionConfig}
                                idTypes={idTypes}
                                getIdTypeValue={getIdTypeValue}
                                setSupervisor={setSupervisor}
                                onComponentFieldChanges={handleDriverFieldChange}
                                setDrivingLicenceCodeId={setDrivingLicenceCodeId}
                                displayOptionalFields={displayOptionalFields}
                            />
                        </Box>
                    </Box>
                )}

                {/* Residential Section */}
                {displayResidentialSection(transgressionConfig) && (
                    <Box sx={breakpoints}>
                        <Stack direction={isMiniMobile ? 'column' : 'row'} gap={isMobile ? 5 : 15}>
                            <TmTypography
                                testid={toCamelCaseWords(
                                    "editHeading",
                                    toCamelCase(t("residentialHeading"))
                                )}
                                fontWeight="bold"
                                color={theme.palette.primary.main}
                                fontSize={headingsFontSize}
                            >
                                {t("residentialHeading")}
                            </TmTypography>
                        </Stack>
                        <Box sx={containerBorderStyle}>
                            <PhysicalAddress
                                disableEdit={!isEditable}
                                displayOptionalFields={displayOptionalFields}
                                setFormDataField={setFormDataField}
                                setFormFieldValidation={setFormFieldValidation}
                                transgressionConfig={transgressionConfig}
                                onComponentFieldChanges={handleDriverFieldChange} //Hackish fix for residential country lookup race condition
                            />
                        </Box>
                    </Box>
                )}

                {/* Business Address Section */}
                {displayBusinessSection(transgressionConfig) && (
                    <Box sx={breakpoints}>
                        <Stack direction={isMiniMobile ? 'column' : 'row'} gap={isMobile ? 5 : 15}>
                            <TmTypography
                                testid={toCamelCaseWords(
                                    "editHeading",
                                    toCamelCase(t("businessAddressHeading"))
                                )}
                                fontWeight="bold"
                                color={theme.palette.primary.main}
                                fontSize={headingsFontSize}
                            >
                                {t("businessAddressHeading")}
                            </TmTypography>
                        </Stack>
                        <Box sx={containerBorderStyle}>
                            <TmBusinessAddressDetails
                                disableEdit={!isEditable}
                                displayOptionalFields={displayOptionalFields}
                                setFormFieldValidation={setFormFieldValidation}
                                transgressionConfig={transgressionConfig}
                                onComponentFieldChanges={handleOperatorFieldChange}
                            />
                        </Box>
                    </Box>
                )}

                {/* Charges Section */}
                <Box sx={breakpoints}>
                    <Stack direction={isMiniMobile ? 'column' : 'row'} gap={isMobile ? 5 : 15}>
                        <TmTypography
                            testid={toCamelCaseWords(
                                "editHeading",
                                toCamelCase(t("chargesHeading"))
                            )}
                            fontWeight="bold"
                            color={theme.palette.primary.main}
                            fontSize={headingsFontSize}
                        >
                            {t("chargesHeading")}
                        </TmTypography>
                    </Stack>
                    <Box sx={containerBorderStyle}>
                        {transgressionType === TransgressionType.OVERLOAD ?
                            <TmChargeList
                                testid={toCamelCaseWords("transgressions", "chargeList")}
                                charges={charges ?? []}
                                vehicleCharges={vehicleCharges ?? []}
                            /> :
                            <TmChargeListEdit
                                captureCharges={chargeList}
                                updateCharges={onUpdateRtqsCharges}
                                charges={rtqsCharges ?? []}
                                onValidate={setChargesValid}
                                disableEdit={!isEditable}
                                supervisorAuthRequired={!isNew}
                                newTransgression={isNew}
                                allowArrestCase={rtqsAllowArrestCase as boolean}
                                arrestCaseFineAmount={rtqsArrestCaseFineAmount}
                                steeringVehiclePlateNumber={plateNumber}
                            />
                        }
                    </Box>
                </Box>

                <Box>
                    <Fragment>
                        <TmDialog
                            testid={"saveDialogMessage"}
                            message={t("saveDialogMessage")}
                            title={t("confirmTitle")}
                            isOpen={props.openDialogState ?? false}
                            showConfirmButton={true}
                            confirmLabel={t("confirm") ?? undefined}
                            confirmIcon={<CheckIcon />}
                            cancelLabel={t("cancel") ?? undefined}
                            cancelIcon={<CancelIcon />}
                            onCancel={props.closeSaveDialog}
                            onConfirm={handleSaveDialogConfirm}
                        />

                        <TmDialog
                            testid={"exitingDialogMessageDialog"}
                            message={t("exitingDialogMessage")}
                            title={t("exitDialogTitle")}
                            isOpen={props.exitDialogState ?? false}
                            showConfirmButton={true}
                            confirmLabel={t("discard") ?? undefined}
                            confirmIcon={<CheckIcon />}
                            cancelLabel={t("cancel") ?? undefined}
                            cancelIcon={<CancelIcon />}
                            onCancel={props.closeExitDialog}
                            onConfirm={handleConfirmDialogConfirm}
                        />
                    </Fragment>
                    <ValidationWarning
                        showValidationSnackbar={showValidationSnackbar}
                        setShowValidationSnackbar={setShowValidationSnackbar}
                    />
                </Box>
            </Box>


            {/* Buttons */}
            <Box sx={{
                display: "flex", flexWrap: "wrap",
                justifyContent: 'right'
            }}>
                {!isEditable && (
                    <Fragment>

                                {/* Show update button */}
                                {(transgressionStatus === TransgressionStatus.CREATED ||
                                    transgressionStatus === TransgressionStatus.ARREST_CASE_CREATED) &&
                                    (AuthService.hasRole('TRANSGRESSION_MAINTAIN')) && (
                                        <TmButton
                                            testid={toCamelCaseWords(
                                                "editHeading",
                                                toCamelCase(t("updateButton"))
                                            )}
                                            size="large"
                                            onClick={onEdit}
                                            startIcon={<EditIcon />}
                                        >
                                            {t("updateButton")}
                                        </TmButton>
                                    )}

                                {/* Show cancel button*/}
                                {(transgressionStatus === TransgressionStatus.CREATED ||
                                    transgressionStatus === TransgressionStatus.ISSUED ||
                                    transgressionStatus === TransgressionStatus.ARREST_CASE_CREATED ||
                                    transgressionStatus === TransgressionStatus.CHARGE_SHEET_PRINTED) &&
                                    (AuthService.hasRole('TRANSGRESSION_MAINTAIN')) && (
                                        <TmButton
                                            testid={toCamelCaseWords(
                                                "editHeading",
                                                toCamelCase(t("cancel"))
                                            )}
                                            startIcon={<DoDisturbIcon />}
                                            size="large"
                                            onClick={props.handleOpenCancelDialog}
                                        >
                                            {t("cancel")}
                                        </TmButton>
                                    )}

                        <TmButton
                            testid={toCamelCaseWords(
                                "editHeading",
                                toCamelCase(t("historyButton"))
                            )}
                            size="large"
                            onClick={props.handleOpenHistoryDialog}
                            startIcon={<HistoryIcon />}
                        >
                            {t("historyButton")}
                        </TmButton>

                                {AuthService.hasRole('TRANSGRESSIONPRINTING_MAINTAIN') && (
                                    <TmButton
                                        testid={toCamelCaseWords("editHeading", toCamelCase(t("printButton")))}
                                        size="large"
                                        startIcon={<PrintIcon />}
                                        onClick={props.handleReprint}
                                    >
                                        {t("print")}
                                    </TmButton>
                                )}
                            </Fragment>
                        )}

                        {isEditable &&
                            (AuthService.hasRole('TRANSGRESSION_MAINTAIN')) && (
                                <TmButton
                                    testid={toCamelCaseWords(
                                        "editHeading",
                                        toCamelCase(t("saveButton"))
                                    )}
                                    type="submit"
                                    size="large"
                                    startIcon={<CheckIcon />}
                                    disabled={!isFormValid() || (!isNew && !form.isDirty) }
                                    onClick={props.handleOpenSaveDialog}
                                >
                                    {t("saveButton")}
                                </TmButton>
                            )}

                <TmButton
                    testid={toCamelCaseWords(
                        "editHeading",
                        toCamelCase(t("exitButton"))
                    )}
                    startIcon={<CancelIcon />}
                    size="large"
                    onClick={props.handleOpenExitDialog}
                >
                    {t("exitButton")}
                </TmButton>
            </Box>
        </Box>
    )
}

type ValidationWarningProps = {
    showValidationSnackbar: boolean;
    setShowValidationSnackbar: Dispatch<SetStateAction<boolean>>;
};

const ValidationWarning = memo<ValidationWarningProps>(
    ({ showValidationSnackbar, setShowValidationSnackbar }) => {
        const { t } = useTranslation();
        return (
            <TmSnackbar
                testid={`ValidationWarningSnackbar`}
                snackbarType="warning"
                message={t("validationWarning")}
                isOpen={showValidationSnackbar}
                onClose={() => setShowValidationSnackbar(false)}
            />
        );
    }
);

export default TransgressionCaptureForm;
