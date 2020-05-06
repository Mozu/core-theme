using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Web;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Filters;
using Mozu.Core.Api.Filters;
using Mozu.Core.Extensions;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class AddUnifiedCookieFilter : Attribute, IAsyncActionFilter
    {
        //public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        //{
        //    string isUnifiedCookieValue = actionExecutedContext.Request.RequestUri.ParseQueryString()["isUnified"] ?? "";
        //    if (!isUnifiedCookieValue.IsNullOrEmpty())
        //    {

        //        HttpResponseMessage resp = actionExecutedContext.Response;
        //        resp?.Headers.AddCookies(new CookieHeaderValue[] { new CookieHeaderValue("isUnified", isUnifiedCookieValue) });
        //    }
        //}

        Task IAsyncActionFilter.OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
        {
            string isUnifiedInUrl = context.HttpContext.Request.Query["isUnified"].ToString();
            if ( !string.IsNullOrEmpty(isUnifiedInUrl))
            {
                var option = new CookieOptions();
                context.HttpContext.Response.Cookies.Append("isUnified", "true", option);
            }
            return next();
        }
    }
}