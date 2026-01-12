export type EncryptedString = string;
export type DirectoryId = string;

export interface DirectoryProtectedData {
    displayName: string;
    challengeKey: string | null;
}

interface DirectoryMetadataBase {
    directoryId: string;

    createdAt: string;
    expiresAt: string;
    lastFileUploadAt: string;

    maxStorageSpace: string;
    usedStorageSpace: string;

    settings?: DirectorySettings;
}

interface DirectorySettings {
    allowUpload?: boolean;
    allowDownload?: boolean;
}

export interface DirectoryMetadataResponse extends DirectoryMetadataBase {
    protectedData: EncryptedString;
}

export interface DirectoryMetadata extends DirectoryMetadataBase, DirectoryProtectedData {
}

export interface DirectoryMetadataWithUserCaps extends DirectoryMetadata {
    capabilities: UserCapabilities;
}

interface UserCapabilities {
    hasDirectoryKey?: boolean;
    canManageDirectory?: boolean;

    canUploadFiles?: boolean;
    canDownloadFiles?: boolean;
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
    protectedData: EncryptedString;
}

export interface FileMetadata extends FileMetadataBase, FileProtectedData {
}