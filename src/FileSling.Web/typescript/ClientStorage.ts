import * as Utils from "./Utils.js";
import * as Model from "./Model.js";

function openDatabase(): IDBOpenDBRequest {
    const dbOpenRequest = window.indexedDB.open("FileSlingDB", 1);
    dbOpenRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;

        if (event.newVersion! >= 1) {
            db.createObjectStore("directoryKeys", { keyPath: "directoryId" });
            db.createObjectStore("directoryMetadata", { keyPath: "directoryId" });
        }
    }

    return dbOpenRequest;
}

export async function storeDirectoryKey(directoryId: string, cryptoKey: CryptoKey): Promise<void> {
    const dbOpenRequest = openDatabase();

    dbOpenRequest.onsuccess = async (event: Event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;

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

export async function storeDirectoryMetadata(directoryId: string, directoryMetadata: Model.DirectoryMetadata): Promise<void> {
    const dbOpenRequest = openDatabase();

    dbOpenRequest.onsuccess = async (event: Event) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;

        const tx = db.transaction("directoryMetadata", "readwrite");
        const store = tx.objectStore("directoryMetadata");
        store.put({ directoryId, directoryMetadata });

        await new Promise((resolve, reject) => {
            tx.oncomplete = resolve;
            tx.onerror = reject;
        });
    };
}