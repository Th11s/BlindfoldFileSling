namespace Th11s.FileSling.Web.HttpModel;

public record FileMetadata(
    string FileId,
    string DirectoryId,

    string CreatedAt,

    long FileSizeBytes,
    int ChunkCount,
    string FileSize,
    
    int? DownloadCount,

    string ProtectedData
);