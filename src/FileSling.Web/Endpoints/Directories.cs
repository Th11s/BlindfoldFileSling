using System.Security.Claims;

using Th11s.FileSling.Services;

namespace Th11s.FileSling.Web.Endpoints;

internal static class Directories
{
    internal static async Task<IResult> ListOwned(HttpContext httpContext)
    {
        throw new NotImplementedException();
    }


    internal static async Task<IResult> Get(
        string directoryId,
        IFileStorage storage
        )
    {
        var directory = await storage.GetDirectory(new(new(directoryId)));
        var files = await storage.ListDirectoryContent(new(new(directoryId)));

        return Results.Ok(new
        {
            Directory = directory,
            Files = files
        });
    }

    internal static async Task<IResult> Create(
        Requests.Commands.CreateDirectory command,
        IFileStorage fileStorage,
        ClaimsPrincipal currentUser,
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
            directory.Protected
        );

        return TypedResults.Ok(httpResult);
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
