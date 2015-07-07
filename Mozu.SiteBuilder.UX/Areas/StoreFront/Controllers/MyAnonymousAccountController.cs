using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using MongoDB.Bson;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Customers;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Customers;

using PasswordInfo = Mozu.SiteBuilder.UX.Models.Customers.PasswordInfo;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Core.Actions;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [HotOnlyAuthActionFilter]
    [SslOnlyActionFilter]
    [DataViewModeEnforcement]
    [ActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController)]
    [ActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController)]
    public class MyAnonymousAccountController : BaseApiController
    {

        private readonly IOrderWebApiClient _orderWebApiClient;
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly IReturnWebApiClient _returnApiClient;

        public MyAnonymousAccountController(IOrderWebApiClient orderWebApiClient, IReturnWebApiClient returnApiClient, ISiteBuilderApiContext apiContext)
        {
            _orderWebApiClient = orderWebApiClient;
            _returnApiClient = returnApiClient;
            _apiContext = apiContext;
        }

        //todo:hyper  remiplement auth att.
        // [SiteBuilderAuthorize()]
        [HttpGet]
        public async Task<HttpResponseMessage> Index()
        {
            var userClaims = _apiContext.UserClaims;
            var orderId = userClaims.Bag["orderId"];

            // If there isn't an orderId, cancel!
            if (orderId == null || orderId.Length > 0)
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Page not found.");
            }

            var order = (await _orderWebApiClient.GetOrder(orderId));
            var returns = (await _returnApiClient.GetReturns(filter: String.Format("orderId eq {0}", orderId)));

            var pc = PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "my-anonymous-account",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }

            };
            pc.PageType = "order_status";

            var jsOrder = order.ToJObject();


            return Request.CreateResponse(HttpStatusCode.OK, View("my-anonymous-account", jsOrder));
        }
    }
}