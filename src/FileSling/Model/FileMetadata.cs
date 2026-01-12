namespace Th11s.FileSling.Model;

public record FileMetadata(
    FileId Id,
    DirectoryId DirectoryId,
    
    DateTimeOffset CreatedAt,
    
    long SizeInBytes,
    uint ChunkCount,
    int DownloadCount,

    string ProtectedData
);