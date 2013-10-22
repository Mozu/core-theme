using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/themesetting", SuppressDescriptorGeneration = true)]
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
        [HttpGetRoute(UriTemplate = "config/read/{themeId}")]
        public Response<List<ThemeSetting>> ReadConfiguration(string themeId )
        {
            var config = _themeRepository.GetThemeOrDefault(themeId).MergedSettings;
            return List2(config);
        }

        /// <summary>
        /// Returns the current settings for the core and theme
        /// </summary>
        /// <returns>List of field values</returns>
        [HttpGetRoute(UriTemplate = "instance/read/{themeId}")]
        public async Task<HttpResponseMessage> ReadInstance(string themeId)
        {
            var values = await _themeSettingsRepository.GetInstanceValues(themeId);
            var jobj = new Newtonsoft.Json.Linq.JObject();
            foreach (var themeRuntimeSetting in values)
            {
        
                if (themeRuntimeSetting.Value == null || themeRuntimeSetting.Value is string || themeRuntimeSetting.Value.GetType().IsByRef)
                {
                    jobj.Add(themeRuntimeSetting.Setting.Id, new JValue(themeRuntimeSetting.Value));
                   
                }else if (themeRuntimeSetting.Value.GetType().IsArray)
                {
                    jobj.Add(themeRuntimeSetting.Setting.Id, new JArray(themeRuntimeSetting.Value));
                }
                else
                {
                    jobj.Add(themeRuntimeSetting.Setting.Id, new JObject( themeRuntimeSetting.Value));
                }
               
            }
            return this.Request.CreateResponse(HttpStatusCode.OK, jobj);
        }

        [HttpGetRoute(UriTemplate = "ui/read/{themeId}")]
        public  HttpResponseMessage ReadUi(string themeId)
        {
            var theme = _themeRepository.GetThemeOrDefault(themeId);
            if (theme != null)
            {
                var file = theme.FileListing.FirstOrDefault(x=> x.VirtualPath == "theme-ui.json");
                if (file != null)

                {
                    var response = this.Request.CreateResponse(HttpStatusCode.OK);
                    response.Content = new StreamContent(file.OpenRead());
                    response.Content.Headers.ContentType = new MediaTypeWithQualityHeaderValue("text/json");
                    return response;
                    
                }
            }
            return this.Request.CreateErrorResponse(HttpStatusCode.NotFound, "no theme ui");
        }

        /// <summary>
        /// Updates the core and theme settings
        /// </summary>
        /// <param name="values">Field values to persist</param>
        /// <returns>List of FieldValue></returns>
        [HttpPostRoute(UriTemplate = "instance/save/{themeId}")]
        public async Task<Response<List<ThemeRuntimeSetting>>> SaveInstance(string themeId, Newtonsoft.Json.Linq.JObject values)
        {
           var newSettings = new List<ThemeRuntimeSetting>();
            var origional = await _themeSettingsRepository.GetInstanceValues(themeId);
            foreach (var kvp in values)
            {
                newSettings.Add(new ThemeRuntimeSetting(new ThemeSetting() { Id = kvp.Key }, kvp.Value));
                
            }
            

            var retval = await _themeSettingsRepository.SaveInstanceValues(newSettings, themeId);
            return List2(retval);
        }
    }
}