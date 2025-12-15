using System.Security.Claims;
using System.Text.Json;

using Th11s.FileSling.Configuration;
using Th11s.FileSling.Extensions;
using Th11s.FileSling.Model;
using Th11s.FileSling.Requests.Commands;
using Th11s.FileSling.Requests.Queries;

namespace Th11s.FileSling.Services;

public class FileSystemStorageService(
    TimeProvider timeProvider,
    FileSystemStorageOptions options
    ) : IFileStorage
{
    private const string DirectoryMetadataFileName = "_directory.json";
    private const string FileMetadataPattern = "{0}._file.json";
    private const string PartialFileExtension = ".part";

    private readonly TimeProvider _timeProvider = timeProvider;
    private readonly FileSystemStorageOptions _options = options;


    public async Task<DirectoryMetadata> CreateDirectory(CreateDirectory command, ClaimsPrincipal currentUser)
    {
        var directoryId = new DirectoryId();
        var directoryPath = GetDirectoryPath(directoryId);
        Directory.CreateDirectory(directoryPath);

        var metadata = new DirectoryMetadata(
            directoryId,
            currentUser.Subject,

            _timeProvider.GetUtcNow(),
            default,
            default,

            currentUser.DirectoryQuota ?? _options.DefaultDirectoryQuotaBytes,

            command.ProtectedData,
            command.ChallengePassword,
            command.ProtectedChallengePassword
        );

        await UpdateMetadataFile(directoryPath, DirectoryMetadataFileName, metadata);

        // TODO: Owner Index file

        return metadata;
    }


    public Task RenameDirectory(RenameDirectory command, ClaimsPrincipal currentUser)
    {
        throw new NotImplementedException();
    }


    public Task DeleteDirectory(DeleteDirectory command, ClaimsPrincipal currentUser)
    {
        throw new NotImplementedException();
    }


    



    public async Task<FileMetadata> CreateFile(CreateFile command, ClaimsPrincipal currentUser)
    {
        var directoryMetadata = await ReadMetadataFile<DirectoryMetadata>(
            GetDirectoryPath(command.DirectoryId),
            DirectoryMetadataFileName
        );

        // TODO: Check quota

        var fileId = new FileId();
        var (filePath, fileName) = GetFilePath(command.DirectoryId, fileId);

        var metadata = new FileMetadata(
            fileId,
            command.DirectoryId,
            currentUser.Subject,
            
            _timeProvider.GetUtcNow(),

            command.ExpectedSizeBytes,
            0,

            command.ProtectedData
        );

        var metadataFilePath = string.Format(FileMetadataPattern, fileName);
        await UpdateMetadataFile(
            GetDirectoryPath(command.DirectoryId),
            metadataFilePath,
            metadata
        );

        var partialFilePath = Path.ChangeExtension(filePath, PartialFileExtension);

        // TODO: explicit try catch finally to communicate errors and clean up partial files
        using var fileStream = new FileStream(partialFilePath, FileMode.Create, FileAccess.Write, FileShare.None);
        // Reserve space by setting file length
        fileStream.SetLength(command.ExpectedSizeBytes);

        return metadata;
    }


    public async Task AppendFile(AppendFile command, ClaimsPrincipal currentUser)
    {
        var (filePath, fileName) = GetFilePath(command.DirectoryId, command.FileId);
        var partialFilePath = Path.ChangeExtension(filePath, PartialFileExtension);

        using var fileStream = new FileStream(partialFilePath, FileMode.Open, FileAccess.Write, FileShare.Write);
        fileStream.Seek(command.OffsetBytes, SeekOrigin.Begin);
        await command.Data.CopyToAsync(fileStream);
    }


    public Task DeleteFile(DeleteFile command, ClaimsPrincipal currentUser)
    {
        var (filePath, fileName) = GetFilePath(command.DirectoryId, command.FileId);

    }

    public Task FinalizeFile(FinalizeFile command, ClaimsPrincipal currentUser)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }



    public Task<DirectoryMetadata[]> GetDirectories(GetDirectory query, ClaimsPrincipal currentUser)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }

    public Task<Stream> GetFile(GetFile query, ClaimsPrincipal currentUser)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }

    public Task<FileMetadata[]> ListDirectory(ListDirectories query, ClaimsPrincipal currentUser)
    {
        // TODO: Authorization checks
        throw new NotImplementedException();
    }



    private string GetDirectoryPath(DirectoryId directoryId)
    {
        var directoryPath = Path.Combine(_options.StoragePath, directoryId.Value);

        return directoryPath;
    }

    private (string filePath, string fileName) GetFilePath(DirectoryId directoryId, FileId fileId)
    {
        var directoryPath = GetDirectoryPath(directoryId);
        var filePath = Path.Combine(directoryPath, fileId.Value);
        return (filePath, fileId.Value);
    }


    private static async Task UpdateMetadataFile<T>(string directoryPath, string fileName, T metadata)
    {
        var metadataFilePath = Path.Combine(directoryPath, fileName);
        using var stream = File.OpenWrite(metadataFilePath);
        await JsonSerializer.SerializeAsync(stream, metadata);
        await stream.FlushAsync();
    }

    private static async Task<T> ReadMetadataFile<T>(string directoryPath, string fileName)
    {
        var metadataFilePath = Path.Combine(directoryPath, fileName);
        using var stream = File.OpenRead(metadataFilePath);
        var metadata = await JsonSerializer.DeserializeAsync<T>(stream);
        return metadata ?? throw new InvalidOperationException("Failed to deserialize metadata file.");
    }
}
