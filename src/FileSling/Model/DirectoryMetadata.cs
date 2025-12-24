namespace Th11s.FileSling.Model;

public record DirectoryMetadata(
    DirectoryId Id,
    OwnerId OwnerId,

    DateTimeOffset CreatedAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset? LastFileUploadAt,

    long MaxStorageBytes,
    long UsedStorageBytes,

    string EncryptionHeader,
    string Protected // Expected to be a base64url-encoded string
);
