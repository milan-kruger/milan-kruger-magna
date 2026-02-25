import { Box, useMediaQuery, Theme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useAppSelectorShallow } from "../../../framework/redux/hooks";
import { containsSpecialCharacters, toCamelCaseWords } from "../../../framework/utils";
import { memo, useEffect, useState } from "react";
import { TransgressionConfiguration } from "../../redux/api/transgressionsApi";
import SmartTextfield from "./SmartTextfield";
import { selectOperatorDetailsData } from "../../redux/transgression/transgressionSlice";
import { TransgressionValidation } from "../../redux/transgression/TransgressionValidation";
import { displayField, helperTextMessage } from "../../utils/TransgressionHelpers";
import Constants from "../../utils/Constants";

const testIdPrefix = "captureTransgression";

type Props = {
  disableEdit: boolean,
  displayOptionalFields: boolean;
  setFormDataField: (fieldKey: string, fieldValue: string | null) => void;
  setFormFieldValidation: (fieldKey: keyof TransgressionValidation, fieldValue: boolean) => void;
  transgressionConfig?: TransgressionConfiguration;
};

function OperatorDetails({ disableEdit, displayOptionalFields, setFormFieldValidation, transgressionConfig }: Readonly<Props>) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

  const [operatorRequired, setOperatorRequired] = useState(false);
  const [depotRequired, setDepotRequired] = useState(false);

  // Using shallowEqual prevents re-renders when unrelated form fields change
  const operatorData = useAppSelectorShallow(selectOperatorDetailsData);

  const {
    depotNumber: formDepotNumber,
    depotName: formDepotName,
    operatorName: formOperatorName,
    operatorDiscNumber: rawOperatorDiscNumber,
    operatorEmail: formOperatorEmail,
    depotNumberError: formDepotNumberError,
    depotNameError: formDepotNameError,
    operatorNameError: formOperatorNameError,
    operatorDiscNumberError: formOperatorDiscNumberError,
    operatorEmailError: formOperatorEmailError
  } = operatorData;

  // Apply disc number length validation (was inline in old selector)
  const formOperatorDiscNumber = rawOperatorDiscNumber && rawOperatorDiscNumber.length <= 30 ? rawOperatorDiscNumber : undefined;

  const invalidDepotNo = (transgressionConfig?.tripsDepotIdentifier === true && (formDepotNumber === '' || !formDepotNumber));
  const invalidDepotName = (transgressionConfig?.depotName === true && (formDepotName === '' || !formDepotName)) ||
  (formDepotName !== undefined && containsSpecialCharacters(formDepotName));
  const invalidOperatorName = (transgressionConfig?.operatorName === true && (formOperatorName === '' || !formOperatorName));
  const invalidDiscNo = (transgressionConfig?.operatorDiscNumber === true && (formOperatorDiscNumber === '' || !formOperatorDiscNumber));
  let invalidEmailAddress = (transgressionConfig?.emailAddress === true && (formOperatorEmail === '' || !formOperatorEmail));

  if (formOperatorEmail && !Constants.emailRegex.exec(formOperatorEmail)) {
    invalidEmailAddress = true;
  }

  // Validate operator number
  useEffect(() => {
    setFormFieldValidation('depotNumberError', invalidDepotNo);
    setFormFieldValidation('depotNameError', invalidDepotName);
    setFormFieldValidation('operatorNameError', invalidOperatorName);
    setFormFieldValidation('operatorDiscNumberError', invalidDiscNo);
    setFormFieldValidation('operatorEmailError', invalidEmailAddress);
  }, [setFormFieldValidation, invalidDepotNo, invalidDepotName, invalidOperatorName, invalidDiscNo, invalidEmailAddress]);

  useEffect(() => {
    // Skip validation if either depotName or operatorName is not displayed
    if (!displayField(displayOptionalFields, transgressionConfig?.depotName) ||
      !displayField(displayOptionalFields, transgressionConfig?.operatorName)) {
      return;
    }

    const operatorNameEmpty = !formOperatorName || formOperatorName?.length <= 0;
    const depotNameEmpty = !formDepotName || formDepotName?.length <= 0;

    let isDepotRequired = false;
    let isOperatorRequired = false;

    if ((transgressionConfig?.operatorName === true ||
      (formDepotName && formDepotName.length > 0) ||
      (formOperatorDiscNumber && formOperatorDiscNumber?.length > 0) ||
      (formOperatorEmail && formOperatorEmail?.length > 0) ||
      (formDepotNumber && formDepotNumber?.length > 0)) &&
      operatorNameEmpty) {
      isOperatorRequired = true;
    }

    if ((transgressionConfig?.depotName === true ||
      (formOperatorName && formOperatorName.length > 0) ||
      (formOperatorDiscNumber && formOperatorDiscNumber?.length > 0) ||
      (formOperatorEmail && formOperatorEmail?.length > 0) ||
      (formDepotNumber && formDepotNumber?.length > 0)) &&
      depotNameEmpty) {
      isDepotRequired = true;
    }

    setDepotRequired(isDepotRequired);
    setOperatorRequired(isOperatorRequired);

    setFormFieldValidation('depotNameError', isDepotRequired);
    setFormFieldValidation('operatorNameError', isOperatorRequired);
  }, [formDepotName, formDepotNumber, formOperatorDiscNumber, formOperatorEmail, formOperatorName,
    displayOptionalFields, transgressionConfig, setFormFieldValidation, setDepotRequired, setOperatorRequired
  ]);

  // Render
  return (
    <Box sx={{ display: isMobile ? 'initial' : 'flex', minHeight: 30, mb: '10px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mr: '-1px', flex: 'auto' }}>
        <Box >
          <Box sx={{
            columnGap: isMobile ? 5 : 10,
            display: 'flex',
            flexFlow: 'wrap'
          }}>

            {displayField(displayOptionalFields, transgressionConfig?.tripsDepotIdentifier) && (
              <SmartTextfield
                testid={toCamelCaseWords(testIdPrefix, 'depotNumber')}
                label={t('depotNumber')}
                fieldKey={"operator.depots.0.tripsDepotIdentifier"}
                fieldValue={formDepotNumber}
                required={!disableEdit && transgressionConfig?.tripsDepotIdentifier}
                helperText={helperTextMessage(formDepotNumberError, formDepotNumber, "depotNumber", disableEdit, t)}
                disabled={disableEdit}
                readonly={false}
                error={!disableEdit && formDepotNumberError}
                fieldType={"text"}
                maxLength={30}
                removeSpaces={true}
                checkForSpecialCharacters={true}
              />
            )}

            {displayField(displayOptionalFields, transgressionConfig?.depotName) && (
              <SmartTextfield
                label={t('depotName')}
                testid={toCamelCaseWords(testIdPrefix, 'depotName')}
                disabled={disableEdit}
                readonly={false}
                error={!disableEdit && (formDepotNameError || depotRequired)}
                required={!disableEdit && (transgressionConfig?.depotName || depotRequired)}
                fieldKey={"operator.depots.0.name"}
                fieldValue={formDepotName}
                helperText={helperTextMessage(formDepotNameError, formDepotName, "depotName", disableEdit, t)}
                fieldType={"text"}
                maxLength={50}
                checkForSpecialCharacters={true}
              />
            )}

            {displayField(displayOptionalFields, transgressionConfig?.operatorName) && (
              <SmartTextfield
                label={t('operatorName')}
                testid={toCamelCaseWords(testIdPrefix, 'operatorName')}
                disabled={disableEdit}
                readonly={false}
                error={!disableEdit && (formOperatorNameError || operatorRequired)}
                required={!disableEdit && (transgressionConfig?.operatorName || operatorRequired)}
                helperText={helperTextMessage(formOperatorNameError, formOperatorName, "operatorName", disableEdit, t)}
                fieldKey={"operator.name"}
                fieldValue={formOperatorName}
                fieldType={"text"}
                maxLength={50}
                checkForSpecialCharacters={true}
              />
            )}

            {displayField(displayOptionalFields, transgressionConfig?.operatorDiscNumber) && (
              <SmartTextfield
                label={t('operatorDiscNumber')}
                testid={toCamelCaseWords(testIdPrefix, 'operatorDiscNumber')}
                disabled={disableEdit}
                readonly={false}
                maxLength={30}
                error={!disableEdit && formOperatorDiscNumberError}
                required={!disableEdit && transgressionConfig?.operatorDiscNumber}
                helperText={helperTextMessage(formOperatorDiscNumberError, formOperatorDiscNumber, "operatorDiscNumber", disableEdit, t)}
                fieldKey={"operator.operatorDiscNumber"}
                fieldValue={formOperatorDiscNumber}
                fieldType={"text"}
                removeSpaces={true}
                checkForSpecialCharacters={true}
              />
            )}

            {displayField(displayOptionalFields, transgressionConfig?.emailAddress) && (
              <SmartTextfield
                testid={toCamelCaseWords(testIdPrefix, 'operatorEmail')}
                label={t('operatorEmail')}
                fieldKey={"operator.depots.0.emails.0.emailAddress"}
                fieldValue={formOperatorEmail}
                required={!disableEdit && transgressionConfig?.emailAddress}
                disabled={disableEdit}
                readonly={false}
                error={!disableEdit && formOperatorEmailError}
                helperText={helperTextMessage(formOperatorEmailError, formOperatorEmail, "operatorEmail", disableEdit, t)}
                fieldType={"text"}
                removeSpaces={true}
              />
            )}
          </Box>
        </Box>

      </Box>
    </Box>
  )
}

export default memo(OperatorDetails)
