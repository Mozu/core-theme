using System;
using Mozu.SiteBuilder.Mvc.Tags;
using NDjango.Interfaces;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    /// Includes an invisible 1-pixel image. When the browser renders the page, the HTTP request for that image will be used to track the visitor.
    /// </summary>
    [NDjango.ParserNodes.Description("Includes an invisible 1-pixel image. When the browser renders the page, the HTTP request for that image will be used to track the visitor.")]
    [Name("visitor_tracking_pixel")]
    public class VisitorTrackingPixelTag : SimpleTagBase
    {
        protected override ProcessTagResult ProcessTag(ArgumentCollection arguments, IContext context)
        {
            var visit = context.PageContext().Visit;
            if (visit == null) return new ProcessTagResult(context){Buffer = null, Template = null};

            var buffer = String.Format("<img data-mztp src=\"/_mzblank.gif?r={0}\" alt=\"\"/>", System.Web.HttpUtility.UrlEncode(visit.VisitId));
            return new ProcessTagResult(context){Buffer = buffer, Template = null};
        }
    }
}
