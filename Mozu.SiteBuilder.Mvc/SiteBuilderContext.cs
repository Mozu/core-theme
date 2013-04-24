using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Configuration;
using System.Runtime.Serialization;
using System.Web;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
using Mozu.Core;
using Mozu.Core.Logging;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.Catalog;
using Mozu.SiteBuilder.Mvc.Cms;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.Themes.Exceptions;
using Mozu.SiteBuilder.Mvc.Themes.Repositories;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.Tenant.Contracts;
using Newtonsoft.Json.Linq;
using APIConstants = Mozu.Core.Api.Contracts.Constants;
using IApiContext = Mozu.Core.IApiContext;

namespace Mozu.SiteBuilder.Mvc
{
	/// <summary>
	/// TODO: Update summary.
	/// </summary>
    /// 
    [DataContract()]
    public class SiteBuilderContext : ModelBase, ISiteBuilderContext, IModelMetadataContainer , IDisposable
	{
        public  const string CONTEXT_KEY = "V:STORECTX";
        internal const string COOKIENAME = "SBCONTEXT";
        private static System.Collections.Concurrent.ConcurrentDictionary<string, Site> g_domainSiteLookup = new ConcurrentDictionary<string, Site>(StringComparer.OrdinalIgnoreCase);
		//[ThreadStatic] private static ISiteBuilderContext g_sc;
	    private Lazy<IThemeSettingsRepository> _themeSettingsRepo;
	    private readonly IApiContext _apiContext;
	    private readonly IGeneralSettingsWebApiClient _generalSettings;
	    private readonly ISettings _configSettings;
	    private readonly HttpContextBase _httpContext;
	    Lazy<ISettingsRepository> _settings;
	    private readonly Lazy<ICatalogContext> _catContext;
        private readonly ICookieProvider _cookieProvider;
        private readonly IMobileDetectionProvider _mobileProvider;
        private List<NavigationRuntimeNode> _navigationTree;

	    private readonly Dictionary<string, Lazy<object>> _stateBag =
			new Dictionary<string, Lazy<object>>(StringComparer.OrdinalIgnoreCase);
        Lazy<Theme > _desktopTheme;
        Lazy<Theme> _mobileTheme;
        
        /// <summary>
        /// Theme according to the cookie 
        /// </summary>
        private readonly Theme  _cookieTheme = null;
        private Lazy<string> _googleAnalyticsCode;
	    private Lazy<bool> _googleAnalyticsEnabled;
	    private Lazy<bool> _googleAnalyticsEcommerceEnabled;
        private Lazy<NavigationGandalf> _gandalf;
        private ICategoryTreeProvider _categoryTreeProvider;

        public SiteBuilderContext(ICookieProvider cookieProvider, IMobileDetectionProvider mobileProvider, Lazy<ISettingsRepository> settings, Lazy<ICatalogContext> catContext, ISearchContext searchContext, Lazy<IThemeSettingsRepository> themeRepo, IApiContext apiContext, IThemeRepository themeRepository, IGeneralSettingsWebApiClient generalSettings, ICategoryTreeProvider categoryTreeProvider, Lazy<NavigationGandalf> gandalf, ISettings configSettings = null, HttpContextBase httpContext = null)
		{
			PageContext = new PageContext();
           
            
            _cookieProvider = cookieProvider;
            _mobileProvider = mobileProvider;
            SearchContext = searchContext;
            _settings = settings;
            _catContext = catContext;
            _themeSettingsRepo = themeRepo;
            _apiContext = apiContext;
	        _generalSettings = generalSettings;
	        _configSettings = configSettings;
	        _httpContext = httpContext;
            _categoryTreeProvider = categoryTreeProvider;
            _gandalf = gandalf;

	        this.SiteId = _apiContext.SiteId;
            this.TenantId = _apiContext.TenantId;
	        httpContext.Items[CONTEXT_KEY] = this;
            // attempt to look up theme by value of "SBTHEME".
            HttpCookie themeCookie = _cookieProvider.GetRequestCookie("SBTHEME");
            if (themeCookie != null && !string.IsNullOrEmpty(themeCookie.Value))
            {
                try
                {
                    _cookieTheme = themeRepository.GetTheme(themeCookie.Value);
                }
                catch (ThemeNotFoundException)
                { }
            }


	        RuntimeConfigurationFieldCollection col;
        

            // needs to be lazy because _settings is lazy
            _desktopTheme = new Lazy<Theme >(() =>
            {
                string themeName = _settings.Value.General.DesktopTheme;

                return themeRepository.GetThemeOrDefault(themeName);
            });

            // needs to be lazy because _settings is lazy
            _mobileTheme = new Lazy<Theme>(() =>
            {
                string themeName = _settings.Value.General.MobileTheme;
                if (String.IsNullOrEmpty(_settings.Value.General.MobileTheme))
                    return null;

                try
                {
                    return themeRepository.GetTheme(themeName);
                }
                catch (ThemeNotFoundException)
                {
                    string errorMessage = String.Format("Mobile theme specified in settings but theme not found. Site: {0}. Theme: {1}", SiteId, themeName);
                    LoggingService.LoggerFor<SiteBuilderContext>().Warn(errorMessage);
                    return null;
                }
            });

	        _googleAnalyticsCode = new Lazy<string>(() => GetGeneralSettingValue(x => x.GoogleAnalyticsCode));
            _googleAnalyticsEnabled = new Lazy<bool>(() => GetGeneralSettingValue(x => x.IsGoogleAnalyticsEnabled) ?? false);
            _googleAnalyticsEcommerceEnabled = new Lazy<bool>(() => GetGeneralSettingValue(x => x.IsGoogleAnalyticsEcommerceEnabled) ?? false);
		}
        
