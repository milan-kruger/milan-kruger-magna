/**
 * Namibia SADC Driver Licence PDF417 Decoder
 * Delimiter-based (DG = 0xD7, EL = 0xF7)
 *
 * Compatible with ZXing-wasm Latin-1 output.
 */

const DG = 0xD7; // Data Group separator
const EL = 0xF7; // Element separator

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

        // Remove C0 + C1 control ranges
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

            // Expected layout (observed Namibia 2026 card sample):
            // [0] Surname
            // [1] Names
            // [2–4] Binary attributes (ignore)
            // [5] Country
            // [6] Issuing Authority
            // [7] Licence Number
            // [8] Categories (semicolon separated)

            add("Surname", elements[0]);
            add("Names", elements[1]);
            add("Country", elements[5]);
            add("Issuing Authority", elements[6]);
            add("License Code", elements[7]);

            const categories = elements[8]?.split(";")[0];
            add("Categories", categories);
        }

        /* ───────────── Pattern-based extraction ───────────── */

        for (const el of elements) {

            // Date of Birth (DD/MM/YYYY)
            if (/^\d{2}\/\d{2}\/\d{4}$/.test(el)) {
                add("Date of Birth", el);
            }

            // ID Number (Namibia format: 03/00061900613)
            if (/^\d{2}\/\d{8,}$/.test(el)) {
                add("ID Number", el);
            }

            // Structured Licence Number (e.g. NAM/01/26/0399061/T)
            if (/^[A-Z]{2,3}\/\d+\/\d+\/\d+\/\d+$/.test(el)) {
                add("License Number", el);
            }

            // Sex (explicit ASCII form)
            if (el === "Male" || el === "Female") {
                add("Sex", el);
            }
        }
    }

    return {
        parsed: fields.length > 0,
        fields
    };
}