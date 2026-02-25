import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { TmListSubheader } from "../../../components/list/TmListSubheader";

test('Render TmListSubheader', () => {
    render(
        <TmListSubheader id={'listSubheader'}>Subheader</TmListSubheader>
    );
    expect(document.getElementById('listSubheader')).toBeInTheDocument();
});