        private T GetGeneralSettingValue<T>(Func<GeneralSettings, T> expression)
        {
            try
            {
                var task = _generalSettings.GetGeneralSettings(null);
                var generalSettingsResult = task.Result.ReadAsAsync().Result;

                return expression(generalSettingsResult);
            }
            catch (Exception)
            {
                return default(T);
            }
        }

		public static ISiteBuilderContext Current
		{
			get
			{
                ISiteBuilderContext sc = AutofacDependencyResolver.Current.RequestLifetimeScope.Resolve<ISiteBuilderContext>();

				return sc;
			}
			
		}
        public static ISiteBuilderContext GetFromContext ( HttpContextBase ctx )
        {
            return (ISiteBuilderContext) ctx.Items[SiteBuilderContext.CONTEXT_KEY];

         }
		

		#region ISiteBuilderContext Members

       

		public bool IsEditMode { get; set; }
        public EditModes? EditMode { get; set; }
        public bool IsDebugMode { get; set; }

	   


        //public SiteConfiguration SiteConfiguration { get; set; }


        [DataMember (Name="pageContext")]
        public PageContext PageContext { get;  set; }

	    private Newtonsoft.Json.Linq.JObject _apiClientContext;


	    public Newtonsoft.Json.Linq.JObject ApiClientContext
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
                    header[APIConstants.Headers.SITE] = this._apiContext.SiteId;
                    header[APIConstants.Headers.SITE_GROUP] = this._apiContext.SiteGroupId;
                    header[APIConstants.Headers.TENANT] = this._apiContext.TenantId;
                    header[APIConstants.Headers.USER_CLAIMS] = this._apiContext.UserClaims.ToAccessToken();
                    header[APIConstants.Headers.BYPASS_CACHE] = this._apiContext.ShouldBypassCache.ToString();

	               
                    var urls = new JObject();
	                urls["ProductService"] = _configSettings.AppSettings("service-url-ProductRuntimeWebApi");
                    urls["CartService"] = _configSettings.AppSettings("service-url-CartWebApi");
                    urls["UserService"] = _configSettings.AppSettings("service-url-UserWebApi");
                    urls["CustomerService"] = _configSettings.AppSettings("service-url-CustomerAccountWebApi");
                    urls["OrderService"] = _configSettings.AppSettings("service-url-OrderWebApi");
                    urls["SearchService"] = _configSettings.AppSettings("service-url-ProductSearchWebApi");
                    urls["CmsService"] = _configSettings.AppSettings("service-url-DocumentWebApi");
                    urls["ReferenceService"] = _configSettings.AppSettings("service-url-ReferenceDataWebApi");
	                _apiClientContext["header"] = header;
                     
