using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;

using AutoMapper;
using Mozu.AdminUser.Contracts;
using Mozu.Core;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Controllers;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Models.Admin;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    
    public class AuthController : ApiControllerBase
    {
        
        private IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        
    
        private readonly IUserHelper _userHelper;
        private readonly IPasswordHelper _passwordHelper;
        
        private readonly IRolesHelper _rolesHelper;
        private readonly ISettings _settings;
        private readonly ISiteBuilderApiContext _apiContext;
        private readonly ICookieProvider _cookieProvider;
        private ILogger _log;

        public AuthController( IAuthenticationHelper authHelper, ISiteBuilderContext sbc,IUserHelper userHelper, IPasswordHelper passwordHelper, IRolesHelper rolesHelper , ISettings settings , ISiteBuilderApiContext  apiContext, ICookieProvider cookieProvider)
        {
            _authenticationHelper = authHelper;
            _sbc = sbc;
            
            _userHelper = userHelper;
            _passwordHelper = passwordHelper;
            
            _rolesHelper = rolesHelper;
            _settings = settings;
            _apiContext = apiContext;
            _cookieProvider = cookieProvider;

            _log = LoggingService.LoggerFor<AuthController>();
        }


        [HttpGet]
        public HttpResponseMessage FedLogin(string returnUrl)
        {

            var redir = _settings.LoginPath + "/to?scopeType=Tenant&redirectUrl=" + returnUrl;
            if (_settings.AppSettings("useTenantDomainNames") != "true")
            {
                redir += "&PostbackUrl=http://" + HttpContext.Request.Headers["host"] + "/admin/auth/pants";
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

            SiteBuilderContext.Save(null, null, user.GetUserScope().Id.Value, false, _cookieProvider );
            
            _apiContext.SetUser(user);
            _authenticationHelper.SaveAccessToken(  accessToken);
            redirectUrl = string.IsNullOrEmpty(redirectUrl) ? "/admin" : redirectUrl;

            var message = new System.Net.Http.HttpResponseMessage(HttpStatusCode.Redirect );
            message.Headers.Location = new Uri(redirectUrl, UriKind.Relative);
            return message;
        }

      

        //public bool  DeleteRole(int siteId, int roleId)
        //{
        //    _rolesHelper.RemoveRoleFromSite(siteId, roleId);
        //    return true;
        //}
          [HttpGet]
        public HttpResponseMessage  Launchpad()
          {
              var redir = _settings.LoginPath;
            if (_settings.AppSettings("useTenantDomainNames") != "true")
            {
                redir += "?postbackUrl=http://" + HttpContext.Request.Headers["host"] + "/admin/auth/pants";
            }
            


            var resp = new HttpResponseMessage(HttpStatusCode.Redirect);
            resp.Headers.Location = new Uri(redir);
            return resp;



            //var userId = _apiContext.UserClaims.UserId;
            //var res = _rolesHelper.SiteRolesList(userId);
            //var contexts = Mapper.Map<List<TaContext>>(res);
            //return View("Roles", contexts);
        }


        [HttpGet]
          public HttpResponseMessage Logout()
        {
         
            var redir = _settings.LoginPath + "/home/Logout";
            if (_settings.AppSettings("ReverseProxy") != "true")
            {
                redir += "?PostbackUrl=http://" + HttpContext.Request.Headers["host"] + "/admin/auth/pants";
            }
            var resp = new HttpResponseMessage(HttpStatusCode.Redirect );
            resp.Headers.Location = new Uri(redir);
            return resp;
        }
    }
}
