import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import TmLoadingSpinner from "../../../components/progress/TmLoadingSpinner";

test('Render TmLoadingSpinner', async () => {
    render(<TmLoadingSpinner testid={'loadSpinner'} />);
    await expect(document.getElementById('loadSpinner')).toBeVisible();
});
