using System.Diagnostics;

namespace Th11s.FileSling.Model;

[DebuggerDisplay($"{{{nameof(Value)},nq}}")]
public record struct ChallengeId(string Value)
{
    public ChallengeId()
        : this(new CryptoToken())
    { }
}
