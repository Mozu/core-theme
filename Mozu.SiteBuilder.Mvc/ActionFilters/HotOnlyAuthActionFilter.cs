using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Security;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Mozu.CommerceRuntime.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class HotOnlyAuthActionFilter : ActionFilterAttribute
    {
        public override async Task OnActionExecutionAsync(ActionExecutingContext actionContext,
            ActionExecutionDelegate next)
        {
            await TryRefresh(actionContext);
            if (actionContext.Result == null)
            {
                await next();
            }
        }

        async Task TryRefresh(ActionExecutingContext actionContext)
        {
            var sbCtx = actionContext.HttpContext.RequestServices.GetService<ISiteBuilderApiContext>();
            var userClaims = sbCtx.UserClaims;
            
            if(userClaims.IsAnonymous || !userClaims.IsAuthenticationHot)
            {
                // check for case when we are order auth'd
                if (userClaims.Bag.ContainsKey("orderId"))
                {
                    return;
                }
                var authHelper = actionContext.HttpContext.RequestServices.GetService<IAuthenticationHelper>();
                var rToken = authHelper.GetStoreFrontRefreshToken();
                if (rToken != null)
                {
                    var authTicketTask = actionContext.HttpContext.RequestServices.GetService<IAuthTicketWebApiClient>().RefreshUserAuthTicket(rToken).ConfigureAwait(false);
                    var result = await authTicketTask;
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

                        sbCtx.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));
                        return;
                    }
                }
                actionContext.Result = new RedirectResult(new Uri("/user/login?returnUrl=" + System.Web.HttpUtility.UrlEncode(actionContext.HttpContext.Request.Path) + actionContext.HttpContext.Request.QueryString.Value, UriKind.Relative).ToString());
             
            }
        }
        

    }
}