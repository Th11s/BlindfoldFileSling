using System.Security.Claims;
using System.Text.Json;

using Microsoft.Extensions.Options;

using Th11s.FileSling.Configuration;
using Th11s.FileSling.Extensions;
using Th11s.FileSling.Model;
using Th11s.FileSling.Requests.Commands;
using Th11s.FileSling.Requests.Queries;

namespace Th11s.FileSling.Services;

public class FileSystemStorageService(
    TimeProvider timeProvider,
    IOptions<FileSystemStorageOptions> options
    ) : IFileStorage
{
    private const string DirectoryMetadataFileName = "_directory.json";
    private const string FileMetadataFileName = "_file.json";

    private const string FileDirectoryExtension = ".file";

    private const string ChunkFileExtension = ".part";
    private const string DeletionMarkerExtension = ".deleted";
    private const string PartialFileMarkerName = "_partial";

    private const string OwnerIndexFolderName = "_owners";
    private const string OwnerIndexFileExtension = ".idx";

    private readonly TimeProvider _timeProvider = timeProvider;
    private readonly IOptions<FileSystemStorageOptions> _options = options;


    public async Task<DirectoryMetadata> CreateDirectory(
        CreateDirectory command, 
        ClaimsPrincipal currentUser,
        CancellationToken cancellationToken)
    {
        DirectoryId directoryId;
        string? directoryPath;
        do
        {
            directoryId = new DirectoryId();
            directoryPath = GetDirectoryPath(directoryId);
        }
        while (Directory.Exists(directoryPath));

        Directory.CreateDirectory(directoryPath);

        var metadata = new DirectoryMetadata(
            directoryId,
            currentUser.Subject,

            _timeProvider.GetUtcNow(),
            default,
            default,

            currentUser.DirectoryQuota ?? _options.Value.DefaultDirectoryQuotaBytes,
            0,

            command.EncryptionHeader,
            command.ProtectedData
        );

        cancellationToken.ThrowIfCancellationRequested();

        await UpdateMetadataFile(directoryPath, DirectoryMetadataFileName, metadata);
        await AddDirectoryToOwnerIndex(currentUser, directoryId);

        return metadata;
    }


    public async Task RenameDirectory(ModifyDirectory command, ClaimsPrincipal currentUser)
    {
        var metadata = await ReadMetadataFile<DirectoryMetadata>(
            GetDirectoryPath(command.DirectoryId),
            DirectoryMetadataFileName
        );

        metadata = metadata with
        {
            Protected = command.ProtectedData
        };

        await UpdateMetadataFile(
            GetDirectoryPath(command.DirectoryId),
            DirectoryMetadataFileName,
            metadata
        );
    }


    public Task DeleteDirectory(DeleteDirectory command, ClaimsPrincipal currentUser)
    {
        //TODO: There should be a deletion service to actually delete these later
        var directoryPath = GetDirectoryPath(command.DirectoryId);
        Directory.Move(directoryPath, directoryPath + DeletionMarkerExtension);

        return Task.CompletedTask;
    }


    



    public async Task<FileMetadata> CreateFile(CreateFile command, ClaimsPrincipal currentUser)
    {
        var directoryMetadata = await ReadMetadataFile<DirectoryMetadata>(
            GetDirectoryPath(command.DirectoryId),
            DirectoryMetadataFileName
        );

        // TODO: Check quota

        FileId fileId;
        string fileDirectoryPath;
        do
        {
            fileId = new FileId();
            fileDirectoryPath = GetFileDirectoryPath(command.DirectoryId, fileId);
        }
        while (Directory.Exists(fileDirectoryPath));

        Directory.CreateDirectory(fileDirectoryPath);

        var metadata = new FileMetadata(
            fileId,
            command.DirectoryId,
            currentUser.Subject,
            
            _timeProvider.GetUtcNow(),

            command.SizeInBytes,
            command.ChunkCount,
            0,

            command.ProtectedData
        );

        await UpdateMetadataFile(
            fileDirectoryPath,
            FileMetadataFileName,
            metadata
        );

        await CreatePartialFileMarker(fileDirectoryPath);

        // TODO: Reserve space on disk?
        
        return metadata;
    }


    public async Task WriteFileChunk(WriteFileChunk command, ClaimsPrincipal currentUser)
    {
        if(!Directory.Exists(GetFileDirectoryPath(command.DirectoryId, command.FileId)))
        {
            throw new InvalidOperationException("File does not exist.");
        }

        if(!PartialFileMarkerExists(GetFileDirectoryPath(command.DirectoryId, command.FileId)))
        {
            throw new InvalidOperationException("Cannot write chunk to finalized file.");
        }



        var filePath = GetChunkFilePath(command.DirectoryId, command.FileId, command.ChunkNumber);

        using var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None);
        await command.Data.CopyToAsync(fileStream);
        await fileStream.FlushAsync();
    }


    public Task DeleteFile(DeleteFile command, ClaimsPrincipal currentUser)
    {
        var fileDirectoryPath = GetFileDirectoryPath(command.DirectoryId, command.FileId);
        var deletedFilePath = Path.ChangeExtension(fileDirectoryPath, DeletionMarkerExtension);

        Directory.Move(fileDirectoryPath, deletedFilePath);
        return Task.CompletedTask;
    }

    public Task FinalizeFile(FinalizeFile command, ClaimsPrincipal currentUser)
    {
        var fileDirectoryPath = GetFileDirectoryPath(command.DirectoryId, command.FileId);
        DeletePartialFileMarker(fileDirectoryPath);

        return Task.CompletedTask;
    }



    public async Task<IEnumerable<DirectoryMetadata>> GetDirectories(ClaimsPrincipal currentUser)
    {
        // Read the index file for the current user
        var ownerIndexDirectory = Path.Combine(_options.Value.StoragePath, OwnerIndexFolderName);
        var ownerIndexFilePath = Path.Combine(ownerIndexDirectory, $"{currentUser.Subject}{OwnerIndexFileExtension}");
        if (!File.Exists(ownerIndexFilePath))
        {
            return [];
        }

        var directoryIds = File.ReadAllLines(ownerIndexFilePath)
            .Where(line => !string.IsNullOrWhiteSpace(line))
            .Select(line => new DirectoryId(line.Trim()))
            .ToArray();

        var result = new List<DirectoryMetadata>();

        var loaderTasks = new List<Task<DirectoryMetadata>>();
        // Load metadata for each directory
        foreach (var directoryId in directoryIds)
        {
            var directoryPath = GetDirectoryPath(directoryId);
            if (!Directory.Exists(directoryPath))
            {
                continue; // Skip deleted directories
            }

            loaderTasks.Add(ReadMetadataFile<DirectoryMetadata>(directoryPath, DirectoryMetadataFileName));
        }

        await Task.WhenAll(loaderTasks);
        foreach (var task in loaderTasks)
        {
            if(!task.IsCompletedSuccessfully)
            {
                // TODO: log metadata load errors
                continue;
            }

            result.Add(task.Result);
        }

        return result;
    }


    public async Task<DirectoryMetadata> GetDirectory(GetDirectory query)
    {
        var directoryPath = GetDirectoryPath(query.DirectoryId);
        var metadata = await ReadMetadataFile<DirectoryMetadata>(directoryPath, DirectoryMetadataFileName);
        return metadata;
    }


    public async Task<IEnumerable<FileMetadata>> ListDirectoryContent(ListDirectory query)
    {
        // enumerate files in directory
        var directoryPath = new DirectoryInfo(GetDirectoryPath(query.DirectoryId));
        var result = new List<FileMetadata>();

        var loaderTasks = new List<Task<FileMetadata>>();
        foreach (var fileDirectoryPath in directoryPath.EnumerateDirectories($"*.{FileDirectoryExtension}", SearchOption.TopDirectoryOnly))
        {
            loaderTasks.Add(ReadMetadataFile<FileMetadata>(fileDirectoryPath.FullName, FileMetadataFileName));
        }

        await Task.WhenAll(loaderTasks);
        foreach (var task in loaderTasks)
        {
            if(!task.IsCompletedSuccessfully)
            {
                // TODO: log metadata load errors
                continue;
            }

            result.Add(task.Result);
        }

        return result;
    }


    public Task<Stream> GetFileChunk(GetFile query, ClaimsPrincipal currentUser)
    {
        var fileDirectoryPath = GetFileDirectoryPath(query.DirectoryId, query.FileId);

        // Check if the file is finalized
        if (PartialFileMarkerExists(fileDirectoryPath))
        {
            throw new InvalidOperationException("Cannot read chunk from a non-finalized file.");
        }

        // get chunk file path
        var chunkFilePath = GetChunkFilePath(query.DirectoryId, query.FileId, query.ChunkNumber);
        var fileStream = new FileStream(chunkFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult<Stream>(fileStream);
    }


    private string GetDirectoryPath(DirectoryId directoryId)
    {
        var directoryPath = Path.Combine(_options.Value.StoragePath, directoryId.Value);

        return directoryPath;
    }

    private string GetFileDirectoryPath(DirectoryId directoryId, FileId fileId)
    {
        var directoryPath = GetDirectoryPath(directoryId);
        var filePath = Path.Combine(directoryPath, $"{fileId.Value}{FileDirectoryExtension}");
        return filePath;
    }

    private string GetChunkFilePath(DirectoryId directoryId, FileId fileId, uint chunkNumber)
    {
        var fileDirectoryPath = GetFileDirectoryPath(directoryId, fileId);
        var chunkFileName = $"{chunkNumber:D5}.{ChunkFileExtension}";
        var chunkFilePath = Path.Combine(fileDirectoryPath, chunkFileName);

        return chunkFilePath;
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


    private async Task AddDirectoryToOwnerIndex(ClaimsPrincipal currentUser, DirectoryId directoryId)
    {
        var ownerIndexDirectory = Path.Combine(_options.Value.StoragePath, OwnerIndexFolderName);
        Directory.CreateDirectory(ownerIndexDirectory);

        var ownerIndexFilePath = Path.Combine(ownerIndexDirectory, $"{currentUser.Subject}{OwnerIndexFileExtension}");
        await using var stream = new FileStream(ownerIndexFilePath, FileMode.Append, FileAccess.Write, FileShare.Read);
        await stream.WriteAsync(System.Text.Encoding.UTF8.GetBytes(directoryId.Value + Environment.NewLine));
        await stream.FlushAsync();
    }


    private static async Task CreatePartialFileMarker(string fileDirectoryPath)
    {
        var markerFilePath = Path.Combine(fileDirectoryPath, PartialFileMarkerName);
        await using var stream = File.Create(markerFilePath);
        await stream.FlushAsync();
    }

    private static bool PartialFileMarkerExists(string fileDirectoryPath)
    {
        var markerFilePath = Path.Combine(fileDirectoryPath, PartialFileMarkerName);
        return File.Exists(markerFilePath);
    }

    private static void DeletePartialFileMarker(string fileDirectoryPath)
    {
        var markerFilePath = Path.Combine(fileDirectoryPath, PartialFileMarkerName);
        using var fileStream = new FileStream(markerFilePath, FileMode.OpenOrCreate, FileAccess.ReadWrite, FileShare.None, 4096, FileOptions.DeleteOnClose);
    }
}
