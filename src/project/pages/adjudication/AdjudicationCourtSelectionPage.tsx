import { memo, ReactNode, useCallback, useEffect, useMemo } from "react";
import { Grid, Box, styled, useTheme, Stack, Theme, useMediaQuery } from "@mui/material";
import { useHotkeys } from "react-hotkeys-hook";
import TmCheckboxAutocomplete from "../../../framework/components/textfield/TmCheckboxAutocomplete";
import TmButton from "../../../framework/components/button/TmButton";
import { Court } from "../../redux/api/transgressionsApi";
import AuthService from "../../../framework/auth/authService";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import { Controller, useForm } from "react-hook-form";
import DynamicCourtIcon from "../../assets/images/dynamic_court_icon";
import useAdjudicationManager from "../../hooks/adjudication/AdjudicationManager";

type FormFields = {
    courtNames: string[]
}

const Border = styled(Stack)(({ theme }) => ({
    border: `5px solid ${theme.palette.primary.main}`,
    borderRadius: '20px',
    padding: '20px',
    width: '90%',
    margin: '15px auto 15px auto',
    flexGrow: 1,
    display: 'table'
}));

function AdjudicationCourtSelectionPage() {
    const {
        t,
        selectedCourts,
        setCourts,
        initialiseAdjudication,
        handleCourtSelection,
        handleFindCourts,
        getCourtNames
    } = useAdjudicationManager();

    const { control, setError, clearErrors, setValue, formState } = useForm<FormFields>(
        {
            defaultValues: {
                courtNames: []
            }
        }
    );

    function localiseCourtName(name: string): string {
        return name.replaceAll("Court", `${t("court")}`);
    }

    const theme = useTheme();
    const isDownMd = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const isDownSm = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));

    useHotkeys("CTRL+F", () => handleFindCourts(formState), {
        preventDefault: true,
        enableOnFormTags: true,
        enabled: AuthService.hasRole('ADJUDICATION_MAINTAIN'),
        description: t("findCourt") ?? undefined
    });

    const onCourtsChange = useCallback((value: string[]) => {
        handleCourtSelection(value);
        setValue("courtNames", value);
        if (!value || value.length === 0) {
            setError("courtNames", { type: "required", message: t("fieldRequired", { field: t("courtName") }) });
        } else {
            clearErrors("courtNames");
        }
    }, [t, setValue, setError, clearErrors, handleCourtSelection]);

    useEffect(() => {
        setCourts(initialiseAdjudication?.data?.courts as Court[]);
        setError("courtNames", { type: "required", message: t("fieldRequired", { field: t("courtName") }) });
    }, [initialiseAdjudication, setCourts, setError, t]);

    return (
        <SecuredContent
            accessRoles={useMemo(() => ['ADJUDICATION_MAINTAIN'], [])}
        >
            <Border>
                <Grid container spacing={1}>
                    <Grid size={{ md: 6, sm: 12 }} sx={{
                        display: "flex",
                        alignItems: "center",
                    }}>
                        <DynamicCourtIcon
                            primaryColor={theme.palette.primary.main}
                            contrastColor={theme.palette.primary.contrastText}
                            width={isDownMd ? "40%" : "75%"}
                            height="100%"
                            marginLeft={isDownMd ? "28%" : "10%"}
                            marginTop="0%"
                        />
                    </Grid>

                    <Grid size={{ md: 6, sm: 12 }}
                        alignContent="center">
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            sx={{ padding: '20px', width: '100%', flexGrow: 1 }}
                        >
                            <Grid container direction="column" spacing={2}>
                                <Grid size={{ xs: 8 }}>
                                    {t('adjudicationHelperLabel')}
                                </Grid>
                                <Grid size={{ xs: 8 }}>
                                    <Grid container direction={isDownSm ? "column" : "row"} display={isDownSm ? "grid" : "flex"} alignItems="end" spacing={2}>
                                        <Grid size={{ xs: 12, sm: 8 }}>
                                            <Controller
                                                name="courtNames"
                                                control={control}
                                                render={({ field: { onBlur }, fieldState: { error } }) => (
                                                    <TmCheckboxAutocomplete
                                                        label={t('courtName')}
                                                        testid="courtNameSelection"
                                                        options={getCourtNames()}
                                                        value={selectedCourts}
                                                        onBlur={onBlur}
                                                        onChange={(_event, value) => {
                                                            onCourtsChange(value as string[]);
                                                        }}
                                                        readonly={false}
                                                        required={true}
                                                        error={!!error}
                                                        renderInput={(): ReactNode => { return <></>; }}
                                                        getOptionLabel={(courtName: string) => localiseCourtName(courtName)}
                                                    />
                                                )}
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 2 }} display={isDownSm ? "grid" : "flex"}>
                                            <TmButton
                                                testid={"findCourtButton"}
                                                onClick={() => handleFindCourts(formState)}
                                                color={"primary"}
                                                variant={"contained"}
                                                size={"medium"}
                                                disabled={formState.errors?.courtNames !== undefined}
                                            >
                                                {t('find')}
                                            </TmButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Box>
                    </Grid>
                </Grid>
            </Border>
        </SecuredContent>
    );
}

export default memo(AdjudicationCourtSelectionPage);
