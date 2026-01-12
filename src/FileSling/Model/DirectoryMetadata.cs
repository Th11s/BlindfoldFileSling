namespace Th11s.FileSling.Model;

public record DirectoryMetadata(
    DirectoryId Id,
    OwnerId OwnerId,

    DateTimeOffset CreatedAt,
    DateTimeOffset ExpiresAt,
    DateTimeOffset? LastFileUploadAt,

    long MaxStorageBytes,
    long UsedStorageBytes,

    UserCapabilities Configuration,

    string ChallengePublicKey,
    string ProtectedData
);

public record UserCapabilities(
    bool AllowUpload,
    bool AllowDownload
);
