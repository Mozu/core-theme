using System;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Mobile;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteSettings.General.Contracts;
using Mozu.SiteSettings.General.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.Contexts
{
    public class SiteContext
    {
        public const string FORCE_THEME_COOKIE_NAME = "SBTHEME";
        private readonly ICookieProvider _cookieProvider;
        private readonly IGeneralSettingsWebApiClient _generalSettingsWebApiClient;
        private readonly IMobileDetectionProvider _mobileDetectionProvider;
        private readonly IThemeRepository _themeRepository;
        private readonly IThemeSettingsRepository _themeSettingsRepository;
        private GeneralSettings _generalSettings;


        private Task _initTask;
        private Theme _theme;

        private string _themeId;
        private ThemeRuntimeSettingsCollection _themeRuntimeSettingsCollection;

        public SiteContext(IGeneralSettingsWebApiClient generalSettingsWebApiClient, IThemeSettingsRepository themeSettingsRepository, IThemeRepository themeRepository, IMobileDetectionProvider mobileDetectionProvider, ICookieProvider cookieProvider)
        {
            _generalSettingsWebApiClient = generalSettingsWebApiClient;
            _themeSettingsRepository = themeSettingsRepository;
            _themeRepository = themeRepository;
            _mobileDetectionProvider = mobileDetectionProvider;
            _cookieProvider = cookieProvider;
        }

        public string ThemeId
        {
            get
            {
                Init().Wait();
                return _themeId;
            }
            set { _themeId = value; }
        }

        public GeneralSettings GeneralSettings
        {
            get
            {
                Init().Wait();
                return _generalSettings;
            }
            set { _generalSettings = value; }
        }

        public ThemeRuntimeSettingsCollection ThemeSettings
        {
            get
            {
                Init().Wait();
                return _themeRuntimeSettingsCollection;
            }
            set { _themeRuntimeSettingsCollection = value; }
        }

        public Theme Theme
        {
            get
            {
                Init().Wait();
                return _theme;
            }
            set { _theme = value; }
        }

        private Task Init()
        {
            if (_initTask == null)
            {
                Task<ServiceClientResponse<GeneralSettings>> genSettingsTask = _generalSettingsWebApiClient.GetGeneralSettings();
                Task initTask = genSettingsTask.ContinueWith(task =>
                    {
                        GeneralSettings = Mapper.Map<GeneralSettings>(task.Result.ReadAsSync());
                        HttpCookie cookie = _cookieProvider.GetRequestCookie(FORCE_THEME_COOKIE_NAME);

                        if (cookie != null && !string.IsNullOrEmpty(cookie.Value))
                        {
                            ThemeId = cookie.Value;
                        }
                        else if (_mobileDetectionProvider.IsCurrentRequestMobile && !string.IsNullOrEmpty(GeneralSettings.MobileTheme))
                        {
                            ThemeId = GeneralSettings.MobileTheme;
                        }
                        else
                        {
                            ThemeId = GeneralSettings.Theme;
                        }

                        Theme = _themeRepository.GetThemeOrDefault(ThemeId);
                        return _themeSettingsRepository.GetRuntimeValues(Theme.Id);
                    }, TaskContinuationOptions.NotOnFaulted).ContinueWith(task =>
                        {
                            if (!task.IsCompleted)
                            {
                                throw new Exception("fack");
                            }
                            if (!task.Result.IsCompleted)
                            {
                                throw new Exception("fack fack");
                            }

                            ThemeSettings = task.Result.Result;
                        });


                _initTask = initTask;
            }
            return _initTask;
        }

        public bool IsEditMode { get; set; }
    }
}