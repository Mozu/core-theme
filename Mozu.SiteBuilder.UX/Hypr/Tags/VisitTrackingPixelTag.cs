using System;
using System.Web;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Tags;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    /// Includes an invisible 1-pixel image. When the browser renders the page, the HTTP request for that image will be used to track the visitor.
    /// </summary>
    [NDjango.ParserNodes.Description("Includes an invisible 1-pixel image. When the browser renders the page, the HTTP request for that image will be used to track the visitor.")]
    [NDjango.Interfaces.Name("visitor_tracking_pixel")]
    public class VisitorTrackingPixelTag : SimpleTagBase
    {
        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            var visit = context.PageContext().Visit;
            if (visit == null)
            {
                return;
            }
     
            buffer = String.Format("<img data-mztp src=\"/_mzblank.gif?r={0}\" alt=\"\"/>",  System.Web.HttpUtility.UrlEncode(visit.VisitId));
        }
    }
}
