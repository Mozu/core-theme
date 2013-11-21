using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System.Web.Http.Filters;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class RefreshStoreFrontUserAuthTicketFilter : ActionFilterAttribute
    {
        private StoreFrontAuthorizeAttribute _storeFrontAuthorizeAttribute = new StoreFrontAuthorizeAttribute();

        public override bool AllowMultiple { get { return false; } }

        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            _storeFrontAuthorizeAttribute.RefreshUserAuthTicket(actionContext);


        }
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
