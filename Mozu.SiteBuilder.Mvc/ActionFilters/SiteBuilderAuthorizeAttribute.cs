using System;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Mvc;
using Autofac;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.User.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Security;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class StoreFrontAuthorizeAttribute : AuthorizeAttribute

    {
        public void RefreshUserAuthTicket(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            IsAuthorized(actionContext);
        }
        protected override bool IsAuthorized(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var sbc = actionContext.Request.Resolve<ISiteBuilderApiContext>();
            if (sbc.UserClaims == null || sbc.UserClaims.IsAnonymous)
            {
                return false;
            }
            if (sbc.UserClaims.Expiration < DateTime.UtcNow)
            {
                return true;
            }
            var authHelper = actionContext.Request.Resolve<IAuthenticationHelper>();
            var rToken = authHelper.GetRefreshToken();
            if (rToken == null)
            {
                return false;
            }
            var authService = actionContext.Request.Resolve<IAuthTicketWebApiClient>();
            var authTicketResult = authService.RefreshUserAuthTicket(rToken).Result;
            if (!authTicketResult.ResponseMessage.IsSuccessStatusCode)
            {
                return false;
            }


            var ticket = authTicketResult.ReadAsSync();
            authHelper.SaveAuthTicket(ticket);
            authHelper.SaveAccessToken(ticket.AccessToken);
            sbc.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));
            return true;

        }

    }
}