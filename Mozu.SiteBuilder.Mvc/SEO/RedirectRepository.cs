using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Runtime.Caching;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Routing;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using Mozu.SiteSettings.General.Contracts.General.Routing;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public interface ICustomRouteCollectionRepository
    {
        Task<HttpRouteCollection> GetHttpRouteCollection();
    }

    public interface ICustomRouteHandler
    {
        Task<bool> RouteIncomingRequest();

        Task<bool> Init();

        IHttpRouteData GetRouteData(string virtualPathRoot, HttpRequestMessage request);


        /// <summary>
        /// if a canonical url exists for the internalroute that is specified, this method creates a redirect to that url, with potentially new viewdata that can be injected.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="internalRoute"></param>
        /// <param name="viewDataAdditionFunc"></param>
        /// <returns></returns>
        Task<HttpResponseMessage> RedirectWithContext(HttpRequestMessage request, FancyRoute internalRoute, Func<IDictionary<string,object>> viewDataAdditionFunc = null);
        Task<string> GetCannonicalUrl( FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc, bool useExistingValues );
        
    }
   
    public interface IRedirectRepository
    {
        Task<Dictionary<string, RedirectEntry>> FetchRedirectEntries(int? siteId = null);
        Task<Dictionary<string, RedirectEntry>> UpdateRedirectEntries(Dictionary<string, RedirectEntry> redirects, int? siteId = null);
    }

    public class RedirectRepository : IRedirectRepository
    {
        const string FileName = "redirects.1.1";
        MemoryCache _cache;
        readonly IDocumentListWebApiClient _systemDocumentClient;
        readonly ILogger _logger;
        readonly ISiteBuilderApiContext _siteBuilderApiContext;
        Task<Dictionary<string, RedirectEntry>> _redirectEntryListTask;
        readonly IDocumentListWebApiClient _userDocumentClient;

        public RedirectRepository(IDocumentListWebApiClient documentListWebApiClient, ISiteBuilderApiContext siteBuilderApiContext, ILogger logger)
        {
            _siteBuilderApiContext = siteBuilderApiContext;
            _systemDocumentClient = documentListWebApiClient.CloneWithoutUserClaims();
            _userDocumentClient = documentListWebApiClient;
            _cache = MemoryCache.Default;
            _logger = logger;
        }

        static System.Collections.Concurrent.ConcurrentDictionary<string, AsyncLock> _redirectLookupLock = new System.Collections.Concurrent.ConcurrentDictionary<string, AsyncLock>();

        async Task<Dictionary<string, RedirectEntry>> IRedirectRepository.FetchRedirectEntries(int? siteId)
        {
            if (_redirectEntryListTask == null)
            {
                var client = siteId == null ? _systemDocumentClient : _systemDocumentClient.CloneWithSbContext(_siteBuilderApiContext).CloneWithSiteId(siteId);

                _redirectEntryListTask = client
                    .CloneWithConfigOptions(x => x.TimeoutMilliseconds = 5000)
                    .GetTreeDocument("siteSettings@mozu", FileName)
                    .ContinueWith(gdt =>LookupRedirectsFromCmsMetaDoc(gdt, client))
                    .Unwrap();
            }
            
            return await _redirectEntryListTask.ConfigureAwait(false);
        }

        private async Task<Dictionary<string, RedirectEntry>> LookupRedirectsFromCmsMetaDoc(Task<ServiceClientResponse<Document>> gdt, IDocumentListWebApiClient client)
        {
            string fallbackKey = CreateKey(null);
            Document doc = null;
            Dictionary<string, RedirectEntry> ret = null;

            
            if (!gdt.IsCompleted || gdt.Result.HasException || ( gdt.Result.ResponseMessage== null ||  !gdt.Result.ResponseMessage.IsSuccessStatusCode) )
            {
                if (gdt.IsFaulted)
                {
                    _logger.Error("error looking up redirects", gdt.Exception);
                }
                ret = _cache[fallbackKey] as Dictionary<string, RedirectEntry> ;
                if (ret == null)
                {
                    _cache[fallbackKey] = ret = new Dictionary<string, RedirectEntry>();
                }
                return ret;
            }


            doc = await gdt.Result.ReadAsAsync().ConfigureAwait(false);

            

            var key = CreateKey(doc);
            ret = _cache[key] as Dictionary<string, RedirectEntry>;
            if (ret == null)
            {
                string lockStr = string.Intern(fallbackKey);
                AsyncLock ayncLock = null;
                ayncLock = _redirectLookupLock.GetOrAdd(lockStr, new AsyncLock());
                
                using (var releaser = await ayncLock.LockAsync().ConfigureAwait(false))
                {
                    ret = await BuildRedirectEntriesFromCmsDocument(key, client, doc, fallbackKey).ConfigureAwait(false);
                }
            }
            return ret;
        }

        async Task<Dictionary<string, RedirectEntry>> BuildRedirectEntriesFromCmsDocument( string key, IDocumentListWebApiClient client, Document doc, string fallbackKey)
        {
            Dictionary<string, RedirectEntry> ret = _cache[key] as Dictionary<string, RedirectEntry>;
            if (ret == null)
            {
                try
                {
                    var res = await client.CloneWithConfigOptions(x => x.TimeoutMilliseconds = 8000)
                            .GetDocumentContent("siteSettings@mozu", doc.Id)
                            .ConfigureAwait(false);
                          

                    if (res.HasException == false &&  res.ResponseMessage.IsSuccessStatusCode && res.ResponseMessage.Content.Headers.ContentLength > 0)
                    {
                        using (var stream = await res.ResponseMessage.Content.ReadAsStreamAsync().ConfigureAwait(false))
                        using ( var tr = new StreamReader(stream))
                        using( var jr = new JsonTextReader(tr))
                        {
                            try
                            {
                                ret = JsonSerializer.CreateDefault().Deserialize<Dictionary<string, RedirectEntry>>(jr);
                                ret = new Dictionary<string, RedirectEntry>(ret, StringComparer.OrdinalIgnoreCase);
                                _cache[key] = ret;
                                _cache.Set(fallbackKey, ret,
                                    new CacheItemPolicy() {AbsoluteExpiration = ObjectCache.InfiniteAbsoluteExpiration});
                            }
                            catch (Exception ex)
                            {
                                _logger.Error(ex);
                                ret = new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);
                                _cache[key] = ret;
                            }
                        }
                    }
                    else
                    {
                        ret = new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);
                        _cache[key] = ret;
                    }
                }

                catch (Exception ex)
                {
                    _logger.Error("error looking up redirects", ex);

                    ret = _cache[fallbackKey] as Dictionary<string, RedirectEntry>;
                    if (ret == null)
                    {
                        ret = new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);
                        _cache.Set(key, ret, new CacheItemPolicy() {AbsoluteExpiration = DateTimeOffset.UtcNow.AddSeconds(10)});
                    }
                    else
                    {
                        _cache.Set(key, ret, new CacheItemPolicy() {AbsoluteExpiration = DateTimeOffset.UtcNow.AddSeconds(30)});
                    }
                }
            }
            return ret;
        }

        Task<Dictionary<string, RedirectEntry>> IRedirectRepository.UpdateRedirectEntries(Dictionary<string, RedirectEntry> redirects, int? siteId)
        {
            var client = siteId.HasValue ? _userDocumentClient.CloneWithSbContext(_siteBuilderApiContext).CloneWithSiteId(siteId) : _userDocumentClient;
            return client.GetTreeDocument("siteSettings@mozu", FileName).ContinueWith(gdt =>
            {
                bool exists = false;

                ServiceClientResponse<Document> gtRes = gdt.Result;
                if (gtRes.ResponseMessage.IsSuccessStatusCode)
                {
                    exists = true;
                }
                if (!exists)
                {
                    gtRes = client.CreateDocument("siteSettings@mozu", new Document {Name = FileName, DocumentTypeFQN = "document@mozu", Properties = new JObject()}).Result;
                }

                Document doc = gtRes.ReadAsSync();
                var stream = new MemoryStream();
                var sw = new StreamWriter(stream);
                var jw = new JsonTextWriter(sw);
                JsonSerializer.CreateDefault().Serialize(jw, redirects);
                jw.Flush();
                stream.Position = 0;
                client.UpdateDocumentContent("siteSettings@mozu", doc.Id, stream).Wait();
                doc.Set("data", DateTime.UtcNow.ToString());
                doc = client.UpdateDocument("siteSettings@mozu", doc.Id, doc).Result.ReadAsSync();
                string key = CreateKey(doc);
                _cache[key] = redirects;
                

                return redirects;
            });
        }

        private string CreateKey(Document doc)
        {

            DateTime? dateStamp = doc == null ? null : (doc.ContentUpdateDate ?? doc.UpdateDate ?? doc.InsertDate);
            string key = typeof (RedirectRepository).FullName + dateStamp + _siteBuilderApiContext.SiteId + (_siteBuilderApiContext.DataViewMode == DataViewModeType.Pending);
            return key;
        }
       
    }

    public static class ClientExt
    {
        public static T CloneWithSbContext<T>(this T client, ISiteBuilderApiContext sbContext) where T : IServiceClientBase<T>
        {
            return client.CloneWithApiContext(x =>
            {
                if (!x.MasterCatalogId.HasValue)
                {
                    x.MasterCatalogId = sbContext.MasterCatalogId;
                }
                if (!x.CatalogId.HasValue)
                {
                    x.CatalogId = sbContext.CatalogId;
                }
                if (string.IsNullOrWhiteSpace(x.LocaleCode))
                {
                    x.LocaleCode = sbContext.LocaleCode;
                }
                if (!x.SiteId.HasValue)
                {
                    x.SiteId = sbContext.SiteId;
                }
            });
        }

        public static T CloneWithSiteId<T>(this T client, int? siteid) where T : IServiceClientBase<T>
        {
            return client.CloneWithApiContext(ctx => ctx.SiteId = siteid);
        }
    }
}