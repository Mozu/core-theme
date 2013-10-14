using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.Web;
using Autofac;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Cms;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Security;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteSettings.General.Contracts.Clients;
using Newtonsoft.Json.Linq;
using APIConstants = Mozu.Core.Api.Contracts.Constants;

namespace Mozu.SiteBuilder.Mvc
{
    /// <summary>
    ///     TODO: Update summary.
    /// </summary>
    [DataContract]
    public class SiteBuilderContext : ModelBase, ISiteBuilderContext, IModelMetadataContainer, IDisposable
    {
        public const string CONTEXT_KEY = "V:STORECTX";
        public const string FORCE_THEME_COOKIE_NAME = "SBTHEME";
        internal const string COOKIENAME = "SBCONTEXT";


        private ISiteBuilderApiContext _apiContext;
        private IAuthenticationHelper _authenticationHelper;

        private Lazy<ICatalogContext> _catContext;
        private ICategoryTreeProvider _categoryTreeProvider;
        private ISettings _configSettings;
        private ICookieProvider _cookieProvider;

        /// <summary>
        ///     Theme according to the cookie
        /// </summary>
        private Lazy<Theme> _cookieTheme;

        private Lazy<Theme> _desktopTheme;

        private Lazy<NavigationGandalf> _gandalf;
        private readonly IGeneralSettingsWebApiClient _generalSettings;
        private readonly ILifetimeScope _lifetimeScope;
        private IMobileDetectionProvider _mobileProvider;
        private Lazy<Theme> _mobileTheme;
        
        private ISettingsRepository _settings;

        private readonly Dictionary<string, Lazy<object>> _stateBag =
            new Dictionary<string, Lazy<object>>(StringComparer.OrdinalIgnoreCase);

        private Lazy<IThemeSettingsRepository> _themeSettingsRepo;
        private NavigationContext _navigationContext;
        private UX.Models.Customers.User _user;
        private object _userProfile;

        public SiteBuilderContext(ICookieProvider cookieProvider, IMobileDetectionProvider mobileProvider, ISettingsRepository settings, Lazy<ICatalogContext> catContext,  Lazy<IThemeSettingsRepository> themeRepo, ISiteBuilderApiContext apiContext, IThemeRepository themeRepository, ICategoryTreeProvider categoryTreeProvider, Lazy<NavigationGandalf> gandalf, ISettings configSettings = null, IAuthenticationHelper authenticationHelper = null)
        {
            PageContext = new PageContext();


            _cookieProvider = cookieProvider;
            _mobileProvider = mobileProvider;
           
            _settings = settings;
            _catContext = catContext;
            _themeSettingsRepo = themeRepo;
            _apiContext = apiContext;

            _configSettings = configSettings;
            _authenticationHelper = authenticationHelper;
            _categoryTreeProvider = categoryTreeProvider;
            _gandalf = gandalf;


           InitLazyThemeGetters(themeRepository);

            //_googleAnalyticsCode = new Lazy<string>(() => settings.General.GoogleAnalyticsCode );
            //_googleAnalyticsEnabled = new Lazy<bool>(() => settings.General.IsGoogleAnalyticsEnabled.GetValueOrDefault(false ));
            //_googleAnalyticsEcommerceEnabled = new Lazy<bool>(() => settings.General.IsGoogleAnalyticsEcommerceEnabled.GetValueOrDefault(false ));
        }

        private void InitLazyThemeGetters(IThemeRepository themeRepository)
        {
            _cookieTheme = new Lazy<Theme>(() =>
                {
                    var themeCookie = _cookieProvider.GetRequestCookie(FORCE_THEME_COOKIE_NAME);
                    if (themeCookie != null && !string.IsNullOrEmpty(themeCookie.Value))
                    {
                        return themeRepository.GetThemeOrDefault(themeCookie.Value);
                    }
                    return null;
                });


            // needs to be lazy because _settings is lazy
            _desktopTheme = new Lazy<Theme>(() =>
                {
                    string themeName = _settings.GetGeneralSettings().Result.DesktopTheme;
                    return themeRepository.GetThemeOrDefault(themeName);
                });

            // needs to be lazy because _settings is lazy
            _mobileTheme = new Lazy<Theme>(() =>
                {
                    string themeName = _settings.GetGeneralSettings().Result.MobileTheme;
                    if (String.IsNullOrEmpty(themeName))
                        return null;

                    try
                    {
                        return themeRepository.GetTheme(themeName);
                    }
                    catch (ThemeNotFoundException)
                    {
                        string errorMessage = String.Format("Mobile theme specified in settings but theme not found. Site: {0}. Theme: {1}", _apiContext.SiteId.Value, themeName);
                        LoggingService.LoggerFor<SiteBuilderContext>().Warn(errorMessage);
                        return null;
                    }
                });
        }

