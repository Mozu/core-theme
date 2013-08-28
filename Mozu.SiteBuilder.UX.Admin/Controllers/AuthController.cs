using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using AutoMapper;
using Mozu.AdminUser.Contracts;
using Mozu.Core;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Models.Admin;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    public class AuthController : Controller
    {
        
        private IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        
    
        private readonly IUserHelper _userHelper;
        private readonly IPasswordHelper _passwordHelper;
        
        private readonly IRolesHelper _rolesHelper;
        private readonly ISettings _settings;
        private readonly ISiteBuilderApiContext _apiContext;
        private ILogger _log;

        public AuthController( IAuthenticationHelper authHelper, ISiteBuilderContext sbc,IUserHelper userHelper, IPasswordHelper passwordHelper, IRolesHelper rolesHelper , ISettings settings , ISiteBuilderApiContext  apiContext)
        {
            _authenticationHelper = authHelper;
            _sbc = sbc;
            
            _userHelper = userHelper;
            _passwordHelper = passwordHelper;
            
            _rolesHelper = rolesHelper;
            _settings = settings;
            _apiContext = apiContext;

            _log = LoggingService.LoggerFor<AuthController>();
        }

        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            if ( filterContext.HttpContext != null && filterContext.HttpContext.Request.HttpMethod == "GET" )
            {
                ModelState.Clear();
            }
            base.OnActionExecuted(filterContext);
        }

        public ActionResult FedLogin(string returnUrl)
        {

            var redir = _settings.LoginPath + "/to?scopeType=Tenant&redirectUrl=" + returnUrl;
            if (_settings.AppSettings( "useTenantDomainNames") !=  "true")
            {
                redir += "&postbackUrl=http://" + HttpContext.Request.Headers["host"] + "/admin/auth/pants";
            }
            return Redirect(redir);
        }

        [HttpPost]
        public ActionResult Pants(string accessToken, string redirect)
        {
            var user = LightweightUserClaims.Parse(accessToken);
            _sbc.TenantId = user.GetUserScope().Id.Value;
            _sbc.Save();
            _apiContext.SetUser(user);
            _authenticationHelper.SaveAccessToken(  accessToken);
            redirect = string.IsNullOrEmpty(redirect) ? "/admin" : redirect;
            return Redirect(redirect);
        }

        public ActionResult Launchpad()
        {
            var redir = _settings.LoginPath + "/to?scopeType=Tenant";
            if (_settings.AppSettings("ReverseProxy") != "true")
            {
                redir += "&postbackUrl=http://" + HttpContext.Request.Headers["host"] + "/admin/auth/pants";
            }
            return Redirect(redir);

            //var userId = _apiContext.UserClaims.UserId;
            //var res = _rolesHelper.SiteRolesList(userId);
            //var contexts = Mapper.Map<List<TaContext>>(res);
            //return View("Roles", contexts);
        }


        
        // GET: /Auth/
        public ActionResult Index(LoginUser login)
        {
            return FedLogin("");
            //login = login ?? new LoginUser();
            //login.EmailAddress = (string.IsNullOrEmpty(login.EmailAddress) && cUser != null) ? cUser.EmailAddress : login.EmailAddress;

            //return View(login);
        }

        //[HttpPost]
        //public async Task<ActionResult> Login(LoginUser login)
        //{
        //    if (string.IsNullOrEmpty(login.EmailAddress  ) || string.IsNullOrEmpty(login.Password))
        //    {
        //        if (string.IsNullOrEmpty(login.EmailAddress))
        //            ModelState.AddModelError("EmailAddress", "Please enter your user EmailAddress");
        //        if (string.IsNullOrEmpty(login.Password))
        //            ModelState.AddModelError("Password", "Please enter your Password!");

        //        return View("Index");
        //    }

        //    try
        //    {
        //        // If the user authenticates, redirect them to the admin app
        //        var tenants = _loginHelper.VolusionLogIn(login);

        //        if (tenants.Skip(1).Any()) // more than 1
        //        {
        //            var contexts = Mapper.Map<List<TaContext>>(tenants);
        //            // Launch Pad with Tenant Names
        //            return View("Roles", contexts);
        //        }
        //        if (tenants.Any())
        //        {
        //            // Auto login to tenant
        //            var taContext = tenants.First();

        //            //var tenant = await _contextSwitcher.ChangeTenant(taContext.Id);
        //            if (taContext != null)
        //            {

        //                _sbc.SiteId = null;
        //                _sbc.SiteGroupId = null;
        //                _sbc.TenantId = taContext.Id;
        //                _sbc.Save();


        //                if (_settings.AppSettings("useTenantDomainNames") == "true")
        //                {
        //                    return Redirect(string.Format("http://{0}/admin", taContext.Domain.DomainName ));
        //                }
        //                else
        //                {
        //                    return Redirect("/admin");
        //                }
        //            }
        //            return null;
        //        }

        //        ModelState.AddModelError("General", "You don't have access to any sites.");
        //        return View("Index");
        //    }

        //    catch (AggregateException exception)
        //    {
        //        // Otherwise, send the login error message
        //        ModelState.AddModelError("General", exception.UnwrapAgg().Message);

        //        return View("Index");
        //    }
        //    catch (Mozu.Core.Api.Client.Exceptions.ApiWebClientException ex)
        //    {
        //        if (ex.RemoteError != null && ex.RemoteError.Items != null && ex.RemoteError.Items.Count > 0 && ex.RemoteError.Items[0].ErrorCode == "ITEM_NOT_FOUND")
        //        {
        //            ModelState.AddModelError("General", "Invalid Credentials");
        //        }
        //        else
        //        {
        //            ModelState.AddModelError("General", ex.Message);
        //        }
                
        //        return View("Index");
             
        //    }
        //}


        public ActionResult ForgotPassword()
        {
            return View();
        }

        //[HttpPost]
        //public JsonResult ForgotPassword(LoginUser user)
        //{
        //    try
        //    {
        //        _passwordHelper.CreatePasswordResetRequest(user.EmailAddress );

        //        return new JsonResult { Data = true };
        //    }
        //    catch (Exception)
        //    {
        //        return new JsonResult { Data = false };
        //    }
        //}

        public ActionResult NewAccountInvitation(LoginUser user)
        {
            //if (user.SiteId.GetValueOrDefault() != _sbc.SiteId)
            //{
            //    _sbc.SiteId = user.SiteId.GetValueOrDefault();
            //    _sbc.TenantId = user.TenantId.GetValueOrDefault();
            //    _sbc.Save();
            //    return this.Redirect(ControllerContext.HttpContext.Request.Url.PathAndQuery);
            //}
            
            if (_userHelper.UserExists(user))
            {
                return RedirectToRoute("login",  user);
            }
             
            return View(user);
        }

        //[HttpPost ]
        //public ActionResult NewAccountInvitation(LoginUser user, FormCollection form)
        //{
        //    if (string.IsNullOrEmpty(user.Password))
        //    {
        //        if (string.IsNullOrEmpty(user.Password))
        //            ModelState.AddModelError("Password", "Please enter your password!");

        //        return View();
        //    }

        //    // If the user authenticates, redirect them to the admin app
        //    try
        //    {
        //        var tenants =  _loginHelper.VolusionLogIn(user);
        //        var contexts = Mapper.Map<List<TaContext>>(tenants);
        //        if (tenants.Skip(1).Any()) // checking for "greater than 1" without enumerating the collection
        //        {
        //            return View("Roles", contexts);
        //        }

        //        return Redirect("/admin");
                
              
        //    }
        //    catch (AggregateException exception)
        //    {
        //        var message = exception.UnwrapAgg().Message;
        //        ModelState.AddModelError("General", message);
        //    }

        //    // Otherwise, send the login error message
        //    ModelState.AddModelError("General", "Authentication failed!");

        //    return View();
        //}

        //public ActionResult ResetPassword(string validateToken, string userId)
        //{

        //    var user = new LoginUser();
        //    user.ConfirmationCode = validateToken;
        //    var userObj = _userHelper.GetUser(userId);

        //    if ( userObj == null )
        //    {
        //        //tbd error.
        //    }
        //    user.EmailAddress = userObj.EmailAddress;

        //    return View(user);
        //}

        

        //[HttpPost]
        //public async Task<ActionResult> ResetPassword(LoginUser user , FormCollection col)
        //{
        //    _passwordHelper.UpdateForgottenPassword(user);
        //    return await Login(user);
        //}

        public ActionResult DeleteRole(int siteId, int roleId)
        {
            _rolesHelper.RemoveRoleFromSite(siteId, roleId);
            return new JsonResult
                       {
                           Data = true,
                           JsonRequestBehavior = JsonRequestBehavior.AllowGet
                       };
        }

        //public async Task<ActionResult> ChangeTenant(int id, string redirectUrl = null)
        //{
        //    string url = String.IsNullOrEmpty(redirectUrl) ? "admin" : "admin/" + Regex.Replace(redirectUrl, "^/?admin/", "").TrimStart('/');

        //    var tenant = await _contextSwitcher.ChangeTenant(id);
        //    if (tenant != null)
        //    {
        //        if (_settings.AppSettings("useTenantDomainNames") == "true")
        //        {
        //            return Redirect(string.Format("http://{0}/{1}", tenant.Domain.DomainName, url));
        //        }
        //        else
        //        {
        //            return Redirect("/" + url);
        //        }
              
        //    }
        //    return View("Login");
        //}


        public ActionResult Logout()
        {
         
            var redir = _settings.LoginPath + "/home/Logout";
            if (_settings.AppSettings("ReverseProxy") != "true")
            {
                redir += "?postbackUrl=http://" + HttpContext.Request.Headers["host"] + "/admin/auth/pants";
            }
            return Redirect(redir);
        }
    }
}
