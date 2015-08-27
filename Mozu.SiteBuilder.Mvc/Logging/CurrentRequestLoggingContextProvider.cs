using System;
using System.Collections.Generic;
using System.Web;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.Mvc.Logging
{
    /// <summary>
    /// Decorates the Mozu Logging factory with a context provider
    /// that provides information about the current request.
    /// </summary>
    public class CurrentRequestLoggingContextProvider : ILoggingContextProvider
    {
        private HttpContextBase _httpContext;
        private PageContext _pageContext;

        public CurrentRequestLoggingContextProvider() { }

        public CurrentRequestLoggingContextProvider(HttpContextBase httpContext, PageContext pageContext)
        {
            _httpContext = httpContext;
            _pageContext = pageContext;
        }

        IEnumerable<KeyValuePair<string, object>> ILoggingContextProvider.GetProperties()
        {
            var dict = new Dictionary<string, object>(4);

            if (_pageContext != null && _pageContext.Visit != null)
            {
                dict.Add("VisitId", _pageContext.Visit.VisitId);
                dict.Add("VisitorId", _pageContext.Visit.VisitorId);
            }
            if (_pageContext != null && !string.IsNullOrEmpty(_pageContext.Url))
            {
                dict.Add("PageUrl", _pageContext.Url);
            }
          
            // if context was passed via container
            if (_httpContext != null && _httpContext.Request != null)
            {
              
                dict.Add("RawUrl", _httpContext.Request.RawUrl);
                dict.Add("AbsoluteUrl", _httpContext.Request.Url != null ? _httpContext.Request.Url.AbsoluteUri : null);
            }
            // otherwise, fall back to the horrible HttpContext.Current way.
            else
            {
                try
                {
                    if (HttpContext.Current != null && HttpContext.Current.Request != null)
                    {
                        dict.Add("RawUrl", HttpContext.Current.Request.RawUrl);

                        if (HttpContext.Current.Request.Url != null)
                            dict.Add("AbsoluteUrl", HttpContext.Current.Request.Url.AbsoluteUri);
                    }
                }
                // supress HttpContext.Current not available exceptions
                catch (Exception) { }
            }
            return dict;
        }
    }
}
