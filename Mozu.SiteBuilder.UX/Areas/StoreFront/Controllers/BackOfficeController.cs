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
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.Mvc.TestData;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using DC = Mozu.CommerceRuntime.Contracts.Orders;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    /// <summary>
    /// Storefront endpoint for an administrator to view 'order details' and 'packing slip',
    /// which are rendered by the storefront theme.
    /// Since this is an administrator wormholing into storefront, this controller opts out of
    /// the normal pipeline and implements its own security checks.
    /// </summary>
    public class BackOfficeController : ApiControllerBase
    {
        private ISiteBuilderApiContext _apiContext;
        private IOrderWebApiClient _orderWebApiClient;
        private const string CMS_LIST_NAME = "emailTemplateContent@mozu";
        private const string ORDER_PREVIEW_RESOURCE_NAME = "order.admin.order1";
        private const string PACKAGE_PREVIEW_RESOURCE_NAME = "order.admin.package1";

        /// <summary>
        /// Public constructor.
        /// </summary>
        public BackOfficeController(ISiteBuilderApiContext apiContext, IOrderWebApiClient orderWebApiClient, ILogger logger)
        {
            _apiContext = apiContext;
            _orderWebApiClient = orderWebApiClient.CloneWithoutUserClaims();
        }

        /// <summary>
        /// Order summary, a.k.a. "Print Order".
        /// </summary>
        [HttpGet]
        public async Task<HttpResponseMessage> OrderSummary(string orderId, [FromUri(Name="t")]string token = null)
        {
            var order = await GetOrderWithCustomToken(orderId, token);

            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("order-details"));
            if (template == null)
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find order details template for the current Theme.");

            return await RenderWithContext(template, order);
        }

        /// <summary>
        /// Packing Slip.
        /// </summary>
        [HttpGet]
        public async Task<HttpResponseMessage> PackingSlip(string orderId, string packageId, [FromUri(Name = "t")]string token = null)
        {
            var order = await GetOrderWithCustomToken(orderId, token);
            var package = order != null && order.Packages != null ? order.Packages.FirstOrDefault(p => p.Id == packageId) : null;

            if (order == null || package == null)
                throw new HttpResponseException(HttpStatusCode.NotFound);

            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase("packing-slip"));
            if (template == null)
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Could not find packing slip template for the current Theme.");

            var ser = new Newtonsoft.Json.JsonSerializer() { ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver() };
            var jo = Newtonsoft.Json.Linq.JObject.FromObject(package, ser);

            ViewData["order"] = order;
            return await RenderWithContext(template, package);
        }

        /// <summary>
        /// Preview of 'order summary' page from sitebuilder.
        /// </summary>
        [HttpGet]
        public async Task<HttpResponseMessage> Preview(string templateid)
        {
            var template = SiteContext.Theme.BackOfficeTemplates.FirstOrDefault(x => x.Id.EqualsIgnoreCase(templateid));
            if (template == null)
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "could not find order template " + templateid);

            if (templateid == "order-details")
            {
                object model = TestDataBroker.GetFileContents(ORDER_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                return await RenderWithContext(template, model);
            }
            else if (templateid == "packing-slip")
            {
                object order = TestDataBroker.GetFileContents(ORDER_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                object model = TestDataBroker.GetFileContents(PACKAGE_PREVIEW_RESOURCE_NAME).FirstOrDefault();
                ViewData["order"] = order;
                return await RenderWithContext(template, model);
            }
            else
            {
                throw new HttpResponseException(HttpStatusCode.NotFound);
            }
        }

        /// <summary>
        /// Takes a template, smooshes it with any page settings stored in CMS
        /// and returns the renderable result.
        /// </summary>
        private Task<HttpResponseMessage> RenderWithContext(PageTypeDefinition template, object model)
        {
            PageContext.CmsContext = new CmsPageContext()
            {
                Page = new DocumentRequest()
                {
                    ListFQN = CMS_LIST_NAME,
                    DocumentTypeFQN = CMS_LIST_NAME,
                    Path = template.Id
                }
            };
            PageContext.PageType = "order";

            // await the base class ContextInitializationTasks. This will fill out PageContext.CmsContext.Document if one exists.
            return Task.WhenAll(this.ContextInitilaztionTasks).ContinueWith(_ => {
                ViewData["customContent"] = PageContext.CmsContext.Page.Document != null ? PageContext.CmsContext.Page.Document.Properties : null;
                return Request.CreateResponse(HttpStatusCode.OK, View(template.Template, model));
            });
        }

        private HttpResponseException TokenExpiredException()
        {
            var resp = new HttpResponseMessage(HttpStatusCode.NotFound);
            resp.Content = new StringContent("Aw, poop! Your access to this page has expired. Please re-request this resource from admin.");
            return new HttpResponseException(resp);
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

        /// <summary>
        /// Retrieves an order from CommerceRuntime service using a custom access token rather than the one in api context.
        /// </summary>
        private Task<DC.Order> GetOrderWithCustomToken(string orderId, string authToken)
        {
            LightweightUserClaims userClaimFromCustomToken = null;

            // ensure things are on the up and up
            bool isAuthorized = LightweightUserClaims.TryParse(authToken, out userClaimFromCustomToken) && IsUserAuthorizedForOrder(userClaimFromCustomToken, orderId);
            if (!isAuthorized) throw new HttpResponseException(this.Request.CreateErrorResponse(HttpStatusCode.Forbidden, "You are not permitted to access this resource."));

            var customOrderClient = _orderWebApiClient.CloneWithApiContext(ctx => ctx.UserClaims = userClaimFromCustomToken);

            bool isExpired = userClaimFromCustomToken.Expiration < DateTime.UtcNow;
            if (isExpired) throw TokenExpiredException();

            return _orderWebApiClient.GetOrder(orderId).ContinueWith(t => t.Result.ReadAsAsync()).Unwrap();
        }
    }
}