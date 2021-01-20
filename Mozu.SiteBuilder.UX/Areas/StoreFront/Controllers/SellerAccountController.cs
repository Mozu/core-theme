using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
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
using Mozu.SiteBuilder.Mvc.OAF;

using Kibo.Fulfillment.Contracts.Api;

using DCs = Mozu.CommerceRuntime.Contracts;
using Newtonsoft.Json.Linq;
using Mozu.Core.Extensions;
using RabbitMQ.Client.Impl;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [SslOnlyActionFilter]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class SellerAccountController : BaseApiController
    {
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly IQuoteWebApiClient _quoteWebApiClient;

        public SellerAccountController(ISiteBuilderApiContext apiContext, IQuoteWebApiClient quoteWebApiClient)
        {
            _apiContext = apiContext;
            _quoteWebApiClient = quoteWebApiClient.CloneWithoutUserClaims();
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var pagePath = "seller-account";

            if (!_apiContext.IsSalesRep())
            {
                var uri = new Uri(SiteContext.SiteSubdirectory + "/user/login", UriKind.Relative);
                return new RedirectResult(uri.ToString());
            }

            CreateUserFromAdminUserClaim(_apiContext.AdminUserClaim);

            var obj = new { };

            var quoteHistoryTask = _quoteWebApiClient.GetQuotes(0, 5, null);

            await Task.WhenAll(quoteHistoryTask); // multiple API call here

            var quoteHistory = quoteHistoryTask.Result.ReadAsSync();

            var jSellerAccount = obj.ToJObject();
            jSellerAccount.Add("quoteHistory", quoteHistory.ToJObject());

            // Set the user scope type header so API calls from the SDK through
            // Reverse Proxy use the admin claims instead of the user claims
            PageContext.UserScopeType = UserScopeType.Tenant;

            return View(pagePath, jSellerAccount);
        }

        [NonAction]
        private void CreateUserFromAdminUserClaim(LightweightUserClaims userClaims)
        {
            PageContext.User.FirstName = userClaims?.UserFirstName;
            PageContext.User.LastName = userClaims?.UserLastName;
        }
    }
}