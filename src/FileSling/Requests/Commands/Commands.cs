using Th11s.FileSling.Model;

namespace Th11s.FileSling.Requests.Commands;

public record CreateDirectory(
    string ProtectedData
);

public record ModifyDirectory(
    DirectoryId DirectoryId,
    string ProtectedData
);
public record DeleteDirectory(
    DirectoryId DirectoryId
);

public record CreateFile(
    DirectoryId DirectoryId,
    ulong SizeInBytes,
    uint ChunkCount,

    string ProtectedData
);

public record WriteFileChunk(
    DirectoryId DirectoryId,
    FileId FileId,

    uint ChunkNumber,
    Stream Data
);

public record FinalizeFile(
    DirectoryId DirectoryId,
    FileId FileId);

public record DeleteFile(
    DirectoryId DirectoryId,
    FileId FileId);
