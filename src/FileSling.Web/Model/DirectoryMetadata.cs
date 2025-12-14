namespace Th11s.FileSling.Web.Model;

public record DirectoryMetadata(
    string DirectoryId,
    DateTimeOffset CreatedAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset? LastFileUploadAt,

    long MaxStorageBytes,
    long UsedStorageBytes,

    byte[] Protected,
    byte[] ProtectedChallengePassword
);
