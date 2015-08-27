using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Messaging;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    /// <summary>
    /// Controller for the tracking pixel that tracks visit to the site.
    /// One cookie can't be a session cookie (deleted when browser is closed) and also have an expiration date,
    /// So we use two cookies to accomplish this.
    /// </summary>
    public class VisitController : ApiControllerBase
    {
        // 1x1 transparant pixel gif, base64 encoded.
        private const string PIXEL_CONTENT_BASE64 = @"R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
        private static byte[] PIXEL_BYTES = Convert.FromBase64String(PIXEL_CONTENT_BASE64);

        private HttpContextBase _httpContext;
        private PageContext _pageContext;
        private ISiteBuilderApiContext _apiContext;
        private VisitEventPublisher _publisher;
        private ILogger _logger;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public VisitController(HttpContextBase httpContext, PageContext pageContext, ISiteBuilderApiContext apiContext, VisitEventPublisher publisher, ILogger logger)
        {
            _httpContext = httpContext;
            _pageContext = pageContext;
            _apiContext = apiContext;
            _publisher = publisher;
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
            if (_pageContext.Visit == null  || _pageContext.Visit.IsLanding)
                return Pixel();

            // make sure the cookie id and the query string id match
            if (_pageContext.Visit.VisitId != visitId)
            {
                _logger.Warn("Tracking pixel requested with mismatched visit ids. Query string: " + visitId + ". Cookie: " + _pageContext.Visit.VisitId + ".");
                return Pixel();
            }

            // only log the visit if it wasn't already tracked.
            bool isAlreadyTracked = _pageContext.Visit.IsTracked && (String.IsNullOrEmpty(_pageContext.Visit.UserId) || _pageContext.Visit.IsUserTracked);
            if (!isAlreadyTracked)
            {
                // log the visit.
                _publisher.PublishVisit(_pageContext.Visit);
                _logger.Info("I caught a visit!", _pageContext.Visit);
                _pageContext.Visit.IsTracked = true;
                _pageContext.Visit.IsUserTracked = !String.IsNullOrEmpty(_pageContext.Visit.UserId);
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
