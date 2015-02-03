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
        public static async Task<HttpResponseMessage> SetAdminUserCookie(HttpRequestMessage request, ICookieProvider cookieProvider, ISiteBuilderApiContext context, IAuthenticationHelper authHelper, string defaultRedirectUrl)
        {
            var form = await request.Content.ReadAsFormDataAsync();
            string formAccessToken = form["accessToken"];
            string formRedirectUrl = form["redirectUrl"];
            //redirectUrl=%2Fadmin&accessToken=4BOtDlSWnUJ%2Fyli1jpWidgFVEkpey96IBLWO8Kve5Ka8un912AIQsvoOqOJEIC8CVoMYv8x2tsDg99NLkK8%2BiH%2BSvXNi0RrfsTTpieIUyps69%2FnXf6wK8yKouea9k1QLSjcgF72Dyzj4mY4YCYLg0DDKycD28XbrdGHnPIUGFp3svwaK5Ca2PAw1qMasMvut525lcNDVYjdTXbA1gIEqLGiONo5InlFfjduQRPaBhoGtCUuDcspYMG9nHVkKxjSFXdVqEX%2FTmvBMEt4Rh9ruXpbyO5zOB9LqwAtEU94tZxMlnvaJ8QgFN0pDAZ4uZGtOAbgo%2BXydVE76NNiOyqI9L5l%2FsU3pq3SbT96q%2F%2Blb%2FC3RRo5kiN%2F8DxpqlD2yl2AN
            var user = LightweightUserClaims.Parse(formAccessToken);

            Contexts.SiteContext.Save(null, null, user.GetUserScope().Id.Value, false, DataViewModeType.NoneSet, cookieProvider, null);

            context.SetUser(user);
            authHelper.SaveAdminAccessToken(formAccessToken);
            formRedirectUrl = string.IsNullOrEmpty(formRedirectUrl) ? defaultRedirectUrl : formRedirectUrl;

            var message = new HttpResponseMessage(HttpStatusCode.Redirect);
            message.Headers.Location = new Uri(formRedirectUrl, UriKind.Relative);
            return message;
        }
    }
}
