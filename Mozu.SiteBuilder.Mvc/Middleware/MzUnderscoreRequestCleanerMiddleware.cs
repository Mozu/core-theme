using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.Extensions.Primitives;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class MzUnderscoreRequestCleanerMiddleware
    {
        private readonly RequestDelegate _next;
        private static readonly Regex ReMxClean = new Regex("_mz_[^&]+&*", RegexOptions.IgnoreCase);

        public MzUnderscoreRequestCleanerMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public  Task Invoke(HttpContext context)
        {
            CleanMzQuery(context);
            return _next.Invoke(context);
        }

        private static void CleanMzQuery(HttpContext context)
        {
            var uri = context.GetRequestUri();
            if (uri.PathAndQuery.IndexOf("_mz_", StringComparison.OrdinalIgnoreCase) <= -1) return;

            context.Items[UrlRewritingMiddleware.MzPreCleanedUri] = uri;
            if (uri.Query.Length <= 1) return;

            var ub = new UriBuilder(uri);
            ub.Query = ReMxClean.Replace(ub.Query.Substring(1), string.Empty);
            context.Request.QueryString = new QueryString(ub.Query);
            context.Request.Query = new QueryCollection(context.Request.Query.Where(kvp => kvp.Key.IndexOf("_mz_", StringComparison.Ordinal) == -1).ToDictionary(kvp => kvp.Key, kvp => kvp.Value)); 
        }
    }
}
