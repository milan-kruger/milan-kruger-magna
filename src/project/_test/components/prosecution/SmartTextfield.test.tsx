import { render, fireEvent, screen } from '@testing-library/react';
import { transgressionSlice } from '../../../redux/transgression/transgressionSlice';
import SmartTextfield from '../../../components/prosecution/SmartTextfield';

// Mock dispatch
const dispatchMock = vi.fn();
vi.mock('../../../../framework/redux/hooks', () => ({
    useAppDispatch: () => dispatchMock
}));

// Mock useMediaQuery to always return false (desktop)
vi.mock('@mui/material', async () => {
    const original = await vi.importActual('@mui/material');
    return {
        ...original,
        useMediaQuery: vi.fn(() => {
            return false;
        }),
        useTheme: vi.fn()
    };
});

vi.mock("../../../../framework/utils", async () => {
    const actual = await vi.importActual("../../../../framework/utils");

    return {
        ...actual,
        containsSpecialCharacters: vi.fn(() => true)
    };
});

// Mock TmTextField to observe props
vi.mock('../../../../framework/components/textfield/TmTextField', () => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    default: (props: any) => (
        <input
            data-testid={props.testid}
            value={props.value}
            onChange={props.onChange}
            onKeyDown={(e) => {
                props.onKeyDown?.(e);
            }}
        />
    )
}));

describe('SmartTextfield', () => {
    beforeEach(() => {
        dispatchMock.mockClear();
    });

    it('should render with given props', () => {
        render(
            <SmartTextfield
                testid="my-field"
                label="Test"
                fieldKey="some.key"
                fieldValue="hello"
                required={true}
                disabled={false}
                readonly={false}
                error={false}
                fieldType="text"
            />
        );
        expect(screen.getByTestId('my-field')).toBeInTheDocument();
    });

    it('should dispatch uppercase value and call onChange', () => {
        const onChangeMock = vi.fn();
        render(
            <SmartTextfield
                testid="my-field"
                label="Test"
                fieldKey="some.key"
                fieldValue=""
                required={true}
                disabled={false}
                readonly={false}
                error={false}
                fieldType="text"
                onChange={onChangeMock}
            />
        );
        const input = screen.getByTestId('my-field');
        fireEvent.change(input, { target: { value: 'abc' } });

        expect(dispatchMock).toHaveBeenCalledWith(
            transgressionSlice.actions.setFormDataField({
                key: 'some.key',
                value: 'ABC'
            })
        );
        expect(onChangeMock).toHaveBeenCalledWith(expect.any(Object), 'ABC');
    });

    it('should remove spaces if removeSpaces is true', () => {
        render(
            <SmartTextfield
                testid="space-field"
                label="Test"
                fieldKey="some.key"
                fieldValue=""
                required={true}
                disabled={false}
                readonly={false}
                error={false}
                fieldType="text"
                removeSpaces={true}
            />
        );
        const input = screen.getByTestId('space-field');
        fireEvent.change(input, { target: { value: 'a b c' } });

        expect(dispatchMock).toHaveBeenCalledWith(
            transgressionSlice.actions.setFormDataField({
                key: 'some.key',
                value: 'ABC'
            })
        );
    });

    it('should dispatch validation for special characters', () => {
        render(
            <SmartTextfield
                testid="special-field"
                label="Special"
                fieldKey="special.key"
                fieldValue=""
                required={false}
                disabled={false}
                readonly={false}
                error={false}
                fieldType="text"
                checkForSpecialCharacters={true}
                errorKey="myError"
            />
        );

        const input = screen.getByTestId('special-field');
        fireEvent.change(input, { target: { value: '@test' } });

        expect(dispatchMock).toHaveBeenCalledWith(
            transgressionSlice.actions.setFormFieldValidation({
                key: 'myError',
                value: true
            })
        );
    });

    it('should prevent space key if removeSpaces is true', () => {
        render(
            <SmartTextfield
                testid="keydown-field"
                label="Keydown"
                fieldKey="some.key"
                fieldValue=""
                required={true}
                disabled={false}
                readonly={false}
                error={false}
                fieldType="text"
                removeSpaces={true}
            />
        );

        const input = screen.getByTestId('keydown-field');

        const event = new KeyboardEvent('keydown', {
            key: ' ',
            bubbles: true,
            cancelable: true,
        });

        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        input.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('should prevent invalid keys for number type', () => {
        render(
            <SmartTextfield
                testid="num-field"
                label="Num"
                fieldKey="some.key"
                fieldValue=""
                required={true}
                disabled={false}
                readonly={false}
                error={false}
                fieldType="number"
            />
        );

        const input = screen.getByTestId('num-field');

        const event = new KeyboardEvent('keydown', {
            key: 'e',
            bubbles: true,
            cancelable: true,
        });

        const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

        input.dispatchEvent(event);

        expect(preventDefaultSpy).toHaveBeenCalled();
    });

});
