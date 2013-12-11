using System;
using System.Web;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Tags;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    [NDjango.ParserNodes.Description("Includes an invisible 1-pixel image. When the browser renders the page, the HTTP request for that image will be used to track the visitor.")]
    [NDjango.Interfaces.Name("visitor_tracking_pixel")]
    public class VisitorTrackingPixelTag : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            var visit = context.PageContext().Visit;

            var urlHelper = new System.Web.Http.Routing.UrlHelper(context.ViewContext().RequestMessage);
            var tpUrl = urlHelper.Route("Visit_Tracking_Pixel", new { r = visit.VisitId });
            buffer = String.Format("<img src=\"{0}\" />", tpUrl);
        }
    }
}
