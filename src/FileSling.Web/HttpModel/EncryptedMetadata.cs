namespace Th11s.FileSling.Web.HttpModel;

public record EncryptedMetadata(
    string EncryptionHeader,
    string Base64CipherText
);