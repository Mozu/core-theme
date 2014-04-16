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

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    
    public class AuthController : ApiControllerBase
    {
        
        private IAuthenticationHelper _authenticationHelper;
        
        
    
        private readonly IUserHelper _userHelper;
        private readonly IPasswordHelper _passwordHelper;
        
    
        private readonly ISettings _settings;
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly ICookieProvider _cookieProvider;
        private ILogger _log;

        public AuthController( IAuthenticationHelper authHelper, IUserHelper userHelper, IPasswordHelper passwordHelper,ISettings settings , ISiteBuilderApiContext  apiContext, ICookieProvider cookieProvider, HttpRequestMessage request)
        {
            _authenticationHelper = authHelper;
            
            
            _userHelper = userHelper;
            _passwordHelper = passwordHelper;
            
          
            _settings = settings;
            _apiContext = apiContext;
            _cookieProvider = cookieProvider;

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

        [HttpPost]
       // public HttpResponseMessage Pants(string accessToken, string redirectUrl = null)
            public HttpResponseMessage Pants(HttpRequestMessage request )
        {
            var form = request.Content.ReadAsFormDataAsync().Result;
            string accessToken = form["accessToken"];
            string redirectUrl = form["redirectUrl"];
            //redirectUrl=%2Fadmin&accessToken=4BOtDlSWnUJ%2Fyli1jpWidgFVEkpey96IBLWO8Kve5Ka8un912AIQsvoOqOJEIC8CVoMYv8x2tsDg99NLkK8%2BiH%2BSvXNi0RrfsTTpieIUyps69%2FnXf6wK8yKouea9k1QLSjcgF72Dyzj4mY4YCYLg0DDKycD28XbrdGHnPIUGFp3svwaK5Ca2PAw1qMasMvut525lcNDVYjdTXbA1gIEqLGiONo5InlFfjduQRPaBhoGtCUuDcspYMG9nHVkKxjSFXdVqEX%2FTmvBMEt4Rh9ruXpbyO5zOB9LqwAtEU94tZxMlnvaJ8QgFN0pDAZ4uZGtOAbgo%2BXydVE76NNiOyqI9L5l%2FsU3pq3SbT96q%2F%2Blb%2FC3RRo5kiN%2F8DxpqlD2yl2AN
            var user = LightweightUserClaims.Parse(accessToken);

            Mozu.SiteBuilder.Mvc.Contexts.SiteContext.Save(null, null, user.GetUserScope().Id.Value, false, DataViewModeType.NoneSet, _cookieProvider, null);
            
            _apiContext.SetUser(user);
            _authenticationHelper.SaveAdminAccessToken(  accessToken);
            redirectUrl = string.IsNullOrEmpty(redirectUrl) ? "/admin" : redirectUrl;

            var message = new System.Net.Http.HttpResponseMessage(HttpStatusCode.Redirect );
            message.Headers.Location = new Uri(redirectUrl, UriKind.Relative);
            return message;
        }

      

        [HttpGet]
        public HttpResponseMessage  Launchpad()
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

        public bool _handledByRP { get; set; }

        private string GetHost()
        {
            return !string.IsNullOrEmpty( HttpContext.Request.Headers["x-forwarded-host"] ) ? HttpContext.Request.Headers["x-forwarded-host"] : HttpContext.Request.Headers["host"];
        }
    }
}
