export interface EncryptedData {
    encryptionHeader: string;
    base64CipherText: string;
}

export interface DirectoryProtectedData {
    displayName: string;
}

export interface DirectoryMetadataResponse {
    directoryId: string;

    createdAt: Date;
    expiresAt?: Date | null;
    lastFileUploadAt?: Date | null;

    maxStorageBytes: number;
    usedStorageBytes: number;

    encryptedData: EncryptedData;
}

export interface DirectoryMetadata {
    directoryId: string;

    createdAt: Date;
    expiresAt?: Date | null;
    lastFileUploadAt?: Date | null;

    maxStorageBytes: number;
    usedStorageBytes: number;

    // Protected properties
    displayName: string;
}

export interface FileProtectedData {
    fileName: string;
    mimeType?: string;
}

export interface FileMetadataResponse {
    directoryId: string;
    fileId: string;

    createdAt: Date;
    downloadCount: number;
    fileSizeBytes: number;

    encryptedData: EncryptedData;
}

export interface FileMetadata {
    directoryId: string;
    fileId: string;

    createdAt: Date;
    downloadCount: number;
    fileSizeBytes: number;

    // Protected properties
    fileName: string;
    mimeType?: string;
}