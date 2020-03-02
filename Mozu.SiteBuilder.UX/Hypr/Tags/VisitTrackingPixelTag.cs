using System;
using Mozu.SiteBuilder.Mvc.Tags;
using NDjango.Interfaces;
using System.Linq;
using NDjango.FiltersCS.Compatibility;

namespace Mozu.SiteBuilder.UX.Hypr.Tags
{
    /// <summary>
    /// Includes an invisible 1-pixel image. When the browser renders the page, the HTTP request for that image will be used to track the visitor.
    /// </summary>
    [NDjango.ParserNodes.Description("Includes an invisible 1-pixel image. When the browser renders the page, the HTTP request for that image will be used to track the visitor.")]
    [Name("visitor_tracking_pixel")]
    public class VisitorTrackingPixelTag : SimpleTagBase
    {
        protected override System.Collections.Generic.IEnumerable<WalkResult> ProcessTag(ArgumentCollection arguments, IContext context, Func<string, ITemplate> getTemplateFunction)
        {
            var visit = context.PageContext().Visit;
            if (visit == null) return Enumerable.Empty<WalkResult>();

            var buffer =
                $"<img data-mztp src=\"/_mzblank.gif?r={System.Web.HttpUtility.UrlEncode(visit.VisitId)}\" alt=\"\"/>";
            return new[] { WalkResultHelpers.Buffer(buffer) };
        }
    }
}
