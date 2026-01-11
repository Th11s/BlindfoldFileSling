import {
    getStoredDirectoryKeys,
    getStoredDirectoryKey,
    getStoredDirectoryMetadata,
    storeDirectoryKey,
    storeDirectoryMetadata,
    removeDirectoryKey,
    removeDirectoryMetadata
} from "./ClientStorage";
import {
    createSignedChallenge,
    createAESCyptoKey,
    importECPrivateKeyFromBase64,
    encryptObjectAsBase64WithHeader,
    decryptBase64WithHeaderAsObject
} from "./Cryptography";
import * as _apiClient from "./HttpClient";
import * as Model from "./Model";


export async function getDirectories() : Promise<Model.DirectoryMetadataWithUserCaps[]> {
    // first we'll load all saved keys from the index db as id -> key map
    const keyMap = await getStoredDirectoryKeys();

    // then we'll load all owned directories from the server
    let ownedDirectories = await _apiClient.getDirectories() || new Map<Model.DirectoryId, Model.DirectoryMetadataResponse>();

    var usableDirectories: Model.DirectoryMetadataWithUserCaps[] = [];
    for (const [directoryId, cryptoKey] of keyMap) {
        // owned directories with key
        if (ownedDirectories.has(directoryId)) {
            const ownedDirectory = ownedDirectories.get(directoryId)!;
            const metadata = await decryptAndStoreDirectoryMetadata(directoryId, ownedDirectory, cryptoKey);

            const isAuthed = await authenticateToDirectory(directoryId, metadata)

            const metaWithCaps: Model.DirectoryMetadataWithUserCaps = {
                ...metadata,
                capabilities: {
                    hasDirectoryKey: isAuthed,
                    canManageDirectory: true,

                    canUploadFiles: isAuthed,
                    canDownloadFiles: isAuthed
                }
            }
            usableDirectories.push(metaWithCaps);

            // we need to remove matches to later identify directories without keys on the current machine
            ownedDirectories.delete(directoryId);
        }
        else {
            const metadata = await getDirectory(directoryId, cryptoKey);
            if (metadata) {
                const keyPair = await importECPrivateKeyFromBase64(metadata.challengeKey);
                const isAuthed = await _apiClient.authenticateToDirectory(directoryId, keyPair.privateKey);

                if (isAuthed) {
                    usableDirectories.push({
                        ...metadata,
                        capabilities: {
                            hasDirectoryKey: true,
                            canManageDirectory: true,

                            canUploadFiles: isAuthed, // TODO: get from metadata
                            canDownloadFiles: isAuthed // TODO: get from metadata
                        }
                    });

                    continue;
                }
            }

            // if we reach here, it means we have a key but no corresponding directory on the server, e.g. it was deleted
            console.warn(`No metadata found for directory ID: ${directoryId}`);
            removeStoredData(directoryId);
        }
    }

    // now we need to handle owned directories without keys on this machine
    let counter = 0;
    for (const [directoryId, ownedDirectory] of ownedDirectories) {
        usableDirectories.push({
            directoryId: directoryId,
            displayName: `Keyless directory ${++counter} (${directoryId})`,
            createdAt: ownedDirectory.createdAt,
            expiresAt: ownedDirectory.expiresAt,
            lastFileUploadAt: ownedDirectory.lastFileUploadAt,
            maxStorageSpace: ownedDirectory.maxStorageSpace,
            usedStorageSpace: ownedDirectory.usedStorageSpace,
            capabilities: {
                canDeleteDirectory: true,
            }
        });


    }
    

    return usableDirectories;
}

export async function getDirectory(directoryId: Model.DirectoryId, cryptoKey: CryptoKey): Promise<Model.DirectoryMetadata | null> {
    let metadata = await getStoredDirectoryMetadata(directoryId);
    if (!metadata) {
        const directoryResponse = await _apiClient.getDirectory(directoryId);
        if (!directoryResponse) {
            return null;
        }

        metadata = await decryptAndStoreDirectoryMetadata(directoryId, directoryResponse, cryptoKey);
    }
    
    return metadata;
}

