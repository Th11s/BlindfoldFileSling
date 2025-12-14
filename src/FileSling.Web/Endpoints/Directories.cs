
namespace Th11s.FileSling.Web.Endpoints;

internal static class Directories
{
    internal static async Task<IResult> ListOwned(HttpContext httpContext)
    {
        throw new NotImplementedException();
    }


    internal static async Task<IResult> Get(string directoryId)
    {
        throw new NotImplementedException();
    }

    internal static async Task<IResult> Create(Commands.CreateDirectory command)
    {
        return Results.Ok("Create Directory Endpoint");
    }

    internal static async Task<IResult> Rename(string directoryId, Commands.RenameDirectory command)
    {
        return Results.Ok($"Rename Directory Endpoint for {directoryId}");
    }

    internal static async Task<IResult> Delete(string directoryId)
    {
        return Results.Ok($"Delete Directory Endpoint for {directoryId}");
    }

}
