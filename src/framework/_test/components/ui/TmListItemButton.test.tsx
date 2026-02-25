import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { TmListItemButton } from "../../../components/list/TmListItemButton";

test('Render TmListItemButton', () => {
    render(
        <TmListItemButton id={'listItemButton'}>ListItemButton</TmListItemButton>
    );
    expect(document.getElementById('listItemButton')).toBeInTheDocument();
});
