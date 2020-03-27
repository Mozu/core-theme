using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Security;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Mozu.SiteBuilder.Mvc.Auth
{
    /// <summary>
    /// This class wraps the actions that the pants endpoints do to save an admin user token to the correct cookie.
    /// </summary>
    public static class LoginCookieHelper
    {
        public static void SetAdminUserCookie(HttpContext httpContext, ICookieProvider cookieProvider, ISiteBuilderApiContext sbContext, IAuthenticationHelper authHelper, string defaultRedirectUrl, bool isForStoreFrontAccess)
        {
            var form = httpContext.Request.Form;
            string formAccessToken = form["accessToken"];
            string formRedirectUrl = form["redirectUrl"];

            var user = LightweightUserClaims.Parse(formAccessToken);

            Contexts.SiteContext.Save(null, null, user.GetUserScope().Id.Value, false, DataViewModeType.NoneSet, cookieProvider, null);

            sbContext.SetUser(user);
            authHelper.SaveAdminAccessToken(formAccessToken, isForStoreFrontAccess);

            formRedirectUrl = WebUtility.UrlDecode(string.IsNullOrEmpty(formRedirectUrl) ? defaultRedirectUrl : formRedirectUrl);
            CreateRedirectTo(httpContext, formRedirectUrl);
        }

        private static void CreateRedirectTo(HttpContext context, string formRedirectUrl)
        {
            var uri = GenerateRedirectUriFromUnknownPath(formRedirectUrl);
            context.Response.StatusCode = StatusCodes.Status302Found;
            context.Response.GetTypedHeaders().Location = uri;
        }

        private static Uri GenerateRedirectUriFromUnknownPath(string formRedirectUrl)
        {
            var incomingUri = new Uri(formRedirectUrl, UriKind.RelativeOrAbsolute);
           
            if (!incomingUri.IsAbsoluteUri && !string.IsNullOrEmpty(formRedirectUrl) && formRedirectUrl[0] != '/')
            {
                incomingUri =  new Uri("/"+ formRedirectUrl, UriKind.Relative);
            }
            return incomingUri;
        }
    }
}
