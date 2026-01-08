namespace Th11s.FileSling.Web.Extensions;

public static class LongExtensions
{
    extension(long bytes)
    {
        public string ToReadableFileSize()
        {
            string[] sizes = { "B", "KB", "MB", "GB", "TB" };
            double len = bytes;
            int order = 0;
            while (len >= 1024 && order < sizes.Length - 1)
            {
                order++;
                len = len / 1024;
            }

            return $"{len:0.##} {sizes[order]}";
        }
    }
}
