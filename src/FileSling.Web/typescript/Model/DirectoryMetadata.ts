interface DirectoryMetadata {
    DirectoryId: string;

    CreatedAt: Date;
    ExpiresAt?: Date | null;
    LastFileUploadAt?: Date | null;

    MaxStorageBytes: number;
    UsedStorageBytes: number;

    // Protected properties
    DisplayName: string;
    ChallengePassword: string;
}

interface FileMetadata {
    DirectoryId: string;
    FileId: string;

    CreatedAt: Date;
    DownloadCount: number;
    FileSizeBytes: number;

    // Protected properties
    FileName: string;
    MimeType: string;
}