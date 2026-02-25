import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { CircleOutlined } from '@mui/icons-material';
import TmActionIconButton from '../../../components/button/TmActionIconButton';

test('Render TmIconButton', () => {
    render(
        <TmActionIconButton testid={'testIcon'}>s
            <CircleOutlined />
        </TmActionIconButton>
    );
    expect(document.getElementById('testIcon')).toBeInTheDocument();
});
