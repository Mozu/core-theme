using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.Mvc.OAF;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    public class DeepPagingLimitingRequestHandler : DelegatingHandler
    {
        protected override  Task<HttpResponseMessage> SendAsync(
           HttpRequestMessage request,
           CancellationToken cancellationToken)
        {
            var startIndexLimit = GetStartIndexLimit(request.Resolve<Mozu.Core.Settings.ISettings>());
            var pageSizeLimit = GetDeepPagingLimit(request.Resolve<Mozu.Core.Settings.ISettings>());
            var sc = SearchContext.Get(request);
            if ( sc.StartIndex > startIndexLimit)
            {
                return Task.FromResult(GetRirect(request, sc, new SearchContextOverrides() { StartIndex = 0 }));
            }

            if (sc.PageSize > pageSizeLimit)
            {
                return Task.FromResult(GetRirect(request, sc, new SearchContextOverrides() { PageSize = 24 }));
            }

            return base.SendAsync(request, cancellationToken);
        }

        private static HttpResponseMessage GetRirect (HttpRequestMessage request, SearchContext sc , SearchContextOverrides searchContextOverrides)
        { 
            var uri = new Uri(sc.ToUrl(searchContextOverrides), UriKind.RelativeOrAbsolute);
            var resp = request.CreateResponse(HttpStatusCode.MovedPermanently);
            resp.ReasonPhrase = "exceeded paging limit";
            resp.Headers.Location = uri;
            return resp;
        }
        public static int GetStartIndexLimit(Mozu.Core.Settings.ISettings settings)
        {
            return settings.AppSettingsAsNullableInt("deep_paging_startIndex_Limit").GetValueOrDefault(5000);
        }
        public static int GetPageLimit(Mozu.Core.Settings.ISettings settings)
        {
            return settings.AppSettingsAsNullableInt("deep_paging_page_Limit").GetValueOrDefault(10);
        }
        public static int GetDeepPagingLimit(Mozu.Core.Settings.ISettings settings)
        {
            return settings.AppSettingsAsNullableInt("deep_paging_pageSize_Limit").GetValueOrDefault(500);
        }
    }

  
    public class FourHundredMessageHandler : DelegatingHandler
    {
        const string BypassErrorHandlerKey = "BypassFourHundredMessageHandler";
        public static void BypassErrorHandler(HttpRequest message)
        {
            message.HttpContext.Items[BypassErrorHandlerKey] = true;
        }
        static bool ShouldBypass (HttpRequest message)
        {
            return message.HttpContext.Items.ContainsKey(BypassErrorHandlerKey);
        }
        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            var response = await base.SendAsync(request, cancellationToken).ConfigureAwait(false);
        
            if (!ShouldBypass(request.HttpContext().Request) && (int)response.StatusCode >= 400 && (int)response.StatusCode < 500 && request.Headers.Accept.Any(x => string.Equals(x.MediaType, "text/html", StringComparison.OrdinalIgnoreCase)))
            {
                var iSiteBuilderApiContext = request.Resolve<ISiteBuilderApiContext>();
                if (!iSiteBuilderApiContext.SiteId.HasValue)
                {
                    var redir = request.CreateResponse(HttpStatusCode.Moved);
                    redir.Headers.Location = new Uri("/admin/auth/launchpad", UriKind.Relative);
                    return redir;
                }

                response = await Process400(request, response).ConfigureAwait(false);
                var runner = request.Resolve<IArcJSHttpHandlerRunner>();
                return await runner.SendAsync(request, response, "http.storefront.pages.404.request.after", cancellationToken).ConfigureAwait(false);
            }
            return response;
        }

        private static async Task<HttpResponseMessage> Process400(HttpRequestMessage request, HttpResponseMessage message)
        {
            var pageContext = request.Resolve<PageContext>();
            var siteContext = request.Resolve<SiteContext>();
            var sbApiContext = request.Resolve<ISiteBuilderApiContext>();
            var cmsHelper = request.Resolve<CmsHelper>();
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
                Model = null,
                ViewName = "404",
                ViewData = new ViewDataDictionary()
            };

        

            return request.CreateResponse(message.StatusCode, viewResult);
        }
    }
}
