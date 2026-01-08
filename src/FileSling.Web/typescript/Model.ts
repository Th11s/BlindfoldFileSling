export interface EncryptedData {
    encryptionHeader: string;
    base64CipherText: string;
}

export interface EncryptedChallenge extends EncryptedData {
    clearTextChallenge: string;
}

export interface DirectoryProtectedData {
    displayName: string;
}

interface DirectoryMetadataBase {
    directoryId: string;

    createdAt: string;
    expiresAt: string;
    lastFileUploadAt: string;

    maxStorageSpace: string;
    usedStorageSpace: string;
}

export interface DirectoryMetadataResponse extends DirectoryMetadataBase {
    encryptedData: EncryptedData;
}

export interface DirectoryMetadata extends DirectoryMetadataBase, DirectoryProtectedData {
}

interface FileMetadataBase {
    directoryId: string;
    fileId: string;

    createdAt: string;
    downloadCount: number;
    fileSize: string;
}

export interface FileProtectedData {
    fileName: string;
    mimeType?: string;
}

export interface FileMetadataResponse extends FileMetadataBase {
    encryptedData: EncryptedData;
}

export interface FileMetadata extends FileMetadataBase, FileProtectedData {
}