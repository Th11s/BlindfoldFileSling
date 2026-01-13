using System.Security.Claims;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Localization;

using Th11s.FileSling.Model;
using Th11s.FileSling.Services;
using Th11s.FileSling.Web.Extensions;
using Th11s.FileSling.Web.Resources;
using Th11s.FileSling.Web.Security;

using static Microsoft.AspNetCore.Http.TypedResults;

namespace Th11s.FileSling.Web.Endpoints;

internal static class Directories
{
    internal static async Task<Ok<IEnumerable<HttpModel.DirectoryMetadata>>> ListOwned(
        HttpContext httpContext, 
        IFileStorage storage,
        IStringLocalizer<SharedResources> localizer)
    {
        if(httpContext.User.Identity?.IsAuthenticated != true)
        {
            return Ok(Enumerable.Empty<HttpModel.DirectoryMetadata>());
        }

        var directories = await storage.GetOwnedDirectories(httpContext.User);
        var response = directories
            .Select(dir => dir.ToHttpModel(localizer));

        return Ok(response);
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

        await Authentication.AddClaimAndSignin(context, currentUser, directory.Id.Value, 
            DirectoryAccessRequirement.Owner.AccessLevel, 
            DirectoryAccessRequirement.Content.AccessLevel
        );
        
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
                directory.CreatedAt.ToString("ddd, dd MMM yy"),
                directory.ExpiresAt.ToString("ddd, dd MMM yy"),
                directory.LastFileUploadAt?.ToString("ddd, dd MMM yy HH:mm") ?? lr["LastFileUpload.Never"],
                directory.MaxStorageBytes.ToReadableFileSize(),
                directory.UsedStorageBytes.ToReadableFileSize(),
         
                new(
                    directory.Configuration.AllowUpload,
                    directory.Configuration.AllowDownload
                ),
                
                directory.ProtectedData
            );
        }
    }
}
