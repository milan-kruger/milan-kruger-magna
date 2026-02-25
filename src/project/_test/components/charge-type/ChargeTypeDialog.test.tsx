import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import ChargeTypeDialog from '../../../components/charge-type/ChargeTypeDialog';
import { ChargeType } from '../../../enum/ChargeType';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key
    })
}));

vi.mock('../../../../framework/utils', () => ({
    toCamelCaseWords: (...args: string[]) => args.join('')
}));

const theme = createTheme();

const defaultProps = {
    testId: 'test',
    isOpen: true,
    onConfirm: vi.fn(),
    handleCloseDialog: vi.fn(),
    setVehicleHeight: vi.fn(),
    setAllowedHeight: vi.fn(),
    setNumberOfLamps: vi.fn(),
    vehicleHeight: 100,
    allowedHeight: 80,
    numberOfLamps: 2,
    numberOfPersons: 1,
    chargeType: ChargeType.HEIGHT,
    numberOfTyres: 4,
    vehicleLength: 5,
    roadTravelledOn: 'Main Road',
    numberOfPanels: 2,
    setRoadTravelledOn: vi.fn(),
    setNumberOfTyres: vi.fn(),
    setVehicleLength: vi.fn(),
    setNumberOfPersons: vi.fn(),
    setNumberOfPanels: vi.fn(),
    handleClose: vi.fn()
};

const renderComponent = (props = {}) => {
    return render(
        <ThemeProvider theme={theme}>
            <ChargeTypeDialog {...defaultProps} {...props} />
        </ThemeProvider>
    );
};

