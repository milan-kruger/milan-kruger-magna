import { ReactElement, memo, useRef } from 'react';
import { List, RowComponentProps } from 'react-window';
import RenderRowItem from './RenderRowItem';

type InfiniteListProps<T> = {
    testId: string;
    /**
     * Are there more items to load?
     * (This information comes from the most recent API request.)
     */
    hasNextPage: boolean;
    /**
     * Are we currently loading a page of items?
     * (This may be an in-flight flag in your Redux store for example.)
     */
    isNextPageLoading: boolean;
    /**
     * Array of items loaded so far.
     */
    items: T[];
    /**
     * Callback function responsible for loading the next page of items.
     */
    loadNextPage: (startIndex: number, stopIndex: number) => Promise<void> | void;
    /**
     * Callback function responsible for rendering the row's button
     */
    renderRowButton: (item: T, index: number) => ReactElement;
    /**
     * Ref needed to determine the height of the list
     */
    height: number;
}

function InfiniteList<T>({ hasNextPage, isNextPageLoading, items, loadNextPage, renderRowButton, height }: InfiniteListProps<T>) {
    // If there are more items to be loaded then add an extra row to hold a loading indicator.
    const itemCount = hasNextPage ? items.length + 1 : items.length;

    // Only load 1 page of items at a time.
    const loadMoreItems = isNextPageLoading ? () => {} : loadNextPage;

    // Every row is loaded except for our loading indicator row.
    const isItemLoaded = (index: number) => {
        return !hasNextPage || index < items.length;
    };

    // Row Size
    const rowHeights = useRef<Record<number, number>>({});
    function getRowHeight(index: number): number {
        return rowHeights.current[index] + 4 || 74;
    }
    function setRowHeight(index: number, size: number): void {
        rowHeights.current = { ...rowHeights.current, [index]: size };
    }


    return (
        <List
            rowCount={itemCount}
            rowHeight={getRowHeight}
            style={{ width: '100%', height, paddingBottom: 5 }}
            overscanCount={3}
            rowComponent={(rowProps: RowComponentProps & { setRowHeight: typeof setRowHeight; renderRowButton: typeof renderRowButton; isItemLoaded: typeof isItemLoaded; data: T[] }) => (
                <RenderRowItem
                    index={rowProps.index}
                    style={rowProps.style}
                    data={rowProps.data}
                    isItemLoaded={rowProps.isItemLoaded}
                    setRowHeight={rowProps.setRowHeight}
                    renderRowButton={rowProps.renderRowButton}
                />
            )}
            rowProps={{ setRowHeight, renderRowButton, isItemLoaded, data: items }}
            tagName='ul'
            onRowsRendered={({ stopIndex }) => {
                if (hasNextPage && !isNextPageLoading && stopIndex >= itemCount - 1) {
                    if (typeof loadMoreItems === 'function') loadMoreItems(items.length, itemCount - 1);
                }
            }}
        />
    );
}

export default memo(InfiniteList);
