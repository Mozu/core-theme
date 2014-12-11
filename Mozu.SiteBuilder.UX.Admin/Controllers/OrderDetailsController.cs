using System;
using System.Net;
using System.Net.Http;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Mozu.Core;
using Mozu.Core.Behaviors;
using Mozu.Core.Exceptions;
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

        public OrderDetailsController(IApiContext apiContext) {
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
            string tok = HttpUtility.UrlEncode( claim.ToAccessToken() );

            string destinationUrl = String.Format("/admin-order-summary/{0}?t={1}", orderId, HttpUtility.UrlEncode(tok));

            var resp = Request.CreateResponse(HttpStatusCode.Found);
            resp.Headers.Location = new Uri("/_gosite/" + siteId + "?redir=" + HttpUtility.UrlEncode(destinationUrl), UriKind.Relative);
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
                throw new VaeForbiddenException("You do not have the necessary permission to view this page.");

            var claim = LightweightUserClaims.CreateForAdminUser(_apiContext.UserClaims.UserId, requiredBehaviors, newScope, DateTime.UtcNow.AddMinutes(25));
            claim.Bag["OrderId"] = orderId;

            return claim;
        }
    }
}