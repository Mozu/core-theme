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
using Mozu.SiteBuilder.UX.Models.Settings;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/themesetting", SuppressDescriptorGeneration = true)]
    public class ThemeSettingController : BaseController
    {
        
        private readonly IThemeSettingsRepository _themeSettingsRepository;
        private readonly IThemeRepository _themeRepository;

        public ThemeSettingController( IThemeSettingsRepository themeSettingsRepository, IThemeRepository themeRepository)
        {
            if(themeSettingsRepository == null)
            {
                throw new ArgumentNullException("themeSettingsRepository");
            }

            
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
            //tbd send selection from ui
            var config = _themeRepository.GetThemeOrDefault(new ThemeSelection(){Id=themeId}).MergedSettings;
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
            var configSettings = this.ReadConfiguration(themeId);
            foreach (var setting in configSettings.Items)
            {
                JToken o = null;
                if (!values.TryGetValue(setting.Id, out o))
                {
                    var jToken =   JToken.FromObject(setting.DefaultValue);
                    values.Add(setting.Id, jToken);
                }
            }

            return this.Request.CreateResponse(HttpStatusCode.OK, values);
        }

        [HttpGetRoute(UriTemplate = "ui/read/{themeId}")]
        public  HttpResponseMessage ReadUi(string themeId)
        {

            //todo get selection 
            var theme = _themeRepository.GetThemeOrDefault(new ThemeSelection(){Id=themeId});
            if (theme != null)
            {
                var file = theme.FileListing.GetFileInfo("theme-ui.json", true );
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
        public async Task<Response<JObject>> SaveInstance(string themeId, Newtonsoft.Json.Linq.JObject values)
        {
            var existingValues = (IDictionary<string, JToken>) await _themeSettingsRepository.GetInstanceValues(themeId);
            var valueDic = (IDictionary<string, JToken>) values;
            if (existingValues != null)
            {

                foreach (var props in existingValues)
                {
                    if (!valueDic.ContainsKey(props.Key))
                    {
                        valueDic[props.Key] = props.Value;
                    }
                    
                }    
            }

            
            var retval = await _themeSettingsRepository.SaveInstanceValues(values, themeId);
            return Single2(retval);
        }
    }
}
