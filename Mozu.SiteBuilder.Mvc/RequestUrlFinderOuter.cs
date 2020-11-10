using Microsoft.AspNetCore.Http;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Mozu.SiteBuilder.Mvc.Extensions;

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
     
        public RequestUrlFinderOuter(HttpContext context, ISettings settings)
        {
            _getter = new Lazy<string>(() => GetRequestUrl(context));
            _cdnGetter = new Lazy<bool>(() => IsCdnRequest(context, settings, _getter));
           
        }

        public string GetRequestUrl()
        {
            return _getter.Value;
        }
        public bool IsCdnRequest()
        {
            return _cdnGetter.Value;
        }
        public static  bool IsCdnRequest(HttpContext context, ISettings settings, Lazy<string> urlGetter)
        {

            var cdnHost = settings.AppSettings("CdnHost");
            var cdnOriginHost = settings.AppSettings("CdnOriginHost") ?? "";
            var uri = new Uri(urlGetter.Value);
           
            return  cdnHost.EqualsIgnoreCase(uri.Host) || cdnOriginHost.EqualsIgnoreCase(uri.Host);
        }
       
        public static string GetRequestUrl(HttpContext context)
        {
            if (!context.Request.Headers.TryGetValue(Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out var values))
                return context.Request.GetDisplayUrl();

            var url = values.FirstOrDefault();
            //ssl has been terminated before rp.. need to reset
            if (url != null && context.Request.Headers.TryGetValue(Core.Api.Contracts.Constants.Headers.SSL_HANDLED, out _))
            {
                url = "https:" + url.Substring(url.IndexOf("//", StringComparison.Ordinal));
            }
            return url;

        }
    }
}
