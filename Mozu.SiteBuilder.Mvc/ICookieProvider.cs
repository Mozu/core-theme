// -----------------------------------------------------------------------
// <copyright file="ICookieProvider.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

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
        HttpCookie GetRequestCookie(string cookieName);
        void SaveResponseCookie(string cookieName, HttpCookie cookie);
        void RemoveCookie(string cookieName);
    }

    public class CookieProvider : ICookieProvider
    {
        //private readonly string _cookieName;
        
        public CookieProvider( HttpContextBase context ,ISettings settings   )
        {
            Context = context;

           

          

        }
     
        public HttpContextBase Context { get; private set; }
        //private string _domain;
        //public string Domain
        //{
        //    get
        //    {
        //        if (_domain == null)
        //        {
        //             var url = Context.Request.Headers[Mozu.Core.Api.Contracts.Constants.Headers.ORIGINAL_URL];
        //            if (string.IsNullOrEmpty(url))
        //            {
        //                url = Context.Request.RawUrl;
        //            }
        //            _domain = new Uri(url).Host;
        //        }
        //        return _domain;
        //    }
        //}

        public HttpCookie GetRequestCookie(string cookieName)
        {
            return Context.Request.Cookies.Get(cookieName);
        }

        public void SaveResponseCookie(string cookieName , HttpCookie cookie)
        {
            cookie.Name = cookieName;
            //cookie.Domain = this.Domain;
            if ( Context.Response.Cookies.AllKeys.Any( x=> x == cookieName ))
            {
                Context.Response.Cookies.Remove(cookieName);
            }
            Context.Response.SetCookie(cookie);
        }

        public void RemoveCookie(string cookieName)
        {
            Context.Response.Cookies.Remove(cookieName);
        }
    }
}
