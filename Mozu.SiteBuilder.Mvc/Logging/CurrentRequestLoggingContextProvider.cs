using System;
using System.Collections.Generic;
using System.Web;
using Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.Logging
{
    /// <summary>
    /// Decorates the Mozu Logging factory with a context provider
    /// that provides information about the current request.
    /// </summary>
    public class CurrentRequestLoggingContextProvider : ILoggingContextProvider
    {
        public IDictionary<string, object> GetProperties()
        {
            var dict = new Dictionary<string, object>(2);

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

            return dict;
        }
    }
}
