namespace Th11s.FileSling.Model;

public record FileMetadata(
    FileId Id,
    DirectoryId DirectoryId,
    OwnerId OwnerId,
    
    DateTimeOffset CreatedAt,
    
    long SizeInBytes,
    uint ChunkCount,
    int DownloadCount,

    ProtectedMetadata Protected
);