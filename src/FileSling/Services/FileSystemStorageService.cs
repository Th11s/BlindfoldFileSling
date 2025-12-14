using System.Buffers.Text;
using System.Text;
using System.Text.Json;

using Th11s.FileSling.Commands;
using Th11s.FileSling.Configuration;
using Th11s.FileSling.Extensions;
using Th11s.FileSling.Model;
using Th11s.FileSling.Queries;

namespace Th11s.FileSling.Services;

public class FileSystemStorageService(
    TimeProvider timeProvider,
    FileSystemStorageOptions options
    ) : IFileStorage
{
    private readonly TimeProvider _timeProvider = timeProvider;
    private readonly FileSystemStorageOptions _options = options;


    public async Task<DirectoryMetadata> CreateDirectory(CreateDirectory command)
    {
        // TODO: Authorization checks
        var ownerId = command.CurrentUser.Subject;
        var directoryId = new DirectoryId();

        var directoryPath = GetDirectoryPath(ownerId, directoryId);
        Directory.CreateDirectory(directoryPath);

        var metadata = new DirectoryMetadata(
            directoryId,
            command.CurrentUser.Subject,
            command.DisplayName,
            _timeProvider.GetUtcNow(),
            
            command.CurrentUser.DirectoryQuota
        );

        var metadataFilePath = Path.Combine(directoryPath, "directory.json");
        using var stream = File.OpenWrite(metadataFilePath);
        await JsonSerializer.SerializeAsync(stream, metadata);
        await stream.FlushAsync();

        return metadata;
    }


    public Task RenameDirectory(RenameDirectory command)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }


    public Task DeleteDirectory(DeleteDirectory command)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }


    private string GetDirectoryPath(OwnerId ownerId, DirectoryId directoryId)
    {
        var subjectBytes = Encoding.UTF8.GetBytes(ownerId.Value);
        var base64UserId = Base64Url.EncodeToString(subjectBytes);
        var directoryPath = Path.Combine(_options.StoragePath, base64UserId, directoryId.Value);
     
        return directoryPath;
    }



    public Task<FileMetadata> CreateFile(CreateFile command)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }

    public Task AppendFile(AppendFile command)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }


    public Task DeleteFile(DeleteFile command)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }

    public Task DiscardFile(DiscardFile command)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }

    public Task FinalizeFile(FinalizeFile command)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }

    public Task<DirectoryMetadata[]> GetDirectories(GetDirectory query)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }

    public Task<Stream> GetFile(GetFile query)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }

    public Task<FileMetadata[]> ListDirectory(ListDirectories query)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }

}
