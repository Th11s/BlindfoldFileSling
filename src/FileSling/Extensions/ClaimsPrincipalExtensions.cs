namespace Th11s.FileSling.Extensions;

public static class ClaimsPrincipalExtensions
{
    extension(System.Security.Claims.ClaimsPrincipal principal)
    {
        public string Subject
        {
            get
            {
                var subjectClaim = principal.FindFirst("sub");

                return subjectClaim != null
                    ? subjectClaim.Value
                    : throw new InvalidOperationException("The ClaimsPrincipal does not contain a 'sub' claim.");
            }
        }
    }
}
