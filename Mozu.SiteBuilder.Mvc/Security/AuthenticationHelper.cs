using System.Net.Http;
using Mozu.Core.Settings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using Microsoft.AspNetCore.Http;
using Mozu.SiteBuilder.Mvc.Extensions;
using RestSharp;

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
        const string CookieDate = "dt";
        readonly string AdminAccessTokenCookieName;
        readonly string StoreFrontAccessTokenCookieName;
        readonly string StoreFrontAccessTokenSessionCookieName;
        readonly string AdminRefreshCookieName;
        readonly string StoreFrontRefershCookieName;
        readonly bool ForceSSL;
        readonly ICookieProvider CookieProvider;

        public AuthenticationHelper(ICookieProvider provider, ISettings settings, IHttpContextAccessor contextAccessor)
        {
            _settings = settings;
            var env = settings.AppSettings("Environment");
            var context = contextAccessor.HttpContext;
            AdminAccessTokenCookieName = "sb-admin-at-" + env;
            StoreFrontAccessTokenCookieName = "sb-sf-at-" + env;
            StoreFrontAccessTokenSessionCookieName = StoreFrontAccessTokenCookieName + "-s";
            StoreFrontRefershCookieName = "sb-sf-rt-" + env;
            AdminRefreshCookieName = Mozu.Core.TokenCookie.CookieRefreshToken;

            var handledByProxy = IsheaderTrue(Core.Api.Contracts.Constants.Headers.HANDLED_BY_PROXY, context);

            ForceSSL = settings.CoreSettings.IsSSLValidationEnabled && handledByProxy;
            CookieProvider = provider;
        }

        bool IsheaderTrue(string headerName, HttpContext context)
        {

            if (context == null || !context.Request.Headers.TryGetValue(headerName, out var values)) return false;

            var val = values.FirstOrDefault();
            if (bool.TryParse(val, out var ret))
            {
                return ret;
            }

            return val == "1";
        }

        void IAuthenticationHelper.SaveAdminAccessToken(string accessToken, bool isForStoreFrontAccess)
        {
            var cookie = new CookieOptions()
            {
                //only the refresh token is secure
                Secure = ForceSSL && !isForStoreFrontAccess,
                HttpOnly = true
            };

            CookieProvider.SaveResponseCookie(AdminAccessTokenCookieName, new Dictionary<string, string> { { AccessToken, accessToken } }, cookie);
        }

        string IAuthenticationHelper.GetAdminAccessToken()
        {
            var cookie = CookieProvider.GetRequestCookie(AdminAccessTokenCookieName);
            return cookie?.Values != null ? cookie[AccessToken] : null;
        }

        string IAuthenticationHelper.GetProfileToken()
        {
            var cookie = CookieProvider.GetRequestCookie(StoreFrontAccessTokenCookieName);
            return cookie?.Values != null ? cookie[ProfileToken] : null;
        }

        string IAuthenticationHelper.GetAdminRefreshToken()
        {
            var cookie = CookieProvider.GetRequestCookie(AdminRefreshCookieName);
            return cookie?.Values != null ? cookie["Token"] : null;
        }

        void IAuthenticationHelper.SaveStoreFrontRefreshToken(string token, DateTime? expiryTime)
        {

            var cookie = new CookieOptions
            {
                Expires = expiryTime?.ToLocalTime(),
                Secure = ForceSSL,
                HttpOnly = true
            };
            CookieProvider.SaveResponseCookie(StoreFrontRefershCookieName, token??string.Empty, cookie);
        }

        string IAuthenticationHelper.GetStoreFrontRefreshToken()
        {
            var cookie = CookieProvider.GetRequestCookie(StoreFrontRefershCookieName);
            return cookie != null && !string.IsNullOrWhiteSpace(cookie.Value) ? cookie.Value : null;
        }
        string IAuthenticationHelper.GetStoreFrontSessionAccessToken()
        {
            var cookie = CookieProvider.GetRequestCookie(StoreFrontAccessTokenSessionCookieName);
            return cookie?.Values != null ? cookie[AccessToken] : null;
        }
        string IAuthenticationHelper.GetStoreFrontAccessToken()
        {
            var cookie = CookieProvider.GetRequestCookie(StoreFrontAccessTokenCookieName );
            return cookie?.Values != null ? cookie[AccessToken] : null;
        }

        void IAuthenticationHelper.SaveStoreFrontAccessToken(string accessToken, string profile, DateTime? expiry)
        {
            var pcookie = new CookieOptions();
            var pvals = new Dictionary<string, string>
            {
                {ProfileToken, profile},
                {AccessToken, accessToken}
            };
            pcookie.Expires = expiry ?? DateTime.Now.AddYears(20);

            var scookie = new CookieOptions();
            var svals = new Dictionary<string, string>
            {
                {ProfileToken, profile},
                {AccessToken, accessToken},
                {CookieDate, DateTime.UtcNow.ToString("o")}
            };

           
            CookieProvider.SaveResponseCookie(StoreFrontAccessTokenSessionCookieName, svals, scookie);
            CookieProvider.SaveResponseCookie(StoreFrontAccessTokenCookieName, pvals,  pcookie);
        }
        void IAuthenticationHelper.ClearSessionToken()
        {
            var scookie = new CookieOptions {Expires = DateTime.MinValue};
            CookieProvider.SaveResponseCookie(StoreFrontAccessTokenSessionCookieName, $"{CookieDate}={DateTime.MinValue:o}", scookie);
        }


        void IAuthenticationHelper.ClearStorefrontTokens()
        {
            (this as IAuthenticationHelper).SaveStoreFrontAccessToken(null, null);
           
            (this as IAuthenticationHelper).SaveStoreFrontRefreshToken(null, DateTime.Now);
        }

        public DateTime? GetStoreFrontSessionAccessTokenDate()
        {
            var cookie = CookieProvider.GetRequestCookie(StoreFrontAccessTokenSessionCookieName);
            if (cookie?.Values == null) return null;
            var str= cookie[CookieDate];
            if (DateTime.TryParse(str, out var retVal))
            {
                return retVal;
            }
            return null;
        }
    }
}
