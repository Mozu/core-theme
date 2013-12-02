using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.User.Contracts.Clients;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class RefreshStoreFrontUserAuthTicketFilter : FilterAttribute, IActionFilter
    {
        private StoreFrontAuthorizeAttribute _storeFrontAuthorizeAttribute = new StoreFrontAuthorizeAttribute();

        public override bool AllowMultiple { get { return false; } }



        Task<HttpResponseMessage> IActionFilter.ExecuteActionFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
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
                        EmailAddress = ticket.User.EmailAddress,
                        FirstName = ticket.User.FirstName,
                        LastName = ticket.User.LastName,
                        UserId = ticket.User.UserId
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

        //public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        //{
            
           



        //    var authHelper = actionContext.Request.Resolve<IAuthenticationHelper>();
        //    var rToken = authHelper.GetStoreFrontRefreshToken();
        //    if (rToken == null)
        //    {
        //        return ;
        //    }

        //    var authService = actionContext.Request.Resolve<IAuthTicketWebApiClient>();
        //    var authTicketResult = authService.RefreshUserAuthTicket(rToken).Result;

        //    if (!authTicketResult.ResponseMessage.IsSuccessStatusCode)
        //    {
        //        return false;
        //    }


        //    var ticket = authTicketResult.ReadAsSync();
        //    // authHelper.SaveAuthTicket(ticket);
        //    Mozu.Core.UserProfile profile = new UserProfile()
        //    {
        //        EmailAddress = ticket.User.EmailAddress,
        //        FirstName = ticket.User.FirstName,
        //        LastName = ticket.User.LastName,
        //        UserId = ticket.User.UserId
        //    };
        //    authHelper.SaveStoreFrontAccessToken(ticket.AccessToken, profile.ToToken());
        //    authHelper.SaveStoreFrontRefreshToken(ticket.RefreshToken, ticket.RefreshTokenExpiration);
        //    sbc.SetUser(LightweightUserClaims.Parse(ticket.AccessToken));
        //    return true;

        //}

        //System.Threading.Tasks.Task<HttpResponseMessage> IActionFilter.ExecuteActionFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<System.Threading.Tasks.Task<HttpResponseMessage>> continuation)
        //{
        //    throw new NotImplementedException();
        //}
    }

    public class HotOnlyAuthActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var sbContext = actionContext.Request.Resolve<ISiteBuilderApiContext>();
            if (sbContext.UserClaims.IsAnonymous || !sbContext.UserClaims.IsAuthenticationHot)
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Redirect);
                actionContext.Response.Headers.Location = new Uri("/user/login?returnUrl=" + System.Web.HttpUtility.UrlEncode(actionContext.Request.RequestUri.PathAndQuery), UriKind.Relative);

            }
        }
    }

    public class NoWarmAuthActionFilter : ActionFilterAttribute
    {

        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var sbContext = actionContext.Request.Resolve<ISiteBuilderApiContext>();
            if (!sbContext.UserClaims.IsAnonymous && !sbContext.UserClaims.IsAuthenticationHot)
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Redirect);
                actionContext.Response.Headers.Location = new Uri("/user/login?returnUrl=" + System.Web.HttpUtility.UrlEncode(actionContext.Request.RequestUri.PathAndQuery), UriKind.Relative);

            }

        }
    }

}
