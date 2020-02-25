using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Logging;
using Mozu.SiteBuilder.Mvc.ObjectPools;
using Mozu.SiteBuilder.Mvc.Tags;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace Mozu.SiteBuilder.Mvc.MessageHandler
{
    public class ResponseHeaderAppenderMessagHandler : DelegatingHandler
    {
        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return base.SendAsync(request, cancellationToken)
                .ContinueWith(task => AddAdditionalHeaders(request, task.Result));
        }
        
        public static HttpResponseMessage AddAdditionalHeaders (HttpRequestMessage request, HttpResponseMessage resp)
        {
            if(!request.HasAdditionalRespnoseHeaders())
            {
                return resp;
            }
            ILogger logger = null;
            var additionalHeaders = request.GetAdditionalRespnoseHeaders();
            foreach (var nvHeader in additionalHeaders.Where(nvHeader => !resp.Headers.TryAddWithoutValidation(nvHeader.Name, nvHeader.Value)))
            {
                if ( logger == null)
                {
                    var exceptionLogWrapper = request.Resolve<ExceptionContextLogWrapper>();
                    logger = exceptionLogWrapper.GetLogger();
                }
                logger.Warn($"unable to write header {nvHeader.Name} {nvHeader.Value}");
            }
            return resp;
        }
    }

    public class PageContextCookieHandler : DelegatingHandler
    {
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

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return base.SendAsync(request, cancellationToken)
                .ContinueWith(task => AddCookie(request, task.Result));
        }

        public static HttpResponseMessage AddCookie(HttpRequestMessage request, HttpResponseMessage resp)
        {
            var apiContext = request.Resolve<ISiteBuilderApiContext>();
            if (apiContext.SiteId == null)
            {
                return resp;
            }
            var pageContext = request.Resolve<IPageContext>();
            if ( pageContext == null)
            {
                return resp;
            }
            try
            {

                MemoryStream ms = new MemoryStream();
                using (var writer = new JsonTextWriter(new StreamWriter(ms)))
                {
                    lazySer.Value.Serialize(writer, pageContext);
                }

                resp.Headers.AddCookies(new CookieHeaderValue[] {
                    new CookieHeaderValue("_mzPc", Convert.ToBase64String(ms.ToArray())){ Path ="/"}
                });
            }
            catch (Exception ex)
            {
                LoggingService.LoggerFor<PageContextCookieHandler>().Warn(ex.Message);
            }
            if (!request.HasAdditionalRespnoseHeaders())
            {
                return resp;
            }
            ILogger logger = null;
            var additionalHeaders = request.GetAdditionalRespnoseHeaders();
            foreach (var nvHeader in additionalHeaders)
            {
                if (!resp.Headers.TryAddWithoutValidation(nvHeader.Name, nvHeader.Value))
                {
                    if (logger == null)
                    {
                        var exceptionLogWrapper = request.Resolve<ExceptionContextLogWrapper>();
                        logger = exceptionLogWrapper.GetLogger();
                    }
                    logger.Warn($"unable to write header {nvHeader.Name} {nvHeader.Value}");
                }
            }
            return resp;
        }
    }
}
public static class ResponseHeaderExtensions
{
    const  string GetRespnoseHeadersKey = "Mozu.SiteBuilder.Mvc.MessageHandler.GetRespnoseHeaders";
    public static List<NameValueHeaderValue> GetAdditionalRespnoseHeaders ( this HttpRequestMessage req )
    {
    
        object tmp;
        if (!req.Properties.TryGetValue(GetRespnoseHeadersKey, out tmp))
        {
            tmp = new List<NameValueHeaderValue>();
            req.Properties.Add(GetRespnoseHeadersKey, tmp);
        }
        return (List<NameValueHeaderValue>)tmp;
    }
    public static bool HasAdditionalRespnoseHeaders(this HttpRequestMessage req)
    {
        return req.Properties.ContainsKey(GetRespnoseHeadersKey);
    }
}