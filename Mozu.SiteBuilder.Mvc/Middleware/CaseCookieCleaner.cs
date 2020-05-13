using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class CaseCookieCleaner
    {
        private readonly RequestDelegate _next;

        public CaseCookieCleaner(RequestDelegate next)
        {
            _next = next;
        }

        IEnumerable<string> CookiesToRemove(string allCookies)
        {
            var set = new Dictionary<string,string>(StringComparer.OrdinalIgnoreCase);
            foreach (var cookieName in allCookies
                .Split(';')
                .Select(_ => _.Split('=')[0].Trim()))
            {
                string existing;
                if (set.TryGetValue(cookieName, out existing))
                {
                    //prefer lowercase
                    yield return StringComparer.Ordinal.Compare(existing , cookieName) < 0 ? existing : cookieName;
                }
                else
                {
                    set[cookieName] = cookieName;
                }
                
            }
        }
        public  Task Invoke(HttpContext context)
        {
            context.Response.OnStarting(() =>
            {
                var cookies = context.Request.Headers["cookie"];
                foreach (var cookieName in CookiesToRemove(cookies.ToString()))
                {
                    context.Response.Cookies.Delete(cookieName);
                }

                return Task.CompletedTask;
            });
            return  _next.Invoke(context);
        }
    }
}