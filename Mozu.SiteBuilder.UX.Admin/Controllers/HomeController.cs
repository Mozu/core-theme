using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Mvc;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.Tenant.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    [Mozu.SiteBuilder.UX.Admin.Filters.SiteBuilderAuthorize]
    [Mozu.SiteBuilder.Mvc.ActionFilters.AddCorrelationHeaderFilter]
    public class HomeController : Controller
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        private readonly ITenantsWebApiClient _tenantsWebApi;
        private readonly ICurrentUserHelper _currentUserHelper;
        private readonly IApiContext _apiContext;
        private readonly IMultiScopeAdminUserWebApiClient _usersRepo;
        private readonly ISettings _settings;
        private ILogger _log;

        public HomeController(IMultiScopeAdminUserWebApiClient usersRepo, AuthenticationHelper authHelper, ISiteBuilderContext sbc, ITenantsWebApiClient tenantsWebApi, ICurrentUserHelper currentUserHelper, IApiContext apiContext, ISettings settings)
        {
            _usersRepo = usersRepo;
            _authenticationHelper = authHelper;
            _sbc = sbc;
            _apiContext = apiContext;
            _tenantsWebApi = tenantsWebApi;
            _currentUserHelper = currentUserHelper;
            _settings = settings;

            _log = LoggingService.LoggerFor<HomeController>();
        }

        // GET: /Home/
        public async Task<ActionResult> Index()
        {
            _log.Debug("hello!");
            var user = _currentUserHelper.GetCurrentUser();
            var roles = GetUserSitesRoles(_authenticationHelper.GetCurrentUser().UserId);
            var tenantRes = await _tenantsWebApi.GetTenant( _apiContext.TenantId);
           // var siteCol = _tenantsWebApi.AsBreadthFirstEnumerable();

            var siteUsers = await _usersRepo.GetUsers(scopeType :UserScopeType.Tenant.ToString(),scopeId : _apiContext.TenantId,pageSize: 200, startIndex:0);


            if (tenantRes.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                _authenticationHelper.LogOut();
            }

            var tenant = tenantRes.ReadAsSync();

            //if (roles.IsNullOrEmpty())
            //{
            //    _authenticationHelper.LogOut();
            //}
           // var sites = siteRes.ReadAsSync();

           // var site = new Mozu.Tenant.Contracts.Site();

            var taContext = AutoMapper.Mapper.Map<TaContext>(tenant);


            this.ViewData["taContext"] = taContext;
            this.ViewData["user"] = user;
            this.ViewData["siteRoles"] = roles;

            this.ViewData["authCookieDomain"] = _settings.AppSettings("authCookieDomain");
            
            this.ViewData["extlocalefile"] = GetExtLocaleFile(Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName);
            this.ViewData["useGoogleAnalytics"] = System.Configuration.ConfigurationManager.AppSettings["useGoogleAnalytics"];
            this.ViewData["googleAnalyticsAccount"] = System.Configuration.ConfigurationManager.AppSettings["googleAnalyticsAccount"];
            this.ViewData["siteUsers"] = siteUsers.ReadAsSync().Items;
         
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
