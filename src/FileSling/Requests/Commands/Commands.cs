using System.Security.Claims;

using Th11s.FileSling.Model;

namespace Th11s.FileSling.Requests.Commands;

public record CreateDirectory(
    string ProtectedData,
    string ChallengePassword,
    string ProtectedChallengePassword
);

public record RenameDirectory(
    DirectoryId DirectoryId,
    string NewDisplayName
);
public record DeleteDirectory(
    DirectoryId DirectoryId
);

public record CreateFile(
    DirectoryId DirectoryId,
    long ExpectedSizeBytes,

    string ProtectedData
);

public record AppendFile(
    DirectoryId DirectoryId,
    FileId FileId,

    long OffsetBytes,
    Stream Data
);
public record DiscardFile();
public record FinalizeFile();

public record DeleteFile();
