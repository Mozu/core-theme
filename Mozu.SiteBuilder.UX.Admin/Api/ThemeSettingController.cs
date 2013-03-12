using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ThemeSettingController : BaseController
    {
        private readonly ISiteBuilderContext _sbContext;
        private readonly IThemeSettingsRepository _themeSettingsRepository;

        public ThemeSettingController(ISiteBuilderContext sbContext, IThemeSettingsRepository themeSettingsRepository)
        {
            if(themeSettingsRepository == null)
            {
                throw new ArgumentNullException("themeSettingsRepository");
            }

            _sbContext = sbContext;
            _themeSettingsRepository = themeSettingsRepository;
        }

        /// <summary>
        /// Returns the merged core and theme configurations
        /// </summary>
        /// <returns>List of SettingConfiguration</returns>
        [WebGet(UriTemplate = "config/read")]
        public Response<List<ConfigurationItem>> ReadConfiguration()
        {
            var config = _sbContext.Theme.Configuration.ToList();
            return List2(config);
        }
            /// <summary>
        /// Returns the current settings for the core and theme
        /// </summary>
        /// <returns>List of field values</returns>
        [WebGet(UriTemplate = "instance/read")]
        public async Task<Response<List<FieldValue>>> ReadInstance()
        {
            var values = await _themeSettingsRepository.GetInstanceValues();
            return List2(values);
        }

        /// <summary>
        /// Updates the core and theme settings
        /// </summary>
        /// <param name="values">Field values to persist</param>
        /// <returns>List of FieldValue></returns>
        [WebInvoke(Method = "POST", UriTemplate = "instance/save")]
        public async Task<Response<List<FieldValue>>> SaveInstance(List<FieldValue> values)
        {
            var retval = await _themeSettingsRepository.SaveInstanceValues(values);
            return List2(retval);
        }
    }
}