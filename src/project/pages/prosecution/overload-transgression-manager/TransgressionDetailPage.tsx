import TransgressionContextProvider from "./CaptureTransgressionContext";
import { Grid, Stack } from "@mui/material";

import CaptureTransgressionPageEdit from "./CaptureTransgressionPageEdit";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import { RefObject, useMemo, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import TransgressionHistoryDialog from "../../../components/transgression-history/TransgressionHistoryDialog";
import CancelTransgressionDialog, {
  CancelTransgressionRef
} from "../../../components/cancel-transgression/CancelTransgressionDialog";
import { OverloadTransgressionDto, TransgressionDto } from "../../../redux/api/transgressionsApi";
import { RedirectType } from "../../../enum/RedirectType";
import { ROUTE_NAMES } from "../../../Routing";
import { useTransgressionDetailsService, VehicleWeighDetailsRef } from "../../../utils/transgression-details";

function TransgressionDetailPage() {
  return (
    <SecuredContent
      accessRoles={useMemo(
        () => ['TRANSGRESSIONDETAILS_VIEW'],
        []
      )}
    >
      <TransgressionContextProvider>
        <Page />
      </TransgressionContextProvider>
    </SecuredContent>
  );
}

function Page() {
  const { noticeNo } = useParams();
  const childRef = useRef<VehicleWeighDetailsRef>(null);
  const cancelTransgressionRef = useRef<CancelTransgressionRef>(null);
  const location = useLocation();
  const [transgressionDetails] = useState<OverloadTransgressionDto>(location.state.overloadTransgression);

  const service = useTransgressionDetailsService({
    routeName: ROUTE_NAMES.overloadTransgression,
    redirectType: RedirectType.LIST,
    childRef: childRef as RefObject<VehicleWeighDetailsRef>,
    cancelTransgressionRef: cancelTransgressionRef as RefObject<CancelTransgressionRef>,
    noticeNo,
    hasTransgressionMaintain: true,
    hasPrintingMaintain: true
  });

  return (
    <Stack direction="row" paddingLeft={10} paddingTop={5} paddingBottom={0}>
      <Grid container>
        <CaptureTransgressionPageEdit
          ref={childRef}
          {...service.buildCaptureComponentProps()}
        />

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
          sequenceNumber={transgressionDetails!.sequenceNumber!}
        />
      </Grid>
    </Stack>
  );
}

export default TransgressionDetailPage;
