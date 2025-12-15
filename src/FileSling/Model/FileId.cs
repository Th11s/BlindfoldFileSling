using System.Diagnostics;

namespace Th11s.FileSling.Model;

[DebuggerDisplay($"{{{nameof(Value)},nq}}")]
public record struct FileId(string Value)
{
    public FileId() 
        : this(new CryptoGuid())
    { }
}