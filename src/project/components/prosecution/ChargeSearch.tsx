import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import SearchIcon from '@mui/icons-material/Search';
import { Dialog, DialogContent, DialogTitle, IconButton, Stack, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow } from "@mui/material";
import { t } from "i18next";
import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import TmTextField from "../../../framework/components/textfield/TmTextField";
import TmTypography from "../../../framework/components/typography/TmTypography";
import { toCamelCaseWords, toTitleCase } from "../../../framework/utils";
import { ZeroMoney } from '../../utils/ZeroMoney';
import { LoadCharge, RtqsCharge, SpeedCharge } from "../../redux/api/transgressionsApi";
import { TmRtqsCharge } from "./ChargeListEdit";
import ChargeTypeDialog from '../charge-type/ChargeTypeDialog';
import TmButton from '../../../framework/components/button/TmButton';

export type ChargeRowProps = {
    chargeCode: string;
    chargeTitle: string;
    chargeShortDescription: string;
    regulation: string;
    onClick?: () => void;
    value: RtqsCharge | LoadCharge | SpeedCharge;
}

type ChargeRowData = ChargeRowProps & {
    key: string;
}

type FormProps = {
    searchText: string;
}

const TableColumns = [
    t('chargeCode'),
    t('chargeTitle'),
    t('regulation'),
    ''
];

const RowElement = ({ chargeCode, chargeTitle, chargeShortDescription, regulation, onClick }: ChargeRowProps) => {
    const wrapText = useCallback((text: string, doWrap: boolean) => {
        return doWrap ? text.substring(0, 30) + ' ...' : text;
    }, []);
    const [collapsed, setCollapsed] = useState(true);

    return (
        <TableRow
            sx={{
                '&:last-child td, &:last-child th': { border: 0 }
            }}
        >
            <TableCell onClick={onClick} width={150} component="th" scope="row">
                {chargeCode}
            </TableCell>
            <TableCell onClick={onClick} width={300} align="left">
                <Stack gap={5}>
                    <TmTypography testid="chargeTitle">{chargeTitle}</TmTypography>
                    {!collapsed && <TmTypography sx={{ opacity: '60%' }} testid="chargeShortDescription">{chargeShortDescription}</TmTypography>}
                </Stack>
            </TableCell>
            <TableCell onClick={onClick} width={250} align="left">{wrapText(regulation, collapsed)}</TableCell>
            <TableCell width={50} align="right">
                <Stack sx={{ display: 'grid', justifyContent: 'center' }}>
                    <IconButton sx={{ cursor: 'pointer', width: 20, height: 20, }} onClick={() => {
                        setCollapsed(!collapsed)
                    }}>
                        {collapsed ? <ExpandMoreIcon /> : <ExpandLessIcon />}
                    </IconButton>
                </Stack>
            </TableCell>
        </TableRow>
    )
};

type Props = {
    testId: string;
    open: boolean;
    setOpen: (value: boolean) => void;
    itemIndex: number;
    updateCharges: TmRtqsCharge[];
    setUpdateCharges: (value: TmRtqsCharge[]) => void;
    charges: (LoadCharge | RtqsCharge | SpeedCharge)[];
    supervisorApprovalCopy: boolean;
    numberOfLamps?: number;
    vehicleHeight?: number;
    allowedHeight?: number;
    roadTravelledOn?: string;
    numberOfTyres?: number;
    vehicleLength?: number;
    numberOfPersons?: number;
    numberOfPanels?: number;
    setVehicleHeight: (height: number | undefined) => void;
    setAllowedHeight: (height: number | undefined) => void;
    setNumberOfLamps: (numberOfLamps: number | undefined) => void;
    setRoadTravelledOn: (road: string | undefined) => void;
    setNumberOfTyres: (tyres: number | undefined) => void;
    setVehicleLength: (length: number | undefined) => void;
    setNumberOfPersons: (numberOfPersons: number | undefined) => void;
    setNumberOfPanels: (numberOfPanels: number | undefined) => void;

}

