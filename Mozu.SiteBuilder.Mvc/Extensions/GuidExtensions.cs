using System;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class GuidExtensions
    {
        public static string ToUrlSafeString(this Guid guid) {
            return Convert.ToBase64String(guid.ToByteArray()).Replace('+', '-').Replace('/', '_').TrimEnd('=');
        }

        public static Guid DecodeUrlSafeGuid(this string guidString)
        {
            // replace the equals sign padding we trimmed during encoding.
            string base64 = guidString.Replace('-', '+').Replace('_', '/') + "==";
            byte[] guidBytes = Convert.FromBase64String(base64);
            return new Guid(guidBytes);
        }
    }
}
