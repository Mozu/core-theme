using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using System.Web.Razor;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Logging;
using Mozu.Core.Money;
using Mozu.Core.Settings;
using Mozu.MZDB.Contracts;
using Mozu.MZDB.Contracts.Clients;
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

namespace Mozu.SiteBuilder.UX.Admin.Controllers
{
 
//    [Mozu.SiteBuilder.Mvc.ActionFilters.AddCorrelationHeaderFilter]
   

    public class HomeController : AdminApiControllerBase 
    {
        private readonly ILogger _logger;
        private readonly IEntityListsWebApiClient _entityListsWebApiClient;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;

        private readonly IAuthenticationHelper _authenticationHelper;
        
        private readonly ITenantsWebApiClient _tenantsWebApi;
        
        private readonly IApiContext _apiContext;
        private readonly IMultiScopeAdminUserWebApiClient _usersRepo;
        private readonly ISettings _settings;
        private readonly HttpContextBase _httpContext;
        private readonly IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;

        private IMasterCatalogWebApiClient _masterCatalogClient;

        public HomeController(IMultiScopeAdminUserWebApiClient usersRepo, IAuthenticationHelper authHelper, ITenantsWebApiClient tenantsWebApi, IApiContext apiContext, ISettings settings, HttpContextBase httpContext, Mozu.AdminUser.Contracts.Clients.IMultiScopeAdminUserWebApiClient adminUserWebApiClient, IMasterCatalogWebApiClient masterCatalogClient, Mozu.Core.Logging.ILogger logger, Mozu.Content.Contracts.Clients.IDocumentListWebApiClient documentListWebApiClient, Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient entityListsWebApiClient)
        {
            
            _logger = logger;
            _entityListsWebApiClient = entityListsWebApiClient.CloneWithoutUserClaims().CloneWithApiContext(x =>
            {
                x.SiteId = null;
                x.CatalogId = null;
                x.MasterCatalogId = null;
            });
            _documentListWebApiClient = documentListWebApiClient.CloneWithoutUserClaims();

            _usersRepo = usersRepo.CloneWithoutUserClaims();
            _authenticationHelper = authHelper;
            //_sbc = sbc;
            _apiContext = apiContext;
            _tenantsWebApi = tenantsWebApi.CloneWithoutUserClaims();//  .CloneWithApiContext(x => x.UserClaims = LightweightUserClaims.CreateForSystemUser(UserScopeType.SystemAdmin));
            
            _settings = settings;
            _httpContext = httpContext;
            _adminUserWebApiClient = adminUserWebApiClient.CloneWithoutUserClaims();
            
            _masterCatalogClient = masterCatalogClient.CloneWithoutUserClaims();
        }

        
        // GET: /Home/
        [HttpGet()]
        public async Task<HttpResponseMessage > Index()
        {
            try
            {
                var res = await GetIndex();
                return this.Request.CreateResponse(HttpStatusCode.OK, res);
            }
            catch (Exception ex)
            {
                _logger.Error("error loading admin", ex);
                var redir = this.Request.CreateResponse(statusCode: System.Net.HttpStatusCode.Redirect);
                redir.Headers.Location = new System.Uri("/admin/auth/launchpad", UriKind.Relative);
                return redir;
            }
        }

        public class TestContext
        {
            public TaContext TenantContext { get; set; }
            public Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User User { get; set; }
            public List<UserRole> Roles { get; set; }
            public AdminUserCollection Users { get; set; }
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
        void AppendLocaleInfo()
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
       
