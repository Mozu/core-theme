using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Runtime.Caching;
using System.Threading.Tasks;
using System.Web.Http;
using System.Web.Http.Controllers;
using System.Web.Http.Hosting;
using System.Web.Http.Routing;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.ActionResults;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public interface ISiteRouteRepository
    {
        Task<List<SiteRouteEntry>> FetchSiteRouteEntries();


        Task<HttpRouteCollection> GetHttpRouteCollection();
        Task<List<SiteRouteEntry>> UpdateRedirectEntries(List<SiteRouteEntry> routes);
    }

    public interface ISiteRouteHandler
    {
        Task<bool> RouteIncomingRequest();
        HttpResponseMessage ProcessSeoRedirect();

        string GetCanonicalUrl(Document d);
    }

    public class SiteRouteHandler : ISiteRouteHandler
    {
        public static string ContextKey = "SiteRouteEntry";
        private readonly HttpRequestMessage _requestMessage;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly ISiteRouteRepository _siteRouteRepository;
        private object _httpRouteCollection;

        public SiteRouteHandler(ISiteRouteRepository siteRouteRepository, HttpRequestMessage requestMessage, ISiteBuilderApiContext siteBuilderApiContext)
        {
            _siteRouteRepository = siteRouteRepository;
            _requestMessage = requestMessage;
            _siteBuilderApiContext = siteBuilderApiContext;
        }

        private HttpRouteCollection RouteCollection
        {
            get
            {
                if (_httpRouteCollection == null)
                {
                    _httpRouteCollection = _siteRouteRepository.GetHttpRouteCollection().ConfigureAwait(false).GetAwaiter().GetResult() ?? new object();
                }
                return _httpRouteCollection as HttpRouteCollection;
            }
        }


        public string GetCanonicalUrl(Document d)
        {
            HttpRouteCollection rrCol = RouteCollection;
            if (rrCol != null)
            {
                HttpRouteValueDictionary vals = null;
                IHttpVirtualPathData vpathData = null;
                foreach (IHttpRoute route in rrCol)
                {
                    var entry = ((SiteRouteEntry) route.Defaults[ContextKey]);
                    if (entry.IsCanonical.GetValueOrDefault(false) && entry.PageType == PageTypes.document &&
                        (string.IsNullOrEmpty(entry.ListName) || string.Equals(entry.ListName, d.ListFQN, StringComparison.OrdinalIgnoreCase)))
                    {
                        if (vals == null)
                        {
                            vals = new HttpRouteValueDictionary();
                            vals[HttpRoute.HttpRouteKey] = true;
                            vals["name"] = d.Name;
                            vals["id"] = d.Id;
                            vals["list"] = d.ListFQN;
                        }
                        vpathData = route.GetVirtualPath(_requestMessage, vals);
                        if (vpathData != null)
                        {
                            string url = vpathData.VirtualPath;
                            if (url.Length > 0 && url[0] != '/')
                            {
                                url = "/" + url;
                            }

                            url = url.Split('?')[0];
                            return url;
                        }
                    }
                }
            }
            return "cms/" + d.ListFQN + "/" + d.Name;
        }

        public async Task<bool> RouteIncomingRequest()
        {
            HttpRouteCollection routeCollection = await GetRouteCollectionTask();
            if (routeCollection == null)
            {
                return false;
            }

            IHttpRouteData reRouteData = routeCollection.GetRouteData(_requestMessage);
            SiteRouteEntry siteRouteEntry = null;
            if (reRouteData != null)
            {
                siteRouteEntry = (SiteRouteEntry) reRouteData.Values[ContextKey];

                _requestMessage.Properties[HttpPropertyKeys.HttpRouteDataKey] = reRouteData;

                _requestMessage.Properties[ContextKey] = siteRouteEntry;
                HttpRequestContext rctx = _requestMessage.GetRequestContext();
                rctx.RouteData = reRouteData;
                return true;
            }
            return false;
        }


        public HttpResponseMessage ProcessSeoRedirect()
        {
            string key = ContextKey;
            object tmp;
            SiteRouteEntry siteRouteEntry = null;

            if (_siteBuilderApiContext.IsEditMode)
            {
                return null;
            }

            if (_requestMessage.Properties.TryGetValue(key, out tmp))
            {
                siteRouteEntry = (SiteRouteEntry) tmp;
                if (siteRouteEntry.IsCanonical.GetValueOrDefault(false))
                {
                    return null;
                }
            }
            var vals = new HttpRouteValueDictionary(_requestMessage.GetRouteData().Values);
            vals[HttpRoute.HttpRouteKey] = true;
            string controller = ((string) vals["controller"] ?? "").ToLowerInvariant();
            string action = ((string) vals["action"] ?? "").ToLowerInvariant();


            switch (controller)
            {
                case "cmspages":
                {
                    switch (action)
                    {
                        case "page":
                        {
                            return ProcessCmsPageRedirect(_requestMessage, vals);
                        }
                        case "contentindex":
                        {
                            return ProcessCmsIndexRedirect(_requestMessage, vals);
                        }
                    }
                    break;
                }
                default:
                {
                    return null;
                }
            }
            return null;
        }

        private async Task<HttpRouteCollection> GetRouteCollectionTask()
        {
            if (_httpRouteCollection == null)
            {
                _httpRouteCollection = (await _siteRouteRepository.GetHttpRouteCollection().ConfigureAwait(false)) ?? new object();
            }
            return _httpRouteCollection as HttpRouteCollection;
        }

        private HttpResponseMessage ProcessCmsIndexRedirect(HttpRequestMessage request, HttpRouteValueDictionary vals)
        {
            HttpRouteCollection rrCol = RouteCollection;
            if (rrCol == null)
            {
                return null;
            }


            var list = (string) vals["list"];
            IHttpVirtualPathData vpathData = null;
            foreach (IHttpRoute route in rrCol)
            {
                var entry = ((SiteRouteEntry) route.Defaults[ContextKey]);
                if (entry.IsCanonical.GetValueOrDefault(false) && entry.PageType == PageTypes.documentList &&
                    (string.IsNullOrEmpty(entry.ListName) || string.Equals(entry.ListName, list, StringComparison.OrdinalIgnoreCase)))
                {
                    vpathData = route.GetVirtualPath(request, vals);
                    if (vpathData != null)
                    {
                        string url = vpathData.VirtualPath;
                        if (url.Length > 0 && url[0] != '/')
                        {
                            url = "/" + url;
                        }

                        url = url.Split('?')[0];
                        return request.CreateResponse(HttpStatusCode.MovedPermanently, new RedirectResult(url, true));
                    }
                }
            }
            return null;
        }

        private HttpResponseMessage ProcessCmsPageRedirect(HttpRequestMessage request, HttpRouteValueDictionary vals)
        {
            HttpRouteCollection rrCol = RouteCollection;
            if (rrCol == null)
            {
                return null;
            }


            var list = (string) vals["list"];
            IHttpVirtualPathData vpathData = null;
            foreach (IHttpRoute route in rrCol)
            {
                var entry = ((SiteRouteEntry) route.Defaults[ContextKey]);
                if (entry.IsCanonical.GetValueOrDefault(false) && entry.PageType == PageTypes.document &&
                    (string.IsNullOrEmpty(entry.ListName) || string.Equals(entry.ListName, list, StringComparison.OrdinalIgnoreCase)))
                {
                    vpathData = route.GetVirtualPath(request, vals);
                    if (vpathData != null)
                    {
                        string url = vpathData.VirtualPath;
                        if (url.Length > 0 && url[0] != '/')
                        {
                            url = "/" + url;
                        }

                        url = url.Split('?')[0];
                        return request.CreateResponse(HttpStatusCode.MovedPermanently, new RedirectResult(url, true));
                    }
                }
            }

            return null;
        }
    }


    public class SiteRouteRepository : ISiteRouteRepository
    {
        private readonly ObjectCache _cache;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private readonly ILogger _logger;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;

        public SiteRouteRepository(IDocumentListWebApiClient documentListWebApiClient, ISiteBuilderApiContext siteBuilderApiContext, ILogger logger, ObjectCache cache)
        {
            _siteBuilderApiContext = siteBuilderApiContext;
            _logger = logger;
            _cache = cache;
            _documentListWebApiClient = (documentListWebApiClient == null) ? null : documentListWebApiClient.CloneWithoutUserClaims();
        }

        async Task<List<SiteRouteEntry>> ISiteRouteRepository.FetchSiteRouteEntries()
        {
            ServiceClientResponse<Document> documentResopnse = await GetDocumentResponse();
            if (documentResopnse.HasException || !documentResopnse.ResponseMessage.IsSuccessStatusCode)
            {
                return new List<SiteRouteEntry>();
            }
            return FetchSiteRouteEntries(documentResopnse.ReadAsSync());
        }


        async Task<List<SiteRouteEntry>> ISiteRouteRepository.UpdateRedirectEntries(List<SiteRouteEntry> routes)
        {
            ServiceClientResponse<Document> res = await _documentListWebApiClient.GetTreeDocument("siteSettings@mozu", "siteRoutes").ConfigureAwait(false);
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                Document doc = res.ReadAsSync();
                doc.Set("data", JArray.FromObject(routes));
                res = await _documentListWebApiClient.UpdateDocument(doc.ListFQN, doc.Id, doc);
                return routes;
            }
            else
            {
                var doc = new Document
                          {
                              Name = "siteRoutes",
                              DocumentTypeFQN = "document@mozu",
                              ListFQN = "siteSettings@mozu",
                          };
                doc.Set("data", JArray.FromObject(routes));
                res = await _documentListWebApiClient.CreateDocument(doc.ListFQN, doc);
                return res.ReadAsSync().Get<JArray>("data").ToObject<List<SiteRouteEntry>>();
            }
        }


        async Task<HttpRouteCollection> ISiteRouteRepository.GetHttpRouteCollection()
        {
            ServiceClientResponse<Document> docResponse = await GetDocumentResponse();

            if (docResponse.HasException || !docResponse.ResponseMessage.IsSuccessStatusCode)
            {
                return null;
            }

            var doc = docResponse.ReadAsSync();

            string key = GetType().FullName +
                         ((_siteBuilderApiContext.DataViewMode == DataViewModeType.Pending) ? "1" : "0") +
                         _siteBuilderApiContext.SiteId +
                         doc.UpdateDate.GetValueOrDefault(DateTime.MinValue).ToString("s");

            var res = _cache[key] as HttpRouteCollection;
            if (res != null)
            {
                return res;
            }


            List<SiteRouteEntry> list = FetchSiteRouteEntries(doc);


            // pants..
            var col = new HttpRouteCollection();
            foreach (SiteRouteEntry item in list)
            {
                var dic = new HttpRouteValueDictionary();
                switch (item.PageType)
                {
                    case PageTypes.document:
                    {
                        dic.Add("controller", "cmspages");
                        dic.Add("action", "Page");
                        break;
                    }
                    case PageTypes.documentListView:
                    case PageTypes.documentList:
                    {
                        dic.Add("controller", "cmspages");
                        dic.Add("action", "contentIndex");
                        break;
                    }
                }
                if (!string.IsNullOrEmpty(item.ListName))
                {
                    dic.Add("list", item.ListName);
                }
                if (!string.IsNullOrEmpty(item.ListViewName))
                {
                    dic.Add("listView", item.ListViewName);
                }
                dic.Add("SiteRouteEntry", item);
                //col.MapRoute(item.Name, item.Template, dic);
                col.Add(item.Name, new HttpRoute(item.Template, dic));
            }
            _cache[key] = col;
            return col;
        }

        private Task<ServiceClientResponse<Document>> GetDocumentResponse()
        {
            Task<ServiceClientResponse<Document>> task = _documentListWebApiClient.GetTreeDocument("siteSettings@mozu", "siteRoutes");
            task.ConfigureAwait(false);
            return task;
        }

        private List<SiteRouteEntry> FetchSiteRouteEntries(Document doc)
        {
            
            
            if (doc == null)
            {
                return new List<SiteRouteEntry>();
            }
            var jobj = doc.Get<JArray>("data");
            if (jobj == null)
            {
                return new List<SiteRouteEntry>();
            }
            try
            {
                return jobj.ToObject<List<SiteRouteEntry>>();
            }
            catch (Exception ex)
            {
                _logger.Warn("unexpected deserializing errror in siteroute hadnler", ex);
                return new List<SiteRouteEntry>();
            }
        }
    }

    public interface IRedirectRepository
    {
        Task<Dictionary<string, RedirectEntry>> FetchRedirectEntries(int? siteId = null);
        Task<Dictionary<string, RedirectEntry>> UpdateRedirectEntries(Dictionary<string, RedirectEntry> redirects, int? siteId = null);
    }

    public class RedirectRepository : IRedirectRepository
    {
        private const string FileName = "redirects.1.1";
        private readonly MemoryCache _cache;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private readonly ILogger _logger;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private Task<Dictionary<string, RedirectEntry>> _redirectEntryListTask;

        public RedirectRepository(IDocumentListWebApiClient documentListWebApiClient, ISiteBuilderApiContext siteBuilderApiContext, ILogger logger)
        {
            _siteBuilderApiContext = siteBuilderApiContext;
            _documentListWebApiClient = documentListWebApiClient.CloneWithoutUserClaims();
            _cache = MemoryCache.Default;
            _logger = logger;
        }

        Task<Dictionary<string, RedirectEntry>> IRedirectRepository.FetchRedirectEntries(int? siteId)
        {
            if (_redirectEntryListTask == null)
            {
                
                IDocumentListWebApiClient client = siteId == null ? _documentListWebApiClient : _documentListWebApiClient.CloneWithApiContext(x =>
                {
                    if (!x.MasterCatalogId.HasValue)
                    {
                        x.MasterCatalogId = _siteBuilderApiContext.MasterCatalogId;
                    }
                    if (!x.CatalogId.HasValue)
                    {
                        x.CatalogId = _siteBuilderApiContext.CatalogId;
                    }
                    if (string.IsNullOrWhiteSpace(x.LocaleCode))
                    {
                        x.LocaleCode = _siteBuilderApiContext.LocaleCode;
                    }
                    x.SiteId = siteId;
                });
                return _redirectEntryListTask = client.GetTreeDocument("siteSettings@mozu", FileName).ContinueWith(gdt =>
                {
                    Dictionary<string, RedirectEntry> ret = null;
                    ServiceClientResponse<Document> gtRes = gdt.Result;
                    if (!gtRes.ResponseMessage.IsSuccessStatusCode)
                    {
                        return new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);
                        //provision?
                    }
                    Document doc = gdt.Result.ReadAsSync();
                    string key = CreateKey(doc);
                    ret = _cache[key] as Dictionary<string, RedirectEntry>;
                    if (ret == null)
                    {
                        lock (typeof (RedirectRepository))
                        {
                            ret = _cache[key] as Dictionary<string, RedirectEntry>;
                            if (ret == null)
                            {
                                ServiceClientResponse<StreamContent> res = client.GetDocumentContent("siteSettings@mozu", doc.Id).Result;
                                if (res.ResponseMessage.IsSuccessStatusCode && res.ResponseMessage.Content.Headers.ContentLength > 0)
                                {
                                    Stream stream = res.ResponseMessage.Content.ReadAsStreamAsync().Result;
                                    var tr = new StreamReader(stream);
                                    var jr = new JsonTextReader(tr);
                                    try
                                    {
                                        ret = JsonSerializer.CreateDefault().Deserialize<Dictionary<string, RedirectEntry>>(jr);
                                        ret = new Dictionary<string, RedirectEntry>(ret, StringComparer.OrdinalIgnoreCase);
                                        _cache[key] = ret;
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger.Error(ex);
                                        ret = new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);
                                    }
                                }
                                else
                                {
                                    ret = new Dictionary<string, RedirectEntry>();
                                }
                            }
                        }
                    }
                    return ret;
                });
            }
            ;
            return _redirectEntryListTask;
        }

        Task<Dictionary<string, RedirectEntry>> IRedirectRepository.UpdateRedirectEntries(Dictionary<string, RedirectEntry> redirects, int? siteId)
        {
            IDocumentListWebApiClient client = siteId.HasValue ? _documentListWebApiClient.CloneWithApiContext(x => x.SiteId = siteId) : _documentListWebApiClient;
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
            DateTime? dateStamp = doc.ContentUpdateDate ?? doc.UpdateDate ?? doc.InsertDate;
            string key = typeof (RedirectRepository).FullName + dateStamp + _siteBuilderApiContext.SiteId + (_siteBuilderApiContext.DataViewMode == DataViewModeType.Pending);
            return key;
        }
    }
}