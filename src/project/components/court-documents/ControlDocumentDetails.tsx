import { FormControlLabel, FormGroup, Stack } from "@mui/material";
import TmAutocomplete from "../../../framework/components/textfield/TmAutocomplete";
import { t } from "i18next";
import { ReactNode } from "react";
import TmCheckbox from "../../../framework/components/selection/TmCheckbox";

type Props = {
    noticeTypeList: string[];
    noticeType: string | null;
    handleNoticeTypeChange: (event: React.SyntheticEvent<Element, Event>, newValue: string | null) => void;
    noticeTypeError: () => boolean;
    pagePerOfficer: boolean;
    handlePagePerOfficerChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void;
}

const ControlDocumentDetails = ({ noticeType, noticeTypeList, noticeTypeError, handleNoticeTypeChange,
    pagePerOfficer, handlePagePerOfficerChange }: Props) => {
    return (
        <Stack spacing={10}>
            <FormGroup>
                <TmAutocomplete
                    testid={"noticeType"}
                    label={t("noticeType")}
                    renderInput={(): ReactNode => { return }}
                    options={noticeTypeList}
                    value={noticeType}
                    error={noticeTypeError()}
                    onChange={handleNoticeTypeChange}
                    required={true}
                    disabled={false}
                />

                <FormControlLabel
                    control={<TmCheckbox
                        testid="officerPerPage"
                        onChange={handlePagePerOfficerChange}
                        value={pagePerOfficer}
                    ></TmCheckbox>}
                    label={t("officerPerPage")}
                ></FormControlLabel>
            </FormGroup>
        </Stack>
    )
}

export default ControlDocumentDetails;
