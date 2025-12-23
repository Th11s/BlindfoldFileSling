using Microsoft.AspNetCore.Authorization;

namespace Th11s.FileSling.Web.Security;

public class DirectoryIdRequirementHandler : AuthorizationHandler<DirectoryAccessRequirement>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        DirectoryAccessRequirement requirement
    )
    {
        if (context.Resource is not DefaultHttpContext httpContext)
        {
            context.Fail();
            return Task.CompletedTask;
        }

        if (httpContext.GetRouteValue("DirectoryId") is not string directoryId)
        {
            context.Fail();
            return Task.CompletedTask;
        }

        if (context.User.HasClaim($"dir:{directoryId}", requirement.Operation))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        context.Fail();
        return Task.CompletedTask;
    }
}

public class DirectoryAccessRequirement : IAuthorizationRequirement
{
    internal DirectoryAccessRequirement(string operation)
    {
        Operation = operation;
    }

    public string Operation { get; }

    public static DirectoryAccessRequirement Read { get; } = new DirectoryAccessRequirement("read");
    public static DirectoryAccessRequirement Write { get; } = new DirectoryAccessRequirement("write");
}

