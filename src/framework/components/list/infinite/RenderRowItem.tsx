import { CSSProperties, ReactElement, memo, useEffect, useRef } from "react";
import TmLoadingSpinner from "../../progress/TmLoadingSpinner";

type RenderRowItemProps = {
    index: number;
    style: CSSProperties;
    data: any[];
    setRowHeight: (index: number, size: number) => void;
    isItemLoaded: (index: number) => boolean;
    renderRowButton: (item: any, index: number) => ReactElement;
}

function RenderRowItem({ index, style, data, setRowHeight, isItemLoaded, renderRowButton }: RenderRowItemProps) {
    const subRowRefs = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (subRowRefs.current) {
            setRowHeight(index, subRowRefs.current.clientHeight);
        }
    }, [index, setRowHeight, subRowRefs]);
    return (
        <div style={style}>
            <div ref={subRowRefs}>
                {isItemLoaded(index)
                    ? renderRowButton(data[index], index)
                    : <TmLoadingSpinner testid={'rowItemLoadSpinner'} size={25} />
                }
            </div>
        </div>
    );
}

export default memo(RenderRowItem);
