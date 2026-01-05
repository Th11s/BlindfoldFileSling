using System.Security.Claims;

using Microsoft.AspNetCore.Http.HttpResults;
using static Microsoft.AspNetCore.Http.TypedResults;

using Th11s.FileSling.Services;
using Microsoft.AspNetCore.Authentication;

namespace Th11s.FileSling.Web.Endpoints;

internal static class Directories
{
    internal static async Task<IResult> ListOwned(HttpContext httpContext)
    {
        throw new NotImplementedException();
    }


    internal static async Task<Results<Ok<HttpModel.DirectoryMetadata>, NotFound>> Get(
        string directoryId,
        IFileStorage storage
        )
    {
        var directory = await storage.GetDirectory(new(new(directoryId)));
        if(directory == null)
        {
            return NotFound();
        }

        var httpResult = new HttpModel.DirectoryMetadata(
            directory.Id.Value,
            directory.CreatedAt,
            directory.ExpiresAt,
            directory.LastFileUploadAt,
            directory.MaxStorageBytes,
            directory.UsedStorageBytes,
            new(
                directory.Protected.EncryptionHeader,
                directory.Protected.Base64CipherText
            )
        );

        return Ok(httpResult);
    }

    internal static async Task<Ok<HttpModel.DirectoryMetadata>> Create(
        Requests.Commands.CreateDirectory command,
        IFileStorage fileStorage,
        ClaimsPrincipal currentUser,
        HttpContext context,
        CancellationToken cancellationToken)
    {
        var directory = await fileStorage.CreateDirectory(command, currentUser, cancellationToken);
        var httpResult = new HttpModel.DirectoryMetadata(
            directory.Id.Value,
            directory.CreatedAt,
            directory.ExpiresAt,
            directory.LastFileUploadAt,
            directory.MaxStorageBytes,
            directory.UsedStorageBytes,
            new(
                directory.Protected.EncryptionHeader,
                directory.Protected.Base64CipherText
            )
        );

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

}
