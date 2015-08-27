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
        Task<JObject> SaveSingleValue(string key, object value, string themeId);
        Task<JObject> SaveInstanceValues(JObject values, string themeId);
        Task<JObject> GetInstanceValues(string themeId);


        Task<DateTime> GetTimeStamp(string themeId);
    }

    public class ThemeSettingsRepository : IThemeSettingsRepository
    {
        public const string ADDONKEY = "internal-themeAddons";
        private readonly IDocumentListWebApiClient _docWebApiClient;
        private readonly ICmsServiceWrapper _cmsService;
        private readonly SiteContext _siteContext;
        private readonly JsonSerializer  _serializer;
   
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
            _cache = cache;
        }


        public Task<JObject> SaveSingleValue(string key, object value, string themeId)
        {
            return GetInstanceValues(themeId)
                .ContinueWith(t =>
                {
                    var values = t.Result ?? new JObject();

                    JToken jValue;
                    if (value is JToken)
                        jValue = (JToken)value;
                    else if (value == null || value is string || value.GetType().IsValueType)
                        jValue = JValue.FromObject(value);
                    else if (value is IList)
                        jValue = JArray.FromObject(value);
                    else
                        jValue = JObject.FromObject(value);

                    var existingValue = values[key] as JProperty;
                    if (existingValue != null)
                        existingValue.Value = jValue;
                    else
                        values.Add(key, jValue);

                    return UpdateSettings(values, themeId)
                        .ContinueWith(_ => values);
                }).Unwrap();
        }

        public Task<JObject> SaveInstanceValues(JObject values, string themeId)
        {
            return UpdateSettings(values, themeId)
                .ContinueWith(_ => values);
        }

        private Task<ServiceClientResponse<Document>> UpdateSettings(JObject values, string themeId)
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

        private Task<JObject> _getInstanceValues;
        public Task<JObject> GetInstanceValues(string themeId)
        {
            var key = typeof(List<ThemeRuntimeSetting>) + themeId;

            var cachedResult = _cache.Get<Tuple<DateTime, JObject, byte[]>>(key);
            if (cachedResult != null )
            {
                var tcs = new TaskCompletionSource<JObject>();
                Etag = cachedResult.Item3;
                tcs.SetResult(cachedResult.Item2 ?? new JObject());
                _ts = cachedResult.Item1;
                return tcs.Task  ;
            }

            _getInstanceValues = _cmsService.GetByPath2("siteSettings@mozu", GetFileName(themeId)).ContinueWith(
                    res =>
                    {
                        JObject value = null;
                        if (res.Result.ResponseMessage.IsSuccessStatusCode)
                        {
                            Etag = res.Result.ETagBytes();
                           
                            var doc = res.Result.ReadAsSync();

                            _ts = doc.UpdateDate.GetValueOrDefault(DateTime.Today);

                            value = doc.Get<JObject>("data");

                            _cache.Set(key, new Tuple<DateTime, JObject, byte[]>(_ts.Value, value, Etag));
                        }
                        else
                        {
                            _ts = DateTime.Today;
                            this.Etag = new byte[0];
                            _cache.Set(key, new Tuple<DateTime, JObject, byte[]>(_ts.Value, value, this.Etag));

                        }
                        return value ?? new JObject();
                    });
            return _getInstanceValues;

        }

        private ThemeRuntimeSettingsCollection _runtimeValues;
        public Task<ThemeRuntimeSettingsCollection> GetRuntimeValues(string themeId)
        {
            if (_runtimeValues != null)
            {
                var tcs = new TaskCompletionSource<ThemeRuntimeSettingsCollection>();
                tcs.SetResult(_runtimeValues);
                return tcs.Task;
            }
            else
            {
                return GetInstanceValues(themeId).ContinueWith(task =>
                    {

                        JObject values = task.Result;
                        var dic = new Dictionary<string, ThemeRuntimeSetting>(StringComparer.OrdinalIgnoreCase);

                        foreach (var setting in _siteContext.Theme.MergedSettings)
                        {
                            if (dic.ContainsKey(setting.Id))
                                continue;

                            var val = values[setting.Id] ?? setting.DefaultValue;

                            dic.Add(setting.Id, new ThemeRuntimeSetting(setting, val));
                        }

                        _runtimeValues = new ThemeRuntimeSettingsCollection(dic,  this.Etag , _ts.Value  );
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
        private readonly ILiveModeOnlyCache _cache;

        public Task<DateTime> GetTimeStamp(string themeId)
        {
            if (_getTimeStamp != null) return _getTimeStamp;
            _getTimeStamp = GetInstanceValues(themeId).ContinueWith(x => _ts.Value );
            return _getTimeStamp;
        }

        public byte[] Etag { get; set; }
    }
}
