using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class NoWarmAuthActionFilter : ActionFilterAttribute
    {
        private readonly ISiteBuilderApiContext _sbContext;

        public NoWarmAuthActionFilter(ISiteBuilderApiContext sbContext)
        {
            _sbContext = sbContext;
        }

        public bool AllowMultiple => false;

        public string ReturnUrl
        {
            get; set;
        }
        public override void OnActionExecuting(ActionExecutingContext actionContext)
        {
            if (_sbContext.UserClaims.IsAnonymous || _sbContext.UserClaims.IsAuthenticationHot) return;
            var returnUrl = ReturnUrl ?? System.Web.HttpUtility.UrlEncode(actionContext.HttpContext.Request.Path) + actionContext.HttpContext.Request.QueryString.Value;
            actionContext.Result = new RedirectResult(new Uri("/user/login?returnUrl=" + returnUrl, UriKind.Relative).ToString());
        }
    }
}