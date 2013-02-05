using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Mvc;
using Mozu.Tenant.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;

using UserAuthTicket = Mozu.Core.Api.Contracts.UserAuthTicket;
using AccountApi = Mozu.SiteBuilder.UX.Admin.Api.AccountController;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    public class AuthController : Controller
    {
        private readonly AccountApi _accountApi;
        private IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        public AuthController(AccountApi accountApi, IAuthenticationHelper authHelper ,ISiteBuilderContext sbc  )
        {
            _authenticationHelper = authHelper;
            _accountApi = accountApi;
            _sbc = sbc;

        }

        protected override void OnActionExecuted(ActionExecutedContext filterContext)
        {
            if ( filterContext.HttpContext != null && filterContext.HttpContext.Request.HttpMethod == "GET" )
            {
                ModelState.Clear();
            }
            base.OnActionExecuted(filterContext);
        }

        //
        // GET: /Auth/
        public ActionResult Index(LoginUser login)
        {
            var cUser = _accountApi.GetCurrentUser();
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

            
            // If the user authenticates, redirect them to the admin app
            var res = await _accountApi.VolusionLogIn(login);

            if(res.Success)
            {
                if ( res.Items.Count ==0 )
                {
                    ModelState.AddModelError("General", "you dont have access to any sites");
                    return View("Index");
                }
                else if (res.Items.Count > 1)
                {
                    return View("Roles", res.Items);
                }
                else
                {
                    var site = await _accountApi.ChangeSite(res.Items.First().Item1.Id );
                    if (site != null)
                    {
                        //todo look in config;
                        return RedirctDomain(site, site.TenantId, "/admin", _authenticationHelper.GetCurrentTicket());
                    }
                }
                
                //return RedirectToAction("Index", "Home");
            }

            // Otherwise, send the login error message
            ModelState.AddModelError("General", "Authentication failed!");

            return View("Index");
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
                _accountApi.CreatePasswordResetRequest(user.EmailAddress );
                return new JsonResult()
                           {
                               Data = true,

                           };
            }

            catch (Exception)
            {

                return new JsonResult()
                           {
                               Data = false,

                           };
            }
        }






        public ActionResult NewAccountInvitation(LoginUser user)
        {
            if (user.SiteId.GetValueOrDefault( ) != _sbc.SiteId )
            {
                _sbc.SiteId = user.SiteId.GetValueOrDefault();
                _sbc.TenantId = user.TenantId.GetValueOrDefault();
                _sbc.Save();
                return this.Redirect(ControllerContext.HttpContext.Request.Url.PathAndQuery);
            }
            
            if ( _accountApi.UserExists ( user ))
            {
                return RedirectToRoute("login",  user);
            }
             
            return View(user);
        }
        [HttpPost ]
        public async Task<ActionResult> NewAccountInvitation(LoginUser user, FormCollection form)
        {

            if (string.IsNullOrEmpty(user.Password ))
            {
                
                if (string.IsNullOrEmpty(user.Password))
                    ModelState.AddModelError("Password", "Please enter your password!");
                return View();
            }

            // If the user authenticates, redirect them to the admin app
            var res = await _accountApi.VolusionLogIn(user);

            if (res.Success)
            {
                if (res.Items.Count > 1)
                {
                    return View("Roles", res.Items);
                }
                else
                {
                    var site = await _accountApi.ChangeSite(res.Items.First().Item1.Id);
                    if (site != null)
                    {
                        return RedirctDomain(site, site.TenantId, "/admin", _authenticationHelper.GetCurrentTicket());

                    }
                }

                //return RedirectToAction("Index", "Home");
            }

            // Otherwise, send the login error message
            ModelState.AddModelError("General", "Authentication failed!");

            return View();
        }

        public ActionResult ResetPassword(string validationToken, string userId )
        {
            LoginUser user = new LoginUser();
            user.ConfirmationCode = validationToken;
            var userObj = _accountApi.GetUser(userId);

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
            var res = _accountApi.SiteRolesList(userId);
            return View("Roles", res);
        }

        [HttpPost]
        public async Task<ActionResult> ResetPassword(LoginUser user , FormCollection col)
        {
            _accountApi.UpdateForgottenPassword(user);
            return await Login(user);
        }

        public ActionResult DeleteRole ( int siteId, int roleId)
        {
            var res = _accountApi.RemoveRoleFromSite(siteId, roleId);
            return new JsonResult()
                       {
                           Data = true,
                           JsonRequestBehavior = JsonRequestBehavior.AllowGet
                       };
        }

        public async Task<ActionResult> ChangeRole(int id)
        {
            var site = await _accountApi.ChangeSite(id);
            if (site != null)
            {
                //todo: look in config
                return RedirctDomain(site,site.TenantId, "/admin" , _authenticationHelper.GetCurrentTicket());
            }
            ModelState.AddModelError("General", "Authentication failed!");
            return View("Login");
        }

        ActionResult RedirctDomain (Site site, int tenantId , string url , UserAuthTicket ticket  )
        {
            
            //todo: move to di   
            if ( System.Configuration.ConfigurationManager.AppSettings ["useSiteDomainNames"] != "true")
            {
                _authenticationHelper.SetCurrentUser(ticket);
                _sbc.TenantId = tenantId;
                _sbc.SiteId = (int)_authenticationHelper.GetCurrentUser().SiteId;
                _sbc.Save();
                return this.Redirect(url);
            }
            throw new NotImplementedException("useSiteDomainNames  feature removed");
            //var zone = System.Configuration.ConfigurationManager.AppSettings["dnszone"];
            //var domain = (site.Domains ?? new List<Domain>()).FirstOrDefault(x => x.IsPrimary && x.FullName.EndsWith(zone, StringComparison.OrdinalIgnoreCase)) ?? site.AssignedDomain;
            //var host = domain.FullName;

            //return Content(
            //    string.Format("<html><body><form method=\"post\" id=\"ssoform\" action=\"http://{0}/admin/auth/SSORedirect\"><input type=\"hidden\"  name=\"url\" value=\"{1}\" /><input type=\"hidden\"  name=\"accessToken\" value=\"{2}\" /><input type=\"hidden\"  name=\"refreshToken\" value=\"{3}\" /><input type=\"hidden\"  name=\"profileToken\" value=\"{4}\" /><input type=\"hidden\"  name=\"accessTokenExpire\" value=\"{5}\" /><input type=\"hidden\"  name=\"refreshTokenExpire\" value=\"{6}\" /><input type=\"hidden\"  name=\"tenantId\" value=\"{7}\" /><input id=\"continue_btn\" type=\"submit\" value=\"continue\" /></form><script>document.getElementById('continue_btn').style.visibility = 'hidden';document.forms['ssoform'].submit()</script></body></form>",
            //    host, 
            //    url,
            //    ticket.AccessToken ,
            //    ticket.RefreshToken ,
            //    ticket.ProfileToken ,
            //    ticket.AccessTokenExpiration.Ticks.ToString("X2"),
            //    ticket.RefreshTokenExpiration.Ticks.ToString("X2"),
            //     tenantId
                
            //    )
                
            //    );
        }
        [HttpPost ]
        public ActionResult SSORedirect(string url, string accessToken, string refreshToken, string profileToken, string accessTokenExpire, string refreshTokenExpire, int tenantId)
        {
            var ticket = new UserAuthTicket()
                            {
                                AccessToken = accessToken,
                                RefreshToken = refreshToken,
                                ProfileToken = profileToken,
                                AccessTokenExpiration = new DateTime(Int64.Parse(accessTokenExpire, NumberStyles.HexNumber)),
                                RefreshTokenExpiration = new DateTime(Int64.Parse(refreshTokenExpire, NumberStyles.HexNumber))
                            };
            _authenticationHelper.SetCurrentUser(ticket);
            _sbc.TenantId = tenantId;
            _sbc.SiteId = (int)_authenticationHelper.GetCurrentUser().SiteId;
            _sbc.Save();

            return this.Redirect(url);
        }

        public ActionResult Register()
        {
            return View();
        }


        [HttpPost]
        public ActionResult Register(LoginUser user, FormCollection collection)
        {
            if (ModelState.IsValidField("SiteName") && ModelState.IsValidField("EmailAddress") && ModelState.IsValidField("Password"))
            {
                var reg = _accountApi.Register(user);
                return new RedirectResult("/admin");
            }
            return View(user);
        }

        public ActionResult Logout()
        {
            var logout = _accountApi.Logoff();
            return new RedirectResult("/admin/auth");
            
           
        }
    }
}
