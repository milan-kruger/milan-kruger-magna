import { render } from "@testing-library/react";
import { JSX, ReactNode } from "react";
import { Provider } from "react-redux";
import { store as rootStore } from "../../../framework/redux/store";

export function renderWithProviders(ui: string | number | boolean | Iterable<ReactNode> | JSX.Element | null | undefined,
    { store = rootStore } = {}) {
    return {
        ...render(<Provider store={rootStore}>{ui}</Provider>),
        store,
    };
}
