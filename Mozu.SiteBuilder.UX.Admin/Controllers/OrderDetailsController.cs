using Mozu.Core;
using Mozu.Core.Behaviors;
using Mozu.Core.Exceptions;
using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    /// <summary>
    /// Admin controller to enable a limited scope hand-off to storefront
    /// so that the user can view an order invoice or packing slip driven by
    /// the site's theme.
    /// </summary>
    public class OrderDetailsController : AdminApiControllerBase
    {
        private IApiContext _apiContext;

        public OrderDetailsController(IApiContext apiContext)
        {
            _apiContext = apiContext;
        }

        /// <summary>
        /// Generates a limited auth token to view the details of this order 
        /// on storefront and sends a 302 redirects to storefront.
        /// </summary>
        [HttpGet]
        public HttpResponseMessage Deets(int siteId, string orderId)
        {
            var claim = CreateLimitedUserClaimsForOrder(orderId);
            string token = claim.ToAccessToken();
            string urlEncodedToken = HttpUtility.UrlEncode(token);

            string destinationUrl = $"/back-office/orders/{orderId}?t={urlEncodedToken}";

            var resp = Request.CreateResponse(HttpStatusCode.Found);
            resp.Headers.Location = new Uri("/_gosite/" + siteId + "?environment=standalone&redir=" + HttpUtility.UrlEncode(destinationUrl), UriKind.Relative);
            return resp;
        }

        [HttpGet]
        public HttpResponseMessage ReturnReceipt(int siteId, string orderId, string returnId)
        {
            var claim = CreateLimitedUserClaimsForOrder(orderId);
            string token = claim.ToAccessToken();
            string urlEncodedToken = HttpUtility.UrlEncode(token);
            string destinationUrl = $"/back-office/return-receipt/{orderId}/{returnId}?t={urlEncodedToken}";
            var resp = Request.CreateResponse(HttpStatusCode.Found);
            resp.Headers.Location = new Uri("/_gosite/" + siteId + "?environment=standalone&redir=" + HttpUtility.UrlEncode(destinationUrl), UriKind.Relative);
            return resp;
        }
        [HttpGet]
        public HttpResponseMessage PackingSlip(int siteId, string orderId, int shipmentNumber)
        {
            if (shipmentNumber <= 0) {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            var claim = CreateLimitedUserClaimsForOrder(orderId);
            string token = claim.ToAccessToken();
            string urlEncodedToken = HttpUtility.UrlEncode(token);

            string destinationUrl = $"/back-office/orders/{orderId}/shipments/{shipmentNumber}?t={urlEncodedToken}";

            var resp = Request.CreateResponse(HttpStatusCode.Found);
            resp.Headers.Location = new Uri("/_gosite/" + siteId + "?environment=standalone&redir=" + HttpUtility.UrlEncode(destinationUrl), UriKind.Relative);
            return resp;
        }

        [HttpGet]
        public HttpResponseMessage PickWave(int siteId, int pickWaveNumber, Boolean printPickWave = true, Boolean printPackingLists = false, Boolean printSingleOrderSheets = false)
        {
            if (pickWaveNumber <= 0) {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            string destinationUrl = $"/back-office/pick-wave/{pickWaveNumber}/{printPickWave}/{printPackingLists}/{printSingleOrderSheets}";

            var resp = Request.CreateResponse(HttpStatusCode.Found);
            resp.Headers.Location = new Uri("/_gosite/" + siteId + "?environment=standalone&redir=" + HttpUtility.UrlEncode(destinationUrl), UriKind.Relative);
            return resp;
        }

        [HttpGet]
        public HttpResponseMessage OrderPickSheets(int siteId, int pickWaveNumber)
        {
            if (pickWaveNumber <= 0) {
                return Request.CreateResponse(HttpStatusCode.BadRequest);
            }

            string destinationUrl = "/back-office/order-pick-sheets/" + pickWaveNumber;

            var resp = Request.CreateResponse(HttpStatusCode.Found);
            resp.Headers.Location = new Uri("/_gosite/" + siteId + "?environment=standalone&redir=" + HttpUtility.UrlEncode(destinationUrl), UriKind.Relative);
            return resp;
        }

        [HttpGet]
        public HttpResponseMessage Transfer(int siteId, string orderId, int shipmentNumber)
        {
            var claim = CreateLimitedUserClaimsForOrder(orderId);
            string tok = claim.ToAccessToken();

            string destinationUrl = "/back-office/orders/" + orderId + "/transfers/" + shipmentNumber;

            destinationUrl += "?t=" + HttpUtility.UrlEncode(tok);

            var resp = Request.CreateResponse(HttpStatusCode.Found);
            resp.Headers.Location = new Uri("/_gosite/" + siteId + "?environment=standalone&redir=" + HttpUtility.UrlEncode(destinationUrl), UriKind.Relative);
            return resp;
        }

        private LightweightUserClaims CreateLimitedUserClaimsForOrder(string orderId)
        {
            var newScope = new UserScope { Id = _apiContext.TenantId, Type = UserScopeType.Tenant, Name = "OrderDetailsScope" };
            int[] requiredBehaviors = new int[] {
                new OrderReadBehavior().Id
            };

            // ensure that we're not accidentally escalating them to have any permissions they don't already have.
            if (requiredBehaviors.Except(_apiContext.UserClaims.BehaviorIds).Count() > 0)
            {
                throw new VaeForbiddenException("You do not have the necessary permission to view this page.");
            }

            var claim = LightweightUserClaims.CreateForAdminUser(_apiContext.UserClaims.UserId, string.Empty, string.Empty, requiredBehaviors, newScope, DateTime.UtcNow.AddMinutes(25));
            claim.Bag["OrderId"] = orderId;

            return claim;
        }
    }
}