        async Task<ActionResult> GetIndex()
        {

            var userDcTask = _adminUserWebApiClient.GetUser(_apiContext.UserClaims.UserId, UserScopeType.Tenant.ToString(), _apiContext.TenantId);
            var rolesTask = GetUserSitesRoles(_apiContext.UserClaims.UserId);
            var tenantTask = _tenantsWebApi.GetTenantInternal(  _apiContext.TenantId , false );
            var adminSubNavExtensibiltyTask = _entityListsWebApiClient.GetEntities(entityListFullName: "mozu.extensiblity.subNavLinks", pageSize: 6000);
            
            var siteUsersTask = _usersRepo.GetUsers(scopeType: UserScopeType.Tenant.ToString(), scopeId: _apiContext.TenantId, pageSize: 200, startIndex: 0);
            
            // TODO: the masterCatalog service is not ready. We mock it.
            Task<ServiceClientResponse<DCproduct.MasterCatalogCollection >> masterCatalogsTask;
             masterCatalogsTask = _masterCatalogClient.GetMasterCatalogs( );

             await Task.WhenAll(userDcTask, rolesTask, tenantTask, siteUsersTask, masterCatalogsTask , adminSubNavExtensibiltyTask);

            //var tenants2 = tenantTask2.Result.ReadAsSync();
            

            var userDC = userDcTask.Result.ReadAsSync();
            var roles = rolesTask.Result;
            var tenant = tenantTask.Result.ReadAsSync();
            var siteUsers = siteUsersTask.Result.ReadAsSync();
            DCproduct.MasterCatalogCollection masterCatalogs = null;
            try
            {
                masterCatalogs = masterCatalogsTask.Result.ReadAsSync();
            }
            catch
            {
                masterCatalogs = new DCproduct.MasterCatalogCollection() {Items = new List<DCproduct.MasterCatalog>()};
            }
            if (adminSubNavExtensibiltyTask.Result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                await _entityListsWebApiClient.CreateEntityList(new EntityList()
                                                                {
                                                                    NameSpace = "mozu.extensiblity",
                                                                    ContextLevel = "Tenant",
                                                                    IsVisibleInStorefront = false,
                                                                    UseSystemAssignedId = true,
                                                                    Name = "subNavLinks"
                                                                });
                adminSubNavExtensibiltyTask = _entityListsWebApiClient.GetEntities(entityListFullName: "subNavLinks@mozu.extensiblity", pageSize: 6000);
                await adminSubNavExtensibiltyTask;

            }
           

            var user = new Mozu.SiteBuilder.UX.Admin.Api.Models.Account.User()
            {
                BehaviorIds = _apiContext.UserClaims.BehaviorIds,
                EmailAddress = userDC.EmailAddress,
                FirstName = userDC.FirstName,
                LastName = userDC.LastName,
                Id = _apiContext.UserClaims.UserId
            };

           
            var masterCatalogPubDic= tenant.MasterCatalogs.Select(x =>
            {
                var client = _documentListWebApiClient.CloneWithApiContext(z =>
                {
                    z.MasterCatalogId = z.MasterCatalogId;
                    z.CatalogId = null;
                    z.SiteId = null;
                });
                return new Tuple<int, Task<ServiceClientResponse<DocumentListCollection>>> (x.Id, client.GetDocumentLists());

            }).ToDictionary(x => x.Item1, y=>y.Item2 );

            var catPubTaskDic = tenant.MasterCatalogs.SelectMany(x=>x.Catalogs ).Select(x =>
            {
                var client = _documentListWebApiClient.CloneWithApiContext(z =>
                {
                    z.MasterCatalogId = x.MasterCatalogId;
                    z.CatalogId = x.Id;
                    z.SiteId = null;
                });
                return new Tuple<int, Task<ServiceClientResponse<DocumentListCollection>>> (x.Id, client.GetDocumentLists());

            }).ToDictionary(x => x.Item1, y=>y.Item2 );
             var sitePubTaskDic = tenant.Sites.Select(x=> 
             {
                 var client = _documentListWebApiClient.CloneWithApiContext(z =>
                 {
                     z.MasterCatalogId = x.MasterCatalogId;
                     z.CatalogId = x.CatalogId;
                     z.SiteId = x.Id;
                 });
                return new Tuple<int, Task<ServiceClientResponse<DocumentListCollection>>> (x.Id, client.GetDocumentLists());

            }).ToDictionary(x => x.Item1, y=>y.Item2 );



            var pubTasks = masterCatalogPubDic.Values.Concat(catPubTaskDic.Values).Concat(sitePubTaskDic.Values).ToArray();

            await Task.WhenAll(pubTasks);
            
           


            var taContext = AutoMapper.Mapper.Map<TaContext>(tenant);
            AutoMapper.Mapper.Map(masterCatalogs, taContext);

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
                .Where(x => x.Symbol!= null ).ToDictionary(x => x.CurrencyCode.ToString().ToLowerInvariant());

           
            //todo find better way for this.
           (taContext.MasterCatalogs ?? new List<MasterCatalog>()).ForEach(mc =>
            {
                var res = masterCatalogPubDic[mc.Id].Result;
                if (!res.HasException && res.ResponseMessage.IsSuccessStatusCode)
                {
                    var lst = res.ReadAsSync().Items.Where(x => (x.Scope == null ||x.Scope == "masterCatalog") && x.SupportsPublishing.GetValueOrDefault(false)).ToList();
                    if (lst.Any())
                    {
                        mc.ContentPublishingEnabled = lst.Any(x => x.EnablePublishing.GetValueOrDefault(false));
                    }

                    
                }
                (mc.Sites ?? new List<TaContextSite>()).ForEach(s =>
                {
                     res = sitePubTaskDic[s.Id].Result;
                    if (!res.HasException && res.ResponseMessage.IsSuccessStatusCode)
                    {
                        var lst = res.ReadAsSync().Items.Where(x => (x.Scope == null || string.Equals(x.Scope, "site", StringComparison.OrdinalIgnoreCase) )&& x.SupportsPublishing.GetValueOrDefault(false)).ToList();
                        if (lst.Any())
                        {
                            s.ContentPublishingEnabled = lst.Any(x => x.EnablePublishing.GetValueOrDefault(false));
                        }
                    }
                });
                (mc.Catalogs ?? new List<TaContextCatalog>()).ForEach(cat =>
                {
                     res = catPubTaskDic[cat.Id].Result;
                    if (!res.HasException && res.ResponseMessage.IsSuccessStatusCode)
                    {
                        var lst = res.ReadAsSync().Items.Where(x => (x.Scope == null ||  x.Scope == "catalog")  &&  x.SupportsPublishing.GetValueOrDefault(false)).ToList();
                        if (lst.Any())
                        {
                            cat.ContentPublishingEnabled = lst.Any(x => x.EnablePublishing.GetValueOrDefault(false));
                        }
                    }
                });


                
            });

            


            this.ViewData["localizationValues"] = new LocalizationController(_httpContext).GetStrings();
            this.ViewData["taContext"] = taContext;
            this.ViewData["user"] = user;
            this.ViewData["siteRoles"] = roles;

            
            
            this.ViewData["extlocalefile"] = GetExtLocaleFile(Thread.CurrentThread.CurrentCulture.TwoLetterISOLanguageName);
            this.ViewData["useGoogleAnalytics"] = System.Configuration.ConfigurationManager.AppSettings["useGoogleAnalytics"];
            this.ViewData["googleAnalyticsAccount"] = System.Configuration.ConfigurationManager.AppSettings["googleAnalyticsAccount"];
            this.ViewData["siteUsers"] = siteUsers.Items;
            this.ViewData["adminSubNavExtensibilty"] = adminSubNavExtensibiltyTask.Result.ReadAsSync().Items;

            // IE8 compatibility (http://hsivonen.fi/doctype/)
            this.Response.AddHeader("X-UA-Compatible", "IE=Edge");

            this.ViewData["extlib"] = (string)((_httpContext.Request.Cookies.Get("debugExt") != null && _httpContext.Request.Cookies.Get("debugExt").Value == "true") ? "ext-all-dev.js" : "ext-all.js");
            this.ViewData["applib"] = (string)((_httpContext.Request.Cookies.Get("debugExt") != null && _httpContext.Request.Cookies.Get("debugExt").Value == "true") ? "app-dev.js" : "app.js");

            if (this.HttpContext.Request["testHarnessMode"] == "true")
            {
                return RazorView("TestHarnes");
            }
            var tacoAssetServer = _httpContext.Request.Cookies.Get("taco-asset-location") != null ? _httpContext.Request.Cookies.Get("taco-asset-location").Value : null;
            if (System.Configuration.ConfigurationManager.AppSettings["use_compiled_taco"] == "true" & string.IsNullOrEmpty(tacoAssetServer))
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
