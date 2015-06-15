using System.Linq;
using System.Net;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class StringExtensions
    {
        public static string GetNullIfWhiteSpace(this string val)
        {
            if (string.IsNullOrWhiteSpace(val))
            {
                return null;
            }
            return val;
        }
        public static string GetNullIfEmpty(this string val)
        {
            if (string.IsNullOrEmpty(val))
            {
                return null;
            }
            return val;
        }

        public static bool IsNullOrEmpty(this string s)
        {
            return string.IsNullOrEmpty(s);
        }

        private static readonly string[] SpecialCharacters = { "^", "'", "\"", "{", "}", "(", ")", "[", "]" };
        public static string ToFilterSafeString(this string inputString)
        {
            return !string.IsNullOrEmpty(inputString) ? SpecialCharacters.Aggregate(inputString, (s, spec) => s.Replace(spec, "^" + spec)) : string.Empty;
        }

        // ReSharper disable once InconsistentNaming
        public static bool IsIPAddressValid(this string ipAddress)
        {
            IPAddress parsed;
            if (ipAddress == null || !IPAddress.TryParse(ipAddress, out parsed))
                return false;

            switch (parsed.AddressFamily)
            {
                case System.Net.Sockets.AddressFamily.InterNetwork:     // we have IPv4
                case System.Net.Sockets.AddressFamily.InterNetworkV6:  // we have IPv6
                    return true;
                default:
                    return false;
            }
        }
    }
}
