using System.Buffers.Text;
using System.Security.Cryptography;

namespace Th11s.FileSling.Model;

public readonly struct CryptoToken
{
    const int ByteCount = 32;
    const int EncodedLength = ByteCount * 8 / 6;

    public CryptoToken()
    {
        var bytes = RandomNumberGenerator.GetBytes(ByteCount); 
        Value = Base64Url.EncodeToString(bytes);
    }

    public CryptoToken(string value)
    {
        if(value.Length != EncodedLength)
        {
            throw new ArgumentException("Invalid CryptoGuid format.", nameof(value));
        }

        var bytes = Base64Url.DecodeFromChars(value);
        if (bytes.Length != 16)
        {
            throw new ArgumentException("Invalid CryptoGuid format.", nameof(value));
        }

        Value = value;
    }

    public readonly string Value { get; }

    public override string ToString() => Value;
    public static implicit operator string(CryptoToken cryptoGuid) => cryptoGuid.Value;
}
