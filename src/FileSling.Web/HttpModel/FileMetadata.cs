namespace Th11s.FileSling.Web.HttpModel;

public record FileMetadata(
    string FileId,
    string DirectoryId,

    DateTimeOffset CreatedAt,

    long SizeBytes,
    int? DownloadCount,

    EncryptedMetadata EncryptedData
);