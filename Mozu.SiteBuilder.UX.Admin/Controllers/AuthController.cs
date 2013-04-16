using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;
using AutoMapper;
using Mozu.Core.Settings;
using Mozu.Provisioning.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Models.Admin;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    public class AuthController : Controller
    {
        private readonly IVolusionLoginHelper _loginHelper;
        private IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        private readonly ICurrentUserHelper _currentUserHelper;
        private readonly IContextSwitcher _contextSwitcher;
        private readonly IUserHelper _userHelper;
        private readonly IPasswordHelper _passwordHelper;
        private readonly Provisioning.Contracts.Clients.IMerchantSignUpWebApiClient _merchantSignUpWebApiClient;
        private readonly IRolesHelper _rolesHelper;
        private readonly ISettings _settings;

        public AuthController(IVolusionLoginHelper loginHelper, IAuthenticationHelper authHelper, ISiteBuilderContext sbc, ICurrentUserHelper currentUserHelper, IContextSwitcher contextSwitcher, IUserHelper userHelper, IPasswordHelper passwordHelper, Mozu.Provisioning.Contracts.Clients.IMerchantSignUpWebApiClient merchantSignUpWebApiClient, IRolesHelper rolesHelper , ISettings settings )
        {
            _authenticationHelper = authHelper;
            _loginHelper = loginHelper;
            _sbc = sbc;
            _currentUserHelper = currentUserHelper;
            _contextSwitcher = contextSwitcher;
            _userHelper = userHelper;
            _passwordHelper = passwordHelper;
            _merchantSignUpWebApiClient = merchantSignUpWebApiClient;
            _rolesHelper = rolesHelper;
            _settings = settings;
        }

        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            if ( filterContext.HttpContext != null && filterContext.HttpContext.Request.HttpMethod == "GET" )
            {
                ModelState.Clear();
            }
            base.OnActionExecuted(filterContext);
        }

        // GET: /Auth/
        public ActionResult Index(LoginUser login)
        {
            var cUser = _currentUserHelper.GetCurrentUser();
            login = login ?? new LoginUser();
            login.EmailAddress = (string.IsNullOrEmpty(login.EmailAddress) && cUser != null) ? cUser.EmailAddress : login.EmailAddress;
         
            return View(login);
        }

        [HttpPost]
        public async Task<ActionResult> Login(LoginUser login)
        {
            if (string.IsNullOrEmpty(login.EmailAddress  ) || string.IsNullOrEmpty(login.Password))
            {
                if (string.IsNullOrEmpty(login.EmailAddress))
                    ModelState.AddModelError("EmailAddress", "Please enter your user EmailAddress");
                if (string.IsNullOrEmpty(login.Password))
                    ModelState.AddModelError("Password", "Please enter your Password!");

                return View("Index");
            }

            try
            {
                // If the user authenticates, redirect them to the admin app
                var tenants =  _loginHelper.VolusionLogIn(login);

                if (tenants.Skip(1).Any()) // more than 1
                {
                    var contexts = Mapper.Map<List<TaContext>>(tenants);
                    // Launch Pad with Tenant Names
                    return View("Roles", contexts);
                }
                if (tenants.Any())
                {
                    // Auto login to tenant
                    var taContext = tenants.First();
                   
                    var tenant = await _contextSwitcher.ChangeTenant(taContext.Id);
                    if (tenant != null)
                    {
                        if (_settings.AppSettings("useTenantDomainNames") == "true")
                        {
                            return Redirect(string.Format("http://{0}/admin", tenant.Domain.DomainName));
                        }
                        else
                        {
                            return Redirect("/admin");
                        }
                    }
                    return null;
                }

                ModelState.AddModelError("General", "You don't have access to any sites.");
                return View("Index");
            }
            catch (AggregateException exception)
            {
                // Otherwise, send the login error message
                ModelState.AddModelError("General", exception.UnwrapAgg().Message);

                return View("Index");
            }
        }

        public ActionResult ForgotPassword()
        {
            return View();
        }

        [HttpPost]
        public JsonResult ForgotPassword(LoginUser user)
        {
            try
            {
                _passwordHelper.CreatePasswordResetRequest(user.EmailAddress );

                return new JsonResult { Data = true };
            }
            catch (Exception)
            {
                return new JsonResult { Data = false };
            }
        }

        public ActionResult NewAccountInvitation(LoginUser user)
        {
            if (user.SiteId.GetValueOrDefault() != _sbc.SiteId)
            {
                _sbc.SiteId = user.SiteId.GetValueOrDefault();
                _sbc.TenantId = user.TenantId.GetValueOrDefault();
                _sbc.Save();
                return this.Redirect(ControllerContext.HttpContext.Request.Url.PathAndQuery);
            }
            
            if (_userHelper.UserExists(user))
            {
                return RedirectToRoute("login",  user);
            }
             
            return View(user);
        }

        [HttpPost ]
        public async Task<ActionResult> NewAccountInvitation(LoginUser user, FormCollection form)
        {
            if (string.IsNullOrEmpty(user.Password))
            {
                if (string.IsNullOrEmpty(user.Password))
                    ModelState.AddModelError("Password", "Please enter your password!");

                return View();
            }

            // If the user authenticates, redirect them to the admin app
            try
            {
                var tenants =  _loginHelper.VolusionLogIn(user);
                var contexts = Mapper.Map<List<TaContext>>(tenants);
                if (tenants.Skip(1).Any()) // checking for "greater than 1" without enumerating the collection
                {
                    return View("Roles", contexts);
                }

                throw new NotImplementedException();
               // var site = await _contextSwitcher.ChangeSite(contexts.First().Id);
                //if (site != null)
                //{
                //    return Redirect("/admin");
                //}
            }
            catch (AggregateException exception)
            {
                var message = exception.UnwrapAgg().Message;
                ModelState.AddModelError("General", message);
            }

            // Otherwise, send the login error message
            ModelState.AddModelError("General", "Authentication failed!");

            return View();
        }

        public ActionResult ResetPassword(string validationToken, string userId )
        {
            var user = new LoginUser();
            user.ConfirmationCode = validationToken;
            var userObj = _userHelper.GetUser(userId);

            if ( userObj == null )
            {
                //tbd error.
            }
            user.EmailAddress = userObj.EmailAddress;

            return View(user);
        }

        public ActionResult Launchpad()
        {
            var userId = _authenticationHelper.GetCurrentUser().UserId;
            var res = _rolesHelper.SiteRolesList(userId);
            return View("Roles", res);
        }

        [HttpPost]
        public async Task<ActionResult> ResetPassword(LoginUser user , FormCollection col)
        {
            _passwordHelper.UpdateForgottenPassword(user);
            return await Login(user);
        }

        public ActionResult DeleteRole(int siteId, int roleId)
        {
            _rolesHelper.RemoveRoleFromSite(siteId, roleId);
            return new JsonResult
                       {
                           Data = true,
                           JsonRequestBehavior = JsonRequestBehavior.AllowGet
                       };
        }

        public async Task<ActionResult> ChangeTenant(int id)
        {
            var tenant = await _contextSwitcher.ChangeTenant(id);
            if (tenant != null)
            {
                if (_settings.AppSettings("useTenantDomainNames") == "true")
                {
                    return Redirect(string.Format("http://{0}/admin", tenant.Domain.DomainName));
                }
                else
                {
                    return Redirect("/admin");
                }
              
            }
            return View("Login");
        }


        public ActionResult Logout()
        {
            _authenticationHelper.LogOut();
            return Redirect("/admin/auth");
        }
    }
}
