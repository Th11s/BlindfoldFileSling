using Th11s.FileSling.Model;

namespace Th11s.FileSling.Requests.Queries;


public record GetDirectory();

public record ListDirectory(
    DirectoryId DirectoryId
);

public record GetFile(
    DirectoryId DirectoryId,
    FileId FileId,
    uint ChunkNumber
    );