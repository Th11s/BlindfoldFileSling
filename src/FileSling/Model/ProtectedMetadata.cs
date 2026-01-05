namespace Th11s.FileSling.Model;

public record ProtectedMetadata(
    string EncryptionHeader,
    string Base64CipherText // Expected to be a base64url-encoded string
);
