using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.Net.Http.Headers;

namespace Mozu.SiteBuilder.Mvc.Middleware
{
    public class CaseCookieCleaner
    {
        private readonly RequestDelegate _next;
        private const string Splitter = "; ";
        private const string CookieHeaderName = "Cookie";

        public CaseCookieCleaner(RequestDelegate next)
        {
            _next = next;
        }

        IEnumerable<string> CookiesToRemove(string allCookies)
        {
            var set = new Dictionary<string,string>(StringComparer.OrdinalIgnoreCase);
            foreach (var cookieName in allCookies
                .Split(Splitter)
                .Select(_ => _.Split('=')[0]))
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

        static bool CleanHeader(string allCookies , out string  cleanedCookies)
        {
            var cookies = new Dictionary<string,string>();
            
            var set = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            bool cleanded = false;
            foreach (var cookie in allCookies
                .Split(Splitter))
            {
                var nameIdx = cookie.IndexOf('=');
                if (nameIdx < 0)
                {
                    continue;
                }
                var cookieName = cookie.Substring(0, nameIdx);
                if (set.Contains(cookieName))
                {
                    cleanded = true;
                    if (cookieName != cookieName.ToLower())
                    {
                        continue;
                    }
                }

                cookies[cookieName] = cookie;
                set.Add(cookieName);

            }    
            
            cleanedCookies =  cleanded ? string.Join(Splitter, cookies.Values) : allCookies;
            return cleanded;


        }
        public  Task Invoke(HttpContext context)
        {
            var cookies = context.Request.Headers[CookieHeaderName];
            bool cleaned = CleanHeader(cookies.ToString(), out string cleanedCookies);
            if (cleaned)
            {
                context.Request.Headers[CookieHeaderName] = cleanedCookies;
            }
            
            context.Response.OnStarting(() =>
            {
                if (cleaned)
                {
                    foreach (var cookieName in CookiesToRemove(cookies.ToString()))
                    {
                        context.Response.Cookies.Delete(cookieName);
                    }
                }

                return Task.CompletedTask;
            });
            return  _next.Invoke(context);
        }
    }
    
 
}
