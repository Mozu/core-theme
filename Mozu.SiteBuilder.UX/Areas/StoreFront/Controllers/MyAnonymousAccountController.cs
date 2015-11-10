using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.Http;
using MongoDB.Bson;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.CommerceRuntime.Contracts.Returns;
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
using Newtonsoft.Json.Linq;
using PasswordInfo = Mozu.SiteBuilder.UX.Models.Customers.PasswordInfo;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Filters;
using Mozu.Core.Actions;
using Mozu.SiteBuilder.Mvc.OAF;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [HotOnlyAuthActionFilter]
    [SslOnlyActionFilter]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
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
            if (orderId == null || !(orderId.Length > 0))
            {
                return Request.CreateErrorResponse(HttpStatusCode.NotFound, "Page not found.");
            }

            var order = (await _orderWebApiClient.GetOrder(orderId));
            // because we're an auth'd anonymous user the only returns returned are those which are associated
            // with the bag's orderid
            var returns = (await _returnApiClient.GetReturns());
            var reasons = (await _returnApiClient.GetReasons());

            PageContext.ReasonCollection = reasons.ReadAsSync().ToJObject();

            var pc = PageContext;
            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "my-anonymous-account",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }

            };
            pc.PageType = "my_anonymous_account";

            var orderResult = order.ReadAsSync();
            var returnResult = returns.ReadAsSync();

            // TODO: remove this when we get away from needing to re-use myaccount templates which expect pagedcollection
            var pagedOrderCollection = new Mozu.CommerceRuntime.Contracts.Orders.OrderCollection
            {
                Items = new List<Order> {orderResult},
                PageCount = 1,
                PageSize = 1,
                StartIndex = 0,
                TotalCount = 1
            };

            var retObject = (new Customer.Contracts.CustomerAccount()).ToJObject();
            retObject.Add("orderHistory", pagedOrderCollection.ToJObject());
            retObject.Add("returnHistory", returnResult.ToJObject());


            return Request.CreateResponse(HttpStatusCode.OK, View("my-anonymous-account", retObject));
        }
    }
}