using Th11s.FileSling.Model;

namespace Th11s.FileSling.Requests.Queries;


public record GetDirectories();
public record GetDirectory(DirectoryId DirectoryId);

public record ListDirectory(
    DirectoryId DirectoryId
);

public record GetFile(
    DirectoryId DirectoryId,
    FileId FileId,
    uint ChunkNumber
    );