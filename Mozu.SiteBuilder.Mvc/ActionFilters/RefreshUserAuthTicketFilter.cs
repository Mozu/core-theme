using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Filters;
//using FiftyOne.Foundation.Mobile.Detection;
using Mozu.Core;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Microsoft.Extensions.DependencyInjection;
using Mozu.Core.Configuration;
using Microsoft.Extensions.DependencyInjection.Extensions;



namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class RefreshStoreFrontUserAuthTicketFilter : Attribute, IAsyncAuthorizationFilter
    {
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var sbc = context.HttpContext.RequestServices.GetService<ISiteBuilderApiContext>();

            if (sbc.UserClaims == null || DateTime.UtcNow.AddMinutes(10) < sbc.UserClaims.Expiration)
            {
                return;
            }
            var authHelper = context.HttpContext.RequestServices.GetService<IAuthenticationHelper>();

            if (sbc.UserClaims.IsAnonymous)
            {
                sbc.UserClaims.Expiration = DateTime.Now.AddMonths(1);
                var token = sbc.UserClaims.ToAccessToken();
                var pToken = authHelper.GetProfileToken();
                authHelper.SaveStoreFrontAccessToken(token, pToken);
                return;
            }

            if (sbc.UserClaims == null || sbc.UserClaims.IsAnonymous || DateTime.UtcNow.AddMinutes(10) < sbc.UserClaims.Expiration)
            {
                return;
            }

            var rToken = authHelper.GetStoreFrontRefreshToken();
            if (rToken == null)
            {
                return;
            }
            var authService = context.HttpContext.RequestServices.GetService<IAuthTicketWebApiClient>();
            var authTicketTask = authService.RefreshUserAuthTicket(rToken);
            await authTicketTask.ContinueWith(x =>
            {
                var res = x.Result;
                if (res.ResponseMessage.IsSuccessStatusCode)
                {
                    var ticket = res.ReadAsSync();
                    var profile = new UserProfile()
                    {
                        EmailAddress = ticket.CustomerAccount.EmailAddress,
                        FirstName = ticket.CustomerAccount.FirstName,
                        LastName = ticket.CustomerAccount.LastName,
                        UserId = ticket.CustomerAccount.UserId
                    };
                    authHelper.SaveStoreFrontAccessToken(ticket.AccessToken, profile.ToToken());
                    authHelper.SaveStoreFrontRefreshToken(ticket.RefreshToken, ticket.RefreshTokenExpiration);
                    var user = LightweightUserClaims.Parse(ticket.AccessToken);

                    sbc.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));
                }
                else if (res.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                {
                    authHelper.SaveStoreFrontRefreshToken(null, DateTime.MaxValue);
                }
            });
            return;
        }
    }
}
