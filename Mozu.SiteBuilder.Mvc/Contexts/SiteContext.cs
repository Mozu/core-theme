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
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Client;
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


        public SiteContext(HttpRequestMessage requestMessage ,
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
            _themeOverrideId = ProcessThemeOverride(requestMessage, cookieProvider);
            SiteExists = siteBuilderApiContext.SiteId.HasValue;
            string url = requestMessage.RequestUri.ToString();
            
            IEnumerable<string> values;
            if (requestMessage.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out values))
            {
                url = values.FirstOrDefault();
            }

           

            var uriBuilder = new UriBuilder(url);

            _currentHost = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);
            uriBuilder.Port = 443;
            uriBuilder.Scheme = "https";
            string secure = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);

            SecureHost = _settings.CoreSettings.IsSSLValidationEnabled ? secure : _currentHost;
            
            Mozu.Core.Money.CurrencyCode cc;
            if (Mozu.Core.Money.CurrencyCode.TryParse(_siteBuilderApiContext.CurrencyCode, out cc))
            {
                this.CurrencyInfo = Mozu.Core.Money.CurrencyRepository.Get(cc);

                this.NumberFormat = new NumberFormatInfo()
                {
                    CurrencyDecimalDigits = this.CurrencyInfo.Precision,
                    CurrencySymbol = this.CurrencyInfo.Symbol
                };
            }
            
        }

       

        private string ProcessThemeOverride(HttpRequestMessage requestMessage, ICookieProvider cookieProvider)
        {
            var nvc = requestMessage.RequestUri.ParseQueryString();
            if ( nvc.Keys != null && nvc.Keys.Cast<string>().Contains(FORCE_THEME_COOKIE_NAME))
            {
                return nvc[FORCE_THEME_COOKIE_NAME];
            }
           
            else
            {
                var cookie = cookieProvider.GetRequestCookie(FORCE_THEME_COOKIE_NAME);
                if (cookie != null && !string.IsNullOrEmpty(cookie.Value ))
                {
                   return  cookie.Value;
                }
            }
            return null;

        }

        public int TenantId
        {
            get { return _siteBuilderApiContext.TenantId; }
        }
        public int SiteId
        {
            get { return _siteBuilderApiContext.SiteId.GetValueOrDefault(-1); }
        }
        
        public string HashString
        {
            get
            {
                Task task = Init();
                if (!task.IsCompleted)
                {
                    task.Wait();
                }
                return _hash;
            }
            set { _hash = value; }
        }


        public Dictionary<string, string> Labels
        {
            get
            {
                if (_labels == null)
                {
                    ThemeLabelCollection tlc;
                    if (!Theme.MergedLabels.TryGetValue(_siteBuilderApiContext.LocaleCode, out tlc))
                    {
                        tlc = Theme.MergedLabels["en-US"];
                    }
                    _labels = tlc;

                }
                return _labels;
            }
            set { _labels = value; }
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
            set { _generalSettings = value; }
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
            set { _checkoutSettings = value; }
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
            set { _themeRuntimeSettingsCollection = value; }
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
            set { _theme = value; }
        }
        
        public bool IsEditMode { get; set; }

        string _cdnPrefix;
        public string CdnPrefix
        {
            get
            {
                if (_cdnPrefix == null)
                {
                    if (this._siteBuilderApiContext.DebugFlags.HasFlag(DebugModeFlagValues.DisableCdn))
                    {
                        _cdnPrefix = this._currentHost;
                    }
                    else {
                        _cdnPrefix = "//" + (
                            string.IsNullOrWhiteSpace(this.GeneralSettings.CustomCdnHostName) ? _settings.AppSettings("CdnHost") : this.GeneralSettings.CustomCdnHostName)
                            + "/" + _siteBuilderApiContext.TenantId + "-" + _siteBuilderApiContext.SiteId;
                    }

                    if (_settings.AppSettings("disableCDN") == "true")
                    {
                        _cdnPrefix = "";
                    }
                   
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
            set { _supportsInStorePickup = value; }
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
            set { _domains = value; }
        }

        public static void Save(int? site, int? masterCatalog, int tenant, bool isEditMode, DataViewModeType dataViewMode, ICookieProvider cookieProvider, int? catalogid, string locale = null, string currency = null, bool isAdminMode = false)
        {
            var cookie = new HttpCookie("") {Expires = DateTime.MaxValue};

            cookie["site"] = site.HasValue ? site.ToString() : null;
            cookie["locale"] = locale;
            cookie["currency"] = currency;
            cookie["masterCatalog"] = masterCatalog.HasValue ? masterCatalog.ToString() : null;
            cookie["catalog"] = catalogid.HasValue ? catalogid.ToString() : null;
            cookie["tenant"] = tenant.ToString();
            cookie["editmode"] = isEditMode.ToString();
            cookie["adminmode"] = isAdminMode.ToString();
            if (dataViewMode == DataViewModeType.Pending)
            {
                cookie["dataview"] = DataViewModeType.Pending.ToString();
            }
            cookieProvider.SaveResponseCookie(COOKIENAME, cookie);
        }

        static byte[] _assbmlyHash;
        static byte[] AssemblyHash
        {
            get
            {
                if (_assbmlyHash == null)
                {
                    var ass = typeof(SiteContext).Assembly;
                    var assemblyInfo = ((AssemblyInformationalVersionAttribute)ass.GetCustomAttributes(typeof(AssemblyInformationalVersionAttribute), false).FirstOrDefault() ?? new AssemblyInformationalVersionAttribute("local")).InformationalVersion;
                    var version = ass.GetName().Version.ToString();
                    _assbmlyHash = System.Text.Encoding.UTF8.GetBytes(assemblyInfo + version);
                }
                return _assbmlyHash;

            }
        }

        
       
        public  Task Init()
        {
            return _initTask = _initTask ?? DoInit();
        }
        private async Task DoInit()
        { 
            if (!_siteBuilderApiContext.SiteId.HasValue)
            {
                return;
            }
            var data = await _siteBuilderContextDataProvider.GetContextDataAsync().ConfigureAwait(false);
            _domains = new SiteDomains(_currentHost, data.GetMappedSiteDomains());
            this.SiteSubdirectory = data.GetSiteSubDirectory();
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
            Tuple<Theme, ThemeRuntimeSettingsCollection> entry;
            if (data.Themes.TryGetValue(_themeSelection.Id, out entry))
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
            
            _themeRuntimeSettingsCollection = _themeRuntimeSettingsCollection ?? await _themeSettingsRepository.Value.GetRuntimeValues(_theme.Id).ConfigureAwait(false);


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
        public Mozu.ProductRuntime.Contracts.CurrencyExchangeRate CurrencyExchangeRate { get; set; }


        public Core.Money.Currency CurrencyInfo { get; set; }

        [Newtonsoft.Json.JsonIgnore()]
        public NumberFormatInfo NumberFormat { get; set; }

        public string SiteSubdirectory
        {
            get;set;
        }

      
    }
}