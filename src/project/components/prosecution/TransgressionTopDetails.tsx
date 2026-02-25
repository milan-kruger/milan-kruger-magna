import { Box, useMediaQuery, Theme, Stack } from "@mui/material";
import { memo } from "react";
import { useTranslation } from "react-i18next";
import TmTypography from "../../../framework/components/typography/TmTypography";
import toCamelCase, { toCamelCaseWords } from "../../../framework/utils";
import dayjs from "dayjs";
import { OverloadTransgressionDto, RetrieveTransgressionInformationResponse } from "../../redux/api/transgressionsApi";
import { TransgressionType } from "../../enum/TransgressionType";

type Props = {
  data: OverloadTransgressionDto | RetrieveTransgressionInformationResponse,
  status: string
  officerName: string
  team: string
  plateNumber: string
  transgressionType: TransgressionType
};

function TransgressionTopDetails({ data, status, officerName, team, plateNumber, transgressionType }: Readonly<Props>) {
  const { t } = useTranslation();
  const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
  const isMiniMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('sm'));
  const newWidth = '100px';
  const breakpoints = {
    flex: {
      xs: "100%",
      sm: "calc(50% - 50px)",
      md: "calc(33% - 50px)",
      lg: "calc(25% - 50px)"
    },
  };

  const elementArray = [
    {
      label: t('transgressionDate'),
      value: dayjs(new Date(data.transgressionDate)).format('DD/MM/YYYY HH:mm'),
      testidLabel: t('transgressionDateLabel'),
      testidValue: 'transgressionDate',
      width: newWidth,
    },
    {
      label: t('status'),
      value: t(status),
      testidLabel: t('transgressionStatusLabel'),
      testidValue: 'transgressionStatus',
      width: newWidth,
    },
    {
      label: t('transgressionOfficer'),
      value: officerName,
      testidLabel: t('transgressionOfficerLabel'),
      testidValue: 'transgressionOfficer',
      width: newWidth,
    },
    {
      label: t('transgressionTeam'),
      value: team,
      testidLabel: t('transgressionTeamLabel'),
      testidValue: 'transgressionTeam',
      width: newWidth,
    },
  ];

  if (transgressionType === TransgressionType.OVERLOAD) {
    elementArray.unshift({
      label: t('plateNo'),
      value: plateNumber,
      testidLabel: t('plateNoLabel'),
      testidValue: 'plateNo',
      width: newWidth,
    });
  }

  return (
    <Box sx={breakpoints}>
      <Box>
        <Box alignSelf="start" flexGrow={2}>
          <Box
            sx={{
              columnGap: isMobile ? 5 : 10,
              display: 'flex',
              flexFlow: 'wrap',
              flexDirection: isMobile ? 'column' : 'row'
            }}
          >
            {elementArray.map(({ label, value, testidLabel, testidValue, width }, index) => (
              <Box key={index} sx={{ minWidth: width, maxWidth: 300 }}>
                <Stack direction={isMiniMobile ? 'column' : 'row'} gap={5}>
                  <TmTypography
                    testid={toCamelCaseWords('editHeading', toCamelCase(testidLabel))}
                    fontWeight="bold"
                  >
                    {label}:
                  </TmTypography>
                  <TmTypography testid={toCamelCaseWords('editHeading', toCamelCase(testidValue))}>
                    {value}
                  </TmTypography>
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );


}

export default memo(TransgressionTopDetails)
