using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using Microsoft.Extensions.DependencyInjection;
using Mozu.SiteBuilder.Mvc.Contexts;

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
            var siteContext = actionContext.HttpContext.RequestServices.GetService<SiteContext>();
            var sbContext = actionContext.HttpContext.RequestServices.GetService<ISiteBuilderApiContext>();
            if (sbContext.UserClaims.IsAnonymous || sbContext.UserClaims.IsAuthenticationHot) return;
            var returnUrl = string.IsNullOrEmpty(ReturnUrl)
                ? System.Web.HttpUtility.UrlEncode(actionContext.HttpContext.Request.Path) +
                  actionContext.HttpContext.Request.QueryString.Value
                : siteContext.SiteSubdirectory + ReturnUrl;
            actionContext.Result = new RedirectResult(new Uri( siteContext.SiteSubdirectory + "/user/login?returnUrl=" + returnUrl, UriKind.Relative).ToString());
        }
    }
}