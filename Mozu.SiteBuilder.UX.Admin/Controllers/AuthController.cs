using System;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Mvc;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    public class AuthController : Controller
    {
        private readonly IAccountController _accountApi;
        private IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        public AuthController(IAccountController accountApi, IAuthenticationHelper authHelper, ISiteBuilderContext sbc)
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
                var tenants = res.Items;

                if (tenants.Count == 0)
                {
                    ModelState.AddModelError("General", "You don't have access to any sites.");
                    return View("Index");
                }

                if (tenants.Count == 1)
                {
                    // Auto login to tenant
                    var taContext = tenants.First();

                    var tenant = await _accountApi.ChangeTenant(taContext.TenantId);
                    if (tenant != null)
                    {
                        return Redirect("/admin");
                    }
                    return null;
                }

                if (tenants.Count > 0)
                {
                    // Launch Pad with Tenant Names
                    return View("Roles", tenants);
                }

                return Redirect("/admin");
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
            
            if ( _accountApi.UserExists ( user ))
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
            var res = await _accountApi.VolusionLogIn(user);

            if (res.Success)
            {
                if (res.Items.Count > 1)
                {
                    return View("Roles", res.Items);
                }

                var site = await _accountApi.ChangeSite(res.Items.First().TenantId);
                if (site != null)
                {
                    return Redirect("/admin");
                }
            }

            // Otherwise, send the login error message
            ModelState.AddModelError("General", "Authentication failed!");

            return View();
        }

        public ActionResult ResetPassword(string validationToken, string userId )
        {
            var user = new LoginUser();
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
            _accountApi.RemoveRoleFromSite(siteId, roleId);
            return new JsonResult
                       {
                           Data = true,
                           JsonRequestBehavior = JsonRequestBehavior.AllowGet
                       };
        }

        public async Task<ActionResult> ChangeTenant(int id)
        {
            var tenant = await _accountApi.ChangeTenant(id);
            if (tenant != null)
            {
                return Redirect("/admin");
            }
            return View("Login");
        }

/*
 * NOTE: No longer used since login attempts are made against Tenant.  (Missal 02/06/13)
 * 
        public async Task<ActionResult> ChangeRole(int id)
        {
            var site = await _accountApi.ChangeSite(id);
            if (site != null)
            {
                //todo: look in config
                //return RedirctDomain(site,site.TenantId, "/admin" , _authenticationHelper.GetCurrentTicket());

                var ticket = _authenticationHelper.GetCurrentTicket();
                _authenticationHelper.SetCurrentUser(ticket);
                _sbc.TenantId = id;
                _sbc.SiteId = _authenticationHelper.GetCurrentUser().SiteId.GetValueOrDefault(-1);
                _sbc.Save();

                return Redirect("/admin");
            }
            ModelState.AddModelError("General", "Authentication failed!");
            return View("Login");
        }
*/

/*
 * Note: No longer used. Keep around for a little longer to save time from looking back in history if any issues arise.  (Missal 02/06/13)
 * 
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
*/

/*
 * Note: No longer used. Keep around for just a bit in case we want to look back in history quicker.  (Missal 02/06/13)
 * 
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
*/

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
                return Redirect("/admin");
            }
            return View(user);
        }

        public ActionResult Logout()
        {
            var logout = _accountApi.Logoff();
            return Redirect("/admin/auth");
        }
    }
}
