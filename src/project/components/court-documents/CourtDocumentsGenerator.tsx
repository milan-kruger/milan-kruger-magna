import { Box, Grid, Stack, Theme, Typography, useMediaQuery, useTheme } from "@mui/material"
import dayjs, { Dayjs } from "dayjs";
import useCourtDocumentsGeneratorManager from "./CourtDocumentsGeneratorManager";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import CourtDocumentDetails from "./CourtDocumentDetails";
import { Court } from "../../redux/api/transgressionsApi";
import ControlDocumentDetails from "./ControlDocumentDetails";
import CourtDocumentsGeneratorAction from "./CourtDocumentsGeneratorAction";
import { CourtDocumentsView } from "../../enum/CourtDocumentsView";
import { PiGavelFill } from "react-icons/pi";
import TmScrollTextIcon from "../../assets/images/scroll_text_icon";
import { GiArchiveRegister } from "react-icons/gi";
import TmTypography from "../../../framework/components/typography/TmTypography";
type CourtDocumentsGeneratorProps = {
    heading: string;
    subHeading: string;
    isLoading: boolean;
    handleGenerateDocuments: (
        courtName: string,
        courtRoom: string,
        courtDate: Dayjs,
        noticeType?: string,
        createNewPageForEachOfficer?: boolean
    ) => void;
    adjudicationTimeFence: number;
    courts: Court[];
    courtNameList: string[];
    view: CourtDocumentsView;
    courtRegisterNotFound?: string;
    showNoCourtRegisterFound?: boolean;
    maxCourtDate?: dayjs.Dayjs;
}

const CourtDocumentsGenerator = ({
    heading,
    subHeading,
    isLoading,
    handleGenerateDocuments,
    adjudicationTimeFence,
    courts,
    courtNameList,
    view = CourtDocumentsView.COURT_REGISTER,
    courtRegisterNotFound,
    showNoCourtRegisterFound,
    maxCourtDate
}: CourtDocumentsGeneratorProps) => {

    const theme = useTheme();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));

    const {
        courtName,
        courtRoom,
        courtDate,
        noticeType,
        pagePerOfficer,
        courtNameError,
        courtRoomError,
        courtDateError,
        noticeTypeError,
        courtRoomList,
        courtDateList,
        noticeTypeList,
        handleCourtNameChange,
        handleCourtRoomChange,
        handleCourtDateChange,
        handleNoticeTypeChange,
        handlePagePerOfficerChange,
        helperTextMessage,
        courtDateErrorWarrant
    } = useCourtDocumentsGeneratorManager({ handleGenerateDocuments, adjudicationTimeFence, courts, view });

    return (
        <>
            {isLoading ? <TmLoadingSpinner testid={"loadingSpinner"} /> :
                <Box px={isMobile ? 20 : 50} py={15} border={3} borderColor={theme.palette.primary.main} borderRadius={5}
                    maxWidth={1000} m="15px auto">

                    <TmTypography testid="courtDocumentHeading" data-testid="courtDocumentHeading" variant="h4" color="primary" mb={10}>{heading}</TmTypography>
                    <TmTypography testid="courtDocumentSubHeading" variant="body1" color={theme.palette.text.primary} mb={15}>{subHeading}</TmTypography>

                    <Grid container spacing={5}>
                        <Grid size={{ md: 6, xs: 12 }}>
                            <Stack spacing={view === CourtDocumentsView.COURT_REGISTER ? 25 : 10}>
                                <CourtDocumentDetails
                                    courtNameList={courtNameList}
                                    courtName={courtName}
                                    handleCourtNameChange={handleCourtNameChange}
                                    courtNameError={courtNameError}
                                    courtRoomList={courtRoomList}
                                    courtRoom={courtRoom}
                                    handleCourtRoomChange={handleCourtRoomChange}
                                    courtRoomError={courtRoomError}
                                    handleCourtDateChange={handleCourtDateChange}
                                    courtDate={courtDate}
                                    courtDateList={courtDateList}
                                    courtDateError={view !== CourtDocumentsView.WARRANT_OF_ARREST_REGISTER ? courtDateError : courtDateErrorWarrant}
                                    view={view}
                                    maxCourtDate={maxCourtDate}
                                    helperTextMessage={helperTextMessage()}
                                ></CourtDocumentDetails>

                                {view === CourtDocumentsView.CONTROL_DOCUMENTS && <ControlDocumentDetails
                                    noticeType={noticeType}
                                    noticeTypeList={noticeTypeList}
                                    noticeTypeError={noticeTypeError}
                                    handleNoticeTypeChange={handleNoticeTypeChange}
                                    pagePerOfficer={pagePerOfficer}
                                    handlePagePerOfficerChange={handlePagePerOfficerChange}
                                ></ControlDocumentDetails>}

                                <CourtDocumentsGeneratorAction
                                    disabled={courtNameError() || courtRoomError() || (view === CourtDocumentsView.CONTROL_DOCUMENTS && noticeTypeError()) ||
                                        (view !== CourtDocumentsView.WARRANT_OF_ARREST_REGISTER ? courtDateError() : courtDateErrorWarrant())}
                                    view={view}
                                    onClick={() => {
                                        handleGenerateDocuments(
                                            courtName!, courtRoom!, courtDate!, noticeType!, pagePerOfficer
                                        )
                                    }} />

                                    {((view === CourtDocumentsView.CONTROL_DOCUMENTS || view === CourtDocumentsView.COURT_RESULTS) && showNoCourtRegisterFound) &&
                                        <Typography sx={{ marginTop: '0 !important' }} color={theme.palette.error.main}>{courtRegisterNotFound}</Typography>
                                    }

                            </Stack>
                        </Grid>
                        <Grid size={{ md: 6, xs: 12 }}>
                            <Box textAlign={"center"} sx={{
                                width: '100%', top: isMobile ? '50%' : '40%', transform: 'translateY(-50%)',
                                position: 'relative'
                            }}>
                                {(view !== CourtDocumentsView.COURT_RESULTS && view !== CourtDocumentsView.WARRANT_OF_ARREST_REGISTER) &&
                                    <TmScrollTextIcon primaryColor={theme.palette.primary.main}
                                        style={{ margin: '0 auto', fontSize: '100px' }}
                                    />
                                }

                                {view === CourtDocumentsView.COURT_RESULTS &&
                                    <PiGavelFill color={theme.palette.primary.main}
                                        style={{ margin: '0 auto', fontSize: '200px', transform: 'rotate(270deg)' }} />
                                }

                                {view === CourtDocumentsView.WARRANT_OF_ARREST_REGISTER &&
                                    <GiArchiveRegister color={theme.palette.primary.main}
                                        style={{ margin: '0 auto', marginLeft: isMobile ? 0 : 100, fontSize: '200px' }} />
                                }
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
            }
        </>
    )
}

export default CourtDocumentsGenerator;
