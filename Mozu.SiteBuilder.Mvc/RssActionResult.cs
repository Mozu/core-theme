using System.Net.Http;
using System.ServiceModel.Syndication;
using System.Threading.Tasks;
using System.Xml;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc
{
    //public class RssActionResult : IActionResult
    //{
    //    public SyndicationFeed Feed { get; set; }

    //    public override void ExecuteResult(HttpRequestMessage requestMessage)
    //    {
    //        var httpContext = requestMessage.HttpContext();

    //        httpContext.Response.ContentType = "application/rss+xml";

    //        //Rss20FeedFormatter rssFormatter = new Rss20FeedFormatter(Feed);

    //        //using (XmlWriter writer = XmlWriter.Create(httpContext.))
    //        //{
    //        //    rssFormatter.WriteTo(writer);
    //        //}
    //    }

    //    public Task ExecuteResultAsync(ActionContext context)
    //    {
    //        throw new System.NotImplementedException();
    //    }
    //}
}
