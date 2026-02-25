import { ReactNode, createContext, useEffect, useMemo, useState } from 'react';

interface WindowContextProps {
    windowHeight: number;
}

export const WindowContext = createContext<WindowContextProps>({
    windowHeight: 0
});

type Props = {
    children?: ReactNode;
};

export const WindowProvider = ({ children }: Props) => {
    const [windowHeight, setWindowHeight] = useState<number>(0);

    useEffect(() => {
        const calculateWindowHeight = () => {
            setWindowHeight(window.innerHeight);
        };
        calculateWindowHeight();
        window.addEventListener("resize", calculateWindowHeight);
        return () => window.removeEventListener("resize", calculateWindowHeight);
    }, []);

    const value = useMemo(() => ({ windowHeight }), [windowHeight]);

    return (
        <WindowContext.Provider value={value}>
            {children}
        </WindowContext.Provider>
    );
};
