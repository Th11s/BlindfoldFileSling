export function arrayBufferToBase64(buffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

export function uInt8ArrayToBase64(array: Uint8Array): string {
    return btoa(String.fromCharCode(...array));
}

export function base64ToArrayBuffer(base64: string): ArrayBuffer {
    return base64ToUint8Array(base64).buffer;
}

export function base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
}