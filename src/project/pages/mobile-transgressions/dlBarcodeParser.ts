/**
 * Namibia SADC Driver Licence PDF417 Decoder
 * Hybrid ASCII + Packed BCD format
 *
 * DG = 0xD7  (Data Group separator)
 * EL = 0xF7  (Element separator)
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

    if (start < data.length) {
        result.push(data.slice(start));
    }

    return result;
}

/* ───────────────────────── Packed BCD Decoding ───────────────────────── */

function decodePackedNumeric(bytes: Uint8Array): string {
    let digits = "";

    for (const b of bytes) {
        const high = (b >> 4) & 0x0f;
        const low = b & 0x0f;

        if (high <= 9) digits += high;
        if (low <= 9) digits += low;
    }

    return digits;
}

function decodePackedDate(bytes: Uint8Array): string | null {
    const digits = decodePackedNumeric(bytes);

    if (digits.length !== 8) return null;

    // Namibia format: YYYYMMDD
    const year = digits.slice(0, 4);
    const month = digits.slice(4, 6);
    const day = digits.slice(6, 8);

    return `${day}/${month}/${year}`;
}

function decodeSex(bytes: Uint8Array): string | null {
    if (!bytes.length) return null;

    const firstNibble = (bytes[0] >> 4) & 0x0f;

    // Namibia rule: even = Female, odd = Male
    return firstNibble % 2 === 0 ? "Female" : "Male";
}

/* ───────────────────────── Main Decoder ───────────────────────── */

export function decodeNamibiaLicence(rawText: string): ParsedLicence {
    const bytes = textToBytes(rawText);
    const decoder = new TextDecoder("latin1");

    const fields: ParsedField[] = [];
    const added = new Set<string>();

    const add = (label: string, value?: string | null) => {
        if (!value) return;

        const clean = stripControl(value);
        if (clean && !added.has(label)) {
            added.add(label);
            fields.push({ label, value: clean });
        }
    };

    const groups = splitBytes(bytes, DG);

    for (const group of groups) {
        const rawElements = splitBytes(group, EL);
        if (!rawElements.length) continue;

        const elements = rawElements.map(e =>
            stripControl(decoder.decode(e))
        );

        /* ───────────── Skip biometric block ───────────── */

        if (elements[0]?.startsWith("FMR")) {
            continue;
        }

        /* ───────────── Detect DG1 (Main Identity Block) ───────────── */

        if (elements.includes("ROADS AUTHORITY")) {

            // Layout observed:
            // [0] Surname (ASCII)
            // [1] Names (ASCII)
            // [2] Sex (packed BCD)
            // [3] DOB (packed YYYYMMDD)
            // [4] Personal Number (packed numeric)
            // [5] Country
            // [6] Authority
            // [7] Licence Code
            // [8] Categories

            add("Surname", elements[0]);
            add("Names", elements[1]);

            const sex = decodeSex(rawElements[2]);
            if (sex) add("Sex", sex);

            const dob = decodePackedDate(rawElements[3]);
            if (dob) add("Date of Birth", dob);

            const personal = decodePackedNumeric(rawElements[4]);
            if (personal) add("Personal Number", personal);

            add("Country", elements[5]);
            add("Issuing Authority", elements[6]);
            add("License Code", elements[7]);

            const categories = elements[8]?.split(";")[0];
            add("Categories", categories);
        }

        /* ───────────── Additional Pattern-Based Extraction ───────────── */

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