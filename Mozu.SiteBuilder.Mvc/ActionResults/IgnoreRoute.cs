using System.Collections.Generic;
using System.Net.Http;
using System.Web.Http.Routing;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    public class IgnoreRoute : HttpRoute
    {
        public IgnoreRoute(string url)
            : base(url)
        {
        }
        public override IHttpVirtualPathData GetVirtualPath(HttpRequestMessage request, IDictionary<string, object> values)
        {
            return null;
        }

    }
}