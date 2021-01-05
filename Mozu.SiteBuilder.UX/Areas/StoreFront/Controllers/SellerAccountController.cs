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

        public SellerAccountController(ISiteBuilderApiContext apiContext)
        {
            _apiContext = apiContext;
        }
        
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            var pagePath = "seller-account";

            if (_apiContext.IsSalesRep())
            {
                PageContext.User = CreateUserFromAdminUserClaim(_apiContext.AdminUserClaim);

                var obj = new { };// TODO: need to fill jobject with quote info

                var jSellerAccount = obj.ToJObject();

                return Ok(View(pagePath, jSellerAccount));
            }

            var uri = new Uri(SiteContext.SiteSubdirectory + "/user/login", UriKind.Relative);
            return new RedirectResult(uri.ToString());
        }

        [NonAction]
        private User CreateUserFromAdminUserClaim(LightweightUserClaims userClaims)
        {
            return new User
            {
                FirstName = userClaims.UserFirstName,
                LastName = userClaims.UserLastName,
                UserId = userClaims.UserId,
                IsAuthenticated = !userClaims.IsAnonymous && userClaims.IsAuthenticationHot,
                IsAnonymous = userClaims.IsAnonymous,
                Behaviors = userClaims.BehaviorIds.ToList(),

                //To indicate user is navigatd to seller account
                IsSalesRep = true
            };
        }
    }
}