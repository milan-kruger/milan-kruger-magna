import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import TmToggleButton from "../../../components/button/TmToggleButton";

test('Render TmToggleButton', () => {
    render(
        <TmToggleButton  testid={'toggleButton'} value={1}>
            1
        </TmToggleButton>
    );
    expect(document.getElementById('toggleButton')).toBeInTheDocument();
});
