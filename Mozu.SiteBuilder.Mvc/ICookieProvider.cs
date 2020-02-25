// -----------------------------------------------------------------------
// <copyright file="ICookieProvider.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using Microsoft.AspNetCore.Http;
using Mozu.Core.Extensions;
using Mozu.Core.Settings;

namespace Mozu.SiteBuilder.Mvc
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using System.Web;
  

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public interface ICookieProvider
    {
        CookieState GetRequestCookie(string cookieName);
        void SaveResponseCookie(string cookieName, string value, CookieOptions cookie, bool httpConly = true);
        void RemoveCookie(string cookieName);
    }

    public class CookieProvider : ICookieProvider
    {
        private readonly HttpRequestMessage _request;
        private readonly HttpContext _context;
        //private readonly string _cookieName;
        
        public CookieProvider( HttpRequestMessage request , HttpContext context ,  ISettings settings   )
        {
            _request = request;
            _context = context;
        }


        public CookieState GetRequestCookie(string cookieName)
        {
            // work around casing issues with system.web.cookie.  
            // Still using web to write cookie as it would require a larger refactor to hold on to the cookies durenting the request and set them on say a message handler after the respone was created.
            //also the system.net cookie uses the formcollection encoder which removes + as spaces.   Didnt want to break all the cookies by adding a new format.  So grabbing the raw value and re--un-escapging it for base64
            var cookie =_request.Headers.GetCookies().SelectMany(x => x.Cookies).FirstOrDefault(x => x.Name == cookieName);
            if ( cookie?.Values != null )
            {
                var unescaped = cookie.Values.ToString();
                var parts = unescaped.Split('&');
                foreach( var part in parts)
                {
                    var eqIdx = part.IndexOf('=');
                    if ( eqIdx ==-1)
                    {
                        continue;
                    }
                    var name = part.Substring(0, eqIdx);
                    var value = part.Substring(eqIdx + 1).Replace("%2b", "+").Replace("%2f", "/").Replace("%3d", "=");
                    cookie[name] = value;
                }
            }
            return cookie;
        }

        public void SaveResponseCookie(string cookieName, string value, CookieOptions cookie, bool httpConly = true)
        {
            cookie.HttpOnly = httpConly;
            //cookie.Domain = this.Domain;
            if (_context.Request.Cookies.ContainsKey(cookieName))
            {
                _context.Response.Cookies.Delete(cookieName);
            }
            _context.Response.Cookies.Append(cookieName, value, cookie);
        }

        public void RemoveCookie(string cookieName)
        {
            _context.Response.Cookies.Delete(cookieName);
        }
    }
}
