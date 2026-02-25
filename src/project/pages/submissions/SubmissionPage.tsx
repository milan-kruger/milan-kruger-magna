import { Fragment, memo, useMemo } from "react";
import TmSearch from "../../../framework/components/list/TmSearch";
import { Grid, Theme, useMediaQuery } from "@mui/material";
import TmButton from "../../../framework/components/button/TmButton";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import SubmissionContextProvider from "./SubmissionContextProvider";
import SubmissionContent from "./SubmissionContent";
import useSubmissionManager from "../../hooks/submissions/SubmissionManager";

const SubmissionPage = () => {
    return (
        <SecuredContent
            accessRoles={useMemo(() => ['SUBMISSIONDETAILS_VIEW'], [])}
        >
            <SubmissionContextProvider>
                <Page />
            </SubmissionContextProvider>
        </SecuredContent>
    );
};

function Page() {

    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

    const {
        t,
        searchValue,
        loadingRetrieveSubmission,
        handleSearch,
        handleSearchChange,
    } = useSubmissionManager();

    return (
        <Fragment>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <TmSearch
                        testid={'searchTransgression'}
                        searchValue={searchValue}
                        fullWidth
                        onDebouncedChange={handleSearchChange}
                        placeholder={t('searchTransgressionByNoticeNumber')}
                    />
                </Grid>
                <Grid size={{ xs: 12, md: 2 }}>
                    <TmButton
                        testid={"findTransgressions"}
                        onClick={handleSearch}
                        color={"primary"}
                        variant={"contained"}
                        size={"large"}
                        fullWidth={isMobile}
                        disabled={searchValue.length === 0}
                    >
                        {t('search')}
                    </TmButton>
                </Grid>
            </Grid>

            {loadingRetrieveSubmission ? (
                <TmLoadingSpinner testid="loadingSpinner" />
            ) : (
                <SubmissionContent />
            )}
        </Fragment>
    );
}

export default memo(SubmissionPage)
