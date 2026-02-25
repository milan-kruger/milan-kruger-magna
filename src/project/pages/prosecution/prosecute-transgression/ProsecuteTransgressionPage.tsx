import { Box, Grid, Stack } from "@mui/material";
import SecuredContent from "../../../../framework/auth/components/SecuredContent";
import { useEffect, useMemo } from "react";
import TmLoadingSpinner from "../../../../framework/components/progress/TmLoadingSpinner";
import { useDispatch } from "react-redux";
import { setErrorCallback } from "../../../../framework/error/errorSlice";
import { useLocation, useNavigate } from "react-router-dom";
import callbackRegistry from "../../../../framework/error/callbackRegistry";
import useProsecuteTransgressionMananger from "../../../hooks/prosecution/ProsecuteTransgressionManager";
import { useRemovePendingProsecutionMutation } from "../../../redux/api/transgressionsApi";

function ProsecuteTransgressionPage() {
  const { sequenceNumber } = useLocation().state || {};
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [ removePendingProsecution ] = useRemovePendingProsecutionMutation();

  useEffect(() => {
    const key = 'prosecuteTransgressionPageCallback';
    const callback = () => {
      removePendingProsecution({sequenceNumber: sequenceNumber});
      navigate(-1); //After the error dialog box is displayed, navigate back (probably to Weigh)
      callbackRegistry.clearCallback(key);
    };
    callbackRegistry.setCallback(key, callback);
    dispatch(setErrorCallback({ key }));
  }, [dispatch, navigate, removePendingProsecution, sequenceNumber]);

  return (
    <SecuredContent
      accessRoles={useMemo(() => ['TRANSGRESSION_MAINTAIN'], [])}
    >
      <Page />
    </SecuredContent>
  );
}

function Page() {
  const {
    isLoading
  } = useProsecuteTransgressionMananger();

  return (
    <Stack direction="row" gap={10} spacing={20} padding={10}>
      <Grid container>
        <Box sx={{ width: '100%' }}>
            {isLoading && <TmLoadingSpinner testid={'prosecuteLoadingSpinner'} />}
        </Box>
      </Grid>
    </Stack>
  );
}

export default ProsecuteTransgressionPage;

