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
using Mozu.Core.Exceptions;
using static Mozu.CommerceRuntime.Contracts.Quotes.Quote;

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

        [HttpGet]
        [Route("selleraccount/quote/{quoteId}/edit")]
        public async Task<IActionResult> EditQuote(string quoteId)
        {
            var pc = this.PageContext;
            var quote = (await _quoteWebApiClient.GetQuote(quoteId)).ReadAsSync();
            if(quote.HasDraft)
                quote = (await _quoteWebApiClient.GetQuote(quoteId,true)).ReadAsSync();

            if (quote.Status.In(QuoteStatusConst.COMPLETED, QuoteStatusConst.READYFORCHECKOUT))
            {
                throw new VaeUnAuthorizedException($"Can't edit the {quote.Status} quote.");
            }

            await SetCountryAndStates();

            pc.CmsContext = new CmsPageContext()
            {
                Template = new DocumentRequest()
                {
                    Path = "edit-quote",
                    DocumentTypeFQN = "pageTemplateContent@mozu"
                }
            };

            // Set the user scope type header so API calls from the SDK through
            // Reverse Proxy use the admin claims instead of the user claims
            PageContext.UserScopeType = UserScopeType.Tenant;

            return View("edit-quote", quote);
        }

        [NonAction]
        private void CreateUserFromAdminUserClaim(LightweightUserClaims userClaims)
        {
            PageContext.User.FirstName = userClaims?.UserFirstName;
            PageContext.User.LastName = userClaims?.UserLastName;
        }

        private async Task SetCountryAndStates()
        {
            var shipTask = await GetShippableCountries();
            var billTask = await GetBillingCountries();

            var shipStateTask = await GetUSShippingStates();
            var billStateTask = await GetUSBillingStates();

            PageContext.ShippingCountries = shipTask;
            PageContext.BillingCountries = billTask;

            PageContext.BillingStates = billStateTask;
            PageContext.ShippingStates = shipStateTask;
        }
    }
}