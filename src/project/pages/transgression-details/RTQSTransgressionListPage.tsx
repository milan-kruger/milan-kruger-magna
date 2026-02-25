import { Box, Container, Grid, Theme, useMediaQuery } from "@mui/material";
import TmTypography from "../../../framework/components/typography/TmTypography";
import useRtqsTransgressionDetailsManager from "../../hooks/transgression-details/RtqsTransgressionDetailsManger";
import { useState } from "react";
import TransgressionListSearch from "../../components/transgression-details/transgression-list/TransgressionListSearch";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import TransgressionsListTable from "../../components/transgression-details/transgression-list/TransgressionsListTable";
import TmButton from "../../../framework/components/button/TmButton";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { ROUTE_NAMES } from "../../Routing";
import { TransgressionType } from "../../enum/TransgressionType";
import AuthService from "../../../framework/auth/authService.ts";
import { useTranslation } from "react-i18next";

function RTQSTransgressionList() {
    const navigate = useNavigate();
    const [searchValue, setSearchValue] = useState<string>('');
    const [noticeNo, setNoticeNo] = useState<string>(null as unknown as string);
    const { t } = useTranslation();

    const {
        rows,
        handleFindTransgressions,
        handleSearchTransgressions,
        handleTransgressionClick,
        isLoading,
    } = useRtqsTransgressionDetailsManager(noticeNo, setSearchValue, setNoticeNo);

    const handleClickCreateRtqs = () => {
        navigate(`/${ROUTE_NAMES.rtqsTransgressionCreate}`, {
            replace: true,
            state: {
                transgressionDetails: {
                    transgressionStatus: 'Unknown',
                },
                newTransgression: true,
            },
        });
    }

    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

    useHotkeys('ALT+C', () => {
        handleClickCreateRtqs();
    }, { preventDefault: true, enableOnFormTags: true, description: t('createRtqs') ?? undefined });

    return (
        <Container maxWidth={false} disableGutters sx={{ margin: '0 auto', width: '100%' }}>
            <Box margin={10} marginTop={3} textAlign='left'>
                <Grid container rowSpacing={5} marginBottom={10}>
                    <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                        <TmTypography testid={'rtqsTransgressionList'} variant='h5' color='primary' marginBottom={10} fontWeight={"500"}>
                            {t('rtqsTransgressionList')}
                        </TmTypography>
                    </Grid>
                    {
                        AuthService.hasRole('RTQSTRANSGRESSION_MAINTAIN') &&
                        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }} sx={{
                            textAlign: isMobile ? '' : 'end'
                        }}>
                            <TmButton
                                testid={"createRtqsTransgressionBtn"}
                                onClick={handleClickCreateRtqs}
                                color={"primary"}
                                variant={"contained"}
                                size={"large"}
                            >
                                {t('createRtqs')}
                            </TmButton>
                        </Grid>
                    }
                </Grid>
                <TransgressionListSearch onFindTransgressions={handleFindTransgressions}
                    onSearchTransgression={handleSearchTransgressions} />
                {isLoading ? <TmLoadingSpinner testid='DialogListLoadSpinner' />
                    : <TransgressionsListTable rows={rows} searchValue={searchValue}
                        onTransgressionClick={handleTransgressionClick} transgressionType={TransgressionType.RTQS} />
                }
            </Box>
        </Container>
    )
}

export default RTQSTransgressionList;
