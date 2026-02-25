import { useLocation } from "react-router-dom";
import AdjudicateSubmissionPage from "./AdjudicateSubmissionPage"
import SubmissionSummaryPage from "./SubmissionSummaryPage"
import { useCallback, useContext, useEffect, useState } from "react";
import { AdjudicationEvent, createStompClient, disconnectStompClient } from "./wsClient";
import { AdjudicateSubmissionContext } from "./AdjudicateSubmissionContext";
import AuthService from "../../../framework/auth/authService";
import { selectConfigBaseUrl } from "../../../framework/config/configSlice";
import { Grid } from "@mui/material";
import { useSelector } from "react-redux";
import AdjudicationEventLog from "./AdjudicationEventLog";

const AdjudicationPage = () => {

    const location = useLocation();
    const adjudicationContext = useContext(AdjudicateSubmissionContext);
    const [adjudicationEvents, setAdjudicationEvents] = useState<AdjudicationEvent[]>([]);

    const apiBaseUrl = useSelector(selectConfigBaseUrl);
    const loggedInUserName = AuthService.getUserName();

    useEffect(() => {
        createStompClient(apiBaseUrl.transgressions, '/topic/provideSubmissionSummaries', loggedInUserName,
            (res) => {
            setAdjudicationEvents(prevEvents => [...prevEvents, res]);

            if (res.submissionSummaries) {
                const filteredSummaries = res.submissionSummaries.filter(s => location.state?.courtNames.includes(s.courtName));
                adjudicationContext.setSubmissionSummaries(filteredSummaries);
            }
        }, (sessionId) => {
            adjudicationContext.setSessionId(sessionId);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        return () => {
            disconnectStompClient();
        }
    }, []);

    const handleClearEvents = useCallback(() => {
        setAdjudicationEvents([]);
    }, []);

    return (
        <Grid container>
            <Grid size={{ xs: 12 }} >
                {location.pathname.includes('submission-summary') && <SubmissionSummaryPage />}
                {location.pathname.includes('adjudicate-submission') && <AdjudicateSubmissionPage />}
            </Grid>
            <AdjudicationEventLog events={adjudicationEvents} onClear={handleClearEvents} />
        </Grid>
    )
}

export default AdjudicationPage