        #region ISiteBuilderContext Members

        private readonly Lazy<string> _appId = new Lazy<string>(() => LightweightAppClaims.CreateForPublicStorefront().ToAccessToken());
        private JObject _apiClientContext;
        private EditModes? WidgetEditMode { get; set; }


        public JObject ApiClientContext
        {
            get
            {
                if (_apiClientContext == null)
                {
                    _apiClientContext = new JObject();
                    var header = new JObject();
                    header[APIConstants.Headers.APP_CLAIMS] = AppIdToken;
                    header[APIConstants.Headers.CURRENCY] = _apiContext.CurrencyCode;
                    header[APIConstants.Headers.LOCALE] = _apiContext.LocaleCode;
                    header[APIConstants.Headers.SITE] = _apiContext.SiteId;
                    header[APIConstants.Headers.SITE_GROUP] = _apiContext.SiteGroupId;
                    header[APIConstants.Headers.TENANT] = _apiContext.TenantId;
                    header[APIConstants.Headers.USER_CLAIMS] = _apiContext.UserClaims.ToAccessToken();
                    header[APIConstants.Headers.BYPASS_CACHE] = _apiContext.ShouldBypassCache.ToString();


                    var urls = new JObject();
                    urls["ProductService"] = _configSettings.AppSettings("service-url-ProductRuntimeWebApi");
                    urls["CategoryService"] = _configSettings.AppSettings("service-url-ProductCategoryRuntimeWebApi");
                    urls["CartService"] = _configSettings.AppSettings("service-url-CartWebApi");
                    urls["UserService"] = _configSettings.AppSettings("service-url-UserWebApi");
                    urls["CustomerService"] = _configSettings.AppSettings("service-url-CustomerAccountWebApi");
                    urls["OrderService"] = _configSettings.AppSettings("service-url-OrderWebApi");
                    urls["SearchService"] = _configSettings.AppSettings("service-url-ProductSearchWebApi");
                    urls["CmsService"] = _configSettings.AppSettings("service-url-DocumentListWebApi");
                    urls["ReferenceService"] = _configSettings.AppSettings("service-url-ReferenceDataWebApi");
                    _apiClientContext["header"] = header;

                    _apiClientContext["urls"] = urls;
                    if (_configSettings.AppSettings("ReverseProxy") == "true")
                    {
                        foreach (var url in urls)
                        {
                            int idx = (((string) url.Value) ?? "").IndexOf("webapi/", StringComparison.OrdinalIgnoreCase);
                            if (idx > 0)
                            {
                                urls[url.Key] = "/api" + ((string) url.Value).Substring(idx + 6);
                            }
                        }
                    }
                }
                return _apiClientContext;
            }
        }

        private string AppIdToken
        {
            get { return _appId.Value; }
        }

        public bool IsEditMode
        {
            get { return _apiContext.IsEditMode; }
            set { _apiContext.IsEditMode = value; }
        }

        [DataMember(Name = "pageContext")]
        public PageContext PageContext { get; set; }


        object ISiteBuilderContext.this[string key]
        {
            get
            {
                Lazy<object> obj;
                if (_stateBag.TryGetValue(key, out obj))
                {
                    return obj.Value;
                }
                return null;
            }
            set
            {
                var obj = value as Lazy<object>;
                if (obj == null)
                {
                    obj = new Lazy<object>(() => value);
                }
                _stateBag[key] = obj;
            }
        }

        #endregion

        /// <summary>
        ///     TODO: Why is this public?
        /// </summary>
        public IThemeSettingsRepository ThemeSettingsRepository
        {
            get { return _themeSettingsRepo.Value; }
        }

        public IApiContext ApiContext
        {
            get { return _apiContext; }
        }

        public UserProfile UserProfile
        {
            get
            {
                if (_userProfile == null)
                {
                    string ptoken = _authenticationHelper.GetProfileToken();

                    _userProfile = new UserProfile
                                       {
                                           UserId = _apiContext.UserClaims != null ? _apiContext.UserClaims.UserId : null
                                       };

                    if (!string.IsNullOrEmpty(ptoken))
                    {
                        try
                        {
                            UserProfile pt = UserProfile.Parse(ptoken);
                            ((UserProfile) _userProfile).EmailAddress = pt.EmailAddress;
                            ((UserProfile) _userProfile).FirstName = pt.FirstName;
                            ((UserProfile) _userProfile).LastName = pt.LastName;
                        }
                        catch
                        {
                        }
                    }
                }
                return _userProfile as UserProfile;
            }
        }

