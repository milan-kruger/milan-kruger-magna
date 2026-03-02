/**
 * Namibia SADC Driver Licence PDF417 Decoder
 * Confirmed layout (2026 revision)
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
        ) continue;

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

/* ───────────────────────── BCD Decoding ───────────────────────── */

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

    const year = digits.slice(0, 4);
    const month = digits.slice(4, 6);
    const day = digits.slice(6, 8);

    return `${day}/${month}/${year}`;
}

/* ───────────────────────── Gender From ID ───────────────────────── */

function deriveGenderFromID(id: string): string | null {
    const digits = id.replace(/\D/g, "");
    if (digits.length < 11) return null;

    const sequence = parseInt(digits.slice(6, 11), 10);
    if (isNaN(sequence)) return null;

    return sequence < 50000 ? "Female" : "Male";
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

        // Skip biometric block
        if (elements[0]?.startsWith("FMR")) continue;

        // Detect DG1 block
        if (elements.includes("ROADS AUTHORITY")) {

            add("Surname", elements[0]);
            add("Names", elements[1]);

            const dob = decodePackedDate(rawElements[2]);
            if (dob) add("Date of Birth", dob);

            const validFrom = decodePackedDate(rawElements[3]);
            if (validFrom) add("Valid From", validFrom);

            const validTo = decodePackedDate(rawElements[4]);
            if (validTo) add("Valid To", validTo);

            add("Country", elements[5]);
            add("Issuing Authority", elements[6]);
            add("Licence Number", elements[7]);

            // Category block
            const categoryBlock = rawElements[8];
            const categoryAscii = stripControl(decoder.decode(categoryBlock));
            const category = categoryAscii.split(";")[0];
            add("Categories", category);

            // Extract first issue date from packed dates in category block
            for (let i = 0; i <= categoryBlock.length - 4; i++) {
                const slice = categoryBlock.slice(i, i + 4);
                const decoded = decodePackedDate(slice);
                if (decoded) {
                    add("First Issue Date", decoded);
                    break;
                }
            }
        }

        // Extract ID number and derive gender
        for (const el of elements) {
            if (/^\d{2}\/\d{8,}$/.test(el)) {
                add("ID Number", el);

                const gender = deriveGenderFromID(el);
                if (gender) add("Sex", gender);
            }

            if (/^[A-Z]{2,3}\/\d+\/\d+\/\d+\/\d+/.test(el)) {
                add("Card Serial", el);
            }
        }
    }

    return {
        parsed: fields.length > 0,
        fields
    };
}