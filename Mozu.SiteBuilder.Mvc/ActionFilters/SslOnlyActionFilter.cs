using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web.Http.Filters;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class SslOnlyActionFilter : ActionFilterAttribute
    {
        public override void OnActionExecuting(System.Web.Http.Controllers.HttpActionContext actionContext)
        {


            var sslEnabled = actionContext.Request.Resolve<ISettings>().CoreSettings.IsSSLValidationEnabled;
           
            if (!sslEnabled)
            {
                return;
            }

            var pageContext = actionContext.Request.Resolve<PageContext>();
         




            if (!string.IsNullOrEmpty(pageContext.Url) && !pageContext.IsSecure )
            {
                var ubilBuilder = new UriBuilder(pageContext.Url);
                ubilBuilder.Scheme = "https";
                ubilBuilder.Port = 443;
                actionContext.Response = actionContext.Request.CreateResponse(HttpStatusCode.MovedPermanently);
                actionContext.Response.Headers.Location = ubilBuilder.Uri;

            }
        }
    }
}