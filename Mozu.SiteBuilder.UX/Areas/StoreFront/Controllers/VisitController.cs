using System;
using System.Net.Http;
using System.Web.Http;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Extensions;
using System.Linq;
using System.Threading.Tasks;
using System.Net;
using System.Net.Http.Headers;
using System.Web;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    /// <summary>
    /// Controller for the tracking pixel that tracks visit to the site.
    /// One cookie can't be a session cookie (deleted when browser is closed) and also have an expiration date,
    /// So we use two cookies to accomplish this.
    /// </summary>
    public class VisitController : ApiController
    {
        private const string VISIT_COOKIE_NAME = "mzVisit";
        private const string SESSION_COOKIE_NAME = "mzSession";
        // TODO: thisis a duplicate value from VisitTrackingPixelTag.
        private const string VISITOR_COOKIE_NAME = "mzVisitor";

        // 1x1 transparant pixel gif, base64 encoded. source: http://www.fishofprey.com/2009/05/base-64-encoding-for-1x1-px-transparent.html
        private const string PIXEL_CONTENT_BASE64 = @"R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        private static byte[] PIXEL_BYTES = Convert.FromBase64String(PIXEL_CONTENT_BASE64);

        private ILogger _logger;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public VisitController(ILogger logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public HttpResponseMessage TrackingPixel([FromUri(Name="r")]string visitorId)
        {
            // try to parse the visitor id from the query string.
            Guid visitorIdFromArg = Guid.Empty;
            try
            {
                visitorIdFromArg = visitorId.DecodeUrlSafeGuid();
            }
            catch (Exception e)
            {
                _logger.Warn("Tracking pixel requested with an unparsable visitor id: " + visitorId, e);
                return Pixel();
            }

            // try to parse the visitor id from the cookie.
            var visitorCookie = Request.Headers.GetCookies(VISITOR_COOKIE_NAME).Select(cookies => cookies[VISITOR_COOKIE_NAME]).FirstOrDefault();
            Guid visitorIdFromCookie = Guid.Empty;
            if (visitorCookie == null)
            {
                _logger.Info("Tracking pixel requested with no cookies in payload. Assuming visitor has cookies disabled. Visitor id from query string: " + visitorIdFromArg.ToString("N"));
                return Pixel();
            }

            // make sure the cookie id and the query string id match
            Guid.TryParseExact(visitorCookie.Value, "N", out visitorIdFromCookie);
            if (visitorIdFromCookie != visitorIdFromArg)
            {
                _logger.Warn("Tracking pixel requested with mismatched visitor ids. Query string: " + visitorIdFromArg.ToString("N") + ". Cookie: " + visitorCookie != null ? visitorCookie.Value : "null" + ".");
                return Pixel();
            }

            // check for both an existing visit cookie and a session cookie.
            var visitCookie = Request.Headers.GetCookies(VISIT_COOKIE_NAME).Select(cookies => cookies[VISIT_COOKIE_NAME]).FirstOrDefault();
            var sessionCookie = Request.Headers.GetCookies(SESSION_COOKIE_NAME).Select(cookies => cookies[SESSION_COOKIE_NAME]).FirstOrDefault();
            if (visitCookie != null && sessionCookie != null)
            {
                // visit cookie is fresh, push the cookie out 30 minutes and do not log anything.
                return Pixel(visitCookie.Value);
            }

            // finally, log the visit.
            string visitId = Guid.NewGuid().ToString("N");
            var logInfo = new {
                VisitorId = visitorIdFromArg.ToString("N"), 
                VisitId = visitId,
                UserAgent = this.Request.Headers.UserAgent, 
                LandingPage = this.Request.Headers.Referrer
            };
            _logger.Info("I caught a visit!", logInfo);
            return Pixel(visitId);
        }
        
        /// <summary>
        /// Returns a 1x1 transparant gif.
        /// </summary>
        private HttpResponseMessage Pixel(string visitId = null)
        {
            if (visitId == null)
                visitId = Guid.NewGuid().ToString("N");

            // create a visit cookie that expires in 30 minutes
            var visitCookie = new CookieHeaderValue(VISIT_COOKIE_NAME, visitId) {
                Expires = DateTimeOffset.UtcNow.AddMinutes(30),
                HttpOnly = true
            };
            // create a second "session" cookie that will expire when the user closes their browser.
            var sessionCookie = new CookieHeaderValue(SESSION_COOKIE_NAME, visitId) {
                HttpOnly = true
            };

            var pixelResponse = new HttpResponseMessage(HttpStatusCode.OK);
            pixelResponse.Content = new ByteArrayContent(PIXEL_BYTES);
            pixelResponse.Content.Headers.ContentType = new MediaTypeHeaderValue("image/gif");
            pixelResponse.Headers.AddCookies(new[] { visitCookie, sessionCookie });
            return pixelResponse;
        }
    }
}
