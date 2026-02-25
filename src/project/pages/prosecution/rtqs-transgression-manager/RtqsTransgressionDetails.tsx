import { RefObject, useMemo, useRef, useState } from "react";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import TransgressionContextProvider from "../overload-transgression-manager/CaptureTransgressionContext";
import { Box } from "@mui/material";
import CaptureRtqsTransgressionPageEdit from "./CaptureRtqsTransgressionPageEdit";
import TransgressionHistoryDialog from "../../../components/transgression-history/TransgressionHistoryDialog";
import { useLocation } from "react-router-dom";
import { RedirectType } from "../../../enum/RedirectType";
import { ROUTE_NAMES } from "../../../Routing";
import CancelTransgressionDialog, { CancelTransgressionRef } from "../../../components/cancel-transgression/CancelTransgressionDialog";
import { Role } from "../../../auth/roles.ts";
import AuthService from "../../../../framework/auth/authService";
import { useTransgressionDetailsService, VehicleWeighDetailsRef } from "../../../utils/transgression-details";
import { TransgressionDto } from "../../../redux/api/transgressionsApi";

function RtqsTransgressionDetailsPage() {
    return (
        <SecuredContent
            accessRoles={useMemo(() =>
                    (AuthService.isFeatureEnabled('RTQS_TRANSGRESSIONS') ?
                            ["RTQSTRANSGRESSION_MAINTAIN", "RTQSTRANSGRESSION_VIEW"] :
                            []
                    ) as Role[]
                , [])}
        >
            <TransgressionContextProvider>
                <Page />
            </TransgressionContextProvider>
        </SecuredContent>
    );
}

function Page() {
    const location = useLocation();
    // Charges validation state - passed to service but not used in details view validation
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_chargesValid, setChargesValid] = useState(false);
    const noticeNo = location.state.noticeNo;
    const transgressionDetails = location.state.transgressionDetails;
    const childRef = useRef<VehicleWeighDetailsRef>(null);
    const cancelTransgressionRef = useRef<CancelTransgressionRef>(null);

    const service = useTransgressionDetailsService({
        routeName: ROUTE_NAMES.rtqsTransgression,
        redirectType: RedirectType.PROSECUTE_RTQS,
        childRef: childRef as RefObject<VehicleWeighDetailsRef>,
        cancelTransgressionRef: cancelTransgressionRef as RefObject<CancelTransgressionRef>,
        noticeNo,
        transgression: transgressionDetails,
        hasTransgressionMaintain: true,
        hasPrintingMaintain: true,
        setFormChargesValid: setChargesValid
    });

    const breakpoints = {
        flex: {
            xs: "100%",
            sm: "calc(50% - 50px)",
            md: "calc(33% - 50px)",
            lg: "calc(25% - 50px)"
        },
    };


    return (
        <Box sx={{
            display: "flex",
            flexWrap: "wrap",
            padding: "10px 20px 20px 20px",
        }}>
            <Box sx={breakpoints}>
                <CaptureRtqsTransgressionPageEdit
                    ref={childRef}
                    {...service.buildCaptureComponentProps()}
                />
            </Box>
            <TransgressionHistoryDialog
                testid={"transgressionHistory"}
                noticeNo={noticeNo}
                isOpen={service.openHistoryDialog}
                onCancel={service.handleConfirmHistoryDialogClose}
            />
            <CancelTransgressionDialog
                ref={cancelTransgressionRef}
                testId="cancelTransgression"
                isOpen={service.openCancelTransgressionDialog}
                // eslint-disable-next-line react-hooks/refs
                transgression={childRef.current?.onGetTransgression() ?? {} as TransgressionDto}
                onCancelTransgression={service.handleConfirmCancelTransgressionDialogClose}
                sequenceNumber={transgressionDetails!.sequenceNumber}
            />
        </Box>

    );
}

export default RtqsTransgressionDetailsPage;
