import { ReactElement, memo, useEffect, useRef } from 'react';
import { List, RowComponentProps } from 'react-window';
import RenderRowItem from './RenderRowItem';

type InfiniteListProps<T> = {
    /**
     * Array of all items loaded.
     */
    items: T[];
    /**
     * Callback function responsible for rendering the row's button
     */
    renderRowButton: (item: T, index: number) => ReactElement;
    /**
     * Ref needed to determine the height of the list
     */
    height: number;
    /**
     * When specified the list will scroll to the provided index (showing it on top)
     */
    scrollToIndex?: number;
}

function StaticList<T>({ items, renderRowButton, height, scrollToIndex }: InfiniteListProps<T>) {
    // Row Size
    const listRef = useRef<{ readonly element: HTMLDivElement | null; scrollToRow(config: { index: number; align?: "start" | "center" | "auto" | "end" | "smart"; behavior?: "auto" | "instant" | "smooth" }): void } | null>(null);
    const rowHeights = useRef<Record<number, number>>({});
    function getRowHeight(index: number): number {
        return rowHeights.current[index] + 2 || 74;
    }
    function setRowHeight(index: number, size: number): void {
        rowHeights.current = { ...rowHeights.current, [index]: size };
    }

    useEffect(() => {
        if (scrollToIndex && listRef.current) {
            listRef.current.scrollToRow({ index: scrollToIndex, align: 'start' });
        }
    }, [scrollToIndex]);

    // RENDER
    return (
        <List
            rowCount={items.length}
            rowHeight={getRowHeight}
            style={{ width: '100%', height, paddingBottom: 5, overflowX: 'hidden' }}
            overscanCount={3}
            rowComponent={(rowProps: RowComponentProps & { setRowHeight: typeof setRowHeight; renderRowButton: typeof renderRowButton; data: T[] }) => (
                <RenderRowItem
                    index={rowProps.index}
                    style={rowProps.style}
                    data={rowProps.data}
                    setRowHeight={rowProps.setRowHeight}
                    renderRowButton={rowProps.renderRowButton}
                />
            )}
            rowProps={{ setRowHeight, renderRowButton, data: items }}
            listRef={listRef}
            tagName='ul'
        />
    );
}

export default memo(StaticList);
