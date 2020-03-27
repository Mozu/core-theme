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

        public SiteContextInitializationMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, ISiteBuilderApiContext apiContext, ISiteContext siteContext)
        {
            if (apiContext.SiteId.HasValue == false)
            {
                await _next.Invoke(context);
                return;
            }

            await siteContext.Init();

            await _next.Invoke(context);
        }
    }
}
