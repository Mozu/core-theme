using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http.Extensions;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Logging;
using Mozu.Core;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.ActionResults;


namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class RequiresSiteContextRedirectFilterAttribute : IActionFilter, IAuthorizationFilter
    {
        private readonly IApiContext _apiContext;
        private readonly ILogger _logger;

        public RequiresSiteContextRedirectFilterAttribute(IApiContext apiContext, ILogger logger)
        {
            _apiContext = apiContext;
            _logger = logger;
        }

        public bool AllowMultiple => false;

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            if (!_apiContext.SiteId.HasValue)
            {
                var redirLoc = "/admin/auth/launchpad";

                if (string.Equals(new Uri(context.HttpContext.Request.GetDisplayUrl()).AbsolutePath, "/favicon.ico", StringComparison.OrdinalIgnoreCase))
                {
                    redirLoc = "/admin/Scripts/resources/favicon.ico";
                }
                else
                {
                    _logger.Warn("missing sitecontext on " + context.HttpContext.Request.GetDisplayUrl());
                }

                context.Result = new RedirectResult(redirLoc);
            }
            else
            {
                return continuation().ContinueWith(x =>
                {
                    var sc = actionContext.Request.Resolve<SiteContext>();
                    if (!sc.SiteExists)
                    {
                        var redirLoc = "/admin/auth/launchpad";
                        if (string.Equals(actionContext.Request.RequestUri.AbsolutePath, "/favicon.ico", StringComparison.OrdinalIgnoreCase))
                        {
                            redirLoc = "/admin/Scripts/resources/favicon.ico";
                        }
                        else
                        {
                            var logger = actionContext.Request.Resolve<ILoggingService>().LoggerFor<RequiresSiteContextRedirectFilterAttribute>();
                            logger.Warn("missing sitecontext on " + actionContext.Request.RequestUri.ToString());
                        }
                        HttpResponseMessage redir = actionContext.Request.CreateResponse(HttpStatusCode.Moved);
                        redir.Headers.Location = new Uri(redirLoc, UriKind.Relative);
                        return redir;
                    }
                    return x.Result;
                }
                );
            }
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            throw new NotImplementedException();
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            throw new NotImplementedException();
        }
    }
  
}