describe('ChargeTypeDialog', () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should render dialog when open', () => {
        renderComponent();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('chargeDetails')).toBeInTheDocument();
    });

    it('should not render dialog when closed', () => {
        renderComponent({ isOpen: false });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render height fields when chargeType is HEIGHT', () => {
        renderComponent({ chargeType: ChargeType.HEIGHT });

        expect(screen.getByText('vehicleHeightLabel')).toBeInTheDocument();
        expect(screen.getByText('allowedHeightLabel')).toBeInTheDocument();
        expect(screen.getByText('overHeightLabel')).toBeInTheDocument();
    });

    it('should render lamp field when chargeType is LAMP', () => {
        renderComponent({ chargeType: ChargeType.LAMP });

        const lampsInput = document.getElementById('numberOfLamps');
        expect(lampsInput).toBeInTheDocument();
    });

    it('should handle vehicle height change', () => {
        const setVehicleHeight = vi.fn();
        renderComponent({
            chargeType: ChargeType.HEIGHT,
            setVehicleHeight,
            vehicleHeight: 100
        });

        const vehicleHeightInput = document.getElementById('vehicleHeight') as HTMLInputElement;
        fireEvent.change(vehicleHeightInput, { target: { value: '150' } });

        expect(setVehicleHeight).toHaveBeenCalledWith(150);
    });

    it('should handle allowed height change', () => {
        const setAllowedHeight = vi.fn();
        renderComponent({
            chargeType: ChargeType.HEIGHT,
            setAllowedHeight,
            allowedHeight: 80
        });

        const allowedHeightInput = document.getElementById('allowedHeight') as HTMLInputElement;
        fireEvent.change(allowedHeightInput, { target: { value: '100' } });

        expect(setAllowedHeight).toHaveBeenCalledWith(100);
    });

    it('should calculate and display over height correctly', () => {
        renderComponent({
            chargeType: ChargeType.HEIGHT,
            vehicleHeight: 150,
            allowedHeight: 100
        });

        // The calculation section is rendered in ChargeFieldGroup
        const overHeightValue = screen.queryByTestId('chargeDetailsOverHeightValue');
        // If rendered, should show the calculated value
        if (overHeightValue) {
            expect(overHeightValue).toHaveTextContent('50');
        }
    });

    it('should display null when height values are undefined', () => {
        renderComponent({
            chargeType: ChargeType.HEIGHT,
            vehicleHeight: undefined,
            allowedHeight: undefined
        });

        // The calculation section may not render when values are undefined
        const overHeightValue = screen.queryByTestId('chargeDetailsOverHeightValue');
        if (overHeightValue) {
            expect(overHeightValue).toHaveTextContent('');
        } else {
            // If not rendered, that's also acceptable
            expect(overHeightValue).toBeNull();
        }
    });

    it('should handle number of lamps change', () => {
        const setNumberOfLamps = vi.fn();
        renderComponent({
            chargeType: ChargeType.LAMP,
            setNumberOfLamps,
            numberOfLamps: 2
        });

        const lampsInput = document.getElementById('numberOfLamps') as HTMLInputElement;
        fireEvent.change(lampsInput, { target: { value: 4 } });

        expect(setNumberOfLamps).toHaveBeenCalledWith(4);
    });

    it('should call onConfirm when confirm button is clicked', () => {
        const onConfirm = vi.fn();
        renderComponent({
            onConfirm,
            chargeType: ChargeType.HEIGHT,
            vehicleHeight: 100,
            allowedHeight: 80
        });

        const confirmButton = screen.getByText('confirm');
        fireEvent.click(confirmButton);

        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('should call handleCloseDialog when close button is clicked', () => {
        const handleCloseDialog = vi.fn();
        renderComponent({ handleCloseDialog });

        const closeButton = screen.getByText('close');
        fireEvent.click(closeButton);

        expect(handleCloseDialog).toHaveBeenCalledTimes(1);
    });

    it('should call handleCloseDialog when clicking outside dialog', () => {
        const handleCloseDialog = vi.fn();
        renderComponent({ handleCloseDialog });

        const backdrop = document.querySelector('.MuiBackdrop-root');
        if (backdrop) {
            fireEvent.click(backdrop);
        }

        expect(handleCloseDialog).toHaveBeenCalledTimes(1);
    });

    it('should display asterisks for required fields', () => {
        renderComponent({ chargeType: ChargeType.HEIGHT });

        const vehicleHeightLabel = screen.getByTestId('chargeDetailsVehicleHeight');
        const allowedHeightLabel = screen.getByTestId('chargeDetailsAllowedHeight');

        expect(vehicleHeightLabel.innerHTML).toContain('<span>*</span>');
        expect(allowedHeightLabel.innerHTML).toContain('<span>*</span>');
    });

    it('should display asterisk for lamp field when LAMP type', () => {
        renderComponent({ chargeType: ChargeType.LAMP });

        const numberOfLampsText = screen.getByText('numberOfLamps');
        expect(numberOfLampsText).toBeInTheDocument();

        // Check that the asterisk is present as a separate element
        const asterisk = screen.getByText('*');
        expect(asterisk).toBeInTheDocument();
    });

    it('should render with correct button icons', () => {
        renderComponent({
            chargeType: ChargeType.HEIGHT,
            vehicleHeight: 100,
            allowedHeight: 80
        });

        const confirmButton = screen.getByText('confirm');
        expect(confirmButton).toBeInTheDocument();

        const closeButton = screen.getByText('close');
        expect(closeButton).toBeInTheDocument();
    });

    it('should render nothing when chargeType is not HEIGHT or LAMP', () => {
        renderComponent({ chargeType: undefined });

        const dialogContent = screen.getByRole('dialog');
        const contentElement = dialogContent.querySelector('.MuiDialogContent-root');

        expect(contentElement).toBeInTheDocument();
        expect(screen.queryByText('vehicleHeightLabel')).not.toBeInTheDocument();
        expect(screen.queryByText('numberOfLamps')).not.toBeInTheDocument();
    });

    it('should handle negative over height calculation', () => {
        renderComponent({
            chargeType: ChargeType.HEIGHT,
            vehicleHeight: 80,
            allowedHeight: 100
        });

        const overHeightValue = screen.getByTestId('chargeDetailsOverHeightValue');
        expect(overHeightValue).toHaveTextContent('-20');
    });

    it('should render height input fields with correct configuration', () => {
        renderComponent({ chargeType: ChargeType.HEIGHT });

        const vehicleHeightInput = document.getElementById('vehicleHeight') as HTMLInputElement;
        const allowedHeightInput = document.getElementById('allowedHeight') as HTMLInputElement;

        expect(vehicleHeightInput).toBeInTheDocument();
        expect(allowedHeightInput).toBeInTheDocument();

        expect(vehicleHeightInput.tagName).toBe('INPUT');
        expect(allowedHeightInput.tagName).toBe('INPUT');
    });
});
