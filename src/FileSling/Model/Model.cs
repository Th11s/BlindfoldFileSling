namespace Th11s.FileSling.Model;

public record DirectoryMetadata(
    DirectoryId Id,
    OwnerId OwnerId,

    DateTimeOffset CreatedAt,
    DateTimeOffset? ExpiresAt,
    DateTimeOffset? LastFileUploadAt,

    long MaxStorageBytes,

    byte[] Protected,
    string ChallengePassword,
    byte[] ProtectedChallengePassword
);

public record FileMetadata(
    FileId Id,
    DirectoryId DirectoryId,
    OwnerId OwnerId,
    
    string Displayname,
    DateTimeOffset CreatedAt,
    
    long SizeBytes
);