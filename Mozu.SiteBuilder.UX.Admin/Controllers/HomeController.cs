using System.Collections.Generic;
using System.Net;
using System.Threading;
using System.Web.Mvc;
using Mozu.Core;
using System.Linq;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.Mvc.Providers;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.Tenant.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.UX.Admin.Filters;
using AccountApi = Mozu.SiteBuilder.UX.Admin.Api.AccountController;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
    [SiteBuilderAuthorize]
    public class HomeController : Controller
    {
        private readonly AccountApi _accountApi;
        private IAuthenticationHelper _authenticationHelper;
        private ISiteBuilderContext _sbc;
        private readonly ITenantsWebApiClient _tenantsWebApi;
        private readonly IApiContext _apiContext;
        private readonly ITaContextProvider _taContextProvider;

        public HomeController( AccountApi accountApi, AuthenticationHelper authHelper, ISiteBuilderContext sbc, ITenantsWebApiClient  tenantsWebApi, IApiContext apiContext, ITaContextProvider taContextProvider)
        {
            _authenticationHelper = authHelper;
            _accountApi = accountApi;
            _sbc = sbc;
            _apiContext = apiContext;
            _taContextProvider = taContextProvider;
            _tenantsWebApi = tenantsWebApi;
        }
        //
        // GET: /Home/
        public ActionResult Index()
        {
            var user = _accountApi.GetCurrentUser();
            var roles = _accountApi.GetUserSitesRoles(user.Id);
            var tenantRes = _tenantsWebApi.GetTenant( _apiContext.TenantId).Result;
           // var siteCol = _tenantsWebApi.AsBreadthFirstEnumerable();




            if (tenantRes.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                _accountApi.Logoff();
            }

            var tenant = tenantRes.ReadAsSync();

            if (roles.IsNullOrEmpty())
            {
                _accountApi.Logoff();
            }
           // var sites = siteRes.ReadAsSync();

           // var site = new Mozu.Tenant.Contracts.Site();

            var taContext = new TaContext()
                                {
                                    TenantId = tenant.Id,
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
