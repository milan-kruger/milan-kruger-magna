import { Box, Tabs } from "@mui/material";
import { SyntheticEvent, memo, useEffect, useMemo, useState } from "react";
import TmTab from "../../../framework/components/tab/TmTab";
import TmTabPanel from "../../../framework/components/tab/TmTabPanel";
import SubmissionPage from "./SubmissionPage";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import { useLocation, useNavigate } from "react-router-dom";
import AuthService from "../../../framework/auth/authService";
import { useTranslation } from "react-i18next";
import AdjudicationPage from "../adjudication/AdjudicationPage";
import AdjudicateSubmissionContextProvider from "../adjudication/AdjudicateSubmissionContextProvider";
import AdjudicationCourtSelectionPage from "../adjudication/AdjudicationCourtSelectionPage";

const SUBMISSION_TAB: string = 'submissionTab';
const ADJUDICATION_TAB: string = 'adjudicationTab';

function SubmissionAdjudicationPage() {

    const hasSubmissionRoles = useMemo(() => {
        return AuthService.hasRole('SUBMISSION_VIEW') &&
            AuthService.hasRole('SUBMISSIONDETAILS_VIEW') &&
            AuthService.hasRole('REGISTERSUBMISSION_MAINTAIN');
    }, []);

    const hasAdjudicationRoles = useMemo(() => {
        return AuthService.hasRole('ADJUDICATION_MAINTAIN');
    }, []);

    const [value, setValue] = useState(!hasSubmissionRoles ? 1 : 0);
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    useEffect(() => {
        if (value === 0) {
            navigate('/submission-adjudication');
        }
        else if (value === 1 && location.pathname === '/submission-adjudication') {
            navigate('/submission-adjudication/find-court', { replace: true });
        }
    }, [value, navigate, location.pathname]);

    return (
        <SecuredContent
            accessRoles={useMemo(() => ['SUBMISSIONDETAILS_VIEW', 'ADJUDICATION_MAINTAIN'], [])}
        >
            <Box mt={2} p={2}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={handleTabChange}>
                        {hasSubmissionRoles && (
                            <TmTab
                                label={t("submission")}
                                id={SUBMISSION_TAB}
                                testid={SUBMISSION_TAB}
                            />
                        )}
                        {hasAdjudicationRoles && (
                            <TmTab
                                label={t("adjudication")}
                                id={ADJUDICATION_TAB}
                                testid={ADJUDICATION_TAB}
                                onClick={() => navigate('/submission-adjudication/find-court', { replace: true })}
                            />
                        )}
                    </Tabs>
                </Box>
                <TmTabPanel value={value} index={0} testid="submissionTabPanel">
                    <SubmissionPage />
                </TmTabPanel>
                <TmTabPanel value={value} index={1} testid="adjudicationTabPanel">
                    {location.pathname.includes('find-court') && <AdjudicationCourtSelectionPage />}
                    {
                        (location.pathname.includes('submission-summary') ||
                        location.pathname.includes('adjudicate-submission')) &&
                        <AdjudicateSubmissionContextProvider>
                            <AdjudicationPage />
                        </AdjudicateSubmissionContextProvider>
                    }
                </TmTabPanel>
            </Box>
        </SecuredContent>
    )
}

export default memo(SubmissionAdjudicationPage);
