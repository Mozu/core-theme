using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes.Repositories;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ThemeSettingController : BaseController
    {
        private readonly ISiteBuilderContext _sbContext;
        private readonly IThemeSettingsRepository _themeSettingsRepository;
        private readonly IThemeRepository _themeRepository;

        public ThemeSettingController(ISiteBuilderContext sbContext, IThemeSettingsRepository themeSettingsRepository, IThemeRepository themeRepository)
        {
            if(themeSettingsRepository == null)
            {
                throw new ArgumentNullException("themeSettingsRepository");
            }

            _sbContext = sbContext;
            _themeSettingsRepository = themeSettingsRepository;
            _themeRepository = themeRepository;
        }

        /// <summary>
        /// Returns the merged core and theme configurations
        /// </summary>
        /// <returns>List of SettingConfiguration</returns>
        [WebGet(UriTemplate = "config/read/{id}")]
        public Response<List<ThemeConfigurationItem>> ReadConfiguration(string id )

        {
            var config= _themeRepository.GetThemeOrDefault(id).Configuration.ToList();
          //  var config = _sbContext.Theme.Configuration.ToList();
            return List2(config);
        }
            /// <summary>
        /// Returns the current settings for the core and theme
        /// </summary>
        /// <returns>List of field values</returns>
        [WebGet(UriTemplate = "instance/read/{id}")]
        public async Task<Response<List<FieldValue>>> ReadInstance(string id)
        {
            var values = await _themeSettingsRepository.GetInstanceValues(id);
            return List2(values);
        }

        /// <summary>
        /// Updates the core and theme settings
        /// </summary>
        /// <param name="values">Field values to persist</param>
        /// <returns>List of FieldValue></returns>
        [WebInvoke(Method = "POST", UriTemplate = "instance/save/{id}")]
        public async Task<Response<List<FieldValue>>> SaveInstance(string id, List<FieldValue> values)
        {
            var retval = await _themeSettingsRepository.SaveInstanceValues(values, id);
            return List2(retval);
        }
    }
}