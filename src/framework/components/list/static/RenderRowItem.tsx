import { CSSProperties, ReactElement, memo, useEffect, useRef } from 'react';

type RenderRowItemProps = {
    index: number;
    style: CSSProperties;
    data: any[];
    setRowHeight: (index: number, size: number) => void;
    renderRowButton: (item: any, index: number) => ReactElement;
}

function RenderRowItem({ index, style, data, setRowHeight, renderRowButton }: RenderRowItemProps) {
    const subRowRefs = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (subRowRefs.current) {
            setRowHeight(index, subRowRefs.current.clientHeight);
        }
    }, [index, setRowHeight, subRowRefs]);
    return (
        <div style={style}>
            <div ref={subRowRefs}>
                {renderRowButton(data[index], index)}
            </div>
        </div>
    );
}

export default memo(RenderRowItem);
