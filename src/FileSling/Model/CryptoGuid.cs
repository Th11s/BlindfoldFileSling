using System.Buffers.Text;
using System.Security.Cryptography;

namespace Th11s.FileSling.Model;

public readonly struct CryptoGuid
{
    public CryptoGuid()
    {
        var bytes = RandomNumberGenerator.GetBytes(16); 
        Value = Base64Url.EncodeToString(bytes);
    }

    public CryptoGuid(string value)
    {
        var bytes = Base64Url.DecodeFromChars(value);
        if (bytes.Length != 16)
        {
            throw new ArgumentException("Invalid CryptoGuid format.", nameof(value));
        }

        Value = value;
    }

    public readonly string Value { get; }

    public override string ToString() => Value;
    public static implicit operator string(CryptoGuid cryptoGuid) => cryptoGuid.Value;
}
