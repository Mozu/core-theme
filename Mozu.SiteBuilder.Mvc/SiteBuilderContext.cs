using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using Autofac;
using Autofac.Integration.Mvc;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Cms;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Navigation;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Theme;
using Mozu.SiteBuilder.Mvc.Theme.Exceptions;
using Mozu.SiteBuilder.Mvc.Theme.Repositories;
using Mozu.SiteBuilder.UX.Models;
using Mozu.SiteBuilder.UX.Models.ModelMetaData;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.Tenant.Contracts;
using Mozu.Tenant.Contracts.Clients;
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
        internal const string CONTEXT_KEY = "V:STORECTX";
        internal const string COOKIENAME = "SBCONTEXT";
        private static System.Collections.Concurrent.ConcurrentDictionary<string, Site> g_domainSiteLookup = new ConcurrentDictionary<string, Site>(StringComparer.OrdinalIgnoreCase);
		//[ThreadStatic] private static ISiteBuilderContext g_sc;
	    private Lazy<IThemeSettingsRepository> _themeSettingsRepo;
	    private readonly IApiContext _apiContext;
	    private readonly IGeneralSettingsWebApiClient _generalSettings;
	    Lazy<ISettingsRepository> _settings;
	    private readonly Lazy<ICatalogContext> _catContext;
        private readonly ICookieProvider _cookieProvider;
        private readonly IMobileDetectionProvider _mobileProvider;

	    private readonly Dictionary<string, Lazy<object>> _stateBag =
			new Dictionary<string, Lazy<object>>(StringComparer.OrdinalIgnoreCase);
        Lazy<ITheme> _desktopTheme;
        Lazy<ITheme> _mobileTheme;
        
        /// <summary>
        /// Theme according to the cookie 
        /// </summary>
        private readonly ITheme _cookieTheme = null;
        Lazy<INavigationRuntimeFactory> _nav;
        private Lazy<string> _googleAnalyticsCode;
	    private Lazy<bool> _googleAnalyticsEnabled;
	    private Lazy<bool> _googleAnalyticsEcommerceEnabled;

	    public SiteBuilderContext(ICookieProvider cookieProvider, IMobileDetectionProvider mobileProvider, Lazy<INavigationRuntimeFactory> navFac, Lazy<ISettingsRepository> settings, Lazy<ICatalogContext> catContext, ISearchContext searchContext, Lazy<IThemeSettingsRepository> themeRepo, IApiContext apiContext, IThemeRepository themeRepository, IGeneralSettingsWebApiClient generalSettings)
		{
			PageContext = new PageContext();
           
            _cookieProvider = cookieProvider;
            _mobileProvider = mobileProvider;
            SearchContext = searchContext;
            _nav = navFac;
            _settings = settings;
            _catContext = catContext;
            _themeSettingsRepo = themeRepo;
            _apiContext = apiContext;
	        _generalSettings = generalSettings;
	        this.SiteId = (int)_apiContext.SiteId;
            this.TenantId = _apiContext.TenantId;

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

            // needs to be lazy because _settings is lazy
            _desktopTheme = new Lazy<ITheme>(() =>
            {
                string themeName = _settings.Value.General.DesktopTheme;

                return themeRepository.GetThemeOrDefault(themeName);
            });

            // needs to be lazy because _settings is lazy
            _mobileTheme = new Lazy<ITheme>(() =>
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

            // TODO: Uncomment when properties are added by services team.
            //_googleAnalyticsEnabled = new Lazy<bool>(() => GetGeneralSettingValue(x => x.GoogleAnalyticsEnabled));
            //_googleAnalyticsEcommerceEnabled = new Lazy<bool>(() => GetGeneralSettingValue(x => x.GoogleAnalyticsEcommerceEnabled));
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

		

		#region ISiteBuilderContext Members

       

		public bool IsEditMode { get; set; }
        public bool IsDebugMode { get; set; }

	   


        //public SiteConfiguration SiteConfiguration { get; set; }


        [DataMember (Name="pageContext")]
        public PageContext PageContext { get;  set; }


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

        public int SiteId { get; set; }

		

		#endregion


        public void Save()
        {
            HttpCookie cookie = new HttpCookie("");
            cookie.Expires = DateTime.MaxValue;
            cookie["site"] = this.SiteId.ToString ();
            cookie["tenant"] = this.TenantId.ToString();
            cookie["editmode"] = this.IsEditMode.ToString();
          
           

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
            get { return _catContext.Value; }
            set { throw new NotImplementedException(); }
        }




        public ISearchContext SearchContext
        {
            get;
            set;
        }


        public INavigationRuntimeFactory Navigation
        {
            get
            {
                return _nav.Value;
            }
        }


        public UX.Models.Admin.ThemeSettings.RuntimeConfigurationFieldCollection ThemeSettings
        {
            get { return _themeSettingsRepo.Value.GetRuntimeValues().Result; }
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
        public ITheme Theme
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
        public ITheme DesktopTheme
        {
            get { return _desktopTheme.Value; }
        }

        /// <summary>
        /// Returns the site's mobile theme, if one is set. 
        /// Otherwise returns null.
        /// </summary>
        public ITheme MobileTheme
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
