namespace Th11s.FileSling.Model;

public record struct DirectoryId(string Value)
{
    public DirectoryId() 
        : this(new CryptoGuid())
    { }
}
public record struct FileId(string Value)
{
    public FileId() 
        : this(new CryptoGuid())
    { }
}