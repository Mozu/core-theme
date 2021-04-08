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
using Mozu.Core.Api.Contracts.Client;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using APIConstants = Mozu.Core.Api.Contracts.Constants;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class RefreshStoreFrontUserAuthTicketFilter : Attribute, IAsyncAuthorizationFilter
    {
        const int TOKEN_EXPIRATION_TIME_IN_MINS = 10;
        public async Task OnAuthorizationAsync(AuthorizationFilterContext context)
        {
            var sbc = context.HttpContext.RequestServices.GetService<ISiteBuilderApiContext>();
            var authHelper = context.HttpContext.RequestServices.GetService<IAuthenticationHelper>();

            await RefreshAdminUserToken(context, sbc, authHelper);
            await RefreshStorefrontUserToken(context, sbc, authHelper);
            return;
        }

        public async Task RefreshAdminUserToken(AuthorizationFilterContext context, ISiteBuilderApiContext sbc, IAuthenticationHelper authHelper)
        {
            var adminClient = context.HttpContext.RequestServices.GetService<IPublicAdminAuthTicketWebApiClient>();
            context.HttpContext.Request.Headers.TryGetValue(APIConstants.Headers.USER_SCOPE_TYPE, out var headerValue);

            if (string.IsNullOrWhiteSpace(headerValue))
                return;

            var adminRefreshToken = authHelper.GetAdminRefreshToken();
            if (adminRefreshToken == null)
            {
                return;
            }

            if (sbc.AdminUserClaim == null ||  sbc.AdminUserClaim.Expiration < DateTime.UtcNow.AddMinutes(TOKEN_EXPIRATION_TIME_IN_MINS))
            {
                ServiceClientResponse<TenantAdminUserAuthTicket> res = await adminClient.RefreshAuthTicket(
                    existingAuthTicket: new TenantAdminUserAuthTicket
                    {
                        RefreshToken = adminRefreshToken
                    },
                    tenantId: sbc.TenantId);

                if (res.ResponseMessage.IsSuccessStatusCode)
                {
                    TenantAdminUserAuthTicket ticket = res.ReadAsSync();

                    authHelper.SaveAdminAccessToken(ticket.AccessToken, false);

                    sbc.SetUserClaim(LightweightUserClaims.Parse(ticket.AccessToken));
                }
            }
        }

        public async Task RefreshStorefrontUserToken(AuthorizationFilterContext context, ISiteBuilderApiContext sbc, IAuthenticationHelper authHelper)
        {
            if (sbc.UserClaims == null || DateTime.UtcNow.AddMinutes(TOKEN_EXPIRATION_TIME_IN_MINS) < sbc.UserClaims.Expiration)
            {
                return;
            }

            if (sbc.UserClaims.IsAnonymous)
            {
                sbc.UserClaims.Expiration = DateTime.Now.AddMonths(1);
                var token = sbc.UserClaims.ToAccessToken();
                var pToken = authHelper.GetProfileToken();
                authHelper.SaveStoreFrontAccessToken(token, pToken);
                return;
            }

            if (sbc.UserClaims == null || sbc.UserClaims.IsAnonymous || DateTime.UtcNow.AddMinutes(TOKEN_EXPIRATION_TIME_IN_MINS) < sbc.UserClaims.Expiration)
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
        }
    }
}
