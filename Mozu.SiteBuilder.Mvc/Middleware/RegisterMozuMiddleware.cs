using System;
using System.Collections.Generic;
using System.Text;
using Microsoft.AspNetCore.Builder;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public static class RegisterMozuMiddleware
    {
        public static IApplicationBuilder ReigsterMozuMiddleware(this IApplicationBuilder builder)
        {
            return builder
                .UseMiddleware<RedisHealthCheckMiddleware>()
                .UseMiddleware<SessionMiddleware>()
                .UseMiddleware<MzUnderscoreRequestCleanerMiddleware>()
                .UseMiddleware<SiteContextInitializationMiddleware>()
                .UseMiddleware<FourHundredMiddleware>()
                .UseMiddleware<DeepPagingLimitingMiddleware>()
                .UseMiddleware<ResponseHeaderAppenderMiddleware>()
                .UseMiddleware<PageContextCookieMiddleware>();
        }
    }
}
