import * as CryptoHelper from "./Cryptography";
import * as Model from "./Model";
import * as Utils from "./Utils";
import * as ClientStorage from "./ClientStorage";
import * as HttpClient from "./HttpClient";

export async function createDirectory(directoryName: string): Promise<void> {
    const cryptoKey = await CryptoHelper.createCyptoKey();

    const protectableData: Model.DirectoryProtectedData = {
        displayName: directoryName
    };

    const protectedDataIV = CryptoHelper.createIV();
    const protectedDataBuffer = await CryptoHelper.encryptStringifiedObject(protectableData, protectedDataIV, cryptoKey);
    const protectedData = Utils.arrayBufferToBase64(protectedDataBuffer);

    const ownerChallenge = await CryptoHelper.createChallenge(cryptoKey);

    const response = await HttpClient.createDirectory(
        {
            encryptedData: {
                encryptionHeader: Utils.uInt8ArrayToBase64(protectedDataIV),
                base64CipherText: protectedData
            },

            ownerChallenge: ownerChallenge
        });

    if (response.ok) {
        console.debug(`Folder "${directoryName}" created successfully.`);
        const responseObject = await response.json() as Model.DirectoryMetadataResponse;
        console.debug("Directory Metadata:", responseObject);

        var metadata: Model.DirectoryMetadata = {
            directoryId: responseObject.directoryId,
            createdAt: responseObject.createdAt,
            expiresAt: responseObject.expiresAt,
            lastFileUploadAt: responseObject.lastFileUploadAt,
            maxStorageSpace: responseObject.maxStorageSpace,
            usedStorageSpace: responseObject.usedStorageSpace,
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

    const response = await HttpClient.createFile(directoryId, { encryptedData: { encryptionHeader: Utils.uInt8ArrayToBase64(iv), base64CipherText: protectedData } });

    if (response.ok) {
        console.debug(`File "${file.name}" created successfully.`);
        const responseObject = await response.json() as Model.FileMetadataResponse;
        console.debug("File Metadata:", responseObject);

        var metadata: Model.FileMetadata = {
            directoryId: responseObject.directoryId,
            fileId: responseObject.fileId,
            createdAt: responseObject.createdAt,
            downloadCount: responseObject.downloadCount,
            fileSize: responseObject.fileSize,

            fileName: file.name,
            mimeType: file.type
        };

        // TODO
        // Events.raiseFileCreated({ metadata });
    }
}

export async function getDirectoryMetadata(directoryId: string): Promise<Model.DirectoryMetadata | null> {
    let metadata: Model.DirectoryMetadata | null = await ClientStorage.getDirectoryMetadata(directoryId);
    if (metadata) {
        refreshMetadataInBackground(directoryId);
        return metadata;
    }

    metadata = await getMetadataFromServer(directoryId);
    if (!metadata) {
        return null;
    }

    await ClientStorage.storeDirectoryMetadata(directoryId, metadata);
    return metadata;
}

async function getMetadataFromServer(directoryId: string): Promise<Model.DirectoryMetadata | null> {
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

    const metadata = {
        directoryId,
        displayName: unprotectedData.displayName,
        createdAt: metadataResponse.createdAt,
        expiresAt: metadataResponse.expiresAt,
        lastFileUploadAt: metadataResponse.lastFileUploadAt,
        maxStorageSpace: metadataResponse.maxStorageSpace,
        usedStorageSpace: metadataResponse.usedStorageSpace
    }

    return metadata;
}

async function refreshMetadataInBackground(directoryId: string): Promise<void> {
    const directoryKey = await ClientStorage.getDirectoryKey(directoryId);

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
            fileSize: fileResponse.fileSize
        });
    }

    return result;
}