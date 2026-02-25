import { Box, Theme, useMediaQuery } from "@mui/material";
import TmIconButton from "../../../framework/components/button/TmIconButton";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelectorShallow } from "../../../framework/redux/hooks";
import { TransgressionConfiguration } from "../../redux/api/transgressionsApi";
import {
    ChangeEvent,
    ReactNode,
    SyntheticEvent,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { containsSpecialCharacters, fieldsWidth, toCamelCaseWords } from "../../../framework/utils";
import SmartLookup from "./SmartLookup";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import { GetLookupsApiArg, LookupResponse, useGetLookupsQuery } from "../../redux/api/coreApi";
import { useDebouncedCallback } from "use-debounce";
import { selectVehicleDetailsData, setVehicleMake } from "../../redux/transgression/transgressionSlice";
import { MIN_LOOKUP_PAGE_SIZE } from '../../../framework/components/list/util';
import { TransgressionValidation } from "../../redux/transgression/TransgressionValidation";
import EditIcon from '@mui/icons-material/Edit';

import SmartTextfield from "./SmartTextfield";
import TmAuthenticationDialog from "../../../framework/components/dialog/TmAuthenticationDialog";
import useSupervisorAuthorizationManager from "../../hooks/SupervisorAuthorizationManager";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckIcon from '@mui/icons-material/Check';
import TmDialog from "../../../framework/components/dialog/TmDialog";
import CancelIcon from "@mui/icons-material/Cancel";
import Constants from "../../utils/Constants";
import { TransgressionType } from "../../enum/TransgressionType";
import AuthService from "../../../framework/auth/authService";
import { displayField, helperTextMessage } from "../../utils/TransgressionHelpers.tsx";

const testIdPrefix = "captureTransgression";

const AUTHORIZATION_ROLE = 'ROLE_UPDATETRANSGRESSION_OVERRIDE';
const AUTHORIZATION_REASON = 'Update Transgression';

type Props = {
  disableEdit: boolean,
  setFormDataField: (fieldKey: string, fieldValue: string | undefined) => void;
  setFormFieldValidation: (fieldKey: keyof TransgressionValidation, fieldValue: boolean | "" | undefined) => void;
  supervisorAuthorizationRequired: boolean;
  setSupervisor: (username: string) => void;
  transgressionConfig?: TransgressionConfiguration;
  onComponentFieldChanges?: () => void;
  transgressionType: TransgressionType;
  displayOptionalFields: boolean;
};

function VehicleDetails({ disableEdit, setFormDataField, setFormFieldValidation, supervisorAuthorizationRequired,
  setSupervisor, transgressionConfig, onComponentFieldChanges, transgressionType, displayOptionalFields }: Readonly<Props>) {
  const { onSupervisorAuthorization, isError: isErrorAuthentication } = useSupervisorAuthorizationManager();
  const [isSupervisorAuthDialogOpen, setIsSupervisorAuthDialogOpen] = useState(false);
  const [supervisorUsername, setSupervisorUsername] = useState<string>('');
  const [supervisorPassword, setSupervisorPassword] = useState<string>('');
  const [notApproved, setNotApproved] = useState(false);
  const [plateNoDisabled, setPlateNoDisabled] = useState(true);

  const handleSupervisorAuthDialogClose = () => {
    setSupervisorUsername('');
    setSupervisorPassword('');
    setIsSupervisorAuthDialogOpen(false);
  }

  const handleSupervisorAuthConfirm = () => {
    onSupervisorAuthorization(supervisorUsername, supervisorPassword, AUTHORIZATION_ROLE, AUTHORIZATION_REASON)
      .then((response) => {
        if (response) {
          setNotApproved(false);
          setSupervisor(supervisorUsername);
          handleSupervisorAuthDialogClose();
          setPlateNoDisabled(false);
        } else {
          setNotApproved(true);
        }
      });
  }

  const [updateAuthErrorDialogVisible, setUpdateAuthErrorDialogVisible] = useState(false);

  const handleCloseAuthErrorDialog = useCallback(() => {
    setUpdateAuthErrorDialogVisible(false);
  }, []);

  const handleOnEditPlateNo = () => {
    if (!disableEdit) setIsSupervisorAuthDialogOpen(true);
  }


  const { t } = useTranslation();
  const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

  const [vehicleModelRequest, setVehicleModelRequest] = useState<GetLookupsApiArg>({
    lookupType: "VEHICLE_MODEL",
    parentId: -1,
    page: 0,
    pageSize: MIN_LOOKUP_PAGE_SIZE,
    sortDirection: 'ASC',
    sortFields: ['lookupType', 'lookupValue'],
    isValid: true
  });
  const [originRequired, setOriginRequired] = useState(false);
  const [destinationRequired, setDestinationRequired] = useState(false);

  const { data: vehicleModelResponse } = useGetLookupsQuery(vehicleModelRequest);
  const dispatch = useAppDispatch();
  // const form = useAppSelector(selectForm);

  // Using shallowEqual prevents re-renders when unrelated form fields change
  const vehicleData = useAppSelectorShallow(selectVehicleDetailsData);

  // Extract data from consolidated selector
  const {
    plateNumber: formPlateNo,
    vehicleMake: formVehicleMake,
    vehicleModel: formVehicleModel,
    vehicleType: formVehicleType,
    colour: formVehicleColor,
    originOfCargo: formVehicleOrigin,
    destinationOfCargo: formVehicleDestination,
    cargo: formCargo,
    plateNumberError: formPlateNoError,
    vehicleMakeError: formVehicleMakeError,
    vehicleModelError: formVehicleModelError,
    vehicleTypeError: formVehicleTypeError,
    vehicleColorError: formVehicleColorError,
    originOfCargoError: formOriginCargoError,
    destinationOfCargoError: formDestinationOfCargoError,
    cargoError: formCargoError,
    vehicleMakeValue
  } = vehicleData;

  // Vehicle model
  const modelsList = useMemo(() => {
    return {
      options:
        vehicleModelResponse?.content ? vehicleModelResponse.content : [],
      getOptionLabel: (option: LookupResponse) => t(option.lookupCode) + " - " + t(option.lookupValue),
    };
  }, [vehicleModelResponse, t]);

  const getModelsValue = useCallback((lookupValue: string | undefined) => {
    if (modelsList) {
      return modelsList.options.find((vehicleModel: LookupResponse) => {
        return vehicleModel.lookupValue.toLowerCase() === lookupValue?.toLowerCase() ? vehicleModel : null;
      })
    }
    return null;
  }, [modelsList])

  // onChange callBacks
  const onChangeVehicleModel = useCallback((_event: SyntheticEvent<Element, Event>, value: LookupResponse | null) => {
    setFormDataField('vehicleConfiguration.vehicles.0.vehicleModel', value ? value.lookupValue : undefined);
  }, [setFormDataField]);

  const getSearchValue = (value: string | undefined) => {
    let searchValue = "";
    if (value) {
      if (value.includes(" - ")) {
        searchValue = value.split("-", 2)[1].replace(" ", "");
      } else {
        searchValue = value.trim();
      }
    }

    return searchValue
  }

  const onVehicleModelInputChange = useDebouncedCallback(
    (_event: React.SyntheticEvent<Element, Event>, value: string | undefined) => {
      const searchValue = getSearchValue(value);
      if (vehicleModelRequest.searchValue !== searchValue) {
        setVehicleModelRequest({
          ...vehicleModelRequest,
          parentId: searchValue.toLowerCase() === 'other' ? undefined : vehicleModelRequest.parentId,
          page: 0,
          searchValue: searchValue,
        });
      }
    },
    500
  );

  useEffect(() => {
    const updateVehicleModelRequest = () => {
      const parentId = vehicleMakeValue?.id;

      if (parentId) {
        setVehicleModelRequest({
          parentId,
          lookupType: 'VEHICLE_MODEL',
          page: 0,
          pageSize: MIN_LOOKUP_PAGE_SIZE,
          sortDirection: 'ASC',
          sortFields: ['lookupType', 'lookupValue']
        });
      }

      if (formVehicleMake === null || !formVehicleMake) {
        setFormDataField('vehicleConfiguration.vehicles.0.vehicleModel', undefined);
        modelsList.options = [];
        getModelsValue('');
      }
    };

    const initializeVehicleModelRequest = () => {
      setVehicleModelRequest((prevRequest) => ({
        ...prevRequest,
        page: 0,
      }));
      updateVehicleModelRequest();
    };

    if (vehicleModelResponse && vehicleMakeValue) {
      updateVehicleModelRequest();
    } else {
      initializeVehicleModelRequest();
    }
  }, [
    vehicleModelResponse,
    modelsList,
    getModelsValue,
    formVehicleModel,
    setFormDataField,
    vehicleMakeValue,
    formVehicleMake
  ]);

  // Validate
  const invalidVehicleMake = transgressionConfig?.vehicleMake && (formVehicleMake === '' || !formVehicleMake);
  const invalidVehicleModel = transgressionConfig?.vehicleModel && (formVehicleModel === '' || !formVehicleModel);
  const invalidPlateNo = formPlateNo === '' || !formPlateNo || (formPlateNo && containsSpecialCharacters(formPlateNo)); //Plate number is always mandatory
  const invalidVehicleType = transgressionConfig?.vehicleType && (formVehicleType === '' || !formVehicleType);
  const invalidColor = transgressionConfig?.colour && (formVehicleColor === '' || !formVehicleColor);
  const invalidOrigin = transgressionConfig?.origin && (formVehicleOrigin === '' || !formVehicleOrigin);
  const invalidDestination = transgressionConfig?.destination && (formVehicleDestination === '' || !formVehicleDestination);
  const invalidCargo = transgressionConfig?.cargo && (formCargo === '' || !formCargo)

  useEffect(() => {
    setFormFieldValidation('plateNumberError', invalidPlateNo);
    setFormFieldValidation('vehicleMakeError', invalidVehicleMake);
    setFormFieldValidation('vehicleModelError', invalidVehicleModel);
    setFormFieldValidation('vehicleTypeError', invalidVehicleType);
    setFormFieldValidation('vehicleColorError', invalidColor);
    setFormFieldValidation('originOfCargoError', invalidOrigin);
    setFormFieldValidation('destinationOfCargoError', invalidDestination);
    setFormFieldValidation('cargoError', invalidCargo);
  }, [setFormFieldValidation, invalidPlateNo, invalidVehicleMake, invalidVehicleModel,
    invalidColor, invalidOrigin, invalidDestination, invalidCargo, invalidVehicleType]);

  useEffect(() => {
    onComponentFieldChanges?.();
  }, [
    formVehicleMake,
    formVehicleColor,
    formVehicleOrigin,
    formVehicleDestination,
    formCargo,
    formVehicleType,
    onComponentFieldChanges,
  ]);

  const [vehicleMakeLookup, setVehicleMakeLookup] = useState<LookupResponse | LookupResponse[] | null>(null);
  useEffect(() => {
    if (formVehicleMake && formVehicleMake?.trim().length > 0 && vehicleMakeLookup) {
      dispatch(setVehicleMake(vehicleMakeLookup));
    }
  }, [formVehicleMake, vehicleMakeLookup, dispatch]);

  const editIdFieldsStyle = useMemo(() => ({
    top: 0,
    position: 'absolute',
    width: '10%',
    left: '90%'
  }), []);

  useEffect(() => {
    // Ignore validation if origin or destination fields are not displayed
    if(!displayField(displayOptionalFields, transgressionConfig?.origin) ||
      !displayField(displayOptionalFields, transgressionConfig?.destination)) {
      return;
    }

    // Origin and Destination to be tied together on capturing
    const originEmpty = !formVehicleOrigin || formVehicleOrigin?.length === 0;
    const destinationEmpty = !formVehicleDestination || formVehicleDestination.length === 0;

    // If origin or destination is not empty or transgressionConfig requires it, then both fields are required
    const isOriginRequired = originEmpty && (!destinationEmpty || transgressionConfig?.origin as boolean);
    const isDestinationRequired = destinationEmpty && (!originEmpty || transgressionConfig?.destination as boolean);

    setOriginRequired(isOriginRequired);
    setDestinationRequired(isDestinationRequired);

    setFormFieldValidation('originOfCargoError', isOriginRequired);
    setFormFieldValidation('destinationOfCargoError', isDestinationRequired);

  }, [formVehicleOrigin, formVehicleDestination, setFormFieldValidation, transgressionConfig, displayOptionalFields]);

  // RENDER
  return (
    <Box sx={{ display: isMobile ? 'initial' : 'flex', minHeight: 30, mb: '10px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mr: '-1px', flex: 'auto' }}>
        <Box alignSelf={'start'} flexGrow={2}>
          <Box sx={{
            columnGap: isMobile ? 5 : 10,
            display: 'flex',
            flexFlow: 'wrap'
          }}>

            {transgressionType === TransgressionType.RTQS && AuthService.isFeatureEnabled('RTQS_TRANSGRESSIONS')
              && <>
                <Box position={'relative'} width={fieldsWidth(isMobile)}>
                  <SmartTextfield
                    testid={toCamelCaseWords(testIdPrefix, 'plateNumber')}
                    label={t('plateNumber')}
                    fieldKey={"vehicleConfiguration.vehicles.0.plateNumber"}
                    fieldValue={formPlateNo}
                    required={!disableEdit}
                    helperText={helperTextMessage(formPlateNoError, formPlateNo, "plateNumber", disableEdit, t)}
                    disabled={supervisorAuthorizationRequired && (disableEdit || plateNoDisabled)}
                    readonly={false}
                    error={!disableEdit && formPlateNoError}
                    fieldType={"text"}
                    maxLength={Constants.plateNumberMaxLength}
                    removeSpaces={true}
                    checkForSpecialCharacters={true}
                    errorKey="plateNumberError"
                  />
                  {
                    (supervisorAuthorizationRequired && plateNoDisabled) && <TmIconButton
                      testid="editPlateNoButton"
                      size="small"
                      disabled={disableEdit}
                      onClick={handleOnEditPlateNo}
                      sx={editIdFieldsStyle}
                    >
                      <EditIcon fontSize="inherit" />
                    </TmIconButton>
                  }
                </Box>

                { displayField(displayOptionalFields, transgressionConfig?.vehicleType) && (
                  <SmartLookup
                    testid={toCamelCaseWords(testIdPrefix, 'vehicleType')}
                    label={t('vehicleType')}
                    required={!disableEdit && transgressionConfig?.vehicleType}
                    lookupType="VEHICLE_TYPE"
                    disabled={disableEdit}
                    readonly={false}
                    fieldKey="vehicleConfiguration.vehicles.0.vehicleType"
                    fieldValue={formVehicleType}
                    error={!disableEdit && formVehicleTypeError}
                    helperText={helperTextMessage(formVehicleTypeError, formVehicleType, "vehicleType", disableEdit, t)}
                  />
                )}
              </>
            }

            { displayField(displayOptionalFields, transgressionConfig?.vehicleMake) && (
              <SmartLookup
                testid={toCamelCaseWords(testIdPrefix, 'vehicleMake')}
                label={t('vehicleMake')}
                required={!disableEdit && transgressionConfig?.vehicleMake}
                lookupType="VEHICLE_MAKE"
                disabled={disableEdit}
                readonly={false}
                fieldKey="vehicleConfiguration.vehicles.0.vehicleMake"
                fieldValue={formVehicleMake}
                error={!disableEdit && formVehicleMakeError}
                helperText={helperTextMessage(formVehicleMakeError, formVehicleMake, "vehicleMake", disableEdit, t)}
                setLookupValue={setVehicleMakeLookup}
              />
            )}

            { displayField(displayOptionalFields, transgressionConfig?.vehicleModel) && (
              <TmAutocomplete
                {...modelsList}
                label={t('vehicleModel')}
                testid={toCamelCaseWords(testIdPrefix, 'vehicleModel')}
                value={getModelsValue(formVehicleModel) ?? null}
                onChange={onChangeVehicleModel}
                onInputChange={onVehicleModelInputChange}
                disabled={disableEdit}
                readonly={false}
                required={!disableEdit && transgressionConfig?.vehicleModel}
                renderInput={(): ReactNode => { return }}
                error={!disableEdit && formVehicleModelError}
                isOptionEqualToValue={(option, value) => option.lookupValue === value.lookupValue}
                helperText={helperTextMessage(formVehicleModelError, formVehicleModel, "vehicleModel", disableEdit, t)}
                alternative={true}
                sx={{
                  width: fieldsWidth(isMobile),
                  '& .MuiFormHelperText-root': {
                    marginTop: 0,
                    lineHeight: 1.1,
                  }
                }}
              />
            )}

            { displayField(displayOptionalFields, transgressionConfig?.colour) && (
              <SmartLookup
                testid={toCamelCaseWords(testIdPrefix, 'vehicleColour')}
                label={t('vehicleColour')}
                required={!disableEdit && transgressionConfig?.colour}
                lookupType="VEHICLE_COLOUR"
                disabled={disableEdit}
                readonly={false}
                error={!disableEdit && formVehicleColorError}
                helperText={helperTextMessage(formVehicleColorError, formVehicleColor, "vehicleColour", disableEdit, t)}
                fieldKey="vehicleConfiguration.vehicles.0.colour"
                fieldValue={formVehicleColor}
              />
            )}

            { displayField(displayOptionalFields, transgressionConfig?.origin) && (
              <SmartLookup
                testid={toCamelCaseWords(testIdPrefix, 'origin')}
                label={t('origin')}
                required={!disableEdit && (transgressionConfig?.origin || originRequired)}
                lookupType="ORIGIN_DESTINATION"
                disabled={disableEdit}
                readonly={false}
                error={!disableEdit && (formOriginCargoError || originRequired)}
                helperText={helperTextMessage(formOriginCargoError, formVehicleOrigin, "origin", disableEdit, t)}
                fieldKey="route.originOfCargo"
                fieldValue={formVehicleOrigin}
              />
            )}

            { displayField(displayOptionalFields, transgressionConfig?.destination) && (
              <SmartLookup
                testid={toCamelCaseWords(testIdPrefix, 'destination')}
                label={t('destination')}
                required={!disableEdit && (transgressionConfig?.destination || destinationRequired)}
                lookupType="ORIGIN_DESTINATION"
                disabled={disableEdit}
                readonly={false}
                error={!disableEdit && (formDestinationOfCargoError || destinationRequired)}
                helperText={helperTextMessage(formDestinationOfCargoError, formVehicleDestination, "destination", disableEdit, t)}
                fieldKey="route.destinationOfCargo"
                fieldValue={formVehicleDestination}
              />
            )}

            { displayField(displayOptionalFields, transgressionConfig?.cargo) && (
              <SmartLookup
                testid={toCamelCaseWords(testIdPrefix, 'cargo')}
                label={t('cargo')}
                required={!disableEdit && transgressionConfig?.cargo}
                lookupType="CARGO_TYPE"
                disabled={disableEdit}
                readonly={false}
                error={!disableEdit && formCargoError}
                helperText={helperTextMessage(formCargoError, formCargo, "cargo", disableEdit, t)}
                fieldKey="route.cargo"
                fieldValue={formCargo}
              />
            )}
          </Box>
        </Box>
      </Box>

      <TmAuthenticationDialog
        testid="driverDetailsSupervisorAuthDialog"
        isOpen={isSupervisorAuthDialogOpen}
        onCancel={handleSupervisorAuthDialogClose}
        title={t('updateNotice')}
        message={t('updateNoticeSubTitleSuffix', { suffix: t('plateNumberField') })}
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
    </Box >

  )
}

export default memo(VehicleDetails)
