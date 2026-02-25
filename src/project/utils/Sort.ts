import { orderBy } from "es-toolkit";

export type SortOrder = 'asc' | 'desc';

export function stableSort<T extends object>(array: readonly T[], order: SortOrder, key: keyof T) {
    return orderBy(array, [ key ], [ order ]);
}
