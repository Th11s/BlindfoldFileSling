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

        var claimType = $"dir:{directoryId}";

        if (
            context.User.HasClaim(claimType, requirement.AccessLevel)
        )
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
    internal DirectoryAccessRequirement(string accessLevel)
    {
        AccessLevel = accessLevel;
    }

    public string AccessLevel { get; }

    public static DirectoryAccessRequirement Content { get; } = new DirectoryAccessRequirement("content");
    public static DirectoryAccessRequirement Owner { get; } = new DirectoryAccessRequirement("owner");
}

