using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Security;
using System;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class HotOnlyAuthActionFilter : ActionFilterAttribute
    {
        private readonly ISiteBuilderApiContext _sbContext;
        private readonly IAuthenticationHelper _authHelper;
        private readonly IAuthTicketWebApiClient _authService;

        public HotOnlyAuthActionFilter(ISiteBuilderApiContext sbContext, IAuthenticationHelper authHelper,
            IAuthTicketWebApiClient authService)
        {
            _sbContext = sbContext;
            _authHelper = authHelper;
            _authService = authService;
        }

        public bool AllowMultiple => false;

        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            var userClaims = _sbContext.UserClaims;
            if(userClaims.IsAnonymous || !userClaims.IsAuthenticationHot)
            {
                // check for case when we are order auth'd
                if(userClaims.Bag.ContainsKey("orderId"))
                    return;

                var rToken = _authHelper.GetStoreFrontRefreshToken();
                if (rToken != null)
                {
                    var authTicketTask = _authService.RefreshUserAuthTicket(rToken).ConfigureAwait(false);
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
                        _authHelper.SaveStoreFrontAccessToken(ticket.AccessToken, profile.ToToken());
                        _authHelper.SaveStoreFrontRefreshToken(ticket.RefreshToken, ticket.RefreshTokenExpiration);
                        var user = LightweightUserClaims.Parse(ticket.AccessToken);

                        _sbContext.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));
                        return;
                    }
                }

                actionContext.Result = new RedirectResult(new Uri("/user/login?returnUrl=" + System.Web.HttpUtility.UrlEncode(actionContext.HttpContext.Request.Path) + actionContext.HttpContext.Request.QueryString.Value, UriKind.Relative).ToString());
            }
        }
    }
}