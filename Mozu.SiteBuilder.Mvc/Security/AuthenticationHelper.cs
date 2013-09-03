// -----------------------------------------------------------------------
// <copyright file="AuthenticationHelper.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Globalization;
using System.Security.Principal;
using System.Threading;
using System.Web.Security;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;
using Mozu.User.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.Security
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    using Mozu.User.Contracts;
    using System.Web;
    using System.ComponentModel;
    using Mozu.Core;
  
    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class AuthenticationHelper : IAuthenticationHelper
    {
        private readonly ISettings _settings;
        ////public static String COOKIENAME = "sbAuth";
        //private HttpContextBase _httpContext;

        public AuthenticationHelper(ICookieProvider provider, ISettings settings)
        {
            _settings = settings;
            CookieName = _settings.AppSettings("authCookieName");
            RefershCookieName = "mzrt-" + settings.AppSettings("Environment");
            CookieProvider = provider;
        }


        public string CookieName { get; set; }


        public string RefershCookieName { get; set; }

        public ICookieProvider CookieProvider { get; set; }


      




        

        void IAuthenticationHelper.SaveAccessToken(string accessToken)
        {
            var cookie = new HttpCookie(CookieName);
            cookie["accessToken"] = accessToken;

            CookieProvider.SaveResponseCookie(CookieName, cookie);
           
        }

        string IAuthenticationHelper.GetAccessToken()
        {
            var cookie = CookieProvider.GetRequestCookie(CookieName);
            if (cookie != null && cookie.HasKeys)
            {
                return cookie["accessToken"];
            }
            return null;
        }

        string IAuthenticationHelper.GetProfileToken()
        {
            var cookie = CookieProvider.GetRequestCookie(CookieName);
            if (cookie != null && cookie.HasKeys)
            {
                return cookie["profileToken"];
            }
            return null;
        }

        string IAuthenticationHelper.GetRefreshToken()
        {
            var cookie = CookieProvider.GetRequestCookie(RefershCookieName);
            if (cookie != null && cookie.HasKeys)
            {
                return cookie["Token"];
            }
            return null;
            
        }


        void IAuthenticationHelper.SaveAuthTicket(UserAuthTicket ticket)
        {
            var cookie = new HttpCookie(CookieName);
            if (ticket == null)
            {
                CookieProvider.SaveResponseCookie(CookieName, cookie);
                return;
            }
            cookie["accessToken"] = ticket.AccessToken ;
            cookie["refreshToekn"] = ticket.RefreshToken;
            if (ticket.User != null)
            {
                cookie["profileToken"] = new Mozu.Core.UserProfile()
                                             {
                                                 EmailAddress = ticket.User.EmailAddress,
                                                 FirstName = ticket.User.FirstName,
                                                 LastName = ticket.User.LastName
                                             }.ToToken();
            }
            
            CookieProvider.SaveResponseCookie(CookieName, cookie);


          
         
        }





        UserAuthTicket IAuthenticationHelper.GetAuthTicket()
        {
            var cookie = CookieProvider.GetRequestCookie(CookieName);
           
            if (cookie != null && cookie.HasKeys)
            {
                
                return new UserAuthTicket()
                                            {
                                                AccessToken = cookie["accessToken"] ,
                                                RefreshToken = cookie["refreshToekn"]
                                            };
               
            }
            return null;
        }
    }
}
