using System;
using System.Collections;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.General.Contracts.Clients;
using Mozu.Core.Api.Client;
using System.Linq;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class SiteContext
    {
        public const string FORCE_THEME_COOKIE_NAME = "SBTHEME";
        private readonly ICookieProvider _cookieProvider;
        private readonly IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private readonly IMobileDetectionProvider _mobileDetectionProvider;
        private readonly IThemeRepository _themeRepository;
        private readonly Lazy<IThemeSettingsRepository> _themeSettingsRepository;
        private GeneralSettings _generalSettings;


        private Task _initTask;
        private Theme _theme;

        private string _themeId;
        private ThemeRuntimeSettingsCollection _themeRuntimeSettingsCollection;

        public SiteContext(IGeneralSettingsWebApiClient generalSettingsWebApiClient, Lazy<IThemeSettingsRepository> themeSettingsRepository, IThemeRepository themeRepository, IMobileDetectionProvider mobileDetectionProvider, ICookieProvider cookieProvider)
        {
            _generalSettingsWebApiClient = generalSettingsWebApiClient.CloneWithoutUserClaims();
            _themeSettingsRepository = themeSettingsRepository;
            _themeRepository = themeRepository;
            _mobileDetectionProvider = mobileDetectionProvider;
            _cookieProvider = cookieProvider;
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





        private Task Init()
        {
            if (_initTask == null)
            {
                Task<ServiceClientResponse<GeneralSettings>> genSettingsTask = _generalSettingsWebApiClient.GetGeneralSettings();
                
                var initTask = genSettingsTask.ContinueWith(task =>
                    {
                        _generalSettings = Mapper.Map<GeneralSettings>(task.Result.ReadAsSync());
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
    }
}