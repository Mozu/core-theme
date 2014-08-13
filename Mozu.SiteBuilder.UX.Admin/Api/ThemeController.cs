using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Provisioning;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using Mozu.Core.Logging;
using Mozu.PaymentService.Contracts;
using Mozu.ShippingAdmin.Contracts;
using Mozu.ShippingAdmin.Contracts.Clients;
using Mozu.ShippingRuntime.Contracts;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Order.Contracts.Clients;


using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Extensions;
using Site = Mozu.SiteBuilder.UX.Admin.Api.Models.Testing.Site;
using Theme = Mozu.SiteBuilder.Mvc.Themes.Theme;
using AutoMapper;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/themes", SuppressDescriptorGeneration = true)]
    public class ThemeController : BaseController
    {
      

        public ThemeController(ITenantsWebApiClient tenantClient, IGeneralSettingWrapper generalSettingsWebApiClient, IThemeRepository themeRepository, ICmsServiceWrapper cmsServiceWrapper, IThemeSettingsRepository themeSettingsRepository, ILogger logger , ISettings settings )
        {
            _tenantClient = tenantClient;
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            _themeRepository = themeRepository;
            _cmsServiceWrapper = cmsServiceWrapper;
            _themeSettingsRepository = themeSettingsRepository;
            _logger = logger;
            _settings = settings;
        }


        
        public class ThemeDTO
        {
          

            public string Name { get; set; }

            public string Id { get; set; }

            public string Author { get; set; }

            public bool? IsDesktop { get; set; }

            public bool? IsMobile { get; set; }

            public bool? IsTablet { get; set; }

            public bool? IsSelectedDesktop { get; set; }

            public bool? IsSelectedMobile { get; set; }

            public bool? IsSelectedTablet { get; set; }

            public bool? AllowProduction { get; set; }

        [JsonIgnore]
            public Thumbnail Thumbnail { get; set; }

            [JsonProperty(PropertyName = "thumbnail")]
            public string ThumbnailAsDataUri
            {
                get
                {
                    return Thumbnail == null ? null : Thumbnail.AsDataUri;
                }
                set
                {
                    // a public setter is required by .
                    // however, we don't want this field set, so this is a no-op.
                }
            }

            //constructor for jser.
            public ThemeDTO()
            { }

         

            public ThemeDTO(GeneralSettings genSettings, Theme theme, bool? isSelectedDesktop = null, bool? isSelectedMobile = null, bool? isSelectedTablet = null)
            {
                Name = theme.Name;
                Author = theme.Author;
                AllowProduction = theme.AllowProduction;
                Thumbnail = theme.Thumbnail;
                IsDesktop = theme.IsDesktop;
                IsMobile = theme.IsMobile;
                IsTablet = theme.IsTablet;
                Id = theme.Id;

                IsSelectedDesktop = IsSelectedTheme(genSettings.DesktopTheme, isSelectedDesktop);
                IsSelectedMobile = IsSelectedTheme(genSettings.MobileTheme, isSelectedMobile);
                IsSelectedTablet = IsSelectedTheme(genSettings.TabletTheme, isSelectedTablet);

            }

            private bool IsSelectedTheme(ThemeSelection themeSelection, bool? isSelected)
            {
                if (isSelected.HasValue)
                    return isSelected.Value;
                return ( themeSelection != null && 
                    String.Equals(Id, themeSelection.Id, StringComparison.InvariantCultureIgnoreCase) );
            }


            /// <summary>
            /// Checks for equality by comparing theme names.
            /// </summary>
            public bool Equals(Theme otherTheme)
            {
                return otherTheme != null && this.Id == otherTheme.Id;
            }

         
        }


        [HttpPutRoute(UriTemplate = "CMSPROVISION")]
       
        public async Task<HttpResponseMessage> what()
        {
            var tenantService = this.Request.Resolve<Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient>().CloneWithoutUserClaims();
            var cmsProv = this.Request.Resolve<Mozu.Content.Contracts.Clients.IProvisioningWebApiClient>().CloneWithoutUserClaims();
             
            int startIndex = 0;
            while (true)
            {
                var res = (await tenantService.GetTenants(false, false, startIndex, 200)).ReadAsSync();

                foreach (var tenant in res.Items)
                {
                    ProvisionCMSMAYBE(tenant, cmsProv);
                }

                startIndex += 200;
                if (res.Items.Count == 0)
                {
                    break;
                    
                }

            }
            return this.Request.CreateResponse();

        }


        private void ProvisionCMSMAYBE(Tenant.Contracts.Tenant tenant, Mozu.Content.Contracts.Clients.IProvisioningWebApiClient cmsProv)
        {


            var tenantCmsReq = new CreateTenantRequest()
                               {
                                   TenantId = tenant.Id,
                                   MasterCatalogs = tenant.MasterCatalogs == null ? null :
                                       tenant.MasterCatalogs.Select(mc => new CreateMasterCatalogRequest()
                                                                          {
                                                                              MasterCatalogId = mc.Id,
                                                                              TenantId = mc.TenantId,
                                                                              DefaultCurrencyCode = mc.DefaultCurrencyCode,
                                                                              DefaultLocaleCode = mc.DefaultLocaleCode,
                                                                              Sites = tenant.Sites == null ? null : tenant.Sites.Where(x => mc.Catalogs != null && mc.Catalogs.Any(c => c.Id == x.CatalogId))
                                                                                  .Select(site => new CreateSiteRequest()
                                                                                                  {
                                                                                                      SiteId = site.Id,
                                                                                                      MasterCatalogId = site.MasterCatalogId,
                                                                                                      CatalogId = site.CatalogId,
                                                                                                      TenantId = site.TenantId,
                                                                                                      CurrencyCode = site.DefaultCurrencyCode,
                                                                                                      LocaleCode = site.DefaultLocaleCode,
                                                                                                      CountryCode = site.CountryCode,
                                                                                                      CatalogRequest = mc.Catalogs.Where(x => x.Id == site.CatalogId)
                                                                                                          .Select(cat => new CreateCatalogRequest()
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

        [HttpGetRoute(UriTemplate = "sitethumbNail")]
        public async Task<HttpResponseMessage> GetThumbBySite(int siteId)
        {
            var genSettingsClient = this.Request.Resolve<Mozu.SiteSettings.General.Contracts.Clients.IGeneralSettingsWebApiClient>().CloneWithApiContext(x => x.SiteId = siteId);
            var settings = Mapper.Map<GeneralSettings>((await genSettingsClient.GetGeneralSettings()).ReadAsSync());

            Theme theme = null;
            try
            {
                theme =_themeRepository.GetTheme(settings.DesktopTheme);
            }
            catch
            {
                theme = _themeRepository.GetTheme(new ThemeSelection() {Id = "core5"});
            }


            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new ByteArrayContent(theme.Thumbnail.Contents);

            response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/" + System.IO.Path.GetExtension(theme.Thumbnail.Name).Replace(".", ""));

            return response;




        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ThemeDTO>>> GetListThemes()
        {
            var localThemeDir = _themeRepository.GetLocalThemePath();
            var genSettings = await _generalSettingsWebApiClient.ReadSettings();
            //var localThemes = Directory.GetDirectories(localThemeDir);
            var entitlements = (await _tenantClient.GetSiteEntitlements(this.SbApiContext.TenantId, this.SbApiContext.SiteId)).ReadAsSync();


            var localThemes = entitlements.Items.Where(x => x.ApplicationType == "Theme")
                .Select(x => (x.ApplicationAssetPath??"").Replace( "\\","/") )
                .Union(Directory.GetDirectories(localThemeDir)
                .Select(x => Path.GetFileName(x)));

            bool allowNonProductionThemes = false;

            if (!bool.TryParse(_settings.AppSettings("allowNonProductionThemes"), out allowNonProductionThemes) && !allowNonProductionThemes)
            {
                allowNonProductionThemes = false;
            }

            var themes = localThemes
                .Select(x =>
                {
                    try
                    {
                        var ret= _themeRepository.GetTheme(new ThemeSelection(){Id=x});
                        if (ret != null && !ret.AllowProduction.GetValueOrDefault(true) && !allowNonProductionThemes)
                        {
                            ret = null;
                        }
                        return ret;
                    }
                    catch (Exception ex)
                    {
                       _logger.Warn("theme error",ex);
                        return null;
                    }

                })
                    .Where(x => x != null)
                .Select<Theme, ThemeDTO>(t => new ThemeDTO(genSettings , t)).ToList();
            // List<ThemeDTO> themes = _themeRepository.GetAll().Select<ITheme, ThemeDTO>(t => new ThemeDTO(t)).ToList();
            return List2(themes);
            //   throw new NotImplementedException();

        }

        [HttpGetRoute(UriTemplate = "addons/list/{themeId}")]
        public async Task<Response<List<ThemeDTO>>> GetAddons(string themeId)
        {
            var localAddonDir = _themeRepository.GetLocalAddonPath();
            
            var theme = _themeRepository.GetTheme( new ThemeSelection() { Id=themeId});

            var themeSettings = (await _themeSettingsRepository.GetInstanceValues(themeId)) ?? new JObject();


            var selectedAddonsProperty = (JProperty)themeSettings[ThemeSettingsRepository.ADDONKEY];
            var selectedAddons = selectedAddonsProperty != null ? selectedAddonsProperty.Value.ToObject<string[]>() : new string[0];

            var entitlements = (await _tenantClient.GetSiteEntitlements(this.SbApiContext.TenantId, this.SbApiContext.SiteId)).ReadAsSync();

            var addonLocations = entitlements.Items.Where(x => x.ApplicationType == "Widget")
                .Select(x => x.ApplicationVersionId.ToString())
                .Union(Directory.GetDirectories(localAddonDir)
                .Select(x => Path.GetFileName(x)));


            var addons = addonLocations
                .Select(x =>
                {
                    try
                    {
                        return _themeRepository.GetAddon(x);
                    }
                    catch (Exception ex)
                    {
                        _logger.Warn("addon error", ex);
                        System.Diagnostics.Debug.Write(ex);
                        return null;
                    }

                })
                    .Where(x => x != null)
                .Select<Theme, ThemeDTO>(t => new ThemeDTO(null , t)).ToList();
            
            
                addons.ForEach(x =>
                    {
                        x.IsSelectedDesktop = selectedAddons.Contains( x.Id);
                    });
            

            return List2(addons);
        }

        [HttpPostRoute (UriTemplate = "addons/update/{themeId}")]
        public async Task<Response<List<ThemeDTO>>> UpdateAddons(string themeId, string[] addons )
        {
            var retval = await _themeSettingsRepository.SaveSingleValue(ThemeSettingsRepository.ADDONKEY, addons, themeId);

            return SuccessWithTotal2<List<ThemeDTO>>(0);
        }

        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<ThemeDTO>>> UpdateTheme(HttpRequestMessage msg)
        {
            List<ThemeDTO> themes = await msg.Content.ReadAsAsync<List<ThemeDTO>>();
            ThemeDTO newDesktop = themes.LastOrDefault(t => t.IsSelectedDesktop.Value);
            ThemeDTO newMobile = themes.LastOrDefault(t => t.IsSelectedMobile.Value);
            ThemeDTO newTablet = themes.LastOrDefault(t => t.IsSelectedTablet.Value);


            
            // TODO: need async settingsClient
            var settings = await _generalSettingsWebApiClient.ReadSettings();

            if (settings.DesktopTheme == null)
            {
                settings.DesktopTheme = new ThemeSelection()
                {
                    Id = "Core5"
                };
            }

            if (newDesktop != null)
            {
                
                settings.DesktopTheme.Id  = newDesktop.Id;

                // intent to set a desktop theme.
               // settings.DesktopTheme = new ThemeSelection() {Id = newDesktop.Id};
            }
            else if (themes.Any(t => t.Id == settings.DesktopTheme.Id ))
            {
                // intent to un-set the desktop theme.
                // having NO desktop theme is not a legal state, so we will set the theme to the default.
                newDesktop = new ThemeDTO(settings, _themeRepository.GetDefaultTheme(), true);
                if (!themes.Any(t => t.Equals(newDesktop)))
                    themes.Add(newDesktop);
                settings.DesktopTheme.Id  =newDesktop.Id;
            }

            settings.MobileTheme = GetThemeSelection(newMobile, settings.MobileTheme, themes);
            settings.TabletTheme = GetThemeSelection(newTablet, settings.TabletTheme, themes);
            
            _generalSettingsWebApiClient.UpdateThemeCore(settings);

            // the UI returns the ThemeDTO without a thumbnail (to minimize the payload). But if we pass the same ThemeDTO without
            // a thumbnail back to them, the UI will update to have no thumbnail. So we have to loop over the provided ThemeDTO objects
            // and construct a new one to return to them.

            IEnumerable<ThemeDTO> returnedThemesList =
                from t in themes
                let isSelectedDesktop = (newDesktop != null && newDesktop.Equals(t)) || (newDesktop == null && t.Id.Equals(settings.DesktopTheme.Id ))
                let isSelectedMobile = (newMobile != null && newMobile.Equals(t)) || (newMobile == null && settings.MobileTheme != null && t.Equals(settings.MobileTheme.Id))
                let isSelectedTablet = (newTablet != null && newTablet.Equals(t)) || (newTablet == null && settings.TabletTheme != null && t.Equals(settings.TabletTheme.Id))
                let fullTheme = _themeRepository.GetTheme( new ThemeSelection(){ Id=t.Id} )
                select new ThemeDTO(settings , fullTheme, isSelectedDesktop, isSelectedMobile, isSelectedTablet);

            return List2(returnedThemesList.ToList());
        }

        private static ThemeSelection GetThemeSelection(ThemeDTO themeDto, ThemeSelection themeSelection, IEnumerable<ThemeDTO> themes)
        {
            if (themeDto != null)
            {
                themeSelection = themeSelection ?? new ThemeSelection();
                themeSelection.Id = themeDto.Id;
            }
            else if (themeSelection != null && themes.Any(t => t.Id == themeSelection.Id))
            {
                // intent to un-set the theme.
                themeSelection.Id = null;
            }
            return themeSelection;
        }

        ITenantsWebApiClient _tenantClient;
        private readonly IGeneralSettingWrapper _generalSettingsWebApiClient;
        private readonly IThemeRepository _themeRepository;
        private readonly ICmsServiceWrapper _cmsServiceWrapper;
        private readonly IThemeSettingsRepository _themeSettingsRepository;
        private readonly ILogger _logger;
        private readonly ISettings _settings;
    }
}
