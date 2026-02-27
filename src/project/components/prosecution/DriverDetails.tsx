import { Box, useMediaQuery, Theme, Grid } from "@mui/material";
import {
  TransgressionConfiguration
} from "../../redux/api/transgressionsApi";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelectorShallow } from "../../../framework/redux/hooks";
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
import toCamelCase, { containsSpecialCharacters, fieldsWidth, toCamelCaseWords } from "../../../framework/utils";
import TmTextField from "../../../framework/components/textfield/TmTextField";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import {
  GetLookupsApiArg,
  IdTypeResponse,
  LookupResponse,
  useGetLookupsQuery
} from "../../redux/api/coreApi";
import TmDatePicker from "../../../framework/components/textfield/date-time/TmDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { NumericFormat } from "react-number-format";
import { IDType } from "../../../framework/utils/IDType";
import SmartLookup from "./SmartLookup";
import SmartTextfield from "./SmartTextfield";
import { useDebouncedCallback } from "use-debounce";
import { selectDriverDetailsData, setDriverLicenseCountryOfIssue } from "../../redux/transgression/transgressionSlice";
import EditIcon from '@mui/icons-material/Edit';
import TmAuthenticationDialog from "../../../framework/components/dialog/TmAuthenticationDialog";
import TmIconButton from "../../../framework/components/button/TmIconButton";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import CheckIcon from '@mui/icons-material/Check';
import useIdValidationManager from "../../utils/IdValidationManager";
import TmDialog from "../../../framework/components/dialog/TmDialog";
import CancelIcon from "@mui/icons-material/Cancel";
import { MIN_LOOKUP_PAGE_SIZE } from '../../../framework/components/list/util';
import { TransgressionValidation } from "../../redux/transgression/TransgressionValidation";
import useSupervisorAuthorizationManager from "../../hooks/SupervisorAuthorizationManager";
import { displayField, helperTextMessage } from "../../utils/TransgressionHelpers";
import TmCountrySelector from "../../../framework/components/textfield/country-selector/TmCountrySelector";

const testIdPrefix = "captureTransgression";

const AUTHORIZATION_ROLE = 'ROLE_UPDATETRANSGRESSION_OVERRIDE';
const AUTHORIZATION_REASON = 'Update Transgression';

type Props = {
  disableEdit: boolean;
  setFormDataField: (
    fieldKey: string,
    fieldValue: string | number | boolean | null | undefined
  ) => void;
  setFormFieldValidation: (
    fieldKey: keyof TransgressionValidation,
    fieldValue: boolean | "" | undefined
  ) => void;
  transgressionConfig?: TransgressionConfiguration;
  idTypes: {
    options: IdTypeResponse[];
    getOptionLabel: (option: IdTypeResponse) => string;
  };
  getIdTypeValue: (idTypeName: string | null | undefined) => IdTypeResponse | undefined | null;
  setSupervisor: (username: string) => void;
  onComponentFieldChanges?: () => void;
  setDrivingLicenceCodeId?: (licenceCodeId: string | undefined) => void;
  displayOptionalFields: boolean;
};

