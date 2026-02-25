import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import TmTab from "../../../components/tab/TmTab";

test('Render TmTab', () => {
    render(
        <TmTab testid='tmTab'/>
    );
    expect(document.getElementById('tmTab')).toBeInTheDocument();
});
