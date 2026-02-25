import {
  ChangeEvent,
  memo,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Box, FormControlLabel, useMediaQuery, Theme, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppDispatch, useAppSelector, useAppSelectorShallow } from "../../../framework/redux/hooks";
import { containsSpecialCharacters, toCamelCaseWords } from "../../../framework/utils";
import TmSwitch from "../../../framework/components/switch/TmSwitch";
import { RetrieveTransgressionInformationResponse, TransgressionConfiguration } from "../../redux/api/transgressionsApi";
import SmartLookup from "./SmartLookup";
import SmartTextfield from "./SmartTextfield";
import { transgressionSlice, setDisableBusinessAddress, setNewBusinessAddressCountry, selectPhysicalAddressData, selectForm } from "../../redux/transgression/transgressionSlice";
import { TransgressionValidation } from "../../redux/transgression/TransgressionValidation";
import { displayField, helperTextMessage } from "../../utils/TransgressionHelpers";

const testIdPrefix = "captureTransgression";

type PhysicalAddressDetailsProps = {
  disableEdit: boolean;
  displayOptionalFields: boolean;
  setFormDataField: (
    fieldKey: string,
    fieldValue: string | number | boolean | null | undefined
  ) => void;
  setFormFieldValidation: (
    fieldKey: keyof TransgressionValidation,
    fieldValue: boolean | "" | undefined
  ) => void;
  transgressionConfig?: TransgressionConfiguration;
  onComponentFieldChanges?: () => void;
};

