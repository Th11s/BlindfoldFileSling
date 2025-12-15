namespace Th11s.FileSling.Model;

public record FileMetadata(
    FileId Id,
    DirectoryId DirectoryId,
    OwnerId OwnerId,
    
    DateTimeOffset CreatedAt,
    
    long SizeBytes,
    int DownloadCount,

    string Protected // Expected to be a base64url-encoded string
);