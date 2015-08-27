using System.Net.Http;
using System.Web.Http.Controllers;

using System.ServiceModel.Syndication;
using System.Xml;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc
{
    public class RssActionResult : ActionResult
    {
        public SyndicationFeed Feed { get; set; }

        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {
            var httpContext = requestMessage.HttpContext();
            httpContext.Response.ContentType = "application/rss+xml";

            Rss20FeedFormatter rssFormatter = new Rss20FeedFormatter(Feed);

            using (XmlWriter writer = XmlWriter.Create(httpContext.Response.Output))
            {
                rssFormatter.WriteTo(writer);
            }
        }
    }
}
