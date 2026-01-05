
using Microsoft.AspNetCore.Http.HttpResults;
using static Microsoft.AspNetCore.Http.TypedResults;

using Th11s.FileSling.Services;

namespace Th11s.FileSling.Web.Endpoints;

internal static class Files
{
    internal static async Task<Ok<HttpModel.FileMetadata>> Create(
        string directoryId,
        Requests.Commands.CreateFile command,
        HttpContext context,
        IFileStorage fileStorage)
    {
        var file = await fileStorage.CreateFile(new (directoryId), command, context.User);
        var httpModel = new HttpModel.FileMetadata(
                file.Id.Value,
                file.DirectoryId.Value,
                file.CreatedAt,
                file.SizeInBytes,
                file.DownloadCount,
                new(
                    file.Protected.EncryptionHeader,
                    file.Protected.Base64CipherText
                )
            );

        return Ok(httpModel);
    }

    internal static async Task<IResult> Append(HttpContext context)
    {
        throw new NotImplementedException();
    }


    internal static async Task<IResult> Delete(HttpContext context)
    {
        throw new NotImplementedException();
    }

    internal static async Task<IResult> Download(HttpContext context)
    {
        throw new NotImplementedException();
    }

    internal static async Task<IResult> FinalizeUpload(HttpContext context)
    {
        throw new NotImplementedException();
    }

    internal static async Task<Ok<IEnumerable<HttpModel.FileMetadata>>> GetList(
        string directoryId, 
        IFileStorage fileStorage)
    {
        var files = await fileStorage.ListDirectoryContent(
            new (directoryId)
        );

        var response = files.Select(file =>
            new HttpModel.FileMetadata(
                file.Id.Value,
                file.DirectoryId.Value,
                file.CreatedAt,
                file.SizeInBytes,
                file.DownloadCount,
                new(
                    file.Protected.EncryptionHeader,
                    file.Protected.Base64CipherText
                )
            )
        );

        return Ok(response);
    }
}
