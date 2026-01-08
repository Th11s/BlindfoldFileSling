namespace Th11s.FileSling.Web.HttpModel;

public record DirectoryMetadata(
    string DirectoryId,
    string CreatedAt,
    string? ExpiresAt,
    string? LastFileUploadAt,

    string MaxStorageSpace,
    string UsedStorageSpace,

    EncryptedMetadata EncryptedData
);
