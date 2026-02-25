import { Box, Theme, useMediaQuery, useTheme } from "@mui/material"
import { Money, OverloadTransgression } from "../../redux/api/transgressionsApi";
import CaptureCourtResultsDetails from "./CaptureCourtResultsDetails";
import CaptureCourtResultsForm from "./CaptureCourtResultsForm";
import CaptureCourtResultsAction from "./CaptureCourtResultsAction";
import { useAppSelector } from "../../../framework/redux/hooks";
import { selectForm } from "../../redux/capture-court-result/CaptureCourtResultSlice";
import dayjs from "dayjs";

const testIdPrefix = "captureCourtResults";

type Props = {
    transgressionDetails: OverloadTransgression;
    onSubmitResults: () => void;
    onCancelCourtResults: () => void;
    showWarrantNumber?: boolean;
    courtDateList: dayjs.Dayjs[];
    contemptOfCourtFee?: Money
}

function CaptureCourtResults({ transgressionDetails, onSubmitResults,
    onCancelCourtResults, showWarrantNumber, courtDateList, contemptOfCourtFee
}: Readonly<Props>) {
    const theme = useTheme();
    const isMobile = useMediaQuery<Theme>((theme) => theme.breakpoints.down('md'));
    const fieldWith = '22em';

    const form = useAppSelector(selectForm);

    const containerBorderStyle = {
        columnGap: isMobile ? 5 : 10,
        display: 'flex',
        flexFlow: 'wrap',
        flexDirection: isMobile ? 'column' : 'row',
        border: `2px solid ${theme.palette.primary.main}`,
        padding: '10px',
        borderRadius: '5px',
        margin: '0 0 10px',
    }

    const containerBorderBox2 = {
        border: `2px solid ${theme.palette.primary.main}`,
        padding: '10px',
        borderRadius: '5px',
        marginBottom: '10px'
    }

    return (
        <Box>
            <CaptureCourtResultsDetails
                transgressionDetails={{
                    noticeNumber: transgressionDetails.noticeNumber.number ?? '',
                    offenderName: ((transgressionDetails.driver?.firstNames || '') + ' ' + (transgressionDetails.driver?.surname || '')).trim(),
                    plateNumber: transgressionDetails.vehicle?.plateNumber,
                    identificationNumber: transgressionDetails.driver?.identification?.number ?? ''
                }}
                sx={containerBorderStyle}
            />

            <CaptureCourtResultsForm
                testIdPrefix={testIdPrefix}
                sx={containerBorderBox2}
                transgressionDetails={{
                    status: transgressionDetails.status,
                    courtAppearanceDate: transgressionDetails.courtAppearanceDate ?? '',
                    noticeNumber: transgressionDetails.noticeNumber.number,
                    snapshotCharges: transgressionDetails.snapshotCharges,
                    totalAmountPayable: transgressionDetails.totalAmountPayable.amount,
                    paymentReference: transgressionDetails.paymentReference ?? ''
                }}
                fieldWith={fieldWith}
                form={form}
                showWarrantNumber={showWarrantNumber}
                courtDateList={courtDateList}
                contemptOfCourtFee={contemptOfCourtFee}
            />

            <CaptureCourtResultsAction
                testIdPrefix={testIdPrefix}
                onSubmitResults={onSubmitResults}
                onCancelCourtResults={onCancelCourtResults}
                form={form}
            />

        </Box>

    )
}

export default CaptureCourtResults;
