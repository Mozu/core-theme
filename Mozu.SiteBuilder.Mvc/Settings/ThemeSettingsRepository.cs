using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization.Json;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Themes;
using Newtonsoft.Json;
using Mozu.Core.Api.Client;
using Document = Mozu.Content.Contracts.Document;


namespace Mozu.SiteBuilder.Mvc.Settings
{
    public interface IThemeSettingsRepository
    {
        Task<ThemeRuntimeSettingsCollection> GetRuntimeValues(string themeId);
        Task<List<ThemeRuntimeSetting>> SaveInstanceValues(List<ThemeRuntimeSetting> values, string themeId);
        Task<List<ThemeRuntimeSetting>> GetInstanceValues(string themeId);


        Task<DateTime> GetTimeStamp(string themeId);
    }

    public class ThemeSettingsRepository : IThemeSettingsRepository
    {
        public const string ADDONKEY = "internal-themeAddons";
        private readonly IDocumentListWebApiClient _docWebApiClient;
        private readonly ICmsServiceWrapper _cmsService;
        private readonly SiteContext _siteContext;
        private readonly JsonSerializer  _serializer;
   
        private readonly IStorefrontCache _cache;
      
        /// <summary>
        /// Constructor.
        /// </summary>
        public ThemeSettingsRepository(IDocumentListWebApiClient docWebApiClient, ICmsServiceWrapper cmsService, SiteContext  siteContext, IStorefrontCache cache)
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

        public async Task<List<ThemeRuntimeSetting>> SaveInstanceValues(List<ThemeRuntimeSetting> values, string themeId)
        {
            await UpdateSettings(values, themeId);
            return values;
        }

        private Task<ServiceClientResponse<Document>> UpdateSettings(List<ThemeRuntimeSetting> values, string themeId)
        {
            return _cmsService.GetByPath2("settings", this.GetFileName(themeId))
                .ContinueWith<Task<ServiceClientResponse<Document>>>(t =>
                {
                    var res = t.Result;
                    if (res.ResponseMessage.IsSuccessStatusCode)
                    {
                        var doc = res.ReadAsSync();
                        doc.Set("data", Newtonsoft.Json.JsonConvert.SerializeObject(values, Formatting.None));
                        return _cmsService.Update2(doc);
                    }
                    else
                    {
                        var doc = new Document
                        {
                            Name = this.GetFileName(themeId),
                            DocumentType = "theme_settings",
                            DocumentListName = "settings",
                            Properties = new List<PropertyValue>
                            {
                                new PropertyValue
                                    {
                                        PropertyType = "theme",
                                        Value = themeId
                                    },
                                new PropertyValue
                                    {
                                        PropertyType = "tags",
                                        Value = new object[] {"something"}
                                    },
                                new PropertyValue
                                    {
                                        PropertyType = "data",
                                        Value = Newtonsoft.Json.JsonConvert.SerializeObject(values, Formatting.None)
                                    }
                            }
                        };

                        return _cmsService.RawCreate2(doc);
                    }
                })
                .Unwrap();
        }

        private Task<List<ThemeRuntimeSetting>> _getInstanceValues;
        public Task<List<ThemeRuntimeSetting>> GetInstanceValues(string themeId)
        {

            var key = typeof(List<ThemeRuntimeSetting>) + themeId;

            var ret = _cache[key] as Tuple<DateTime, List<ThemeRuntimeSetting>>;
            if (ret != null )
            {
                var tcs = new TaskCompletionSource<List<ThemeRuntimeSetting>>();
                tcs.SetResult(ret.Item2 );
                _ts = ret.Item1;
                return tcs.Task;
            }

            if (_getInstanceValues == null)
            {
                _getInstanceValues = _cmsService.GetByPath2("settings", this.GetFileName(themeId)).ContinueWith<List<ThemeRuntimeSetting>>(
                    res =>
                    {
                        List<ThemeRuntimeSetting> values = new List<ThemeRuntimeSetting>();
                        if (res.Result.ResponseMessage.IsSuccessStatusCode)
                        {
                            var doc = res.Result.ReadAsSync();

                            _ts = doc.UpdateDate.GetValueOrDefault(DateTime.Today);
                            var data = doc.Get<string>("data");
                            if (data != null)
                            {
                                values = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ThemeRuntimeSetting>>(doc.Get<string>("data"));
                            }

                            _cache[key] = new Tuple<DateTime, List<ThemeRuntimeSetting>>(_ts.Value, values);
                        }
                        else
                        {
                            _ts = DateTime.Today;
                            _cache[key] = new Tuple<DateTime, List<ThemeRuntimeSetting>>(_ts.Value, values);

                        }
                        return values;
                    });
            }
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
                return this.GetInstanceValues(themeId).ContinueWith<ThemeRuntimeSettingsCollection>(task =>
                    {

                        List<ThemeRuntimeSetting> values = task.Result;
                        var dic = new Dictionary<string, ThemeRuntimeSetting>(StringComparer.OrdinalIgnoreCase);

                        foreach (var setting in _siteContext.Theme.MergedSettings)
                        {
                            if (dic.ContainsKey(setting.Id))
                                continue;

                            var val = values.Where(rts => rts.Setting.Id == setting.Id).Select(rts => rts.Value).FirstOrDefault() ?? setting.DefaultValue;

                            dic.Add(setting.Id, new ThemeRuntimeSetting(setting, val));
                        }

                        _runtimeValues = new ThemeRuntimeSettingsCollection(dic.Values.ToList());
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
            if (_getTimeStamp == null)
            {

                _getTimeStamp = GetInstanceValues(themeId).ContinueWith(x => _ts.Value );
            }
            return _getTimeStamp;
        }


       
    }
}
