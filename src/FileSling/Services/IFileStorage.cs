using System.Security.Claims;

using Th11s.FileSling.Model;
using Th11s.FileSling.Requests.Commands;
using Th11s.FileSling.Requests.Queries;

namespace Th11s.FileSling.Services;

public interface IFileStorage
{
    Task<DirectoryMetadata> CreateDirectory(CreateDirectory command, ClaimsPrincipal currentUser);
    Task RenameDirectory(ModifyDirectory command, ClaimsPrincipal currentUser);
    Task DeleteDirectory(DeleteDirectory command, ClaimsPrincipal currentUser);

    Task<FileMetadata> CreateFile(CreateFile command, ClaimsPrincipal currentUser);
    Task WriteFileChunk(WriteFileChunk command, ClaimsPrincipal currentUser);
    Task FinalizeFile(FinalizeFile command, ClaimsPrincipal currentUser);
    
    Task DeleteFile(DeleteFile command, ClaimsPrincipal currentUser);


    Task<IEnumerable<DirectoryMetadata>> GetDirectories(GetDirectory query, ClaimsPrincipal currentUser);
    Task<IEnumerable<FileMetadata>> ListDirectoryContent(ListDirectory query, ClaimsPrincipal currentUser);

    Task<Stream> GetFileChunk(GetFile query, ClaimsPrincipal currentUser);
}
