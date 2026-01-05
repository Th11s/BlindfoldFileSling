namespace Th11s.FileSling.Web.HttpModel;

public record DirectoryMetadata(
    string DirectoryId,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset? LastFileUploadAt,

    long MaxStorageBytes,
    long UsedStorageBytes,

    EncryptedMetadata EncryptedData
);
