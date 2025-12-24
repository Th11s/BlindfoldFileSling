import * as Utils from "./Utils.js";
export async function StoreDirectoryKey(directoryId, cryptoKey) {
    const keyData = await window.crypto.subtle.exportKey("raw", cryptoKey);
    const base64Key = Utils.arrayBufferToBase64(keyData);
    localStorage.setItem(`directory_${directoryId}_key`, base64Key);
}
//# sourceMappingURL=LocalStorage.js.map