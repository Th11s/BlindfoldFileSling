namespace Th11s.FileSling.Model;

public record FileMetadata(
    FileId Id,
    DirectoryId DirectoryId,
    
    DateTimeOffset CreatedAt,
    
    long SizeInBytes,
    int ChunkCount,
    int DownloadCount,

    string ProtectedData
);