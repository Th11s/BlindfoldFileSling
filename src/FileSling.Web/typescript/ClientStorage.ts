import * as Utils from "./Utils";
import * as Model from "./Model";

const DB_NAME = "FileSlingDB";
const DB_VERSION = 1;
const DIRECTORY_KEYS_STORE = "directoryKeys";
const DIRECTORY_METADATA_STORE = "directoryMetadata";

async function openDatabase(): Promise<IDBDatabase> {
    const dbOpenRequest = window.indexedDB.open(DB_NAME, DB_VERSION);
    dbOpenRequest.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBRequest).result as IDBDatabase;

        if (event.newVersion! >= 1) {
            db.createObjectStore(DIRECTORY_KEYS_STORE);
            db.createObjectStore(DIRECTORY_METADATA_STORE);
        }
    }

    const db = await new Promise<IDBDatabase>((resolve, reject) => {
        dbOpenRequest.onsuccess = (event: Event) => {
            resolve((event.target as IDBRequest).result as IDBDatabase);
        }
        dbOpenRequest.onerror = (event: Event) => {
            reject((event.target as IDBRequest).error);
        }
    });

    return db;
}

export async function storeDirectoryKey(directoryId: string, cryptoKey: CryptoKey): Promise<void> {
    const db = await openDatabase();

    const keyData = await window.crypto.subtle.exportKey("raw", cryptoKey);
    const base64Key = Utils.arrayBufferToBase64(keyData);

    const tx = db.transaction(DIRECTORY_KEYS_STORE, "readwrite");
    const store = tx.objectStore(DIRECTORY_KEYS_STORE);
    store.put(base64Key, directoryId);

    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

export async function storeDirectoryMetadata(directoryId: string, directoryMetadata: Model.DirectoryMetadata): Promise<void> {
    const db = await openDatabase();

    const tx = db.transaction(DIRECTORY_METADATA_STORE, "readwrite");
    const store = tx.objectStore(DIRECTORY_METADATA_STORE);
    store.put(directoryMetadata, directoryId);

    await new Promise((resolve, reject) => {
        tx.oncomplete = resolve;
        tx.onerror = reject;
    });
}

export async function getDirectoryKey(directoryId: string): Promise<CryptoKey> {
    const db = await openDatabase();

    const tx = db.transaction(DIRECTORY_KEYS_STORE, "readonly");
    const store = tx.objectStore(DIRECTORY_KEYS_STORE);
    const getRequest = store.get(directoryId);

    const keyExport = await new Promise<string>((resolve, reject) => {
        getRequest.onsuccess = (event: Event) => {
            const base64Key = (event.target as IDBRequest).result as string | undefined;
            if (!base64Key) {
                reject();
                return;
            }

            resolve(base64Key);
        };
        getRequest.onerror = (event: Event) => {
            reject((event.target as IDBRequest).error);
        };
    });

    const keyData = Utils.base64ToArrayBuffer(keyExport);
    return await window.crypto.subtle.importKey("raw", keyData, "AES-GCM", true, ["encrypt", "decrypt"]);
}

export async function getDirectoryMetadata(directoryId: string): Promise<Model.DirectoryMetadata> {
    const db = await openDatabase();

    const tx = db.transaction(DIRECTORY_METADATA_STORE, "readonly");
    const store = tx.objectStore(DIRECTORY_METADATA_STORE);
    const getRequest = store.get(directoryId);

    return await new Promise<Model.DirectoryMetadata>((resolve, reject) => {
        getRequest.onsuccess = (event: Event) => {
            const metadata = (event.target as IDBRequest).result as Model.DirectoryMetadata;
            if (!metadata) {
                reject();
                return;
            }

            resolve(metadata);
        };
        getRequest.onerror = (event: Event) => {
            reject((event.target as IDBRequest).error);
        };
    });
}

export async function getDirectories(): Promise<Model.DirectoryMetadata[]> {
    const db = await openDatabase();

    const tx = db.transaction(DIRECTORY_METADATA_STORE, "readonly");
    const store = tx.objectStore(DIRECTORY_METADATA_STORE);
    const getAllRequest = store.getAll();

    return await new Promise<Model.DirectoryMetadata[]>((resolve, reject) => {
        getAllRequest.onsuccess = (event: Event) => {
            resolve((event.target as IDBRequest).result as Model.DirectoryMetadata[]);
        };
        getAllRequest.onerror = (event: Event) => {
            reject((event.target as IDBRequest).error);
        };
    });
}
