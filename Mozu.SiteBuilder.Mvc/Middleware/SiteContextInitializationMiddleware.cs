using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Mozu.SiteBuilder.Mvc.Contexts;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class SiteContextInitializationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly ISiteContext _siteContext;

        public SiteContextInitializationMiddleware(RequestDelegate next, ISiteBuilderApiContext apiContext, ISiteContext siteContext)
        {
            _next = next;
            _apiContext = apiContext;
            _siteContext = siteContext;
        }

        public async Task Invoke(HttpContext context)
        {
            if (_apiContext.SiteId.HasValue == false)
            {
                await _next.Invoke(context);
                return;
            }

            await _siteContext.Init();

            await _next.Invoke(context);
        }
    }
}
