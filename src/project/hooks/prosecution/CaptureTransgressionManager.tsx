import { useCallback, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    FindTransgressionConfigurationApiArg,
    OverloadTransgression, SnapshotCharge,
    TransgressionConfiguration,
    useGenerateOverloadTransgressionMutation,
    useRemovePendingProsecutionMutation,
    useUpdateOverloadTransgressionInformationMutation,
    VehicleChargeDto
} from "../../redux/api/transgressionsApi";
import AuthService from "../../../framework/auth/authService";
import { FindAllIdentityTypesApiArg, IdTypeResponse, useFindAllIdentityTypesQuery, useGetLoggedInUserQuery } from "../../redux/api/coreApi";
import { useAppSelector, useAppDispatch } from "../../../framework/redux/hooks";
import { UpdateVehicleWeighDetailsRequest, useUpdateVehicleWeighDetailsMutation } from "../../redux/api/weighApi";
import useLookupTranslator from "../../utils/LookupTranslator";
import { selectConfig } from "../../../framework/config/configSlice";
import { TransgressionStatus } from "../../enum/TransgressionStatus";
import { useTranslation } from "react-i18next";
import { transgressionSlice, selectForm, setNewTransgression } from "../../redux/transgression/transgressionSlice";
import { RedirectType } from "../../enum/RedirectType";
import * as helpers from "../../utils/TransgressionHelpers";
import { cleanObject } from "../../utils/TransgressionHelpers";

