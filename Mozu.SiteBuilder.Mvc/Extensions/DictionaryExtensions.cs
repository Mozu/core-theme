using System.Collections.Generic;
using System.Linq;
using Mozu.Core.Extensions;
using System.Web;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class DictionaryExtensions
    {
        /// <summary>
        /// creates a query string from a dictionary of string, string.  This query string is NOT prepended with '?'. This is so you can set a System.Web.Uri's Query property with this and not get duplicate '?' characters.
        /// </summary>
        /// <param name="values"></param>
        /// <returns></returns>
        public static string ToQueryString(this Dictionary<string, string> values)
        {
            var strings =
                values
                .Where(x => !x.Value.IsNullOrEmpty())
                .Select((x, i) => string.Format("{0}{1}={2}", i == 0 ? string.Empty : "&", x.Key, HttpUtility.UrlEncode(x.Value)));
            return string.Join(string.Empty, strings);
        }
    }
}
