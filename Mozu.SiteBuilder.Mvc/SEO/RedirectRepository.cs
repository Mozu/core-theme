using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Runtime.Caching;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http.Routing;
using System.Web.Mvc;
using System.Web.Routing;
using System.Web.UI;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.Core.Api.Client;
using  Mozu.Core.Logging;
using Newtonsoft.Json.Linq;
using System.Web.Http;
using System.Net;
using System.Web.Http.Hosting;

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
        Task<bool>  RouteIncomingRequest( );
        HttpResponseMessage ProcessSeoRedirect();

        string GetCanonicalUrl(Document d);

    }

    public class SiteRouteHandler : ISiteRouteHandler
    {
        public static string ContextKey = "SiteRouteEntry";
        private readonly ISiteRouteRepository _siteRouteRepository;
        private readonly HttpRequestMessage _requestMessage;
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private object _httpRouteCollection;

        public SiteRouteHandler(ISiteRouteRepository siteRouteRepository, HttpRequestMessage requestMessage, ISiteBuilderApiContext  siteBuilderApiContext)
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

        private async Task<HttpRouteCollection> GetRouteCollectionTask()
        {

            if (_httpRouteCollection == null)
            {
                _httpRouteCollection = (await _siteRouteRepository.GetHttpRouteCollection().ConfigureAwait(false)) ?? new object();
            }
            return _httpRouteCollection as HttpRouteCollection;
        }

        
        public string GetCanonicalUrl(Document d)
        {
            var rrCol = RouteCollection;
            if (rrCol != null)
            {
                HttpRouteValueDictionary vals = null;
                IHttpVirtualPathData vpathData = null;
                foreach (var route in rrCol)
                {

                    var entry = ((SiteRouteEntry) route.Defaults[SiteRouteHandler.ContextKey]);
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
                            var url = vpathData.VirtualPath;
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
        public async Task<bool>  RouteIncomingRequest( )
        {
            var routeCollection = await this.GetRouteCollectionTask();
            if (routeCollection == null)
            {
                return false;
            }

            var reRouteData = routeCollection.GetRouteData(_requestMessage);
            SiteRouteEntry siteRouteEntry = null;
            if (reRouteData != null)
            {
                siteRouteEntry = (SiteRouteEntry) reRouteData.Values[SiteRouteHandler.ContextKey ];

                _requestMessage.Properties[HttpPropertyKeys.HttpRouteDataKey] = reRouteData;

                _requestMessage.Properties[SiteRouteHandler.ContextKey] = siteRouteEntry;
                var rctx = _requestMessage.GetRequestContext();
                rctx.RouteData = reRouteData;
                return true;
            }
            return false;

        }


        public HttpResponseMessage ProcessSeoRedirect()
        {
            var key = SiteRouteHandler.ContextKey;
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
            string controller = ((string)vals["controller"] ?? "").ToLowerInvariant();
            string action = ((string)vals["action"] ?? "").ToLowerInvariant();

            
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

        private HttpResponseMessage ProcessCmsIndexRedirect(HttpRequestMessage request, HttpRouteValueDictionary vals)
        {

            var rrCol = this.RouteCollection;
            if (rrCol == null)
            {
                return null;
            }


            string list = (string)vals["list"];
            IHttpVirtualPathData vpathData = null;
            foreach (var route in rrCol)
            {

                var entry = ((SiteRouteEntry)route.Defaults[SiteRouteHandler.ContextKey ]);
                if (entry.IsCanonical.GetValueOrDefault(false) && entry.PageType == PageTypes.documentList &&
                    (string.IsNullOrEmpty(entry.ListName) || string.Equals(entry.ListName, list,StringComparison.OrdinalIgnoreCase)))
                {
                    vpathData = route.GetVirtualPath(request, vals);
                    if (vpathData != null)
                    {
                        var url = vpathData.VirtualPath;
                        if (url.Length > 0 && url[0] != '/')
                        {
                            url = "/" + url;
                        }

                        url = url.Split('?')[0];
                        return request.CreateResponse(HttpStatusCode.MovedPermanently, new Mozu.SiteBuilder.Mvc.ActionResults.RedirectResult(url, true));
                    }
                }

            }
            return null;

        }

        private HttpResponseMessage ProcessCmsPageRedirect(HttpRequestMessage request, HttpRouteValueDictionary vals)
        {
            var rrCol = this.RouteCollection;
            if (rrCol == null)
            {
                return null;
            }


            string list = (string) vals["list"];
            IHttpVirtualPathData vpathData = null;
            foreach (var route in rrCol)
            {

                var entry = ((SiteRouteEntry)route.Defaults[SiteRouteHandler.ContextKey]);
                if (entry.IsCanonical.GetValueOrDefault(false) && entry.PageType == PageTypes.document &&
                    (string.IsNullOrEmpty(entry.ListName) || string.Equals(entry.ListName, list,StringComparison.OrdinalIgnoreCase)))
                {
                    vpathData = route.GetVirtualPath(request, vals);
                    if (vpathData != null)
                    {
                        var url = vpathData.VirtualPath;
                        if (url.Length > 0 && url[0] != '/')
                        {
                            url = "/" + url;
                        }

                        url = url.Split('?')[0];
                        return request.CreateResponse(HttpStatusCode.MovedPermanently, new Mozu.SiteBuilder.Mvc.ActionResults.RedirectResult(url, true));
                    }
                }

            }

            return null;
        }
     
    }


    public class SiteRouteRepository : ISiteRouteRepository
    {
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly ILogger _logger;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;

        public SiteRouteRepository(IDocumentListWebApiClient documentListWebApiClient, ISiteBuilderApiContext siteBuilderApiContext , ILogger logger )
        {
            _siteBuilderApiContext = siteBuilderApiContext;
            _logger = logger;
            _documentListWebApiClient = (documentListWebApiClient == null )?null : documentListWebApiClient.CloneWithoutUserClaims();
        }

        async Task<List<SiteRouteEntry>> ISiteRouteRepository.FetchSiteRouteEntries()
        {
            //await Task.Run(() =>
            //{
            //    var x = 10;
            //    if (x == 11)
            //    {
            //        throw new Exception();
            //    }
            //} );
            //return new List<SiteRouteEntry>()
            //       {
                      
            //            new SiteRouteEntry()
            //           {
            //               PageType = PageTypes.Document,
            //               Name = "2",
            //               Index = 2,
            //               Template = "bios/{name}",
            //               IsCanonical = true,
            //               ListName = "bios@mozu"
            //           },
            //           new SiteRouteEntry()
            //           {
            //               PageType = PageTypes.DocumentList,
            //               Name = "1",
            //               Index = 1,
            //               Template = "bios",
            //               IsCanonical = true,
            //               ListName = "bios@mozu"
            //           },
            //           new SiteRouteEntry()
            //           {
            //               PageType = PageTypes.Document,
            //               Name = "0",
            //               Index = 0,
            //               Template = "underpants/xxx/{name}",
            //               IsCanonical = true,
            //               ListName = "pages@mozu"
            //           },

            //       };


            var res = await _documentListWebApiClient.GetTreeDocument("siteSettings@mozu", "siteRoutes").ConfigureAwait(false);
            if (res.HasException || !res.ResponseMessage.IsSuccessStatusCode)
            {
                return new List<SiteRouteEntry>();
            }
            var doc = res.ReadAsSync();
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
                _logger.Warn( "unexpected deserializing errror in siteroute hadnler", ex);
                return new List<SiteRouteEntry>();
            }

        }

        async Task<List<SiteRouteEntry>> ISiteRouteRepository.UpdateRedirectEntries(List<SiteRouteEntry> routes)
        {

            var res = await _documentListWebApiClient.GetTreeDocument("siteSettings@mozu", "siteRoutes").ConfigureAwait(false);
            if (res.ResponseMessage.IsSuccessStatusCode)
            {
                var doc = res.ReadAsSync();
                doc.Set("data", JArray.FromObject(routes));
                res = await _documentListWebApiClient.UpdateDocument(doc.ListFQN, doc.Id, doc);
                return routes;
            }
            else
            {
                var doc = new Document()
                          {
                              Name = "siteRoutes",
                              DocumentTypeFQN ="document@mozu",
                              ListFQN = "siteSettings@mozu",

                          };
                doc.Set("data", JArray.FromObject(routes));
                res = await _documentListWebApiClient.CreateDocument(doc.ListFQN, doc);
                return res.ReadAsSync().Get<JArray>("data").ToObject<List<SiteRouteEntry>>();

                
            }
        }


    


        async Task<HttpRouteCollection> ISiteRouteRepository.GetHttpRouteCollection()
        {
            var list = await((ISiteRouteRepository)this).FetchSiteRouteEntries().ConfigureAwait(false);
            HttpRouteCollection col = new HttpRouteCollection();
            foreach (var item in list)
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
            return col;
        }
    }

    public interface  IRedirectRepository
     {
         Task<Dictionary<string, RedirectEntry>> FetchRedirectEntries(int? siteId= null );
         Task<Dictionary<string, RedirectEntry>> UpdateRedirectEntries(Dictionary<string, RedirectEntry> redirects, int? siteId = null);
     }
     public class RedirectRepository : IRedirectRepository
    {
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private Task<Dictionary<string, RedirectEntry>> _redirectEntryListTask;
        private MemoryCache _cache;
        ILogger _logger;
        public RedirectRepository(Mozu.Content.Contracts.Clients.IDocumentListWebApiClient documentListWebApiClient, ISiteBuilderApiContext siteBuilderApiContext, ILogger logger)
        {
            _siteBuilderApiContext = siteBuilderApiContext;
            _documentListWebApiClient = documentListWebApiClient.CloneWithoutUserClaims();
            _cache = System.Runtime.Caching.MemoryCache.Default;
            _logger = logger;
       
        }

         string CreateKey(Mozu.Content.Contracts.Document doc)
         {
             var dateStamp = doc.ContentUpdateDate ?? doc.UpdateDate ?? doc.InsertDate;
             var key = typeof (RedirectRepository).FullName + dateStamp + _siteBuilderApiContext.SiteId + (_siteBuilderApiContext.DataViewMode == DataViewModeType.Pending);
             return key;
         }

         private const string FileName = "redirects.1.1";
         Task<Dictionary<string, RedirectEntry>> IRedirectRepository.FetchRedirectEntries(int? siteId  )
        {
            if (_redirectEntryListTask == null)
            {
                var client = siteId == null ? _documentListWebApiClient : _documentListWebApiClient.CloneWithApiContext(x => x.SiteId = siteId);
                return _redirectEntryListTask = client.GetTreeDocument("siteSettings@mozu", FileName).ContinueWith(gdt =>
                    {
                        Dictionary<string, RedirectEntry> ret = null;
                        var gtRes = gdt.Result;
                        if (!gtRes.ResponseMessage.IsSuccessStatusCode)
                        {
                            return new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);
                            //provision?
                        }
                        var doc = gdt.Result.ReadAsSync();
                        var key = CreateKey(doc);
                         ret = _cache[key] as Dictionary<string, RedirectEntry>;
                        if (ret == null)
                        {
                            lock (typeof (RedirectRepository))
                            {
                                ret = _cache[key] as Dictionary<string, RedirectEntry>;
                                if (ret == null)
                                {
                                    var res = client.GetDocumentContent("siteSettings@mozu", doc.Id).Result;
                                    if (res.ResponseMessage.IsSuccessStatusCode && res.ResponseMessage.Content.Headers.ContentLength > 0)
                                    {


                                        var stream = res.ResponseMessage.Content.ReadAsStreamAsync().Result;
                                        var tr = new System.IO.StreamReader(stream);
                                        var jr = new Newtonsoft.Json.JsonTextReader(tr);
                                        try
                                        {
                                            ret = Newtonsoft.Json.JsonSerializer.CreateDefault().Deserialize< Dictionary<string, RedirectEntry>>(jr);
                                            ret = new Dictionary<string, RedirectEntry>(ret, StringComparer.OrdinalIgnoreCase );
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
                                        ret= new Dictionary<string, RedirectEntry>();
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

        Task<Dictionary<string, RedirectEntry>> IRedirectRepository.UpdateRedirectEntries(Dictionary<string, RedirectEntry> redirects,int? siteId)
        {
            var client = siteId.HasValue ? _documentListWebApiClient.CloneWithApiContext(x => x.SiteId = siteId) : _documentListWebApiClient;
            return client.GetTreeDocument("siteSettings@mozu", FileName).ContinueWith(gdt =>
                {
                    bool exists = false;
                   
                    var gtRes = gdt.Result;
                    if (gtRes.ResponseMessage.IsSuccessStatusCode)
                    {
                        exists = true;
                    }
                    if (!exists)
                    {
                        gtRes = client.CreateDocument("siteSettings@mozu", new Document() { Name = FileName, DocumentTypeFQN = "document@mozu" , Properties=new JObject()}).Result;
                        
                    }
                  
                    var doc = gtRes.ReadAsSync();
                    var stream = new System.IO.MemoryStream();
                    var sw = new System.IO.StreamWriter(stream);
                    var jw = new Newtonsoft.Json.JsonTextWriter(sw);
                    Newtonsoft.Json.JsonSerializer.CreateDefault().Serialize(jw, redirects);
                    jw.Flush();
                    stream.Position = 0;
                    client.UpdateDocumentContent("siteSettings@mozu", doc.Id, stream).Wait();
                    doc.Set("data", DateTime.UtcNow.ToString());
                    doc = client.UpdateDocument("siteSettings@mozu", doc.Id, doc).Result.ReadAsSync();
                    var key = CreateKey(doc);
                    _cache[key] = redirects;

                    return redirects;
                });
        }

        
       

        
    }
}
