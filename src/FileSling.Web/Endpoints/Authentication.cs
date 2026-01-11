using System.Security.Claims;
using System.Security.Cryptography;

using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http.HttpResults;

using Th11s.FileSling.Services;

namespace Th11s.FileSling.Web.Endpoints;

internal static class Authentication
{
    internal static async Task<Results<Ok, NotFound, UnauthorizedHttpResult>> ChallengeDirectorySecret(
        string directoryId,
        [Microsoft.AspNetCore.Mvc.FromHeader(Name = "Authorization")] string authHeader,
        ClaimsPrincipal currentUser,
        IFileStorage fileStorage,
        HttpContext context
        )
    {
        var directory = await fileStorage.GetDirectory(new(directoryId));
        if (directory == null)
        {
            return TypedResults.NotFound();
        }

        var authHeaderParts = authHeader.Split(' ', 2);
        if (authHeaderParts.Length != 2 || authHeaderParts[0] != "KeyProof")
        {
            return TypedResults.Unauthorized();
        }

        if (authHeaderParts[1].Split('|', 2) is not [string challenge, string signature])
        {
            return TypedResults.Unauthorized();
        }

        var keyBytes = Convert.FromBase64String(directory.ChallengePublicKey);
        var securityKey = ECDsa.Create();
        securityKey.ImportSubjectPublicKeyInfo(keyBytes, out _);
        
        var challengeBytes = Convert.FromBase64String(challenge);
        var signatureBytes = Convert.FromBase64String(signature);

        if (!securityKey.VerifyData(challengeBytes, signatureBytes, HashAlgorithmName.SHA256))
        {
            return TypedResults.Unauthorized();
        }

        // TODO: Add claim to current user indicating access to this directory

        await context.SignInAsync(currentUser);
        return TypedResults.Ok();
    }
}