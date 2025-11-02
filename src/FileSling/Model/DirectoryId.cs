namespace Th11s.FileSling.Model;

public record struct DirectoryId(string Value)
{
    public DirectoryId()
        : this(new CryptoGuid())
    { }
}