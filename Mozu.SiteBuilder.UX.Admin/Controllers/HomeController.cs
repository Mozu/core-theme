using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Web.Mvc;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using System.Linq;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Filters;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    [SiteBuilderAuthorize]
    public class HomeController : Controller
    {
        private readonly IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        private readonly ITenantsWebApiClient _tenantsWebApi;
        private readonly ICurrentUserHelper _currentUserHelper;
        private readonly IApiContext _apiContext;
        private readonly IAdminUserWebApiClient _usersRepo;

        public HomeController(IAdminUserWebApiClient usersRepo, AuthenticationHelper authHelper, ISiteBuilderContext sbc, ITenantsWebApiClient tenantsWebApi, ICurrentUserHelper currentUserHelper, IApiContext apiContext)
        {
            _usersRepo = usersRepo;
            _authenticationHelper = authHelper;
            _sbc = sbc;
            _apiContext = apiContext;
            _tenantsWebApi = tenantsWebApi;
            _currentUserHelper = currentUserHelper;
        }

        // GET: /Home/
        public ActionResult Index()
        {
            var user = _currentUserHelper.GetCurrentUser();
            var roles = GetUserSitesRoles(user.Id);
            var tenantRes = _tenantsWebApi.GetTenant( _apiContext.TenantId).Result;
           // var siteCol = _tenantsWebApi.AsBreadthFirstEnumerable();




            if (tenantRes.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                _authenticationHelper.LogOut();
            }

            var tenant = tenantRes.ReadAsSync();

            if (roles.IsNullOrEmpty())
            {
                _authenticationHelper.LogOut();
            }
           // var sites = siteRes.ReadAsSync();

           // var site = new Mozu.Tenant.Contracts.Site();

            var taContext = new TaContext()
                                {
                                    TenantId = tenant.Id,
                                    Name=tenant.Name ,
                                    SiteCollections = tenant.SiteGroups.Select(sg =>
                                                                               new TaContextSiteCollection()
                                                                                   {
                                                                                       Id= sg.Id,
                                                                                       Name=sg.Name ,
                                                                                       Sites = sg.Sites.Select(site=>
                                                                                        new TaContextSite(){
                                                                                                Id = site.Id,
                                                                                                Name = site.Name,
                                                                                                StagingHost = site.Domains.Where( x=> x.IsSystemAssigned ).Select(x=>x.DomainName).FirstOrDefault()
                                                                                                
                                                                                        }

                                                                                       ).ToList() 
                                                                                   }
                                        ).ToList() 
                                };
                                   


            this.ViewData["taContext"] = taContext;
            this.ViewData["user"] = user;
            this.ViewData["siteRoles"] = roles;
            
            this.ViewData["extlocalefile"] = GetExtLocaleFile(Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName);
            this.ViewData["useGoogleAnalytics"] = System.Configuration.ConfigurationManager.AppSettings["useGoogleAnalytics"];
            this.ViewData["googleAnalyticsAccount"] = System.Configuration.ConfigurationManager.AppSettings["googleAnalyticsAccount"];
            this.ViewData["site"] = new Mozu.Tenant.Contracts.Site()
                                        {
                                            Name = "xxx",
                                            Id = 123,
                                            TenantId = 123

                                        };
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

        public List<Role> GetUserSitesRoles(string userId)
        {
            var res = _usersRepo.GetUserRoles(userId, null).Result;

            // var rootUserRepo = new AdminUserWebApiClient(new ServiceClientMessageHandler2(new ApiContext() { SiteId = VOLUSIONSITEID, TenantId = VOLUSIONTENANTID }));
            // var res = rootUserRepo.GetUser(userId, null).Result;
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                return res.ReadAsSync().Items;
            }

            return new List<Core.Api.Contracts.Role>();

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
