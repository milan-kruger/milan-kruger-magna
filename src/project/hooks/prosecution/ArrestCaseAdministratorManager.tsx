import {
  useCallback,
  useContext,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import {
  RetrieveTransgressionInformationResponse,
} from "../../redux/api/transgressionsApi";
import { ConfigContext } from "../../../framework/config/ConfigContext";
import {
  UpdateControlCentreVisitStatusRequest,
  UpdateControlCentreVisitStatusResponse,
  useUpdateControlCentreVisitStatusMutation,
} from "../../redux/api/weighApi";
import { ROUTE_NAMES } from "../../Routing";
import { ArrestCaseAdministratorContext } from "../../pages/prosecution/arrest-case-administrator/ArrestCaseAdministratorContext";
import { useAppSelector } from "../../../framework/redux/hooks";
import { selectConfig } from "../../../framework/config/configSlice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import useSupervisorAuthorizationManager from "../SupervisorAuthorizationManager";

const AUTHORIZATION_ROLE = 'ROLE_CORRECTARRESTCASE_OVERRIDE';
const AUTHORIZATION_REASON = 'Correcting arrest case';

type TUpdateControlCentreVisitStatusResponse = {
  data: UpdateControlCentreVisitStatusResponse;
  error?: undefined;
} | {
  data?: undefined;
  error: FetchBaseQueryError | SerializedError;
}
const useArrestCaseAdministratorManager = (
  data: RetrieveTransgressionInformationResponse,
  sequenceNumber: string
) => {
  const arrestCaseContext = useContext(ArrestCaseAdministratorContext);
  const [showAuthorizationDialog, setShowAuthorizationDialog] =
    useState<boolean>(false);
  const [supervisorUsername, setSupervisorUsername] = useState<string>("");
  const [supervisorPassword, setSupervisorPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showReweighDialog, setShowReweighDialog] = useState<boolean>(false);
  const [showAuthErrorDialog, setShowAuthErrorDialog] = useState<boolean>(false);
  const [notApproved, setNotApproved] = useState(false);

  const navigate = useNavigate();
  const config = useContext(ConfigContext);
  const [updateCCVStatus] = useUpdateControlCentreVisitStatusMutation();
  const { onSupervisorAuthorization, isError: isErrorAuthentication } = useSupervisorAuthorizationManager();

  const { config: { subsystem: { apps: { weigh: weighBaseURL } } } } = useAppSelector(selectConfig);

  const submitCorrectionReason = () => {
    if (arrestCaseContext.incorrectVehicleConfig) {
      setShowAuthorizationDialog(true);
    } else {
      navigateToCaptureTransgression();
    }
  };

  const navigateToCaptureTransgression = useCallback(() => {
    navigate(`/${ROUTE_NAMES.captureTransgressionsRoute}/${sequenceNumber}`, {
      state: {
        transgressionDetails: {
          ...data,
          transgressionStatus: "Unknown",
        },
        newTransgression: true,
        from: ROUTE_NAMES.captureCorrectionReason,
      },
      replace: true,
    });
  }, [data, navigate, sequenceNumber]);

  const closeCaptureCorrectionReason = useCallback(() => {
    window.location.href = `${weighBaseURL}/weigh/ccv/${sequenceNumber}`;
  }, [sequenceNumber, weighBaseURL]);

  const closeDialogs = useCallback(() => {
    setShowAuthorizationDialog(false);
    setShowReweighDialog(false);
    setShowAuthErrorDialog(false);
    setSupervisorPassword("");
    setSupervisorUsername("");
  }, []);

  const updateControlCentreVisitStatus = useCallback(() => {
    const request: UpdateControlCentreVisitStatusRequest = {
      controlCentreVisitId: data.controlCentreVisit?.id ?? 0,
      newStatus: "CorrectionPending",
      username: supervisorUsername,
      password: btoa(supervisorPassword),
      authorityCode: config.tenancy.tenant
    };
    updateCCVStatus({
      updateControlCentreVisitStatusRequest: request,
    })
      .then((response: TUpdateControlCentreVisitStatusResponse) => {
        setIsLoading(false);
        if (!response.error) {
          setShowReweighDialog(true);
        } else {
          closeDialogs();
        }
      })
      .catch(() => {
        setIsLoading(false);
        closeDialogs();
      });
  }, [
    data,
    updateCCVStatus,
    setShowReweighDialog,
    closeDialogs,
    config.tenancy.tenant,
    supervisorUsername,
    supervisorPassword
  ]);

  const handleSupervisorAuthorization = useCallback(() => {
    if (supervisorUsername && supervisorPassword) {
      onSupervisorAuthorization(supervisorUsername, supervisorPassword, AUTHORIZATION_ROLE, AUTHORIZATION_REASON)
        .then((response) => {
          if (response) {
            setNotApproved(false);
            updateControlCentreVisitStatus();
          } else {
            setNotApproved(true);
          }
        });
    }
  }, [supervisorPassword, supervisorUsername, updateControlCentreVisitStatus, onSupervisorAuthorization]);

  const handleCorrectionPending = useCallback(() => {
    setIsLoading(true);
    handleSupervisorAuthorization();
  }, [handleSupervisorAuthorization]);

  return {
    submitCorrectionReason,
    closeCaptureCorrectionReason,
    closeDialogs,
    showAuthorizationDialog,
    supervisorUsername,
    setSupervisorUsername,
    supervisorPassword,
    setSupervisorPassword,
    handleCorrectionPending,
    isLoading,
    showReweighDialog,
    showAuthErrorDialog,
    notApproved,
    isErrorAuthentication
  } as const;
};

export default useArrestCaseAdministratorManager;
