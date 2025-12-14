using Th11s.FileSling.Model;

namespace Th11s.FileSling.Extensions;

public static class ClaimsPrincipalExtensions
{
    extension(System.Security.Claims.ClaimsPrincipal principal)
    {
        public OwnerId Subject
        {
            get
            {
                var subjectClaim = principal.FindFirst("sub");

                return subjectClaim != null
                    ? new(subjectClaim.Value)
                    : throw new InvalidOperationException("The ClaimsPrincipal does not contain a 'sub' claim.");
            }
        }

        public long DirectoryQuota
        {
            get
            {
                var quotaClaim = principal.FindFirst("directory_quota_bytes");
                return quotaClaim != null && long.TryParse(quotaClaim.Value, out var quota)
                    ? quota
                    : 500_000_000_000;
            }
        }
    }
}
