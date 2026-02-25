import { t } from "i18next";
import TmButton from "../../../framework/components/button/TmButton";
import { MouseEventHandler } from "react";
import { CourtDocumentsView } from "../../enum/CourtDocumentsView";

type Props = {
    disabled: boolean;
    onClick: MouseEventHandler<HTMLButtonElement> | undefined;
    view: CourtDocumentsView;
}

const CourtDocumentsGeneratorAction = ({ disabled, onClick, view }: Props) => {
    return (
        <TmButton
            testid={"generateCourtDocuments"}
            color={"primary"}
            variant={"contained"}
            size={"medium"}
            disabled={disabled}
            onClick={onClick}
            sx={{
                margin: '50px auto 20px auto !important',
                width: 'fit-content',
                minWidth: '200px'
            }}
        >
            { view === CourtDocumentsView.COURT_RESULTS ? t('submit') : t('generate')}
        </TmButton>
    )
}

export default CourtDocumentsGeneratorAction;
