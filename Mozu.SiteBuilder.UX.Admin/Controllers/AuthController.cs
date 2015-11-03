using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc.Helpers;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    
    public class AuthController : ApiControllerBase
    {
        readonly IUserHelper _userHelper;
        readonly IPasswordHelper _passwordHelper;
        readonly ISettings _settings;
        readonly ILogger _log;
        readonly ICookieProvider _cookieProvider;
        readonly IAuthenticationHelper _authHelper;
        readonly ISiteBuilderApiContext _apiContext;
        readonly LoginAppRouteHelper _loginAppRouter;

        public AuthController( IAuthenticationHelper authHelper, IUserHelper userHelper, IPasswordHelper passwordHelper,ISettings settings , ISiteBuilderApiContext  apiContext, ICookieProvider cookieProvider, HttpRequestMessage request)
        {
            _userHelper = userHelper;
            _passwordHelper = passwordHelper;
            _settings = settings;
            _cookieProvider = cookieProvider;
            _authHelper = authHelper;
            _apiContext = apiContext;

            _log = LoggingService.LoggerFor<AuthController>();
            _loginAppRouter = new LoginAppRouteHelper(settings.LoginPath);
            _handledByRP =  IsHeaderPresent(request, Mozu.Core.Api.Contracts.Constants.Headers.ORIGINAL_URL);
        }

        static bool IsHeaderPresent(HttpRequestMessage request, string name)
        {
            IEnumerable<string> values;
            return request.Headers.TryGetValues(name, out values);
        }

        [HttpGet]
        public HttpResponseMessage FedLogin(string returnUrl)
        {
            var postback = !_handledByRP ? string.Format("http://{0}/admin/auth/pants", GetHost()) : null;
            var redir = _loginAppRouter.To(UserScopeType.Tenant, _apiContext.TenantId, returnUrl, postback, true);

            var message = new System.Net.Http.HttpResponseMessage(HttpStatusCode.Redirect);
            message.Headers.Location = redir;
            return message;
        }

        /// <summary>
        /// As opposed to the FedLogin above, we don't want to auto-redirect back here so we don't provide a scopeid or redirecturl
        /// </summary>
        /// <returns></returns>
        [HttpGet]
        public HttpResponseMessage Launchpad()
        {
            var postback = !_handledByRP ? string.Format("http://{0}/admin/auth/pants", GetHost()) : null;
            var redir = _loginAppRouter.Launchpad(UserScopeType.Tenant, postback, true);
            
            var resp = new HttpResponseMessage(HttpStatusCode.Redirect);
            resp.Headers.Location = redir;
            return resp;
        }

        [HttpGet]
        public HttpResponseMessage Logout()
        {
            var postback = !_handledByRP ? string.Format("http://{0}/admin/auth/pants", GetHost()) : null;
            var redir = _loginAppRouter.Logout(UserScopeType.Tenant, postback, true);

            var resp = new HttpResponseMessage(HttpStatusCode.Redirect );
            resp.Headers.Location = redir;
            return resp;
        }

        [HttpPost]
        public async Task<HttpResponseMessage> Pants(HttpRequestMessage request)
        {
            return await Mvc.Auth.LoginCookieHelper.SetAdminUserCookie(request, _cookieProvider, _apiContext, _authHelper, "/admin", false);
        }

        public bool _handledByRP { get; set; }

        private string GetHost()
        {
            return !string.IsNullOrEmpty( HttpContext.Request.Headers["x-forwarded-host"] ) ? HttpContext.Request.Headers["x-forwarded-host"] : HttpContext.Request.Headers["host"];
        }
    }
}
