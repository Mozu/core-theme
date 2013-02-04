// -----------------------------------------------------------------------
// <copyright file="IDocumentTypeHelper.cs" company="Microsoft">
// TODO: Update copyright text.
// </copyright>
// -----------------------------------------------------------------------

using System.Threading.Tasks;
using Mozu.Content.Contracts;

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
        ISiteBuilderContext _ctx;
        private readonly IWidgetProvider _widgetProvider;
        private readonly IPageTypeProvider _pageTypeProvider;
        System.Runtime.Caching.ObjectCache _cache;
        //static ConcurrentDictionary<string, Mozu.Content.Contracts.DocumentType> _tenantDocDic = new ConcurrentDictionary<string, ContentService.Contracts.DocumentType>();
        static Hashtable g_cache = new Hashtable();


        public CmsTypeHelper(IDocumentTypeWebApiClient docTypeClient, IPropertyTypeWebApiClient propClient, ISiteBuilderContext ctx, IWidgetProvider widgetProvider, IPageTypeProvider pageTypeProvider)
        {
            _ctx = ctx;
            _widgetProvider = widgetProvider;
            _pageTypeProvider = pageTypeProvider;
            _propTypeClient = propClient;
            _docTypeClient = docTypeClient;
            _cache = System.Runtime.Caching.MemoryCache.Default;
        }

        public async Task<DocumentType> GetDocumentType(string name)
        {
            Mozu.Content.Contracts.DocumentType doc;
            Dictionary<string, Mozu.Content.Contracts.DocumentType> dic = null;
            string key = typeof(CmsTypeHelper) + "doc" + _ctx.SiteId;
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
        public async Task<PropertyType> GetPropertyType(string name)
        {
            Mozu.Content.Contracts.PropertyType prop;
            Dictionary<string, Mozu.Content.Contracts.PropertyType> dic = null;
            string key = typeof(CmsTypeHelper) + "prop" + _ctx.SiteId;
            lock (g_cache)
            {
                dic = (Dictionary<string, Mozu.Content.Contracts.PropertyType>)g_cache[key];// _cache.Get(key);
            }
            if (dic == null)
            {
                var props = _propTypeClient.List(int.MaxValue, 0).Result.ReadAsSync().Items;
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

        public async Task<WidgetDefinition> GetWidgetDefintion(string id)
        {
            return _widgetProvider.GetWidgets().FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<PageTypeDefinition> GetPageTypeDefinition(string id)
        {
            return _pageTypeProvider.GetPageTypes().FirstOrDefault(x => string.Equals(x.Id, id, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<IEnumerable<PageTypeDefinition>> GetPageTypeDefinitions()
        {
            return _pageTypeProvider.GetPageTypes();
        }
    }
}
