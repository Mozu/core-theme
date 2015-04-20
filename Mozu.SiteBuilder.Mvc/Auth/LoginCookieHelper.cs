using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Security;
using System;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.Auth
{
    /// <summary>
    /// This class wraps the actions that the pants endpoints do to save an admin user token to the correct cookie.
    /// </summary>
    public static class LoginCookieHelper
    {
        public static async Task<HttpResponseMessage> SetAdminUserCookie(HttpRequestMessage request, ICookieProvider cookieProvider, ISiteBuilderApiContext context, IAuthenticationHelper authHelper, string defaultRedirectUrl, bool isForStoreFrontAccess)
        {
            var form = await request.Content.ReadAsFormDataAsync();
            string formAccessToken = form["accessToken"];
            string formRedirectUrl = form["redirectUrl"];

            var user = LightweightUserClaims.Parse(formAccessToken);

            Contexts.SiteContext.Save(null, null, user.GetUserScope().Id.Value, false, DataViewModeType.NoneSet, cookieProvider, null);

            context.SetUser(user);
            authHelper.SaveAdminAccessToken(formAccessToken, isForStoreFrontAccess);

            formRedirectUrl = string.IsNullOrEmpty(formRedirectUrl) ? defaultRedirectUrl : formRedirectUrl;
            return CreateRedirectTo(request, formRedirectUrl);
        }

        private static HttpResponseMessage CreateRedirectTo(HttpRequestMessage request, string formRedirectUrl)
        {
            var uri = GenerateRedirectUriFromUnknownPath(request, formRedirectUrl);
            var message = new HttpResponseMessage(HttpStatusCode.Redirect);
            message.Headers.Location = uri;
            return message;
        }

        private static Uri GenerateRedirectUriFromUnknownPath(HttpRequestMessage request, string formRedirectUrl)
        {
            var incomingUri = new Uri(formRedirectUrl, UriKind.RelativeOrAbsolute);
           
            if (!incomingUri.IsAbsoluteUri && formRedirectUrl != null && formRedirectUrl.Length != 0 && formRedirectUrl[0] != '/')
            {
                incomingUri =  new Uri("/"+ formRedirectUrl, UriKind.Relative);
            }
            return incomingUri;
        }
    }
}
