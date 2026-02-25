import { Dialog, DialogActions, DialogContent, DialogTitle, SxProps, Theme, useTheme } from "@mui/material";
import React, { memo, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import TmButton from "../../../framework/components/button/TmButton";
import CancelIcon from "@mui/icons-material/Cancel";
import CheckIcon from "@mui/icons-material/Check";
import { ChargeType } from "../../enum/ChargeType";
import { createChargeFieldConfig, ChargeFieldValues } from './chargeFieldConfig';
import { ChargeFieldGroup } from './ChargeFieldGroup';

type ChargeTypeDialogProps = {
    testId: string;
    isOpen: boolean;
    onConfirm: () => void;
    handleCloseDialog: () => void;
    chargeType?: string;
    numberOfLamps?: number;
    vehicleHeight?: number;
    allowedHeight?: number;
    roadTravelledOn?: string;
    numberOfTyres?: number;
    vehicleLength?: number;
    numberOfPersons?: number;
    numberOfPanels?: number;
    setNumberOfPersons: (value: number | undefined) => void;
    setVehicleLength: (length: number | undefined) => void;
    setNumberOfTyres: (value: number | undefined) => void;
    setNumberOfLamps: (value: number | undefined) => void;
    setVehicleHeight: (height: number | undefined) => void;
    setAllowedHeight: (height: number | undefined) => void;
    setRoadTravelledOn: (road: string | undefined) => void;
    setNumberOfPanels: (value: number | undefined) => void;
}

const ChargeTypeDialog = ({ testId, isOpen, onConfirm, handleCloseDialog, chargeType, numberOfLamps,
    vehicleHeight, allowedHeight, roadTravelledOn, numberOfTyres, vehicleLength, numberOfPersons, numberOfPanels, setVehicleLength,
    setNumberOfLamps, setVehicleHeight, setAllowedHeight, setRoadTravelledOn, setNumberOfTyres, setNumberOfPersons, setNumberOfPanels }: ChargeTypeDialogProps) => {
    const theme = useTheme();
    const { t } = useTranslation();

    // Specific handlers for TmTextField (uses event)
    const onChangeVehicleHeight = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setVehicleHeight(Number(e.target.value));
    }, [setVehicleHeight]);

    const onChangeAllowedHeight = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setAllowedHeight(Number(e.target.value));
    }, [setAllowedHeight]);

    const onChangeRoadTravelledOn = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setRoadTravelledOn(e.target.value);
    }, [setRoadTravelledOn]);

    // Specific handlers for TmNumberField (uses value directly)
    const onChangeLamps = useCallback((value: number) => {
        setNumberOfLamps(value);
    }, [setNumberOfLamps]);

    const onChangeTyres = useCallback((value: number) => {
        setNumberOfTyres(value);
    }, [setNumberOfTyres]);

    const onChangeNumberOfPersons = useCallback((value: number) => {
        setNumberOfPersons(value);
    }, [setNumberOfPersons]);

    const onChangeNumberOfPanels = useCallback((value: number) => {
        setNumberOfPanels(value);
    }, [setNumberOfPanels]);

    // Special handler for vehicle length (validates decimal format)
    const onChangeVehicleLength = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const raw = e.target.value;
        // Strip anything that's not a digit or dot
        let cleaned = raw.replace(/[^0-9.]/g, '');
        // Allow only ONE dot
        cleaned = cleaned.replace(/(\..*)\./g, '$1');
        // Ensure only one digit after the dot
        if (cleaned.includes('.')) {
            const [integer, decimal] = cleaned.split('.');
            cleaned = `${integer}.${decimal.substring(0, 1)}`;
        }
        setVehicleLength(cleaned as unknown as number);
    }, [setVehicleLength]);

    // Styles
    const style: SxProps<Theme> = {
        padding: '15px 15px 15px 0'
    };

    const styleHeightFields = useMemo<SxProps<Theme>>(
        () => ({
            paddingRight: '10px',
            width: '25%',
            fontWeight: '400',
        }), []);

    // Collect all values for field configuration
    const values = useMemo<ChargeFieldValues>(
        () => ({
            vehicleHeight,
            allowedHeight,
            numberOfLamps,
            roadTravelledOn,
            numberOfTyres,
            vehicleLength,
            numberOfPersons,
            numberOfPanels,
        }),
        [
            vehicleHeight,
            allowedHeight,
            numberOfLamps,
            roadTravelledOn,
            numberOfTyres,
            vehicleLength,
            numberOfPersons,
            numberOfPanels,
        ]
    );

    // Create field configuration map
    const fieldConfig = useMemo(
        () =>
            createChargeFieldConfig(
                {
                    onChangeVehicleHeight,
                    onChangeAllowedHeight,
                    onChangeRoadTravelledOn,
                    onChangeLamps,
                    onChangeTyres,
                    onChangeNumberOfPersons,
                    onChangeNumberOfPanels,
                    onChangeVehicleLength
                },
                values,
                styleHeightFields,
                t
            ),
        [onChangeVehicleHeight, onChangeAllowedHeight, onChangeRoadTravelledOn, onChangeLamps, onChangeTyres, onChangeNumberOfPersons, onChangeNumberOfPanels, onChangeVehicleLength, values, styleHeightFields, t]
    );

    // Validation function to check if all required fields are filled
    const isFormValid = useMemo(() => {
        if (!chargeType) return true;

        // Helper to validate a single charge type
        const validateType = (type: string): boolean => {
            switch (type) {
                case ChargeType.HEIGHT:
                    return (
                        vehicleHeight !== undefined &&
                        vehicleHeight > 0 &&
                        allowedHeight !== undefined &&
                        allowedHeight > 0 &&
                        vehicleHeight !== 0 &&
                        allowedHeight !== 0 &&
                        allowedHeight < vehicleHeight
                    );
                case ChargeType.LAMP:
                    return numberOfLamps !== undefined && numberOfLamps > 0;
                case ChargeType.ROAD:
                    return roadTravelledOn !== undefined && roadTravelledOn !== '';
                case ChargeType.TYRE:
                    return numberOfTyres !== undefined && numberOfTyres > 0;
                case ChargeType.LENGTH:
                    return vehicleLength !== undefined && vehicleLength > 0;
                case ChargeType.PANEL:
                    return numberOfPanels !== undefined && numberOfPanels > 0;
                case ChargeType.PERSON:
                    return numberOfPersons !== undefined && numberOfPersons > 0;
                default:
                    return true;
            }
        };

        // Check for combination charge types (e.g., "HEIGHT_ROAD")
        if (chargeType.includes('_')) {
            const types = chargeType.split('_');
            return types.every(validateType);
        }

        // Single charge type
        return validateType(chargeType);
    }, [
        chargeType,
        vehicleHeight,
        allowedHeight,
        numberOfLamps,
        roadTravelledOn,
        numberOfTyres,
        vehicleLength,
        numberOfPanels,
        numberOfPersons
    ]);

    // Render charge type fields
    const renderChargeTypeFields = () => {
        if (!chargeType) return null;

        // Handle combination charge types
        if (chargeType.includes('_')) {
            const types = chargeType.split('_');
            return types.map((type) => {
                const config = fieldConfig[type as ChargeType];
                if (!config) return null;

                return (
                    <ChargeFieldGroup
                        key={type}
                        config={config}
                        values={values}
                        defaultLabelStyle={style}
                        defaultInputPadding={style}
                        styleHeightFields={styleHeightFields}
                        t={t}
                    />
                );
            });
        }

        // Handle single charge type
        const config = fieldConfig[chargeType as ChargeType];
        if (!config) return null;

        return (
            <ChargeFieldGroup
                config={config}
                values={values}
                defaultLabelStyle={style}
                defaultInputPadding={style}
                styleHeightFields={styleHeightFields}
                t={t}
            />
        );
    };

    return (
        <Dialog id={`${testId}ChargeType`} open={isOpen} onClose={handleCloseDialog}>
            <DialogTitle
                id={`${testId}ChargeType`}
                style={{ color: theme.palette.primary.main, fontWeight: 500, fontSize: '1.5rem' }}
            >
                {t('chargeDetails')}
            </DialogTitle>

            <DialogContent>{renderChargeTypeFields()}</DialogContent>

            <DialogActions>
                <TmButton
                    sx={{ color: theme.palette.secondary.main }}
                    testid={`${testId}DialogConfirmButton`}
                    startIcon={<CheckIcon />}
                    onClick={onConfirm}
                    disabled={!isFormValid}
                >
                    {t('confirm')}
                </TmButton>

                <TmButton
                    testid={`${testId}DialogCloseButton`}
                    startIcon={<CancelIcon />}
                    onClick={handleCloseDialog}
                >
                    {t('close')}
                </TmButton>
            </DialogActions>
        </Dialog>
    );
};

export default memo(ChargeTypeDialog);
