import * as Utils from "./Utils.js";

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

export async function encryptJSONBase64<T>(obj: T, cryptoKeyAndIV: { iv: Uint8Array, cryptoKey: CryptoKey }): Promise<string> {
    const json = JSON.stringify(obj);
    const encoder = new TextEncoder();
    const data = encoder.encode(json);
    const encryptedData = await window.crypto.subtle.encrypt(
        {
            name: "AES-GCM",
            iv: cryptoKeyAndIV.iv
        },
        cryptoKeyAndIV.cryptoKey,
        data
    );

    return Utils.arrayBufferToBase64(encryptedData);
}