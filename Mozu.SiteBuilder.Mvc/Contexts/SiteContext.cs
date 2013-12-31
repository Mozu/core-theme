using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Security.Cryptography;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Settings;
using Mozu.Location.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Models.Settings;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.Core.Api.Client;
using System.Linq;
using Mozu.SiteSettings.Order.Contracts.Clients;
using Theme = Mozu.SiteBuilder.Mvc.Themes.Theme;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class SiteContext
    {
        public const string FORCE_THEME_COOKIE_NAME = "SBTHEME";
        private readonly ICookieProvider _cookieProvider;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
       // private readonly IStorefrontCache _cache;
        private readonly ISettings _settings;
        private readonly ICheckoutSettingsWebApiClient _checkoutSettingsWebApiClient;
        private readonly IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private readonly ILocationSettingsWebApiClient _locationSettingsWebApiClient;
        private readonly IMobileDetectionProvider _mobileDetectionProvider;
        private readonly IThemeRepository _themeRepository;
        private readonly Lazy<IThemeSettingsRepository> _themeSettingsRepository;
        private GeneralSettings _generalSettings;
        private CheckoutSettings _checkoutSettings;

        private Task _initTask;
        private Theme _theme;

        private string _themeId;
        private ThemeRuntimeSettingsCollection _themeRuntimeSettingsCollection;

        private Dictionary<string, string> _labels;

        public SiteContext(IGeneralSettingsWebApiClient generalSettingsWebApiClient, Lazy<IThemeSettingsRepository> themeSettingsRepository, IThemeRepository themeRepository, IMobileDetectionProvider mobileDetectionProvider, ICookieProvider cookieProvider, Mozu.SiteSettings.Order.Contracts.Clients.ICheckoutSettingsWebApiClient checkoutSettingsWebApiClient, ISiteBuilderApiContext siteBuilderApiContext, ISettings settings, ISiteBuilderApiContext apiContext, ILocationSettingsWebApiClient locationSettingsWebApiClient ,HttpRequestMessage requestMessage)
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
            this.CdnPrefix = settings.AppSettings("CdnHost");


            string url = requestMessage.RequestUri.ToString();
            IEnumerable<string> values;
            if (requestMessage.Headers.TryGetValues(Mozu.Core.Api.Contracts.Constants.Headers.ORIGINAL_URL, out values))
            {
                url = values.FirstOrDefault();
            }


            var uriBuilder = new UriBuilder(url);
            var unsecure = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);
            uriBuilder.Port = 443;
            uriBuilder.Scheme = "https";
            var secure = uriBuilder.Uri.GetComponents(UriComponents.SchemeAndServer, UriFormat.Unescaped);

            this.SecureHost = _settings.CoreSettings.IsSSLValidationEnabled ? secure : unsecure;
          
            if (!string.IsNullOrEmpty(CdnPrefix))
            {
                this.CdnPrefix = "//" + this.CdnPrefix + "/" + siteBuilderApiContext.TenantId + "-" + siteBuilderApiContext.SiteId;
            }
            if (settings.AppSettings("disableCDN") == "true")
            {
                this.CdnPrefix = null;
            }
        }

        internal const string COOKIENAME = "SBCONTEXT";

        private byte[] _hash;
        public byte[] Hash
        {
            get
            {
                var task = this.Init();
                if (!task.IsCompleted)
                {
                    task.Wait();
                }
                return _hash;
            }
            set
            {
                _hash = value;
            }
        }

        private string _hashString;
        public string HashString
        {
            get
            {
                if (_hashString == null)
                {
                    var hash = this.Hash;
                    _hashString = System.Convert.ToBase64String(hash);
                }
                return _hashString;
            }
        }

        public static void Save(int? site, int? masterCatalog, int tenant, bool isEditMode, DataViewModeType dataViewMode, ICookieProvider cookieProvider)
        {
            var cookie = new HttpCookie("") { Expires = DateTime.MaxValue };

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
            set
            {
                _labels = value;
            }
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
            set
            {
                _themeRuntimeSettingsCollection = value;
            }
        }
        [System.Runtime.Serialization.IgnoreDataMember()]
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


        public Task Init()
        {
            if (_initTask == null)
            {
                var genSettingsTask = _generalSettingsWebApiClient.GetGeneralSettings();
                var checkoutSettingsTask = _checkoutSettingsWebApiClient.GetCheckoutSettings();
                var locSettingsTask = _locationSettingsWebApiClient.GetLocationUsages();
                var settingsServiceTasks = Task.WhenAll(genSettingsTask, checkoutSettingsTask, locSettingsTask);
                var initTask = settingsServiceTasks.ContinueWith(task =>
                {
                    
                    MD5 md5 = new MD5CryptoServiceProvider();
                    

                    
                        _generalSettings = Mapper.Map<GeneralSettings>(genSettingsTask.Result.HashEtag(md5).ReadAsSync());
                        _checkoutSettings = Mapper.Map<CheckoutSettings>(checkoutSettingsTask.Result.HashEtag(md5).ReadAsSync());
                        if (locSettingsTask.Result.ResponseMessage.IsSuccessStatusCode)
                        {
                            this.SupportsInStorePickup = locSettingsTask.Result.HashEtag(md5).ReadAsSync().Items.Any(x => x.LocationUsageTypeCode == "SP");
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
                            _themeId = _generalSettings.Theme;
                        }

                        _theme = _themeRepository.GetThemeOrDefault(_themeId);

                        return _themeSettingsRepository.Value.GetRuntimeValues(_theme.Id).ContinueWith(task2 =>
                            {
                               
                                _themeRuntimeSettingsCollection = task2.Result;
                                var themeEtag = _themeRuntimeSettingsCollection.Etag;
                               // haherAlgorithm.TransformBlock(etag, 0, etag.Length, etag, 0);
                                md5.TransformBlock(themeEtag, 0, themeEtag.Length, themeEtag ,0);
                                var tid = System.Text.Encoding.UTF8.GetBytes(_themeId??"");
                                this.Hash = md5.TransformFinalBlock(tid, 0, tid.Length );
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

        public bool IsEditMode { get; set; }

        public string CdnPrefix { get; set; }

        public string SecureHost { get; set; }


        private bool? _supportsInStorePickup;

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
            set
            {
                _supportsInStorePickup = value;
            }
        }
    }
}