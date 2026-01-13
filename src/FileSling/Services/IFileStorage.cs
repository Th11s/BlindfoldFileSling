using System.Security.Claims;

using Th11s.FileSling.Model;
using Th11s.FileSling.Requests.Commands;

namespace Th11s.FileSling.Services;

public interface IFileStorage
{
    Task<DirectoryMetadata> CreateDirectory(CreateDirectory command, ClaimsPrincipal currentUser, CancellationToken cancellationToken);
    Task RenameDirectory(DirectoryId directoryId, ModifyDirectory command);
    Task DeleteDirectory(DirectoryId directoryId);

    Task<FileMetadata> CreateFile(DirectoryId directoryId, CreateFile command);
    Task WriteFileChunk(DirectoryId directoryId, FileId fileId, WriteFileChunk command);
    Task FinalizeFile(DirectoryId directoryId, FileId fileId);
    
    Task DeleteFile(DirectoryId directoryId, FileId fileId);


    Task<IEnumerable<DirectoryMetadata>> GetOwnedDirectories(ClaimsPrincipal currentUser);
    Task<DirectoryMetadata?> GetDirectory(DirectoryId directoryId);
    Task<IEnumerable<FileMetadata>> ListDirectoryContent(DirectoryId directoryId);

    Task<EncryptedStream> GetFileChunk(DirectoryId directoryId, FileId fileId, uint chunkNumber);
}
