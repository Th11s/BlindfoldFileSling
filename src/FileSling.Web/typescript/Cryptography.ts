import { EncryptedData, EncryptedChallenge } from "./Model";
import * as Util from "./Utils";

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

export function createIV() {
    const iv: Uint8Array<ArrayBuffer> = new Uint8Array(12);
    return window.crypto.getRandomValues(iv);
}

export async function encryptString(clearText: string, iv: Uint8Array<ArrayBuffer>, cryptoKey: CryptoKey): Promise<ArrayBuffer> {
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

export function encryptStringifiedObject<T>(obj: T, iv: Uint8Array<ArrayBuffer>, cryptoKey: CryptoKey): Promise<ArrayBuffer> {
    const json = JSON.stringify(obj);
    return encryptString(json, iv, cryptoKey);
}

export async function decryptAsString(cypherData: ArrayBuffer, iv: Uint8Array<ArrayBuffer>, cryptoKey: CryptoKey) : Promise<string> {
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

async function decryptAsObjectInternal<T>(cypherData: ArrayBuffer, iv: Uint8Array<ArrayBuffer>, cryptoKey: CryptoKey): Promise<T> {
    const clearText = await decryptAsString(cypherData, iv, cryptoKey);
    return JSON.parse(clearText) as T;
}

export function decryptAsObject<T>(encryptedData: EncryptedData, cryptoKey: CryptoKey): Promise<T> {
    return decryptAsObjectInternal(
        Util.base64ToArrayBuffer(encryptedData.base64CipherText),
        Util.base64ToUint8Array(encryptedData.encryptionHeader),
        cryptoKey
    );
}

export async function createChallenge(cryptoKey: CryptoKey): Promise<EncryptedChallenge> {
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const plainChallengeString = Util.uInt8ArrayToBase64(challenge);

    const challengeIV = createIV();

    const cipherString = await encryptString(plainChallengeString, challengeIV, cryptoKey);
    const base64CipherText = Util.arrayBufferToBase64(cipherString);

    return {
        encryptionHeader: Util.uInt8ArrayToBase64(challengeIV),
        base64CipherText: base64CipherText,
        clearTextChallenge: plainChallengeString
    }

}