import * as CryptoHelper from "./Cryptography";
import * as Model from "./Model";
import * as Utils from "./Utils";
import * as ClientStorage from "./ClientStorage";
import * as HttpClient from "./HttpClient";

export async function createDirectory(directoryName: string): Promise<void> {
    const cryptoKeyAndIV = await CryptoHelper.createCyptoKeyAndIV();
    const protectableData: Model.DirectoryProtectedData = {
        displayName: directoryName
    };
    const protectedDataArray = await CryptoHelper.encryptStringifiedObject(protectableData, cryptoKeyAndIV);
    const protectedData = Utils.arrayBufferToBase64(protectedDataArray);

    const response = await HttpClient.createDirectory({ iv: cryptoKeyAndIV.iv, protectedData });

    if (response.ok) {
        console.debug(`Folder "${directoryName}" created successfully.`);
        const responseObject = await response.json() as Model.DirectoryMetadataResponse;
        console.debug("Directory Metadata:", responseObject);

        var metadata: Model.DirectoryMetadata = {
            directoryId: responseObject.directoryId,
            createdAt: new Date(responseObject.createdAt),
            expiresAt: responseObject.expiresAt ? new Date(responseObject.expiresAt) : null,
            lastFileUploadAt: responseObject.lastFileUploadAt ? new Date(responseObject.lastFileUploadAt) : null,
            maxStorageBytes: responseObject.maxStorageBytes,
            usedStorageBytes: responseObject.usedStorageBytes,
            displayName: directoryName
        };

        await ClientStorage.storeDirectoryKey(responseObject.directoryId, cryptoKeyAndIV.cryptoKey);
        await ClientStorage.storeDirectoryMetadata(responseObject.directoryId, metadata);

        // Events.raiseDirectoryCreated({ metadata });
    }
}

export async function getDirectoryMetadata(directoryId: string): Promise<Model.DirectoryMetadata | null> {
    return null;
}

export async function createFileInDirectory(directoryId: string, file: File): Promise<void> {
}