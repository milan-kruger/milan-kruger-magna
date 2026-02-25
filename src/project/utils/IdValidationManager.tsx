import { useState } from "react";
import { IDType } from "../../framework/utils/IDType";
import {
  useValidateIdMutation,
  ValidateIdResponse,
} from "../redux/api/transgressionsApi";

function useIdValidationManager() {
  const [validateIdRequest] = useValidateIdMutation();
  const [validateIdResponse, setValidateIdResponse] =
    useState<ValidateIdResponse>({
      valid: true,
      elaboration: [],
    });

  const validateId = (
    idNumber: string,
    idType: IDType,
    countryOfIssue: string
  ) => {
    validateIdRequest({
      validateIdRequest: {
        idType,
        idNumber,
        countryOfIssue,
      },
    }).unwrap().then((response) => {
      setValidateIdResponse(response);
    });
  };

  return [validateIdResponse, validateId, setValidateIdResponse] as const;
}

export default useIdValidationManager;
