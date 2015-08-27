using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using FiftyOne.Foundation.Mobile.Detection;
using Mozu.Core;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;



namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class RefreshStoreFrontUserAuthTicketFilter : FilterAttribute, IAuthorizationFilter
    {
        private StoreFrontAuthorizeAttribute _storeFrontAuthorizeAttribute = new StoreFrontAuthorizeAttribute();

        public override bool AllowMultiple { get { return false; } }



        public Task<HttpResponseMessage> ExecuteAuthorizationFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
        {
            var sbc = actionContext.Request.Resolve<ISiteBuilderApiContext>();

            if (sbc.UserClaims == null || sbc.UserClaims.IsAnonymous || DateTime.UtcNow.AddMinutes(10) < sbc.UserClaims.Expiration)
            {
                return continuation();
            }
            var authHelper = actionContext.Request.Resolve<IAuthenticationHelper>();
            var rToken = authHelper.GetStoreFrontRefreshToken();
            if (rToken == null)
            {
                return continuation();
            }
            var authService = actionContext.Request.Resolve<IAuthTicketWebApiClient>();
            var authTicketTask = authService.RefreshUserAuthTicket(rToken);
            var rettask = authTicketTask.ContinueWith(x =>
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
                return continuation();
            });
            return rettask.Unwrap();


        }



    }
}
