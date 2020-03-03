using AutoMapper;
using Mozu.AdminUser.Contracts;
using Mozu.AdminUser.Contracts.Clients;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Provisioning;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.Core.Logging;
using Mozu.Core.Money;
using Mozu.Core.Settings;
using Mozu.MZDB.Contracts;
using Mozu.MZDB.Contracts.Clients;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.User;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Newtonsoft.Json.Serialization;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Controllers;
using Mozu.SiteBuilder.UX.Admin.Helpers;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [AllowAnonymous]
    [WebApi("app/user", SuppressDescriptorGeneration = true)]
    public class UserController : BaseController, IHttpController
    {

        private readonly IMultiScopeAdminUserWebApiClient _adminUserWebApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;
        private readonly IMasterCatalogWebApiClient _masterCatalogClient;
        private readonly IEntityListsWebApiClient _entityListsWebApiClient;
        private readonly IApiContext _apiContext;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private readonly ISettings _settings;
        private readonly HttpContextBase _httpContext;
        private readonly ITenantAdminSettingsContext _tenantAdminSettingsContext;

        public UserController(
            IMultiScopeAdminUserWebApiClient adminUserWebApiClient,
            IMasterCatalogWebApiClient masterCatalogClient,
            ITenantsWebApiClient tenantsWebApiClient,
            IApiContext apiContext,
            ISettings settings,
            HttpContextBase httpContext,
            IDocumentListWebApiClient documentListWebApiClient,
            IEntityListsWebApiClient entityListsWebApiClient,
            ITenantAdminSettingsContext tenantAdminSettingsContext)
        {

            this._adminUserWebApiClient = adminUserWebApiClient.CloneWithoutUserClaims();
            this._apiContext = apiContext;
            this._tenantsWebApiClient = tenantsWebApiClient.CloneWithoutUserClaims();
            this._masterCatalogClient = masterCatalogClient.CloneWithoutUserClaims();
            this._documentListWebApiClient = documentListWebApiClient.CloneWithoutUserClaims();
            this._entityListsWebApiClient = entityListsWebApiClient.CloneWithoutUserClaims().CloneWithApiContext(x =>
             {
                 x.SiteId = null;
                 x.CatalogId = null;
                 x.MasterCatalogId = null;
             });
            this._settings = settings;
            this._httpContext = httpContext;
            this._tenantAdminSettingsContext = tenantAdminSettingsContext;
        }

        [HttpGetRoute(UriTemplate = "identity")]
        public Response<UserIdentity> GetUserIdentity()
        {
            UserIdentity userIdentity = new UserIdentity();

            userIdentity.CTUser = this.GetUser().Result;

            userIdentity.CTUserRoles = this.GetUserSitesRoles().Result;

            userIdentity.CTTenant = this.GetTenantInternal().Result;
            userIdentity.LoginUri = _settings.LoginPath + "/cas/login/";
            this.ProvisionCMSMAYBE(userIdentity.CTTenant);

            userIdentity.CustomSchema = GetCustomSchema(userIdentity.CTTenant).Result;

            var siteUserRoles = GetSiteUsers().Result;
            userIdentity.CTSiteUsers = siteUserRoles != null ?  siteUserRoles.Items : null;

            var masterCatalogs = this.GetMasterCatalogs().Result;
            userIdentity.CTMasterCatalogs = masterCatalogs != null ? masterCatalogs.Items : null;

            try
            {
                var contextEntities = this.GetEntityContainers().Result;
                userIdentity.CTEntities = contextEntities != null ? contextEntities.Items?.Select(x => {
                    x.Item?.Add("_id", x.Id);
                    return x.Item;
                }).ToList() : null;

            }
            catch (Exception err)
            {
                userIdentity.CTEntities = null;
                LoggingService.LoggerFor<UserController>().Error(err.Message, err);
            }

            var taContext = Mapper.Map<TaContext>(userIdentity.CTTenant);
            var logzuUriBuilder = new UriBuilder(_settings.ZuKeeperPath);
            logzuUriBuilder.Path = "mozu.logzu";
            taContext.LogzuUrl = logzuUriBuilder.ToString();
            taContext.HasLegacyAdmin = HasLegacyAdmin(userIdentity.CTTenant);
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

            Resort(taContext);

            userIdentity.CTTaContext = taContext;

            userIdentity.LocalizationValues = new LocalizationController(_httpContext).GetStrings(); ;
            userIdentity.UseGoogleAnalytics = ConfigurationManager.AppSettings["useGoogleAnalytics"];
            userIdentity.GoogleAnalyticsAccount = ConfigurationManager.AppSettings["googleAnalyticsAccount"];
            userIdentity.ShowBristReport = _settings.AppSettings("showBirstReport");

            return Single2(userIdentity);
        }

        private Task<Models.Account.User> GetUser()
        {
            return _adminUserWebApiClient.GetUser(this._apiContext.UserClaims.UserId, UserScopeType.Tenant.ToString(), this._apiContext.TenantId)
                .ContinueWith(t =>
               {
                   if (t.Result.ResponseMessage.IsSuccessStatusCode)
                   {
                       Models.Account.User ContextUser = Mapper.Map<Models.Account.User>(t.Result.ReadAsAsync().Result);
                       ContextUser.BehaviorIds = this._apiContext.UserClaims.BehaviorIds;
                       ContextUser.Id = this._apiContext.UserClaims.UserId;
                       ContextUser.IsFulfillerUser = this._apiContext.IsFulfillerUserWithOrderAccess(); 
                       return ContextUser;
                   }
                   return null;
               });
        }

        private Task<List<UserRole>> GetUserSitesRoles()
        {
            return _adminUserWebApiClient.GetUserRoles(this._apiContext.UserClaims.UserId, UserScopeType.Tenant.ToString(), _apiContext.TenantId)
                .ContinueWith(t =>
                {
                    if (t.Result.ResponseMessage.IsSuccessStatusCode)
                        return t.Result.ReadAsSync().Items;
                    return new List<UserRole>();
                });
        }

        private Task<Tenant.Contracts.Tenant> GetTenantInternal()
        {
            return this._tenantsWebApiClient.GetTenantInternal(this._apiContext.TenantId, false)
                .ContinueWith(t =>
                {
                    if (t.Result.ResponseMessage.IsSuccessStatusCode)
                        return t.Result.ReadAsSync();
                    return null;
                });
        }

        private Task<MasterCatalogCollection> GetMasterCatalogs()
        {
            return this._masterCatalogClient.GetMasterCatalogs()
                .ContinueWith(t =>
                {
                    try
                    {
                        if (t.Result.ResponseMessage.IsSuccessStatusCode)
                            return t.Result.ReadAsAsync().Result;

                        return null;

                    }
                    catch (Exception)
                    {

                        return new MasterCatalogCollection { Items = new List<ProductAdmin.Contracts.MasterCatalog>() };
                    }                                  

                });
        }

        private async Task<List<JObject>> GetCustomSchema(Tenant.Contracts.Tenant tenant)
        {
            var ret = new List<JObject>();
            if (tenant.Sites == null)
            {
                return ret;
            }
            var site = tenant.Sites.FirstOrDefault();
            if (site == null)
            {
                return ret;
            }
            var docListsTask = _documentListWebApiClient.CloneWithApiContext(apiContext =>
            {
                apiContext.SiteId = site.Id;
                apiContext.MasterCatalogId = site.MasterCatalogId;
                apiContext.CatalogId = site.CatalogId;
                apiContext.LocaleCode = site.DefaultLocaleCode;

            }).GetDocumentLists(200);

            var entityListsTask = _entityListsWebApiClient.CloneWithApiContext(apiContext =>
            {
                apiContext.SiteId = site.Id;
                apiContext.MasterCatalogId = site.MasterCatalogId;
                apiContext.CatalogId = site.CatalogId;
                apiContext.LocaleCode = site.DefaultLocaleCode;

            }).GetEntityLists(200);

            await Task.WhenAll(docListsTask, entityListsTask).ConfigureAwait(false);
            var docLists = docListsTask.Result.ReadAsSync();
            var entityLists = entityListsTask.Result.ReadAsSync();

            var jser = JsonSerializer.Create(new JsonSerializerSettings()
            {
                ContractResolver = new CamelCasePropertyNamesContractResolver()
            });

            return docLists.Items.Select(x =>
            {
                var jobj = JObject.FromObject(x, jser);
                jobj["entityType"] = "cms";
                return jobj;
            }).Concat(entityLists.Items.Select(x =>
            {
                var jobj = JObject.FromObject(x, jser);
                jobj["listName"] = x.Name;
                jobj["listFQN"] = x.Name + "@" + x.NameSpace;
                jobj["entityType"] = "mzdb";
                return jobj;
            })).ToList();


        }


        private void ProvisionCMSMAYBE(Tenant.Contracts.Tenant tenant)
        {
            if (Request.RequestUri.ToString().Contains("provisioncms"))
            {
                Content.Contracts.Clients.IProvisioningWebApiClient cmsProv = Request.Resolve<Content.Contracts.Clients.IProvisioningWebApiClient>().CloneWithoutUserClaims();
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

        private Task<EntityContainerCollection> GetEntityContainers()
        {
            return this._entityListsWebApiClient.GetEntityContainers("subNavLinks@mozu", 6000)
                .ContinueWith(t =>
                {
                    if (t.Result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                    {
                        this._entityListsWebApiClient.CreateEntityList(new EntityList
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
                        this._entityListsWebApiClient.GetEntityContainers("subNavLinks@mozu", 6000)
                        .ContinueWith(r =>
                        {

                            if (r.Result.ResponseMessage.IsSuccessStatusCode)
                                return r.Result.ReadAsAsync().Result;

                            return null;
                        });
                    }
                    else if (t.Result.ResponseMessage.IsSuccessStatusCode)
                        return t.Result.ReadAsAsync().Result;

                    return null;
                });
        }

        private Task<AdminUserCollection> GetSiteUsers()
        {
            return this._adminUserWebApiClient.GetUsers(UserScopeType.Tenant.ToString(), _apiContext.TenantId, pageSize: 200, startIndex: 0)
            .ContinueWith(t => {

                if (t.Result.ResponseMessage.IsSuccessStatusCode)
                   return t.Result.ReadAsSync();

                return null;
            });
        }

        // Duplicate of method from HomeController. Required by AdminNG front-end that only seems to expose the User TaContext.
        private bool HasLegacyAdmin(Tenant.Contracts.Tenant tenant)
        {
            var isUnifiedValue = tenant.Attributes?.FirstOrDefault(x => x.Name.EqualsIgnoreCase("IsUnified"))?.Value.ToString();
            var legacyInstanceIdValue = tenant.Attributes?.FirstOrDefault(x => x.Name.EqualsIgnoreCase("mozu.reverseproxy.legacy_instance_id"))?.Value.ToString();

            return isUnifiedValue.EqualsIgnoreCase("true") && !string.IsNullOrEmpty(legacyInstanceIdValue);
        }

        private void Resort(TaContext taContext)
        {
            if (taContext.MasterCatalogs != null)
            {
                taContext.MasterCatalogs = taContext.MasterCatalogs.OrderBy(x => x.Id).ToList();
                foreach (var mc in taContext.MasterCatalogs)
                {
                    if (mc.Catalogs != null)
                    {
                        mc.Catalogs = mc.Catalogs.OrderBy(x => x.Id).ToList();
                    }
                    if (mc.Sites != null)
                    {
                        mc.Sites = mc.Sites.OrderBy(x => x.Id).ToList();
                    }
                }
            }

        }
    }
}