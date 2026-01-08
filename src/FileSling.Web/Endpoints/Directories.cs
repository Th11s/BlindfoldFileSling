using System.Security.Claims;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Localization;

using Th11s.FileSling.Model;
using Th11s.FileSling.Services;
using Th11s.FileSling.Web.Extensions;
using Th11s.FileSling.Web.Resources;

using static Microsoft.AspNetCore.Http.TypedResults;

namespace Th11s.FileSling.Web.Endpoints;

internal static class Directories
{
    internal static async Task<IResult> ListOwned(HttpContext httpContext)
    {
        throw new NotImplementedException();
    }


    internal static async Task<Results<Ok<HttpModel.DirectoryMetadata>, NotFound>> Get(
        string directoryId,
        IFileStorage storage,
        IStringLocalizer<SharedResources> localizer
        )
    {
        var directory = await storage.GetDirectory(new(new(directoryId)));
        if(directory == null)
        {
            return NotFound();
        }

        var httpResult = directory.ToHttpModel(localizer);

        return Ok(httpResult);
    }

    internal static async Task<Ok<HttpModel.DirectoryMetadata>> Create(
        Requests.Commands.CreateDirectory command,
        IFileStorage fileStorage,
        ClaimsPrincipal currentUser,
        IStringLocalizer<SharedResources> localizer,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var directory = await fileStorage.CreateDirectory(command, currentUser, cancellationToken);
        var httpResult = directory.ToHttpModel(localizer);

        await context.SignInAsync(currentUser);
        return Ok(httpResult);
    }

    internal static async Task<IResult> Rename(string directoryId, Requests.Commands.ModifyDirectory command)
    {
        return Results.Ok($"Rename Directory Endpoint for {directoryId}");
    }

    internal static async Task<IResult> Delete(string directoryId)
    {
        return Results.Ok($"Delete Directory Endpoint for {directoryId}");
    }

    extension(DirectoryMetadata directory)
    {
        public HttpModel.DirectoryMetadata ToHttpModel(IStringLocalizer lr)
        {
            return new HttpModel.DirectoryMetadata(
                directory.Id.Value,
                directory.CreatedAt.ToString("r"),
                directory.ExpiresAt.ToString("r"),
                directory.LastFileUploadAt?.ToString("r") ?? lr["LastFileUpload.Never"],
                directory.MaxStorageBytes.ToReadableFileSize(),
                directory.UsedStorageBytes.ToReadableFileSize(),
                new(
                    directory.Protected.EncryptionHeader,
                    directory.Protected.Base64CipherText
                )
            );
        }
    }
}
