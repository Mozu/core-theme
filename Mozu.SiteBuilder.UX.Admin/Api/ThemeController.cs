using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.Core;
using Mozu.Core.Api.Routing;
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
using Mozu.SiteSettings.Shipping.Contracts;
using Mozu.SiteSettings.Shipping.Contracts.Clients;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Linq;
using Mozu.SiteBuilder.Mvc.Extensions;
using Site = Mozu.SiteBuilder.UX.Admin.Api.Models.Testing.Site;
using Theme = Mozu.SiteBuilder.Mvc.Themes.Theme;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/themes", SuppressDescriptorGeneration = true)]
    public class ThemeController : BaseController
    {
      

        public ThemeController(ITenantsWebApiClient tenantClient, IGeneralSettingWrapper generalSettingsWebApiClient, IThemeRepository themeRepository, ICmsServiceWrapper cmsServiceWrapper, IThemeSettingsRepository themeSettingsRepository)
        {
            _tenantClient = tenantClient;
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            _themeRepository = themeRepository;
            _cmsServiceWrapper = cmsServiceWrapper;
            _themeSettingsRepository = themeSettingsRepository;
        }


        [DataContract]
        public class ThemeDTO
        {
            [DataMember(Name = "name")]
            public string Name { get; set; }

            [DataMember(Name = "id")]
            public string Id { get; set; }

            [DataMember(Name = "author")]
            public string Author { get; set; }

            [DataMember(Name = "isDesktop")]
            public bool? IsDesktop { get; set; }

            [DataMember(Name = "isMobile")]
            public bool? IsMobile { get; set; }

            [DataMember(Name = "isSelectedDesktop")]
            public bool? IsSelectedDesktop { get; set; }

            [DataMember(Name = "isSelectedMobile")]
            public bool? IsSelectedMobile { get; set; }

            public Thumbnail Thumbnail { get; set; }

            [DataMember(Name = "thumbnail")]
            public string ThumbnailAsDataUri
            {
                get
                {
                    return Thumbnail == null ? null : Thumbnail.AsDataUri;
                }
                set
                {
                    // a public setter is required by [DataMember].
                    // however, we don't want this field set, so this is a no-op.
                }
            }

            //constructor for jser.
            public ThemeDTO()
            { }

            /// <summary>
            /// Copy constructor
            /// </summary>
            public ThemeDTO(string desktopTheme, string mobileTheme, Theme theme, bool? isSelectedDesktop = null, bool? isSelectedMobile = null)
            {
                Name = theme.Name;
                Author = theme.Author;
                Thumbnail = theme.Thumbnail;
                IsDesktop = theme.IsDesktop;
                IsMobile = theme.IsMobile;
                Id = theme.Id;

                if (isSelectedDesktop.HasValue)
                    IsSelectedDesktop = isSelectedDesktop.Value;
                else if (String.Equals(Id, desktopTheme, StringComparison.InvariantCultureIgnoreCase))
                    IsSelectedDesktop = true;
                else
                    IsSelectedDesktop = false;

                if (isSelectedMobile.HasValue)
                    IsSelectedMobile = isSelectedMobile.Value;
                else if (!string.IsNullOrEmpty(mobileTheme) && String.Equals(Name, mobileTheme, StringComparison.InvariantCultureIgnoreCase))
                    IsSelectedMobile = true;
                else
                    IsSelectedMobile = false;
            }


            
            /// <summary>
            /// Checks for equality by comparing theme names.
            /// </summary>
            public bool Equals(Theme otherTheme)
            {
                return otherTheme != null && this.Id == otherTheme.Id;
            }
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ThemeDTO>>> GetListThemes()
        {
            var localThemeDir = _themeRepository.GetLocalThemePath();
            var genSettings = await _generalSettingsWebApiClient.ReadSettings();
            //var localThemes = Directory.GetDirectories(localThemeDir);
            var entitlements = (await _tenantClient.GetSiteEntitlements(this.SbApiContext.TenantId, this.SbApiContext.SiteId)).ReadAsSync();


            var localThemes = entitlements.Items.Where(x => x.ApplicationType == "Theme")
                .Select(x => x.ApplicationVersionId.ToString())
                .Union(Directory.GetDirectories(localThemeDir)
                .Select(x => Path.GetFileName(x)));


            var themes = localThemes
                .Select(x =>
                {
                    try
                    {
                        return _themeRepository.GetTheme(x);
                    }
                    catch (Exception ex)
                    {
                        System.Diagnostics.Debug.Write(ex);
                        return null;
                    }

                })
                    .Where(x => x != null)
                .Select<Theme, ThemeDTO>(t => new ThemeDTO(genSettings.DesktopTheme, genSettings.MobileTheme, t)).ToList();
            // List<ThemeDTO> themes = _themeRepository.GetAll().Select<ITheme, ThemeDTO>(t => new ThemeDTO(t)).ToList();
            return List2(themes);
            //   throw new NotImplementedException();

        }

        [HttpGetRoute(UriTemplate = "addons/list/{themeId}")]
        public async Task<Response<List<ThemeDTO>>> GetAddons(string themeId)
        {
            var localAddonDir = _themeRepository.GetLocalAddonPath();
            
            var theme = _themeRepository.GetTheme(themeId);

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
                        System.Diagnostics.Debug.Write(ex);
                        return null;
                    }

                })
                    .Where(x => x != null)
                .Select<Theme, ThemeDTO>(t => new ThemeDTO(null, null , t)).ToList();
            
            
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

            // TODO: need async settingsClient
            var settings = await _generalSettingsWebApiClient.ReadSettings();

            if (newDesktop != null)
            {
                // intent to set a desktop theme.
                settings.DesktopTheme = newDesktop.Id;
            }
            else if (themes.Any(t => t.Id == settings.DesktopTheme))
            {
                // intent to un-set the desktop theme.
                // having NO desktop theme is not a legal state, so we will set the theme to the default.
                newDesktop = new ThemeDTO(settings.DesktopTheme, settings.MobileTheme, _themeRepository.GetDefaultTheme(), true);
                if (!themes.Any(t => t.Equals(newDesktop)))
                    themes.Add(newDesktop);
                settings.DesktopTheme = newDesktop.Id;
            }

            if (newMobile != null)
            {
                settings.MobileTheme = newMobile.Id;
            }
            else if (themes.Any(t => t.Id == settings.MobileTheme))
            {
                // intent to un-set the mobile theme.
                settings.MobileTheme = null;
            }

            _generalSettingsWebApiClient.UpdateGeneralSettings(settings);

            // the UI returns the ThemeDTO without a thumbnail (to minimize the payload). But if we pass the same ThemeDTO without
            // a thumbnail back to them, the UI will update to have no thumbnail. So we have to loop over the provided ThemeDTO objects
            // and construct a new one to return to them.

            IEnumerable<ThemeDTO> returnedThemesList =
                from t in themes
                let isSelectedDesktop = (newDesktop != null && newDesktop.Equals(t)) || (newDesktop == null && t.Id.Equals(settings.DesktopTheme))
                let isSelectedMobile = (newMobile != null && newMobile.Equals(t)) || (newMobile == null && t.Equals(settings.MobileTheme))
                let fullTheme = _themeRepository.GetTheme(t.Id)
                select new ThemeDTO(settings.DesktopTheme, settings.MobileTheme, fullTheme, isSelectedDesktop, isSelectedMobile);

            return List2(returnedThemesList.ToList());
        }



        ITenantsWebApiClient _tenantClient;
        private readonly IGeneralSettingWrapper _generalSettingsWebApiClient;
        private readonly IThemeRepository _themeRepository;
        private readonly ICmsServiceWrapper _cmsServiceWrapper;
        private readonly IThemeSettingsRepository _themeSettingsRepository;
    }
}
