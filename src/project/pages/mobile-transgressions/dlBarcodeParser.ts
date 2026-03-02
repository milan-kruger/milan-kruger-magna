/**
 * Namibia SADC Driver Licence PDF417 Decoder
 * Confirmed Layout – 2026 Revision
 *
 * Group delimiter:     0xD7
 * Field delimiter:     0xF7
 * Subfield delimiter:  0x3b (Category block only)
 */

const GROUP_DELIMITER = 0xd7;
const FIELD_DELIMITER = 0xf7;
const SUBFIELD_DELIMITER = 0x3b;

/* ───────────────────────── TYPES ───────────────────────── */

export interface Category {
    code: string;
    issueDate: string;
    expiryDate: string;
    restriction: string;
}

export interface NamibiaLicence {
    parsed: boolean;

    surname?: string;
    firstNames?: string;
    dateOfBirth?: string;
    validFrom?: string;
    validTo?: string;
    country?: string;
    issuingAuthority?: string;
    licenceNumber?: string;

    categories: Category[];

    nationalId?: string;

    signature?: Uint8Array;
}

export type ParsedField = { label: string; value: string };
export type ParsedLicence = { parsed: boolean; fields: ParsedField[] };

export function decodeNamibiaLicenceForUI(rawText: string): ParsedLicence {
    const data = decodeNamibiaLicence(rawText);

    if (!data.parsed) {
        return { parsed: false, fields: [] };
    }

    const fields: ParsedField[] = [];

    const push = (label: string, value?: string) => {
        if (value && value.trim() !== "") {
            fields.push({ label, value });
        }
    };

    push("Surname", data.surname);
    push("First Names", data.firstNames);
    push("Date of Birth", data.dateOfBirth);
    push("Valid From", data.validFrom);
    push("Valid To", data.validTo);
    push("Country", data.country);
    push("Issuing Authority", data.issuingAuthority);
    push("Licence Number", data.licenceNumber);
    push("National ID", data.nationalId);

    if (data.categories?.length) {
        for (const cat of data.categories) {
            fields.push({
                label: `Category ${cat.code}`,
                value: `${cat.issueDate} → ${cat.expiryDate}` +
                    (cat.restriction ? ` (${cat.restriction})` : "")
            });
        }
    }

    return {
        parsed: true,
        fields
    };
}

/* ───────────────────────── BYTE UTILITIES ───────────────────────── */

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

    if (start < data.length) {
        result.push(data.slice(start));
    }

    return result;
}

function cleanString(value: string): string {
    let result = "";

    for (let i = 0; i < value.length; i++) {
        if (value.charCodeAt(i) !== 0) {
            result += value[i];
        }
    }

    return result.trim();
}

/* ───────────────────────── DATE DECODER ───────────────────────── */

/**
 * Namibia uses packed BCD dates: YYYYMMDD
 */
function decodePackedDate(bytes: Uint8Array): string {
    if (bytes.length < 4) {
        return cleanString(bytesToText(bytes));
    }

    const digits: string[] = [];

    for (let i = 0; i < bytes.length; i++) {
        const high = (bytes[i] >> 4) & 0x0f;
        const low = bytes[i] & 0x0f;

        if (high > 9 || low > 9) {
            return cleanString(bytesToText(bytes));
        }

        digits.push(high.toString());
        digits.push(low.toString());
    }

    const dateStr = digits.join("");

    if (dateStr.length === 8) {
        return `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;
    }

    return cleanString(bytesToText(bytes));
}

/* ───────────────────────── CATEGORY BLOCK DECODER ───────────────────────── */

/**
 * Category block (Group 2, Field 9)
 * Subfields separated by 0x3B
 *
 * Per category entry:
 *   0–1   : Category code (ASCII)
 *   2–5   : Issue date (BCD)
 *   6–9   : Expiry date (BCD)
 *   10+   : Restriction flags (ASCII or binary-safe text)
 */
function decodeCategoryBlock(field: Uint8Array): Category[] {
    const entries = splitBytes(field, SUBFIELD_DELIMITER);
    const categories: Category[] = [];

    for (const entry of entries) {
        if (entry.length < 10) continue;

        const code = cleanString(bytesToText(entry.slice(0, 2)));

        const issueDate = decodePackedDate(entry.slice(2, 6));
        const expiryDate = decodePackedDate(entry.slice(6, 10));

        const restriction =
            entry.length > 10
                ? cleanString(bytesToText(entry.slice(10)))
                : "";

        categories.push({
            code,
            issueDate,
            expiryDate,
            restriction
        });
    }

    return categories;
}

/* ───────────────────────── MAIN DECODER ───────────────────────── */

export function decodeNamibiaLicence(rawText: string): NamibiaLicence {
    const bytes = textToBytes(rawText);
    const groups = splitBytes(bytes, GROUP_DELIMITER);

    if (groups.length < 2) {
        return { parsed: false, categories: [] };
    }

    const result: NamibiaLicence = {
        parsed: false,
        categories: []
    };

    /* ───────── GROUP 2: BIOGRAPHICAL BLOCK ───────── */

    const bioFields = splitBytes(groups[1], FIELD_DELIMITER);

    if (bioFields.length >= 8) {
        result.surname = cleanString(bytesToText(bioFields[0]));
        result.firstNames = cleanString(bytesToText(bioFields[1]));
        result.dateOfBirth = decodePackedDate(bioFields[2]);
        result.validFrom = decodePackedDate(bioFields[3]);
        result.validTo = decodePackedDate(bioFields[4]);
        result.country = cleanString(bytesToText(bioFields[5]));
        result.issuingAuthority = cleanString(bytesToText(bioFields[6]));
        result.licenceNumber = cleanString(bytesToText(bioFields[7]));

        if (bioFields.length > 8) {
            result.categories = decodeCategoryBlock(bioFields[8]);
        }

        result.parsed = true;
    }

    /* ───────── GROUP 4: NATIONAL ID ───────── */

    if (groups.length > 3) {
        const idFields = splitBytes(groups[3], FIELD_DELIMITER);
        if (idFields.length > 0) {
            result.nationalId = cleanString(bytesToText(idFields[0]));
        }
    }

    /* ───────── SIGNATURE BLOCK ───────── */

    if (groups.length > 4) {
        // Everything after Group 4 is cryptographic payload
        const signatureParts = groups.slice(4);

        let totalLength = 0;
        for (const part of signatureParts) {
            totalLength += part.length + 1;
        }

        const signature = new Uint8Array(totalLength);
        let offset = 0;

        for (const part of signatureParts) {
            signature.set(part, offset);
            offset += part.length;
        }

        result.signature = signature;
    }

    return result;
}
