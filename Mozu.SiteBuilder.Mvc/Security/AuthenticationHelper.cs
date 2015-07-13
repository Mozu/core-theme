using System.Net.Http;
using Mozu.Core.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Mozu.SiteBuilder.Mvc.Security
{
    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class AuthenticationHelper : IAuthenticationHelper
    {
        readonly ISettings _settings;
        const string AccessToken = "at";
        const string ProfileToken = "pt";
        readonly string AdminAccessTokenCookieName;
        readonly string StoreFrontAccessTokenCookieName;
        readonly string AdminRefreshCookieName;
        readonly string StoreFrontRefershCookieName;
        readonly bool ForceSSL;
        readonly ICookieProvider CookieProvider;

        public AuthenticationHelper(ICookieProvider provider, ISettings settings, HttpRequestMessage httpRequestMessage)
        {
            _settings = settings;
            string env = settings.AppSettings("Environment");

            AdminAccessTokenCookieName = "sb-admin-at-" + env;
            StoreFrontAccessTokenCookieName = "sb-sf-at-" + env;
            StoreFrontRefershCookieName = "sb-sf-rt-" + env;
            AdminRefreshCookieName = Mozu.Core.TokenCookie.CookieRefreshToken;

            bool handledByProxy = IsheaderTrue(Core.Api.Contracts.Constants.Headers.HANDLED_BY_PROXY, httpRequestMessage);

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
        }

        void IAuthenticationHelper.SaveAdminAccessToken(string accessToken, bool isForStoreFrontAccess)
        {
            var cookie = new HttpCookie(AdminAccessTokenCookieName);
           
            cookie[AccessToken] = accessToken;
            //only the refresh token is secure
            cookie.Secure = this.ForceSSL && !isForStoreFrontAccess;
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
            var cookie = CookieProvider.GetRequestCookie(AdminRefreshCookieName);
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

        void IAuthenticationHelper.SaveStoreFrontAccessToken(string accessToken, string profile, DateTime? expiry)
        {
            var cookie = new HttpCookie(StoreFrontAccessTokenCookieName);
            cookie[ProfileToken ] = profile;
            cookie[AccessToken] = accessToken;
            cookie.Expires = expiry ?? DateTime.Now.AddYears(20);


            CookieProvider.SaveResponseCookie(StoreFrontAccessTokenCookieName, cookie);
        }

        void IAuthenticationHelper.ClearStorefrontTokens()
        {
            (this as IAuthenticationHelper).SaveStoreFrontAccessToken(null, null);
            (this as IAuthenticationHelper).SaveStoreFrontRefreshToken(null, DateTime.Now);
        }
    }
}