        public void Dispose()
        {
            IsDisposed = true;
        }

        // <add key="default-tenant" value="139"/>
        //  <add key="default-site" value="9001"/>

        public Dictionary<string, object> GetModelMetadata()
        {
            var mmd = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
            mmd["data-editing"] = this;
            mmd["data-attribute-name"] = "data-editing-document";
            return mmd;
        }


      
        public ICatalogContext CatalogContext
        {
            get
            {
                ICatalogContext cc = _catContext.Value;
                if (cc.AllCategories == null)
                    cc.AllCategories = _categoryTreeProvider.GetAllCategories().Result;

                return _catContext.Value;
            }
            set { throw new NotImplementedException(); }
        }


        public NavigationContext Navigation
        {
            get
            {
                if (_navigationContext == null)
                {
                    List<NavigationRuntimeNode> navigationTree = _gandalf.Value.GetTreeNavigation().Result;
                    _navigationContext = new NavigationContext(navigationTree);
                }

                return _navigationContext;
            }
        }

        public ThemeRuntimeSettingsCollection ThemeSettings
        {
            get { return _themeSettingsRepo.Value.GetRuntimeValues(Theme.Id).Result; }
        }

        public UX.Models.Settings.SettingsContainer  Settings
        {
            get { return _settings.GetSettings().Result; }
        }
        

        /// <summary>
        ///     Returns true if the visitor is using a mobile device.
        /// </summary>
        public bool IsVisitorMobile
        {
            get { return _mobileProvider.IsCurrentRequestMobile; }
        }

        /// <summary>
        ///     Returns the current theme.
        ///     If the visitor is a mobile visitor and there is a mobile theme
        ///     chosen for the current site, returns the value of <code>MobileTheme</code>.
        ///     Otherwise, returns the value of <code>DesktopTheme</code>.
        /// </summary>
        public Theme Theme
        {
            get
            {
                if (CookieTheme != null)
                    return CookieTheme;
                else if (IsVisitorMobile && MobileTheme != null)
                    return MobileTheme;
                else
                    return DesktopTheme;
            }
        }


        /// <summary>
        ///     Returns the preview theme
        /// </summary>
        Theme CookieTheme
        {
            get { return _cookieTheme.Value; }
        }



        /// <summary>
        ///     Returns the site's desktop theme.
        /// </summary>
        public Theme DesktopTheme
        {
            get { return _desktopTheme.Value; }
        }

        /// <summary>
        ///     Returns the site's mobile theme, if one is set.
        ///     Otherwise returns null.
        /// </summary>
        public Theme MobileTheme
        {
            get { return _mobileTheme.Value; }
        }


        public bool IsDisposed { get; set; }


        public IAnalyticsContext AnalyticsContext
        {
            get { throw new NotImplementedException(); }
        }


        public EditModes? EditMode
        {
            get { throw new NotImplementedException(); }
            set { throw new NotImplementedException(); }
        }

        public UX.Models.Customers.User User
        {
            get
            {
                _user = _user ?? new UX.Models.Customers.User
                                     {
                                         Email = UserProfile.EmailAddress, //profile != null ? profile.EmailAddress : null,
                                         FirstName = UserProfile.FirstName, // profile != null ? profile.FirstName : null,
                                         LastName = UserProfile.LastName, // profile != null ? profile.LastName : null,
                                         UserId = ApiContext.UserClaims.UserId, // gcu.UserId,
                                         IsAuthenticated = !_apiContext.UserClaims.IsAnonymous && _apiContext.UserClaims.IsAuthenticated, //!gcu.IsAnonymous && gcu.IsAuthenticated,
                                         IsAnonymous = _apiContext.UserClaims.IsAnonymous
                                     };

                return _user;
            }
        }

        public static void Save(int? site, int? sitegroup, int tenant, bool isEditMode, ICookieProvider cookieProvider)
        {
            var cookie = new HttpCookie("") {Expires = DateTime.MaxValue};

            cookie["site"] = site.HasValue ? site.ToString() : null;
            cookie["sitegroup"] = sitegroup.HasValue ? sitegroup.ToString() : null;
            cookie["tenant"] = tenant.ToString();
            cookie["editmode"] = isEditMode.ToString();

            cookieProvider.SaveResponseCookie(COOKIENAME, cookie);
        }
    }
}