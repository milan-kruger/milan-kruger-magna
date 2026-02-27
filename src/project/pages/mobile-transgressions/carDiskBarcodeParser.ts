/**
 * Parser for Namibian car disc (vehicle licence disk) PDF417 barcodes.
 *
 * The raw text is %-delimited, e.g.:
 *   %MVL1CC97%0121%5001A1J5%1%5001005DCVK1%N23937W%RYF777H%Pick-up%DAIHATSU%OTHER%White%MHKT3CA100K002307%DBZ6391%2027-01-31%
 *
 * Known field layout (0-indexed after splitting on %):
 *   [0]  Reference code 1
 *   [1]  Reference code 2
 *   [2]  Reference code 3
 *   [3]  Flag
 *   [4]  Reference code 4
 *   [5]  Registration number
 *   [6]  Reference code 5
 *   [7]  Vehicle type (e.g. Pick-up, Sedan)
 *   [8]  Make (e.g. DAIHATSU, TOYOTA)
 *   [9]  Model / variant
 *   [10] Colour
 *   [11] VIN / Chassis number
 *   [12] Licence disc number
 *   [13] Expiry date (YYYY-MM-DD)
 */

import type { ParsedField, ParsedDLBarcode } from './dlBarcodeParser';

/** Detect whether a raw barcode string looks like a Namibian car disk barcode. */
export function isCarDiskBarcode(rawValue: string): boolean {
    // Must start and end with %, contain at least 10 %-separated segments,
    // and have a date-like value near the end.
    if (!rawValue.startsWith('%') || !rawValue.endsWith('%')) return false;
    const parts = rawValue.split('%').filter(p => p.length > 0);
    if (parts.length < 10) return false;
    // Check that the last segment looks like a date (YYYY-MM-DD)
    return /^\d{4}-\d{2}-\d{2}$/.test(parts[parts.length - 1]);
}

/**
 * Parses a Namibian car disc (vehicle licence disk) barcode string.
 *
 * Returns the same shape as `parseDLBarcode` so they can be used interchangeably.
 */
export function parseCarDiskBarcode(rawValue: string): ParsedDLBarcode {
    if (!isCarDiskBarcode(rawValue)) {
        return { parsed: false, fields: [] };
    }

    const parts = rawValue.split('%').filter(p => p.length > 0);
    const fields: ParsedField[] = [];

    const add = (label: string, value: string | undefined) => {
        if (value && value.trim()) {
            fields.push({ label, value: value.trim() });
        }
    };

    add('Registration Number', parts[5]);
    add('Vehicle Type', parts[7]);
    add('Make', parts[8]);
    add('Model', parts[9]);
    add('Colour', parts[10]);
    add('VIN', parts[11]);
    add('Licence Disc Number', parts[12]);
    add('Expiry Date', parts[13]);

    return { parsed: fields.length > 0, fields };
}

