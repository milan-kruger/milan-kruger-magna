import { Box, Container } from "@mui/material";
import { useTranslation } from "react-i18next";
import TmTypography from "../../../framework/components/typography/TmTypography";
import TransgressionsListTable from "../../components/transgression-details/transgression-list/TransgressionsListTable";
import TransgressionListSearch from "../../components/transgression-details/transgression-list/TransgressionListSearch";
import { useState } from "react";

import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import useOverloadTransgressionListManager from "../../hooks/transgression-details/OverloadTransgressionListManager";
import { TransgressionType } from "../../enum/TransgressionType";

function OverloadTransgressionList() {

  const { t } = useTranslation();

  const [ noticeNo, setNoticeNo ] = useState<string>(null as unknown as string);
  const [ searchValue, setSearchValue ] = useState<string>('');

  const {
    rows,
    handleFindTransgressions,
    handleSearchTransgressions,
    handleTransgressionClick,
    isFetchingTransgressionList
  } = useOverloadTransgressionListManager(noticeNo, setSearchValue, setNoticeNo);

  return (
    <Container maxWidth={false} disableGutters sx={{ margin: '0 auto', width:'100%'}}>
      <Box margin={10} marginTop={3} textAlign='left'>
        <TmTypography testid={'overloadTransgressionList'} variant='h5' color='primary' marginBottom={10} fontWeight={"500"}>
          {t('overloadTransgressionList')}
        </TmTypography>

        <TransgressionListSearch onFindTransgressions={handleFindTransgressions}
          onSearchTransgression={handleSearchTransgressions}/>

        {isFetchingTransgressionList ? <TmLoadingSpinner testid='DialogListLoadSpinner' />
        : <TransgressionsListTable rows={rows} searchValue={searchValue}
            onTransgressionClick={handleTransgressionClick} transgressionType={TransgressionType.OVERLOAD}/>
        }
      </Box>
    </Container>
  );
}

export default OverloadTransgressionList;
