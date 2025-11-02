namespace Th11s.FileSling.Web.Endpoints;

public static class EndpointNames
{
    public const string CreateUpload = nameof(CreateUpload);
    public const string CreateDirectory = nameof(CreateDirectory);
}

public static class EndpointExtensions
{
    public static IEndpointRouteBuilder MapFileSlingApi(this IEndpointRouteBuilder builder)
    {
        var api = builder.MapGroup("/api/");
        
        var directory = api.MapGroup("directory");
        
        directory.MapPost("new", Directories.Create)
            .WithName(EndpointNames.CreateDirectory);

        return builder;
    }
}
