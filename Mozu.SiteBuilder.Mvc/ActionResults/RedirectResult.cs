using System;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Mozu.SiteBuilder.Mvc.ViewEngine;

namespace Mozu.SiteBuilder.Mvc.ActionResults
{
    //DEPRECATED
    public class RedirectResult : IActionResult
    {
        public RedirectResult(string url)
            : this(url, false)
        {
        }

        public RedirectResult(string url, bool permanent, TimeSpan? cacheDuration = null )
        {
            Permanent = permanent;
            Url = url;
            CacheDuration = cacheDuration;
        }

        // Properties
        public bool Permanent { get; private set; }

        public string Url { get; private set; }

        public TimeSpan? CacheDuration { get; private set; }

        public Task ExecuteResultAsync(ActionContext context)
        {
            var repsonse = context.HttpContext.Response;
            if (CacheDuration.HasValue)
            {
                repsonse.Headers["cache-control"] = "public,max-age=" + CacheDuration.Value.TotalSeconds;
            }
            repsonse.Redirect(Url, Permanent);
            return Task.CompletedTask;
        }
    }
}