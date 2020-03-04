using System.Net.Http;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using ActionResult = Mozu.SiteBuilder.Mvc.ActionResults.ActionResult;

namespace Mozu.SiteBuilder.Mvc
{
    public class RssActionResult : ActionResult
    {
        public SyndicationFeed Feed { get; set; }

        public override void ExecuteResult(HttpRequestMessage requestMessage)
        {
            var httpContext = requestMessage.HttpContext();

            httpContext.Response.ContentType = "application/rss+xml";

            var rssFormatter = new Rss20FeedFormatter(Feed);

            using var writer = XmlWriter.Create(httpContext.Response.Body);
            rssFormatter.WriteTo(writer);
        }

        public Task ExecuteResultAsync(ActionContext context)
        {
            throw new System.NotImplementedException();
        }
    }
}
