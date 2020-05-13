using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.Tags;
using Newtonsoft.Json;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class PageContextCookieMiddleware
    {
        private readonly RequestDelegate _next;

        private static readonly Lazy<JsonSerializer> lazySer =
            new Lazy<JsonSerializer>(
                () =>
                {
                    var settings = new CaseInsensitiveJsonSerializerSettings
                    {
                        ContractResolver = JsonPreloadeCookieContractResolver.CookieResolver,
                        StringEscapeHandling = StringEscapeHandling.EscapeHtml
                    };
                    return JsonSerializer.Create(settings);
                });

        public PageContextCookieMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public Task Invoke(HttpContext context)
        {
            context.Response.OnStarting(() =>
            {
                var apiContext = context.RequestServices.Resolve<ISiteBuilderApiContext>();
                if (apiContext.SiteId == null)
                {
                    return Task.CompletedTask;
                }

                var pageContext = context.RequestServices.Resolve<IPageContext>();
                if (pageContext == null)
                {
                    return Task.CompletedTask;
                }

                try
                {
                    var ms = new MemoryStream();
                    using (var writer = new JsonTextWriter(new StreamWriter(ms)))
                    {
                        lazySer.Value.Serialize(writer, pageContext);
                    }

                    context.Response.Cookies.Append("_mzPc", Convert.ToBase64String(ms.ToArray()));
                }
                catch (Exception ex)
                {
                    LoggingService.LoggerFor<PageContextCookieMiddleware>().Warn(ex.Message);
                }

                if (!context.HasAdditionalResponseHeaders())
                {
                    return Task.CompletedTask;
                }

                //ILogger logger = null;
                var additionalHeaders = context.GetAdditionalResponseHeaders();
                additionalHeaders.ForEach(nvHeader =>
                    context.Response.Headers.Add(nvHeader.Name.Value, nvHeader.Value.Value));

                return Task.CompletedTask;
            });
            return _next(context);
        }


    }
}