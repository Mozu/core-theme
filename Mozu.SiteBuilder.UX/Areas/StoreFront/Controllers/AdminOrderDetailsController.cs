using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Controllers;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    /// <summary>
    /// Storefront endpoint for an administrator to view 'order details' and 'packing slip',
    /// which are rendered by the storefront theme.
    /// Since this is an administrator wormholing into storefront, this controller opts out of
    /// the normal pipeline and implements its own security checks.
    /// </summary>
    public class AdminOrderDetailsController : ApiControllerBase
    {
        private HttpContextBase _httpContext;
        private ISiteBuilderApiContext _apiContext;
        private IOrderWebApiClient _orderWebApiClient;
        private ILogger _logger;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public AdminOrderDetailsController(ISiteBuilderApiContext apiContext, IOrderWebApiClient orderWebApiClient, ILogger logger)
        {
            _apiContext = apiContext;
            _orderWebApiClient = orderWebApiClient.CloneWithoutUserClaims();
        }

        /// <summary>
        /// Order summary, a.k.a. "Print Order".
        /// </summary>
        /// <param name="orderId"></param>
        /// <param name="token"></param>
        /// <returns></returns>
        [HttpGet]
        public async Task<HttpResponseMessage> OrderSummary(string orderId, [FromUri(Name="t")]string token = null)
        {
            LightweightUserClaims userClaimFromQuery = null;

            // ensure things are on the up and up
            bool isAuthorized = LightweightUserClaims.TryParse(token, out userClaimFromQuery) && IsUserAuthorizedForOrder(userClaimFromQuery, orderId);
            if (!isAuthorized) return this.Request.CreateErrorResponse(HttpStatusCode.Forbidden, "You are not permitted to access this resource.");

            var customOrderClient = _orderWebApiClient.CloneWithApiContext(ctx => ctx.UserClaims = userClaimFromQuery);

            bool isExpired = userClaimFromQuery.Expiration < DateTime.UtcNow;
            if (isExpired) return TokenExpiredResponse();

            var order = await (await customOrderClient.GetOrder(orderId)).ReadAsAsync();


            var template = SiteContext.Theme.EmailTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("orderdetailz"));
            if (template == null)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "could not find order details template for the current Theme.");
            }

            return Request.CreateResponse(HttpStatusCode.OK, View(template.Template, order));
        }

        private HttpResponseMessage TokenExpiredResponse()
        {
            var resp = new HttpResponseMessage(HttpStatusCode.NotFound);
            resp.Content = new StringContent("Aw, poop! Your access to this page has expired. Please re-request this resource from admin.");
            return resp;
        }

        /// <summary>
        /// Confirms that the user claim has permission to access this tenant and order id.
        /// </summary>
        private bool IsUserAuthorizedForOrder(LightweightUserClaims userClaimFromQuery, string orderId)
        {
            int claimTenantId;
            string claimOrderId, tidString;

            return
                (userClaimFromQuery.ScopeType == UserScopeType.Tenant.ToString())
                &&
                (userClaimFromQuery.Bag.TryGetValue("OrderId", out claimOrderId) && claimOrderId == orderId)
                &&
                (userClaimFromQuery.Bag.TryGetValue("TenantId", out tidString) && Int32.TryParse(tidString, out claimTenantId) && claimTenantId == _apiContext.TenantId);
        }
    }
}