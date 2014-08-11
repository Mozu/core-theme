using System;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http.Controllers;
using System.Web.Http.Filters;
using FiftyOne.Foundation.Mobile.Detection;
using Mozu.Core;
using Mozu.Customer.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.Core.Logging;



namespace Mozu.SiteBuilder.Mvc.ActionFilters
{
    public class RequiresSiteContextRedirectFilterAttribute : FilterAttribute, IActionFilter
    {
   

        public override bool AllowMultiple { get { return false; } }

      


        Task<HttpResponseMessage> IActionFilter.ExecuteActionFilterAsync(HttpActionContext actionContext, CancellationToken cancellationToken, Func<Task<HttpResponseMessage>> continuation)
        {
            var apiContext = actionContext.Request.Resolve<IApiContext>();
            if (! apiContext.SiteId.HasValue)
            {

                var logger = actionContext.Request.Resolve<ILoggingService>().LoggerFor<RequiresSiteContextRedirectFilterAttribute>();
                logger.Warn("missing sitecontext on " + actionContext.Request.RequestUri.ToString());


                HttpResponseMessage redir = actionContext.Request.CreateResponse(HttpStatusCode.Redirect);
                redir.Headers.Location = new Uri("/admin/auth/launchpad", UriKind.Relative);
                return Task<HttpResponseMessage>.FromResult(redir);
            }
            else
            {
                return continuation().ContinueWith(x =>
                {
                    var sc = actionContext.Request.Resolve<SiteContext>();
                    if (!sc.SiteExists)
                    {
                        HttpResponseMessage redir = actionContext.Request.CreateResponse(HttpStatusCode.Redirect);
                        redir.Headers.Location = new Uri("/admin/auth/launchpad", UriKind.Relative);
                        return redir;
                    }
                    return x.Result;
                }
                );
            }

        }
       
    }
  
}
