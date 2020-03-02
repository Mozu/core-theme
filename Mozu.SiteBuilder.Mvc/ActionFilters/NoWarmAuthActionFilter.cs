using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using Microsoft.Extensions.DependencyInjection;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class NoWarmAuthActionFilter : ActionFilterAttribute
    {
        public string ReturnUrl
        {
            get; set;
        }
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            var sbContext = actionContext.HttpContext.RequestServices.GetService<ISiteBuilderApiContext>();
            if (sbContext.UserClaims.IsAnonymous || sbContext.UserClaims.IsAuthenticationHot) return;
            var returnUrl = ReturnUrl ?? System.Web.HttpUtility.UrlEncode(actionContext.HttpContext.Request.Path) + actionContext.HttpContext.Request.QueryString.Value;
            actionContext.Result = new RedirectResult(new Uri("/user/login?returnUrl=" + returnUrl, UriKind.Relative).ToString());
        }
    }
}