using System.Security.Claims;

using Microsoft.AspNetCore.Authentication.Cookies;

using Th11s.FileSling.Services;

namespace Th11s.FileSling.Web.Security;

public class FileSlingCookieAuthenticationEvents(IFileStorage fileStorage) : CookieAuthenticationEvents
{
    private readonly IFileStorage _fileStorage = fileStorage;

    public override async Task SigningIn(CookieSigningInContext context)
    {
        // TODO: this code should be moved into a proper service, that is only invoked during proper signin
        if(context.Principal == null)
        {
            return;
        }

        if (context.Principal.Identity is not ClaimsIdentity claimsIdentity)
        {
            return;
        }

        if (!context.Principal.HasClaim("ownership_initialized", "true"))
        {
            var ownedDirectories = await _fileStorage.GetOwnedDirectories(context.Principal);
            foreach (var dir in ownedDirectories)
            {
                claimsIdentity.AddClaim(new Claim($"dir:{dir.Id.Value}", DirectoryAccessRequirement.Owner.AccessLevel));
            }

            claimsIdentity.AddClaim(new Claim("ownership_initialized", "true"));
        }

        await base.SigningIn(context);
    }
}
