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
        Task<RuntimeRedirects> GetRuntimeRedirectEntries(int? siteId = null);
        Task<Dictionary<string, RedirectEntry>> UpdateRedirectEntries(Dictionary<string, RedirectEntry> redirects, int? siteId = null);
    }

    public class RuntimeRedirects
    {
        
        public Dictionary<string, RedirectEntry> Simple { get; set; }
        public Dictionary<string, List<RuntimeRedirectEntry>> QueryString { get; set; }

        public JObject Entries { get; set; }
    }
    public class RuntimeRedirectEntry
    {
        public System.Collections.Specialized.NameValueCollection Query { get; set; }
        public RedirectEntry Redirect{ get; set; }
    }
  

    public class RedirectRepository : IRedirectRepository
    {
        const string FileName = "redirects.1.1";
        MemoryCache _cache;
        readonly IDocumentListWebApiClient _systemDocumentClient;
        readonly ILogger _logger;
        readonly ISiteBuilderApiContext _siteBuilderApiContext;
        Task<RuntimeRedirects> _redirectEntryListTask;
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

         Task<Dictionary<string, RedirectEntry>> IRedirectRepository.FetchRedirectEntries(int? siteId)
        {
             var client = siteId == null ? _systemDocumentClient : _systemDocumentClient.CloneWithSbContext(_siteBuilderApiContext).CloneWithSiteId(siteId);
             return DoFetchEntries(client);

        }

        Task<RuntimeRedirects> IRedirectRepository.GetRuntimeRedirectEntries(int? siteId)
        {
            if (_redirectEntryListTask == null)
            {
                var client = siteId == null ? _systemDocumentClient : _systemDocumentClient.CloneWithSbContext(_siteBuilderApiContext).CloneWithSiteId(siteId);
                
                _redirectEntryListTask = client
                    .CloneWithConfigOptions(x => x.TimeoutMilliseconds = 5000)
                    .GetTreeDocument("siteSettings@mozu", FileName)
                    .ContinueWith(gdt => LookupRedirectsFromCmsMetaDoc(gdt, client))
                    .Unwrap();
            }

            return _redirectEntryListTask;
        }
        
      

        private async Task<RuntimeRedirects> LookupRedirectsFromCmsMetaDoc(Task<ServiceClientResponse<Document>> gdt, IDocumentListWebApiClient client)
        {
            string fallbackKey = CreateKey(null);
            Document doc = null;
            RuntimeRedirects ret = null;

            
            if (!gdt.IsCompleted || gdt.Result.HasException || ( gdt.Result.ResponseMessage== null ||  !gdt.Result.ResponseMessage.IsSuccessStatusCode) )
            {
                if (gdt.IsFaulted)
                {
                    _logger.Error("error looking up redirects", gdt.Exception);
                }
                ret = _cache[fallbackKey] as RuntimeRedirects;
                if (ret == null)
                {
                    _cache[fallbackKey] = ret = new RuntimeRedirects();
                }
                return ret;
            }


            doc = await gdt.Result.ReadAsAsync().ConfigureAwait(false);

            

            var key = CreateKey(doc);
            ret = _cache[key] as RuntimeRedirects;
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
        async Task<Dictionary<string,RedirectEntry>> DoFetchEntries( IDocumentListWebApiClient client)
        {
            return await client.CloneWithConfigOptions(x => x.TimeoutMilliseconds = 8000)
                            .GetTreeDocumentContent("siteSettings@mozu", FileName)
                            .ContinueWith(x =>
                            {
                                if (x.IsFaulted)
                                {
                                    return new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);
                                }
                                var resp = x.Result;
                                if (!resp.ResponseMessage.IsSuccessStatusCode)
                                {
                                    return new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);
                                }

                                using (var stream = resp.ResponseMessage.Content.ReadAsStreamAsync().Result)
                                using (var tr = new StreamReader(stream))
                                using (var jr = new JsonTextReader(tr))
                                {
                                    try
                                    {
                                        var dic = Newtonsoft.Json.JsonSerializer.CreateDefault().Deserialize<Dictionary<string, RedirectEntry>>(jr);
                                        return new Dictionary<string, RedirectEntry>(dic, StringComparer.OrdinalIgnoreCase);
                                        
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger.Error(ex);
                                        return new Dictionary<string, RedirectEntry>( StringComparer.OrdinalIgnoreCase);
                                       
                                    }
                                }

                            })
                            .ConfigureAwait(false);
        }
        async Task<RuntimeRedirects> BuildRedirectEntriesFromCmsDocument( string key, IDocumentListWebApiClient client, Document doc, string fallbackKey)
        {
            var ret = _cache[key] as RuntimeRedirects;
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
                                var jObject = JObject.Load(jr);
                                
                                ret = BuildRuntimeRedirects(jObject);

                                _cache[key] = ret;
                                _cache.Set(fallbackKey, ret,
                                    new CacheItemPolicy() {AbsoluteExpiration = ObjectCache.InfiniteAbsoluteExpiration});
                            }
                            catch (Exception ex)
                            {
                                _logger.Error(ex);
                                ret = new RuntimeRedirects();
                                _cache[key] = ret;
                            }
                        }
                    }
                    else
                    {
                        ret = new RuntimeRedirects();
                        _cache[key] = ret;
                    }
                }

                catch (Exception ex)
                {
                    _logger.Error("error looking up redirects", ex);

                    ret = _cache[fallbackKey] as RuntimeRedirects;
                    if (ret == null)
                    {
                        ret = new RuntimeRedirects();
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
        RuntimeRedirects BuildRuntimeRedirects ( JObject  entries)
        {
            RuntimeRedirects rr = new RuntimeRedirects()
            {
                Entries = entries,
                QueryString = new Dictionary<string,List<RuntimeRedirectEntry>>(StringComparer.OrdinalIgnoreCase),
                Simple = new Dictionary<string,RedirectEntry>(StringComparer.OrdinalIgnoreCase)
            };

            foreach (var entry in entries)
            {
                var source = entry.Key;
                //todo check ser;
                var redirect = entry.Value.ToObject<RedirectEntry>();
                redirect.Source = source;
                var qPos = source.IndexOf('?');
                if (qPos == -1)
                {
                    rr.Simple[source] = redirect;
                    continue;
                }
                List<RuntimeRedirectEntry> qsEntries;


                var stem = source.Substring(0, qPos);

                if (!rr.QueryString.TryGetValue(stem, out qsEntries))
                {
                    qsEntries = new List<RuntimeRedirectEntry>();
                    rr.QueryString[stem] = qsEntries;
                }
                qsEntries.Add(new RuntimeRedirectEntry()
                {
                    Redirect = redirect,
                    Query = System.Web.HttpUtility.ParseQueryString(source.Substring(qPos + 1))
                });
            }
            

            

            return rr;
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