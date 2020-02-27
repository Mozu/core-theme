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
        private readonly SiteContext _siteContext;

        public RequiresSiteContextRedirectFilterAttribute(IApiContext apiContext, ILogger logger, SiteContext siteContext)
        {
            _apiContext = apiContext;
            _logger = logger;
            _siteContext = siteContext;
        }

        public bool AllowMultiple => false;

        public void OnAuthorization(AuthorizationFilterContext context)
        {
            var requestUri = new Uri(context.HttpContext.Request.GetDisplayUrl());
            if (!_apiContext.SiteId.HasValue)
            {
                var redirLoc = "/admin/auth/launchpad";

                if (string.Equals(requestUri.AbsolutePath, "/favicon.ico", StringComparison.OrdinalIgnoreCase))
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
                //return continuation().ContinueWith(x =>
                //{
                    if (!_siteContext.SiteExists)
                    {
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
                        //HttpResponseMessage redir = actionContext.Request.CreateResponse(HttpStatusCode.Moved);
                        //redir.Headers.Location = new Uri(redirLoc, UriKind.Relative);
                        context.Result = new RedirectResult(redirLoc);
                    }
                //});
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
