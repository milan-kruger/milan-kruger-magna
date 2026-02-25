import {
    Dispatch,
    forwardRef,
    memo,
    SetStateAction,
    useCallback,
    useEffect,
    useImperativeHandle,
} from "react";
import { useAppDispatch, useAppSelector } from "../../../../framework/redux/hooks";
import { SnapshotRtqsCharge } from "../../../redux/api/transgressionsApi";
import { useLocation } from "react-router-dom";
import { TmRtqsCharge } from "../../../components/prosecution/ChargeListEdit";
import { RtqsChargePlaceholder } from "../../../hooks/chargebook/ChargeProvider";
import { selectForm, setNewTransgression, transgressionSlice } from "../../../redux/transgression/transgressionSlice";
import TransgressionCaptureForm, { TransgressionCaptureFormLoader } from "../CaptureForm";
import useRtqsTransgressionManager from "../../../hooks/prosecution/RtqsTransgressionManager";
import { TransgressionType } from "../../../enum/TransgressionType";
import { useTransgressionActions } from "../../../utils/TransgressionActions";
import { useTransgressionValidation } from "../../../utils/TransgressionValidation";
import { isFormDataDirty } from "../../../utils/TransgressionHelpers";
import { Box } from "@mui/material";
import { VehicleWeighDetailsRef } from "../../../utils/transgression-details";