const DriverDetails = memo(
  ({
    disableEdit,
    setFormDataField,
    setFormFieldValidation,
    transgressionConfig,
    idTypes,
    getIdTypeValue,
    setSupervisor,
    onComponentFieldChanges,
    setDrivingLicenceCodeId,
    displayOptionalFields
  }: Props) => {
    const { t } = useTranslation();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const [isSupervisorAuthDialogOpen, setIsSupervisorAuthDialogOpen] = useState(false);
    const [isIdentificationDisabled, setIsIdentificationDisabled] = useState(true);
    const [notApproved, setNotApproved] = useState(false);

    const [validateIdResponse, validateId, setValidateIdResponse] = useIdValidationManager();
    const dispatch = useAppDispatch();
    const { onSupervisorAuthorization, isError: isErrorAuthentication } = useSupervisorAuthorizationManager();

    const [selectedLicenceCode, setSelectedLicenceCode] = useState<LookupResponse | null>(null);

    const NON_PAGINATING_PAGE_LIMIT = 999;

    const editIdFieldsStyle = useMemo(() => ({
      position: 'absolute',
      top: '-10%',
      right: 0,
      transform: 'translateY(-10%)',
      width: '10%'
    }), []);

    const [licenceCodeRequest, setLicenceCodeRequest] = useState<GetLookupsApiArg>({
      lookupType: "DRIVING_LICENSE_CODE",
      parentId: -1,
      page: 0,
      pageSize: MIN_LOOKUP_PAGE_SIZE,
      sortDirection: 'ASC',
      sortFields: ['lookupType', 'lookupValue'],
      isValid: true
    });

    const [supervisorUsername, setSupervisorUsername] = useState<string>('');
    const [supervisorPassword, setSupervisorPassword] = useState<string>('');

    const [updateAuthErrorDialogVisible, setUpdateAuthErrorDialogVisible] = useState(false);

    const handleCloseAuthErrorDialog = useCallback(() => {
      setUpdateAuthErrorDialogVisible(false);
    }, []);

    const { data: licenceCodeResponse } = useGetLookupsQuery(licenceCodeRequest);

    // Lookups API Calls
    const dialingCodesRequest: GetLookupsApiArg = {
      lookupType: "DIALING_CODE",
      page: 0,
      pageSize: NON_PAGINATING_PAGE_LIMIT,
      sortDirection: "ASC",
      sortFields: ["lookupType", "lookupValue"],
      isValid: true
    };
    const { data: dialingCodesResponse } = useGetLookupsQuery(dialingCodesRequest);

    // Lookups API Calls
    const countriesRequest: GetLookupsApiArg = {
      lookupType: 'COUNTRY',
      page: 0,
      pageSize: NON_PAGINATING_PAGE_LIMIT,
      sortDirection: 'ASC',
      sortFields: ['lookupType', 'lookupValue'],
      isValid: true
    }
    const { data: countriesResponse } = useGetLookupsQuery(countriesRequest);

    const licenceCodes = useMemo(() => {
      return {
        options:
          licenceCodeResponse?.content ?? [],
        getOptionLabel: (option: LookupResponse) => t(option.lookupCode) + " - " + t(option.lookupValue),
      };
    }, [licenceCodeResponse, t]);

    const getLicenceCodeValue = useCallback((lookupValue: string | undefined) => {
      if (licenceCodes && typeof lookupValue === 'string') {
        const lookupValueLower = lookupValue.toLowerCase();
        const licenceCode = licenceCodes.options.find((code: LookupResponse) => {
          return code.lookupValue.toLowerCase() === lookupValueLower ||
            code.lookupCode.toLowerCase() === lookupValueLower;
        });
        return licenceCode || null;
      }
      return null;
    }, [licenceCodes]);

    // Lookups dropdown values
    const countries = useMemo(() => {
      return {
        options:
          countriesResponse?.content ?? [],
        getOptionLabel: (option: LookupResponse) => option.lookupCode + ' - ' + t(option.lookupValue),
      };
    }, [countriesResponse, t]);

    const findCountryLabel = useCallback(
      (dialingCode: LookupResponse) => {
        const country = {
          ...countries.options.find((country) => {
            return country.lookupCode === dialingCode.lookupCode;
          }),
        };
        return country?.lookupValue;
      },
      [countries.options]
    );

    // Using shallowEqual prevents re-renders when unrelated form fields change
    const driverData = useAppSelectorShallow(selectDriverDetailsData);

    // Extract data from consolidated selector
    const {
      firstNames: formDriverName,
      surname: formDriverSurname,
      dateOfBirth: formDriverDateOfBirth,
      gender: formDriverGender,
      occupation: formDriverOccupation,
      idType: formDriverIdType,
      idNumber: rawIdNumber,
      idCountryOfIssue: formDriverCountryOfIssueByBirth,
      contactNumberType: formContactNumberType,
      contactNumber: formDriverContactNumber,
      dialingCode: formDialingCodeLookup,
      licenceCode: formDriverLicenceCode,
      licenceNumber: formDriverLicenceNo,
      countryOfIssue: formDriverCountryOfIssue,
      prDPCodes: formDriverPrdpCode,
      prDPNumber: formDriverPrdpNo,
      firstNamesError: formFirstNameError,
      surnameError: formSurnameError,
      dateOfBirthError: formDateOfBirthError,
      genderLookupError: formGenderError,
      occupationError: formDriverOccupationError,
      identificationTypeLookupError: formIdTypeError,
      identificationNumberError: formIdNumberError,
      identificationCountryOfIssueError: formIdCountryOfIssueError,
      contactNumberTypeError: formContactNumberTypeError,
      contactNumberError: formContactNumberError,
      contactDialingCodeError: formDialingCodeLookupError,
      licenceCodeError: formDriverLicenceCodeError,
      licenceNoError: formDriverLicenceNoError,
      driverCountryOfIssueError: formDriverCountryOfIssueError,
      driverPrdpCodeError: formDriverPrdpCodeError,
      driverPrdpNoError: formDriverPrdpNoError,
      licenceCountryOfIssue
    } = driverData;

    // Apply ID number length validation (was inline in old selector)
    const formDriverIdNumber = rawIdNumber && rawIdNumber.length <= 16 ? rawIdNumber : undefined;

    const [drivingLicenceNumberLimit, setDrivingLicenceNumberLimit] = useState<number>(16);

    useEffect(() => {
      const match = getLicenceCodeValue(formDriverLicenceCode);
      if (match && (!selectedLicenceCode || selectedLicenceCode.lookupId !== match.lookupId)) {
        setSelectedLicenceCode(match);
        setDrivingLicenceCodeId?.(match.lookupId);
      }
    }, [getLicenceCodeValue, setSelectedLicenceCode, setDrivingLicenceCodeId, formDriverLicenceCode, selectedLicenceCode]);

    useEffect(() => {
      if (formDriverCountryOfIssue) {
        setDrivingLicenceNumberLimit(formDriverCountryOfIssue === "South Africa" || formDriverCountryOfIssue === "Namibia" ? 12 : 16);
      }
    }, [formDriverCountryOfIssue]);

    const [idGroupOverrideRequired] = useState((formDriverIdType && formDriverIdType !== '' as IDType)
      && (formDriverIdNumber && formDriverIdNumber !== '')
      && (formDriverCountryOfIssueByBirth && formDriverCountryOfIssueByBirth !== ''));

    // onChange Callbacks
    const onChangeIdentificationType = useCallback(
      (_event: SyntheticEvent<Element, Event>, value: IdTypeResponse | null) => {
        setFormDataField("driver.identification.idType", value?.name);
      },
      [setFormDataField]
    );

    const onChangeDateOfBirth = useCallback(
      (date: Dayjs | null) => {
        setFormDataField(
          "driver.dateOfBirth",
          date ? date.format("YYYY-MM-DD") : undefined
        );
      },
      [setFormDataField]
    );

    const onChangeContactNumber = useCallback(
      (newValue: string) => {
        if (newValue.length <= 9 && /^\d*$/.test(newValue)) {
          setFormDataField('driver.contactNumber.number', newValue);
        }
      },
      [setFormDataField]
    );

    const onChangeDialingCode = useCallback(
      (_event: SyntheticEvent<Element, Event>, value: LookupResponse | null) => {
        setFormDataField("driver.contactNumber.dialingCode", value?.lookupValue ?? "");
      },
      [setFormDataField]
    );

    const onChangeLicenceCode = useCallback((_event: SyntheticEvent<Element, Event>, value: LookupResponse | null) => {
      const licenceCode = getLicenceCodeValue(value?.lookupCode);
      setFormDataField("driver.licenceCode", value?.lookupCode);
      setSelectedLicenceCode(licenceCode);
      setDrivingLicenceCodeId?.(licenceCode?.lookupId);
    }, [setFormDataField, setSelectedLicenceCode, getLicenceCodeValue, setDrivingLicenceCodeId]);

    const getSearchValue = (value: string) => {
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

    const dialingCodes = useMemo(() => {
      return {
        options: dialingCodesResponse?.content ?? [],
        getOptionLabel: (option: LookupResponse) =>
          t(option.lookupValue) + " - " + findCountryLabel(option) + "(" + option.lookupCode + ")",
      };
    }, [dialingCodesResponse, findCountryLabel, t]);

    const onLicenceCodeInputChange = useDebouncedCallback(
      (_event: React.SyntheticEvent<Element, Event>, value: string) => {
        const searchValue = getSearchValue(value);
        if (licenceCodeRequest.searchValue !== searchValue) {
          setLicenceCodeRequest({
            ...licenceCodeRequest,
            page: 0,
            searchValue: searchValue,
          });
        }
      },
      500 // Ensure debounce time is correct
    );

    const handleOnEditIdentification = () => {
      if (!disableEdit) setIsSupervisorAuthDialogOpen(true);
    }

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
            setIsIdentificationDisabled(false);
          } else {
            setNotApproved(true);
          }
        });
    }

    const renderEmptyInput = useCallback((): ReactNode => {
      return;
    }, []);

    // Validate
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dobFormFieldValid = (): boolean => {
      const year = dayjs(formDriverDateOfBirth).year();
      const month = dayjs(formDriverDateOfBirth).month();
      const day = dayjs(formDriverDateOfBirth).date();
      return (!isNaN(year) && year >= 1900) && (!isNaN(month) && (month + 1) > 0 && (!isNaN(day) && day > 0));
    }

    const [selectedIdType, setSelectedIdType] = useState<string>(getIdTypeValue(formDriverIdType)?.name ?? "");

    const invalidFirstName = (transgressionConfig?.driverName && (!formDriverName || !/^[A-Za-z\s]+$/.test(formDriverName))) ||
      (formDriverName && containsSpecialCharacters(formDriverName))

    const invalidSurname = transgressionConfig?.driverSurname && (
      !formDriverSurname ||
      !/^[A-Za-z\s]+$/.test(formDriverSurname) // Only allows letters and spaces
    );

    const invalidGender = transgressionConfig?.gender && (formDriverGender === '' || !formDriverGender);
    const invalidOccupation = transgressionConfig?.occupation && (formDriverOccupation === '' || !formDriverOccupation);

    const invalidDateOfBirth = transgressionConfig?.dateOfBirth && (formDriverDateOfBirth === '' || !formDriverDateOfBirth
      || dayjs(formDriverDateOfBirth) > dayjs(today) || !dobFormFieldValid());
    const invalidIdentificationCountryOfIssue = transgressionConfig?.idCountryOfIssue && !formDriverCountryOfIssueByBirth;
    const invalidIdType = transgressionConfig?.identificationType && !formDriverIdType;
    // Helper functions for ID number validation
    const isIdNumberRequired = () => {
      return transgressionConfig?.identificationNumber &&
             (!formDriverIdNumber || formDriverIdNumber === "");
    };

    const isIdValidationFailed = () => {
      return validateIdResponse &&
             !validateIdResponse.valid &&
             formDriverCountryOfIssueByBirth &&
             formDriverCountryOfIssueByBirth !== "" &&
             formDriverIdType &&
             formDriverIdType !== ("" as IDType);
    };

    const hasInvalidCharacters = () => {
      return formDriverIdNumber && containsSpecialCharacters(formDriverIdNumber);
    };

    const isTrnLengthInvalid = () => {
      const isSouthAfricaOrNamibia =
        formDriverCountryOfIssueByBirth === "South Africa" ||
        formDriverCountryOfIssueByBirth === "Namibia";
      return isSouthAfricaOrNamibia &&
             selectedIdType === "TRN" &&
             formDriverIdNumber?.length !== 12;
    };

    const invalidIdNumber =
      isIdNumberRequired() ||
      isIdValidationFailed() ||
      hasInvalidCharacters() ||
      isTrnLengthInvalid();

    const invalidContactNumber = transgressionConfig?.contactNumber && (!formDriverContactNumber || formDriverContactNumber === "");
    const invalidContactDialingCode = transgressionConfig?.contactNumber && !formDialingCodeLookup;
    const invalidLicenceCode = transgressionConfig?.licenceCode && (!formDriverLicenceCode || formDriverLicenceCode === "");
    const invalidCountryOfIssue = transgressionConfig?.licenceCountryOfIssue && (!formDriverCountryOfIssue || formDriverCountryOfIssue === "");
    const invalidContactNumberType = transgressionConfig?.contactNumberType && (!formContactNumberType || formContactNumberType === "");

    const invalidLicence = (transgressionConfig?.licenceNumber && (formDriverLicenceNo === "" || !formDriverLicenceNo)) ||
      (formDriverLicenceNo && containsSpecialCharacters(formDriverLicenceNo)) ||
      (formDriverLicenceNo && drivingLicenceNumberLimit !== undefined && formDriverLicenceNo?.length > drivingLicenceNumberLimit);

    const invalidPrdpNo = (transgressionConfig?.prDPNumber && (formDriverPrdpNo === "" || !formDriverPrdpNo)) ||
      (formDriverPrdpNo && containsSpecialCharacters(formDriverPrdpNo));

    const invalidPrdpCode = (transgressionConfig?.prDPCode && formDriverPrdpCode && formDriverPrdpCode?.length === 0);


    // Filter out "Driving Licence"
    const filteredIdTypes = {
      ...idTypes,
      options: idTypes.options.filter((option: IdTypeResponse) => option.description !== "Driving Licence")
    };

    const handleIdentificationTypeChange = useCallback(
      (event: SyntheticEvent<Element, Event>, newValue: IdTypeResponse | null) => {
        setSelectedIdType(newValue?.name ?? "");
        onChangeIdentificationType(event, newValue);
      },
      [onChangeIdentificationType]
    );

    useEffect(() => {
      setFormFieldValidation("firstNamesError", invalidFirstName);
      setFormFieldValidation("surnameError", invalidSurname);
      setFormFieldValidation("dateOfBirthError", invalidDateOfBirth);
      setFormFieldValidation("genderLookupError", invalidGender);
      setFormFieldValidation("occupationError", invalidOccupation);
      setFormFieldValidation("identificationCountryOfIssueError", invalidIdentificationCountryOfIssue);
      setFormFieldValidation("identificationTypeLookupError", invalidIdType);
      setFormFieldValidation("identificationNumberError", invalidIdNumber);
      setFormFieldValidation("contactNumberError", invalidContactNumber);
      setFormFieldValidation("contactNumberTypeError", invalidContactNumberType);
      setFormFieldValidation("contactDialingCodeError", invalidContactDialingCode);
      setFormFieldValidation("licenceCodeError", invalidLicenceCode);
      setFormFieldValidation("driverCountryOfIssueError", invalidCountryOfIssue);
      setFormFieldValidation("licenceNoError", invalidLicence);
      setFormFieldValidation("driverPrdpNoError", invalidPrdpNo);
      setFormFieldValidation("driverPrdpCodeError", invalidPrdpCode);

    }, [
      setFormFieldValidation,
      invalidFirstName,
      invalidSurname,
      invalidDateOfBirth,
      invalidGender,
      invalidOccupation,
      invalidIdentificationCountryOfIssue,
      invalidIdType,
      invalidIdNumber,
      invalidContactNumber,
      invalidContactNumberType,
      invalidContactDialingCode,
      invalidLicenceCode,
      invalidCountryOfIssue,
      invalidLicence,
      invalidPrdpNo,
      invalidPrdpCode
    ]);

    const [validateIdTimeout, setValidateIdTimeout] = useState<null | ReturnType<typeof setTimeout>>(null);
    const onValidateId = useCallback(() => {
      if (!formDriverIdNumber || !formDriverIdType || !formDriverCountryOfIssueByBirth) {
        return
      }
      const countryOfIssue = formDriverCountryOfIssueByBirth ?? "";
      const idType = (formDriverIdType ?? "") as IDType;
      const idNumber = formDriverIdNumber ?? "";

      if (validateIdTimeout !== null) {
        clearTimeout(validateIdTimeout);
      }
      const timeOut = setTimeout(() => {
        validateId(idNumber, idType, countryOfIssue);
      }, 500);
      setValidateIdTimeout(timeOut);
    },
      [formDriverCountryOfIssueByBirth, formDriverIdType, formDriverIdNumber, validateId, validateIdTimeout]
    );

    //Get Lookup Values from Codes
    const getDialingCodeValue = useCallback(
      (lookupValue: string | undefined) => {
        if (dialingCodes && lookupValue) {
          for (const dialingCode of dialingCodes.options) {
            // Match by lookupValue (country name) since that's what we're storing
            if (dialingCode.lookupValue === lookupValue) {
              return dialingCode;
            }
          }
          return null;
        }
        return null;
      },
      [dialingCodes]
    );

    const removeDriverIdentification = () => {
      if (!formDriverIdNumber && !formDriverCountryOfIssueByBirth && !formDriverIdType) {
        setFormDataField("driver.identification", null)
      }
    }

    const removeContactNumber = useCallback(() => {
      if (!formDialingCodeLookup && !formContactNumberType && !formDriverContactNumber) {
        setFormDataField("driver.contactNumber", null)
      }
    }, [formDialingCodeLookup, formContactNumberType, setFormDataField, formDriverContactNumber])

    // eslint disabled for this block to exclude onValidateId form the dependencies array
    // as that quickly causes an infinite loop
    /* eslint-disable react-hooks/exhaustive-deps*/
    useEffect(() => {
      if (!disableEdit && (formDriverCountryOfIssueByBirth === "South Africa" || formDriverCountryOfIssueByBirth === "Namibia") && selectedIdType !== "TRN") {
        onValidateId();
        removeDriverIdentification();
      }
    }, [formDriverIdNumber, formDriverIdType, formDriverCountryOfIssueByBirth, disableEdit]);
    /* eslint-enable */

    useEffect(() => {
      if (!disableEdit) {
        removeContactNumber();
      }
    }, [removeContactNumber, disableEdit])

    useEffect(() => {
      setValidateIdResponse({
        valid: true,
        elaboration: []
      });
    }, [formDriverIdType, formDriverCountryOfIssueByBirth, setValidateIdResponse])

    useEffect(() => {
      onComponentFieldChanges?.();
    }, [formDriverIdType, formDriverCountryOfIssueByBirth, formDriverGender, formDriverOccupation, formContactNumberType, formDialingCodeLookup,
      formDriverCountryOfIssue, formDriverPrdpCode, onComponentFieldChanges
    ])

    const [licenseCountryOfIssueLookup, setLicenseCountryOfIssueLookup] = useState<LookupResponse | LookupResponse[] | null>(null);
    useEffect(() => {
      if (typeof formDriverCountryOfIssue === "string" && formDriverCountryOfIssue?.trim().length > 0 && licenseCountryOfIssueLookup) {
        dispatch(setDriverLicenseCountryOfIssue(licenseCountryOfIssueLookup));
      }
    }, [formDriverCountryOfIssue, licenseCountryOfIssueLookup, dispatch]);

    const updateVehicleModelRequest = useCallback(() => {
      const parentId = licenceCountryOfIssue?.id;

      if (parentId) {
        setLicenceCodeRequest({
          parentId,
          lookupType: 'DRIVING_LICENSE_CODE',
          page: 0,
          pageSize: MIN_LOOKUP_PAGE_SIZE,
          sortDirection: 'ASC',
          sortFields: ['lookupType', 'lookupValue']
        });
      }

      if (formDriverCountryOfIssue === null || !formDriverCountryOfIssue) {
        licenceCodes.options = [];
        getLicenceCodeValue('');
        setSelectedLicenceCode(null);
        setFormDataField("driver.licenceCode", null);
        setDrivingLicenceCodeId?.(undefined);
      }
    }, [getLicenceCodeValue, licenceCodes, licenceCountryOfIssue, formDriverCountryOfIssue, setSelectedLicenceCode, setFormDataField, setDrivingLicenceCodeId]);

    const initializeVehicleModelRequest = useCallback(() => {
      setLicenceCodeRequest((prevRequest) => ({
        ...prevRequest,
        page: 0,
      }));
      updateVehicleModelRequest();
    }, [updateVehicleModelRequest]);

    useEffect(() => {
      if (licenceCodeResponse && licenceCountryOfIssue) {
        updateVehicleModelRequest();
      } else {
        initializeVehicleModelRequest();
      }
    }, [initializeVehicleModelRequest, licenceCodeResponse, licenceCountryOfIssue, updateVehicleModelRequest]);

    useEffect(() => {

      if (formDriverCountryOfIssue) {
        if (formDriverCountryOfIssue === "South Africa" || formDriverCountryOfIssue === "Namibia") {
          if (formDriverLicenceNo && formDriverLicenceNo.length < drivingLicenceNumberLimit) {
            setFormFieldValidation("licenceNoError", true);
          } else {
            setFormFieldValidation("licenceNoError", invalidLicence);
          }
        } else {
          setFormFieldValidation("licenceNoError", invalidLicence);
        }
      } else {
        setFormFieldValidation("licenceNoError", invalidLicence);
      }

    }, [formDriverCountryOfIssue, formDriverLicenceNo, setFormFieldValidation, drivingLicenceNumberLimit, invalidLicence])

    // Render
    return (
      <Box sx={{ display: isMobile ? 'initial' : 'flex', minHeight: 30, mb: '10px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: '-1px', flex: 'auto' }}>
          <Box alignSelf={'start'} flexGrow={2}>
            <Box sx={{
              columnGap: isMobile ? 5 : 10,
              display: 'flex',
              flexFlow: 'wrap'
            }}>

              {displayField(displayOptionalFields, transgressionConfig?.driverName) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'driverName')}
                  label={t('driverName')}
                  fieldKey={"driver.firstNames"}
                  fieldValue={formDriverName}
                  required={!disableEdit && transgressionConfig?.driverName}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formFirstNameError}
                  helperText={helperTextMessage(formFirstNameError, formDriverName, 'driverName', disableEdit, t)}
                  fieldType="text"
                  checkForSpecialCharacters={true}
                  maxLength={50}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.driverSurname) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'driverSurname')}
                  label={t('driverSurname')}
                  fieldKey={"driver.surname"}
                  fieldValue={formDriverSurname}
                  required={!disableEdit && transgressionConfig?.driverSurname}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formSurnameError}
                  helperText={helperTextMessage(formSurnameError, formDriverSurname, 'driverSurname', disableEdit, t)}
                  fieldType={"text"}
                  checkForSpecialCharacters={true}
                  maxLength={50}
                />
              )}

              {idGroupOverrideRequired && displayField(displayOptionalFields, transgressionConfig?.identificationType) && (
                <Box
                  position={'relative'}
                  width={fieldsWidth(isMobile)}>
                  <TmAutocomplete
                    {...filteredIdTypes}
                    testid={toCamelCaseWords(
                      "editField",
                      "identification",
                      toCamelCase(t("type"))
                    )}
                    required={!disableEdit && transgressionConfig?.identificationType}
                    label={t("idType")}
                    value={getIdTypeValue(formDriverIdType) ?? null}
                    onChange={handleIdentificationTypeChange}
                    readonly={false}
                    disabled={disableEdit || isIdentificationDisabled}
                    error={!disableEdit && formIdTypeError}
                    renderInput={(): ReactNode => { return }}
                    isOptionEqualToValue={(option, value) => option === value}
                    alternative={true}
                  />

                  {isIdentificationDisabled && (
                    <TmIconButton
                      testid={toCamelCaseWords(testIdPrefix, 'editIdType')}
                      size="small"
                      disabled={disableEdit}
                      onClick={handleOnEditIdentification}
                      sx={editIdFieldsStyle}
                    >
                      <EditIcon fontSize="inherit" />
                    </TmIconButton>
                  )}
                </Box>
              )}
              {!idGroupOverrideRequired && displayField(displayOptionalFields, transgressionConfig?.identificationType) && (
                <TmAutocomplete
                  {...filteredIdTypes}
                  label={t("idType")}
                  testid={toCamelCaseWords(
                    "editField",
                    "identification",
                    toCamelCase(t("type"))
                  )}
                  value={getIdTypeValue(formDriverIdType) ?? null}
                  onChange={handleIdentificationTypeChange}
                  disabled={disableEdit && isIdentificationDisabled}
                  readonly={false}
                  required={!disableEdit && transgressionConfig?.identificationType}
                  renderInput={(): ReactNode => { return }}
                  error={!disableEdit && formIdTypeError}
                  isOptionEqualToValue={(option, value) => option === value}
                  helperText={helperTextMessage(formIdTypeError, formDriverIdType, "idType", disableEdit, t)}
                  alternative={true}
                  sx={{
                    width: fieldsWidth(isMobile)
                  }}
                />
              )}

              {idGroupOverrideRequired && displayField(displayOptionalFields, transgressionConfig?.identificationNumber) && (
                <Box position={'relative'} width={fieldsWidth(isMobile)}>
                  <SmartTextfield
                    testid={toCamelCaseWords(testIdPrefix, 'idNumber')}
                    label={t(selectedIdType || 'idNumber')}
                    fieldKey={"driver.identification.number"}
                    fieldValue={formDriverIdNumber}
                    required={!disableEdit && transgressionConfig?.identificationNumber}
                    disabled={disableEdit || isIdentificationDisabled}
                    readonly={false}
                    error={!disableEdit && formIdNumberError}
                    helperText={helperTextMessage(formIdNumberError, formDriverIdNumber, formDriverIdType ?? "idNumber", disableEdit, t)}
                    fieldType={"text"}
                    removeSpaces={true}
                    checkForSpecialCharacters={true}
                    maxLength={formDriverIdType === 'TRN' ? 12 : 16}
                  />

                  {isIdentificationDisabled && (
                    <TmIconButton
                      testid={toCamelCaseWords(testIdPrefix, 'editIdNumber')}
                      size="small"
                      disabled={disableEdit}
                      onClick={handleOnEditIdentification}
                      sx={editIdFieldsStyle}
                    >
                      <EditIcon fontSize="inherit" />
                    </TmIconButton>
                  )}
                </Box>
              )}
              {!idGroupOverrideRequired && displayField(displayOptionalFields, transgressionConfig?.identificationNumber) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'idNumber')}
                  label={t(selectedIdType || 'idNumber')}
                  fieldKey={"driver.identification.number"}
                  fieldValue={formDriverIdNumber}
                  required={!disableEdit && transgressionConfig?.identificationNumber}
                  disabled={disableEdit && isIdentificationDisabled}
                  readonly={false}
                  error={!disableEdit && formIdNumberError}
                  helperText={helperTextMessage(formIdNumberError, formDriverIdNumber, formDriverIdType ?? "idNumber", disableEdit, t)}
                  fieldType={"text"}
                  removeSpaces={true}
                  checkForSpecialCharacters={true}
                  maxLength={formDriverIdType === 'TRN' ? 12 : 16}
                />
              )}

              {idGroupOverrideRequired && displayField(displayOptionalFields, transgressionConfig?.idCountryOfIssue) && (
                <Box position={'relative'} width={fieldsWidth(isMobile)}>
                  <SmartLookup
                    testid={toCamelCaseWords(testIdPrefix, 'driverCountryOfIssue')}
                    label={t('driverCountryOfIssue')}
                    required={!disableEdit && transgressionConfig?.idCountryOfIssue}
                    lookupType="COUNTRY"
                    disabled={disableEdit || isIdentificationDisabled}
                    readonly={false}
                    fieldKey="driver.identification.countryOfIssue"
                    fieldValue={formDriverCountryOfIssueByBirth}
                    error={!disableEdit && formIdCountryOfIssueError}
                    helperText=''
                  />
                  {isIdentificationDisabled && (
                    <TmIconButton
                      testid={toCamelCaseWords(testIdPrefix, 'editIdCountry')}
                      size="small"
                      disabled={disableEdit}
                      onClick={handleOnEditIdentification}
                      sx={editIdFieldsStyle}
                    >
                      <EditIcon fontSize="inherit" />
                    </TmIconButton>
                  )}
                </Box>
              )}
              {!idGroupOverrideRequired && displayField(displayOptionalFields, transgressionConfig?.idCountryOfIssue) && (
                <SmartLookup
                  testid={toCamelCaseWords(testIdPrefix, 'driverCountryOfIssue')}
                  label={t('driverCountryOfIssue')}
                  required={!disableEdit && transgressionConfig?.idCountryOfIssue}
                  lookupType="COUNTRY"
                  disabled={disableEdit && isIdentificationDisabled}
                  readonly={false}
                  fieldKey="driver.identification.countryOfIssue"
                  fieldValue={formDriverCountryOfIssueByBirth}
                  error={!disableEdit && formIdCountryOfIssueError}
                  helperText=''
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.dateOfBirth) && (
                <TmDatePicker
                  testid={toCamelCaseWords(
                    "editField",
                    toCamelCase(t("dateOfBirth"))
                  )}
                  label={t("dateOfBirth")}
                  required={!disableEdit && transgressionConfig?.dateOfBirth}
                  error={!disableEdit && formDateOfBirthError}
                  disabled={disableEdit}
                  readonly={false}
                  dateValue={
                    formDriverDateOfBirth ? dayjs(formDriverDateOfBirth) : null
                  }
                  setDateValue={onChangeDateOfBirth}
                  helperText={helperTextMessage(formDateOfBirthError, formDriverDateOfBirth, "dateOfBirth", disableEdit, t)}
                  disableFuture
                  alternative={true}
                  sx={{
                    width: fieldsWidth(isMobile)
                  }}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.gender) && (
                <SmartLookup
                  testid={toCamelCaseWords(testIdPrefix, 'gender')}
                  label={t('gender')}
                  required={!disableEdit && transgressionConfig?.gender}
                  lookupType="GENDER"
                  disabled={disableEdit}
                  readonly={false}
                  fieldKey="driver.gender"
                  fieldValue={formDriverGender}
                  error={!disableEdit && formGenderError}
                  helperText={helperTextMessage(formGenderError, formDriverGender, "gender", disableEdit, t)}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.occupation) && (
                <SmartLookup
                  testid={toCamelCaseWords(testIdPrefix, 'driverOccupation')}
                  label={t('driverOccupation')}
                  required={!disableEdit && transgressionConfig?.occupation}
                  lookupType="OCCUPATION"
                  disabled={disableEdit}
                  readonly={false}
                  fieldKey="driver.occupation"
                  fieldValue={formDriverOccupation}
                  error={!disableEdit && formDriverOccupationError}
                  helperText={helperTextMessage(formDriverOccupationError, formDriverOccupation, "driverOccupation", disableEdit, t)}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.contactNumberType) && (
                <SmartLookup
                  testid={toCamelCaseWords(testIdPrefix, 'contactNumberType')}
                  label={t('contactNumberType')}
                  required={!disableEdit && transgressionConfig?.contactNumberType}
                  lookupType="CONTACT_NUMBER_TYPE"
                  disabled={disableEdit}
                  readonly={false}
                  fieldKey="driver.contactNumber.contactNumberType"
                  fieldValue={formContactNumberType}
                  error={!disableEdit && formContactNumberTypeError}
                  helperText={helperTextMessage(formContactNumberTypeError, formContactNumberType, "contactNumberType", disableEdit, t)}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.contactNumber) && (
                <TmCountrySelector
                  {...dialingCodes}
                  testid={toCamelCaseWords(testIdPrefix, "contactDialingCode")}
                  label={t("dialingCode")}
                  value={getDialingCodeValue(formDialingCodeLookup)}
                  setCountryLookup={onChangeDialingCode}
                  required={!disableEdit && transgressionConfig?.contactNumber}
                  error={!disableEdit && formDialingCodeLookupError}
                  readonly={false}
                  disabled={disableEdit}
                  alternative={true}
                  helperText={helperTextMessage(
                    formDialingCodeLookupError,
                    formDialingCodeLookup,
                    "contactDialingCode",
                    disableEdit, t
                  )}
                  renderInput={renderEmptyInput}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.contactNumber) && (
                <NumericFormat
                  data-testid={toCamelCaseWords(testIdPrefix, "contactNumber")}
                  testid={toCamelCaseWords("editField", "contactNumberNumber")}
                  label={t("contactNumber")}
                  value={formDriverContactNumber}
                  onValueChange={({ value }) => onChangeContactNumber(value)}
                  error={!disableEdit && formContactNumberError}
                  disabled={disableEdit}
                  readOnly={false}
                  customInput={TmTextField}
                  maxLength={9}
                  required={!disableEdit && transgressionConfig?.contactNumber}
                  allowNegative={false}
                  allowLeadingZeros={true}
                  decimalScale={0}
                  inputMode="numeric"
                  sx={{
                    width: fieldsWidth(isMobile),
                    label: { fontSize: '1em' }
                  }}
                />
              )}

              <Grid container>
                <Box display="flex" flexDirection="column">
                  <Box display="flex" flexDirection="row" flexWrap="wrap">
                    <Box sx={{
                      columnGap: isMobile ? 5 : 10,
                      display: 'flex',
                      flexFlow: 'wrap'
                    }}>

                      {displayField(displayOptionalFields, transgressionConfig?.licenceCountryOfIssue) && (
                        <SmartLookup
                          testid={toCamelCaseWords(testIdPrefix, 'driverCountryOfIssueLicence')}
                          label={t('driverCountryOfIssueLicence')}
                          required={!disableEdit && transgressionConfig?.licenceCountryOfIssue}
                          lookupType="COUNTRY"
                          disabled={disableEdit}
                          readonly={false}
                          fieldKey="driver.countryOfIssue"
                          fieldValue={formDriverCountryOfIssue}
                          error={!disableEdit && formDriverCountryOfIssueError}
                          helperText={helperTextMessage(formDriverCountryOfIssueError, formDriverCountryOfIssue, "driverCountryOfIssueLicence", disableEdit, t)}
                          setLookupValue={setLicenseCountryOfIssueLookup}
                        />
                      )}

                      {displayField(displayOptionalFields, transgressionConfig?.licenceCode) && (
                        <TmAutocomplete
                          {...licenceCodes}
                          label={t('driverLicenceCode')}
                          testid={toCamelCaseWords(testIdPrefix, 'driverLicenceCode')}
                          value={selectedLicenceCode}
                          onChange={onChangeLicenceCode}
                          onInputChange={onLicenceCodeInputChange}
                          disabled={disableEdit}
                          readonly={false}
                          required={!disableEdit && transgressionConfig?.licenceCode}
                          renderInput={(): ReactNode => { return }}
                          error={!disableEdit && formDriverLicenceCodeError}
                          isOptionEqualToValue={(option, value) => option.lookupCode === value.lookupCode}
                          helperText={helperTextMessage(formDriverLicenceCodeError, formDriverLicenceCode, "driverLicenceCode", disableEdit, t)}
                          alternative={true}
                          sx={{ width: fieldsWidth(isMobile) }}
                        />
                      )}

                      {displayField(displayOptionalFields, transgressionConfig?.licenceNumber) && (
                        <SmartTextfield
                          testid={toCamelCaseWords(testIdPrefix, 'driverLicenceNo')}
                          label={t('driverLicenceNo')}
                          fieldKey={"driver.licenceNumber"}
                          fieldValue={formDriverLicenceNo}
                          required={!disableEdit && transgressionConfig?.licenceNumber}
                          disabled={disableEdit}
                          readonly={false}
                          error={!disableEdit && formDriverLicenceNoError}
                          helperText={helperTextMessage(formDriverLicenceNoError, formDriverLicenceNo, "driverLicenceNo", disableEdit, t)}
                          fieldType={"text"}
                          removeSpaces={true}
                          checkForSpecialCharacters={true}
                          maxLength={drivingLicenceNumberLimit}
                        />
                      )}

                      {displayField(displayOptionalFields, transgressionConfig?.prDPCode) && (
                        <SmartLookup
                          testid={toCamelCaseWords(testIdPrefix, 'driverPrdpCode')}
                          label={t('driverPrdpCode')}
                          required={!disableEdit && transgressionConfig?.prDPCode}
                          lookupType="PRDP_CODE"
                          disabled={disableEdit}
                          readonly={false}
                          fieldKey="driver.prDPCodes"
                          fieldValue={formDriverPrdpCode}
                          error={!disableEdit && formDriverPrdpCodeError}
                          helperText={helperTextMessage(formDriverPrdpCodeError, formDriverPrdpCode, "driverPrdpCode", disableEdit, t)}
                        />
                      )}

                      {displayField(displayOptionalFields, transgressionConfig?.prDPNumber) && (
                        <SmartTextfield
                          testid={toCamelCaseWords(testIdPrefix, 'driverPrdpNo')}
                          label={t('driverPrdpNo')}
                          fieldKey={"driver.prDPNumber"}
                          fieldValue={formDriverPrdpNo}
                          required={!disableEdit && transgressionConfig?.prDPNumber}
                          disabled={disableEdit}
                          readonly={false}
                          error={!disableEdit && formDriverPrdpNoError}
                          helperText={helperTextMessage(formDriverPrdpNoError, formDriverPrdpNo, "driverPrdpNo", disableEdit, t)}
                          fieldType={"text"}
                          removeSpaces={true}
                          checkForSpecialCharacters={true}
                          maxLength={16}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Grid>
            </Box>
          </Box>
        </Box>
        <TmAuthenticationDialog
          testid="driverDetailsSupervisorAuthDialog"
          isOpen={isSupervisorAuthDialogOpen}
          onCancel={handleSupervisorAuthDialogClose}
          title={t('updateNotice')}
          message={t('updateNoticeSubTitle')}
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

    );
  }
);

export default memo(DriverDetails);
