using System.Security.Claims;

using Th11s.FileSling.Model;
using Th11s.FileSling.Requests.Commands;

namespace Th11s.FileSling.Services;

public interface IFileStorage
{
    Task<DirectoryMetadata> CreateDirectory(CreateDirectory command, ClaimsPrincipal currentUser, CancellationToken cancellationToken);
    Task RenameDirectory(DirectoryId directoryId, ModifyDirectory command, ClaimsPrincipal currentUser);
    Task DeleteDirectory(DirectoryId directoryId, ClaimsPrincipal currentUser);

    Task<FileMetadata> CreateFile(DirectoryId directoryId, CreateFile command, ClaimsPrincipal currentUser);
    Task WriteFileChunk(DirectoryId directoryId, FileId fileId, WriteFileChunk command, ClaimsPrincipal currentUser);
    Task FinalizeFile(DirectoryId directoryId, FileId fileId, ClaimsPrincipal currentUser);
    
    Task DeleteFile(DirectoryId directoryId, FileId fileId, ClaimsPrincipal currentUser);


    Task<IEnumerable<DirectoryMetadata>> GetOwnedDirectories(ClaimsPrincipal currentUser);
    Task<DirectoryMetadata> GetDirectory(DirectoryId directoryId);
    Task<IEnumerable<FileMetadata>> ListDirectoryContent(DirectoryId directoryId);

    Task<Stream> GetFileChunk(DirectoryId directoryId, FileId fileId, uint chunkNumber, ClaimsPrincipal currentUser);
}
