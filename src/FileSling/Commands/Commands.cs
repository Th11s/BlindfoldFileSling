using System.Security.Claims;

namespace Th11s.FileSling.Commands;

public record CreateDirectory(ClaimsPrincipal CurrentUser);

public record RenameDirectory();
public record DeleteDirectory();

public record CreateFile();
public record AppendFile();
public record DiscardFile();
public record FinalizeFile();

public record DeleteFile();
