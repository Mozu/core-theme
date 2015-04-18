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

        public AuthController( IAuthenticationHelper authHelper, IUserHelper userHelper, IPasswordHelper passwordHelper,ISettings settings , ISiteBuilderApiContext  apiContext, ICookieProvider cookieProvider, HttpRequestMessage request)
        {
            _userHelper = userHelper;
            _passwordHelper = passwordHelper;
            _settings = settings;
            _cookieProvider = cookieProvider;
            _authHelper = authHelper;
            _apiContext = apiContext;
                
            _log = LoggingService.LoggerFor<AuthController>();
            IEnumerable<string> values;
            if (request.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out values))
            {
                this._handledByRP = true;
            }
        }

        [HttpGet]
        public HttpResponseMessage FedLogin(string returnUrl)
        {
            var redir = _settings.LoginPath + "/to?scopeType=Tenant&redirectUrl=" + returnUrl;
            if (!_handledByRP)
            {
                redir += "&PostbackUrl=http://" + GetHost() + "/admin/auth/pants&showdev=true";
            }

            var message = new System.Net.Http.HttpResponseMessage(HttpStatusCode.Redirect);
            message.Headers.Location = new Uri(redir);
            return message;
        }

        [HttpGet]
        public HttpResponseMessage Launchpad()
        {
            var redir = _settings.LoginPath;
            if (!_handledByRP)
            {
                redir += "?postbackUrl=http://" + GetHost() + "/admin/auth/pants&scopeType=tenant&showdev=true";
            }
            
            var resp = new HttpResponseMessage(HttpStatusCode.Redirect);
            resp.Headers.Location = new Uri(redir);
            return resp;
        }

        [HttpGet]
        public HttpResponseMessage Logout()
        {
            var redir = _settings.LoginPath + "/home/Logout";
            if (!_handledByRP)
            {
                redir += "?PostbackUrl=http://" + GetHost() + "/admin/auth/pants&scopeType=tenant&showdev=true";
            }
            var resp = new HttpResponseMessage(HttpStatusCode.Redirect );
            resp.Headers.Location = new Uri(redir);
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
