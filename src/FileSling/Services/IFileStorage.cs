using Th11s.FileSling.Commands;
using Th11s.FileSling.Model;
using Th11s.FileSling.Queries;

namespace Th11s.FileSling.Services
{
    public interface IFileStorage
    {
        Task<DirectoryMetadata> CreateDirectory(CreateDirectory command);
        Task RenameDirectory(RenameDirectory command);
        Task DeleteDirectory(DeleteDirectory command);

        Task<FileMetadata> CreateFile(CreateFile command);
        Task AppendFile(AppendFile command);
        Task DiscardFile(DiscardFile command);

        Task FinalizeFile(FinalizeFile command);
        Task DeleteFile(DeleteFile command);


        Task<DirectoryMetadata[]> GetDirectories(GetDirectory query);
        Task<FileMetadata[]> ListDirectory(ListDirectory query);

        Task<Stream> GetFile(GetFile query);
    }
}
