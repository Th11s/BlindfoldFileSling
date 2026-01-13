
using System;
using System.IO;

using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

using Th11s.FileSling.Model;
using Th11s.FileSling.Services;
using Th11s.FileSling.Web.Extensions;
using Th11s.FileSling.Web.Resources;

using static Microsoft.AspNetCore.Http.TypedResults;

namespace Th11s.FileSling.Web.Endpoints;

internal static class Files
{
    internal static async Task<Ok<HttpModel.FileMetadata>> Create(
        string directoryId,
        Requests.Commands.CreateFile command,
        IFileStorage fileStorage,
        IStringLocalizer<SharedResources> localizer)
    {
        var file = await fileStorage.CreateFile(new (directoryId), command);
        var httpModel = file.ToHttpModel(localizer);

        return Ok(httpModel);
    }

    internal static async Task<Ok> Append(
        string directoryId,
        string fileId,
        [FromQuery(Name = "chunk")] int chunkIndex,
        [FromQuery(Name = "iv")] string aesIV,
        IFileStorage storage,
        Stream fileChunk)
    {
        await storage.WriteFileChunk(
            new(directoryId),
            new(fileId),
            new((uint)chunkIndex, new(aesIV, fileChunk))
        );

        return Ok();
    }


    internal static async Task<IResult> Delete(HttpContext context)
    {
        throw new NotImplementedException();
    }

    internal static async Task Download(string directoryId,
        string fileId,
        [FromQuery(Name = "chunk")] int chunkIndex,
        IFileStorage storage,
        Stream fileChunk,
        HttpResponse response)
    {
        var chunkStream = await storage.GetFileChunk(
            new(directoryId),
            new(fileId),
            (uint)chunkIndex
        );

        response.ContentType = "application/octet-stream";

        // Copy stream to response
        response.Headers["X-IV"] = chunkStream.EncryptionHeader;
        await chunkStream.CipherStream.CopyToAsync(response.Body);

        await response.Body.FlushAsync();
    }

    internal static async Task<Ok> FinalizeUpload(
        string directoryId,
        string fileId,
        IFileStorage storage)
    {
        await storage.FinalizeFile(new(directoryId), new(fileId));

        return Ok();
    }

    internal static async Task<Ok<IEnumerable<HttpModel.FileMetadata>>> GetList(
        string directoryId, 
        IFileStorage fileStorage,
        IStringLocalizer<SharedResources> localizer)
    {
        var files = await fileStorage.ListDirectoryContent(
            new (directoryId)
        );

        var response = files.Select(file => file.ToHttpModel(localizer));

        return Ok(response);
    }

    extension(FileMetadata file)
    {
        public HttpModel.FileMetadata ToHttpModel(IStringLocalizer lr)
        {
            return new HttpModel.FileMetadata(
                file.Id.Value,
                file.DirectoryId.Value,

                file.CreatedAt.ToString("r"),
                
                file.SizeInBytes,
                file.ChunkCount,
                file.SizeInBytes.ToReadableFileSize(),
                file.DownloadCount,

                file.ProtectedData
            );
        }
    }
}
