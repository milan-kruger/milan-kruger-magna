import { Dispatch, ReactNode, SetStateAction, useMemo, useState } from "react";
import { TransgressionContext } from "./TransgressionContext";

export type Transgression = {
  id: number;
}

export type TransgressionContextState = {
  isAdding: boolean;
  setIsAdding: Dispatch<SetStateAction<boolean>>;
  transgression?: Transgression;
  setTransgression?: Dispatch<SetStateAction<Transgression | undefined>>;
}

type Props = {
  children?: ReactNode;
}

export default function TransgressionContextProvider({  children }: Readonly<Props>) {
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [transgression, setTransgression] = useState<Transgression | undefined>(undefined);
  const contextValue = useMemo(() => ({isAdding, setIsAdding, transgression, setTransgression }), [ isAdding, transgression]);
  return (
      <TransgressionContext.Provider
          value={contextValue}
      >
          {children}
      </TransgressionContext.Provider>
  )
}