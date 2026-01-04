export async function createCyptoKeyAndIV(): Promise<{ iv: Uint8Array, cryptoKey: CryptoKey }> {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const aesKey = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    return { iv, cryptoKey: aesKey };
}

export async function encryptString(clearText: string, cryptoKeyAndIV: { iv: Uint8Array, cryptoKey: CryptoKey }): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(clearText);
    return await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: cryptoKeyAndIV.iv
        },
        cryptoKeyAndIV.cryptoKey,
        data
    );
}

export function encryptStringifiedObject<T>(obj: T, cryptoKeyAndIV: { iv: Uint8Array, cryptoKey: CryptoKey }): Promise<ArrayBuffer> {
    const json = JSON.stringify(obj);
    return encryptString(json, cryptoKeyAndIV);
}