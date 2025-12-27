import * as Utils from "./Utils.js";
async function openDatabase() {
    const dbOpenRequest = window.indexedDB.open("FileSlingDB", 1);
    dbOpenRequest.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (event.newVersion >= 1) {
            db.createObjectStore("directoryKeys");
            db.createObjectStore("directoryMetadata");
        }
    };
    const db = await new Promise((resolve, reject) => {
        dbOpenRequest.onsuccess = (event) => {
            resolve(event.target.result);
        };
        dbOpenRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
    return db;
}
export async function storeDirectoryKey(directoryId, cryptoKey) {
    const db = await openDatabase();
    const keyData = await window.crypto.subtle.exportKey("raw", cryptoKey);
    const base64Key = Utils.arrayBufferToBase64(keyData);
    const tx = db.transaction("directoryKeys", "readwrite");
    const store = tx.objectStore("directoryKeys");
    store.put(base64Key, directoryId);
    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}
export async function storeDirectoryMetadata(directoryId, directoryMetadata) {
    const db = await openDatabase();
    const tx = db.transaction("directoryMetadata", "readwrite");
    const store = tx.objectStore("directoryMetadata");
    store.put(directoryMetadata, directoryId);
    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}
export async function getDirectoryKey(directoryId) {
    const db = await openDatabase();
    const tx = db.transaction("directoryKeys", "readonly");
    const store = tx.objectStore("directoryKeys");
    const getRequest = store.get(directoryId);
    const keyExport = await new Promise((resolve, reject) => {
        getRequest.onsuccess = (event) => {
            const base64Key = event.target.result;
            if (!base64Key) {
                reject();
                return;
            }
            resolve(base64Key);
        };
        getRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
    const keyData = Utils.base64ToArrayBuffer(keyExport);
    return await window.crypto.subtle.importKey("raw", keyData, "AES-GCM", true, ["encrypt", "decrypt"]);
}
export async function getDirectoryMetadata(directoryId) {
    const db = await openDatabase();
    const tx = db.transaction("directoryKeys", "readonly");
    const store = tx.objectStore("directoryKeys");
    const getRequest = store.get(directoryId);
    return await new Promise((resolve, reject) => {
        getRequest.onsuccess = (event) => {
            const metadata = event.target.result;
            if (!metadata) {
                reject();
                return;
            }
            resolve(metadata);
        };
        getRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
}
export async function getDirectories() {
    const db = await openDatabase();
    const tx = db.transaction("directoryMetadata", "readonly");
    const store = tx.objectStore("directoryMetadata");
    const getAllRequest = store.getAll();
    return await new Promise((resolve, reject) => {
        getAllRequest.onsuccess = (event) => {
            resolve(event.target.result);
        };
        getAllRequest.onerror = (event) => {
            reject(event.target.error);
        };
    });
}
//# sourceMappingURL=ClientStorage.js.map