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
    DirectoryId: string;
    FileId: string;

    CreatedAt: Date;
    DownloadCount: number;
    FileSizeBytes: number;

    // Protected properties
    FileName: string;
    MimeType: string;
}