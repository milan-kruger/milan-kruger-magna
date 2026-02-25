import { createContext } from "react";
import { TransgressionContextState } from "./CaptureTransgressionContext";

export const TransgressionContext = createContext<TransgressionContextState>({
    isAdding: true,
    setIsAdding: () => ''
})