                    _apiClientContext["urls"] = urls;
                    if (_configSettings.AppSettings("ReverseProxy") == "true")
                    {
                        foreach (var url in urls)
                        {
                            
                            var idx = (((string) url.Value) ?? "").IndexOf("webapi/", StringComparison.OrdinalIgnoreCase);
                            if (idx > 0)
                            {
                                urls[url.Key] = "/api" +((string)url.Value).Substring(idx + 6);
                            }
                        }
                    }

	            }
                return _apiClientContext;
	        }
	    }

	    private static string g_appId;

	    private static string AppIdToken
	    {
	        get
	        {
	            if (g_appId == null)
	            {
	                ;
	                var claims = new LightweightAppClaims {AppId = ConfigurationManager.AppSettings["AppId"]};
	                g_appId = claims.ToAccessToken();
	            }
	            return g_appId;
	        }
	    }



	    object ISiteBuilderContext.this[string key]
        {
            get
            {
                Lazy<object> obj;
                if (!_stateBag.TryGetValue(key, out obj))
                {
                    return base[key];
                }
                return obj.Value;
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


		

		public int TenantId { get; set; }

        public int? SiteId { get; set; }

        public int? SiteGroupId { get; set; }

		#endregion


        public void Save()
        {
            var cookie = new HttpCookie("") { Expires = DateTime.MaxValue };

            cookie["site"] = SiteId.HasValue ? SiteId.ToString() : null;
            cookie["sitegroup"] = SiteGroupId.HasValue ? SiteGroupId.ToString() : null;
            cookie["tenant"] = TenantId.ToString();
            cookie["editmode"] = IsEditMode.ToString();

            _cookieProvider.SaveResponseCookie(COOKIENAME,cookie);
        }

        // <add key="default-tenant" value="139"/>
  //  <add key="default-site" value="9001"/>

        public System.Web.Mvc.ModelMetadata GetModelMetadata()
        {
            var mmd = ModelMetadataProviders.Current.GetMetadataForType(() => this, typeof(SiteBuilderContext));
            mmd.AdditionalValues ["data-editing"] = this;
            mmd.AdditionalValues["data-attribute-name"] = "data-editing-document";
            return mmd;
        }







        [AlternateName("catalog")]
        public ICatalogContext CatalogContext
        {
            get {
                var cc = _catContext.Value;
                if (cc.AllCategories == null)
                    cc.AllCategories = _categoryTreeProvider.GetAllCategories().Result;

                return _catContext.Value; 
            }
            set { throw new NotImplementedException(); }
        }




        public ISearchContext SearchContext
        {
            get;
            set;
        }


        // public INavigationRuntimeFactory Navigation
        // {
        //     get
        //     {
        //         return _nav.Value;
        //     }
        // }

        public NavigationContext Navigation
        {
            get
            {
                if (_navigationTree  == null)
                    _navigationTree = _gandalf.Value.GetTreeNavigation().Result;

                return new NavigationContext(_navigationTree);
            }
        }

        public UX.Models.Admin.ThemeSettings.RuntimeConfigurationFieldCollection ThemeSettings
        {
            get { return _themeSettingsRepo.Value.GetRuntimeValues( this.Theme.Id ).Result; }
        }
        

        public ISettingsRepository Settings
        {
            get { return _settings.Value; }
        }

        /// <summary>
        /// Returns true if the visitor is using a mobile device.
        /// </summary>
        public bool IsVisitorMobile { get { return _mobileProvider.IsCurrentRequestMobile; } }

        /// <summary>
        /// Returns the current theme.
        /// If the visitor is a mobile visitor and there is a mobile theme 
        /// chosen for the current site, returns the value of <code>MobileTheme</code>.
        /// Otherwise, returns the value of <code>DesktopTheme</code>.
        /// </summary>
        public Theme  Theme
        {
            get {
                if (_cookieTheme != null)
                    return _cookieTheme;
                else if (IsVisitorMobile && MobileTheme != null)
                    return MobileTheme;
                else
                    return DesktopTheme;
            }
        }

        /// <summary>
        /// Returns the site's desktop theme.
        /// </summary>
        public Theme  DesktopTheme
        {
            get { return _desktopTheme.Value; }
        }

        /// <summary>
        /// Returns the site's mobile theme, if one is set. 
        /// Otherwise returns null.
        /// </summary>
        public Theme MobileTheme
        {
            get { return _mobileTheme.Value; }
        }

	    public string GoogleAnalyticsCode
	    {
            get { return _googleAnalyticsCode.Value; }
	    }

	    public bool GoogleAnalyticsEnabled
	    {
            get { return _googleAnalyticsEnabled.Value; }
	    }
	    
	    public bool GoogleAnalyticsEcommerceEnabled
	    {
            get { return _googleAnalyticsEcommerceEnabled.Value; }
	    }

	    /// <summary>
        /// TODO: Why is this public?
        /// </summary>
        public IThemeSettingsRepository ThemeSettingsRepository
        {
            get { return _themeSettingsRepo.Value; }
        }

        public void Dispose()
        {

        }
    }
}
