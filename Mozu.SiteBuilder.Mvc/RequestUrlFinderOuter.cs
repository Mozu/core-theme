using Mozu.Core.Extensions;
using Mozu.Core.Settings;
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
        bool IsCdnRequest();
    }
    public class RequestUrlFinderOuter : IRequestUrlFinderOuter
    {
        private readonly Lazy<string> _getter;

        private readonly Lazy<bool> _cdnGetter;
        const string AkamiHeader = "Akamai-Origin-Hop";
        public RequestUrlFinderOuter(HttpRequestMessage request, ISettings settings)
        {
            _getter = new Lazy<string>(() => GetRequestUrl(request));
            _cdnGetter = new Lazy<bool>(() => IsCdnRequest(request, settings, _getter));
           
        }

        public string GetRequestUrl()
        {
            return _getter.Value;
        }
        public bool IsCdnRequest()
        {
            return _cdnGetter.Value;
        }
        public static  bool IsCdnRequest(HttpRequestMessage request, ISettings settings, Lazy<string> urlGetter)
        {

            var cdnHost = settings.AppSettings("CdnHost");
            var cdnOriginHost = settings.AppSettings("CdnOriginHost") ?? "";
            var uri = new Uri(urlGetter.Value);
            var hasAkamiOriginHop = request.Headers.Any(x => string.Equals(x.Key, AkamiHeader, StringComparison.OrdinalIgnoreCase));

            return hasAkamiOriginHop || cdnHost.EqualsIgnoreCase(uri.Host) || cdnOriginHost.EqualsIgnoreCase(uri.Host);
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
                    url = "https:" + url.Substring(url.IndexOf("//"));
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