const TmChargeSearch = ({ testId, open, setOpen, itemIndex, updateCharges, setUpdateCharges, charges, supervisorApprovalCopy,
    numberOfLamps, vehicleHeight, allowedHeight, roadTravelledOn, numberOfTyres, vehicleLength, numberOfPersons, numberOfPanels, setVehicleHeight,
    setAllowedHeight, setNumberOfLamps, setRoadTravelledOn, setNumberOfTyres, setVehicleLength, setNumberOfPersons, setNumberOfPanels
}: Props) => {
    const { control, watch, setValue } = useForm<FormProps>(
        {
            mode: "all",
            defaultValues: {
                searchText: ""
            }
        }
    );
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [openChargeDetails, setOpenChargeDetails] = useState(false);
    const [getChargeType, setGetChargeType] = useState<string | undefined>()
    const [remainingChargeTypes, setRemainingChargeTypes] = useState<string[]>([])
    const [pendingCharge, setPendingCharge] = useState<TmRtqsCharge | null>(null);

    // Local state for ChargeTypeDialog - prevents triggering parent handlers during editing
    const [localVehicleHeight, setLocalVehicleHeight] = useState<number | undefined>();
    const [localAllowedHeight, setLocalAllowedHeight] = useState<number | undefined>();
    const [localNumberOfLamps, setLocalNumberOfLamps] = useState<number | undefined>();
    const [localRoadTravelledOn, setLocalRoadTravelledOn] = useState<string | undefined>();
    const [localNumberOfTyres, setLocalNumberOfTyres] = useState<number | undefined>();
    const [localVehicleLength, setLocalVehicleLength] = useState<number | undefined>();
    const [localNumberOfPersons, setLocalNumberOfPersons] = useState<number | undefined>();
    const [localNumberOfPanels, setLocalNumberOfPanels] = useState<number | undefined>();

    useEffect(() => {
        if (open) {
            setPage(0);
            setRowsPerPage(5);
            setValue('searchText', "");
        }
    }, [open, setValue])

    const rows = charges ? charges.map((charge, index) => {
        const mappedCharge: ChargeRowData = {
            chargeCode: charge.chargeCode,
            chargeTitle: charge.chargeTitle ?? '',
            regulation: charge.specificRegulation ?? '',
            chargeShortDescription: charge.chargeShortDescription ?? '',
            key: toCamelCaseWords('charge', charge.chargeCode, index.toString()),
            value: charge
        }
        return mappedCharge;
    }) : [];

    const handleChangePage = (
        _event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const filteredRows = useCallback((rows: ChargeRowData[], searchText: string) => {
        return rows.filter((row) => {
            return row.chargeTitle.toLowerCase().includes(searchText.toLowerCase())
                || row.regulation.toLowerCase().includes(searchText.toLowerCase())
                || row.chargeCode.toLowerCase().includes(searchText.toLowerCase())
                || row.chargeShortDescription.toLowerCase().includes(searchText.toLowerCase());
        });
    }, []);

    const onItemClick = useCallback((value: RtqsCharge | LoadCharge | SpeedCharge) => {
        const prevValue = { ...updateCharges[itemIndex] };
        const getType = (value as RtqsCharge)?.chargeType;

        const updatedCharge: TmRtqsCharge = {
            isNew: false, // Charge is no longer new once selected from chargebook
            isAlternative: prevValue.isAlternative,
            chargeTitle: value.chargeTitle ?? '',
            chargeId: value.chargeId ?? '',
            chargeCode: value.chargeCode ?? '',
            fineAmount: value.fineAmount ?? ZeroMoney,
            actualCharge: value,
            supervisorApproval: prevValue.supervisorApproval || true, // Keep it editable
            chargePrevSupervisorApproval: supervisorApprovalCopy,
            plateNumber: prevValue.plateNumber,
            linkedTo: prevValue.linkedTo,
            linkedToIndex: prevValue.linkedToIndex,
            updatedInSession: true, // Mark as updated in this edit session
            allowedHeight: prevValue.chargeCode === value.chargeCode ? prevValue.allowedHeight : allowedHeight,
            vehicleHeight: prevValue.chargeCode === value.chargeCode ? prevValue.vehicleHeight : vehicleHeight,
            numberOfLamps: prevValue.chargeCode === value.chargeCode ? prevValue.numberOfLamps : numberOfLamps,
            roadTravelledOn: prevValue.chargeCode === value.chargeCode ? prevValue.roadTravelledOn : roadTravelledOn,
            numberOfTyres: prevValue.chargeCode === value.chargeCode ? prevValue.numberOfTyres : numberOfTyres,
            vehicleLength: prevValue.chargeCode === value.chargeCode ? prevValue.vehicleLength : vehicleLength,
            numberOfPersons: prevValue.chargeCode === value.chargeCode ? prevValue.numberOfPersons : numberOfPersons,
            numberOfPanels: prevValue.chargeCode === value.chargeCode ? prevValue.numberOfPanels : numberOfPanels
        };

        if (value && getType) {
            // Store charge temporarily - snapshot creation will happen when dialog is confirmed
            setPendingCharge(updatedCharge);

            // Initialize local dialog state with preserved values - no parent handlers called
            setLocalVehicleHeight(updatedCharge.vehicleHeight);
            setLocalAllowedHeight(updatedCharge.allowedHeight);
            setLocalNumberOfLamps(updatedCharge.numberOfLamps);
            setLocalRoadTravelledOn(updatedCharge.roadTravelledOn);
            setLocalNumberOfTyres(updatedCharge.numberOfTyres);
            setLocalVehicleLength(updatedCharge.vehicleLength);
            setLocalNumberOfPersons(updatedCharge.numberOfPersons);
            setLocalNumberOfPanels(updatedCharge.numberOfPanels);

            // Update dialog state with preserved values
            setVehicleHeight(updatedCharge.vehicleHeight);
            setAllowedHeight(updatedCharge.allowedHeight);
            setNumberOfLamps(updatedCharge.numberOfLamps);
            setRoadTravelledOn(updatedCharge.roadTravelledOn);
            setNumberOfTyres(updatedCharge.numberOfTyres);
            setVehicleLength(updatedCharge.vehicleLength);
            setNumberOfPersons(updatedCharge.numberOfPersons);
            setNumberOfPanels(updatedCharge.numberOfPanels);

            setTimeout(() => {
                setGetChargeType(getType);
                setOpenChargeDetails(true);
            }, 0);
        } else {
            // No charge type - update immediately (no snapshot creation needed)
            const newValue = [...updateCharges];
            newValue[itemIndex] = updatedCharge;

            // Update charges directly
            setUpdateCharges(newValue);
            setOpen(false);
        }
    }, [updateCharges, itemIndex, supervisorApprovalCopy, allowedHeight, vehicleHeight, numberOfLamps, roadTravelledOn,
        numberOfTyres, vehicleLength, numberOfPersons, numberOfPanels, setVehicleHeight, setAllowedHeight, setNumberOfLamps,
        setRoadTravelledOn, setNumberOfTyres, setVehicleLength, setNumberOfPersons, setNumberOfPanels, setUpdateCharges, setOpen]);

    const saveChargeWith = useCallback(() => {
        // Update charges only when dialog is confirmed and charge has chargeType
        if (pendingCharge) {
            // Update pendingCharge with current local dialog values
            const updatedPendingCharge = {
                ...pendingCharge,
                vehicleHeight: localVehicleHeight,
                allowedHeight: localAllowedHeight,
                numberOfLamps: localNumberOfLamps,
                roadTravelledOn: localRoadTravelledOn,
                numberOfTyres: localNumberOfTyres,
                vehicleLength: localVehicleLength,
                numberOfPersons: localNumberOfPersons,
                numberOfPanels: localNumberOfPanels
            };

            const newValue = [...updateCharges];
            newValue[itemIndex] = updatedPendingCharge;
            setUpdateCharges(newValue);

            setPendingCharge(null);
        }

        if (remainingChargeTypes.length > 0) {
            setGetChargeType(remainingChargeTypes[0]);
            setRemainingChargeTypes(remainingChargeTypes.slice(1));
        } else {
            setOpenChargeDetails(false);
            setOpen(false);
        }
    }, [itemIndex, pendingCharge, remainingChargeTypes, setOpen, setUpdateCharges, updateCharges, localVehicleHeight,
        localAllowedHeight, localNumberOfLamps, localRoadTravelledOn, localNumberOfTyres, localVehicleLength,
        localNumberOfPersons, localNumberOfPanels])

    return (
        <>
            <Dialog data-testid={testId} id={testId} open={open} fullWidth={true} maxWidth="lg">
                <DialogTitle>
                    <TmTypography color="primary" fontWeight={"bold"} testid="searchChargeDialogTitle" fontSize={'1.5rem'}>
                        {toTitleCase(t("chargesHeading"))}
                    </TmTypography>
                </DialogTitle>
                <DialogContent>
                    <Controller
                        name="searchText"
                        control={control}
                        render={({ field: { onChange, value } }) => (
                            <TmTextField
                                onChange={(event) => {
                                    setPage(0);
                                    onChange(event);
                                }}
                                value={value}
                                hiddenLabel
                                type="text"
                                testid="chargeSearch"
                                placeholder={`${t("searchList")} ...`}
                                variant="outlined"
                                sx={{
                                    '.MuiInputBase-input': { margin: '8px' },
                                }}
                                startAdornment={
                                    <SearchIcon></SearchIcon>
                                } />
                        )}
                    ></Controller>

                    <TableContainer >
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {TableColumns.map((value, index) => (
                                        <TableCell key={toCamelCaseWords('header', index.toString())} sx={{ fontWeight: 'bold' }}>{value}</TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {(
                                    rowsPerPage > 0
                                        ? filteredRows(rows, watch('searchText')).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        : filteredRows(rows, watch('searchText'))
                                ).map((value) => (
                                    <RowElement
                                        chargeCode={value.chargeCode}
                                        chargeTitle={value.chargeTitle}
                                        regulation={value.regulation}
                                        chargeShortDescription={value.chargeShortDescription}
                                        value={value.value}
                                        key={value.key}
                                        onClick={() => onItemClick(value.value)}
                                    />
                                ))
                                }
                            </TableBody>
                            <TableFooter sx={{ '& td': { border: 'none' } }}>
                                <TableRow sx={{ borderTop: "1px solid #e0e0e0" }}>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25, { label: t('all'), value: -1 }]}
                                        colSpan={0}
                                        count={filteredRows(rows, watch('searchText')).length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        labelRowsPerPage={t('labelRowsPerPage')}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                    />
                                </TableRow>
                                <TableRow>
                                    <TableCell colSpan={3} />
                                    <TableCell>
                                        <Stack>
                                            <TmButton
                                                testid={toCamelCaseWords("chargeSearch", 'closeButton')}
                                                type='submit'
                                                startIcon={<HighlightOffOutlinedIcon />}
                                                onClick={() => {
                                                    setOpen(false);
                                                }}
                                            >
                                                {t("close")}
                                            </TmButton>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </TableContainer>
                </DialogContent>
            </Dialog>

            <ChargeTypeDialog
                testId={''}
                isOpen={openChargeDetails}
                numberOfLamps={localNumberOfLamps}
                allowedHeight={localAllowedHeight}
                vehicleHeight={localVehicleHeight}
                roadTravelledOn={localRoadTravelledOn}
                numberOfTyres={localNumberOfTyres}
                vehicleLength={localVehicleLength}
                numberOfPersons={localNumberOfPersons}
                numberOfPanels={localNumberOfPanels}
                setNumberOfLamps={setLocalNumberOfLamps}
                setVehicleHeight={setLocalVehicleHeight}
                setAllowedHeight={setLocalAllowedHeight}
                setRoadTravelledOn={setLocalRoadTravelledOn}
                setNumberOfTyres={setLocalNumberOfTyres}
                setNumberOfPersons={setLocalNumberOfPersons}
                setNumberOfPanels={setLocalNumberOfPanels}
                setVehicleLength={setLocalVehicleLength}
                onConfirm={saveChargeWith}
                handleCloseDialog={() => {
                    setOpenChargeDetails(false);
                    setRemainingChargeTypes([]);
                }}
                chargeType={getChargeType}
            />
        </>

    )
};

export default TmChargeSearch;
