using System.Net.Http;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc
{
    public class RssActionResult : IActionResult
    {
        public SyndicationFeed Feed { get; set; }

        public Task ExecuteResultAsync(ActionContext context)
        {
            var httpContext = context.HttpContext;

            httpContext.Response.ContentType = "application/rss+xml";

            var rssFormatter = new Rss20FeedFormatter(Feed);

            using var writer = XmlWriter.Create(httpContext.Response.Body);
            rssFormatter.WriteTo(writer);

            return Task.CompletedTask;
        }
    }
}
