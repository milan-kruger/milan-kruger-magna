import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import TmTextField from '../../../components/textfield/TmTextField';
import MockTheme from '../../MockTheme';

test('Render TmInputTextField', () => {
    render(
        <MockTheme>
            <TmTextField
                testid={'tmTextfield'}
                label='input-field'
                disabled={true}
                readonly={true}
                onChange={() => { }}
            />
        </MockTheme>
    );
    expect(document.getElementById('tmTextfield')).toBeInTheDocument();
});
