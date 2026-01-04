
using Th11s.FileSling.Requests.Queries;
using Th11s.FileSling.Services;

namespace Th11s.FileSling.Web.Endpoints;

internal static class Files
{
    internal static async Task<IResult> Append(HttpContext context)
    {
        throw new NotImplementedException();
    }

    internal static async Task<IResult> Create(
        string directoryId,
        Requests.Commands.CreateFile command,
        HttpContext context,
        IFileStorage fileStorage)
    {
        var metadata = await fileStorage.CreateFile(new (directoryId), command, context.User);
        return TypedResults.Ok(metadata);
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

    internal static async Task<IResult> GetList(
        string directoryId, 
        IFileStorage fileStorage)
    {
        var files = await fileStorage.ListDirectoryContent(
            new ListDirectory(new (directoryId))
            );

        return TypedResults.Ok(files);
    }
}
