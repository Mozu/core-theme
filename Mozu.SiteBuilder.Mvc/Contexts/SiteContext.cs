using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Net;
using System.Net.Http;
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
        byte[] Hash { get; }
        string HashString { get; }
        Dictionary<string, string> Labels { get; set; }
        string ThemeId { get; }
        GeneralSettings GeneralSettings { get; set; }
        CheckoutSettings CheckoutSettings { get; set; }
        ThemeRuntimeSettingsCollection ThemeSettings { get; set; }
        Theme Theme { get; set; }
        bool IsEditMode { get; set; }
        string CdnPrefix { get; set; }
        string SecureHost { get; set; }
        bool SupportsInStorePickup { get; set; }
        SiteDomains Domains { get; set; }
        Core.Money.Currency CurrencyInfo { get; set; }
        NumberFormatInfo NumberFormat { get; set; }
        Task Init();

    }
    public class SiteContext : ISiteContext
    {
        public const string FORCE_THEME_COOKIE_NAME = "SBTHEME";
        internal const string COOKIENAME = "SBCONTEXT";
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
      //  private readonly ICookieProvider _cookieProvider;
        private readonly IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private readonly ILocationSettingsWebApiClient _locationSettingsWebApiClient;
        private readonly IMobileDetectionProvider _mobileDetectionProvider;
        private readonly ISettings _settings;
        private readonly ISitesWebApiClient _sitesWebApiClient;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly IThemeRepository _themeRepository;
        private readonly Lazy<IThemeSettingsRepository> _themeSettingsRepository;
        private CheckoutSettings _checkoutSettings;
        private GeneralSettings _generalSettings;
        private byte[] _hash;
        private string _hashString;

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
        public SiteContext(IGeneralSettingsWebApiClient generalSettingsWebApiClient, Lazy<IThemeSettingsRepository> themeSettingsRepository, IThemeRepository themeRepository, IMobileDetectionProvider mobileDetectionProvider, ICookieProvider cookieProvider, ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, ISiteBuilderApiContext siteBuilderApiContext, ISettings settings, ILocationSettingsWebApiClient locationSettingsWebApiClient, Mozu.Tenant.Contracts.Clients.ISitesWebApiClient sitesWebApiClient,  HttpRequestMessage requestMessage)
        {
            SiteExists = true;
            _generalSettingsWebApiClient = generalSettingsWebApiClient.CloneWithoutUserClaims();
            _themeSettingsRepository = themeSettingsRepository;
            _themeRepository = themeRepository;
            _mobileDetectionProvider = mobileDetectionProvider;
           // _cookieProvider = cookieProvider;
            _siteBuilderApiContext = siteBuilderApiContext;
            _locationSettingsWebApiClient = locationSettingsWebApiClient.CloneWithoutUserClaims();
            _settings = settings;
            _sitesWebApiClient = sitesWebApiClient.CloneWithoutUserClaims();
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient.CloneWithoutUserClaims();
            CdnPrefix = settings.AppSettings("CdnHost");


            _themeOverrideId = ProcessThemeOverride(requestMessage, cookieProvider);


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

            if (!string.IsNullOrEmpty(CdnPrefix))
            {
                CdnPrefix = "//" + CdnPrefix + "/" + siteBuilderApiContext.TenantId + "-" + siteBuilderApiContext.SiteId;
            }
            if (settings.AppSettings("disableCDN") == "true")
            {
                CdnPrefix = null;
            }

            Mozu.Core.Money.CurrencyCode cc;
            if (Mozu.Core.Money.CurrencyCode.TryParse(siteBuilderApiContext.CurrencyCode, out cc))
            {
                this.CurrencyInfo = Mozu.Core.Money.CurrencyRepository.Get(cc);

                this.NumberFormat= new NumberFormatInfo()
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
                HttpCookie cookie = cookieProvider.GetRequestCookie(FORCE_THEME_COOKIE_NAME);
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
        public byte[] Hash
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

        public string HashString
        {
            get
            {
                if (_hashString == null)
                {
                    byte[] hash = Hash;
                    _hashString = Convert.ToBase64String(hash);
                }
                return _hashString;
            }
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

        //Task<Mozu.SiteSettings.Order.Contracts.CheckoutSettings> GetCheckoutSettings()
        //{
        //    return _checkoutSettingsWebApiClient.GetCheckoutSettings().ContinueWith(x => x.Result.ReadAsSync());
        //}
        //Task<Mozu.SiteSettings.General.Contracts.GeneralSettings> GetGeneralSettings()
        //{
        //    return _generalSettingsWebApiClient.GetGeneralSettings().ContinueWith(x => x.Result.ReadAsSync());
        //}


        public bool IsEditMode { get; set; }

        public string CdnPrefix { get; set; }

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

        public static void Save(int? site, int? masterCatalog, int tenant, bool isEditMode, DataViewModeType dataViewMode, ICookieProvider cookieProvider, int? catalogid, string locale = null, string currency = null)
        {
            var cookie = new HttpCookie("") {Expires = DateTime.MaxValue};

            cookie["site"] = site.HasValue ? site.ToString() : null;
            cookie["locale"] = locale;
            cookie["currency"] = currency;
            cookie["masterCatalog"] = masterCatalog.HasValue ? masterCatalog.ToString() : null;
            cookie["catalog"] = catalogid.HasValue ? catalogid.ToString() : null;
            cookie["tenant"] = tenant.ToString();
            cookie["editmode"] = isEditMode.ToString();
            if (dataViewMode == DataViewModeType.Pending)
            {
                cookie["dataview"] = DataViewModeType.Pending.ToString();
            }
            cookieProvider.SaveResponseCookie(COOKIENAME, cookie);
        }

        public Task Init()
        {
            if (_initTask == null)
            {
                var genSettingsTask = _generalSettingsWebApiClient.GetGeneralSettings();
                var checkoutSettingsTask = _checkoutSettingsWebApiClient.GetCheckoutSettings();
                var locSettingsTask = _locationSettingsWebApiClient.GetLocationUsages();
                var siteTask = _sitesWebApiClient.GetSite(_siteBuilderApiContext.SiteId, false);
                Task settingsServiceTasks = Task.WhenAll(genSettingsTask, checkoutSettingsTask, locSettingsTask, siteTask);

                Task<Task<SiteContext>> initTask = settingsServiceTasks.ContinueWith(task =>
                {
                    MD5 md5 = new MD5CryptoServiceProvider();
                    if (siteTask.Result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                    {
                        this.SiteExists = false;
                        return  Task<SiteContext>.FromResult(this);
                    }
                    var sitesDc = siteTask.Result.ReadAsSync();
                    this.Domains = new SiteDomains(_currentHost, Mapper.Map<List<SiteDomain>>(sitesDc.Domains));
                
                    SiteSettings.General.Contracts.GeneralSettings genSettingsDC = genSettingsTask.Result.ReadAsSync();
                    SiteSettings.Order.Contracts.CheckoutSettings checkoutSettingsDC = checkoutSettingsTask.Result.ResponseMessage.IsSuccessStatusCode? checkoutSettingsTask.Result.ReadAsSync() : FalloverCheckoutSettings;
                    _generalSettings = Mapper.Map<GeneralSettings>(genSettingsDC);
                    _checkoutSettings = Mapper.Map<CheckoutSettings>(checkoutSettingsDC, opt => opt.Items["countryCode"] = sitesDc.CountryCode);
                    md5.HashAuditInfo(genSettingsDC.AuditInfo).
                        HashAuditInfo(checkoutSettingsDC.CustomerCheckoutSettings.AuditInfo).
                        HashAuditInfo(checkoutSettingsDC.OrderProcessingSettings.AuditInfo).
                        HashAuditInfo(checkoutSettingsDC.PaymentSettings.AuditInfo);
                        //HashAuditInfo(sitesDc.Domains);

                    if (locSettingsTask.Result.ResponseMessage.IsSuccessStatusCode)
                    {
                        LocationUsageCollection locSettingsDc = locSettingsTask.Result.ReadAsSync();
                        //todo hash audit info.
                        if (locSettingsDc.Items != null)
                        {
                            locSettingsDc.Items.ForEach(x => md5.HashAuditInfo(x.AuditInfo));

                            SupportsInStorePickup = locSettingsDc.Items.Any(x => x.LocationUsageTypeCode == "SP" && x.LocationTypeCodes != null && x.LocationTypeCodes.Any());
                        }
                        

                        
                    }

                    
                    if (!string.IsNullOrEmpty(_themeOverrideId) )
                    {
                        _themeSelection = new ThemeSelection() {Id = _themeOverrideId};
                    } 
                    else if (_mobileDetectionProvider.IsCurrentRequestMobile && ( _generalSettings.MobileTheme != null && !string.IsNullOrEmpty(_generalSettings.MobileTheme.Id )))
                    {
                        _themeSelection = _generalSettings.MobileTheme;
                    }
                    else if (_mobileDetectionProvider.IsCurrentRequestTablet && ( _generalSettings.TabletTheme != null && !string.IsNullOrEmpty(_generalSettings.TabletTheme.Id )))
                    {
                        _themeSelection = _generalSettings.TabletTheme;
                    }
                    else
                    {
#pragma warning disable 612
                        _themeSelection = _generalSettings.DesktopTheme;
                    }

                    if (_themeSelection == null)
                    {
                        _themeSelection = ThemeRepository.DefaultThemeSelection;
                    }
                    _theme = _themeRepository.GetThemeOrDefault(_themeSelection);

                    return _themeSettingsRepository.Value.GetRuntimeValues(_theme.Id).ContinueWith(task2 =>
                    {
                        _themeRuntimeSettingsCollection = task2.Result;
                        var themeSettingsTimeStamp = BitConverter.GetBytes(_themeRuntimeSettingsCollection.TimeStamp.Ticks);
                        md5.TransformBlock(themeSettingsTimeStamp, 0, themeSettingsTimeStamp.Length, themeSettingsTimeStamp, 0);
                        var themeTimeStamp = BitConverter.GetBytes(_theme.TimeStamp.Ticks);
                        md5.TransformBlock(themeTimeStamp, 0, themeTimeStamp.Length, themeTimeStamp, 0);
                        byte[] tid = Encoding.UTF8.GetBytes(_themeSelection.Id  ?? "");
                        md5.TransformFinalBlock(tid, 0, tid.Length);
                        Hash = md5.Hash;
                        //not ready for prime time
                        //var tmp = ThemeSettings[ThemeSettingsRepository.ADDONKEY] as IEnumerable;
                        //if (tmp != null)
                        //{
                        //    var ot = Theme;
                        //    var addonsIds = tmp.Cast<object>().Select(x => x.ToString()).ToArray();
                        //    Theme = _themeRepository.ApplyAddons(Theme, addonsIds);
                        //    Theme.Name = ot.Name;
                        //}
                        return this;
                    });
                });


                _initTask = initTask.Unwrap();
            }


            return _initTask;
        }

        private static SiteSettings.Order.Contracts.CheckoutSettings _falloverCheckoutSettings;
        static SiteSettings.Order.Contracts.CheckoutSettings FalloverCheckoutSettings
        {
            get
            {
                return _falloverCheckoutSettings = _falloverCheckoutSettings ?? new SiteSettings.Order.Contracts.CheckoutSettings()
                                                                         {
                                                                             CustomerCheckoutSettings = new CustomerCheckoutSettings()
                                                                                                        {
                                                                                                            AuditInfo = new Mozu.Core.Api.Contracts.AuditInfo()
                                                                                                            {
                                                                                                                CreateDate = DateTime.Now,
                                                                                                                UpdateDate = DateTime.Now
                                                                                                            },
                                                                                                            CustomerCheckoutType = ""
                                                                                                        },
                                                                             OrderProcessingSettings = new OrderProcessingSettings()
                                                                                                       {
                                                                                                           AuditInfo = new Mozu.Core.Api.Contracts.AuditInfo()
                                                                                                           {
                                                                                                               CreateDate = DateTime.Now,
                                                                                                               UpdateDate = DateTime.Now
                                                                                                           },
                                                                                                           PaymentProcessingFlowType = "",
                                                                                                          
                                                                                                       },
                                                                             PaymentSettings = new PaymentSettings()
                                                                                               {
                                                                                                   AuditInfo = new Mozu.Core.Api.Contracts.AuditInfo()
                                                                                                               {
                                                                                                                   CreateDate = DateTime.Now,
                                                                                                                   UpdateDate = DateTime.Now
                                                                                                               },
                                                                                                               ExternalPaymentWorkflowDefinitions = new List<ExternalPaymentWorkflowDefinition>(),
                                                                                                               Gateways = new List<Gateway>(),
                                                                                                               PayByMail = false
                                                                                               }

                                                                         };
                 
            }
        }



        public Core.Money.Currency CurrencyInfo { get; set; }

        [Newtonsoft.Json.JsonIgnore()]
        public NumberFormatInfo NumberFormat { get; set; }
    }
}