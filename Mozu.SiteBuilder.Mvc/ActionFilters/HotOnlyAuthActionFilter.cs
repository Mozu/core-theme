using System;
using System.Net;
using System.Net.Http;
using System.Web.Http.Filters;
using Mozu.Core;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class HotOnlyAuthActionFilter : ActionFilterAttribute
    {

        public override bool AllowMultiple
        {
            get { return false; }
        }

        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var sbContext = actionContext.Request.Resolve<ISiteBuilderApiContext>();
            var userClaims = sbContext.UserClaims;
            if(userClaims.IsAnonymous || !userClaims.IsAuthenticationHot)
            {
                // check for case when we are order auth'd
                if(userClaims.Bag.ContainsKey("orderId"))
                    return;

                var authHelper = actionContext.Request.Resolve<IAuthenticationHelper>();
                var rToken = authHelper.GetStoreFrontRefreshToken();
                if (rToken != null)
                {
                    var authService = actionContext.Request.Resolve<IAuthTicketWebApiClient>();
                    var authTicketTask = authService.RefreshUserAuthTicket(rToken).ConfigureAwait(false);
                    var result = authTicketTask.GetAwaiter().GetResult();
                    if (!result.HasException && result.ResponseMessage.IsSuccessStatusCode)
                    {
                        var ticket = result.ReadAsSync();
                        var profile = new Mozu.Core.UserProfile()
                        {
                            EmailAddress = ticket.CustomerAccount.EmailAddress,
                            FirstName = ticket.CustomerAccount.FirstName,
                            LastName = ticket.CustomerAccount.LastName,
                            UserId = ticket.CustomerAccount.UserId
                        };
                        authHelper.SaveStoreFrontAccessToken(ticket.AccessToken, profile.ToToken());
                        authHelper.SaveStoreFrontRefreshToken(ticket.RefreshToken, ticket.RefreshTokenExpiration);
                        var user = LightweightUserClaims.Parse(ticket.AccessToken);

                        sbContext.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));
                        return;
                    }
                }



                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Redirect);
                actionContext.Response.Headers.Location = new Uri("/user/login?returnUrl=" + System.Web.HttpUtility.UrlEncode(actionContext.Request.RequestUri.PathAndQuery), UriKind.Relative);
            }
        }
    }
}