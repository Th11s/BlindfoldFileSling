import * as CryptoHelper from "./Cryptography";
import * as Model from "./Model";
import * as Utils from "./Utils";
import * as ClientStorage from "./ClientStorage";
import * as HttpClient from "./HttpClient";

export async function createDirectory(directoryName: string): Promise<void> {
    const cryptoKey = await CryptoHelper.createCyptoKey();
    const iv = CryptoHelper.createIV();

    const protectableData: Model.DirectoryProtectedData = {
        displayName: directoryName
    };

    const protectedDataBuffer = await CryptoHelper.encryptStringifiedObject(protectableData, iv, cryptoKey);
    const protectedData = Utils.arrayBufferToBase64(protectedDataBuffer);

    const response = await HttpClient.createDirectory({ encryptedData: { encryptionHeader: Utils.arrayBufferToBase64(iv), base64CipherText: protectedData } });

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

        await ClientStorage.storeDirectoryKey(responseObject.directoryId, cryptoKey);
        await ClientStorage.storeDirectoryMetadata(responseObject.directoryId, metadata);

        // TODO:
        // Events.raiseDirectoryCreated({ metadata });
    }
}

export async function createFileInDirectory(directoryId: string, file: File): Promise<void> {
    const cryptoKey = await ClientStorage.getDirectoryKey(directoryId);
    const iv = CryptoHelper.createIV();

    const protectableData: Model.FileProtectedData = {
        fileName: file.name,
        mimeType: file.type
    };

    const protectedDataBuffer = await CryptoHelper.encryptStringifiedObject(protectableData, iv, cryptoKey);
    const protectedData = Utils.arrayBufferToBase64(protectedDataBuffer);

    const response = await HttpClient.createFile(directoryId, { encryptedData: { encryptionHeader: Utils.arrayBufferToBase64(iv), base64CipherText: protectedData } });

    if (response.ok) {
        console.debug(`File "${file.name}" created successfully.`);
        const responseObject = await response.json() as Model.FileMetadataResponse;
        console.debug("File Metadata:", responseObject);

        var metadata: Model.FileMetadata = {
            directoryId: responseObject.directoryId,
            fileId: responseObject.fileId,
            createdAt: new Date(responseObject.createdAt),
            downloadCount: responseObject.downloadCount,
            fileSizeBytes: responseObject.fileSizeBytes,

            fileName: file.name,
            mimeType: file.type
        };

        // TODO
        // Events.raiseFileCreated({ metadata });
    }
}

export async function getDirectoryMetadata(directoryId: string): Promise<Model.DirectoryMetadata | null> {
    let metadata = await ClientStorage.getDirectoryMetadata(directoryId);
    if (metadata) {
        return metadata;
    }

    const directoryKey = await ClientStorage.getDirectoryKey(directoryId);
    if (!directoryKey) {
        return null;
    }

    const metadataResponse = await HttpClient.getDirectoryMetadata(directoryId);
    if (!metadataResponse) {
        return null;
    }


    const unprotectedData = await CryptoHelper.decryptAsObject<Model.DirectoryProtectedData>(
        metadataResponse.encryptedData,
        directoryKey
    );

    metadata = {
        directoryId,
        displayName: unprotectedData.displayName,
        createdAt: metadataResponse.createdAt,
        expiresAt: metadataResponse.expiresAt,
        lastFileUploadAt: metadataResponse.lastFileUploadAt,
        maxStorageBytes: metadataResponse.maxStorageBytes,
        usedStorageBytes: metadataResponse.usedStorageBytes
    }

    await ClientStorage.storeDirectoryMetadata(directoryId, metadata);
    return metadata;
}

export async function getDirectoryFiles(directoryId: string): Promise<Model.FileMetadata[] | null> {
    const directoryKey = await ClientStorage.getDirectoryKey(directoryId);
    if (!directoryKey) {
        return null;
    }

    const fileResponses = await HttpClient.getDirectoryFiles(directoryId);
    if (!fileResponses) {
        return null;
    }

    const result: Model.FileMetadata[] = [];
    for (const fileResponse of fileResponses) {
        const unprotectedData = await CryptoHelper.decryptAsObject<Model.FileProtectedData>(
            fileResponse.encryptedData,
            directoryKey
        );

        result.push({
            directoryId,
            fileId: fileResponse.fileId,

            fileName: unprotectedData.fileName,
            mimeType: unprotectedData.mimeType,

            createdAt: fileResponse.createdAt,
            downloadCount: fileResponse.downloadCount,
            fileSizeBytes: fileResponse.fileSizeBytes
        });
    }

    return result;
}