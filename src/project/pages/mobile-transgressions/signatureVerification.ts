/**
 * Signature verification for Namibia driver's licence
 * Uses Web Crypto API to verify ECDSA signatures (P-256 / SHA-256)
 */

// Cache for imported public keys
const keyCache = new Map<string, CryptoKey>();

export interface VerificationResult {
    verified: boolean;
    error?: string;
    signaturePresent: boolean;
}

/**
 * Convert PEM public key to ArrayBuffer
 */
function pemToArrayBuffer(pem: string): ArrayBuffer {
    // Remove PEM headers and whitespace
    const b64Lines = pem.replace(/-----BEGIN PUBLIC KEY-----/g, "")
        .replace(/-----END PUBLIC KEY-----/g, "")
        .replace(/\s/g, "");

    // Decode base64 to binary string
    const binaryString = atob(b64Lines);

    // Convert to ArrayBuffer
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes.buffer as ArrayBuffer; // Type assertion
}

/**
 * Preload a public key for later verification
 */
export async function preloadPublicKey(pem: string): Promise<void> {
    if (!keyCache.has(pem)) {
        const binaryDer = pemToArrayBuffer(pem);
        const key = await crypto.subtle.importKey(
            "spki",
            binaryDer,
            {
                name: "ECDSA",
                namedCurve: "P-256",
            },
            false,
            ["verify"]
        );
        keyCache.set(pem, key);
    }
}

/**
 * Extract signature and data from raw barcode bytes
 * Signature is the last group (after Group 4)
 */
export function extractSignatureAndData(rawBytes: Uint8Array): {
    dataWithoutSignature: Uint8Array;
    signature: Uint8Array | null;
} {
    const GROUP_DELIMITER = 0xd7;

    // Split into groups
    const groups: Uint8Array[] = [];
    let start = 0;

    for (let i = 0; i < rawBytes.length; i++) {
        if (rawBytes[i] === GROUP_DELIMITER) {
            if (i > start) groups.push(rawBytes.slice(start, i));
            start = i + 1;
        }
    }

    if (start < rawBytes.length) {
        groups.push(rawBytes.slice(start));
    }

    // If we have more than 4 groups, the last groups contain the signature
    if (groups.length > 4) {
        // Groups 0-3 are data (Group 0 is usually empty, Groups 1-3 contain the actual data)
        // Groups 4+ are signature parts
        const dataGroups = groups.slice(0, 4); // First 4 groups are data
        const signatureGroups = groups.slice(4); // Rest are signature

        // Reconstruct data without signature (including delimiters)
        let dataLength = 0;
        for (let i = 0; i < dataGroups.length; i++) {
            dataLength += dataGroups[i].length;
            if (i < dataGroups.length - 1) dataLength += 1; // Add delimiter
        }

        const dataWithoutSignature = new Uint8Array(dataLength);
        let offset = 0;

        for (let i = 0; i < dataGroups.length; i++) {
            dataWithoutSignature.set(dataGroups[i], offset);
            offset += dataGroups[i].length;
            if (i < dataGroups.length - 1) {
                dataWithoutSignature[offset] = GROUP_DELIMITER;
                offset += 1;
            }
        }

        // Combine signature groups
        let sigLength = 0;
        for (let i = 0; i < signatureGroups.length; i++) {
            sigLength += signatureGroups[i].length;
            if (i < signatureGroups.length - 1) sigLength += 1; // Add delimiter
        }

        const signature = new Uint8Array(sigLength);
        offset = 0;

        for (let i = 0; i < signatureGroups.length; i++) {
            signature.set(signatureGroups[i], offset);
            offset += signatureGroups[i].length;
            if (i < signatureGroups.length - 1) {
                signature[offset] = GROUP_DELIMITER;
                offset += 1;
            }
        }

        return { dataWithoutSignature, signature };
    }

    // No signature found
    return { dataWithoutSignature: rawBytes, signature: null };
}

/**
 * Verify the signature of a raw barcode string
 */
export async function verifyBarcodeSignature(
    rawBarcodeText: string,
    publicKeyPem: string
): Promise<VerificationResult> {
    try {
        // Convert text to bytes (ISO-8859-1)
        const bytes = new Uint8Array(rawBarcodeText.length);
        for (let i = 0; i < rawBarcodeText.length; i++) {
            bytes[i] = rawBarcodeText.charCodeAt(i) & 0xff;
        }

        // Extract signature and data
        const { dataWithoutSignature, signature } = extractSignatureAndData(bytes);

        if (!signature) {
            return {
                verified: false,
                error: 'No signature found in barcode',
                signaturePresent: false
            };
        }

        // Get key from cache or import it
        let key = keyCache.get(publicKeyPem);

        if (!key) {
            const binaryDer = pemToArrayBuffer(publicKeyPem);
            key = await crypto.subtle.importKey(
                "spki",
                binaryDer,
                {
                    name: "ECDSA",
                    namedCurve: "P-256",
                },
                false,
                ["verify"]
            );
            keyCache.set(publicKeyPem, key);
        }

        // Create proper ArrayBuffers for crypto.subtle.verify
        // Use the Uint8Array directly as they are BufferSource-compatible
        // No need to extract the buffer
        const verified = await crypto.subtle.verify(
            {
                name: "ECDSA",
                hash: "SHA-256",
            },
            key,
            signature.buffer as ArrayBuffer,
            dataWithoutSignature.buffer as ArrayBuffer
        );

        return {
            verified,
            error: verified ? undefined : 'Signature verification failed',
            signaturePresent: true
        };

    } catch (error) {
        console.error('Signature verification error:', error);
        return {
            verified: false,
            error: error instanceof Error ? error.message : 'Unknown verification error',
            signaturePresent: true
        };
    }
}

/**
 * Helper to check if a barcode is likely a driver's licence (has signature)
 */
export function hasSignature(rawBarcodeText: string): boolean {
    const bytes = new Uint8Array(rawBarcodeText.length);
    for (let i = 0; i < rawBarcodeText.length; i++) {
        bytes[i] = rawBarcodeText.charCodeAt(i) & 0xff;
    }

    const groups: Uint8Array[] = [];
    let start = 0;

    for (let i = 0; i < bytes.length; i++) {
        if (bytes[i] === 0xd7) {
            if (i > start) groups.push(bytes.slice(start, i));
            start = i + 1;
        }
    }

    if (start < bytes.length) {
        groups.push(bytes.slice(start));
    }

    return groups.length > 4;
}
