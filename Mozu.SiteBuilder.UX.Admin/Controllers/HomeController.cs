using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Razor;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Settings;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Filters;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.Tenant.Contracts.Clients;
using DCproduct = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
 
//    [Mozu.SiteBuilder.Mvc.ActionFilters.AddCorrelationHeaderFilter]
   

    public class HomeController : AdminApiControllerBase 
    {
       
        private readonly IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        private readonly ITenantsWebApiClient _tenantsWebApi;
        
        private readonly IApiContext _apiContext;
        private readonly IMultiScopeAdminUserWebApiClient _usersRepo;
        private readonly ISettings _settings;
        private readonly HttpContextBase _httpContext;
        private readonly IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;
        private readonly ITenants2WebApiClient _tenants2WebApiClient;
        private ISiteGroupWebApiClient _siteGroupClient;

        public HomeController(IMultiScopeAdminUserWebApiClient usersRepo, IAuthenticationHelper authHelper, ISiteBuilderContext sbc, ITenantsWebApiClient tenantsWebApi, IApiContext apiContext, ISettings settings, HttpContextBase httpContext, Mozu.AdminUser.Contracts.Clients.IMultiScopeAdminUserWebApiClient adminUserWebApiClient, ISiteGroupWebApiClient siteGroupClient, ITenants2WebApiClient tenants2WebApiClient)
        {
            _usersRepo = usersRepo.CloneWithoutUserClaims();
            _authenticationHelper = authHelper;
            _sbc = sbc;
            _apiContext = apiContext;
            _tenantsWebApi = tenantsWebApi.CloneWithoutUserClaims();//  .CloneWithApiContext(x => x.UserClaims = LightweightUserClaims.CreateForSystemUser(UserScopeType.SystemAdmin));
            
            _settings = settings;
            _httpContext = httpContext;
            _adminUserWebApiClient = adminUserWebApiClient;
            _tenants2WebApiClient = tenants2WebApiClient;
            _siteGroupClient = siteGroupClient.CloneWithoutUserClaims();
        }

        
        // GET: /Home/

        [HttpGet()]
        public async Task<ActionResult> Index()
        {
            var userDcTask = _adminUserWebApiClient.GetUser(_apiContext.UserClaims.UserId, UserScopeType.Tenant.ToString(), _apiContext.TenantId);
            var rolesTask = GetUserSitesRoles(_apiContext.UserClaims.UserId);
            var tenantTask = _tenantsWebApi.GetTenant( _apiContext.TenantId );

            var tenantTask2 = _tenants2WebApiClient.GetTenant(_apiContext.TenantId);

            var siteUsersTask = _usersRepo.GetUsers(scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId, pageSize: 200, startIndex: 0);
            
            // TODO: the siteGroup service is not ready. We mock it.
            Task<ServiceClientResponse<DCproduct.SiteGroupCollection>> siteGroupsTask;
             siteGroupsTask = _siteGroupClient.GetSiteGroups();

             await Task.WhenAll(new Task[] { userDcTask, rolesTask, tenantTask, siteUsersTask, siteGroupsTask, tenantTask2 });

            //var tenants2 = tenantTask2.Result.ReadAsSync();
            

            var userDC = userDcTask.Result.ReadAsSync();
            var roles = rolesTask.Result;
            var tenant = tenantTask.Result.ReadAsSync();
            var siteUsers = siteUsersTask.Result.ReadAsSync();
            var siteGroups = siteGroupsTask.Result.ReadAsSync();

            var user = new Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User()
            {
                BehaviorIds = _apiContext.UserClaims.BehaviorIds,
                EmailAddress = userDC.EmailAddress,
                FirstName = userDC.FirstName,
                LastName = userDC.LastName,
                Id = _apiContext.UserClaims.UserId
            };

            var taContext = AutoMapper.Mapper.Map<TaContext>(tenant);
            AutoMapper.Mapper.Map(siteGroups, taContext);

            this.ViewData["localizationValues"] = new LocalizationController(_httpContext).GetStrings();
            this.ViewData["taContext"] = taContext;
            this.ViewData["user"] = user;
            this.ViewData["siteRoles"] = roles;

            this.ViewData["authCookieDomain"] = _settings.AppSettings("authCookieDomain");
            
            this.ViewData["extlocalefile"] = GetExtLocaleFile(Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName);
            this.ViewData["useGoogleAnalytics"] = System.Configuration.ConfigurationManager.AppSettings["useGoogleAnalytics"];
            this.ViewData["googleAnalyticsAccount"] = System.Configuration.ConfigurationManager.AppSettings["googleAnalyticsAccount"];
            this.ViewData["siteUsers"] = siteUsers.Items;

            this.ViewData["extlib"] = (string)((_httpContext.Request.Cookies.Get("debugExt") != null && _httpContext.Request.Cookies.Get("debugExt").Value == "true") ? "ext-all-dev.js" : "ext-all.js");
         
            if (this.HttpContext.Request["testHarnessMode"] == "true")
            {
                return RazorView("TestHarnes");
            }
            if (System.Configuration.ConfigurationManager.AppSettings["use_compiled_taco"] == "true")
            {
                return RazorView("Index_Compiled");
            }

            return RazorView("index");
            
        }

        public Task<List<UserRole>> GetUserSitesRoles(string userId)
        {
            return _usersRepo.GetUserRoles(userId, scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId)
                .ContinueWith(t => {
                    if (t.Result.ResponseMessage.IsSuccessStatusCode)
                        return t.Result.ReadAsSync().Items;
                    else
                        return new List<Core.Api.Contracts.UserRole>();
                });
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
