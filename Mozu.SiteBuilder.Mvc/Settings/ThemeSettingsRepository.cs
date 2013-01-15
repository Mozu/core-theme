using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.Serialization.Json;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Models.Admin.ThemeSettings;
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
        
        public async Task<List<FieldValue>> SaveInstanceValues(List<FieldValue> values)
        {
            var id = GetOrCreateCmsDocumentId();

            await UpdateSettings(values, id);
            VersionCmsDocument(id);
            return values;
        }

        private void VersionCmsDocument(string id)
        {
            var doc = _docWebApiClient.Get("settings", id, null, null).Result.ReadAsSync();
            doc.Set("title", DateTime.Now.Ticks.ToString());
            var res  = _docWebApiClient.Update("settings", id, doc).Result;
            if (res.HasException )
            {
                throw res.ReadException();
            }
        }

        private async Task<StreamContent> UpdateSettings(List<FieldValue> values, string documentId)
        {
            using (var stream = new MemoryStream())
            {
                _serializer.WriteObject(stream, values);
                stream.Position = 0;

                var result = await _docWebApiClient.UpdateDocumentContent("settings", documentId, stream);
                if (result.HasException)
                    throw result.ReadException();

                return result.ReadAsAsync().Result;
            }
        }

        static System.Collections.Concurrent.ConcurrentDictionary<string, string> g_docIdCache = new System.Collections.Concurrent.ConcurrentDictionary<string, string>();

        string GetOrCreateCmsDocumentId()
        {
            var theme = _siteContext.Theme.Id.ToLowerInvariant();
            return g_docIdCache.GetOrAdd(theme, GetOrCreateCmsDocumentIdInternal);
        }

        string GetOrCreateCmsDocumentIdInternal(string theme)
        {            
            var docName = "theme_settings_" + theme;
            var document = _cmsService.GetByPath("settings", docName, null).Result.ReadAsSync();

            if (document == null)
            {
                // Create a new theme settings document

                var metaDoc = new Document
                {
                    Name = docName,
                    DocumentType = "theme_settings",
                    ContentCollection = "settings",
                    Properties = new List<PropertyValue>
                    {
                        new PropertyValue
                            {
                                PropertyType = "title",
                                Value = "My title"
                            },
                        new PropertyValue
                            {
                                PropertyType = "theme",
                                Value = theme
                            },
                        new PropertyValue
                            {
                                PropertyType = "tags",
                                Value = new object[] {"something"}
                            }
                    }
                };

                document = _docWebApiClient.Create(metaDoc.ContentCollection, metaDoc).Result.ReadAsSync();
            }
            
            return document.Id;
        }

        public async Task<List<FieldValue>> GetInstanceValues()
        {
            var id = GetOrCreateCmsDocumentId();
            var key = typeof (List<FieldValue>) + id;

            var ret = _cache[key] as List<FieldValue>;
            if (ret != null )
            {
                return ret;
            }

            using (var content = _docWebApiClient.GetDocumentContent("settings", id).Result.ResponseMessage.Content)
            using (var stream = await content.ReadAsStreamAsync())
            {
                stream.Position = 0;
                var values = _serializer.ReadObject(stream) as List<FieldValue>;
                _cache[key] = values;
                return values;
            }
        }

        private RuntimeConfigurationFieldCollection _runtimeValues;

        public async Task<RuntimeConfigurationFieldCollection> GetRuntimeValues()
        {
            if (_runtimeValues == null)
            {
                var values = await this.GetInstanceValues();
                var dic = new Dictionary<string, RuntimeConfigurationField>(StringComparer.OrdinalIgnoreCase);
                
                var configFile = _siteContext.Theme.Configuration;
                foreach (var config in configFile.Flatten(x => x.Items).Where(x => x.ItemType == "field" &&  !dic.ContainsKey(x.Id)))
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

                _runtimeValues=  new RuntimeConfigurationFieldCollection(){ Dictionary = dic };
            }

            return _runtimeValues;

           
         }

        private DateTime? _ts;
        public DateTime GetTimeStamp()
        {
            if (!_ts.HasValue )
            {
                _cmsService.BypassCache = true;
                var doc = _cmsService.Get("settings", this.GetOrCreateCmsDocumentId()).Result;
                _cmsService.BypassCache = false ;
                if ( doc.ResponseMessage.IsSuccessStatusCode)
                {
                    var text = (doc.ReadAsSync().Get("title") as string) ?? "";
                    long ticks;
                    if (long.TryParse(text, out ticks))
                    {
                        _ts = new DateTime(ticks);
                    }
                 
                    
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
