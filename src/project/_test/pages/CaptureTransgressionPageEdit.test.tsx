import '../mocks/mui.vi.mock';
import '../mocks/useCaptureTransgressionManager.vi.mock';
import '../mocks/lookupResponse.mock';

import { cleanup, render, screen } from "@testing-library/react";
import CaptureTransgressionPageEdit from "../../pages/prosecution/overload-transgression-manager/CaptureTransgressionPageEdit";
import AuthService from "../../../framework/auth/authService";
import TestingPageWrapper from "../TestingPageWrapper";
import userEvent, { UserEvent } from '@testing-library/user-event'
import { rootReducer } from "../../../framework/redux/store";
import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { transgressionConfig } from '../mocks/transgressionConf.mock';
import { mockPageLookupResponse } from '../mocks/lookupResponse.mock';
import { initialConfigState } from '../mocks/config.mock';
import { transgressionDetails } from '../mocks/transgression.mock';

const t = (key: string) => key ?? 'test';
vi.mock("react-i18next", () => {

    return {
        useTranslation: () => ({
            t,
            i18n: {},
        })
    }
});

vi.mock('../../redux/api/coreApi', async () => {
    const original = await vi.importActual('../../redux/api/coreApi');
    return {
        ...original,
        useGetLookupsQuery: vi.fn(() => ({
            data: mockPageLookupResponse,
            isFetching: false,
        })),
        useGetLoggedInUserQuery: vi.fn(() => ({
            data: {},
            isFetching: false
        })),
        useFindAllIdentityTypesQuery: vi.fn(() => ({
            data: [],
            isFetching: false
        }))
    }
});

vi.mock('../../redux/api/transgressionsApi', async () => {
    const original = await vi.importActual('../../redux/api/transgressionsApi');
    return {
        ...original,
        useFindTransgressionConfigurationQuery: vi.fn(() => ({
            data: {
                transgressionConfigurations: [transgressionConfig]
            },
            isFetching: false
        })),
    }
})

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const setLookUpField = (user: UserEvent, container: HTMLElement, fieldId: string, fieldIdOption: string) => {
    return new Promise((resolve) => {
        const run = async () => {
            const element = container.querySelector(`#${fieldId}`);
            expect(element).toBeInTheDocument();
            if (element) {
                await user.click(element);
                await delay(100);
                const selectOption = document.querySelector(`#${fieldIdOption}`);
                expect(selectOption).toBeInTheDocument();
                if (selectOption) {
                    user.click(selectOption);
                }
                resolve(true);
            }
        }
        run();
    })
};

const setField = (user: UserEvent, container: HTMLElement, fieldId: string, value: string) => {
    return new Promise((resolve) => {
        const run = async () => {
            const element = container.querySelector(`#${fieldId}`);
            expect(element).toBeInTheDocument();
            if (element) {
                await user.type(element, value);
                resolve(true);
            }
        }
        run();
    })
};

const initializeStore = () => configureStore({
    reducer: rootReducer,
});

describe.skip("CaptureTransgressionPageEdit", () => {
    const getUserName = vi.spyOn(AuthService, 'getUserName');
    getUserName.mockReturnValue('testuser');
    const hasRole = vi.spyOn(AuthService, 'hasRole');
    hasRole.mockReturnValue(true);

    let store: EnhancedStore;

    beforeEach(() => {
        store = initializeStore();
    });

    afterEach(() => {
        cleanup();
    });

    test("can render", async () => {
        render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={
                    initialConfigState
                }
            >
                <CaptureTransgressionPageEdit handleEdit={vi.fn()} />
            </TestingPageWrapper>
        );
        await expect(screen.getByText("vehicleTitle")).toBeInTheDocument();
        await expect(screen.getByText("operatorTitle")).toBeInTheDocument();
        await expect(screen.getByText("driverTitle")).toBeInTheDocument();
        await expect(screen.getByText("residentialHeading")).toBeInTheDocument();
        await expect(screen.getByText("businessAddressHeading")).toBeInTheDocument();
        await expect(screen.getByText("chargesHeading")).toBeInTheDocument();
    });

    test("can validate form - invalid form", async () => {
        const user = userEvent.setup();

        const { container } = render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true } }]}
                initialConfigState={
                    initialConfigState
                }
            >
                <CaptureTransgressionPageEdit handleEdit={vi.fn()} />
            </TestingPageWrapper>
        );
        //Vehicle
        await setLookUpField(user, container, 'captureTransgressionVehicleMake', 'captureTransgressionVehicleMakeTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionVehicleColour', 'captureTransgressionVehicleColourTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionOrigin', 'captureTransgressionOriginTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionDestination', 'captureTransgressionDestinationTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionCargo', 'captureTransgressionCargoTestLookupListItem');

        const saveButton = await screen.getByTestId('editHeadingSaveButton');
        expect(saveButton).toBeInTheDocument();
        expect(saveButton).toBeDisabled();
    });

    test("can validate form - valid form", async () => {
        const user = userEvent.setup();

        const { container } = render(
            <TestingPageWrapper
                store={store}
                initialEntries={[{ state: { newTransgression: true, transgressionDetails: transgressionDetails } }]}
                initialConfigState={
                    initialConfigState
                }
            >
                <CaptureTransgressionPageEdit handleEdit={vi.fn()} />
            </TestingPageWrapper>
        );
        //Vehicle
        await setLookUpField(user, container, 'captureTransgressionVehicleMake', 'captureTransgressionVehicleMakeTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionVehicleColour', 'captureTransgressionVehicleColourTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionOrigin', 'captureTransgressionOriginTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionDestination', 'captureTransgressionDestinationTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionCargo', 'captureTransgressionCargoTestLookupListItem');

        //Driver
        await setField(user, container, 'captureTransgressionDriverName', 'Test');
        await setField(user, container, 'captureTransgressionDriverSurname', 'Test');
        await setLookUpField(user, container, 'captureTransgressionDriverCountryOfIssue', 'captureTransgressionDriverCountryOfIssueTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionGender', 'captureTransgressionGenderTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionContactNumberType', 'captureTransgressionContactNumberTypeTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionContactDialingCode', 'captureTransgressionContactDialingCodeTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionDriverCountryOfIssueLicence', 'captureTransgressionDriverCountryOfIssueLicenceTestLookupListItem');
        await setLookUpField(user, container, 'captureTransgressionDriverPrdpCode', 'captureTransgressionDriverPrdpCodeTestLookupListItem');

        // address
        await setField(user, container, 'captureTransgressionAddress', 'Test');
        await setField(user, container, 'captureTransgressionAddressLine2', 'Test');
        await setField(user, container, 'captureTransgressionAddressCity', 'Test');
        await setField(user, container, 'captureTransgressionAddressPostalCode', 'Test');
        await setLookUpField(user, container, 'captureTransgressionAddressCountry', 'captureTransgressionAddressCountryTestLookupListItem');
        const toggle = container.querySelector('#addressToggle');
        expect(toggle).toBeInTheDocument();
        if (toggle) {
            await user.click(toggle);
        }

        const saveButton = screen.getByTestId('editHeadingSaveButton');
        expect(saveButton).toBeInTheDocument();
        expect(saveButton).toBeEnabled();
    }, 30000);
});
