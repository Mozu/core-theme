using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Web;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using dotless.Core.Abstractions;
using Mozu.Core.Api.Filters;
using Mozu.Core.Extensions;

namespace Mozu.SiteBuilder.UX.Filters
{
    public class AddUnifiedCookieFilter : ActionFilterAttribute
    {
        public override void OnActionExecuted(HttpActionExecutedContext actionExecutedContext)
        {
            string isUnifiedCookieValue = actionExecutedContext.Request.RequestUri.ParseQueryString()["isUnified"] ?? "";
            if (!isUnifiedCookieValue.IsNullOrEmpty())
            {

                HttpResponseMessage resp = actionExecutedContext.Response;
                resp?.Headers.AddCookies(new CookieHeaderValue[] { new CookieHeaderValue("isUnified", isUnifiedCookieValue) });
            }
        }
    }
}