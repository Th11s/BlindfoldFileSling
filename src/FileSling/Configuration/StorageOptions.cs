namespace Th11s.FileSling.Configuration;

public class StorageOptions
{
    public FileSystemStorageOptions? FileSystem { get; set; }
    
}

public class FileSystemStorageOptions
{
    public required string StoragePath { get; set; }
}