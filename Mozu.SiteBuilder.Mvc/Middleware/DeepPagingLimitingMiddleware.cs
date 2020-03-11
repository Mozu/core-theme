using System;
using System.Collections.Generic;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Mozu.Core.Configuration;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class DeepPagingLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ISettings _settings;

        public DeepPagingLimitingMiddleware(RequestDelegate next, ISettings settings)
        {
            _next = next;
            _settings = settings;
        }

        public async Task Invoke(HttpContext context)
        {
            var startIndexLimit = GetStartIndexLimit(_settings);
            var pageSizeLimit = GetDeepPagingLimit(_settings);
            var sc = SearchContext.Get(context.Request);
            var cont = sc.StartIndex < startIndexLimit && sc.PageSize < pageSizeLimit;
            if (cont) await _next.Invoke(context);
            else 
            {
                if (sc.StartIndex > startIndexLimit)
                {
                    await Redirect(context, sc, new SearchContextOverrides() { StartIndex = 0 });
                }
                if (sc.PageSize > pageSizeLimit)
                {
                    await Redirect(context, sc, new SearchContextOverrides() { PageSize = 24 });
                }
            }
        }

        private static async Task Redirect(HttpContext context, SearchContext sc, SearchContextOverrides searchContextOverrides)
        {
            var uri = new Uri(sc.ToUrl(searchContextOverrides), UriKind.RelativeOrAbsolute);
            context.Response.StatusCode = (int) HttpStatusCode.MovedPermanently;
            await context.Response.WriteAsync("exceeded paging limit");
            context.Response.GetTypedHeaders().Location = uri;
        }

        public static int GetStartIndexLimit(ISettings settings)
        {
            return settings.AppSettingsAsNullableInt("deep_paging_startIndex_Limit").GetValueOrDefault(5000);
        }
        public static int GetPageLimit(ISettings settings)
        {
            return settings.AppSettingsAsNullableInt("deep_paging_page_Limit").GetValueOrDefault(10);
        }
        public static int GetDeepPagingLimit(ISettings settings)
        {
            return settings.AppSettingsAsNullableInt("deep_paging_pageSize_Limit").GetValueOrDefault(500);
        }
    }
}
