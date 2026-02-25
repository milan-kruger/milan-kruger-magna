import { Box } from "@mui/material";
import TmButton from "../../../framework/components/button/TmButton";
import { toCamelCaseWords } from "../../../framework/utils";
import { FormState } from "../../redux/capture-court-result/CaptureCourtResultSlice";
import { t } from "i18next";
import { useHotkeys } from "react-hotkeys-hook";

type Props = {
    testIdPrefix: string,
    onSubmitResults: () => void;
    onCancelCourtResults: () => void;
    form: FormState
}

const CaptureCourtResultsAction = ({ testIdPrefix, onSubmitResults, onCancelCourtResults, form }: Readonly<Props>) => {
    
    useHotkeys("ALT+S", () => {
        if (!form.isDirty && !form.validationErrors) {
            onSubmitResults();
        }
    }, {
        preventDefault: true,
        description: String(t('submitResults'))
    });

    useHotkeys("ALT+C", () => {
        onCancelCourtResults();
    }, {
        preventDefault: true,
        description: String(t('cancelCourtResults'))
    });

    return (
        <Box justifyContent={'flex-end'} display={'flex'}>
            <TmButton
                testid={toCamelCaseWords(testIdPrefix, 'courtResults')}
                size="large"
                variant='contained'
                onClick={onSubmitResults}
                disabled={form.isDirty || form.validationErrors}
                style={{ marginRight: '10px' }}>
                {t("submitCourtResults")}
            </TmButton>
            <TmButton
                variant='contained'
                testid={toCamelCaseWords(testIdPrefix, 'courtResultsCancel')}
                size="large"
                onClick={onCancelCourtResults}>
                {t("cancel")}
            </TmButton>
        </Box>
    )

}

export default CaptureCourtResultsAction;
