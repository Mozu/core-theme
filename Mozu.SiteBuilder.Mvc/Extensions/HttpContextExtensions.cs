using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;

namespace Mozu.SiteBuilder.Mvc.Extensions
{
    public static class HttpContextExtensions
    {
        public static Uri GetRequestUri(this HttpContext context)
        {
            var url = context.Request.GetDisplayUrl();
            return new Uri(url);
        }
    }
}
