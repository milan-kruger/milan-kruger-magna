export type TransgressionValidation = {
    vehicleMakeError?: boolean;
    vehicleModelError?: boolean;
    vehicleTypeError?: boolean;
    vehicleColorError?: boolean;
    originOfCargoError?: boolean;
    destinationOfCargoError?: boolean;
    cargoError?: boolean;
    plateNumberError?: boolean;

    depotNumberError?: boolean;
    depotNameError?: boolean;
    operatorNameError?: boolean;
    operatorDiscNumberError?: boolean;
    operatorEmailError?: boolean;

    firstNamesError?: boolean;
    surnameError?: boolean;
    dateOfBirthError?: boolean;
    genderLookupError?: boolean;
    occupationError?: boolean;
    identificationCountryOfIssueError?: boolean;
    identificationTypeLookupError?: boolean;
    identificationNumberError?: boolean;
    contactNumberError?: boolean;
    contactNumberTypeError?: boolean;
    contactDialingCodeError?: boolean;
    licenceCodeError?: boolean;
    licenceNoError?: boolean;
    driverCountryOfIssueError?: boolean;
    driverPrdpNoError?: boolean;
    driverPrdpCodeError?: boolean;

    physicalAddressCountryError?: boolean;
    physicalAddressCityError?: boolean;
    physicalAddressLine1Error?: boolean;
    physicalAddressLine2Error?: boolean;
    physicalAddressCodeError?: boolean;

    businessAddressCountryError?: boolean;
    businessAddressCityError?: boolean;
    businessAddressLine1Error?: boolean;
    businessAddressLine2Error?: boolean;
    businessAddressCodeError?: boolean;
};
