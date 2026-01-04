export async function createCyptoKey(): Promise<CryptoKey> {
    const aesKey = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    );

    return aesKey;
}

export function createIV(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(12));
}

export async function encryptString(clearText: string, iv: Uint8Array, cryptoKey: CryptoKey): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    const data = encoder.encode(clearText);

    return await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        cryptoKey,
        data
    );
}

export function encryptStringifiedObject<T>(obj: T, iv: Uint8Array, cryptoKey: CryptoKey): Promise<ArrayBuffer> {
    const json = JSON.stringify(obj);
    return encryptString(json, iv, cryptoKey);
}

export async function decryptAsString(cypherData: ArrayBuffer, iv: Uint8Array, cryptoKey: CryptoKey) : Promise<string> {
    const clearTextBuffer = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: iv
        },
        cryptoKey,
        cypherData
    );

    const decoder = new TextDecoder();
    const clearText = decoder.decode(clearTextBuffer);

    return clearText;
}

export async function decryptAsObject<T>(cypherData: ArrayBuffer, iv: Uint8Array, cryptoKey: CryptoKey): Promise<T> {
    const clearText = await decryptAsString(cypherData, iv, cryptoKey);
    return JSON.parse(clearText) as T;
}