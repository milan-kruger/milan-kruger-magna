/**
 * Namibia ISO 18013-2 Driver Licence Decoder
 * Non-TLV implementation (delimiter-based).
 *
 * Works with ZXing-wasm Latin-1 output.
 */

const DG = 0xD7;
const EL = 0xF7;

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

function stripControl(s: string): string {
    let result = "";
    for (let i = 0; i < s.length; i++) {
        const code = s.charCodeAt(i);

        // Remove C0 (0x00–0x1F) and C1 (0x7F–0x9F) control blocks
        if (
            (code >= 0x00 && code <= 0x1f) ||
            (code >= 0x7f && code <= 0x9f)
        ) {
            continue;
        }

        result += s[i];
    }

    return result.trim();
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

function decodeCompactNumeric(bytes: Uint8Array): string {
    let result = "";
    for (const b of bytes) {
        const high = (b >> 4) & 0x0f;
        const low = b & 0x0f;
        if (high <= 9) result += high;
        if (low <= 9) result += low;
    }
    return result;
}

function decodeDOB(bytes: Uint8Array): string | null {
    const digits = decodeCompactNumeric(bytes);

    if (digits.length !== 8) return null;

    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    return `${day}/${month}/${year}`;
}

function decodeSex(bytes: Uint8Array): string | null {
    if (!bytes.length) return null;
    const firstNibble = (bytes[0] >> 4) & 0x0f;
    return firstNibble % 2 === 0 ? "Female" : "Male";
}

/* ───────────────────────── Main Decoder ───────────────────────── */

export function decodeNamibiaLicence(rawText: string): ParsedLicence {
    const bytes = textToBytes(rawText);
    const decoder = new TextDecoder("latin1");

    const fields: ParsedField[] = [];
    const added = new Set<string>();

    const add = (label: string, value: string | null | undefined) => {
        if (!value) return;
        const clean = stripControl(value);
        if (clean && !added.has(label)) {
            added.add(label);
            fields.push({ label, value: clean });
        }
    };

    const groups = splitBytes(bytes, DG);

    let dg1Found = false;

    for (const group of groups) {
        const rawElements = splitBytes(group, EL);
        if (!rawElements.length) continue;

        const elements = rawElements.map(e =>
            stripControl(decoder.decode(e))
        );

        /* ───────────── Detect DG1 by authority marker ───────────── */

        if (!dg1Found && elements.includes("ROADS AUTHORITY")) {
            dg1Found = true;

            if (rawElements.length >= 9) {
                add("Surname", elements[0]);
                add("Initials", elements[1]);

                add("Sex", decodeSex(rawElements[2]));
                add("Date of Birth", decodeDOB(rawElements[3]));

                const personal = decodeCompactNumeric(rawElements[4]);
                if (personal) add("Personal Number", personal);

                add("Country", elements[5]);
                add("Issuing Authority", elements[6]);
                add("License Code", elements[7]);

                const categories = elements[8]?.split(";")[0];
                add("Categories", categories);
            }
        }

        /* ───────────── Detect ID Number ───────────── */

        for (const el of elements) {
            if (/^\d{2}\/\d{8,}$/.test(el)) {
                add("ID Number", el);
            }

            if (/^[A-Z]{2,3}\/\d+\/\d+\/\d+\/\d+$/.test(el)) {
                add("License Number", el);
            }
        }
    }

    return {
        parsed: fields.length > 0,
        fields
    };
}