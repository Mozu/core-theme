using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Caching;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Themes;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using Document = Mozu.Content.Contracts.Document;


namespace Mozu.SiteBuilder.Mvc.Settings
{
    public interface IThemeSettingsRepository
    {
        Task<ThemeRuntimeSettingsCollection> GetRuntimeValues(string themeId);
        Task<Dictionary<string, object>> SaveSingleValue(string key, object value, string themeId);
        Task<Dictionary<string, object>> SaveInstanceValues(Dictionary<string, object> values, string themeId);
        Task<Dictionary<string, object>> GetInstanceValues(string themeId);


        Task<DateTime> GetTimeStamp(string themeId);
    }

    public class ThemeSettingsRepository : IThemeSettingsRepository
    {
        public const string ADDONKEY = "internal-themeAddons";
        private IDocumentListWebApiClient _docWebApiClient;
        private  ICmsServiceWrapper _cmsService;
        private readonly SiteContext _siteContext;
        private readonly JsonSerializer  _serializer;
        Theme _theme;
     //   private readonly IStorefrontCache _cache;
      
        /// <summary>
        /// Constructor.
        /// </summary>
        public ThemeSettingsRepository(IDocumentListWebApiClient docWebApiClient, ICmsServiceWrapper cmsService, SiteContext  siteContext, ILiveModeOnlyCache cache)
        {

            _serializer = new JsonSerializer()
                              {
                                  Formatting = Formatting.None,
                                  NullValueHandling = NullValueHandling.Ignore
                              };
            
            _docWebApiClient = docWebApiClient;
            _cmsService = cmsService;
            _siteContext = siteContext;
     
        }

        public static Task<ThemeRuntimeSettingsCollection> CreateForContextBuilder ( Theme theme , IDocumentListWebApiClient docWebApiClient)
        {
            var repo = new ThemeSettingsRepository()
            {
                _theme = theme,
                _docWebApiClient = docWebApiClient,
                _cmsService = new CmsServiceWrapper(docWebApiClient, null, null)
            };
            return repo.GetRuntimeValues(theme?.Id ?? Constants.DefaultTheme);
        }
        private ThemeSettingsRepository()
        {

        }



        Theme GetTheme()
        {
            return _theme ?? _siteContext?.Theme;
        }

        public Task<Dictionary<string, object>> SaveSingleValue(string key, object value, string themeId)
        {
            return GetInstanceValues(themeId)
                .ContinueWith(t =>
                {
                    var values = t.Result ?? new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

                    //JToken jValue;
                    //if (value is JToken)
                    //    jValue = (JToken)value;
                    //else if (value == null || value is string || value.GetType().IsValueType)
                    //    jValue = JValue.FromObject(value);
                    //else if (value is IList)
                    //    jValue = JArray.FromObject(value);
                    //else
                    //    jValue = JObject.FromObject(value);
                    values[key] = value;
                   

                    return UpdateSettings(values, themeId)
                        .ContinueWith(_ => values);
                }).Unwrap();
        }

        public Task<Dictionary<string, object>> SaveInstanceValues(Dictionary<string, object> values, string themeId)
        {
            return UpdateSettings(values, themeId)
                .ContinueWith(_ => values);
        }

        private Task<ServiceClientResponse<Document>> UpdateSettings(Dictionary<string,object> values, string themeId)
        {
            return _cmsService.GetByPath2("siteSettings@mozu", this.GetFileName(themeId))
                .ContinueWith<Task<ServiceClientResponse<Document>>>(t =>
                {
                    var res = t.Result;
                    if (res.ResponseMessage.IsSuccessStatusCode)
                    {
                        var doc = res.ReadAsSync();
                        doc.Set("data", values);
                        return _cmsService.Update2(doc);
                    }
                    else
                    {
                        var doc = new Document
                                  {
                                      Name = this.GetFileName(themeId),
                                      DocumentTypeFQN = "document@mozu",
                                      ListFQN = "siteSettings@mozu",
                                      Properties = new JObject(
                                          new JProperty("theme", themeId),
                                          new JProperty("tags", new JArray(new object[] {"something"})),
                                          new JProperty("data", values)
                                          )
                                  };
                        return _cmsService.RawCreate2(doc);
                    }
                })
                .Unwrap();
        }

        private Task<Dictionary<string, object>> _getInstanceValues;
        public Task<Dictionary<string,object>> GetInstanceValues(string themeId)
        {
            _getInstanceValues = _cmsService.GetByPath2("siteSettings@mozu", GetFileName(themeId)).ContinueWith(
                    res =>
                    {
                        _ts = DateTime.MinValue;
                        this.Etag = new byte[0];

                        JObject value = null;
                        if (res.Result.ResponseMessage.IsSuccessStatusCode)
                        {
                            Etag = res.Result.ETagBytes();

                            var doc = res.Result.ReadAsSync();
                            if (doc != null)
                            {
                                _ts = doc.UpdateDate.GetValueOrDefault(DateTime.Today);
                                value = doc.Get<JObject>("data");
                            }

                        }

                        return (value ?? new JObject()).ToObject<Dictionary<string, object>>()
                            .ToDictionary(_kvp => _kvp.Key, _kvp => _kvp.Value, StringComparer.OrdinalIgnoreCase);
                    });
            return _getInstanceValues;

        }

        private ThemeRuntimeSettingsCollection _runtimeValues;
        public Task<ThemeRuntimeSettingsCollection> GetRuntimeValues(string themeId)
        {
            if (_runtimeValues != null)
            {
                return Task.FromResult(_runtimeValues);
            }
            else
            {
                return GetInstanceValues(themeId).ContinueWith(task =>
                    {

                        var savedValues = task.Result;
                        var settings = GetTheme().Settings;
                        var runtimeValues = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
                      

                        foreach (var setting in settings)
                        {
                            object val = setting.Value;
                            if ( !savedValues.TryGetValue( setting.Key, out val))
                            {
                                val = setting.Value;
                            }
                            runtimeValues.Add(setting.Key, val);
                        }

                        _runtimeValues = new ThemeRuntimeSettingsCollection(runtimeValues,  this.Etag , _ts.Value  );
                        return _runtimeValues;

                    });
            }
         }

        string GetFileName(string themeId)
        {
            return "theme_settings_" + themeId.ToLowerInvariant();
        }

        private DateTime? _ts;
        private Task<DateTime> _getTimeStamp;
      

        public Task<DateTime> GetTimeStamp(string themeId)
        {
            if (_getTimeStamp != null) return _getTimeStamp;
            _getTimeStamp = GetInstanceValues(themeId).ContinueWith(x => _ts.Value );
            return _getTimeStamp;
        }

        public byte[] Etag { get; set; }
    }
}
