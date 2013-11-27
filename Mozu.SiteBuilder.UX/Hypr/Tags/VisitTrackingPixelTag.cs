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
        private const string VISITOR_COOKIE_NAME = "mzVisitor";
        private ILogger _logger;

        public VisitorTrackingPixelTag()
        {
            _logger = LoggingService.LoggerFor<VisitorTrackingPixelTag>();
        }

        protected override void ProcessTag(ArgumentCollection arguments, ref NDjango.Interfaces.IContext context, out string buffer, out string templateName)
        {
            buffer = templateName = null;
            Guid visitorId = EnsureVisitorCookie(context);

            var urlHelper = new System.Web.Http.Routing.UrlHelper(context.ViewContext().RequestMessage);
            var tpUrl = urlHelper.Link("Visit_Tracking_Pixel", new { r = visitorId.ToUrlSafeString() });
            buffer = String.Format("<img src=\"{0}\" />", tpUrl);
        }

        private Guid EnsureVisitorCookie(NDjango.Interfaces.IContext context)
        {
            var httpContext = context.HttpContext();

            HttpCookie visitorCookie = httpContext.Request.Cookies.Get(VISITOR_COOKIE_NAME);
            Guid visitorId = Guid.Empty;

            if (visitorCookie != null && !String.IsNullOrEmpty(visitorCookie.Value))
            {
                if (!Guid.TryParseExact(visitorCookie.Value, "N", out visitorId))
                {
                    _logger.Warn("Could not decode visitor cookie to guid: " + visitorCookie.Value);
                    visitorCookie = null;
                }
            }

            if (visitorId == Guid.Empty)
            {
                visitorId = Guid.NewGuid();
            }

            if (visitorCookie == null)
            {
                httpContext.Request.Cookies.Remove(VISITOR_COOKIE_NAME);
                httpContext.Response.Cookies.Remove(VISITOR_COOKIE_NAME);
                visitorCookie = new HttpCookie(VISITOR_COOKIE_NAME, visitorId.ToString("N"));
                visitorCookie.Expires = DateTime.Now.AddYears(1);
                httpContext.Response.Cookies.Add(visitorCookie);
            }

            return visitorId;
        }
    }
}
