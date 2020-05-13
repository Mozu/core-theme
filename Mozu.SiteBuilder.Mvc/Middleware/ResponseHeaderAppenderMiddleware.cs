using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Mozu.Core.Configuration;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Logging;
using NameValueHeaderValue = Microsoft.Net.Http.Headers.NameValueHeaderValue;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class ResponseHeaderAppenderMiddleware
    {
        private readonly RequestDelegate _next;

        public ResponseHeaderAppenderMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public  Task Invoke(HttpContext context)
        {
            context.Response.OnStarting(() =>
            {
                
                if (context.HasAdditionalResponseHeaders())
                {
                    //ILogger logger = null;
                    var additionalHeaders = context.GetAdditionalResponseHeaders();
                    additionalHeaders.ForEach(nvHeader =>
                        context.Response.Headers.Add(nvHeader.Name.Value, nvHeader.Value.Value));
                 
                }
                return Task.CompletedTask;
                
            });
            return  _next.Invoke(context);

            
        }
    }

    public static class ResponseHeaderAppenderMiddlewareExtensions
    {
        private const string GET_RESPONSE_HEADERS_KEY = "Mozu.SiteBuilder.Mvc.MessageHandler.GetRespnoseHeaders";
        public static List<NameValueHeaderValue> GetAdditionalResponseHeaders(this HttpContext context)
        {
            if (context.Items.TryGetValue(GET_RESPONSE_HEADERS_KEY, out var tmp))
                return (List<NameValueHeaderValue>) tmp;

            tmp = new List<NameValueHeaderValue>();
            context.Items.Add(GET_RESPONSE_HEADERS_KEY, tmp);
            return (List<NameValueHeaderValue>)tmp;
        }
        public static bool HasAdditionalResponseHeaders(this HttpContext context)
        {
            return context.Items.ContainsKey(GET_RESPONSE_HEADERS_KEY);
        }
    }
}
