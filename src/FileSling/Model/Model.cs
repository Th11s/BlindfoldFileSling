namespace Th11s.FileSling.Model;

public record DirectoryMetadata(
    DirectoryId Id,
    DateTimeOffset CreatedAt,
    string UploadPassword,
    long MaxStorageBytes
);

public record FileMetadata
{

}