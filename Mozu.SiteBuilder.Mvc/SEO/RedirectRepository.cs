using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Text;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.Core.Api.Client;
using  Mozu.Core.Logging;

namespace Mozu.SiteBuilder.Mvc.SEO
{
     public interface  IRedirectRepository
     {
         Task<List<RedirectEntry>> FetchRedirectEntries();
         Task<List<RedirectEntry>> UpdateRedirectEntries(List<RedirectEntry> redirects);
     }
     public class RedirectRepository : IRedirectRepository
    {
        private readonly ISiteBuilderApiContext _siteBuilderApiContext;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private Task<List<RedirectEntry>> _redirectEntryListTask;
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
             var key = typeof(RedirectRepository).FullName + dateStamp + _siteBuilderApiContext.SiteId + (_siteBuilderApiContext.DataViewMode == DataViewModeType.Pending);
             return key;
         }
        Task<List<RedirectEntry>> IRedirectRepository.FetchRedirectEntries()
        {
            if (_redirectEntryListTask == null)
            {
                return _redirectEntryListTask=_documentListWebApiClient.GetTreeDocument( "settings", "redirects").ContinueWith(gdt =>
                    {
                        List<RedirectEntry>ret = null;
                        var gtRes = gdt.Result;
                        if (!gtRes.ResponseMessage.IsSuccessStatusCode)
                        {
                            return new List<RedirectEntry>();
                            //provision?
                        }
                        var doc = gdt.Result.ReadAsSync();
                        var key = CreateKey(doc);
                         ret = _cache[key] as List<RedirectEntry>;
                        if (ret == null)
                        {
                            lock (typeof (RedirectRepository))
                            {
                                ret = _cache[key] as List<RedirectEntry>;
                                if (ret == null)
                                {
                                    var res = _documentListWebApiClient.GetDocumentContent("settings", doc.Id ).Result;
                                    if (res.ResponseMessage.IsSuccessStatusCode && res.ResponseMessage.Content.Headers.ContentLength > 0)
                                    {


                                        var stream = res.ResponseMessage.Content.ReadAsStreamAsync().Result;
                                        var tr = new System.IO.StreamReader(stream);
                                        var jr = new Newtonsoft.Json.JsonTextReader(tr);
                                        try
                                        {
                                            ret = Newtonsoft.Json.JsonSerializer.CreateDefault().Deserialize<List<RedirectEntry>>(jr);
                                            _cache[key] = ret;
                                        }
                                        catch (Exception ex)
                                        {
                                            _logger.Error(ex);
                                            ret = new List<RedirectEntry>();
                                        }
                                        
                                    }
                                    else
                                    {
                                        ret= new List<RedirectEntry>();
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

        Task<List<RedirectEntry>> IRedirectRepository.UpdateRedirectEntries(List<RedirectEntry> redirects)
        {

            return _documentListWebApiClient.GetTreeDocument("settings", "redirects").ContinueWith(gdt =>
                {
                    bool exists = false;
                    List<RedirectEntry> ret = null;
                    var gtRes = gdt.Result;
                    if (gtRes.ResponseMessage.IsSuccessStatusCode)
                    {
                        exists = true;
                    }
                    if (!exists)
                    {
                        gtRes = _documentListWebApiClient.CreateDocument("settings", new Document() {Name = "redirects", DocumentType = "document"}).Result;
                        //   = _documentListWebApiClient.GetDocument("settings", "redirects").Result;
                    }
                  
                    var doc = gtRes.ReadAsSync();
                    var stream = new System.IO.MemoryStream();
                    var sw = new System.IO.StreamWriter(stream);
                    var jw = new Newtonsoft.Json.JsonTextWriter(sw);
                    Newtonsoft.Json.JsonSerializer.CreateDefault().Serialize(jw, redirects);
                    jw.Flush();
                    stream.Position = 0;
                    _documentListWebApiClient.UpdateDocumentContent("settings", doc.Id, stream).Wait();
                    doc.Set("data", DateTime.UtcNow.ToString());
                    doc = _documentListWebApiClient.UpdateDocument("settings", doc.Id, doc).Result.ReadAsSync();
                    var key = CreateKey(doc);
                    _cache[key] = redirects;

                    return redirects;
                });
        }

        
       

        
    }
}
