import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle
} from "react";
import { useAppDispatch, useAppSelector } from "../../../../framework/redux/hooks";
import { useLocation } from "react-router-dom";
import useCaptureTransgressionManager from "../../../hooks/prosecution/CaptureTransgressionManager";
import { selectForm, setNewTransgression, transgressionSlice } from "../../../redux/transgression/transgressionSlice";
import TransgressionCaptureForm, { TransgressionCaptureFormLoader } from "../CaptureForm";
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
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CaptureTransgressionPageEdit = forwardRef<VehicleWeighDetailsRef, any>((props: Props, ref) => {
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
    sequenceNo,
    setSequenceNo,
    charges,
    setNewCharges,
    vehicleCharges,
    setVehicleCharges,
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
    overloadTransgressionDetails,
    getOverloadTransgressionInformation,
    newTransgression,
    setShowUpdateOnWeighTooltip,
    transgressionConfig,
    setTransgressionConfig,
    setDrivingLicenceCodeId,
    onUpdateVehicleWeighDetails,
    onGenerateTransgression,
    onEdit,
    onCancel,
    onDisableEdit,
    isOnEditable,
    onGetTransgression,
    onUpdateOverloadTransgression
  } = useCaptureTransgressionManager(handleEdit);

  const { setFormDataField, setFormFieldValidation } = useTransgressionActions();

  useImperativeHandle(ref, () => ({
    onUpdateVehicleWeighDetails,
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
      onGenerateTransgression();
    } else {
      onUpdateOverloadTransgression();
    }
  };

  const handleConfirmDialogConfirm = () => {
    onCancel();
  };

  useEffect(() => {
    if (getOverloadTransgressionInformation &&
      idTypes.options.length > 0
    ) {
      dispatch(setNewTransgression(newTransgression))
      setIsLoading(false);
      dispatch(transgressionSlice.actions.setFormData(getOverloadTransgressionInformation));
      dispatch(transgressionSlice.actions.setInitialFormData(getOverloadTransgressionInformation));
      setNewCharges(getOverloadTransgressionInformation.charges);
      setVehicleCharges(getOverloadTransgressionInformation.vehicleCharges);
      setTransgressionStatus(getOverloadTransgressionInformation.transgressionStatus)
      translateOverloadTransgressionInformation(getOverloadTransgressionInformation);
      if (getOverloadTransgressionInformation.transgressionConfiguration) {
        setTransgressionConfig(getOverloadTransgressionInformation.transgressionConfiguration);
      }
    }
  }, [setIsLoading, setTransgressionConfig, setTransgressionStatus, setNewCharges, setVehicleCharges, getOverloadTransgressionInformation, idTypes, dispatch, translateOverloadTransgressionInformation, newTransgression]);

  // Validation
  useTransgressionValidation();

  useEffect(() => {
    if (isEditable) {
      setShowUpdateOnWeighTooltip(true);
      if (!sequenceNo && overloadTransgressionDetails?.sequenceNumber !== undefined
        && overloadTransgressionDetails?.sequenceNumber !== null
      ) {
        setSequenceNo(overloadTransgressionDetails.sequenceNumber);
      }
      setIsLoading(false);
    }
  }, [setIsLoading, setSequenceNo, setTransgressionConfig, setShowUpdateOnWeighTooltip, sequenceNo, overloadTransgressionDetails, isEditable]);

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
      ]);
    }

    dispatch(transgressionSlice.actions.setFormDataDirty(isDirty));
  }, [
    dispatch,
    businessAddressDetailsChanged,
    residentialAddressDetailsChanged,
    driverDetailsChanged,
    operatorDetailsChanged,
    vehicleDetailsChanged,
    form,
    location,
    newTransgression,
  ]);

  return (
    <Box sx={{
      display: "flex", flexWrap: "wrap", width: "100%"
    }}>
      {
        isLoading ? <TransgressionCaptureFormLoader></TransgressionCaptureFormLoader> :
          <TransgressionCaptureForm
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
            isNew={newTransgression}
            transgressionType={TransgressionType.OVERLOAD}
            charges={charges}
            vehicleCharges={vehicleCharges}
          />
      }
    </Box>
  );
})

export default memo(CaptureTransgressionPageEdit);
