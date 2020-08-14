// using System;
// using System.Collections.Generic;
// using System.Net;
// using System.Net.Http;
// using System.Text;
// using System.Threading.Tasks;
// using Microsoft.AspNetCore.Http;
// using Microsoft.AspNetCore.Http.Extensions;
// using Mozu.Core.Caching;
// using Mozu.Core.Configuration;
// using Mozu.Core.Logging;
// using Mozu.SiteBuilder.Mvc.Context;
// using Mozu.SiteBuilder.Mvc.Extensions;
//
// namespace Mozu.SiteBuilder.Mvc.Middleware
// {
//     public class RedisHealthCheckMiddleware
//     {
//         private readonly RequestDelegate _next;
//
//         public RedisHealthCheckMiddleware(RequestDelegate next)
//         {
//             _next = next;
//         }
//
//         public async Task Invoke(HttpContext context)
//         {
//             var requestUri = context.GetRequestUri();
//             if (string.Equals(requestUri.LocalPath, "/mozdef/ping", StringComparison.OrdinalIgnoreCase) &&
//                 Core.Settings.MozuConfigurationManager.Settings.AppSettings("redis_health_check") == "true")
//             {
//                 try
//                 {
//                     var cacheProvider = context.RequestServices.Resolve<ICacheProvider>();
//                     var cache = cacheProvider.GetCache(SitebuilderContextCacheRepository.CacheName, new Core.ApiContext() { TenantId = 1 });
//                     var key = $"HealthCheck-{Environment.MachineName}";
//                     var data = DateTime.Now + "-" + new Random().NextDouble();
//                     await cache.PutAsync(
//                             data,
//                             key,
//                             new List<string>() { "a" },
//                             new CachePolicy() { AbsoluteExpiration = new DateTimeOffset(DateTime.Now.AddMinutes(15)) })
//                         .ConfigureAwait(false);
//                     var gotit = (await cache.GetAsync<string>(key).ConfigureAwait(false))?.Item;
//                     if (data == gotit)
//                     {
//                         context.Response.StatusCode = (int) HttpStatusCode.OK;
//                         await context.Response.WriteAsync("ok");
//                         return;
//                     }
//
//                     context.Response.StatusCode = (int) HttpStatusCode.NotFound;
//                     await context.Response.WriteAsync($"got weird response {data}!={gotit}");
//                     return;
//                 }
//                 catch (Exception ex)
//                 {
//                     LoggingService.LoggerFor<RedisHealthCheckMiddleware>().Error(ex);
//                     context.Response.StatusCode = (int) HttpStatusCode.InternalServerError;
//                     await context.Response.WriteAsync(ex.ToString());
//                     return;
//                 }
//             }
//
//             await _next.Invoke(context);
//         }
//     }
// }