const PhysicalAddressDetails = memo(
  ({
    disableEdit,
    displayOptionalFields,
    setFormDataField,
    setFormFieldValidation,
    transgressionConfig,
    onComponentFieldChanges
  }: PhysicalAddressDetailsProps) => {
    const theme = useTheme();
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

    // States
    const [checked, setChecked] = useState(false);

    // Need form for business address comparison in useEffect
    const form = useAppSelector(selectForm);

    // Using shallowEqual prevents re-renders when unrelated form fields change
    const physicalAddressData = useAppSelectorShallow(selectPhysicalAddressData);

    const {
      country: formPhysicalAddressCountry,
      city: formPhysicalAddressCity,
      code: formPhysicalAddressCode,
      addressLine1: formPhysicalAddressLine1,
      addressLine2: rawAddressLine2,
      physicalAddressCountryError: formPhysicalAddressCountryError,
      physicalAddressCityError: formPhysicalAddressCityError,
      physicalAddressLine1Error: formPhysicalAddressLine1Error,
      physicalAddressLine2Error: formPhysicalAddressLine2Error,
      physicalAddressCodeError: formPhysicalAddressCodeError
    } = physicalAddressData;

    // Apply length validation (was inline in old selector)
    const formPhysicalAddressLine2 = rawAddressLine2 && rawAddressLine2.length <= 50 ? rawAddressLine2 : undefined;

    useEffect(() => {
      if (
        formPhysicalAddressCode &&
        formPhysicalAddressCode.toString().length > 10
      ) {
        const newValue = formPhysicalAddressCode.substring(0, 10);
        dispatch(
          transgressionSlice.actions.setFormDataField({
            key: "driver.residentialPostalCode",
            value: newValue,
          })
        );
      }
    }, [formPhysicalAddressCode, dispatch]);

    useEffect(() => {
        onComponentFieldChanges?.();
    }, [
        formPhysicalAddressCountry,
        onComponentFieldChanges,
    ]);

    // Validate
    const invalidPhysicalAddressLine1 = (transgressionConfig?.residentialAddressLine1 && (formPhysicalAddressLine1 === "" || !formPhysicalAddressLine1));
    const invalidPhysicalAddressCity = (transgressionConfig?.residentialCity && (formPhysicalAddressCity === "" || !formPhysicalAddressCity)) ||
      (formPhysicalAddressCity && containsSpecialCharacters(formPhysicalAddressCity));
    const invalidPhysicalAddressCountry = transgressionConfig?.residentialCountry &&
      (!formPhysicalAddressCountry || formPhysicalAddressCountry === "" || formPhysicalAddressCountry === null);
    const invalidPhysicalAddressCode = (transgressionConfig?.residentialPostalCode && (!formPhysicalAddressCode || formPhysicalAddressCode === "")) ||
      (formPhysicalAddressCode && containsSpecialCharacters(formPhysicalAddressCode));
    const invalidLine2 = (transgressionConfig?.residentialAddressLine2 && (formPhysicalAddressLine2 === "" || !formPhysicalAddressLine2));

    useEffect(() => {
      setFormFieldValidation("physicalAddressLine1Error", invalidPhysicalAddressLine1);
      setFormFieldValidation("physicalAddressCityError", invalidPhysicalAddressCity);
      setFormFieldValidation("physicalAddressCountryError", invalidPhysicalAddressCountry);
      setFormFieldValidation("physicalAddressCodeError", invalidPhysicalAddressCode);
      setFormFieldValidation("physicalAddressLine2Error", invalidLine2);
    }, [setFormFieldValidation, invalidPhysicalAddressLine1, invalidPhysicalAddressCity, invalidPhysicalAddressCountry, invalidPhysicalAddressCode, invalidLine2]);

    const handleChange = useCallback(
      (event: ChangeEvent<HTMLInputElement>) => {
        const isChecked = event.target.checked;
        setChecked(isChecked);

        if (isChecked) {
          // Toggle turned ON — sync business address to physical
          setFormDataField("operator.businessCountry", formPhysicalAddressCountry);
          setFormDataField("operator.businessCity", formPhysicalAddressCity);
          setFormDataField("operator.businessPostalCode", formPhysicalAddressCode);
          setFormDataField("operator.businessAddressLine1", formPhysicalAddressLine1);
          setFormDataField("operator.businessAddressLine2", formPhysicalAddressLine2);

          dispatch(setNewBusinessAddressCountry(formPhysicalAddressCountry));
          dispatch(setDisableBusinessAddress(true));
        } else {
          // Toggle turned OFF — enable manual editing
          dispatch(setNewBusinessAddressCountry(''));
          dispatch(setDisableBusinessAddress(false));
        }
      },
      [
        dispatch,
        setChecked,
        setFormDataField,
        formPhysicalAddressCountry,
        formPhysicalAddressCity,
        formPhysicalAddressCode,
        formPhysicalAddressLine1,
        formPhysicalAddressLine2
      ]
    );

    // Update business if same as physical is checked and physical changes
    useEffect(() => {
      if (!checked) return; // Only care if toggle is ON

      const formData = form.formData as RetrieveTransgressionInformationResponse;

      const businessCountry = formData.operator?.businessCountry;
      const businessCity = formData.operator?.businessCity;
      const businessAddressLine1 = formData.operator?.businessAddressLine1;
      const businessAddressLine2 = formData.operator?.businessAddressLine2;
      const businessPostalCode = formData.operator?.businessPostalCode;

      const hasUserEdited = (
        businessCountry !== formPhysicalAddressCountry ||
        businessCity !== formPhysicalAddressCity ||
        businessAddressLine1 !== formPhysicalAddressLine1 ||
        businessAddressLine2 !== formPhysicalAddressLine2 ||
        businessPostalCode !== formPhysicalAddressCode
      );

      if (hasUserEdited) {
        setChecked(false); // Auto-uncheck toggle
        dispatch(setDisableBusinessAddress(false));
        dispatch(setNewBusinessAddressCountry(''));
      }
    }, [
      checked,
      form,
      formPhysicalAddressCountry,
      formPhysicalAddressCity,
      formPhysicalAddressLine1,
      formPhysicalAddressLine2,
      formPhysicalAddressCode,
      setChecked,
      dispatch
    ]);

    return (
      <Box sx={{ display: isMobile ? 'initial' : 'flex', minHeight: 30 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: '-1px', flex: 'auto' }}>
          <Box alignSelf={'start'} flexGrow={2}>
            <Box sx={{
              columnGap: isMobile ? 5 : 10,
              display: 'flex',
              flexFlow: 'wrap'
            }}>


              {displayField(displayOptionalFields, transgressionConfig?.residentialAddressLine1) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'address')}
                  label={t('address')}
                  fieldKey={"driver.residentialAddressLine1"}
                  fieldValue={formPhysicalAddressLine1}
                  required={!disableEdit && transgressionConfig?.residentialAddressLine1}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formPhysicalAddressLine1Error}
                  helperText={helperTextMessage(formPhysicalAddressLine1Error, formPhysicalAddressLine1, "address", disableEdit, t)}
                  fieldType={"text"}
                  maxLength={50}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.residentialAddressLine2) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'addressLine2')}
                  label={t('addressLine2')}
                  fieldKey={"driver.residentialAddressLine2"}
                  fieldValue={formPhysicalAddressLine2}
                  required={!disableEdit && transgressionConfig?.residentialAddressLine2}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formPhysicalAddressLine2Error}
                  helperText={''}
                  fieldType={"text"}
                  maxLength={50}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.residentialCity) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'addressCity')}
                  label={t('addressCity')}
                  fieldKey={"driver.residentialCity"}
                  fieldValue={formPhysicalAddressCity}
                  required={!disableEdit && transgressionConfig?.residentialCity}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formPhysicalAddressCityError}
                  helperText={helperTextMessage(formPhysicalAddressCityError, formPhysicalAddressCity, "addressCity", disableEdit, t)}
                  fieldType={"text"}
                  checkForSpecialCharacters={true}
                  maxLength={50}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.residentialPostalCode) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'addressPostalCode')}
                  label={t('addressPostalCode')}
                  fieldKey={"driver.residentialPostalCode"}
                  fieldValue={formPhysicalAddressCode}
                  required={!disableEdit && transgressionConfig?.residentialPostalCode}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formPhysicalAddressCodeError}
                  helperText={helperTextMessage(formPhysicalAddressCodeError, formPhysicalAddressCode, "addressPostalCode", disableEdit, t)}
                  fieldType={"text"}
                  checkForSpecialCharacters={true}
                  maxLength={10}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.residentialCountry) && (
                <SmartLookup
                  testid={toCamelCaseWords(testIdPrefix, 'addressCountry')}
                  label={t('addressCountry')}
                  required={!disableEdit && transgressionConfig?.residentialCountry}
                  lookupType="COUNTRY"
                  disabled={disableEdit}
                  readonly={false}
                  fieldKey="driver.residentialCountry"
                  fieldValue={formPhysicalAddressCountry}
                  error={!disableEdit && formPhysicalAddressCountryError}
                  helperText={''}
                />
              )}
            </Box>

            <FormControlLabel
              label={t('useResidential')}
              labelPlacement={"start"}
              disabled={disableEdit}
              sx={{
                ml: 0,
                fontWeight: "bold",
                "& span": { fontWeight: "bold" },
                fontSize: 16
              }}
              control={
                <TmSwitch
                  data-testid={"addressToggle"}
                  testid={"addressToggle"}
                  disableRipple
                  sx={{
                    "& .MuiSwitch-thumb": {
                      backgroundColor: theme.palette.primary.main,
                    },
                  }}
                  checked={checked}
                  onChange={handleChange}
                />
              }
            />
          </Box>
        </Box>
      </Box>
    );
  }
);

export default memo(PhysicalAddressDetails);
