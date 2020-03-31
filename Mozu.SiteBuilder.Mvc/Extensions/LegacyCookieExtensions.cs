using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class LegacyCookieExtensions
    {
        public static IDictionary<string, string> FromLegacyCookieString(this string legacyCookie)
        {
            return Mozu.Core.CookieUtils.FromLegacyCookieString(legacyCookie);            
        }

        public static string ToLegacyCookieString(this IDictionary<string, string> dict, bool escapeValues = false)
        {
            return Mozu.Core.CookieUtils.ToLegacyCookieString(dict, escapeValues);
        }
    }
}
