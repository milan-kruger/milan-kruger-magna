import { render } from "vitest-browser-react";
import TransgressionView from "../../../components/submission/TransgressionView";
import { OverloadTransgressionDto } from "../../../redux/api/transgressionsApi";
import { ThemeProvider, createTheme } from "@mui/material";
import { screen } from "@testing-library/react";
import { MockData } from "../../mocks/MockData";

const mockOverloadTransgression: OverloadTransgressionDto = {
    type: "OverloadTransgressionDto",
    sequenceNumber: 0,
    status: "CREATED",
    transgressionDate: "",
    transgressionLocation: "",
    transgressionVersion: 0,
    authorityCode: "",
    noticeNumber: {
        dateCreated: "",
        number: "",
        sequentialNumber: 0,
        authorityCode: "",
        amount: {
            currency: "",
            amount: 0
        }
    },
    vehicle: {
        position: undefined,
        vehicleType: undefined,
        colour: undefined,
        grossVehicleMass: undefined,
        vehicleMake: undefined,
        vehicleModel: undefined,
        vehicleUsage: undefined,
        vehicleCategory: undefined,
        plateNumber: "",
        vehicleIdentificationNumber: undefined,
        cargo: undefined,
        axleUnits: undefined
    },
    snapshotCharges: [],
    totalAmountPayable: {
        currency: "",
        amount: 0
    }
};

const theme = createTheme();

const renderComponent = (props = {}) => {
    return render(
        <ThemeProvider theme={theme}>
            <TransgressionView
                transgression={mockOverloadTransgression}
                transgressionConfig={MockData.getTransgressionConfiguration}
                {...props}
            />
        </ThemeProvider>
    );
};

describe("TransgressionView", () => {
    test("should render component", () => {
        renderComponent();
    });

    test("should render transgression details section", () => {
        renderComponent();

        expect(screen.getByText("plateNumber")).toBeInTheDocument();
        expect(screen.getByText("transgressionDate")).toBeInTheDocument();
        expect(screen.getByText("transgressionStatus")).toBeInTheDocument();
        expect(screen.getByText("transgressionOfficer")).toBeInTheDocument();
        expect(screen.getByText("transgressionTeam")).toBeInTheDocument();
    });

    test("should render vehicle details section", () => {
        renderComponent();

        expect(screen.getByText("vehicleMake")).toBeInTheDocument();
        expect(screen.getByText("vehicleModel")).toBeInTheDocument();
        expect(screen.getByText("vehicleColour")).toBeInTheDocument();
        expect(screen.getByText("origin")).toBeInTheDocument();
        expect(screen.getByText("destination")).toBeInTheDocument();
        expect(screen.getByText("cargo")).toBeInTheDocument();
    });

    test("should render operator details section", () => {
        renderComponent();

        expect(screen.getByText("depotNumber")).toBeInTheDocument();
        expect(screen.getByText("depotName")).toBeInTheDocument();
        expect(screen.getByText("operatorName")).toBeInTheDocument();
        expect(screen.getByText("operatorDiscNumber")).toBeInTheDocument();
        expect(screen.getByText("emailAddress")).toBeInTheDocument();
    });

    test("should render driver details section", () => {
        renderComponent();

        expect(screen.getByText("driverName")).toBeInTheDocument();
        expect(screen.getByText("driverSurname")).toBeInTheDocument();
        expect(screen.getByText("identificationType")).toBeInTheDocument();
        expect(screen.getByText("identificationNumber")).toBeInTheDocument();
        expect(screen.getByText("countryOfIssue")).toBeInTheDocument();
        expect(screen.getByText("dateOfBirth")).toBeInTheDocument();
        expect(screen.getByText("gender")).toBeInTheDocument();
        expect(screen.getByText("driverOccupation")).toBeInTheDocument();
        expect(screen.getByText("contactNumberType")).toBeInTheDocument();
        expect(screen.getByText("dialingCode")).toBeInTheDocument();
        expect(screen.getByText("contactNumber")).toBeInTheDocument();
        expect(screen.getByText("driverCountryOfIssueLicence")).toBeInTheDocument();
        expect(screen.getByText("driverLicenceCode")).toBeInTheDocument();
        expect(screen.getByText("driverLicenceNo")).toBeInTheDocument();
        expect(screen.getByText("driverPrdpCode")).toBeInTheDocument();
        expect(screen.getByText("driverPrdpNo")).toBeInTheDocument();
        expect(screen.getByText("trn")).toBeInTheDocument();
    });

    test("should render residential and business address sections", () => {
        renderComponent();

        expect(screen.getAllByText("address")).toHaveLength(2);
        expect(screen.getAllByText("addressLine2")).toHaveLength(2);
        expect(screen.getAllByText("city")).toHaveLength(2);
        expect(screen.getAllByText("addressPostalCode")).toHaveLength(2);
        expect(screen.getAllByText("country")).toHaveLength(2);
    });

    test("should render charge details section", () => {
        renderComponent();

        expect(screen.getByText("chargesHeading")).toBeInTheDocument();
    });
});
