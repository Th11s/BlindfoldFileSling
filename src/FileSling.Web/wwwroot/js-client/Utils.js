export function arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}
export function uInt8ArrayToBase64(array) {
    return btoa(String.fromCharCode(...array));
}
export function base64ToArrayBuffer(base64) {
    return base64ToUint8Array(base64).buffer;
}
export function base64ToUint8Array(base64) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}
//# sourceMappingURL=Utils.js.map