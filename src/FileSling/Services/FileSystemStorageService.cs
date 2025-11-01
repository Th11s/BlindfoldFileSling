using Th11s.FileSling.Commands;
using Th11s.FileSling.Model;
using Th11s.FileSling.Queries;

namespace Th11s.FileSling.Services;

public class FileSystemStorageService : IFileStorage
{
    public Task AppendFile(AppendFile command)
    {
        throw new NotImplementedException();
    }

    public Task<DirectoryMetadata> CreateDirectory(CreateDirectory command)
    {
        throw new NotImplementedException();
    }

    public Task<FileMetadata> CreateFile(CreateFile command)
    {
        throw new NotImplementedException();
    }

    public Task DeleteDirectory(DeleteDirectory command)
    {
        throw new NotImplementedException();
    }

    public Task DeleteFile(DeleteFile command)
    {
        throw new NotImplementedException();
    }

    public Task DiscardFile(DiscardFile command)
    {
        throw new NotImplementedException();
    }

    public Task FinalizeFile(FinalizeFile command)
    {
        throw new NotImplementedException();
    }

    public Task<DirectoryMetadata[]> GetDirectories(GetDirectory query)
    {
        throw new NotImplementedException();
    }

    public Task<Stream> GetFile(GetFile query)
    {
        throw new NotImplementedException();
    }

    public Task<FileMetadata[]> ListDirectory(ListDirectory query)
    {
        throw new NotImplementedException();
    }

    public Task RenameDirectory(RenameDirectory command)
    {
        throw new NotImplementedException();
    }
}
