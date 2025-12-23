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


    Task<IEnumerable<DirectoryMetadata>> GetDirectories(GetDirectories query, ClaimsPrincipal currentUser);
    Task<DirectoryMetadata> GetDirectory(GetDirectory query);
    Task<IEnumerable<FileMetadata>> ListDirectoryContent(ListDirectory query);

    Task<Stream> GetFileChunk(GetFile query, ClaimsPrincipal currentUser);
}
