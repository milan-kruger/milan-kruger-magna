import {
  memo,
  useEffect
} from "react";
import { Theme, Box, useMediaQuery } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppSelectorShallow } from "../../../framework/redux/hooks";
import { containsSpecialCharacters, toCamelCaseWords } from "../../../framework/utils";
import { TransgressionConfiguration } from "../../redux/api/transgressionsApi";
import SmartLookup from "./SmartLookup";
import SmartTextfield from "./SmartTextfield";
import { selectBusinessAddressData } from "../../redux/transgression/transgressionSlice";
import { TransgressionValidation } from "../../redux/transgression/TransgressionValidation";
import { displayField, helperTextMessage } from "../../utils/TransgressionHelpers";

const testIdPrefix = "captureTransgression";

type BusinessAddressDetailsProps = {
  disableEdit: boolean,
  displayOptionalFields: boolean,
  setFormFieldValidation: (
    fieldKey: keyof TransgressionValidation,
    fieldValue: boolean | undefined
  ) => void;
  transgressionConfig?: TransgressionConfiguration;
  onComponentFieldChanges?: () => void;
};

const BusinessAddressDetails = memo(
  ({
    disableEdit,
    displayOptionalFields,
    setFormFieldValidation,
    transgressionConfig,
    onComponentFieldChanges
  }: BusinessAddressDetailsProps) => {
    const { t } = useTranslation();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

    // Using shallowEqual prevents re-renders when unrelated form fields change
    const businessAddressData = useAppSelectorShallow(selectBusinessAddressData);

    const {
      addressLine1: formBusinessAddressLine1,
      addressLine2: rawAddressLine2,
      city: formBusinessAddressCity,
      country: formBusinessAddressCountry,
      code: formBusinessAddressCode,
      businessAddressCountryError: formBusinessAddressCountryError,
      businessAddressCityError: formBusinessAddressCityError,
      businessAddressLine1Error: formBusinessAddressLine1Error,
      businessAddressLine2Error: formBusinessAddressLine2Error,
      businessAddressCodeError: formBusinessAddressCodeError
    } = businessAddressData;

    // Apply length validation (was inline in old selector)
    const formBusinessAddressLine2 = rawAddressLine2 && rawAddressLine2.length <= 50 ? rawAddressLine2 : undefined;

    // Validate
    const invalidBusinessAddressLine1 = (transgressionConfig?.businessAddressLine1 && (formBusinessAddressLine1 === '' || !formBusinessAddressLine1));
    const invalidBusinessAddressLine2 = (transgressionConfig?.businessAddressLine2 && (formBusinessAddressLine2 === '' || !formBusinessAddressLine2));
    const invalidBusinessAddressCity = (transgressionConfig?.businessCity && (formBusinessAddressCity === '' || !formBusinessAddressCity)) ||
      (formBusinessAddressCity !== undefined && containsSpecialCharacters(formBusinessAddressCity));
    const invalidBusinessAddressCountry = (transgressionConfig?.businessCountry && (!formBusinessAddressCountry || formBusinessAddressCountry === '' || formBusinessAddressCountry === null));
    const invalidBusinessAddressCode = (transgressionConfig?.businessPostalCode && (!formBusinessAddressCode || formBusinessAddressCode === '')) ||
      (formBusinessAddressCode !== undefined && containsSpecialCharacters(formBusinessAddressCode));


    useEffect(() => {
      setFormFieldValidation("businessAddressCountryError", invalidBusinessAddressCountry);
      setFormFieldValidation("businessAddressCityError", invalidBusinessAddressCity);
      setFormFieldValidation("businessAddressLine1Error", invalidBusinessAddressLine1);
      setFormFieldValidation("businessAddressLine2Error", invalidBusinessAddressLine2);
      setFormFieldValidation("businessAddressCodeError", invalidBusinessAddressCode);
    }, [setFormFieldValidation, invalidBusinessAddressCountry, invalidBusinessAddressCity, invalidBusinessAddressLine1, invalidBusinessAddressCode, invalidBusinessAddressLine2]);

    useEffect(() => {
      onComponentFieldChanges?.();
    }, [
      formBusinessAddressCountry,
      onComponentFieldChanges,
    ]);

    return (
      <Box sx={{ display: isMobile ? 'initial' : 'flex', minHeight: 30, mb: '10px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mr: '-1px', flex: 'auto' }}>
          <Box alignSelf={'start'} flexGrow={2}>
            <Box sx={{
              columnGap: isMobile ? 5 : 10,
              display: 'flex',
              flexFlow: 'wrap'
            }}>

              {displayField(displayOptionalFields, transgressionConfig?.residentialAddressLine1) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'businessAddress')}
                  label={t('address')}
                  fieldKey={"operator.businessAddressLine1"}
                  fieldValue={formBusinessAddressLine1}
                  required={!disableEdit && transgressionConfig?.businessAddressLine1}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formBusinessAddressLine1Error}
                  helperText={helperTextMessage(formBusinessAddressLine1Error, formBusinessAddressLine1, "address", disableEdit, t)}
                  fieldType={"text"}
                  maxLength={50}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.businessAddressLine2) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'businessAddressLine2')}
                  label={t('addressLine2')}
                  fieldKey={"operator.businessAddressLine2"}
                  fieldValue={formBusinessAddressLine2}
                  required={!disableEdit && transgressionConfig?.businessAddressLine2}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formBusinessAddressLine2Error}
                  helperText={''}
                  fieldType={"text"}
                  maxLength={50}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.businessCity) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'businessAddressCity')}
                  label={t('addressCity')}
                  fieldKey={"operator.businessCity"}
                  fieldValue={formBusinessAddressCity}
                  required={!disableEdit && transgressionConfig?.businessCity}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formBusinessAddressCityError}
                  helperText={helperTextMessage(formBusinessAddressCityError, formBusinessAddressCity, "addressCity", disableEdit, t)}
                  fieldType={"text"}
                  checkForSpecialCharacters={true}
                  maxLength={50}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.businessPostalCode) && (
                <SmartTextfield
                  testid={toCamelCaseWords(testIdPrefix, 'businessAddressPostalCode')}
                  label={t('addressPostalCode')}
                  fieldKey={"operator.businessPostalCode"}
                  fieldValue={formBusinessAddressCode}
                  required={!disableEdit && transgressionConfig?.businessPostalCode}
                  disabled={disableEdit}
                  readonly={false}
                  error={!disableEdit && formBusinessAddressCodeError}
                  helperText={helperTextMessage(formBusinessAddressCodeError, formBusinessAddressCode, "addressPostalCode", disableEdit, t)}
                  fieldType={"text"}
                  checkForSpecialCharacters={true}
                  maxLength={10}
                />
              )}

              {displayField(displayOptionalFields, transgressionConfig?.businessCountry) && (
                <SmartLookup
                  testid={toCamelCaseWords(testIdPrefix, 'businessAddressCountry')}
                  label={t('addressCountry')}
                  required={!disableEdit && transgressionConfig?.businessCountry}
                  lookupType="COUNTRY"
                  disabled={disableEdit}
                  readonly={false}
                  fieldKey="operator.businessCountry"
                  fieldValue={formBusinessAddressCountry}
                  error={!disableEdit && formBusinessAddressCountryError}
                  helperText={''}
                />
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    );
  }
);

export default memo(BusinessAddressDetails);
