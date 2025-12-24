import * as Utils from "./Utils.js";
function openDatabase() {
    const dbOpenRequest = window.indexedDB.open("FileSlingDB", 1);
    dbOpenRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (event.newVersion >= 1) {
            db.createObjectStore("directoryKeys", { keyPath: "directoryId" });
            db.createObjectStore("directoryMetadata", { keyPath: "directoryId" });
        }
    };
    return dbOpenRequest;
}
export async function storeDirectoryKey(directoryId, cryptoKey) {
    const dbOpenRequest = openDatabase();
    dbOpenRequest.onsuccess = async (event) => {
        const db = event.target.result;
        const keyData = await window.crypto.subtle.exportKey("raw", cryptoKey);
        const base64Key = Utils.arrayBufferToBase64(keyData);
        const tx = db.transaction("directoryKeys", "readwrite");
        const store = tx.objectStore("directoryKeys");
        store.put({ directoryId, key: base64Key });
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });
    };
}
export async function storeDirectoryMetadata(directoryId, directoryMetadata) {
    const dbOpenRequest = openDatabase();
    dbOpenRequest.onsuccess = async (event) => {
        const db = event.target.result;
        const tx = db.transaction("directoryMetadata", "readwrite");
        const store = tx.objectStore("directoryMetadata");
        store.put({ directoryId, directoryMetadata });
        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });
    };
}
//# sourceMappingURL=ClientStorage.js.map