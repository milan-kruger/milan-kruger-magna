import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import TmSnackbar from "../../../components/snackbar/TmSnackbar";

test('Render TmSnackbar', () => {
    render(
        <TmSnackbar
            testid='test'
            snackbarType={'error'}
            message={'snackbar-test'}
            isOpen={true}
            onClose={() => { }}
        />
    );
    expect(document.getElementById('testSnackbar')).toBeInTheDocument();
});
