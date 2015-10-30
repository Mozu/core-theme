using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;

namespace Mozu.SiteBuilder.Mvc
{
    /// <summary>
    /// responsible for getting the url of this request.  This can either be an RP header that was passed in or the request message uri.
    /// </summary>
    public interface IRequestUrlFinderOuter
    {
        string GetRequestUrl();
    }
    public class RequestUrlFinderOuter : IRequestUrlFinderOuter
    {
        private readonly Lazy<string> _getter;

        public RequestUrlFinderOuter(HttpRequestMessage request)
        {
            _getter = new Lazy<string>(() => GetRequestUrl(request));
        }

        public string GetRequestUrl()
        {
            return _getter.Value;
        }

        public static string GetRequestUrl(HttpRequestMessage request)
        {
            IEnumerable<string> values;
            if (request.Headers.TryGetValues(Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out values))
            {
                var url = values.FirstOrDefault();
                //ssl has been terminated before rp.. need to reset
                if (request.Headers.TryGetValues(Core.Api.Contracts.Constants.Headers.SSL_HANDLED, out values))
                {
                    url = "https" + url.Substring(4);
                }
                return url;
            }
            else
            {
                return request.RequestUri.ToString();
            }
        }
    }
}
