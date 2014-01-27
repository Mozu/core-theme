// -----------------------------------------------------------------------
// <copyright file="AuthenticationHelper.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Globalization;
using System.Net.Http;
using System.Security.Principal;
using System.Threading;
using System.Web.Security;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Settings;


namespace Mozu.SiteBuilder.Mvc.Security
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Text;
    
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
        private const string AccessToken = "at";
        private const string ProfileToken = "pt";
        public AuthenticationHelper(ICookieProvider provider, ISettings settings, HttpRequestMessage httpRequestMessage)
        {
            _settings = settings;
            string env = settings.AppSettings("Environment");

            AdminAccessTokenCookieName = "sb-admin-at-" + env;
            StoreFrontAccessTokenCookieName = "sb-sf-at-" + env;
            StoreFrontRefershCookieName = "sb-sf-rt-" + env;
            AdminRefershCookieName = "mzrt-" + env;

            bool handledByProxy = IsheaderTrue(Mozu.Core.Api.Contracts.Constants.Headers.HANDLED_BY_PROXY, httpRequestMessage);

            ForceSSL = settings.CoreSettings.IsSSLValidationEnabled && handledByProxy;
            CookieProvider = provider;
        }

        bool IsheaderTrue(string headerName, HttpRequestMessage requestMessage)
        {
            IEnumerable<string> values;
            if (requestMessage.Headers.TryGetValues(headerName, out values))
            {


                bool ret;
                var val = values.FirstOrDefault();
                if (bool.TryParse(val, out ret))
                {
                    return ret;
                }

                return val == "1";
            }
            return false;
            ;
        }

        public string AdminAccessTokenCookieName { get; set; }

        public string StoreFrontAccessTokenCookieName { get; set; }

        public string AdminRefershCookieName { get; set; }

        public string StoreFrontRefershCookieName { get; set; }

        public bool ForceSSL { get; set; }


        public ICookieProvider CookieProvider { get; set; }


      




        

        void IAuthenticationHelper.SaveAdminAccessToken(string accessToken)
        {
            var cookie = new HttpCookie(AdminAccessTokenCookieName);
           
            cookie[AccessToken] = accessToken;
            cookie.Secure = this.ForceSSL;
            cookie.HttpOnly = true;
            CookieProvider.SaveResponseCookie(AdminAccessTokenCookieName, cookie);
           
        }

        string IAuthenticationHelper.GetAdminAccessToken()
        {
            var cookie = CookieProvider.GetRequestCookie(AdminAccessTokenCookieName);
            if (cookie != null && cookie.HasKeys)
            {
                return cookie[AccessToken];
            }
            return null;
        }

        string IAuthenticationHelper.GetProfileToken()
        {
            var cookie = CookieProvider.GetRequestCookie(StoreFrontAccessTokenCookieName);
            if (cookie != null && cookie.HasKeys)
            {
                return cookie[ProfileToken];
            }
            return null;
        }

     



        string IAuthenticationHelper.GetAdminRefreshToken()
        {
            var cookie = CookieProvider.GetRequestCookie(AdminRefershCookieName);
            if (cookie != null && cookie.HasKeys )
            {
                return cookie["Token"];
            }
            return null;
        }

        void IAuthenticationHelper.SaveStoreFrontRefreshToken(string token, DateTime? expiryTime)
        {
            
            var cookie = new HttpCookie(StoreFrontRefershCookieName);

            cookie.Value = token;
            cookie.Expires = expiryTime.HasValue ? expiryTime.Value.ToLocalTime() : DateTime.Now.AddDays(1);
            cookie.Secure = this.ForceSSL;
            cookie.HttpOnly = true;
            CookieProvider.SaveResponseCookie(StoreFrontRefershCookieName, cookie);
        }

        string IAuthenticationHelper.GetStoreFrontRefreshToken()
        {
            var cookie = CookieProvider.GetRequestCookie(StoreFrontRefershCookieName);
            return cookie != null && !string.IsNullOrWhiteSpace(cookie.Value) ? cookie.Value : null;
        }

        string IAuthenticationHelper.GetStoreFrontAccessToken()
        {
            var cookie = CookieProvider.GetRequestCookie(StoreFrontAccessTokenCookieName );
            if (cookie != null && cookie.HasKeys )
            {
                return cookie[AccessToken];
            }
            return null;
        }

        void IAuthenticationHelper.SaveStoreFrontAccessToken(string accessToken, string profile)
        {
            var cookie = new HttpCookie(StoreFrontAccessTokenCookieName);
            cookie[ProfileToken ] = profile;
            cookie[AccessToken] = accessToken;
            cookie.Expires = DateTime.Now.AddYears(20);


            CookieProvider.SaveResponseCookie(StoreFrontAccessTokenCookieName, cookie);
        }
    }
}