async function decryptAndStoreDirectoryMetadata(directoryId: Model.DirectoryId, directoryResponse: Model.DirectoryMetadataResponse, cryptoKey: CryptoKey): Promise<Model.DirectoryMetadata> {
    const unprotectedData = await decryptBase64WithHeaderAsObject<Model.DirectoryProtectedData>(
        directoryResponse.protectedData,
        cryptoKey
    );

    const metadata: Model.DirectoryMetadata = {
        directoryId,
        displayName: unprotectedData.displayName,
        createdAt: directoryResponse.createdAt,
        expiresAt: directoryResponse.expiresAt,
        lastFileUploadAt: directoryResponse.lastFileUploadAt,

        maxStorageSpace: directoryResponse.maxStorageSpace,
        usedStorageSpace: directoryResponse.usedStorageSpace
    };

    await storeDirectoryMetadata(directoryId, metadata);

    return metadata;
}

async function removeStoredData(directoryId: Model.DirectoryId): Promise<void> {
    await removeDirectoryKey(directoryId);
    await removeDirectoryMetadata(directoryId);
}


export async function createDirectory(directoryName: string): Promise<void> {
    const cryptoKey = await createAESCyptoKey();

    const protectableData: Model.DirectoryProtectedData = {
        displayName: directoryName
    };

    const protectedData = await encryptObjectAsBase64WithHeader(protectableData, cryptoKey);

    const response = await _apiClient.createDirectory(
        {
            protectedData: protectedData,
            //ownerChallenge: ownerChallenge
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

        await storeDirectoryKey(responseObject.directoryId, cryptoKey);
        await storeDirectoryMetadata(responseObject.directoryId, metadata);

        // TODO:
        // Events.raiseDirectoryCreated({ metadata });
    }
}

export async function createFileInDirectory(directoryId: string, file: File): Promise<void> {
    const cryptoKey = await getStoredDirectoryKey(directoryId);

    const protectableData: Model.FileProtectedData = {
        fileName: file.name,
        mimeType: file.type
    };

    const protectedData = await encryptObjectAsBase64WithHeader(protectableData, cryptoKey);

    const response = await _apiClient.createFile(directoryId, { protectedData: protectedData });

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
    let metadata: Model.DirectoryMetadata | null = await getStoredDirectoryMetadata(directoryId);
    
    metadata = await getMetadataFromServer(directoryId);
    if (!metadata) {
        return null;
    }

    await storeDirectoryMetadata(directoryId, metadata);
    return metadata;
}

async function getMetadataFromServer(directoryId: string): Promise<Model.DirectoryMetadata | null> {
    const directoryKey = await getStoredDirectoryKey(directoryId);
    if (!directoryKey) {
        return null;
    }

    const metadataResponse = await _apiClient.getDirectory(directoryId);
    if (!metadataResponse) {
        return null;
    }

    const unprotectedData = await decryptBase64WithHeaderAsObject<Model.DirectoryProtectedData>(
        metadataResponse.protectedData,
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

export async function getDirectoryFiles(directoryId: string): Promise<Model.FileMetadata[] | null> {
    const directoryKey = await getStoredDirectoryKey(directoryId);
    if (!directoryKey) {
        return null;
    }

    const fileResponses = await _apiClient.getDirectoryFiles(directoryId);
    if (!fileResponses) {
        return null;
    }

    const result: Model.FileMetadata[] = [];
    for (const fileResponse of fileResponses) {
        const unprotectedData = await decryptBase64WithHeaderAsObject<Model.FileProtectedData>(
            fileResponse.protectedData,
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

async function authenticateToDirectory(directoryId: string, metadata: Model.DirectoryMetadata) : Promise<boolean> {
    const keyPair = await importECPrivateKeyFromBase64(metadata.challengeKey);
    const authRequest = await createSignedChallenge(keyPair.privateKey);

    return await _apiClient.authenticateToDirectory(directoryId, authRequest);
}