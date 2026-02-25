import { ReactNode, useEffect, useRef, useState } from "react";
type Props = {
    children: ReactNode | ReactNode[];
    delay?: number
    enableReload?: boolean;
    showImidiately?: boolean;
}
const TmReloadElement = ({ children, delay = 500, enableReload = true, showImidiately = false }: Props) => {
    const [showElement, setShowElement] = useState(true);
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        if (showImidiately) {
            setShowElement(showImidiately);
        } else {
            if (enableReload) {
                setShowElement(false);
                timeoutRef.current = setTimeout(() => {
                    setShowElement(true);
                }, delay);
            }

            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }

    }, [setShowElement, delay, enableReload, showImidiately]);

    return (
        <>
            {showElement && children}
        </>
    )
}

export default TmReloadElement;
