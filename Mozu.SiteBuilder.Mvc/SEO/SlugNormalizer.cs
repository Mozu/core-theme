using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Web;
using Mozu.Core.Exceptions;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public interface ISlugNormalizer
    {
        string StripUrl(string url);
    }


    public class SlugNormalizer : ISlugNormalizer
    {
        private static readonly Regex _slugCleanRegex = new Regex(@"[^a-zA-Z0-9\.\-/]"); //not in set a-z,0-9,.,-,/

        public string StripUrl(string url)
        {
            var decodedUrl = HttpUtility.UrlDecode(url);
            if (decodedUrl == null)
            {
                throw new VaeMissingOrInvalidParameterException("url", string.Format("URL {0} is invalid", url));
            }
            return _slugCleanRegex.Replace(decodedUrl, string.Empty);
        }

    }
}