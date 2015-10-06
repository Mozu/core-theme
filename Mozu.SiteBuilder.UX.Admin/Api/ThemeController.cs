using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using Mozu.Core.Api.Client;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Newtonsoft.Json;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json.Linq;
using Theme = Mozu.SiteBuilder.Mvc.Themes.Theme;
using AutoMapper;
using System.Text.RegularExpressions;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/themes", SuppressDescriptorGeneration = true)]
    public class ThemeController : BaseController
    {
        public ThemeController(ITenantsWebApiClient tenantClient, IGeneralSettingWrapper generalSettingsWebApiClient, IThemeRepository themeRepository, ICmsServiceWrapper cmsServiceWrapper, IThemeSettingsRepository themeSettingsRepository, ILogger logger, ISettings settings)
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

            public string Version { get; set; }

            public string Status { get; set; }

            public bool? Leaf { get; set; }

            public bool? loaded { get { return true; } set { } }

            public bool? IsDesktop { get; set; }

            public bool? IsMobile { get; set; }

            public bool? IsTablet { get; set; }

            public bool? IsSelectedDesktop { get; set; }

            public bool? IsSelectedMobile { get; set; }

            public bool? IsSelectedTablet { get; set; }

            public bool? AllowProduction { get; set; }

            public DateTime? InstallDate { get; set; }

            [JsonIgnore]
            public DateTime TimeStamp { get; set; }

            [JsonIgnore]
            public string VersionGroup { get; set; }

            [JsonIgnore]
            public Thumbnail Thumbnail { get; set; }

            [JsonProperty("items")]
            public ThemeDTO[] Children { get; set; }

            [JsonProperty(PropertyName = "thumbnail")]
            public string ThumbnailAsDataUri
            {
                get { return "/admin/app/themes/thumNamil/" + System.Web.HttpUtility.UrlPathEncode(Id) + "?" + TimeStamp.ToString("O"); }
                set
                {
                    // a public setter is required by .
                    // however, we don't want this field set, so this is a no-op.
                }
            }

            //constructor for jser.
            public ThemeDTO()
            { }



            public ThemeDTO(GeneralSettings genSettings, Theme theme, bool? isSelectedDesktop = null, bool? isSelectedMobile = null, bool? isSelectedTablet = null, string version = null)
            {
                Name = theme.Name;
                TimeStamp = theme.TimeStamp;
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

                Version = version;

            }

            private bool IsSelectedTheme(ThemeSelection themeSelection, bool? isSelected)
            {
                if (isSelected.HasValue)
                    return isSelected.Value;
                return (themeSelection != null &&
                    String.Equals(Id, themeSelection.Id, StringComparison.InvariantCultureIgnoreCase));
            }


            /// <summary>
            /// Checks for equality by comparing theme names.
            /// </summary>
            public bool Equals(Theme otherTheme)
            {
                return otherTheme != null && this.Id == otherTheme.Id;
            }


        }

        [HttpGetRoute(UriTemplate = "thumNamil/{themeId}")]
        public Task<HttpResponseMessage> GetThumbByTheme(string themeId)
        {
            var theme = _themeRepository.GetThemeSlim(new ThemeSelection() { Id = themeId });
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);

            response.Content = new StreamContent(File.OpenRead(theme.Thumbnail.FullPath));
            response.Content.Headers.Expires = new DateTimeOffset(DateTime.Now.AddYears(1));
            response.Headers.CacheControl = new CacheControlHeaderValue()
            {
                MaxAge = new TimeSpan(365, 0, 0, 0),
                Public = true
            };

            response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/" + System.IO.Path.GetExtension(theme.Thumbnail.Name).Replace(".", ""));
            return Task.FromResult(response);
        }

        [HttpGetRoute(UriTemplate = "sitethumbNail")]
        public async Task<HttpResponseMessage> GetThumbBySite(int siteId)
        {
            var genSettingsClient = this.Request.Resolve<Mozu.SiteSettings.General.Contracts.Clients.IGeneralSettingsWebApiClient>().CloneWithApiContext(x => x.SiteId = siteId);
            var settings = Mapper.Map<GeneralSettings>((await genSettingsClient.GetGeneralSettings()).ReadAsSync());

            Theme theme = null;
            try
            {
                theme = _themeRepository.GetThemeSlim(settings.DesktopTheme);
            }
            catch (Exception ex)
            {
                _logger.Warn("error sitethumbNail", ex);
            }
            theme = theme ?? _themeRepository.GetThemeSlim(new ThemeSelection() { Id = Mozu.SiteBuilder.Mvc.Constants.DefaultTheme });

            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            response.Content = new StreamContent(File.OpenRead(theme.Thumbnail.FullPath));

            response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/" + System.IO.Path.GetExtension(theme.Thumbnail.Name).Replace(".", ""));

            return response;
        }


        Mozu.Tenant.Contracts.Entitlement GetEntitlementFromDirectory(string directoryPath, bool allowNonProductionThemes)
        {
            var theme = _themeRepository.GetThemeSlim(new ThemeSelection() { Id = System.IO.Path.GetFileName(directoryPath) });
            if (theme != null && !theme.AllowProduction.GetValueOrDefault(true) && !allowNonProductionThemes)
            {
                return null;
            }

            return new Mozu.Tenant.Contracts.Entitlement
            {
                ApplicationAssetPath = theme.Id,
                ApplicationName = theme.Id,
                DeveloperAccountName = theme.Author,
                AppKey = theme.Id.StartsWith("Core") ? "Core" + theme.Id : theme.Id,
                ApplicationVersion = theme.Id
            };
        }

        class VersionStringComparer : IComparer<string>
        {
            public int Compare(string x, string y)
            {
                if (x == y) return 0;

                var versionRegex = new Regex(@"^[0-9]+.[0-9]+.[0-9]+$");

                if (!versionRegex.IsMatch(x) || !versionRegex.IsMatch(y))
                {
                    var coreRegex = new Regex(@"^Core[0-9]+$");

                    if (!coreRegex.IsMatch(x) || !coreRegex.IsMatch(y))
                    {
                        return StringComparer.CurrentCulture.Compare(x, y);
                    }

                    try
                    {
                        var xint = Int32.Parse(x.Substring(4));
                        var yint = Int32.Parse(y.Substring(4));
                        if (xint > yint) return 1;
                        if (yint > xint) return -1;
                        return 0;
                    }
                    catch
                    {
                        return 0;
                    }
                }

                var xparts = x.Split('.');
                var yparts = y.Split('.');

                var length = new[] { xparts.Length, yparts.Length }.Max();

                for (var i = 0; i < length; i++)
                {
                    int xint;
                    int yint;

                    if (!Int32.TryParse(xparts.ElementAtOrDefault(i), out xint)) xint = 0;
                    if (!Int32.TryParse(yparts.ElementAtOrDefault(i), out yint)) yint = 0;

                    if (xint > yint) return 1;
                    if (yint > xint) return -1;
                }

                //they're equal value but not equal strings, eg 1 and 1.0
                return 0;
            }
        }

        static bool IsSelectedDesktop(Tenant.Contracts.Entitlement e, GeneralSettings g)
        {
            return g.DesktopTheme != null && g.DesktopTheme.Id == e.ApplicationAssetPath.Replace('\\', '~');
        }

        static bool IsSelectedTablet(Tenant.Contracts.Entitlement e, GeneralSettings g)
        {
            return g.TabletTheme != null && g.TabletTheme.Id == e.ApplicationAssetPath.Replace('\\', '~');
        }

        static bool IsSelectedMobile(Tenant.Contracts.Entitlement e, GeneralSettings g)
        {
            return g.MobileTheme != null && g.MobileTheme.Id == e.ApplicationAssetPath.Replace('\\', '~');
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ThemeDTO>>> GetListThemes()
        {
            var localThemeDir = _themeRepository.GetLocalThemePath();
            var genSettings = await _generalSettingsWebApiClient.ReadSettings();
            var entitlements = (await _tenantClient.GetSiteEntitlements(this.SbApiContext.TenantId, this.SbApiContext.SiteId)).ReadAsSync();

            bool allowNonProductionThemes = false;

            if (!bool.TryParse(_settings.AppSettings("allowNonProductionThemes"), out allowNonProductionThemes) && !allowNonProductionThemes)
            {
                allowNonProductionThemes = false;
            }

            var coreEntitlements =
                Directory.GetDirectories(localThemeDir)
                .Select(x => GetEntitlementFromDirectory(x, allowNonProductionThemes))
                .Where(x => x != null);

            var themes =
                entitlements.Items
                .Where(x => x.ApplicationType == "Theme")
                .Concat(coreEntitlements)
                .Select(e => CreateDTO(e, genSettings, _logger))
                .Where(x => x != null)
                .GroupBy(t => t.VersionGroup)
                .Select(CollapseGroup)
                .ToList();

            return List2(themes);
        }

        static IComparer<string> versionComparer = new VersionStringComparer();
        static ThemeDTO CollapseGroup(IGrouping<string, ThemeDTO> themes)
        {
            var children = themes.OrderByDescending(o => o.Version, versionComparer).ToArray();
            if (children.Length > 1)
            {
                var name = children[0].Name.StartsWith("Core") ? "Core" : children[0].Name;
                return new ThemeDTO()
                {
                    Children = children,
                    Name = name,
                    Id = "_parent_" + name
                };
            }
            else
            {
                return children[0];
            }
        }

        static ThemeDTO CreateDTO(Tenant.Contracts.Entitlement e, GeneralSettings genSettings, ILogger logger)
        {
            try {
                return new ThemeDTO
                {
                    Id = e.ApplicationAssetPath.Replace('\\', '~'),
                    Name = e.ApplicationName,
                    Author = e.DeveloperAccountName,
                    InstallDate = e.UpdateDate == DateTime.MinValue ? (DateTime?)null : e.UpdateDate,
                    Status = e.Status,
                    Version = e.ApplicationVersion,
                    VersionGroup = e.AppKey.Substring(0, e.AppKey.IndexOf(e.ApplicationVersion)),
                    IsSelectedDesktop = IsSelectedDesktop(e, genSettings),
                    IsSelectedMobile = IsSelectedMobile(e, genSettings),
                    IsSelectedTablet = IsSelectedTablet(e, genSettings),
                    Leaf = true
                };
            }
            catch (ArgumentOutOfRangeException ex)
            {
                logger.Error("blew up when trying to make DTO for theme in substring", ex, new { Id = e.ApplicationAssetPath.Replace('\\', '~'), Version = e.ApplicationVersion, AppKey = e.AppKey });
            }
            catch (Exception ex)
            {
                logger.Error("hard fail making theme DTO", ex, new { Id = e.ApplicationAssetPath.Replace('\\', '~'), Version = e.ApplicationVersion, AppKey = e.AppKey });
            }
            return null;
        }

        [HttpGetRoute(UriTemplate = "applied")]
        public async Task<Response<List<ThemeDTO>>> GetListAppliedThemes()
        {
            var themeIds = new List<string>();
            var entitlements = (await _tenantClient.GetSiteEntitlements(this.SbApiContext.TenantId, this.SbApiContext.SiteId)).ReadAsSync();

            var localThemeDir = _themeRepository.GetLocalThemePath();
            var genSettings = await _generalSettingsWebApiClient.ReadSettings();

            if (genSettings.DesktopTheme != null && !String.IsNullOrEmpty(genSettings.DesktopTheme.Id))
            {
                var id = genSettings.DesktopTheme.Id;
                themeIds.Add(id);
            }

            if (genSettings.TabletTheme != null && !String.IsNullOrEmpty(genSettings.TabletTheme.Id))
            {
                var id = genSettings.TabletTheme.Id;
                if (!themeIds.Contains(id))
                {
                    themeIds.Add(id);
                }
            }

            if (genSettings.MobileTheme != null && !String.IsNullOrEmpty(genSettings.MobileTheme.Id))
            {
                var id = genSettings.MobileTheme.Id;
                if (!themeIds.Contains(id))
                {
                    themeIds.Add(id);
                }
            }

            if (themeIds.Count() == 0)
            {
                var theme = _themeRepository.GetThemeOrDefault(new ThemeSelection() { Id = null });

                themeIds.Add(theme.Id);
            }

            var themes = themeIds.Select(x =>
            {
                var theme = _themeRepository.GetThemeSlim(new ThemeSelection() { Id = x });

                var entitlement = entitlements.Items.FirstOrDefault(e => e.ApplicationAssetPath.Replace('\\', '~') == theme.Id);

                var version = entitlement != null ? entitlement.ApplicationVersion : null;

                return new ThemeDTO(genSettings, theme, version: version);
            });

            return List2(themes.ToList());
        }

        [HttpPostRoute(UriTemplate = "addons/update/{themeId}")]
        public async Task<Response<List<ThemeDTO>>> UpdateAddons(string themeId, string[] addons)
        {
            var retval = await _themeSettingsRepository.SaveSingleValue(ThemeSettingsRepository.ADDONKEY, addons, themeId);
            return SuccessWithTotal2<List<ThemeDTO>>(0);
        }

        [HttpPostRoute(UriTemplate = "apply/{id}/{method}")]
        public async Task<Response<List<ThemeDTO>>> ApplyTheme(string id, Boolean method)
        {
            var settings = await _generalSettingsWebApiClient.ReadSettings();
            string lastTheme = null;

            var theme = _themeRepository.GetTheme(new ThemeSelection { Id = id });

            if (theme.IsDesktop.GetValueOrDefault(false))
            {
                if (method)
                {
                    lastTheme = settings.DesktopTheme != null ? settings.DesktopTheme.Id : null;
                    settings.DesktopTheme = new ThemeSelection { Id = id };
                }

                else if (settings.DesktopTheme != null && settings.DesktopTheme.Id == id)
                {
                    settings.DesktopTheme = null;
                }
            }

            if (theme.IsTablet.GetValueOrDefault(false))
            {
                if (method)
                {
                    lastTheme = lastTheme ?? (settings.TabletTheme != null ? settings.TabletTheme.Id : null);
                    settings.TabletTheme = new ThemeSelection { Id = id };
                }

                else if (settings.TabletTheme != null && settings.TabletTheme.Id == id)
                {
                    settings.TabletTheme = null;
                }
            }

            if (theme.IsMobile.GetValueOrDefault(false))
            {
                if (method)
                {
                    lastTheme = lastTheme ?? (settings.MobileTheme != null ? settings.MobileTheme.Id : null);
                    settings.MobileTheme = new ThemeSelection { Id = id };
                }

                else if (settings.MobileTheme != null && settings.MobileTheme.Id == id)
                {
                    settings.MobileTheme = null;
                }
            }

            if (lastTheme != null && method)
            {
                var resp = _themeSettingsRepository.GetInstanceValues(id).Result;

                if (resp == null || !resp.HasValues)
                {
                    var oldValues = _themeSettingsRepository.GetInstanceValues(lastTheme).Result;
                    await _themeSettingsRepository.SaveInstanceValues(oldValues, id);
                }

            }

            _generalSettingsWebApiClient.UpdateThemeCore(settings);

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
                    Id = Mozu.SiteBuilder.Mvc.Constants.DefaultTheme
                };
            }

            if (newDesktop != null)
            {

                settings.DesktopTheme.Id = newDesktop.Id;

                // intent to set a desktop theme.
                // settings.DesktopTheme = new ThemeSelection() {Id = newDesktop.Id};
            }
            else if (themes.Any(t => t.Id == settings.DesktopTheme.Id))
            {
                // intent to un-set the desktop theme.
                // having NO desktop theme is not a legal state, so we will set the theme to the default.
                newDesktop = new ThemeDTO(settings, _themeRepository.GetDefaultTheme(), true);
                if (!themes.Any(t => t.Equals(newDesktop)))
                    themes.Add(newDesktop);
                settings.DesktopTheme.Id = newDesktop.Id;
            }

            settings.MobileTheme = GetThemeSelection(newMobile, settings.MobileTheme, themes);
            settings.TabletTheme = GetThemeSelection(newTablet, settings.TabletTheme, themes);

            _generalSettingsWebApiClient.UpdateThemeCore(settings);

            // the UI returns the ThemeDTO without a thumbnail (to minimize the payload). But if we pass the same ThemeDTO without
            // a thumbnail back to them, the UI will update to have no thumbnail. So we have to loop over the provided ThemeDTO objects
            // and construct a new one to return to them.

            var returnedThemesList =
                from t in themes
                let isSelectedDesktop = (newDesktop != null && newDesktop.Equals(t)) || (newDesktop == null && t.Id.Equals(settings.DesktopTheme.Id))
                let isSelectedMobile = (newMobile != null && newMobile.Equals(t)) || (newMobile == null && settings.MobileTheme != null && t.Equals(settings.MobileTheme.Id))
                let isSelectedTablet = (newTablet != null && newTablet.Equals(t)) || (newTablet == null && settings.TabletTheme != null && t.Equals(settings.TabletTheme.Id))
                let fullTheme = _themeRepository.GetThemeSlim(new ThemeSelection() { Id = t.Id })
                select new ThemeDTO(settings, fullTheme, isSelectedDesktop, isSelectedMobile, isSelectedTablet);

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
