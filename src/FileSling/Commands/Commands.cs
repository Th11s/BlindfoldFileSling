using System.Security.Claims;

using Th11s.FileSling.Model;

namespace Th11s.FileSling.Commands;

public record CreateDirectory(
    string ProtectedData,
    string ChallangePassword,
    string ProtectedChallengePassword,
    ClaimsPrincipal CurrentUser
);

public record RenameDirectory(
    DirectoryId DirectoryId,
    string NewDisplayName, 
    ClaimsPrincipal CurrentUser
);
public record DeleteDirectory(
    DirectoryId DirectoryId,
    ClaimsPrincipal CurrentUser
);

public record CreateFile();
public record AppendFile();
public record DiscardFile();
public record FinalizeFile();

public record DeleteFile();
