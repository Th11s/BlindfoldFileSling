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

    // Protected properties
    encryptionHeader: string;
    protectedData: string;
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

export interface FileMetadata {
    directoryId: string;
    fileId: string;

    createdAt: Date;
    downloadCount: number;
    fileSizeBytes: number;

    // Protected properties
    fileName: string;
    mimeType: string;
}