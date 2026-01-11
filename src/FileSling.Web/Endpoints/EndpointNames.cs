using Th11s.FileSling.Web.Security;

namespace Th11s.FileSling.Web.Endpoints;

public static class EndpointNames
{
    public const string AuthorizeDirectoryAccess = nameof(AuthorizeDirectoryAccess);

    public const string ListDirectories = nameof(ListDirectories);
    public const string GetDirectory = nameof(GetDirectory);
    public const string CreateDirectory = nameof(CreateDirectory);
    public const string RenameDirectory = nameof(RenameDirectory);
    public const string DeleteDirectory = nameof(DeleteDirectory);

    public const string GetFileList = nameof(GetFileList);
    public const string DownloadFile = nameof(DownloadFile);
    public const string CreateFile = nameof(CreateFile);
    public const string AppendFile = nameof(AppendFile);
    public const string FinalizeFile = nameof(FinalizeFile);
    public const string DeleteFile = nameof(DeleteFile);
}

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapFileSlingApi(this IEndpointRouteBuilder builder)
    {
        var api = builder.MapGroup("/api/");

        api.MapMethods("auth/{directoryId}", [HttpMethods.Head], Authentication.ChallengeDirectorySecret)
            .WithName(EndpointNames.AuthorizeDirectoryAccess);

        MapDirectoryApi(api);
        MapFileApi(builder, api);

        return builder;
    }

    private static IEndpointRouteBuilder MapFileApi(IEndpointRouteBuilder builder, RouteGroupBuilder api)
    {
        var files = api.MapGroup("file");

        files.MapGet("{directoryId}", Files.GetList)
            .WithName(EndpointNames.GetFileList)
            .RequireAuthorization(Policies.KeyPosession);

        files.MapGet("{directoryId}/{fileId}", Files.Download)
            .WithName(EndpointNames.DownloadFile)
            .RequireAuthorization(Policies.KeyPosession);

        files.MapPost("{directoryId}", Files.Create)
            .WithName(EndpointNames.CreateFile)
            .RequireAuthorization(Policies.KeyPosession);

        files.MapPut("{directoryId}/{fileId}", Files.Append)
            .WithName(EndpointNames.AppendFile)
            .RequireAuthorization(Policies.KeyPosession);

        files.MapPost("{directoryId}/{fileId}", Files.FinalizeUpload)
            .WithName(EndpointNames.FinalizeFile)
            .RequireAuthorization(Policies.KeyPosession);

        files.MapDelete("{directoryId}/{fileId}", Files.Delete)
            .WithName(EndpointNames.DeleteFile)
            .RequireAuthorization(Policies.KeyPosession);

        return builder;
    }

    private static void MapDirectoryApi(RouteGroupBuilder api)
    {
        var directory = api.MapGroup("directory");

        directory.MapGet("", Directories.ListOwned)
            .WithName(EndpointNames.ListDirectories);

        directory.MapGet("{directoryId}", Directories.Get)
            .WithName(EndpointNames.GetDirectory);

        directory.MapPost("", Directories.Create)
            .WithName(EndpointNames.CreateDirectory)
            .RequireAuthorization(Policies.DirectoryCreation);

        directory.MapPut("{directoryId}", Directories.Rename)
            .WithName(EndpointNames.RenameDirectory)
            .RequireAuthorization(Policies.DirectoryOwnerWithKey);

        directory.MapDelete("{directoryId}", Directories.Delete)
            .WithName(EndpointNames.DeleteDirectory)
            .RequireAuthorization(Policies.DirectoryOwner);
    }
}
