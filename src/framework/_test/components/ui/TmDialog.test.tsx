import { CircleOutlined } from "@mui/icons-material";
import { render, screen } from "@testing-library/react";
import TmDialog from "../../../components/dialog/TmDialog";
import MockReduxProvider from "../../MockReduxProvider";

test('Render TmDialog', () => {
    render(
        <MockReduxProvider>
            <TmDialog
                testid={'dialog'}
                title={'Tm Dialog'}
                message={''}
                isOpen={true}
                cancelLabel={''}
                cancelIcon={<CircleOutlined />}
                onCancel={() => { }}
            />
        </MockReduxProvider>
    );
    expect(screen.getByText(/Tm Dialog/)).toBeInTheDocument();
});
