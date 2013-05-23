using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.Serialization.Json;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;
using Newtonsoft.Json;
using Document = Mozu.Content.Contracts.Document;
using Mozu.SiteBuilder.Mvc.Extensions;


namespace Mozu.SiteBuilder.Mvc.Settings
{
    public class ThemeSettingsRepository : IThemeSettingsRepository
    {
        private readonly IDocumentWebApiClient _docWebApiClient;
        private readonly ICmsServiceWrapper _cmsService;
        private readonly DataContractJsonSerializer _serializer;
        //private readonly List<SettingConfiguration> _coreConfig = null;
        //private readonly List<SettingConfiguration> _mergedConfig = null;
        private readonly ISiteBuilderContext _siteContext;
        //private RuntimeConfigurationFieldCollection _runtimeValues;
        private readonly IStorefrontCache _cache;

        public ThemeSettingsRepository(IDocumentWebApiClient docWebApiClient, ICmsServiceWrapper cmsService, ISiteBuilderContext siteContext, IStorefrontCache cache)
        {
            if (docWebApiClient == null)
            {
                throw new ArgumentNullException("docWebApiClient");
            }

            if (cmsService == null)
            {
                throw new ArgumentNullException("cmsService");
            }
            _siteContext = siteContext;
            _serializer = new DataContractJsonSerializer(typeof(List<FieldValue>));
            _docWebApiClient = docWebApiClient;
            _cmsService = cmsService;
            _siteContext = siteContext;
            _cache = cache;
        }
        
        public async Task<List<FieldValue>> SaveInstanceValues(List<FieldValue> values, string themeId)
        {

            await UpdateSettings(values, themeId);
            //VersionCmsDocument(id);
            return values;
        }


        private async Task<StreamContent> UpdateSettings(List<FieldValue> values, string themeId)
        {
            Document doc = null;
            var res = await _cmsService.GetByPath2("settings", this.GetFileName(themeId), "active");
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                doc = res.ReadAsSync();
                doc.Set("data", Newtonsoft.Json.JsonConvert.SerializeObject(values, Formatting.None));
                await _cmsService.Update2(doc);
                return null;
            }
            else
            {
                doc = new Document
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
               
                await _cmsService.RawCreate2(doc);
                return null;
            }

        }


        public  Task<List<FieldValue>> GetInstanceValues(string themeId)
        {

            var key = typeof(List<FieldValue>) + themeId;

            var ret = _cache[key] as List<FieldValue>;
            if (ret != null )
            {
                
                var tcs = new TaskCompletionSource<List<FieldValue>>();
                tcs.SetResult(ret);
                return tcs.Task;

            }

            return _cmsService.GetByPath2("settings", this.GetFileName(themeId),"active").ContinueWith<List<FieldValue>>(res =>
                {
                    List<FieldValue> values = new List<FieldValue>();
                    if (res.Result.ResponseMessage.IsSuccessStatusCode)
                    {
                        var doc = res.Result.ReadAsSync();
                        values = Newtonsoft.Json.JsonConvert.DeserializeObject<List<FieldValue>>(doc.Get<string>("data"));
                        _cache[key] = values;
                    }
                    
                    return values;
                });
           
        }

        private RuntimeConfigurationFieldCollection _runtimeValues;

        public  Task<RuntimeConfigurationFieldCollection> GetRuntimeValues(string themeId)
        {
            if (_runtimeValues == null)
            {
                return  this.GetInstanceValues(themeId).ContinueWith<RuntimeConfigurationFieldCollection>(task =>
                    {
                        var values = task.Result;
                        var dic = new Dictionary<string, RuntimeConfigurationField>(StringComparer.OrdinalIgnoreCase);

                        var configFile = _siteContext.Theme.Configuration;
                        foreach (var config in configFile.Flatten(x => x.Items).Where(x => x.ItemType == "field" && !dic.ContainsKey(x.Id)))
                        {
                            var val = values.Where(x => x.Id == config.Id).Select(x => x.Value).FirstOrDefault();
                            var rval = new RuntimeConfigurationField()
                                           {
                                               DefaultValue = config.DefaultValue,
                                               Id = config.Id,
                                               Type = config.ItemType,
                                               Value = val
                                           };
                            dic.Add(config.Id, rval);
                        }

                        _runtimeValues = new RuntimeConfigurationFieldCollection() {Dictionary = dic};
                        return _runtimeValues;

                    });
             
            }
            var tcs = new TaskCompletionSource<RuntimeConfigurationFieldCollection>();
            tcs.SetResult(_runtimeValues);
            return tcs.Task;

           
           
         }

        string GetFileName(string themeId)
        {
            return "theme_settings_" + themeId.ToLowerInvariant();
        }

        private DateTime? _ts;
        public DateTime GetTimeStamp(string themeId)
        {
            if (!_ts.HasValue )
            {
                var res = _cmsService.GetByPath2("settings", GetFileName(themeId),"active").Result;
                if ( res.ResponseMessage.IsSuccessStatusCode)
                {
                    _ts= res.ReadAsSync().UpdateDate.GetValueOrDefault(DateTime.Today);


                }
                if ( !_ts.HasValue)
                {
                    _ts = DateTime.Today;
                }
                

            }
            return _ts.Value;
        }


       
    }
}
