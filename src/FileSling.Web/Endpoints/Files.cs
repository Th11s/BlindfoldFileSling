
using Microsoft.AspNetCore.Http.HttpResults;
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
        HttpContext context,
        IFileStorage fileStorage,
        IStringLocalizer<SharedResources> localizer)
    {
        var file = await fileStorage.CreateFile(new (directoryId), command, context.User);
        var httpModel = file.ToHttpModel(localizer);

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
                
                file.SizeInBytes.ToReadableFileSize(),
                file.DownloadCount,

                new (
                    file.Protected.EncryptionHeader,
                    file.Protected.Base64CipherText
                )
            );
        }
    }
}
