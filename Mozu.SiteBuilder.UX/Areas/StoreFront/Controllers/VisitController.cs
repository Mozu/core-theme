using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web.Http;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    /// <summary>
    /// Controller for the tracking pixel that tracks visit to the site.
    /// One cookie can't be a session cookie (deleted when browser is closed) and also have an expiration date,
    /// So we use two cookies to accomplish this.
    /// </summary>
    public class VisitController : ApiController
    {
        // 1x1 transparant pixel gif, base64 encoded.
        private const string PIXEL_CONTENT_BASE64 = @"R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        private static byte[] PIXEL_BYTES = Convert.FromBase64String(PIXEL_CONTENT_BASE64);

        private PageContext _pageContext;
        private ILogger _logger;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public VisitController(PageContext pageContext, ILogger logger)
        {
            _pageContext = pageContext;
            _logger = logger;
        }

        [HttpGet]
        public HttpResponseMessage TrackingPixel([FromUri(Name="r")]string visitId)
        {
            // try to parse the visitor id from the query string.
            Guid visitIdFromArg = Guid.Empty;
            try
            {
                visitIdFromArg = visitId.DecodeUrlSafeGuid();
            }
            catch (Exception e)
            {
                _logger.Warn("Tracking pixel requested with an unparsable visit id: " + visitId, e);
                return Pixel();
            }

            // if the Visit thinks this is the landing page, cookies must be disabled.
            if (_pageContext.Visit == null || _pageContext.Visit.IsLanding)
                return Pixel();

            // make sure the cookie id and the query string id match
            if (_pageContext.Visit.VisitId != visitId)
            {
                _logger.Warn("Tracking pixel requested with mismatched visit ids. Query string: " + visitId + ". Cookie: " + _pageContext.Visit.VisitId + ".");
                return Pixel();
            }

            // only log the visit if it wasn't already tracked.
            if (!_pageContext.Visit.IsTracked)
            {
                // log the visit.
                var visitTrackingEvent = new {
                    VisitId = _pageContext.Visit.VisitId,
                    VisitorId = _pageContext.Visit.VisitorId,
                    UserAgent = Request.Headers.UserAgent.ToString(),
                    LandingPage = Request.Headers.Referrer
                };
                _logger.Info("I caught a visit!", visitTrackingEvent);
                _pageContext.Visit.IsTracked = true;
            }

            return Pixel();
        }
        
        /// <summary>
        /// Returns a 1x1 transparant gif.
        /// </summary>
        private HttpResponseMessage Pixel()
        {
            var pixelResponse = new HttpResponseMessage(HttpStatusCode.OK);
            pixelResponse.Content = new ByteArrayContent(PIXEL_BYTES);
            pixelResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("image/gif");
            return pixelResponse;
        }
    }
}
