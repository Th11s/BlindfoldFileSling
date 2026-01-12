using System.IO;
using System.Security.Claims;
using System.Text.Json;

using Microsoft.Extensions.Options;

using Th11s.FileSling.Configuration;
using Th11s.FileSling.Extensions;
using Th11s.FileSling.Model;
using Th11s.FileSling.Requests.Commands;

namespace Th11s.FileSling.Services;

public class FileSystemStorageService(
    TimeProvider timeProvider,
    IOptions<FileSystemStorageOptions> options
    ) : IFileStorage
{
    private const string DirectoryMetadataFileName = "_directory.json";
    private const string FileMetadataFileName = "_file.json";

    private const string FileDirectoryExtension = "file";
    private const string PartialFileDirectoryExtension = "partial";

    private const string ChunkFileExtension = "part";
    private const string DeletionMarkerExtension = "deleted";

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
            _timeProvider.GetUtcNow() + _options.Value.DefaultRelativeDirectoryExpiry,
            default,

            currentUser.DirectoryQuota ?? _options.Value.DefaultDirectoryQuotaBytes,
            0,

            new (true, false),

            command.ChallengePublicKey,
            command.ProtectedData
        );

        cancellationToken.ThrowIfCancellationRequested();

        await UpdateMetadataFile(directoryPath, DirectoryMetadataFileName, metadata);
        await AddDirectoryToOwnerIndex(currentUser, directoryId);

        return metadata;
    }


    public async Task RenameDirectory(DirectoryId directoryId, ModifyDirectory command)
    {
        var metadata = await ReadMetadataFile<DirectoryMetadata>(
            GetDirectoryPath(directoryId),
            DirectoryMetadataFileName
        );

        metadata = metadata with
        {
            ProtectedData = command.ProtectedData
        };

        await UpdateMetadataFile(
            GetDirectoryPath(directoryId),
            DirectoryMetadataFileName,
            metadata
        );
    }


    public Task DeleteDirectory(DirectoryId directoryId)
    {
        //TODO: There should be a deletion service to actually delete these later
        var directoryPath = GetDirectoryPath(directoryId);
        Directory.Move(directoryPath, directoryPath + "." + DeletionMarkerExtension);

        return Task.CompletedTask;
    }


    public async Task<ChallengeId> SaveChallenge(DirectoryId directoryId, EncryptedChallenge challenge)
    {
        var challengeId = new ChallengeId();
        var challengeFilePath = GetChallengeFilePath(directoryId, challengeId);

        using var fileStream = new FileStream(challengeFilePath, FileMode.Create, FileAccess.Write, FileShare.None);
        await JsonSerializer.SerializeAsync(fileStream, challenge);
        await fileStream.FlushAsync();

        return challengeId;
    }


    public async Task<FileMetadata> CreateFile(DirectoryId directoryId, CreateFile command)
    {
        var directoryMetadata = await ReadMetadataFile<DirectoryMetadata>(
            GetDirectoryPath(directoryId),
            DirectoryMetadataFileName
        );

        // TODO: Check quota

        FileId fileId;
        string fileDirectoryPath;
        do
        {
            fileId = new FileId();
            fileDirectoryPath = GetFileDirectoryPath(directoryId, fileId, FileAccess.Write);
        }
        while (Directory.Exists(fileDirectoryPath));

        Directory.CreateDirectory(fileDirectoryPath);

        var metadata = new FileMetadata(
            fileId,
            directoryId,
            
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

        // TODO: Reserve space on disk?
        
        return metadata;
    }


    public async Task WriteFileChunk(DirectoryId directoryId, FileId fileId, WriteFileChunk command)
    {
        if(!Directory.Exists(GetFileDirectoryPath(directoryId, fileId, FileAccess.Write)))
        {
            throw new InvalidOperationException("File does not exist or is finalized.");
        }

        var filePath = GetChunkFilePath(directoryId, fileId, command.ChunkNumber, FileAccess.Write);

        using var fileStream = new FileStream(filePath, FileMode.Create, FileAccess.Write, FileShare.None);
        await command.EncryptedStream.CipherStream.CopyToAsync(fileStream);
        await fileStream.FlushAsync();
    }


    public Task DeleteFile(DirectoryId directoryId, FileId fileId)
    {
        var fileDirectoryPath = GetFileDirectoryPath(directoryId, fileId, FileAccess.Read);
        if(!Directory.Exists(fileDirectoryPath))
        {
            fileDirectoryPath = GetFileDirectoryPath(directoryId, fileId, FileAccess.Write);
        }
        if(!Directory.Exists(fileDirectoryPath))
        {
            throw new InvalidOperationException("File does not exist.");
        }

        var deletedFilePath = Path.ChangeExtension(fileDirectoryPath, DeletionMarkerExtension);

        Directory.Move(fileDirectoryPath, deletedFilePath);
        return Task.CompletedTask;
    }

    public Task FinalizeFile(DirectoryId directoryId, FileId fileId)
    {
        var partialFilePath = GetFileDirectoryPath(directoryId, fileId, FileAccess.Write);
        var finalizedFilePath = GetFileDirectoryPath(directoryId, fileId, FileAccess.Read);

        Directory.Move(partialFilePath, finalizedFilePath);

        return Task.CompletedTask;
    }



    public async Task<IEnumerable<DirectoryMetadata>> GetOwnedDirectories(ClaimsPrincipal currentUser)
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


    public async Task<DirectoryMetadata?> GetDirectory(DirectoryId directoryId)
    {
        var directoryPath = GetDirectoryPath(directoryId);
        if (!Path.Exists(directoryPath))
            return null;

        var metadata = await ReadMetadataFile<DirectoryMetadata>(directoryPath, DirectoryMetadataFileName);
        return metadata;
    }


    public async Task<IEnumerable<FileMetadata>> ListDirectoryContent(DirectoryId directoryId)
    {
        // enumerate files in directory
        var directoryPath = new DirectoryInfo(GetDirectoryPath(directoryId));
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


    public Task<Stream?> GetFileChunk(DirectoryId directoryId, FileId fileId, uint chunkNumber)
    {
        // get chunk file path
        var chunkFilePath = GetChunkFilePath(directoryId, fileId, chunkNumber, FileAccess.Read);
        if(!File.Exists(chunkFilePath))
        {
            return Task.FromResult<Stream?>(null);
        }

        var fileStream = new FileStream(chunkFilePath, FileMode.Open, FileAccess.Read, FileShare.Read);
        return Task.FromResult<Stream?>(fileStream);
    }


    private string GetDirectoryPath(DirectoryId directoryId)
    {
        var directoryPath = Path.Combine(_options.Value.StoragePath, directoryId.Value);

        return directoryPath;
    }

    private string GetChallengeFilePath(DirectoryId directoryId, ChallengeId challengeId)
    {
        var directoryPath = GetDirectoryPath(directoryId);
        var challengeFilePath = Path.Combine(directoryPath, $"{challengeId.Value}.challenge");
        return challengeFilePath;
    }

    private string GetFileDirectoryPath(DirectoryId directoryId, FileId fileId, FileAccess fileAccess)
    {
        var extension = fileAccess switch { 
            FileAccess.Read => FileDirectoryExtension, 
            FileAccess.Write => PartialFileDirectoryExtension, 
            _ => throw new InvalidOperationException("Invalid file access.") 
        };

        var directoryPath = GetDirectoryPath(directoryId);
        var filePath = Path.Combine(directoryPath, $"{fileId.Value}.{extension}");
        return filePath;
    }

    private string GetChunkFilePath(DirectoryId directoryId, FileId fileId, uint chunkNumber, FileAccess fileAccess)
    {
        var extension = fileAccess switch
        {
            FileAccess.Read => FileDirectoryExtension,
            FileAccess.Write => PartialFileDirectoryExtension,
            _ => throw new InvalidOperationException("Invalid file access.")
        };


        var fileDirectoryPath = GetFileDirectoryPath(directoryId, fileId, fileAccess);
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
}
