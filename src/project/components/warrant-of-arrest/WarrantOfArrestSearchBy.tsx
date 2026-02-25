import { Box, Grid, Stack, Theme, useMediaQuery, useTheme } from "@mui/material";
import { t } from "i18next";
import { ChangeEvent, ReactNode, SyntheticEvent, useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import TmTextField from "../../../framework/components/textfield/TmTextField";
import CourtDocumentDetails from "../court-documents/CourtDocumentDetails";
import dayjs, { Dayjs } from "dayjs";
import { CourtDocumentsView } from "../../enum/CourtDocumentsView";
import TmButton from "../../../framework/components/button/TmButton";
import { toCamelCaseWords } from "../../../framework/utils";
import { GiArchiveRegister } from "react-icons/gi";
import TmTypography from "../../../framework/components/typography/TmTypography";

const SearchByOptions = {
    court: "Court",
    noticeNo: "Notice No",
    warrantNo: "Warrant No"
}


type Props = {
    id: string;
    heading: string;
    subHeading: string;
    onSubmit: (searchBy: string, searchValue: string) => void
    onChange: (searchBy: string, searchValue: string, isValid: boolean) => void,
    courtDetails: {
        courtNameList: string[];
        courtName: string | null;
        courtRoomList: string[];
        courtRoom: string | null;
        courtDate: dayjs.Dayjs | null;
        courtDateList: dayjs.Dayjs[];
        maxCourtDate?: dayjs.Dayjs;
        handleCourtDateChange: (date: Dayjs | null) => void;
        handleCourtRoomChange: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void;
        handleCourtNameChange: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void;
        courtNameError: () => boolean;
        courtDateError: () => boolean;
        courtRoomError: () => boolean;
        helperTextMessage?: string;
        warrantNotFound: () => boolean;
    },
    searchBy?: "Notice No" | "Warrant No" | "Court"
    searchText?: string
}

const NOTICE_NUMBER_REGEX = /^(\d{5})([A-Z0-9]{4})([01])([\dA-Z]{6})(\d{4})([\dA-Z]{2})/gm;
const NOTICE_NUMBER_LENGTH = 22;
const WARRANT_NUMBER_MINIMUM_LENGTH = 1;

const WarrantOfArrestSearchBy = ({ id, heading, subHeading, onSubmit, onChange, courtDetails, searchBy, searchText }: Props) => {
    const [isLoading] = useState(false);

    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const theme = useTheme();

    const getSearchByOptions = useMemo(() => Object.values(SearchByOptions), []);

    const { control, formState: { isValid, touchedFields }, setValue, getValues, getFieldState, } = useForm({
        defaultValues: {
            searchBy: searchBy ?? '',
            searchText: searchText ?? '',
        }
    });

    const getOptionLabel = useCallback(
        (option: string) => {
            const words = option.split(' ');
            words[0] = words[0].toLocaleLowerCase();

            return t(toCamelCaseWords(...words))
        }, []);

    const label = () => {
        const words = (getValues('searchBy') || SearchByOptions.noticeNo).split(' ');
        words[0] = words[0].toLocaleLowerCase();

        return t(toCamelCaseWords(...words))
    }

    const onSearchByChange = useCallback((_evt: SyntheticEvent<Element, Event>, value: string) => {
        setValue('searchBy', value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
        setValue('searchText', '', { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }, [setValue])

    const onSearchByChangeText = useCallback((event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValue('searchText', event.target.value, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
    }, [setValue])

    const searchByValue = useWatch({ control, name: 'searchBy' });
    const searchTextValue = useWatch({ control, name: 'searchText' });

    useEffect(() => {
        onChange(searchByValue, searchTextValue, isValid);
    }, [searchByValue, searchTextValue, onChange, isValid]);

    const isFieldValid = useCallback((name: "searchBy" | "searchText") => {
        return !(getFieldState(name).error !== undefined || !getFieldState(name).isTouched
            || !getFieldState(name).isDirty);
    }, [getFieldState]);

    const getSearchTextError = useCallback(() => {
        const message = searchByValue === SearchByOptions.noticeNo ? t('invalidNoticeNumber') : t('invalidWarrantNumber');
        return getFieldState('searchText').isTouched || searchText !== undefined && (searchByValue !== null && searchByValue !== "") ? message : "";
    }, [getFieldState, searchByValue, searchText]);

    const dateError = () => {
        if (!courtDetails.courtDateError() && courtDetails.warrantNotFound()) {
            return courtDetails.warrantNotFound();
        } else {
            return courtDetails.courtDateError();
        }
    }

    return (
        <>
            {
                isLoading ? <TmLoadingSpinner testid={"loadingSpinner"} /> :
                    <Box px={isMobile ? 20 : 50} py={15} border={3} borderColor={theme.palette.primary.main} borderRadius={5}
                        maxWidth={1000} m="15px auto" minHeight={'500px'}>

                        <TmTypography testid="warrantOfArrestHeading" variant="h4" color="primary" mb={10}>{heading}</TmTypography>
                        <TmTypography testid="warrantOfArrestSubHeading" variant="body1" color={theme.palette.text.primary} mb={15}>{subHeading}</TmTypography>

                        <Grid size={12} container>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack gap={20} marginBottom={10}>
                                    <Controller
                                        name="searchBy"
                                        control={control}
                                        rules={{ required: true }}
                                        render={({ field: { onChange, value } }) => (
                                            <TmAutocomplete
                                                testid={"searchBy"}
                                                label={t("searchBy")}
                                                renderInput={(): ReactNode => { return }}
                                                options={getSearchByOptions}
                                                value={value ?? ""}
                                                onChange={(event, newValue) => {
                                                    onChange(newValue); // Updates react-hook-form state
                                                    onSearchByChange(event, newValue)
                                                }}                                                required={true}
                                                error={searchBy === undefined ? !isFieldValid("searchBy") : false}
                                                getOptionLabel={getOptionLabel}
                                            />
                                        )}
                                    />

                                    {(searchByValue === SearchByOptions.noticeNo || searchByValue === SearchByOptions.warrantNo) &&
                                        <Controller
                                            name="searchText"
                                            control={control}
                                            rules={{
                                                required: true,
                                                pattern: searchByValue === SearchByOptions.noticeNo ? NOTICE_NUMBER_REGEX : undefined,
                                                minLength: searchByValue === SearchByOptions.noticeNo ? NOTICE_NUMBER_LENGTH : WARRANT_NUMBER_MINIMUM_LENGTH,
                                                maxLength: searchByValue === SearchByOptions.noticeNo ? NOTICE_NUMBER_LENGTH : undefined
                                            }}
                                            render={({ field: { onChange, value } }) => (
                                                <TmTextField
                                                    testid="searchText"
                                                    label={label()}
                                                    required={true}
                                                    value={value}
                                                    disabled={searchBy === undefined ? !((touchedFields.searchBy ?? false) && searchByValue !== null) : false}
                                                    readonly={false}
                                                    onChange={(event) => {
                                                        onChange(event.target.value); // Updates react-hook-form state
                                                        onSearchByChangeText(event);
                                                    }}                                                    alternative={true}
                                                    autoComplete='off'
                                                    error={!isFieldValid("searchText")}
                                                    helperText={value && !isFieldValid("searchText") ? getSearchTextError() : ""}
                                                    type="text"
                                                    maxLength={50}
                                                    showTooltipPopup={false}
                                                    sx={{
                                                        width: '100%', '& p.Mui-error': {
                                                            marginTop: 5,
                                                            lineHeight: 1.1,
                                                        }
                                                    }}

                                                />
                                            )}
                                        />
                                    }

                                    {searchByValue === SearchByOptions.court &&
                                        <CourtDocumentDetails
                                            courtNameList={courtDetails.courtNameList}
                                            courtName={courtDetails.courtName}
                                            handleCourtNameChange={courtDetails.handleCourtNameChange}
                                            courtNameError={courtDetails.courtNameError}
                                            courtRoomList={courtDetails.courtRoomList}
                                            courtRoom={courtDetails.courtRoom}
                                            handleCourtRoomChange={courtDetails.handleCourtRoomChange}
                                            courtRoomError={courtDetails.courtRoomError}
                                            handleCourtDateChange={courtDetails.handleCourtDateChange}
                                            courtDate={courtDetails.courtDate}
                                            courtDateList={courtDetails.courtDateList}
                                            courtDateError={dateError}
                                            view={CourtDocumentsView.WARRANT_OF_ARREST}
                                            maxCourtDate={dayjs().subtract(1, 'days')}
                                            helperTextMessage={courtDetails.helperTextMessage}
                                        ></CourtDocumentDetails>
                                    }

                                    <TmButton
                                        testid={toCamelCaseWords("submit", id)}
                                        color={"primary"}
                                        variant={"contained"}
                                        size={"medium"}
                                        disabled={!isValid || (searchByValue === SearchByOptions.court && (courtDetails.courtDateError() ||
                                            courtDetails.courtNameError() || courtDetails.courtRoomError()))}
                                        onClick={() => {
                                            onSubmit(getValues('searchBy'), getValues('searchText'));
                                        }}
                                        sx={{
                                            margin: '50px auto 20px auto !important',
                                            width: 'fit-content',
                                            minWidth: '200px'
                                        }}
                                    >
                                        {t('submit')}
                                    </TmButton>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Stack textAlign={"center"} sx={{
                                    width: '100%', top: isMobile ? '50%' : '40%'
                                }}>
                                    <GiArchiveRegister color={theme.palette.primary.main}
                                        style={{ margin: '0 auto', marginLeft: isMobile ? 0 : 100, fontSize: '200px' }} />
                                </Stack>
                            </Grid>
                        </Grid>

                    </Box>
            }
        </>
    )

}

export { WarrantOfArrestSearchBy, SearchByOptions }
