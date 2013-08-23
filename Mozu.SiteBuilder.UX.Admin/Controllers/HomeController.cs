using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.Tenant.Contracts.Clients;
using System.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    [Mozu.SiteBuilder.UX.Admin.Filters.SiteBuilderAuthorize]
    [Mozu.SiteBuilder.Mvc.ActionFilters.AddCorrelationHeaderFilter]
    public class HomeController : Controller
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        private readonly ITenantsWebApiClient _tenantsWebApi;
        
        private readonly IApiContext _apiContext;
        private readonly IMultiScopeAdminUserWebApiClient _usersRepo;
        private readonly ISettings _settings;
        private readonly HttpContextBase _httpContext;
        private readonly IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;
        private ILogger _log;

        public HomeController(IMultiScopeAdminUserWebApiClient usersRepo, IAuthenticationHelper authHelper, ISiteBuilderContext sbc, ITenantsWebApiClient tenantsWebApi, IApiContext apiContext, ISettings settings, HttpContextBase httpContext, Mozu.AdminUser.Contracts.Clients.IMultiScopeAdminUserWebApiClient adminUserWebApiClient)
        {
            _usersRepo = usersRepo.CloneWithoutUserClaims();
            _authenticationHelper = authHelper;
            _sbc = sbc;
            _apiContext = apiContext;
            _tenantsWebApi = tenantsWebApi.CloneWithoutUserClaims();//  .CloneWithApiContext(x => x.UserClaims = LightweightUserClaims.CreateForSystemUser(UserScopeType.SystemAdmin));
            
            _settings = settings;
            _httpContext = httpContext;
            _adminUserWebApiClient = adminUserWebApiClient;

            _log = LoggingService.LoggerFor<HomeController>();
        }

        // GET: /Home/
        public async Task<ActionResult> Index()
        {

            var userDC = (await _adminUserWebApiClient.GetUser(_apiContext.UserClaims.UserId, UserScopeType.Tenant.ToString(), _apiContext.TenantId  )).ReadAsSync();
            var user = new Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User()
                           {
                               BehaviorIds = _apiContext.UserClaims.BehaviorIds,
                               EmailAddress = userDC.EmailAddress,
                               FirstName = userDC.FirstName,
                               LastName = userDC.LastName,
                               Id = _apiContext.UserClaims.UserId
                           };
          
           
           
            var roles = GetUserSitesRoles(_apiContext.UserClaims.UserId );
            var tenantRes = await _tenantsWebApi.GetTenant( _apiContext.TenantId);
           // var siteCol = _tenantsWebApi.AsBreadthFirstEnumerable();

            var siteUsers = await _usersRepo.GetUsers(scopeType :UserScopeType.Tenant.ToString(),scopeId : _apiContext.TenantId,pageSize: 200, startIndex:0);


           

            var tenant = tenantRes.ReadAsSync();

            //if (roles.IsNullOrEmpty())
            //{
            //    _authenticationHelper.LogOut();
            //}
           // var sites = siteRes.ReadAsSync();

           // var site = new Mozu.Tenant.Contracts.Site();

            var taContext = AutoMapper.Mapper.Map<TaContext>(tenant);

            this.ViewData["localizationValues"] = new LocalizationController(_httpContext).GetStrings();
            this.ViewData["taContext"] = taContext;
            this.ViewData["user"] = user;
            this.ViewData["siteRoles"] = roles;

            this.ViewData["authCookieDomain"] = _settings.AppSettings("authCookieDomain");
            
            this.ViewData["extlocalefile"] = GetExtLocaleFile(Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName);
            this.ViewData["useGoogleAnalytics"] = System.Configuration.ConfigurationManager.AppSettings["useGoogleAnalytics"];
            this.ViewData["googleAnalyticsAccount"] = System.Configuration.ConfigurationManager.AppSettings["googleAnalyticsAccount"];
            this.ViewData["siteUsers"] = siteUsers.ReadAsSync().Items;

            this.ViewData["extlib"] = (string)((_httpContext.Request.Cookies.Get("debugExt") != null && _httpContext.Request.Cookies.Get("debugExt").Value == "true") ? "ext-all-dev.js" : "ext-all.js");
         
            if (this.HttpContext.Request["testHarnessMode"] == "true")
            {
                return View("TestHarnes");
            }
            if (System.Configuration.ConfigurationManager.AppSettings["use_compiled_taco"] == "true")
            {
                return View("Index_Compiled");
            }

            return View();
        }

        public List<UserRole> GetUserSitesRoles(string userId)
        {
            var res = _usersRepo.GetUserRoles(userId, scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId).Result;

            // var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
            // var res = rootUserRepo.GetUser(userId, null).Result;
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return res.ReadAsSync().Items;
            }
           
            return new List<Core.Api.Contracts.UserRole>();

        }


        private static string GetExtLocaleFile(string language)
        {
            const string filename = "ext-lang-{0}.js";

            switch(language.ToLower())
            {
                case "de":
                    return string.Format(filename, "de");
                default:
                    return string.Format(filename, "en");
            }
        }
    }
}
