// -----------------------------------------------------------------------
// <copyright file="IDocumentTypeHelper.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Core;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using Content.Contracts.Clients;
    using Models.CMS;
    using System.Collections;
    using UX.Models.StoreFront.CMS;

    /// <summary>
    /// TODO: Update summary.
    /// </summary>
   
    public class CmsTypeHelper :ICmsTypeHelper
    {
        IDocumentTypeWebApiClient _docTypeClient;
        IPropertyTypeWebApiClient _propTypeClient;
        private readonly IApiContext _apiContext;
        System.Runtime.Caching.ObjectCache _cache;
        //static ConcurrentDictionary<string, Mozu.Content.Contracts.DocumentType> _tenantDocDic = new ConcurrentDictionary<string, ContentService.Contracts.DocumentType>();
        static Hashtable g_cache = new Hashtable();


        public CmsTypeHelper(IDocumentTypeWebApiClient docTypeClient, IPropertyTypeWebApiClient propClient, IApiContext apiContext)
        {
            
            //_widgetProvider = widgetProvider;
           // _pageTypeProvider = pageTypeProvider;
            
            _propTypeClient = propClient;
            _apiContext = apiContext;
            _docTypeClient = docTypeClient;
            _cache = System.Runtime.Caching.MemoryCache.Default;
        }

        public  DocumentType GetDocumentType(string name)
        {
            Mozu.Content.Contracts.DocumentType doc;
            Dictionary<string, Mozu.Content.Contracts.DocumentType> dic = null;
            string key = typeof(CmsTypeHelper) + "doc" + _apiContext.SiteId;
            lock (g_cache)
            {
                dic = (Dictionary<string, Mozu.Content.Contracts.DocumentType>)g_cache[key]; ;
            }
            if (dic == null)
            {
                var props = _docTypeClient.List(int.MaxValue, 0).Result.ReadAsSync();
                
                dic = props.Items.ToDictionary(x => x.Name, StringComparer.OrdinalIgnoreCase);
                lock (g_cache)
                {
                    g_cache[key] = dic;
                }
                //_cache.Set(key, dic, new System.Runtime.Caching.CacheItemPolicy() { SlidingExpiration = TimeSpan.FromMinutes(10) , Priority = System.Runtime.Caching.CacheItemPriority.NotRemovable  });
            }

            if (dic.TryGetValue(name, out doc))
            {
                return doc;
            }
            return null;
        }
        public PropertyType GetPropertyType(string name)
        {
            Mozu.Content.Contracts.PropertyType prop;
            Dictionary<string, Mozu.Content.Contracts.PropertyType> dic = null;
            string key = typeof(CmsTypeHelper) + "prop" + _apiContext.SiteId;
            lock (g_cache)
            {
                dic = (Dictionary<string, Mozu.Content.Contracts.PropertyType>)g_cache[key];// _cache.Get(key);
            }
            if (dic == null)
            {
                var response = _propTypeClient.GetList(int.MaxValue, 0).Result;
                var props = response.ReadAsAsync().Result.Items;
                //props.ForEach(x => x.PropertyValueType.Name = x.Name == "tags" ? "tags" : x.PropertyValueType.Name);

                dic = props.ToDictionary(x => x.Name, StringComparer.OrdinalIgnoreCase);
                lock (g_cache)
                {
                    g_cache[key] = dic;
                }
                
                //_cache.Set(key, dic, new System.Runtime.Caching.CacheItemPolicy() { SlidingExpiration = TimeSpan.FromMinutes(10) , Priority= System.Runtime.Caching.CacheItemPriority.NotRemovable });
            }

            if (dic.TryGetValue(name, out prop))
            {
                return prop;
            }
            return null;
            

        }

       
    }

    public class ThemeEntityDefinitionProvider:IThemeEntityDefinitionProvider
    {
        private readonly ISiteBuilderContext _siteBuilderContext;

        public ThemeEntityDefinitionProvider (ISiteBuilderContext siteBuilderContext)
        {
            _siteBuilderContext = siteBuilderContext;
        }
        public WidgetDefinition GetWidgetDefintion(string id)
        {
            return _siteBuilderContext.Theme.Widgets.FirstOrDefault(x => x.Id == id);

        }

        public PageTypeDefinition GetPageTypeDefinition(string id)
        {
            return _siteBuilderContext.Theme.PageTypes.FirstOrDefault(x => x.Id == id);

        }

        public IEnumerable<PageTypeDefinition> GetPageTypeDefinitions()
        {
            return _siteBuilderContext.Theme.PageTypes;
        }
    }
}
