using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Mozu.Core.Configuration;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.OAF;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class FourHundredMiddleware
    {
        private const string BYPASS_ERROR_HANDLER_KEY = "BypassFourHundredMessageHandler";
        private readonly RequestDelegate _next;
        private readonly ISettings _settings;

        public FourHundredMiddleware(RequestDelegate next, ISettings settings)
        {
            _next = next;
            _settings = settings;
        }

        public static void BypassErrorHandler(HttpContext context)
        {
            context.Items[BYPASS_ERROR_HANDLER_KEY] = true;
        }

        static bool ShouldBypass(HttpContext context)
        {
            return context.Items.ContainsKey(BYPASS_ERROR_HANDLER_KEY);
        }

        public async Task Invoke(HttpContext context)
        {
            await _next.Invoke(context);

            if (!ShouldBypass(context) && context.Response.StatusCode >= 400 && context.Response.StatusCode < 500 && context.Request.GetTypedHeaders().Accept.Any(x => string.Equals(x.MediaType.Value, "text/html", StringComparison.OrdinalIgnoreCase)))
            {
                var iSiteBuilderApiContext = context.RequestServices.Resolve<ISiteBuilderApiContext>();
                if (!iSiteBuilderApiContext.SiteId.HasValue)
                {
                    context.Response.StatusCode = (int)HttpStatusCode.Moved;
                    context.Response.GetTypedHeaders().Location = new Uri("/admin/auth/launchpad", UriKind.Relative);
                }
                else
                {
                    //todo:cole add support for server side JS
                    //await Process400(context).ConfigureAwait(false);
                    //var runner = context.RequestServices.Resolve<IArcJSHttpHandlerRunner>();
                    //await runner.SendAsync(context.Request, response, "http.storefront.pages.404.request.after", cancellationToken).ConfigureAwait(false);
                }
            }
        }

        //private static async Task Process400(HttpContext context)
        //{
        //    var pageContext = request.Resolve<PageContext>();
        //    var siteContext = request.Resolve<SiteContext>();
        //    var sbApiContext = request.Resolve<ISiteBuilderApiContext>();
        //    var cmsHelper = request.Resolve<CmsHelper>();
        //    pageContext.CmsContext = new CmsPageContext()
        //    {
        //        Initialized = false,
        //        Template = new DocumentRequest()
        //        {
        //            ListFQN = "pageTemplateContent@mozu",
        //            Path = "404"
        //        }
        //    };
        //    await cmsHelper.InitCmsPageContext(pageContext, siteContext, sbApiContext).ConfigureAwait(false);
        //    var viewResult = new ViewResult()
        //    {
        //        Model = null,
        //        ViewName = "404",
        //        ViewData = new ViewDataDictionary()
        //    };



        //    return request.CreateResponse(message.StatusCode, viewResult);
        //}
    }
}
