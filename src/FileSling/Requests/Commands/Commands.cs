namespace Th11s.FileSling.Requests.Commands;

public record EncryptedData(
    string EncryptionHeader,
    string Base64CipherText
);

public record EncryptedChallenge(
    string EncryptionHeader, 
    string Base64CipherText,
    string ClearTextChallenge
) : EncryptedData(EncryptionHeader, Base64CipherText);

public record CreateDirectory(
    string ProtectedData,
    string ChallengePublicKey
);

public record ModifyDirectory(
    string ProtectedData
);

public record CreateFile(
    long SizeInBytes,
    uint ChunkCount,

    string ProtectedData
);

public record EncryptedStream(
    string EncryptionHeader,
    Stream CipherStream
);

public record WriteFileChunk(
    uint ChunkNumber,

    EncryptedStream EncryptedStream
);
