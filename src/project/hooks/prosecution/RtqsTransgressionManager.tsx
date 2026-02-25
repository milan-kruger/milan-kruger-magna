import { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import AuthService from "../../../framework/auth/authService";
import { useAppDispatch, useAppSelector } from "../../../framework/redux/hooks";
import { FindAllIdentityTypesApiArg, IdTypeResponse, useFindAllIdentityTypesQuery, useGetLoggedInUserQuery } from "../../redux/api/coreApi";
import {
    LoadCharge,
    Money,
    RtqsCharge,
    RtqsTransgression,
    SpeedCharge,
    TransgressionConfiguration,
    useGenerateRtqsTransgressionMutation,
    useRetrieveRtqsTransgressionInformationMutation,
    useUpdateRtqsTransgressionInformationMutation
} from "../../redux/api/transgressionsApi";
import { transgressionSlice, selectForm, setNewTransgression } from "../../redux/transgression/transgressionSlice";
import useLookupTranslator from "../../utils/LookupTranslator";
import { RedirectType } from "../../enum/RedirectType";
import { TransgressionStatus } from "../../enum/TransgressionStatus";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import * as helpers from "../../utils/TransgressionHelpers";
import { useDebouncedCallback } from "use-debounce";
import { cleanObject } from "../../utils/TransgressionHelpers";

/**
 * Converts entity type names to DTO type names for backend deserialization.
 * Backend uses Jackson @JsonTypeInfo which expects DTO type names.
 */
const convertEntityTypeToDto = (entityType: string): string => {
    const typeMap: Record<string, string> = {
        'RtqsCharge': 'RtqsChargeDto',
        'LoadCharge': 'LoadChargeDto',
        'SpeedCharge': 'SpeedChargeDto'
    };
    return typeMap[entityType] || entityType;
};

/**
 * Determines if a transgression is an arrest case based on charge amounts.
 *
 * - If allowArrestCase=true: checks for charges with ZERO fine amount
 * - If allowArrestCase=false: checks for charges with configured arrestCaseFineAmount
 */
const determineArrestCaseStatus = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    charges: any[],
    allowArrestCase: boolean | undefined,
    arrestCaseFineAmount: Money | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getFineAmount: (charge: any) => number | undefined
): { isArrestCase: boolean; targetAmount: number | undefined } => {
    const targetAmount = allowArrestCase ? 0 : arrestCaseFineAmount?.amount;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const isArrestCase = targetAmount !== undefined && charges.some((c: any) =>
        getFineAmount(c) === targetAmount && !c.isAlternative
    );
    return { isArrestCase, targetAmount };
};

