using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Core.Configuration;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.Core.Logging;
using RedirectResult = Microsoft.AspNetCore.Mvc.RedirectResult;


namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class RequiresSiteContextRedirectFilterAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var apiContext = context.HttpContext.RequestServices.Resolve<IApiContext>();
            var requestUri = new Uri(context.HttpContext.Request.GetDisplayUrl());
            if (!apiContext.SiteId.HasValue)
            {
                var redirLoc = "/admin/auth/launchpad";

                if (string.Equals(requestUri.AbsolutePath, "/favicon.ico", StringComparison.OrdinalIgnoreCase))
                {
                    redirLoc = "/admin/Scripts/resources/favicon.ico";
                }
                else
                {
                    var logger = LoggingService.LoggerFor<RequiresSiteContextRedirectFilterAttribute>();
                    logger.Warn("missing sitecontext on " + context.HttpContext.Request.GetDisplayUrl());
                }

                context.Result = new RedirectResult(redirLoc);
            }
            else
            {
                var sc = context.HttpContext.RequestServices.Resolve<SiteContext>();
                if (sc.SiteExists) return;
                var redirLoc = "/admin/auth/launchpad";
                if (string.Equals(requestUri.AbsolutePath, "/favicon.ico", StringComparison.OrdinalIgnoreCase))
                {
                    redirLoc = "/admin/Scripts/resources/favicon.ico";
                }
                else
                {
                    var logger = LoggingService.LoggerFor<RequiresSiteContextRedirectFilterAttribute>();
                    logger.Warn("missing sitecontext on " + requestUri);
                }

                context.Result = new RedirectResult(redirLoc);
            }
        }
    }
  
}
