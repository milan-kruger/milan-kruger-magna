/**
 * Namibia SADC Driver Licence PDF417 Decoder
 * Confirmed layout (2026 revision)
 */


// group 1 = header DG surname
// group 2 = firstnames
// group 3 = DOB (packed date)
// group 4 = valid from (packed date)
// group 5 = valid to (packed date)
// group 6 = country
// group 7 = issuing authority
// group 8 = licence number
// group 9 = category block (contains categories and first issue date)
// group 10 = ID number

const groupDelimiter = 0xf7; // '÷' in Latin-1

export type ParsedField = { label: string; value: string };
export type ParsedLicence = { parsed: boolean; fields: ParsedField[] };

/* ───────────────────────── Utilities ───────────────────────── */

function textToBytes(text: string): Uint8Array {
    const bytes = new Uint8Array(text.length);
    for (let i = 0; i < text.length; i++) {
        bytes[i] = text.charCodeAt(i) & 0xff;
    }
    return bytes;
}

function bytesToText(bytes: Uint8Array): string {
    let result = "";
    for (let i = 0; i < bytes.length; i++) {
        result += String.fromCharCode(bytes[i]);
    }
    return result;
}


function splitBytes(data: Uint8Array, delimiter: number): Uint8Array[] {
    const result: Uint8Array[] = [];
    let start = 0;

    for (let i = 0; i < data.length; i++) {
        if (data[i] === delimiter) {
            if (i > start) result.push(data.slice(start, i));
            start = i + 1;
        }
    }

    if (start < data.length) result.push(data.slice(start));
    return result;
}


/* ───────────────────────── Main Decoder ───────────────────────── */

export function decodeNamibiaLicence(rawText: string): ParsedLicence {
    const bytes = textToBytes(rawText);

    const fields: ParsedField[] = [];

    const groups = splitBytes(bytes, groupDelimiter);

    for (const group of groups) {
        console.log(bytesToText(group));
    }

    return {
        parsed: fields.length > 0,
        fields
    };
}
