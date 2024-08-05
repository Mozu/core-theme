using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.AspNetCore.Mvc.ViewFeatures;
using Microsoft.CodeAnalysis.CSharp.Syntax;
using Mozu.Core.Configuration;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
//using Remotion.Linq.Parsing.Structure.IntermediateModel;
using ViewResult = Mozu.SiteBuilder.Mvc.ActionResults.ViewResult;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
 
    public class FourHundredHandlerFilterAttribute : System.Attribute , IAsyncActionFilter , IOrderedFilter
    {
        private const string BYPASS_ERROR_HANDLER_KEY = "BypassFourHundredMessageHandler";
        private readonly RequestDelegate _next;
        private readonly ISettings _settings;

      
        public static void BypassErrorHandler(HttpContext context)
        {
            context.Items[BYPASS_ERROR_HANDLER_KEY] = true;
        }

        static bool ShouldBypass(HttpContext context)
        {
            return context.Items.ContainsKey(BYPASS_ERROR_HANDLER_KEY);
        }
        
        public async Task OnActionExecutionAsync(ActionExecutingContext acontext, ActionExecutionDelegate next)
        {
            var result =await next();
            var statCodeRes = result.Result as IStatusCodeActionResult;
            var context = acontext.HttpContext;
            var statusCode = (statCodeRes?.StatusCode).GetValueOrDefault(context.Response.StatusCode);
            if (!ShouldBypass(context) && statusCode >= 400 && statusCode < 500 && context.Request.GetTypedHeaders().Accept.Any(x => string.Equals(x.MediaType.Value, "text/html", StringComparison.OrdinalIgnoreCase)))
            {
                context.Response.StatusCode = statusCode;
                var iSiteBuilderApiContext = context.RequestServices.Resolve<ISiteBuilderApiContext>();
                if (!iSiteBuilderApiContext.SiteId.HasValue)
                {
                    context.Response.StatusCode = (int)HttpStatusCode.Moved;
                    context.Response.GetTypedHeaders().Location = new Uri("/admin/auth/launchpad", UriKind.Relative);
                }
                else
                {
                    //todo:cole add support for server side JS
                    await Process400(acontext).ConfigureAwait(false);
                    result.Result = acontext.Result;
                    //var runner = context.RequestServices.Resolve<IArcJSHttpHandlerRunner>();
                    //await runner.SendAsync(context.Request, response, "http.storefront.pages.404.request.after", cancellationToken).ConfigureAwait(false);
                }
            }
        }

        private static async Task Process400(ActionExecutingContext acontext)
        {
            var context = acontext.HttpContext;
            var pageContext = context.RequestServices.Resolve<IPageContext>();
            var siteContext =context.RequestServices.Resolve<ISiteContext>();
            var sbApiContext = context.RequestServices.Resolve<ISiteBuilderApiContext>();
            var cmsHelper = context.RequestServices.Resolve<CmsHelper>();
            pageContext.CmsContext = new CmsPageContext()
            {
                Initialized = false,
                Template = new DocumentRequest()
                {
                    ListFQN = "pageTemplateContent@mozu",
                    Path = "404"
                }
            };
            await cmsHelper.InitCmsPageContext(pageContext, siteContext, sbApiContext).ConfigureAwait(false);
            var viewResult = new ViewResult()
            {
                ViewName = "404",
                ViewData =  new ViewDataDictionary(new EmptyModelMetadataProvider(), new ModelStateDictionary())
            };
            
            acontext.Result = viewResult;
        }

        public int Order { get; } = 99;
    }
}
