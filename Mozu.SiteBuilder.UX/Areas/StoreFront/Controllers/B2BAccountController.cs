using Microsoft.AspNetCore.Mvc;
using Mozu.Core.Actions;
using Mozu.Core.Api.Client;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.UX.Controllers;
using Mozu.SiteBuilder.UX.Filters;
using System;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.Controllers
{
    [ContextInitialization]
    [SslOnlyActionFilter]
    [DataViewModeEnforcement]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageBeforeAction, executionType: ActionExtensionExecutionTypes.BeforeController, Priority = ActionFilterConstants.GlobalPageBeforePriority)]
    [SbActionExtensionFilter(actionId: ActionFilterConstants.GlobalPageAfterAction, executionType: ActionExtensionExecutionTypes.AfterController, Priority = ActionFilterConstants.GlobalPageAfterPriority)]
    public class B2BAccountController : BaseApiController
    {
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly ICustomerAccountWebApiClient _customerAccountWebApiClient;

        public B2BAccountController(ISiteBuilderApiContext apiContext, ICustomerAccountWebApiClient customerAccountWebApiClient)
        {
            _apiContext = apiContext;
            _customerAccountWebApiClient = customerAccountWebApiClient.CloneWithoutUserClaims(); ;
        }

        [HttpGet]
        public async Task<IActionResult> GetB2BAccount(string accountId)
        {
            var pagePath = "view-b2baccount";
            if (_apiContext.UserClaims.IsAnonymous)
            {
                var uri = new Uri(SiteContext.SiteSubdirectory + "/user/login", UriKind.Relative);
                return new RedirectResult(uri.ToString());
            }
            int.TryParse(accountId, out int accId);
            var account = (await _customerAccountWebApiClient.GetAccount(accId)).ReadAsSync();

            var jsonObject = account.ToJObject();
            jsonObject.Add("viewB2BAccount", true);
            jsonObject.Add("accountToView", accId);

            if (PageContext.User.AccountId != accId)
            {
                var currentUserAccount = (await _customerAccountWebApiClient.GetAccount(PageContext.User.AccountId, null, PageContext.User.UserId)).ReadAsSync();

                if (currentUserAccount == null)
                {
                    return NotFound();
                }
                jsonObject.Add("currentUserAccountName", currentUserAccount.CompanyOrOrganization);
            }
            else
            {
                jsonObject.Add("currentUserAccountName", account.CompanyOrOrganization);
            }
            return View(pagePath, jsonObject);
        }
    }
}