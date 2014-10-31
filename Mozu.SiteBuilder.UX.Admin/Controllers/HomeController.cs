using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using AutoMapper;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Contracts.Provisioning;
using Mozu.Core.Logging;
using Mozu.Core.Money;
using Mozu.Core.Settings;
using Mozu.MZDB.Contracts;
using Mozu.MZDB.Contracts.Clients;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using DCproduct = Mozu.ProductAdmin.Contracts;
using IProvisioningWebApiClient = Mozu.Content.Contracts.Clients.IProvisioningWebApiClient;
using User = Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Entities;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
//    [Mozu.SiteBuilder.Mvc.ActionFilters.AddCorrelationHeaderFilter]


    public class HomeController : AdminApiControllerBase
    {
        private readonly IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;
        private readonly IApiContext _apiContext;
        private readonly IAuthenticationHelper _authenticationHelper;
        private readonly IEntityListsWebApiClient _entityListsWebApiClient;
        private readonly HttpContextBase _httpContext;
        private readonly ILogger _logger;

        private readonly IMasterCatalogWebApiClient _masterCatalogClient;
        private readonly ISettings _settings;
        private readonly ITenantsWebApiClient _tenantsWebApi;
        private readonly IMultiScopeAdminUserWebApiClient _usersRepo;

        public HomeController(IMultiScopeAdminUserWebApiClient usersRepo, IAuthenticationHelper authHelper, ITenantsWebApiClient tenantsWebApi, IApiContext apiContext, ISettings settings, HttpContextBase httpContext, IMultiScopeAdminUserWebApiClient adminUserWebApiClient, IMasterCatalogWebApiClient masterCatalogClient, ILogger logger, IEntityListsWebApiClient entityListsWebApiClient)
        {
            _logger = logger;
            _entityListsWebApiClient = entityListsWebApiClient.CloneWithoutUserClaims().CloneWithApiContext(x =>
            {
                x.SiteId = null;
                x.CatalogId = null;
                x.MasterCatalogId = null;
            });


            _usersRepo = usersRepo.CloneWithoutUserClaims();
            _authenticationHelper = authHelper;
            //_sbc = sbc;
            _apiContext = apiContext;
            _tenantsWebApi = tenantsWebApi.CloneWithoutUserClaims(); //  .CloneWithApiContext(x => x.UserClaims = LightweightUserClaims.CreateForSystemUser(UserScopeType.SystemAdmin));

            _settings = settings;
            _httpContext = httpContext;
            _adminUserWebApiClient = adminUserWebApiClient.CloneWithoutUserClaims();

            _masterCatalogClient = masterCatalogClient.CloneWithoutUserClaims();
        }


        // GET: /Home/
        [HttpGet]
        public async Task<HttpResponseMessage> Index()
        {
            try
            {
                ActionResult res = await GetIndex();
                return Request.CreateResponse(HttpStatusCode.OK, res);
            }
            catch (Exception ex)
            {
                if (ConfigurationManager.AppSettings["use_compiled_taco"] == "true")
                {
                    throw;
                }
                _logger.Error("error loading admin", ex);
                HttpResponseMessage redir = Request.CreateResponse(HttpStatusCode.Redirect);
                redir.Headers.Location = new Uri("/admin/auth/launchpad", UriKind.Relative);
                return redir;
            }
        }

        //[HttpGet()]
        //public async Task<RazorViewResult> Mock(string id)
        //{

        //    var tc = new TestContext();
        //    this.ViewData["localizationValues"] = new LocalizationController(_httpContext).GetStrings();
        //    this.ViewData["taContext"] = tc.TenantContext ;
        //    this.ViewData["user"] = tc.User ;
        //    this.ViewData["siteRoles"] = tc.Roles ;


        //    this.ViewData["extlocalefile"] = GetExtLocaleFile(Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName);
        //    this.ViewData["useGoogleAnalytics"] = System.Configuration.ConfigurationManager.AppSettings["useGoogleAnalytics"];
        //    this.ViewData["googleAnalyticsAccount"] = System.Configuration.ConfigurationManager.AppSettings["googleAnalyticsAccount"];
        //    this.ViewData["siteUsers"] = siteUsers.Items;

        //    // IE8 compatibility (http://hsivonen.fi/doctype/)
        //    this.Response.AddHeader("X-UA-Compatible", "IE=Edge");

        //    this.ViewData["extlib"] = (string)((_httpContext.Request.Cookies.Get("debugExt") != null && _httpContext.Request.Cookies.Get("debugExt").Value == "true") ? "ext-all-dev.js" : "ext-all.js");

        //    this.ViewData["applib"] = (string)((_httpContext.Request.Cookies.Get("debugExt") != null && _httpContext.Request.Cookies.Get("debugExt").Value == "true") ? "app-dev.js" : "app.js");


        //    if (this.HttpContext.Request["testHarnessMode"] == "true")
        //    {
        //        return RazorView("TestHarnes");
        //    }
        //    if (System.Configuration.ConfigurationManager.AppSettings["use_compiled_taco"] == "true")
        //    {
        //        return RazorView("Index_Compiled");
        //    }

        //    return RazorView("index");
        //}
        private void AppendLocaleInfo()
        {
            //     symbol = CultureInfo
            //.GetCultures(CultureTypes.AllCultures)
            //.Where(c => !c.IsNeutralCulture)
            //.Select(culture =>
            //{
            //    try
            //    {
            //        return new RegionInfo(culture.LCID);
            //    }
            //    catch
            //    {
            //        return null;
            //    }
            //})
            //.Where(ri => ri != null && ri.ISOCurrencySymbol == ISOCurrencySymbol)
            //.Select(ri => ri.CurrencySymbol)
            //.FirstOrDefault();
        }

        private async Task<ActionResult> GetIndex()
        {
            var userDcTask = _adminUserWebApiClient.GetUser(_apiContext.UserClaims.UserId, UserScopeType.Tenant.ToString(), _apiContext.TenantId);
           var rolesTask = GetUserSitesRoles(_apiContext.UserClaims.UserId);
           var tenantTask = _tenantsWebApi.GetTenantInternal(_apiContext.TenantId, false);
            var adminSubNavExtensibiltyTask = _entityListsWebApiClient.GetEntities("subNavLinks@mozu", 6000);
            var tenantAdminSettingsTask = _entityListsWebApiClient.GetEntity(entityListFullName: "tenantAdminSettings@mozu", id: "Global");

            Task<ServiceClientResponse<AdminUserCollection>> siteUsersTask = _usersRepo.GetUsers(UserScopeType.Tenant.ToString(), _apiContext.TenantId, pageSize: 200, startIndex: 0);

            // TODO: the masterCatalog service is not ready. We mock it.
            Task<ServiceClientResponse<DCproduct.MasterCatalogCollection>> masterCatalogsTask;
            masterCatalogsTask = _masterCatalogClient.GetMasterCatalogs();

            await Task.WhenAll(userDcTask, rolesTask, tenantTask, siteUsersTask, masterCatalogsTask, adminSubNavExtensibiltyTask, tenantAdminSettingsTask);

            //var tenants2 = tenantTask2.Result.ReadAsSync();


            Core.Api.Contracts.User userDC = userDcTask.Result.ReadAsSync();
            List<UserRole> roles = rolesTask.Result;
            Tenant.Contracts.Tenant tenant = tenantTask.Result.ReadAsSync();

            ProvisionCMSMAYBE(tenant);


            AdminUserCollection siteUsers = siteUsersTask.Result.ReadAsSync();
            DCproduct.MasterCatalogCollection masterCatalogs = null;
            try
            {
                masterCatalogs = masterCatalogsTask.Result.ReadAsSync();
            }
            catch
            {
                masterCatalogs = new DCproduct.MasterCatalogCollection {Items = new List<DCproduct.MasterCatalog>()};
            }
            if (adminSubNavExtensibiltyTask.Result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                await _entityListsWebApiClient.CreateEntityList(new EntityList
                                                                {
                                                                    NameSpace = "mozu",
                                                                    ContextLevel = "Tenant",
                                                                    IsVisibleInStorefront = false,
                                                                    UseSystemAssignedId = true,
                                                                    Name = "subNavLinks",
                                                                    Usages = new List<string> { "entityManagerAdvanced" },
                                                                    Views = new List<ListView>
                                                                            {
                                                                                new ListView
                                                                                {
                                                                                    Usages = new List<string> {"entityManagerAdvanced"},
                                                                                    Name = "Default",
                                                                                    Fields = new List<ListViewField>
                                                                                             {
                                                                                                 
                                                                                                 new ListViewField
                                                                                                 {
                                                                                                     Name = "parentId",
                                                                                                     Target = "parentId"
                                                                                                 },
                                                                                                 new ListViewField
                                                                                                 {
                                                                                                     Name = "path",
                                                                                                     Target = "path"
                                                                                                 }
                                                                                             }
                                                                                }
                                                                            }
                                                                });
                adminSubNavExtensibiltyTask = _entityListsWebApiClient.GetEntities("subNavLinks@mozu", 6000);
                await adminSubNavExtensibiltyTask;
            }
            if (!tenantAdminSettingsTask.Result.ResponseMessage.IsSuccessStatusCode  )
            {
                await _entityListsWebApiClient.CreateEntityList(new EntityList
                                                                {
                                                                    NameSpace = "mozu",
                                                                    ContextLevel = "Tenant",
                                                                    IsVisibleInStorefront = false,
                                                                    IdProperty =new IndexedProperty()
                                                                                {
                                                                                    DataType= "string",
                                                                                    PropertyName ="name"
                                                                                } ,
                                                                    UseSystemAssignedId = false,
                                                                    Name = "tenantAdminSettings",
                                                                    Usages = new List<string>(),
                                                                    Views = new List<ListView>
                                                                            {
                                                                                new ListView
                                                                                {
                                                                                    Usages = new List<string>(),
                                                                                    Name = "Default",
                                                                                    Fields = new List<ListViewField>
                                                                                             {
                                                                                                 new ListViewField
                                                                                                 {
                                                                                                     Name = "name",
                                                                                                     Target = "name"
                                                                                                 }
                                                                                             }

                                                                                }
                                                                            }
                                                                });

                await _entityListsWebApiClient.InsertEntity(entityListFullName: "tenantAdminSettings@mozu", item: JObject.FromObject(new TenantAdminGlobalSettings()
                                                                                                                               {
                                                                                                                                   EntityManagerVisible = false,
                                                                                                                                   CustomRoutesVisible = false,
                                                                                                                                   SiteBuilderContentListsVisible = false

                                                                                                                               }, GlobalConfiguration.Configuration.Formatters.JsonFormatter.CreateJsonSerializer()));


                tenantAdminSettingsTask = _entityListsWebApiClient.GetEntity(entityListFullName: "tenantAdminSettings@mozu", id: "Global");
                
                await tenantAdminSettingsTask;



            }

            


            var user = new User
                       {
                           BehaviorIds = _apiContext.UserClaims.BehaviorIds,
                           EmailAddress = userDC.EmailAddress,
                           FirstName = userDC.FirstName,
                           LastName = userDC.LastName,
                           Id = _apiContext.UserClaims.UserId
                       };


            var taContext = Mapper.Map<TaContext>(tenant);
            Mapper.Map(masterCatalogs, taContext);

            var emtpy = new Currency();
            taContext.Currencies = taContext.MasterCatalogs
                .SelectMany(x => x.Catalogs)
                .Select(x => x.Currency)
                .Distinct()
                .Select(x =>
                {
                    CurrencyCode cc;
                    return Enum.TryParse(x, out cc) ? CurrencyRepository.Get(cc) : emtpy;
                })
                .Where(x => x.Symbol != null).ToDictionary(x => x.CurrencyCode.ToString().ToLowerInvariant());


            ViewData["localizationValues"] = new LocalizationController(_httpContext).GetStrings();
            ViewData["taContext"] = taContext;
            ViewData["user"] = user;
            ViewData["siteRoles"] = roles;


            ViewData["extlocalefile"] = GetExtLocaleFile(Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName);
            ViewData["useGoogleAnalytics"] = ConfigurationManager.AppSettings["useGoogleAnalytics"];
            ViewData["googleAnalyticsAccount"] = ConfigurationManager.AppSettings["googleAnalyticsAccount"];
            ViewData["siteUsers"] = siteUsers.Items;
            ViewData["showBristReport"] = _settings.AppSettings("showBirstReport"); 

            try
            {
                ViewData["adminSubNavExtensibilty"] = adminSubNavExtensibiltyTask.Result.ReadAsSync().Items;
            }
            catch (Exception err)
            {
                LoggingService.LoggerFor<HomeController>().Error(err.Message, err);
            }


             try
            {
                ViewData["tenantGlobalSettings"] = tenantAdminSettingsTask.Result.ReadAsSync();
            }
            catch (Exception err)
            {
                LoggingService.LoggerFor<HomeController>().Error(err.Message, err);
            }

            

            // IE8 compatibility (http://hsivonen.fi/doctype/)
            Response.AddHeader("X-UA-Compatible", "IE=Edge");

            ViewData["extlib"] = (_httpContext.Request.Cookies.Get("debugExt") != null && _httpContext.Request.Cookies.Get("debugExt").Value == "true") ? "ext-all-dev.js" : "ext-all.js";
            ViewData["applib"] = (_httpContext.Request.Cookies.Get("debugExt") != null && _httpContext.Request.Cookies.Get("debugExt").Value == "true") ? "app-dev.js" : "app.js";

            if (HttpContext.Request["testHarnessMode"] == "true")
            {
                return RazorView("TestHarnes");
            }
            string tacoAssetServer = _httpContext.Request.Cookies.Get("taco-asset-location") != null ? _httpContext.Request.Cookies.Get("taco-asset-location").Value : null;
            if (string.Equals(ConfigurationManager.AppSettings["use_compiled_taco"], "true", StringComparison.OrdinalIgnoreCase) & string.IsNullOrEmpty(tacoAssetServer))
            {
                return RazorView("Index_Compiled");
            }

            return RazorView("index");
        }

        private void ProvisionCMSMAYBE(Tenant.Contracts.Tenant tenant)
        {
            if (Request.RequestUri.ToString().Contains("provisioncms"))
            {
                IProvisioningWebApiClient cmsProv = Request.Resolve<IProvisioningWebApiClient>().CloneWithoutUserClaims();
                var tenantCmsReq = new CreateTenantRequest
                                   {
                                       TenantId = tenant.Id,
                                       MasterCatalogs = tenant.MasterCatalogs == null ? null :
                                           tenant.MasterCatalogs.Select(mc => new CreateMasterCatalogRequest
                                                                              {
                                                                                  MasterCatalogId = mc.Id,
                                                                                  TenantId = mc.TenantId,
                                                                                  DefaultCurrencyCode = mc.DefaultCurrencyCode,
                                                                                  DefaultLocaleCode = mc.DefaultLocaleCode,
                                                                                  Sites = tenant.Sites == null ? null : tenant.Sites.Where(x => mc.Catalogs != null && mc.Catalogs.Any(c => c.Id == x.CatalogId))
                                                                                      .Select(site => new CreateSiteRequest
                                                                                                      {
                                                                                                          SiteId = site.Id,
                                                                                                          MasterCatalogId = site.MasterCatalogId,
                                                                                                          CatalogId = site.CatalogId,
                                                                                                          TenantId = site.TenantId,
                                                                                                          CurrencyCode = site.DefaultCurrencyCode,
                                                                                                          LocaleCode = site.DefaultLocaleCode,
                                                                                                          CountryCode = site.CountryCode,
                                                                                                          CatalogRequest = mc.Catalogs.Where(x => x.Id == site.CatalogId)
                                                                                                              .Select(cat => new CreateCatalogRequest
                                                                                                                             {
                                                                                                                                 CatalogId = cat.Id,
                                                                                                                                 DefaultCurrencyCode = cat.DefaultCurrencyCode,
                                                                                                                                 DefaultLocaleCode = cat.DefaultLocaleCode,
                                                                                                                                 MasterCatalogId = cat.MasterCatalogId,
                                                                                                                                 TenantId = cat.TenantId
                                                                                                                             }).First()
                                                                                                      }).ToList()
                                                                              }).ToList()
                                   };

                cmsProv.CreateTenant(tenantCmsReq, 1);
            }
        }

        public Task<List<UserRole>> GetUserSitesRoles(string userId)
        {
            return _usersRepo.GetUserRoles(userId, UserScopeType.Tenant.ToString(), _apiContext.TenantId)
                .ContinueWith(t =>
                {
                    if (t.Result.ResponseMessage.IsSuccessStatusCode)
                        return t.Result.ReadAsSync().Items;
                    return new List<UserRole>();
                });
        }


        private static string GetExtLocaleFile(string language)
        {
            const string filename = "ext-lang-{0}.js";

            switch (language.ToLower())
            {
                case "de":
                    return string.Format(filename, "de");
                default:
                    return string.Format(filename, "en");
            }
        }

        public class TestContext
        {
            public TaContext TenantContext { get; set; }
            public User User { get; set; }
            public List<UserRole> Roles { get; set; }
            public AdminUserCollection Users { get; set; }
        }
    }
}