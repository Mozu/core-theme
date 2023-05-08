using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Reflection;
using System.Runtime.Serialization;
using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Extensions;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Money;
using Mozu.Core.Settings;
using Mozu.Location.Contracts;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Context;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Mozu.Tenant.Contracts.Clients;
using CheckoutSettings = Mozu.SiteBuilder.UX.Models.Settings.CheckoutSettings;
using Theme = Mozu.SiteBuilder.Mvc.Themes.Theme;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public interface ISiteContext
    {
        bool SiteExists { get; set; }
        int TenantId { get; }
        int SiteId { get; }
    
        string HashString { get; }
        Dictionary<string, string> Labels { get; set; }
        string ThemeId { get; }
        GeneralSettings GeneralSettings { get; set; }
        CheckoutSettings CheckoutSettings { get; set; }
        ThemeRuntimeSettingsCollection ThemeSettings { get; set; }
        Theme Theme { get; set; }
        bool IsEditMode { get; set; }
        string CdnPrefix { get; }
        string SecureHost { get; set; }
        bool SupportsInStorePickup { get; set; }

        string SiteSubdirectory { get; set; }
        SiteDomains Domains { get; set; }
        Core.Money.Currency CurrencyInfo { get; set; }
        NumberFormatInfo NumberFormat { get; set; }
  
        Mozu.ProductRuntime.Contracts.CurrencyExchangeRate CurrencyExchangeRate { get; set; }

        Task Init();

    }
    public class SiteContext : ISiteContext
    {
        public const string FORCE_THEME_QUERY_NAME = "theme";
        public const string FORCE_THEME_COOKIE_NAME = "SBTHEME";
        internal const string COOKIENAME = "SBCONTEXT";
        ISiteBuilderContextProvider _siteBuilderContextDataProvider;
        private readonly ICookieProvider _cookieProvider;
        ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly IMobileDetectionProvider _mobileDetectionProvider;
        private readonly ISettings _settings;
        private readonly Lazy<IThemeRepository> _themeRepository;
        private readonly Lazy<IThemeSettingsRepository> _themeSettingsRepository;
        private CheckoutSettings _checkoutSettings;
        private GeneralSettings _generalSettings;
        private string _hash;
        

        public bool SiteExists { get; set; }

        private Task _initTask;
        private Dictionary<string, string> _labels;
        private bool? _supportsInStorePickup;
        private Theme _theme;
        private string _currentHost;
        //private string _themeId;
        private ThemeSelection _themeSelection;
        private ThemeRuntimeSettingsCollection _themeRuntimeSettingsCollection;
        private string _themeOverrideId = null;


        public SiteContext(HttpContext context,
            ISiteBuilderApiContext siteBuilderApiContext,
            ISiteBuilderContextProvider siteBuilderContextDataProvider , 
            IMobileDetectionProvider mobileDetectionProvider,
            ICookieProvider cookieProvider,
            Lazy<IThemeRepository> themeRepository,
            Lazy<IThemeSettingsRepository> themeSettingsRepository,
            ISettings settings)
        {
            _siteBuilderContextDataProvider = siteBuilderContextDataProvider;
            _mobileDetectionProvider = mobileDetectionProvider;
            _cookieProvider = cookieProvider;
            _settings = settings;
            _siteBuilderApiContext = siteBuilderApiContext;
            _themeRepository = themeRepository;
            _themeSettingsRepository = themeSettingsRepository;
            SiteExists = siteBuilderApiContext.SiteId.HasValue;
            if (Enum.TryParse(_siteBuilderApiContext.CurrencyCode, out CurrencyCode cc))
            {
                CurrencyInfo = CurrencyRepository.Get(cc);
                NumberFormat = new NumberFormatInfo()
                {
                    CurrencyDecimalDigits = this.CurrencyInfo.Precision,
                    CurrencySymbol = this.CurrencyInfo.Symbol
                };
            }
            InitFromContext(context, cookieProvider);

        }

        private void InitFromContext(HttpContext context, ICookieProvider cookieProvider)
        {
            //can fault if parts of httpcontext are disposed
            if (context != null)
            {
                try
                {
                    

                    var url = context.GetRequestUri().ToString();

                    if (context.Request.Headers.TryGetValue(Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out var values))
                    {
                        url = values.FirstOrDefault();
                    }

                    var uriBuilder = new UriBuilder(url);

                    _currentHost = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);
                    uriBuilder.Port = 443;
                    uriBuilder.Scheme = "https";
                    var secure = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);
                    SecureHost = _settings.CoreSettings.IsSSLValidationEnabled ? secure : _currentHost;
                    _themeOverrideId = ProcessThemeOverride(_currentHost, context, cookieProvider);
                }
                catch { }
            }
        }

        public static string FindThemeValue(string inputString) {
            string regexPattern = @"(?<=t\d+-s\d+-thm)\d+-\d+";
            var match = Regex.Match(inputString, regexPattern);
            if (match.Success)
            {
                return "~"+ match.Value.Replace("-", "~");
            }
            return null; // return null if no match is found
        }

        public static string ProcessThemeOverride(string currentHost, HttpContext context, ICookieProvider cookieProvider)
        {
            if ( context == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(currentHost))
            {
                var themeValue = FindThemeValue(currentHost);
                if (!string.IsNullOrEmpty(themeValue))
                {
                    return themeValue;
                }
            }
            
            var nvc = context.Request.Query;
            if (nvc.Keys != null && nvc.Keys.Cast<string>().Contains(FORCE_THEME_COOKIE_NAME))
            {
                return nvc[FORCE_THEME_COOKIE_NAME];
            }
           
            if (nvc.Keys != null && nvc.Keys.Cast<string>().Contains(FORCE_THEME_QUERY_NAME, StringComparer.OrdinalIgnoreCase))
            {
                return nvc[FORCE_THEME_QUERY_NAME];
            }
            
            var cookie = cookieProvider.GetRequestCookie(FORCE_THEME_COOKIE_NAME);
            if (cookie != null && !string.IsNullOrEmpty(cookie.Value ))
            {
               return cookie.Value;
            }
            return null;
        }

        public int TenantId => _siteBuilderApiContext.TenantId;

        public int SiteId => _siteBuilderApiContext.SiteId.GetValueOrDefault(-1);

        public string HashString
        {
            get
            {
                var task = Init();
                if (!task.IsCompleted)
                {
                    task.Wait();
                }
                return _hash;
            }
            set => _hash = value;
        }


        public Dictionary<string, string> Labels
        {
            get
            {
                if (_labels != null) return _labels;

                if (!Theme.MergedLabels.TryGetValue(_siteBuilderApiContext.LocaleCode, out var tlc))
                {
                    tlc = Theme.MergedLabels["en-US"];
                }
                _labels = tlc;
                return _labels;
            }
            set => _labels = value;
        }

        public string ThemeId
        {
            get
            {
                if (_themeSelection  == null)
                {
                    Init().Wait();
                }

                return _themeSelection.Id ;
            }
           // set { _themeId = value; }
        }

        public GeneralSettings GeneralSettings
        {
            get
            {
                if (_generalSettings == null)
                {
                    Init().Wait();
                }

                return _generalSettings;
            }
            set => _generalSettings = value;
        }

        public CheckoutSettings CheckoutSettings
        {
            get
            {
                if (_checkoutSettings == null)
                {
                    Init().Wait();
                }

                return _checkoutSettings;
            }
            set => _checkoutSettings = value;
        }

        public ThemeRuntimeSettingsCollection ThemeSettings
        {
            get
            {
                if (_themeRuntimeSettingsCollection == null)
                {
                    Init().Wait();
                }
                return _themeRuntimeSettingsCollection;
            }
            set => _themeRuntimeSettingsCollection = value;
        }

        [IgnoreDataMember]
        public Theme Theme
        {
            get
            {
                if (_theme == null)
                {
                    Init().Wait();
                }

                return _theme;
            }
            set => _theme = value;
        }
        
        public bool IsEditMode { get; set; }

        string _cdnPrefix;
        public string CdnPrefix
        {
            get
            {
                if (_cdnPrefix != null) return _cdnPrefix;

                if (_siteBuilderApiContext.DebugFlags.HasFlag(DebugModeFlagValues.DisableCdn))
                {
                    _cdnPrefix = _currentHost;
                }
                else {
                    _cdnPrefix = "//" + (
                                          string.IsNullOrWhiteSpace(GeneralSettings.CustomCdnHostName) ? _settings.AppSettings("CdnHost") : GeneralSettings.CustomCdnHostName)
                                      + "/" + _siteBuilderApiContext.TenantId + "-" + _siteBuilderApiContext.SiteId;
                }

                if (_settings.AppSettings("disableCDN") == "true")
                {
                    _cdnPrefix = "";
                }
                return _cdnPrefix;
            }
            //set { }
        }

        public string SecureHost { get; set; }

        public bool SupportsInStorePickup
        {
            get
            {
                if (_supportsInStorePickup == null)
                {
                    Init().Wait();
                }
                return _supportsInStorePickup.GetValueOrDefault(false);
            }
            set => _supportsInStorePickup = value;
        }
        SiteDomains _domains;
        public SiteDomains Domains
        {
            get
            {
                if (_domains == null)
                {
                    Init().Wait();
                }
                return _domains;
            }
            set => _domains = value;
        }

        public static void Save(int? site, int? masterCatalog, int tenant, bool isEditMode, DataViewModeType dataViewMode, ICookieProvider cookieProvider, int? catalogid, string locale = null, string currency = null, bool isAdminMode = false)
        {
            var cookie = new CookieOptions {Expires = DateTimeOffset.MaxValue};

            var val = new Dictionary<string, string>
            {
                ["site"] = site.HasValue ? site.ToString() : null,
                ["locale"] = locale,
                ["currency"] = currency,
                ["masterCatalog"] = masterCatalog.HasValue ? masterCatalog.ToString() : null,
                ["catalog"] = catalogid.HasValue ? catalogid.ToString() : null,
                ["tenant"] = tenant.ToString(),
                ["editmode"] = isEditMode.ToString(),
                ["adminmode"] = isAdminMode.ToString()
            };

            if (dataViewMode == DataViewModeType.Pending)
            {
                val["dataview"] = DataViewModeType.Pending.ToString();
            }
            cookieProvider.SaveResponseCookie(COOKIENAME, val, cookie);
        }

        static byte[] _assbmlyHash;
        static byte[] AssemblyHash
        {
            get
            {
                if (_assbmlyHash != null) return _assbmlyHash;

                var ass = typeof(SiteContext).Assembly;
                var assemblyInfo = ((AssemblyInformationalVersionAttribute)ass.GetCustomAttributes(typeof(AssemblyInformationalVersionAttribute), false).FirstOrDefault() ?? new AssemblyInformationalVersionAttribute("local")).InformationalVersion;
                var version = ass.GetName().Version.ToString();
                _assbmlyHash = Encoding.UTF8.GetBytes(assemblyInfo + version);
                return _assbmlyHash;

            }
        }
       
        public  Task Init()
        {
            return _initTask ??= DoInit();
        }
        private async Task DoInit()
        { 
            if (!_siteBuilderApiContext.SiteId.HasValue)
            {
                return;
            }
            var data = await _siteBuilderContextDataProvider.GetContextDataAsync().ConfigureAwait(false);
            _domains = new SiteDomains(_currentHost, data.GetMappedSiteDomains());
            SiteSubdirectory = data.GetSiteSubDirectory();
            _generalSettings  = data.GetMappedGeneralSettings();
            _checkoutSettings = data.GetMappedCheckoutSettings();

            if (data.LocationUsages?.Items != null)
            {
                SupportsInStorePickup = data.LocationUsages.Items.Any(x => x.LocationUsageTypeCode == "SP" && x.LocationTypeCodes != null && x.LocationTypeCodes.Any());
            }
            
            if (!string.IsNullOrEmpty(_themeOverrideId))
            {
                _themeSelection = new ThemeSelection() { Id = _themeOverrideId };
               
            }
            else if (_mobileDetectionProvider.IsCurrentRequestMobile && (_generalSettings.MobileTheme != null && !string.IsNullOrEmpty(_generalSettings.MobileTheme.Id)))
            {
                _themeSelection = _generalSettings.MobileTheme;
            }
            else if (_mobileDetectionProvider.IsCurrentRequestTablet && (_generalSettings.TabletTheme != null && !string.IsNullOrEmpty(_generalSettings.TabletTheme.Id)))
            {
               _themeSelection = _generalSettings.TabletTheme;
            }
            else
            {
                 _themeSelection = _generalSettings.DesktopTheme;
            }

            if ( string.IsNullOrEmpty(_themeSelection?.Id  ))
            {
                _themeSelection = ThemeRepository.DefaultThemeSelection;
            }

            if (data.Themes.TryGetValue(_themeSelection.Id, out var entry))
            {
                _theme = entry.Item1;
                _themeRuntimeSettingsCollection = entry.Item2 ?? ((entry.Item1 == null) ? null : new ThemeRuntimeSettingsCollection());
            }
            //for theme override... eg preview
            if ( _theme == null )
            {
                _theme = await _themeRepository.Value.GetThemeOrDefault(_themeSelection).ConfigureAwait(false);
            }

            
            _themeRepository.Value.FixupPaths(_theme);
            
            _themeRuntimeSettingsCollection ??= await _themeSettingsRepository.Value.GetRuntimeValues(_theme.Id).ConfigureAwait(false);

            bool isSandBox = _settings.CoreSettings.ScaleUnitId.IndexOf("sb", StringComparison.OrdinalIgnoreCase) > -1;
            var hash = data.ThemeHash;
            if (isSandBox && _theme != null)
            {
                await _themeRepository.Value.ValidateLatest(_theme).ConfigureAwait(false);
                hash += _theme.Hash;
            }
            if (!string.IsNullOrEmpty(_siteBuilderApiContext.CurrencyCodeOverride))
            {
                CurrencyExchangeRate = data.CurrencyExchangeRates?.FirstOrDefault(_ => _.ToCurrencyCode == _siteBuilderApiContext.CurrencyCodeOverride);
            }

            HashString = hash + _themeOverrideId;
        }

        [IgnoreDataMember]
        public ProductRuntime.Contracts.CurrencyExchangeRate CurrencyExchangeRate { get; set; }

        public Currency CurrencyInfo { get; set; }

        [Newtonsoft.Json.JsonIgnore]
        [System.Text.Json.Serialization.JsonIgnore]
        public NumberFormatInfo NumberFormat { get; set; }

        public string SiteSubdirectory
        {
            get;set;
        }
    }
}