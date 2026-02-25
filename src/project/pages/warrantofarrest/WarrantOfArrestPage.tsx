import { useMemo } from "react";
import SecuredContent from "../../../framework/auth/components/SecuredContent";
import useWarrantOfArrestManager from "../../hooks/warrant-of-arrest/WarrantOfArrestManager";
import TmLoadingSpinner from "../../../framework/components/progress/TmLoadingSpinner";
import { Box } from "@mui/material";
import { t } from "i18next";
import { SearchByOptions, WarrantOfArrestSearchBy } from "../../components/warrant-of-arrest/WarrantOfArrestSearchBy";
import { useHotkeys } from "react-hotkeys-hook";

const WarrantOfArrestPage = () => {
    const {
        isLoading,
        onSubmit,
        onValueChanges,
        courtDetails,
        searchByError,
        searchCriteria,
        courtDate,
        courtName,
        courtRoom
    } = useWarrantOfArrestManager();

    //Hotkeys
    useHotkeys(
        "ALT+S",
        () => {
            if (searchCriteria?.searchBy !== SearchByOptions.court) {
                if (searchCriteria?.searchBy && searchCriteria.searchValue && searchCriteria.isValid) {
                    onSubmit(searchCriteria.searchBy, searchCriteria.searchValue);
                }
            }

            if (searchCriteria?.searchBy && courtDate && courtName && courtRoom && searchCriteria.isValid) {
                onSubmit(searchCriteria.searchBy, searchCriteria.searchValue);
            }

        },
        {
            preventDefault: true,
            enableOnFormTags: true,
            description: String(t("submit")),
        }
    );

    return (
        <SecuredContent accessRoles={useMemo(() => ['WARRANTOFARREST_MAINTAIN'], [])}>
            {isLoading ? <TmLoadingSpinner testid={'warrantOfArrestSpinner'} /> :
                <Box width={'100%'}>
                    <WarrantOfArrestSearchBy
                        id="warrantOfArrest"
                        heading={t('warrantOfArrest')}
                        subHeading={t('warrantOfArrestSubHeading')}
                        onSubmit={onSubmit}
                        onChange={onValueChanges}
                        courtDetails={courtDetails}
                        searchBy={searchByError?.searchBy}
                        searchText={searchByError?.searchText}
                    />
                </Box>

            }
        </SecuredContent>
    )
}

export default WarrantOfArrestPage;
