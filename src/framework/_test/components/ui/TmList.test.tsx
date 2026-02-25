import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { Box } from "@mui/material";
import { TmList } from "../../../components/list/TmList";

const TestRow = () => <Box id="testItem" />;

test('Render TmList', () => {
    render(
        <TmList
            rowHeight={() => 10}
            rowCount={1}
            rowComponent={TestRow}
            rowProps={{}}
            style={{ height: 100, width: 100 }}
        />
    );
    expect(document.getElementById('testItem')).toBeInTheDocument();
});
