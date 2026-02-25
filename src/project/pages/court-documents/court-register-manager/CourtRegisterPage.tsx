import { Box, Stack } from "@mui/material";
import CourtDocumentsGenerator from "../../../components/court-documents/CourtDocumentsGenerator";
import { useTranslation } from "react-i18next";
import useCourtRegisterManager from "../../../hooks/court-documents/CourtRegisterManager";
import TmDialog from "../../../../framework/components/dialog/TmDialog";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { ChangeEvent, useState } from "react";
import { CourtDocumentsView } from "../../../enum/CourtDocumentsView";
import CheckIcon from "@mui/icons-material/Check";
import TmTypography from "../../../../framework/components/typography/TmTypography";
import { toCamelCaseWords } from "../../../../framework/utils";
import TmTextField from "../../../../framework/components/textfield/TmTextField";
import { EditNote, SkipNext } from "@mui/icons-material";
import TmAuthenticationDialog from "../../../../framework/components/dialog/TmAuthenticationDialog";

function CourtRegisterPage() {

  const { t } = useTranslation();
  const [showPersonnel, setShowPersonnel] = useState(false);
  const [showUnadjudicatedSubmissionsDialog, setShowUnadjudicatedSubmissionsDialog] = useState(false);
  const [isSupervisorAuthDialogOpen, setIsSupervisorAuthDialogOpen] = useState(false);

  const {
    isLoading,
    handleGenerateCourtRegister,
    adjudicationTimeFence,
    courtNameList,
    allPersonnelFieldsEmpty,
    disablePersonnelFields,
    courts,
    presidingOfficer,
    publicProsecutor,
    clerkOfTheCourt,
    interpreter,
    showUpdatePersonnelBtn,
    transgressionsSummaryList,
    supervisorUsername,
    setSupervisorUsername,
    supervisorPassword,
    setSupervisorPassword,
    handleOnSkip,
    handleOnSubmit,
    handleOnUpdatePersonnel,
    handlePresidingOfficerChange,
    handlePublicProsecutorChange,
    handleClerkOfTheCourtChange,
    handleInterpreterChange,
    handleSupervisorAuthConfirm,
    handleUnadjudicatedConfirm,
    fieldsUpdated,
    isErrorAuthentication,
    notApproved
  } = useCourtRegisterManager(
    setShowUnadjudicatedSubmissionsDialog,
    setShowPersonnel,
    setIsSupervisorAuthDialogOpen);

  return (
    <Box width={"100%"}>
      <CourtDocumentsGenerator
        heading={t("generateCourtRegister")}
        subHeading={t("courtRegisterSubHeading")}
        isLoading={isLoading}
        handleGenerateDocuments={handleGenerateCourtRegister}
        adjudicationTimeFence={adjudicationTimeFence}
        courtNameList={courtNameList}
        courts={courts}
        view={CourtDocumentsView.COURT_REGISTER}
      />

      {/* Court Personnel */}
      <TmDialog
        testid={'courtPersonnelDiaolog'}
        title={t("courtPersonnel")}
        message={t("courtPersonnelSubTitle")}
        personnelDialog={true}
        isOpen={showPersonnel}
        showConfirmButton={true}
        confirmLabel={t('submit')}
        confirmIcon={<CheckIcon />}
        cancelLabel={t('cancel')}
        cancelIcon={<CancelOutlinedIcon />}
        onCancel={() => setShowPersonnel(false)}
        onConfirm={handleOnSubmit}
        onSkip={handleOnSkip}
        skipIcon={<SkipNext />}
        skipLabel={t('skip')}
        onUpdate={handleOnUpdatePersonnel}
        updateIcon={<EditNote />}
        updateLabel={t('update')}
        showSkip={true}
        showUpdate={showUpdatePersonnelBtn}
        disableConfirmButton={allPersonnelFieldsEmpty || !fieldsUpdated()}
        contentComponent={
          <Stack>
            <TmTextField
              testid={"presidingOfficer"}
              label={t('presidingOfficer')}
              value={presidingOfficer}
              onChange={handlePresidingOfficerChange}
              required={false}
              disabled={disablePersonnelFields}
              readonly={false}
              sx={{ marginBottom: 10, width: '40%' }}
            />

            <TmTextField
              testid={"publicProsecutor"}
              label={t('publicProsecutor')}
              value={publicProsecutor}
              onChange={handlePublicProsecutorChange}
              required={false}
              disabled={disablePersonnelFields}
              readonly={false}
              sx={{ marginBottom: 10, width: '40%' }}
            />

            <TmTextField
              testid={"clerkOfTheCourt"}
              label={t('clerkOfTheCourt')}
              value={clerkOfTheCourt}
              onChange={handleClerkOfTheCourtChange}
              required={false}
              disabled={disablePersonnelFields}
              readonly={false}
              sx={{ marginBottom: 10, width: '40%' }}
            />

            <TmTextField
              testid={"interpreter"}
              label={t('interpreter')}
              value={interpreter}
              onChange={handleInterpreterChange}
              required={false}
              disabled={disablePersonnelFields}
              readonly={false}
              sx={{ marginBottom: 10, width: '40%' }}
            />
          </Stack>
        }
      />

      {/* Unadjudicated */}
      <TmDialog
        testid={'unadjudicatedSubmissionsDialog'}
        title={t("unadjudicatedSummaryTransgression")}
        message={t("courtTransgressionNote")}
        isOpen={showUnadjudicatedSubmissionsDialog}
        showConfirmButton={true}
        confirmLabel={t('confirm')}
        confirmIcon={<CheckIcon />}
        cancelLabel={t('cancel')}
        cancelIcon={<CancelOutlinedIcon />}
        onCancel={() => setShowUnadjudicatedSubmissionsDialog(false)}
        onConfirm={handleUnadjudicatedConfirm}
        contentComponent={
          <Stack>
            {
              transgressionsSummaryList?.map((transgression, index) => (
                <TmTypography testid={toCamelCaseWords('transgressionSummary', index.toString())} variant='body1'>
                  {`${index + 1}. ${transgression.driver?.firstNames} ${transgression.driver?.surname} : ${transgression.noticeNumber.number} `}
                </TmTypography>
              ))
            }
          </Stack>
        }
      />

      {/* Supervisor authorize */}
      <TmAuthenticationDialog
        testid="driverDetailsSupervisorAuthDialog"
        isOpen={isSupervisorAuthDialogOpen}
        onCancel={() => setIsSupervisorAuthDialogOpen(false)}
        title={t('updateCourtRegister')}
        message={t('updateCourtRegisterSubtitle')}
        username={supervisorUsername}
        password={supervisorPassword}
        cancelLabel={t('cancel')}
        confirmLabel={t('confirm')}
        medium={true}
        cancelIcon={<CancelOutlinedIcon />}
        confirmIcon={<CheckIcon />}
        onConfirm={handleSupervisorAuthConfirm}
        handlePasswordOnChange={(value: string) => {
          setSupervisorPassword(value);
        }}
        handleUsernameOnChange={(event: ChangeEvent<HTMLInputElement>) => {
          setSupervisorUsername(event.target.value?.toUpperCase())
        }}
        isAuthenticationError={isErrorAuthentication || notApproved}
      />
    </Box>
  );
}

export default CourtRegisterPage;
