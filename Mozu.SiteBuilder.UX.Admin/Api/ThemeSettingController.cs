using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Settings;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Settings;
using Newtonsoft.Json.Linq;
using System.Linq;
using Mozu.Content.Contracts.Clients;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/themesetting", SuppressDescriptorGeneration = true)]
    public class ThemeSettingController : BaseController
    {
        
        private readonly IThemeSettingsRepository _themeSettingsRepository;
        private readonly IThemeRepository _themeRepository;
        private readonly IThemeContentRetriever _contentRetriever;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;

        public ThemeSettingController( IThemeSettingsRepository themeSettingsRepository, IThemeRepository themeRepository, IThemeContentRetriever contentRetriever, IDocumentListWebApiClient documentListRepository)
        {
            if(themeSettingsRepository == null)
            {
                throw new ArgumentNullException("themeSettingsRepository");
            }

            
            _themeSettingsRepository = themeSettingsRepository;
            _themeRepository = themeRepository;
            _contentRetriever = contentRetriever;
            _documentListWebApiClient = documentListRepository;
        }

        /// <summary>
        /// Returns the merged core and theme configurations
        /// </summary>
        /// <returns>List of SettingConfiguration</returns>
        [HttpGetRoute(UriTemplate = "config/read/{themeId}")]
        public async Task<Response<List<ThemeSetting>>> ReadConfiguration(string themeId )
        {
            //tbd send selection from ui
            var config = (await _themeRepository.GetThemeOrDefault(new ThemeSelection(){Id=themeId}).ConfigureAwait(false)).Settings;

            return List2(config.Select(x => new ThemeSetting() { Id = x.Key, DefaultValue = x.Value }).ToList());
        }

        /// <summary>
        /// Returns the current settings for the core and theme
        /// </summary>
        /// <returns>List of field values</returns>
        [HttpGetRoute(UriTemplate = "instance/read/{themeId}")]
        public async Task<HttpResponseMessage> ReadInstance(string themeId)
        {
            var values = (await _themeSettingsRepository.GetInstanceValues(themeId)).ToDictionary(x => x.Key, y => y.Value);
            var docId = String.Join("", "theme_settings_", themeId); 
            var document = (await _documentListWebApiClient.GetTreeDocument(documentListName: "siteSettings@mozu", documentName: docId));

            var docList = (await _documentListWebApiClient.GetDocumentList(documentListName: "siteSettings@mozu")).ReadAsSync();
            var theme = _themeRepository.GetThemeOrDefault(new ThemeSelection() { Id = themeId });

            var configSettings = await this.ReadConfiguration(themeId).ConfigureAwait(false);
            string cmsDocId = null;
            bool? isPublishingEnabled = docList.EnablePublishing;

            if (document.ResponseMessage.StatusCode == System.Net.HttpStatusCode.OK)
            {
                cmsDocId = document.ReadAsSync().Id;
            }

            foreach (var setting in configSettings.Items)
            {
                object o = null;
                if (!values.TryGetValue(setting.Id, out o))
                {
                    var jToken = setting.DefaultValue == null ? null : JToken.FromObject(setting.DefaultValue);
                    values.Add(setting.Id, jToken);
                }
            }

            if (values != null)
            {
                values.Add("MozuDocumentId", cmsDocId);
                values.Add("MozuPublishingEnabled", isPublishingEnabled);
            }
            var jobj = values == null ? null : JObject.FromObject(values);
            return this.Request.CreateResponse(HttpStatusCode.OK, jobj);
        }

        [HttpGetRoute(UriTemplate = "ui/read/{themeId}")]
        public async Task<HttpResponseMessage> ReadUi(string themeId)
        {

            //todo get selection 
            var theme = await _themeRepository.GetThemeOrDefault(new ThemeSelection() { Id = themeId }).ConfigureAwait(false);
            if (theme != null)
            {
                var file = theme.FileListing.GetFileInfo("theme-ui.json", true );
                if (file != null)

                {
                    var response = this.Request.CreateResponse(HttpStatusCode.OK);
                    response.Content = new StreamContent(_contentRetriever.GetStream(file, this.SbApiContext.RequestCancellationToken));
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
        public async Task<Response<JObject>> SaveInstance(string themeId, Dictionary<string,object> values)
        {
            var existingValues = (IDictionary<string, Object>) await _themeSettingsRepository.GetInstanceValues(themeId);
            var valueDic = (IDictionary<string, Object>) values;
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
            var jobj = retval == null ? null : JObject.FromObject(retval);
            return Single2(jobj);
        }
    }
}