type Props = {
    exitDialogState?: boolean;
    openDialogState?: boolean;
    handleOpenSaveDialog?: () => void;
    handleOpenExitDialog?: () => void;
    handleOpenHistoryDialog?: () => void;
    handleReprint?: () => void;
    closeSaveDialog?: () => void;
    closeExitDialog?: () => void;
    handleDiscardConfirmDialog?: () => void;
    handleOpenCancelDialog?: () => void;
    handleEdit?: (isEditing: boolean) => void;
    setFormChargesValid?: Dispatch<SetStateAction<boolean>>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CaptureRtqsTransgressionPageEdit = forwardRef<VehicleWeighDetailsRef, any>((props: Props, ref) => {
    const { handleEdit } = props;
    const location = useLocation();

    // Redux
    const dispatch = useAppDispatch();

    // States
    const form = useAppSelector(selectForm);

    const {
        idTypes,
        getIdTypeValue,
        translateOverloadTransgressionInformation,
        lookupVehicleConfiguration,
        lookupDriverDetails,
        lookupOperatorDetails,
        charges,
        allowArrestCase,
        arrestCaseFineAmount,
        isEditable,
        setSupervisor,
        isLoading,
        setIsLoading,
        showValidationSnackbar,
        setShowValidationSnackbar,
        transgressionStatus,
        setTransgressionStatus,
        getOfficersName,
        getPlateNumber,
        vehicleDetailsChanged,
        operatorDetailsChanged,
        driverDetailsChanged,
        residentialAddressDetailsChanged,
        businessAddressDetailsChanged,
        chargeDetailsChanged,
        getRtqsTransgressionInformation,
        newTransgression,
        transgressionConfig,
        setTransgressionConfig,
        setDrivingLicenceCodeId,
        onGenerateRtqsTransgression,
        onEdit,
        onCancel,
        onDisableEdit,
        isOnEditable,
        onGetTransgression,
        onUpdateRtqsTransgression,
        refreshingRtqsDetails
    } = useRtqsTransgressionManager(handleEdit);

    const { setFormDataField, setFormFieldValidation } = useTransgressionActions();

    useImperativeHandle(ref, () => ({
        onEdit,
        onGetTransgression,
        onDisableEdit,
        isOnEditable
    }));

    const handleSaveDialogConfirm = () => {
        if (props.closeSaveDialog) {
            props.closeSaveDialog();
        }
        setIsLoading(true);
        if (newTransgression) {
            onGenerateRtqsTransgression();
        } else {
            onUpdateRtqsTransgression();
        }
    };

    const handleConfirmDialogConfirm = () => {
        onCancel();
    };

    useEffect(() => {
        if (getRtqsTransgressionInformation &&
            idTypes.options.length > 0
        ) {
            dispatch(setNewTransgression(newTransgression))
            setIsLoading(false);
            dispatch(transgressionSlice.actions.setFormData(getRtqsTransgressionInformation.current));
            dispatch(transgressionSlice.actions.setInitialFormData(getRtqsTransgressionInformation.current));
            setTransgressionStatus(getRtqsTransgressionInformation.current.transgressionStatus)
        }
    }, [setIsLoading, setTransgressionConfig, setTransgressionStatus, getRtqsTransgressionInformation, idTypes, dispatch, translateOverloadTransgressionInformation, newTransgression]);

    // Validation
    useTransgressionValidation();

    useEffect(() => {
        let isDirty = true;
        if (!newTransgression) {
            const initialFormData = location.state.transgressionDetails;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const formData = form.formData as any;

            isDirty = isFormDataDirty(formData, initialFormData, [
                vehicleDetailsChanged,
                operatorDetailsChanged,
                driverDetailsChanged,
                residentialAddressDetailsChanged,
                businessAddressDetailsChanged,
                chargeDetailsChanged
            ]);
        }

        dispatch(transgressionSlice.actions.setFormDataDirty(isDirty));
    }, [
        dispatch,
        businessAddressDetailsChanged,
        chargeDetailsChanged,
        residentialAddressDetailsChanged,
        driverDetailsChanged,
        operatorDetailsChanged,
        vehicleDetailsChanged,
        form,
        location,
        newTransgression,
    ]);

    const mappedRtqsCharges = useCallback(() => {
        const retrievedCharges = (getRtqsTransgressionInformation.current.charges as SnapshotRtqsCharge[]);
        const rs: TmRtqsCharge[] = [];

        retrievedCharges.forEach((charge) => {
            if (charge?.alternativeCharge && retrievedCharges.length < 3) {
                rs.push({ ...RtqsChargePlaceholder, isNew: true, isAlternative: false, supervisorApproval: false, chargePrevSupervisorApproval: false, updatedInSession: false });
            }

            const actualCharge = charges?.find(ch => ch.chargeCode === charge.chargeCode);

            const tmRtqsCharge: TmRtqsCharge = {
                ...RtqsChargePlaceholder,
                isAlternative: charge.alternativeCharge ?? false,
                fineAmount: charge.fineAmount,
                chargeId: charge.chargeId,
                chargeCode: charge.chargeCode,
                isNew: false,
                chargeTitle: charge.chargeTitle,
                plateNumber: charge.plateNumber,
                linkedTo: charge.mainChargeCode,
                linkedToIndex: charge.mainChargeCode ? retrievedCharges.findIndex(ch => ch.chargeCode === charge.mainChargeCode) : undefined,
                supervisorApproval: false,
                chargePrevSupervisorApproval: false,
                actualCharge: actualCharge,
                allowedHeight: charge.allowedHeight,
                vehicleHeight: charge.vehicleHeight,
                updatedInSession: false // Loaded from backend, not updated in this session
            }

            rs.push(tmRtqsCharge);
        })

        return rs.concat(Array(3 - rs.length).fill(RtqsChargePlaceholder).map(ch => {
            const mapped: TmRtqsCharge = {
                ...ch,
                isNew: true,
                updatedInSession: false
            }
            return mapped;
        }));
    }, [getRtqsTransgressionInformation, charges]);


    const rtqsCharges: TmRtqsCharge[] = newTransgression ? Array(3).fill(RtqsChargePlaceholder).map(ch => {
        const mapped: TmRtqsCharge = {
            ...ch,
            isNew: true,
            updatedInSession: false
        }
        return mapped;
    }) : mappedRtqsCharges();

    return (
        <Box sx={{
            display: "flex", flexWrap: "wrap"
        }}>
            {
                (charges && !isLoading && !refreshingRtqsDetails) ? <TransgressionCaptureForm
                    form={form}
                    props={props}
                    isEditable={isEditable}
                    getIdTypeValue={getIdTypeValue}
                    handleConfirmDialogConfirm={props.handleDiscardConfirmDialog ?? handleConfirmDialogConfirm}
                    handleSaveDialogConfirm={handleSaveDialogConfirm}
                    idTypes={idTypes}
                    lookupDriverDetails={lookupDriverDetails}
                    lookupOperatorDetails={lookupOperatorDetails}
                    lookupVehicleConfiguration={lookupVehicleConfiguration}
                    officerName={getOfficersName()}
                    plateNumber={getPlateNumber()}
                    onEdit={onEdit}
                    setDrivingLicenceCodeId={setDrivingLicenceCodeId}
                    setFormDataField={setFormDataField}
                    setFormFieldValidation={setFormFieldValidation}
                    setShowValidationSnackbar={setShowValidationSnackbar}
                    showValidationSnackbar={showValidationSnackbar}
                    transgressionConfig={transgressionConfig}
                    setSupervisor={setSupervisor}
                    transgressionStatus={transgressionStatus}
                    captureCharges={rtqsCharges}
                    isNew={newTransgression}
                    transgressionType={TransgressionType.RTQS}
                    rtqsCharges={charges}
                    rtqsAllowArrestCase={allowArrestCase}
                    rtqsArrestCaseFineAmount={arrestCaseFineAmount}
                    setFormChargesValid={props.setFormChargesValid}
                /> : <TransgressionCaptureFormLoader></TransgressionCaptureFormLoader>
            }
        </Box>
    );
})

export default memo(CaptureRtqsTransgressionPageEdit);
