/**
 * Parser for ISO 18013-2 Driving Licence PDF417 barcodes.
 *
 * Binary data groups (portrait photo DG4, fingerprint DG7, digital signature SOD.1/SOD.H)
 * are not decoded — only the human-readable text data groups are extracted.
 *
 * Delimiters (from ISO 18013-2 / TRS-001-008):
 *   0xD7  ×  data-group separator
 *   0xF7  ÷  element separator
 *   0x3B  ;  field separator (within categories)
 */

const DG_SEP = '\u00D7'; // ×  (0xD7)
const EL_SEP = '\u00F7'; // ÷  (0xF7)

export type ParsedField = { label: string; value: string };
export type ParsedDLBarcode = { parsed: boolean; fields: ParsedField[] };

/** Remove control characters and Latin-1 supplement control chars from a string. */
function stripControl(s: string): string {
    // eslint-disable-next-line no-control-regex
    return s.replace(/[\x00-\x1F\x7F-\x9F]/g, '').trim();
}

/**
 * Attempts to parse an ISO 18013-2 driving licence barcode string.
 *
 * DG1 (mandatory holder info) field layout (÷-separated, 0-indexed):
 *   [0] Surname
 *   [1] Initials / given names
 *   [2] Sex              — compact-encoded, not decoded
 *   [3] Date of birth    — compact-encoded, not decoded
 *   [4] Personal number  — compact-encoded, not decoded
 *   [5] Country code (e.g. NAM, ZIM, ZAF)
 *   [6] Issuing authority
 *   [7] Licence code
 *   [8] Vehicle categories (;-separated with validity dates)
 *
 * ID number  (DG3):  e.g. 03/59022700445
 * Licence number:    e.g. NAM/01/03/0086445/8
 */
export function parseDLBarcode(rawValue: string): ParsedDLBarcode {
    if (!rawValue.includes(DG_SEP) || !rawValue.includes(EL_SEP)) {
        return { parsed: false, fields: [] };
    }

    const fields: ParsedField[] = [];
    const added = new Set<string>();

    const add = (label: string, raw: string) => {
        const v = stripControl(raw);
        if (v && !added.has(label)) {
            added.add(label);
            fields.push({ label, value: v });
        }
    };

    for (const group of rawValue.split(DG_SEP)) {
        if (!group.includes(EL_SEP)) continue;
        const els = group.split(EL_SEP);

        // Locate DG1 by finding the ISO 3166-1 alpha-2/3 country code at the expected position.
        // countryIdx is reliably 5 per the standard; allow 6 in case of a leading empty element.
        const countryIdx = els.findIndex(e => /^[A-Z]{2,3}$/.test(e.trim()));
        if (countryIdx === 5 || countryIdx === 6) {
            const surname = els[countryIdx - 5] ?? '';
            const initials = els[countryIdx - 4] ?? '';
            if (/^[A-Z][A-Z\s-]*$/.test(surname.trim())) add('Surname', surname);
            if (/^[A-Z][A-Z\s]*$/.test(initials.trim())) add('Initials', initials);
            add('Country', els[countryIdx]);
            if (els[countryIdx + 1]) add('Issuing Authority', els[countryIdx + 1]);
            if (els[countryIdx + 2]) add('License Code', els[countryIdx + 2]);
            const catRaw = els[countryIdx + 3] ?? '';
            add('Categories', catRaw.split(';')[0]);
        }

        // Scan all elements for ID and licence number patterns (control chars stripped first).
        for (const el of els) {
            const c = stripControl(el);
            // ID number: e.g. 03/59022700445
            if (/^\d{2}\/\d{8,}$/.test(c)) add('ID Number', c);
            // Licence number: e.g. NAM/01/03/0086445/8
            if (/^[A-Z]{2,3}\/\d+\/\d+\/\d+\/\d+$/.test(c)) add('License Number', c);
        }
    }

    return { parsed: fields.length > 0, fields };
}