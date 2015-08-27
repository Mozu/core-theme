using System;
using System.Net;
using System.Net.Http;
using System.Web.Http.Filters;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class NoWarmAuthActionFilter : ActionFilterAttribute
    {
        public override bool AllowMultiple
        {
            get { return false; }
        }


        public string ReturnUrl
        {
            get; set;
        }
        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {
            var sbContext = actionContext.Request.Resolve<ISiteBuilderApiContext>();
            if (!sbContext.UserClaims.IsAnonymous && !sbContext.UserClaims.IsAuthenticationHot)
            {
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.Redirect);
                var returnUrl = ReturnUrl ?? actionContext.Request.RequestUri.PathAndQuery;
                actionContext.Response.Headers.Location = new Uri("/user/login?returnUrl=" + System.Web.HttpUtility.UrlEncode(returnUrl), UriKind.Relative);

            }

        }
    }
}