const useCaptureTransgressionManager = (handleEdit?: (isEditing: boolean) => void) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { sequenceNumber } = useParams();

    const [isLoading, setIsLoading] = useState(true);
    const [sequenceNo, setSequenceNo] = useState(sequenceNumber ? Number(sequenceNumber) : undefined);
    const [isEditable, setIsEditable] = useState(location.state.newTransgression as boolean);
    const newTransgression = location.state.newTransgression as boolean;
    const [charges, setNewCharges] = useState<SnapshotCharge[]>([]);
    const [vehicleCharges, setVehicleCharges] = useState<VehicleChargeDto[]>([]);
    const [showUpdateOnWeighTooltip, setShowUpdateOnWeighTooltip] = useState(newTransgression);
    const [showValidationSnackbar, setShowValidationSnackbar] = useState(false);
    const [transgressionStatus, setTransgressionStatus] = useState("Unknown");
    const [overloadTransgressionDetails, setOverloadTransgressionDetails] = useState<OverloadTransgression>(location.state.overloadTransgression);
    const [getOverloadTransgressionInformation, setOverloadTransgressionInformation] = useState(location.state.transgressionDetails);
    const [transgressionConfig, setTransgressionConfig] = useState<TransgressionConfiguration>();
    const [drivingLicenceCodeId, setDrivingLicenceCodeId] = useState<string | undefined>();
    const [supervisor, setSupervisor] = useState<string | undefined>();
    const [findTransgressionConfigurationRequest, setFindTransgressionConfigurationRequest] = useState<FindTransgressionConfigurationApiArg>({
        authorityCode: undefined,
        chargebookType: undefined
    })
    const [removePendingProsecution] = useRemovePendingProsecutionMutation();

    const { config: { subsystem: { apps: { weigh: weighBaseURL } } } } = useAppSelector(selectConfig);
    const form = useAppSelector(selectForm);
    const { data: loggedInUser } = useGetLoggedInUserQuery({
        username: AuthService.getUserName(),
    });

    const [translateOverloadTransgressionInformation,
        translatedLookups,
        lookupVehicleConfiguration,
        lookupDriverDetails,
        lookupOperatorDetails,] = useLookupTranslator();

    const [updateVehicleWeighDetails] = useUpdateVehicleWeighDetailsMutation();

    const [generateOverloadTransgression] =
        useGenerateOverloadTransgressionMutation();

    // Lookups API Calls
    const idTypesRequest: FindAllIdentityTypesApiArg = {
        sortDirection: "ASC",
    };

    const { data: idTypeResponse } = useFindAllIdentityTypesQuery(idTypesRequest);

    // ID types
    const idTypes = useMemo(() => {
        return {
            options: idTypeResponse ?? [],
            getOptionLabel: (option: IdTypeResponse) => t(option.name + ""),
        };
    }, [idTypeResponse, t]);

    const [updateOverloadTransgressionInformation] = useUpdateOverloadTransgressionInformationMutation();

    const getOfficersNameForOverload = () => helpers.getFormattedOfficerName(overloadTransgressionDetails, loggedInUser);

    const getPlateNumber = helpers.getPlateNumber(form.formData)

    const getIdTypeValue = useCallback(
        (idTypeName: string | undefined | null) => {
            return helpers.getIdTypeValue(idTypeName, idTypes.options);
        },
        [idTypes.options]
    );

    const onEdit = useCallback(() => {
        setIsEditable(true);
        if (handleEdit) {
            handleEdit(true)
        }
    }, [setIsEditable, handleEdit]);

    const onDisableEdit = () => {
        setOverloadTransgressionInformation(location.state.transgressionDetails);
        if (getOverloadTransgressionInformation &&
            idTypes.options.length > 0
        ) {
            dispatch(setNewTransgression(newTransgression))
            dispatch(transgressionSlice.actions.setFormData(getOverloadTransgressionInformation));
            dispatch(transgressionSlice.actions.setInitialFormData(getOverloadTransgressionInformation));
            setNewCharges(getOverloadTransgressionInformation.charges);
            setVehicleCharges(getOverloadTransgressionInformation.vehicleCharges);
            setTransgressionStatus(getOverloadTransgressionInformation.transgressionStatus);
            if (getOverloadTransgressionInformation.transgressionConfiguration) {
                setTransgressionConfig(getOverloadTransgressionInformation.transgressionConfiguration);
            }
            setIsEditable(false);
        }
    }

    const isOnEditable = () => {
        return isEditable;
    }

    const onCancel = useCallback(() => {
        helpers.handleCancelNavigation({
            pathname: location.pathname,
            navigate,
            weighBaseURL,
            sequenceNumber,
            removePendingProsecution,
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate, weighBaseURL, sequenceNumber, location.pathname]);

    const onGetTransgression = () => helpers.buildTransgressionDto(getOverloadTransgressionInformation, 'OverloadTransgressionDto');

    const onUpdateVehicleWeighDetails = useCallback((noticeNumber: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formData = form.formData as any;

        const depot = formData.operator?.depots?.[0];
        const updateRequest: UpdateVehicleWeighDetailsRequest = {
            sequenceNumber: Number(sequenceNo),
            // For lookup fields, guard on the current form display value so that stale translatedLookups
            // UUIDs are not sent when the user has cleared the field on the form.
            vehicleMake: formData.vehicleConfiguration?.vehicles[0]?.vehicleMake
                ? translatedLookups["vehicleConfiguration.vehicles[0].vehicleMake"] as string ?? undefined
                : undefined,
            colour: formData.vehicleConfiguration?.vehicles[0]?.colour
                ? translatedLookups["vehicleConfiguration.vehicles[0].colour"] as string ?? undefined
                : undefined,
            origin: formData.route?.originOfCargo
                ? translatedLookups["route.originOfCargo"] as string ?? undefined
                : undefined,
            destination: formData.route?.destinationOfCargo
                ? translatedLookups["route.destinationOfCargo"] as string ?? undefined
                : undefined,
            depotName: formData.operator?.depots?.[0]?.name,
            operatorName: formData.operator?.name,
            emailAddress: depot?.emails?.[0]?.emailAddress || null,

            // The following three are dummy values, until Weigh gets modified to accommodate Ghana
            driverName: formData.driver?.firstNames ?? null,
            driverSurname: formData.driver?.surname ?? null,
            identificationType: formData.driver?.identification?.idType ?? "NATIONAL_ID",

            idCountryOfIssue: formData.driver?.identification?.countryOfIssue
                ? translatedLookups["driver.identification.countryOfIssue"] as string ?? undefined
                : undefined,
            identificationNumber: formData.driver?.identification?.number,
            dateOfBirth: formData.driver?.dateOfBirth,
            gender: formData.driver?.gender
                ? translatedLookups["driver.gender"] as string ?? undefined
                : undefined,
            contactNumber: formData.driver?.contactNumber?.number,
            contactNumberType: formData.driver?.contactNumber?.contactNumberType
                ? translatedLookups["driver.contactNumber.contactNumberType"] as string ?? undefined
                : undefined,
            dialingCode: formData.driver?.contactNumber?.dialingCode
                ? translatedLookups["driver.contactNumber.dialingCode"] as string ?? undefined
                : undefined,
            licenceCode: drivingLicenceCodeId,
            licenceNumber: formData.driver?.licenceNumber,
            prDPCodes: formData.driver?.prDPCodes?.length
                ? translatedLookups["driver.prDPCodes"] as string[] ?? formData.driver?.prDPCodes
                : undefined,
            prDPNumber: formData.driver?.prDPNumber,
            trn: formData.driver?.trn,
            licenceCountryOfIssue: formData.driver?.countryOfIssue
                ? translatedLookups["driver.countryOfIssue"] as string ?? undefined
                : undefined,
            residentialAddressLine1: formData.driver?.residentialAddressLine1,
            residentialAddressLine2: formData.driver?.residentialAddressLine2,
            residentialCity: formData.driver?.residentialCity,
            residentialCountry: formData.driver?.residentialCountry
                ? translatedLookups["driver.residentialCountry"] as string ?? undefined
                : undefined,
            residentialPostalCode: formData.driver?.residentialPostalCode,
            businessAddressLine1: formData.operator?.businessAddressLine1,
            businessAddressLine2: formData.operator?.businessAddressLine2,
            businessCity: formData.operator?.businessCity,
            businessCountry: formData.operator?.businessCountry
                ? translatedLookups["operator.businessCountry"] as string ?? undefined
                : undefined,
            businessPostalCode: formData.operator?.businessPostalCode,
            cargo: formData.route?.cargo
                ? translatedLookups["route.cargo"] as string ?? undefined
                : undefined,
            noticeNumber: noticeNumber,
            officerId: loggedInUser!.username
        };

        setIsLoading(true);
        updateVehicleWeighDetails({ updateVehicleWeighDetailsRequest: cleanObject(updateRequest)! })
            .finally(() => {
                setIsLoading(false);
            });
    }, [form, updateVehicleWeighDetails, sequenceNo, translatedLookups, drivingLicenceCodeId, loggedInUser]);

    const onUpdateOverloadTransgressionInformation = useCallback((): Promise<OverloadTransgression> => {
        return helpers.updateTransgression<OverloadTransgression>(
            'OverloadTransgression',
            { form, location, supervisor },
            overloadTransgressionDetails,
            setSupervisor,
            updateOverloadTransgressionInformation,
            { username: loggedInUser!.username ?? '' }
        );
    }, [form, loggedInUser, overloadTransgressionDetails, updateOverloadTransgressionInformation, location, supervisor]);

    const onUpdateOverloadTransgression = useCallback(() => {
        onUpdateOverloadTransgressionInformation().then((response) => {
            setOverloadTransgressionDetails(response);
            if (handleEdit) {
                handleEdit(false)
            }
            setIsLoading(false);
            setIsEditable(false);
            const updateState = { ...location.state };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            updateState.transgressionDetails = form.formData as any;

            if (!form.validationErrors) {
                onUpdateVehicleWeighDetails(response.noticeNumber.number);
            }

            navigate(location.pathname, { state: updateState, replace: true });

        }).catch(() => {
            if (handleEdit) {
                handleEdit(false)
            }
            setIsLoading(false);
            setIsEditable(false);
        });

    }, [
        form,
        handleEdit,
        setIsEditable,
        setIsLoading,
        onUpdateVehicleWeighDetails,
        setOverloadTransgressionDetails,
        onUpdateOverloadTransgressionInformation,
        location, navigate
    ]);

    const onGenerateTransgression = useCallback(() => {
        if (!form.validationErrors) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newData = cleanObject(form.formData as any);

            const navigateToPrintPreviewPage = (noticeNumber: string) => {
                navigate(`/print/all/${noticeNumber}/${RedirectType.PROSECUTE_OVERLOAD}`, {
                    state: {
                        status: newData.arrestCase ? TransgressionStatus.ARREST_CASE_CREATED : TransgressionStatus.CREATED,
                        sequenceNumber: sequenceNo
                    },
                    replace: true,
                });
            };

            const depot = newData.operator?.depots?.[0];

            console.log("New: ", newData)
            console.log("-1: ",newData.driver)
            console.log("-2: ",newData.driver?.identification)
            console.log("-3: ",newData.driver?.identification?.idType)

            generateOverloadTransgression({
                generateOverloadTransgressionRequest: {
                    vehicleModel: newData.vehicleConfiguration?.vehicles[0].vehicleModel,
                    tripsDepotIdentifier: newData.operator?.depots?.[0].tripsDepotIdentifier,
                    depotName: newData.operator?.depots?.[0].name,
                    operatorName: newData.operator?.name,
                    operatorDiscNumber: newData.operator?.operatorDiscNumber,
                    emailAddress: depot?.emails ? depot.emails[0]?.emailAddress : null,
                    contactNumber: `${newData.driver?.contactNumber?.dialingCode} ${newData.driver?.contactNumber?.number}`,
                    contactNumberType: newData.driver?.contactNumber?.contactNumberType,
                    dialingCode: newData.driver?.contactNumber?.dialingCode,
                    licenceCode: newData.driver?.licenceCode,
                    licenceNumber: newData.driver?.licenceNumber,
                    prDPCodes: newData.driver?.prDPCodes,
                    prDPNumber: newData.driver?.prDPNumber,
                    countryOfIssue: newData.driver?.countryOfIssue,
                    residentialAddressLine1: newData.driver?.residentialAddressLine1,
                    residentialAddressLine2: newData.driver?.residentialAddressLine2,
                    residentialCity: newData.driver?.residentialCity,
                    residentialCountry: newData.driver?.residentialCountry,
                    residentialPostalCode: newData.driver?.residentialPostalCode,
                    identificationNumber: newData.driver?.identification?.number,
                    identificationType: newData.driver?.identification?.idType,
                    idCountryOfIssue: newData.driver?.identification?.countryOfIssue,
                    businessAddressLine1: newData.operator?.businessAddressLine1,
                    businessAddressLine2: newData.operator?.businessAddressLine2,
                    businessCity: newData.operator?.businessCity,
                    businessCountry: newData.operator?.businessCountry,
                    businessPostalCode: newData.operator?.businessPostalCode,
                    occupation: newData.driver?.occupation,
                    officerId: loggedInUser?.userAccountId,
                    officerName: loggedInUser?.firstName ?? newData.officerName,
                    officerSurname: loggedInUser?.surname ?? newData.officerSurname,
                    controlCentreVisit: newData.controlCentreVisit,
                    vehicleConfiguration: newData.vehicleConfiguration,
                    route: newData.route,
                    driver: newData.driver,
                    operator: newData.operator,
                    charges: newData.charges,
                    vehicleCharges: newData.vehicleCharges,
                    massMeasurements: getOverloadTransgressionInformation.massMeasurements,
                    arrestCase: newData.arrestCase,
                    sequenceNumber: sequenceNo,
                },
            }).unwrap().then((response) => {
                setIsLoading(false);
                const noticeNumber = response.noticeNumber;
                onUpdateVehicleWeighDetails(noticeNumber);
                navigateToPrintPreviewPage(noticeNumber);
            }).catch((error) => {
                setIsLoading(false);
                throw error;
            });
        } else {
            setShowValidationSnackbar(true);
        }
    }, [generateOverloadTransgression, form.formData, sequenceNo, getOverloadTransgressionInformation,
        form.validationErrors, loggedInUser, navigate, onUpdateVehicleWeighDetails]);

    return {
        t,
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
        setIsEditable,
        setSupervisor,
        isLoading,
        setIsLoading,
        showValidationSnackbar,
        setShowValidationSnackbar,
        findTransgressionConfigurationRequest,
        setFindTransgressionConfigurationRequest,
        transgressionStatus,
        setTransgressionStatus,
        getOfficersName: getOfficersNameForOverload,
        getPlateNumber,
        vehicleDetailsChanged: helpers.vehicleDetailsChanged,
        operatorDetailsChanged: helpers.operatorDetailsChanged,
        driverDetailsChanged: helpers.driverDetailsChanged,
        residentialAddressDetailsChanged: helpers.residentialAddressDetailsChanged,
        businessAddressDetailsChanged: helpers.businessAddressDetailsChanged,
        overloadTransgressionDetails,
        setOverloadTransgressionDetails,
        getOverloadTransgressionInformation,
        setOverloadTransgressionInformation,
        newTransgression,
        showUpdateOnWeighTooltip,
        setShowUpdateOnWeighTooltip,
        transgressionConfig,
        setTransgressionConfig,
        setDrivingLicenceCodeId,
        onUpdateVehicleWeighDetails,
        onGenerateTransgression,
        onUpdateOverloadTransgressionInformation,
        onCancel,
        onEdit,
        onDisableEdit,
        isOnEditable,
        onGetTransgression,
        onUpdateOverloadTransgression
    };
};

export default useCaptureTransgressionManager;
