namespace Th11s.FileSling.Configuration;

public class StorageOptions
{
    public FileSystemStorageOptions? FileSystem { get; set; }
    
}

public class FileSystemStorageOptions
{
    public const string SectionName = "FileSystemStorage";

    public required string StoragePath { get; set; }

    public long DefaultDirectoryQuotaBytes { get; set; } = 1_000_000_000L; // 1 GB
    public TimeSpan DefaultRelativeDirectoryExpiry { get; set; } = TimeSpan.FromDays(30);
}