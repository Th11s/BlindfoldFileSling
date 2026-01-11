import { EncryptedString } from "./Model";
import * as Utils from "./Utils";

export function createAESCyptoKey(): Promise<CryptoKey> {
    return window.crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
}

export async function exportAESKeyToBase64(cryptoKey: CryptoKey): Promise<string> {
    const keyData = await window.crypto.subtle.exportKey("raw", cryptoKey);
    const base64Key = Utils.arrayBufferToBase64(keyData);

    return base64Key;
}

export function importAESKeyFromBase64(base64Key: string): Promise<CryptoKey> {
    const keyData = Utils.base64ToArrayBuffer(base64Key);
    return window.crypto.subtle.importKey("raw", keyData, "AES-GCM", true, ["encrypt", "decrypt"]);
}


export function createECCryptoKey(): Promise<CryptoKeyPair> {
    return window.crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
}

export async function exportECPublicKeyToBase64(cryptoKey: CryptoKeyPair): Promise<string> {
    const keyData = await window.crypto.subtle.exportKey("spki", cryptoKey.publicKey);
    const base64Key = Utils.arrayBufferToBase64(keyData);

    return base64Key;
}

export async function exportECPrivateKeyToBase64(cryptoKey: CryptoKeyPair): Promise<string> {
    const keyData = await window.crypto.subtle.exportKey("pkcs8", cryptoKey.privateKey);
    const base64Key = Utils.arrayBufferToBase64(keyData);

    return base64Key;
}

export async function importECPrivateKeyFromBase64(base64Key: string): Promise<CryptoKey> {
    const keyData = Utils.base64ToArrayBuffer(base64Key);
    return window.crypto.subtle.importKey("pkcs8", keyData, { name: "ECDSA", namedCurve: "P-256" }, true, ["sign"]);
}

export async function createSignedChallenge(privateKey: CryptoKey): Promise<{ challenge: string; signature: string }> {
    const challenge = window.crypto.getRandomValues(new Uint8Array(32));
    const signature = await window.crypto.subtle.sign(
        {
            name: "ECDSA",
            hash: { name: "SHA-256" },
        },
        privateKey,
        challenge
    );

    return {
        challenge: Utils.uInt8ArrayToBase64(challenge),
        signature: Utils.arrayBufferToBase64(signature),
    }
}

function createIV() {
    const iv: Uint8Array<ArrayBuffer> = new Uint8Array(12);
    return window.crypto.getRandomValues(iv);
}



async function encryptString(clearText: string, iv: Uint8Array<ArrayBuffer>, cryptoKey: CryptoKey): Promise<ArrayBuffer> {
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

export async function encryptStringAsBase64WithHeader(clearText: string, cryptoKey: CryptoKey): Promise<EncryptedString> {
    const iv = createIV();
    const cipherBuffer = await encryptString(clearText, iv, cryptoKey);
    const base64CipherText = Utils.arrayBufferToBase64(cipherBuffer);
    const base64Header = Utils.uInt8ArrayToBase64(iv);

    return `${base64Header}:${base64CipherText}`;
}


export function encryptObjectAsBase64WithHeader<T>(obj: T, cryptoKey: CryptoKey): Promise<EncryptedString> {
    const json = JSON.stringify(obj);
    return encryptStringAsBase64WithHeader(json, cryptoKey);
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

export function decryptBase64WithHeaderAsObject<T>(encryptedData: EncryptedString, cryptoKey: CryptoKey): Promise<T> {
    const [base64Header, base64CipherText] = encryptedData.split(":");

    return decryptAsObjectInternal(
        Utils.base64ToArrayBuffer(base64CipherText),
        Utils.base64ToUint8Array(base64Header),
        cryptoKey
    );
}