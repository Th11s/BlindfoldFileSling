using Microsoft.AspNetCore.Authentication.Cookies;

using Th11s.FileSling.Model;
using Th11s.FileSling.Services;

namespace Th11s.FileSling.Web.Security;

public class FileSlingCookieAuthenticationEvents(IFileStorage fileStorage) : CookieAuthenticationEvents
{
    private readonly IFileStorage _fileStorage = fileStorage;

    public override async Task SigningIn(CookieSigningInContext context)
    {
        // TODO: this code should be moved into a proper ClaimsTransformer service, that is only invoked during proper signin
        var ownedDirectories = await _fileStorage.GetOwnedDirectories(context.Principal);

        var claimsIdentity = context.Principal.Identity as System.Security.Claims.ClaimsIdentity;
        foreach (var dir in ownedDirectories)
        {
            claimsIdentity.AddClaim(new System.Security.Claims.Claim($"dir:{dir.Id.Value}", DirectoryAccessRequirement.Owner.AccessLevel));
        }

        await base.SigningIn(context);
    }
}
