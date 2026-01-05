namespace Th11s.FileSling.Requests.Commands;

public record EncryptedData(
    string EncryptionHeader,
    string Base64CipherText
);

public record CreateDirectory(
    EncryptedData EncryptedData
);

public record ModifyDirectory(
    EncryptedData EncryptedData
);

public record CreateFile(
    long SizeInBytes,
    uint ChunkCount,

    EncryptedData EncryptedData
);

public record EncryptedStream(
    string EncryptionHeader,
    Stream CipherStream
);

public record WriteFileChunk(
    uint ChunkNumber,

    EncryptedStream EncryptedStream
);
