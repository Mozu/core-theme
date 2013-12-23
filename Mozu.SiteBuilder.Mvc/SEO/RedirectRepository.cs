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
             var key = typeof(RedirectRepository).FullName + dateStamp + _siteBuilderApiContext.SiteId + (_siteBuilderApiContext.DataViewMode == DataViewModeType.Pending);
             return key;
         }

         private const string FileName = "redirects.1.1";
         Task<Dictionary<string, RedirectEntry>> IRedirectRepository.FetchRedirectEntries(int? siteId= null  )
        {
            if (_redirectEntryListTask == null)
            {
                var client = siteId == null ? _documentListWebApiClient : _documentListWebApiClient.CloneWithApiContext(x => x.SiteId = siteId);
                return _redirectEntryListTask = client.GetTreeDocument("settings", FileName).ContinueWith(gdt =>
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
                                    var res = client.GetDocumentContent("settings", doc.Id).Result;
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

        Task<Dictionary<string, RedirectEntry>> IRedirectRepository.UpdateRedirectEntries(Dictionary<string, RedirectEntry> redirects,int? siteId= null)
        {
            var client = siteId.HasValue ? _documentListWebApiClient.CloneWithApiContext(x => x.SiteId = siteId) : _documentListWebApiClient;
            return client.GetTreeDocument("settings", FileName).ContinueWith(gdt =>
                {
                    bool exists = false;
                    Dictionary<string, RedirectEntry> ret = null;
                    var gtRes = gdt.Result;
                    if (gtRes.ResponseMessage.IsSuccessStatusCode)
                    {
                        exists = true;
                    }
                    if (!exists)
                    {
                        gtRes = client.CreateDocument("settings", new Document() { Name = FileName, DocumentType = "document" }).Result;
                        
                    }
                  
                    var doc = gtRes.ReadAsSync();
                    var stream = new System.IO.MemoryStream();
                    var sw = new System.IO.StreamWriter(stream);
                    var jw = new Newtonsoft.Json.JsonTextWriter(sw);
                    Newtonsoft.Json.JsonSerializer.CreateDefault().Serialize(jw, redirects);
                    jw.Flush();
                    stream.Position = 0;
                    client.UpdateDocumentContent("settings", doc.Id, stream).Wait();
                    doc.Set("data", DateTime.UtcNow.ToString());
                    doc = client.UpdateDocument("settings", doc.Id, doc).Result.ReadAsSync();
                    var key = CreateKey(doc);
                    _cache[key] = redirects;

                    return redirects;
                });
        }

        
       

        
    }
}
