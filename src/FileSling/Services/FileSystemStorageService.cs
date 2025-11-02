using System.Buffers.Text;
using System.Net.Http.Headers;
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

    public Task AppendFile(AppendFile command)
    {
        throw new NotImplementedException();
    }

    public async Task<DirectoryMetadata> CreateDirectory(CreateDirectory command)
    {
        var subjectBytes = Encoding.UTF8.GetBytes(command.CurrentUser.Subject);
        var base64UserId = Base64Url.EncodeToString(subjectBytes);

        var directoryId = new DirectoryId();

        var directoryPath = Path.Combine(_options.StoragePath, base64UserId, directoryId.Value);
        Directory.CreateDirectory(directoryPath);

        var metadata = new DirectoryMetadata(
            directoryId,
            _timeProvider.GetUtcNow(),
            new CryptoGuid().Value,
            500_000_000_000L // 500 GB TODO
        );

        var metadataFilePath = Path.Combine(directoryPath, "metadata.json");
        using var stream = File.OpenWrite(metadataFilePath);
        await JsonSerializer.SerializeAsync(stream, metadata);

        return metadata;
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
