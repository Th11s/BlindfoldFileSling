namespace Th11s.FileSling.Web.HttpModel;

public record DirectoryMetadata(
    string DirectoryId,
    string CreatedAt,
    string? ExpiresAt,
    string? LastFileUploadAt,

    string MaxStorageSpace,
    string UsedStorageSpace,

    string ProtectedData,
    DirectoryAccessFlags AccessFlags
);

public enum DirectoryAccessFlags
{
    None = 0x0,
    Upload = 0x1,
    Download = 0x2,
    Both = Upload | Download
}
