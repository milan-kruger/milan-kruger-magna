import { Box, Stack, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import TmLoadingSpinner from "../../../../framework/components/progress/TmLoadingSpinner";
import TmTypography from "../../../../framework/components/typography/TmTypography";
import TmAutocomplete from "../../../../framework/components/textfield/TmAutocomplete";
import { ReactNode, useContext, useEffect, useMemo, useState } from "react";
import TmNumberField from "../../../../framework/components/textfield/TmNumberField";
import TmButton from "../../../../framework/components/button/TmButton";
import TmDialog from "../../../../framework/components/dialog/TmDialog";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import WarningTwoToneIcon from '@mui/icons-material/WarningTwoTone';
import { Authority, CountryRegionIndex, useAllAuthorityByAuthorityCodeQuery, useProvideCountryRegionQuery } from "../../../redux/api/transgressionsApi";
import { NoticeNumberManager } from "../../../hooks/aarto/NoticeNumberManager";
import { ConfigContext } from "../../../../framework/config/ConfigContext";
import useLookupTranslator from "../../../utils/LookupTranslator";
import { GetLookupsApiArg, LookupResponse, useGetLookupsQuery } from "../../../redux/api/coreApi";
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
interface RequestNoticeNumbersFormPageProps {
    readonly manager: NoticeNumberManager;
}

function RequestNoticeNumbersFormPage({ manager }: RequestNoticeNumbersFormPageProps) {
    const theme = useTheme();
    const { t } = useTranslation();
    const config = useContext(ConfigContext);
    const [, , , , , , translateLookupIdToValue] = useLookupTranslator();

    const {
        isLoading: managerIsLoading,
        region,
        handleRegionChange,
        regionError,
        noticeType,
        handleNoticeTypeChange,
        noticeTypeError,
        numberOfNoticeNumbers,
        handleNumberOfNoticeNumbersChange,
        numberOfNoticeNumbersError,
        handleSendRequest,
        handleBackToList,
        showResultDialog,
        requestSuccess,
        handleResultDialogClose
    } = manager;

    // Authority lookup
    const [authority, setAuthority] = useState<Authority | undefined>(undefined);
    const [translatedCountry, setTranslatedCountry] = useState<string | undefined>(undefined);
    const [translatedRegion, setTranslatedRegion] = useState<string | undefined>(undefined);

    const { data: allAuthoritiesResponse, isLoading: isAuthorityLoading } = useAllAuthorityByAuthorityCodeQuery({
        code: config.tenancy.tenant
    });

    useEffect(() => {
        if (allAuthoritiesResponse) {
            setAuthority(allAuthoritiesResponse);
            if (allAuthoritiesResponse.region) {
                translateLookupIdToValue(allAuthoritiesResponse.region)
                    .then((value) => setTranslatedRegion(value));
            } else if (allAuthoritiesResponse.physical?.country) {
                translateLookupIdToValue(allAuthoritiesResponse.physical.country)
                    .then((value) => setTranslatedCountry(value));
            }
        }
    }, [allAuthoritiesResponse, translateLookupIdToValue]);

    // Country Region lookup - use authority's regionLookup, fall back to translated physical.country
    const countryRegionQueryArg = useMemo(() => {
        if (!authority) return { country: undefined, region: undefined };
        if (translatedRegion) {
            return { region: translatedRegion };
        }
        return { country: translatedCountry };
    }, [authority, translatedRegion, translatedCountry]);

    const { data: countryRegionResponse, isLoading: isCountryRegionLoading } = useProvideCountryRegionQuery(
        countryRegionQueryArg,
        { skip: !authority || (!translatedRegion && !translatedCountry) }
    );

    const regionList = useMemo(() => {
        return countryRegionResponse?.countryRegionIndices ?? [];
    }, [countryRegionResponse]);

    // Pre-select region when authority.region matches an entry in the list
    useEffect(() => {
        if (translatedRegion && regionList.length > 0 && !region) {
            const match = regionList.find((r) => r.region === translatedRegion);
            if (match) {
                handleRegionChange({} as React.SyntheticEvent, match);
            }
        }
    }, [translatedRegion, regionList, region, handleRegionChange]);

    // AARTO Notice Type lookup
    const [aartoNoticeTypeRequest] = useState<GetLookupsApiArg>({
        lookupType: 'AARTO_NOTICE_TYPE',
        page: 0,
        pageSize: 1000,
        sortDirection: 'ASC',
        sortFields: ['lookupCode', 'lookupValue'],
    });

    const { data: aartoNoticeTypeResponse } = useGetLookupsQuery(aartoNoticeTypeRequest);

    const aartoNoticeTypes = useMemo(() => {
        return {
            options: aartoNoticeTypeResponse?.content ?? [],
            getOptionLabel: (option: LookupResponse) => t(option.lookupCode) + " - " + t(option.lookupValue),
        };
    }, [aartoNoticeTypeResponse, t]);

    const getTypeValue = (lookupValue: string | undefined) => {
        if (aartoNoticeTypes) {
            const c = aartoNoticeTypes.options.find((value: LookupResponse) => {
                return value.lookupValue.toLowerCase() === lookupValue?.toLowerCase()
            })
            return c;
        }
        return null;
    };

    const isLoading = managerIsLoading || isAuthorityLoading || isCountryRegionLoading;

    return (
        <>
            <TmDialog
                testid={"resultDialog"}
                title={requestSuccess
                    ? t('noticeManagement.requestNoticeNumbersForm.requestSubmittedHeading')
                    : ''}
                message={requestSuccess
                    ? t('noticeManagement.requestNoticeNumbersForm.successMessage')
                    : ''}
                isOpen={showResultDialog}
                cancelLabel={t('close')}
                cancelIcon={requestSuccess ? <CheckCircleOutline /> : <CancelIcon />}
                onCancel={handleResultDialogClose}
                contentComponent={requestSuccess ? undefined :
                    <Stack spacing={2} alignItems="center">
                        <WarningTwoToneIcon fontSize="large" sx={{ color: theme.palette.warning.main, marginRight: '5px' }} />
                        <p style={{ color: theme.palette.error.main }}>{t('noticeManagement.requestNoticeNumbersForm.failureMessage')}</p>
                    </Stack>
                }
            />
            {isLoading ? <TmLoadingSpinner testid={"loadingSpinner"} /> :
                <Box px={20} py={20} maxWidth={500} m="50px auto" border={3} borderColor={theme.palette.primary.main} borderRadius={5}
                    textAlign={'center'}>
                    <TmTypography testid="noticeNumbersFormHeading" data-testid="noticeNumbersFormHeading" variant="h4" color="primary" mb={10}>{t('noticeManagement.requestNoticeNumbersForm.heading')}</TmTypography>

                    <Stack spacing={10} mb={20}>
                        <TmAutocomplete
                            testid={"region"}
                            label={t("noticeManagement.requestNoticeNumbersForm.regionLabel")}
                            renderInput={(): ReactNode => { return }}
                            options={regionList}
                            value={region}
                            onChange={handleRegionChange}
                            error={regionError()}
                            required={true}
                            getOptionLabel={(option: CountryRegionIndex) => option.region}
                        />

                        <TmAutocomplete
                            {...aartoNoticeTypes}
                            testid={"noticeType"}
                            label={t("noticeManagement.requestNoticeNumbersForm.noticeTypeLabel")}
                            renderInput={(): ReactNode => { return }}
                            value={getTypeValue(noticeType)}
                            onChange={handleNoticeTypeChange}
                            error={noticeTypeError()}
                            required={true}
                            sx={{ marginBottom: 5 }}
                        />

                        <TmNumberField
                            testid={'numberOfNoticeNumbers'}
                            value={numberOfNoticeNumbers}
                            label={t('noticeManagement.requestNoticeNumbersForm.numberOfNoticeNumbers')}
                            error={numberOfNoticeNumbersError()}
                            required={true}
                            onChange={handleNumberOfNoticeNumbersChange}
                        />
                    </Stack>

                    <Stack direction="row" spacing={5} justifyContent="center">
                        <TmButton
                            testid={"backToListButton"}
                            onClick={() => handleBackToList()}
                            color={"primary"}
                            variant={"outlined"}
                            size={"small"}
                            startIcon={<ArrowBackIcon />}
                        >
                            {t('noticeManagement.requestNoticeNumbersForm.backButton')}
                        </TmButton>
                        <TmButton
                            testid={"sendRequestButton"}
                            onClick={() => handleSendRequest()}
                            disabled={isLoading || !region || !noticeType || !numberOfNoticeNumbers || numberOfNoticeNumbers <= 0}
                            color={"primary"}
                            variant={"contained"}
                            size={"small"}
                        >
                            {t('noticeManagement.requestNoticeNumbersForm.sendRequestButton')}
                        </TmButton>
                    </Stack>
                </Box>
            }
        </>
    );
}

export default RequestNoticeNumbersFormPage;
