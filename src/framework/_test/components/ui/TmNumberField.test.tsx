import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TmNumberField from '../../../components/textfield/TmNumberField';

const user = userEvent.setup();

test('Render TmNumberField', () => {
    render(
        <TmNumberField
            testid={'numberField'}
            label='number-field'
            value={5}
            onChange={() => { }}
        />
    );
    expect(document.getElementById('numberField')).toBeInTheDocument();
});

test('Increment TmNumberField', async () => {
    const onChangeMock = vi.fn((value) => value);
    render(
        <TmNumberField
            testid={'numberField'}
            label='number-field'
            value={5}
            onChange={onChangeMock}
        />
    );
    const incrementButton = document.getElementById('numberFieldIncrementButton')!;
    await user.click(incrementButton);
    expect(onChangeMock).toHaveBeenLastCalledWith(6);
});

test('Decrement TmNumberField', async () => {
    const onChangeMock = vi.fn((value) => value);
    render(
        <TmNumberField
            testid={'numberField'}
            label='number-field'
            value={3}
            onChange={onChangeMock}
        />
    );
    const decrementButton = document.getElementById('numberFieldDecrementButton')!;
    await user.click(decrementButton);
    expect(onChangeMock).toHaveBeenLastCalledWith(2);
});

test('Decrement-If-Zero TmNumberField', async () => {
    const onChangeMock = vi.fn((value) => value);
    render(
        <TmNumberField
            testid={'numberField'}
            label='number-field'
            value={0}
            onChange={onChangeMock}/>
    );
    const decrementButton = document.getElementById('numberFieldDecrementButton')!;
    await user.click(decrementButton);
    // onChangeMock wont be called since value is 0
    expect(onChangeMock).toHaveBeenCalledTimes(0);
});

test('OnChange TmNumberField', async () => {
    const events: unknown[] = [];
    const onChangeMock = vi.fn().mockImplementation((e) => {
        events.push(e);
    });
    const { getByRole } = render(
        <TmNumberField
            testid={'numberField'}
            label='number-field'
            value={5}
            onChange={onChangeMock}
        />
    );
    const input = getByRole('textbox') as HTMLInputElement;
    await user.clear(input);
    await user.type(input, '28');
    expect(onChangeMock).toHaveBeenCalledTimes(3);
    events.forEach((e) => {
        expect(onChangeMock).toHaveBeenCalledWith(e);
    });
});