const useRtqsTransgressionManager = (handleEdit?: (isEditing: boolean) => void) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const location = useLocation();
    const navigate = useNavigate();
    const { sequenceNumber } = useParams();
    const configContext = useContext(ConfigContext);
    const newTransgression = location.state.newTransgression as boolean;

    const [isLoading, setIsLoading] = useState(true);
    const [sequenceNo, setSequenceNo] = useState(sequenceNumber ? Number(sequenceNumber) : undefined);
    const [isEditable, setIsEditable] = useState(location.state.newTransgression as boolean);
    const [showValidationSnackbar, setShowValidationSnackbar] = useState(false);
    const [transgressionStatus, setTransgressionStatus] = useState("Unknown");
    const [transgressionConfig, setTransgressionConfig] = useState<TransgressionConfiguration>();
    const [drivingLicenceCodeId, setDrivingLicenceCodeId] = useState<string | undefined>();
    const [supervisor, setSupervisor] = useState<string | undefined>();
    const [rtqsTransgressionDetails, setRtqsTransgressionDetails] = useState<RtqsTransgression>(location.state.overloadTransgression);
    const getRtqsTransgressionInformation = useRef(location.state.transgressionDetails);
    const [charges, setCharges] = useState<(RtqsCharge | LoadCharge | SpeedCharge)[]>();
    const [allowArrestCase, setAllowArrestCase] = useState<boolean>();
    const [arrestCaseFineAmount, setArrestCaseFineAmount] = useState<Money>();

    const [retrieveRtqsInformation, { isLoading: retrieveRtqsInformationLoading }] = useRetrieveRtqsTransgressionInformationMutation();
    const [generateRtqsTransgression, { isLoading: generateRtqsTransgressionLoading }] = useGenerateRtqsTransgressionMutation();
    const [updateRtqsTransgressionInformation, { isLoading: updateRtqsLoading }] = useUpdateRtqsTransgressionInformationMutation();
    const [refreshingRtqsDetails, setRefreshingRtqsDetails] = useState(true);

    useEffect(() => {
        setIsLoading(retrieveRtqsInformationLoading || generateRtqsTransgressionLoading || updateRtqsLoading)
    }, [retrieveRtqsInformationLoading, generateRtqsTransgressionLoading, updateRtqsLoading]);

    const updateRefreshingRtqsDetails = useDebouncedCallback(() => {
        setRefreshingRtqsDetails(false);
    }, 50);

    useEffect(() => {
        getRtqsTransgressionInformation.current = location.state.transgressionDetails;
        updateRefreshingRtqsDetails();
    }, [location, updateRefreshingRtqsDetails]);

    useEffect(() => {
        retrieveRtqsInformation({
            retrieveRtqsTransgressionInformationRequest: {
                authorityCode: configContext.tenancy.tenant,
            }
        }).unwrap().then((response) => {
            setTransgressionConfig(response.transgressionConfiguration);
            setCharges(response.charges);
            setAllowArrestCase(response.allowArrestCase);
            setArrestCaseFineAmount(response.arrestCaseFineAmount);
            setIsLoading(false);
        }).catch((error) => {
            console.error("Error retrieving RTQS transgression information:", error);
            setIsLoading(false);
        });
    }, [retrieveRtqsInformation, configContext]);

    const form = useAppSelector(selectForm);
    const { data: loggedInUser } = useGetLoggedInUserQuery({
        username: AuthService.getUserName(),
    });

    const [translateOverloadTransgressionInformation,
        translatedLookups,
        lookupVehicleConfiguration,
        lookupDriverDetails,
        lookupOperatorDetails,] = useLookupTranslator();

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

    const getOfficersNameForRtqs = () => helpers.getFormattedOfficerName(rtqsTransgressionDetails, loggedInUser);

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
    }, [handleEdit]);

    const onDisableEdit = () => {
        if (getRtqsTransgressionInformation &&
            idTypes.options.length > 0
        ) {
            dispatch(setNewTransgression(newTransgression))
            dispatch(transgressionSlice.actions.setFormData(getRtqsTransgressionInformation.current));
            dispatch(transgressionSlice.actions.setInitialFormData(getRtqsTransgressionInformation.current));
            setTransgressionStatus(getRtqsTransgressionInformation.current.transgressionStatus);
            if (getRtqsTransgressionInformation.current.transgressionConfiguration) {
                setTransgressionConfig(getRtqsTransgressionInformation.current.transgressionConfiguration);
            }
            setIsEditable(false);
        }
    }

    const isOnEditable = () => {
        return isEditable;
    }

    const onGetTransgression = () => helpers.buildTransgressionDto(getRtqsTransgressionInformation.current, 'RtqsTransgressionDto');

    const onUpdateRtqsTransgressionInformation = useCallback((): Promise<RtqsTransgression> => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formCharges = (form.formData as any)?.charges || [];
        const { isArrestCase, targetAmount } = determineArrestCaseStatus(
            formCharges,
            allowArrestCase,
            arrestCaseFineAmount,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (charge: any) => charge.actualCharge?.fineAmount?.amount
        );

        return helpers.updateTransgression<RtqsTransgression>(
            'RtqsTransgression',
            { form, location, supervisor },
            rtqsTransgressionDetails,
            setSupervisor,
            updateRtqsTransgressionInformation,
            {
                allowArrestCase: isArrestCase,
                arrestCaseFineAmount: { amount: targetAmount, currency: arrestCaseFineAmount?.currency ?? formCharges[0]?.actualCharge?.fineAmount?.currency ?? rtqsTransgressionDetails?.totalAmountPayable?.currency } as Money
            }
        );
    }, [form, rtqsTransgressionDetails, updateRtqsTransgressionInformation, location, supervisor, allowArrestCase, arrestCaseFineAmount]);

    const onUpdateRtqsTransgression = useCallback(() => {
        onUpdateRtqsTransgressionInformation().then((response) => {
            setRtqsTransgressionDetails(response);
            setTransgressionStatus(response.status);
            if (handleEdit) {
                handleEdit(false)
            }
            setIsEditable(false);
            const updateState = { ...location.state };
            setRefreshingRtqsDetails(true);

            updateState.transgressionDetails = {
                ...response,
                charges: response.snapshotCharges,
                transgressionStatus: response.status
            };
            navigate(location.pathname, { state: updateState, replace: true });

        }).catch((error) => {
            console.error('Failed to update RTQS transgression:', error);
            if (handleEdit) {
                handleEdit(false)
            }
            setIsEditable(false);
        }).finally(() => {
            // Always close the loader, regardless of success or failure
            setIsLoading(false);
        });

    }, [
        handleEdit,
        setIsEditable,
        setIsLoading,
        setRtqsTransgressionDetails,
        onUpdateRtqsTransgressionInformation,
        location, navigate
    ]);

    const onGenerateRtqsTransgression = useCallback(() => {
        if (!form.validationErrors) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newData = form.formData as any;
            // Map TmRtqsCharge[] to RtqsChargeCompilationDto[]
            // Filter out placeholder charges (isNew=true or no actualCharge)
            const rawCharges = (newData.charges || [])
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .filter((charge: any) => !charge.isNew && charge.actualCharge?.type)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .map((charge: any) => {
                    const entityType = charge.actualCharge?.type || '';
                    const dtoType = convertEntityTypeToDto(entityType);

                    return {
                        charge: {
                            ...charge.actualCharge,
                            type: dtoType
                        },
                        plateNumber: charge.plateNumber,
                        isAlternative: charge.isAlternative,
                        linkedToChargeCode: charge.linkedTo,
                        allowedHeight: charge.allowedHeight,
                        vehicleHeight: charge.vehicleHeight,
                        numberOfLamps: charge.numberOfLamps,
                        roadTravelledOn: charge.roadTravelledOn,
                        numberOfTyres: charge.numberOfTyres,
                        lengthOfVehicle: charge.vehicleLength,
                        numberOfPersons: charge.numberOfPersons,
                        numberOfPanels: charge.numberOfPanels,
                    };
                });

            const { isArrestCase, targetAmount } = determineArrestCaseStatus(
                rawCharges,
                allowArrestCase,
                arrestCaseFineAmount,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (charge: any) => charge.charge?.fineAmount?.amount
            );

            const navigateToPrintPreviewPage = (noticeNumber: string) => {
                navigate(`/print/all/${noticeNumber}/${RedirectType.PROSECUTE_RTQS}`, {
                    state: {
                        status: isArrestCase ? TransgressionStatus.ARREST_CASE_CREATED : TransgressionStatus.CREATED,
                        sequenceNumber: sequenceNo
                    }
                });
            };

            generateRtqsTransgression({
                generateRtqsTransgressionRequest: cleanObject({
                    allowArrestCase: isArrestCase,
                    arrestCaseFineAmount: { amount: targetAmount, currency: arrestCaseFineAmount?.currency ?? rawCharges[0]?.charge?.fineAmount?.currency } as Money,
                    vehicle: {
                        ...newData.vehicleConfiguration?.vehicles[0],
                        cargo: newData.route?.cargo
                    },
                    operator: newData.operator,
                    driver: newData.driver,
                    route: newData.route,
                    weighbridgeId: configContext.weighbridge.id,
                    authorityCode: configContext.tenancy.tenant,
                    charges: rawCharges,
                })!,
            }).unwrap().then((response) => {
                const noticeNumber = response.noticeNumber;
                navigateToPrintPreviewPage(noticeNumber);
                setIsLoading(false);
            }).catch(() => {
                setIsLoading(false);
            });
        } else {
            setShowValidationSnackbar(true);
        }
    }, [configContext, form, generateRtqsTransgression, navigate, sequenceNo, allowArrestCase, arrestCaseFineAmount]);

    const onCancel = useCallback(() => {
        helpers.handleCancelNavigation({
            pathname: location.pathname,
            navigate
        });
    }, [navigate, location]);

    return {
        t,
        idTypes,
        getIdTypeValue,
        translateOverloadTransgressionInformation,
        translatedLookups,
        lookupVehicleConfiguration,
        lookupDriverDetails,
        lookupOperatorDetails,
        sequenceNo,
        setSequenceNo,
        isEditable,
        setIsEditable,
        setSupervisor,
        isLoading,
        setIsLoading,
        showValidationSnackbar,
        setShowValidationSnackbar,
        transgressionStatus,
        setTransgressionStatus,
        getOfficersName: getOfficersNameForRtqs,
        getPlateNumber,
        vehicleDetailsChanged: helpers.vehicleDetailsChanged,
        operatorDetailsChanged: helpers.operatorDetailsChanged,
        driverDetailsChanged: helpers.driverDetailsChanged,
        residentialAddressDetailsChanged: helpers.residentialAddressDetailsChanged,
        businessAddressDetailsChanged: helpers.businessAddressDetailsChanged,
        chargeDetailsChanged: helpers.chargeDetailsChanged,
        newTransgression,
        transgressionConfig,
        setTransgressionConfig,
        setDrivingLicenceCodeId,
        onCancel,
        onEdit,
        isOnEditable,
        charges,
        allowArrestCase,
        arrestCaseFineAmount,
        onGenerateRtqsTransgression,
        rtqsTransgressionDetails,
        setRtqsTransgressionDetails,
        getRtqsTransgressionInformation,
        onDisableEdit,
        onGetTransgression,
        onUpdateRtqsTransgression,
        drivingLicenceCodeId,
        refreshingRtqsDetails
    };
};

export default useRtqsTransgressionManager;
