using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Runtime.Serialization;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Magnum.Extensions;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Settings;
using Mozu.Location.Contracts;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Constants = Mozu.Core.Api.Contracts.Constants;
using Theme = Mozu.SiteBuilder.Mvc.Themes.Theme;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class SiteContext
    {
        public const string FORCE_THEME_COOKIE_NAME = "SBTHEME";
        internal const string COOKIENAME = "SBCONTEXT";
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private readonly ICookieProvider _cookieProvider;
        private readonly IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private readonly ILocationSettingsWebApiClient _locationSettingsWebApiClient;
        private readonly IMobileDetectionProvider _mobileDetectionProvider;
        private readonly ISettings _settings;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly IThemeRepository _themeRepository;
        private readonly Lazy<IThemeSettingsRepository> _themeSettingsRepository;
        private CheckoutSettings _checkoutSettings;
        private GeneralSettings _generalSettings;
        private byte[] _hash;
        private string _hashString;

        private Task _initTask;
        private Dictionary<string, string> _labels;
        private bool? _supportsInStorePickup;
        private Theme _theme;

        private string _themeId;
        private ThemeRuntimeSettingsCollection _themeRuntimeSettingsCollection;

        public SiteContext(IGeneralSettingsWebApiClient generalSettingsWebApiClient, Lazy<IThemeSettingsRepository> themeSettingsRepository, IThemeRepository themeRepository, IMobileDetectionProvider mobileDetectionProvider, ICookieProvider cookieProvider, ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, ISiteBuilderApiContext siteBuilderApiContext, ISettings settings, ISiteBuilderApiContext apiContext, ILocationSettingsWebApiClient locationSettingsWebApiClient, HttpRequestMessage requestMessage)
        {
            _generalSettingsWebApiClient = generalSettingsWebApiClient.CloneWithoutUserClaims();
            _themeSettingsRepository = themeSettingsRepository;
            _themeRepository = themeRepository;
            _mobileDetectionProvider = mobileDetectionProvider;
            _cookieProvider = cookieProvider;
            _siteBuilderApiContext = siteBuilderApiContext;
            _locationSettingsWebApiClient = locationSettingsWebApiClient.CloneWithoutUserClaims();
            _settings = settings;
            _checkoutSettingsWebApiClient = checkoutSettingsWebApiClient.CloneWithoutUserClaims();
            CdnPrefix = settings.AppSettings("CdnHost");


            string url = requestMessage.RequestUri.ToString();
            IEnumerable<string> values;
            if (requestMessage.Headers.TryGetValues(Constants.Headers.ORIGINAL_URL, out values))
            {
                url = values.FirstOrDefault();
            }


            var uriBuilder = new UriBuilder(url);
            string unsecure = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);
            uriBuilder.Port = 443;
            uriBuilder.Scheme = "https";
            string secure = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);

            SecureHost = _settings.CoreSettings.IsSSLValidationEnabled ? secure : unsecure;

            if (!string.IsNullOrEmpty(CdnPrefix))
            {
                CdnPrefix = "//" + CdnPrefix + "/" + siteBuilderApiContext.TenantId + "-" + siteBuilderApiContext.SiteId;
            }
            if (settings.AppSettings("disableCDN") == "true")
            {
                CdnPrefix = null;
            }
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
                    _labels = Theme.MergedLabels["en-US"].ToDictionary();
                }
                return _labels;
            }
            set { _labels = value; }
        }

        public string ThemeId
        {
            get
            {
                if (_themeId == null)
                {
                    Init().Wait();
                }

                return _themeId;
            }
            set { _themeId = value; }
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

        public static void Save(int? site, int? masterCatalog, int tenant, bool isEditMode, DataViewModeType dataViewMode, ICookieProvider cookieProvider)
        {
            var cookie = new HttpCookie("") {Expires = DateTime.MaxValue};

            cookie["site"] = site.HasValue ? site.ToString() : null;
            cookie["masterCatalog"] = masterCatalog.HasValue ? masterCatalog.ToString() : null;
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
                Task<ServiceClientResponse<SiteSettings.General.Contracts.GeneralSettings>> genSettingsTask = _generalSettingsWebApiClient.GetGeneralSettings();
                Task<ServiceClientResponse<SiteSettings.Order.Contracts.CheckoutSettings>> checkoutSettingsTask = _checkoutSettingsWebApiClient.GetCheckoutSettings();
                Task<ServiceClientResponse<LocationUsageCollection>> locSettingsTask = _locationSettingsWebApiClient.GetLocationUsages();
                Task settingsServiceTasks = Task.WhenAll(genSettingsTask, checkoutSettingsTask, locSettingsTask);
                Task<Task<SiteContext>> initTask = settingsServiceTasks.ContinueWith(task =>
                {
                    MD5 md5 = new MD5CryptoServiceProvider();

                    SiteSettings.General.Contracts.GeneralSettings genSettingsDC = genSettingsTask.Result.ReadAsSync();
                    SiteSettings.Order.Contracts.CheckoutSettings checkoutSettingsDC = checkoutSettingsTask.Result.ReadAsSync();
                    _generalSettings = Mapper.Map<GeneralSettings>(genSettingsDC);
                    _checkoutSettings = Mapper.Map<CheckoutSettings>(checkoutSettingsDC);
                    md5.HashAuditInfo(genSettingsDC.AuditInfo).
                        HashAuditInfo(checkoutSettingsDC.CustomerCheckoutSettings.AuditInfo).
                        HashAuditInfo(checkoutSettingsDC.OrderProcessingSettings.AuditInfo).
                        HashAuditInfo(checkoutSettingsDC.PaymentSettings.AuditInfo);


                    if (locSettingsTask.Result.ResponseMessage.IsSuccessStatusCode)
                    {
                        LocationUsageCollection locSettingsDc = locSettingsTask.Result.ReadAsSync();
                        //todo hash audit info.
                        var block = BitConverter.GetBytes(locSettingsTask.Result.ResponseMessage.Content.Headers.ContentLength.GetValueOrDefault(0));

                        md5.TransformBlock(block, 0, block.Length, block, 0);
                        SupportsInStorePickup = locSettingsDc.Items.Any(x => x.LocationUsageTypeCode == "SP");
                    }

                    HttpCookie cookie = _cookieProvider.GetRequestCookie(FORCE_THEME_COOKIE_NAME);

                    if (cookie != null && !string.IsNullOrEmpty(cookie.Value))
                    {
                        _themeId = cookie.Value;
                    }
                    else if (_mobileDetectionProvider.IsCurrentRequestMobile && !string.IsNullOrEmpty(_generalSettings.MobileTheme))
                    {
                        _themeId = _generalSettings.MobileTheme;
                    }
                    else
                    {
#pragma warning disable 612
                        _themeId = _generalSettings.Theme;
                    }

                    _theme = _themeRepository.GetThemeOrDefault(_themeId);

                    return _themeSettingsRepository.Value.GetRuntimeValues(_theme.Id).ContinueWith(task2 =>
                    {
                        _themeRuntimeSettingsCollection = task2.Result;
                        var timeStamp = BitConverter.GetBytes(_themeRuntimeSettingsCollection.TimeStamp.Ticks);

                        md5.TransformBlock(timeStamp, 0, timeStamp.Length, timeStamp, 0);
                        byte[] tid = Encoding.UTF8.GetBytes(_themeId ?? "");
                        Hash = md5.TransformFinalBlock(tid, 0, tid.Length);
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
    }
}