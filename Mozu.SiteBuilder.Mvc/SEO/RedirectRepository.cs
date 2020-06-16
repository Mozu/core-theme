using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Logging;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Logging;
using Mozu.SiteBuilder.Mvc.Context;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Navigation;
using Mozu.SiteSettings.General.Contracts.General.Routing;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace Mozu.SiteBuilder.Mvc.SEO
{
    public interface ICustomRouteCollectionRepository
    {
        RouteCollection GetRouteCollection();
    }

    public interface ICustomRouteHandler
    {
        IRouter RouteIncomingRequest(RouteContext routeContext);

       // Task<bool> Init();

        RouteData GetRouteData();

        /// <summary>
        /// if a canonical url exists for the internalroute that is specified, this method creates a redirect to that relative url, with potentially new viewdata that can be injected.
        /// </summary>
        /// <param name="request"></param>
        /// <param name="internalRoute"></param>
        /// <param name="viewDataAdditionFunc"></param>
        /// <returns></returns>
        IActionResult RedirectWithContext(HttpRequest request, FancyRoute internalRoute, Func<IDictionary<string,object>> viewDataAdditionFunc = null);

        /// <summary>
        /// Given a particular type of route that we want to canonicalize, we find all routes of that they where canonical is true, 
        /// order by appearance, and attempt to bind each route to the route data for this request.
        /// The first canonical route that binds the route data wins and the path data from that route is appended to the base parts of the original url.
        /// This results in an ABSOLUTE url to the resource.
        /// </summary>
        /// <param name="internalRoute"></param>
        /// <param name="viewDataAdditionFunc"></param>
        /// <param name="useExistingQuery"></param>
        /// <returns></returns>
        string GetCanonicalUrl( FancyRoute internalRoute, Func<IDictionary<string, object>> viewDataAdditionFunc, bool useExistingValues , string hostName = null);
        Task RouteAsync(RouteContext context);
    }
   
    public interface IRedirectRepository
    {
        Task<List<RedirectEntry>> FetchRedirectEntries(int? siteId = null);
        RuntimeRedirects GetRuntimeRedirectEntries(int? siteId = null);
        Task<List<RedirectEntry>> UpdateRedirectEntries(List<RedirectEntry> redirects, int? siteId = null);
    }

    public class RuntimeRedirects
    {
        public RuntimeRedirects()
        {
            Simple = new Dictionary<string, RedirectEntry>(StringComparer.OrdinalIgnoreCase);
            QueryString = new Dictionary<string, List<RuntimeRedirectEntry>>(StringComparer.OrdinalIgnoreCase);
        }
        
        public Dictionary<string, RedirectEntry> Simple { get; set; }
        public Dictionary<string, List<RuntimeRedirectEntry>> QueryString { get; set; }
   
        public List<Tuple<int, Dictionary<string, List<RuntimeRedirectEntry>>>> WildCards { get; set; }
    }

    public class RuntimeRedirectEntry
    {
        public System.Collections.Specialized.NameValueCollection Query { get; set; }
        public RedirectEntry Redirect{ get; set; }

        public string[] AdditionalWildcardSegments { get; set; }
    }

    public class RedirectRepository : IRedirectRepository
    {
        const string FileName = "redirects.1.1";
        
        readonly IDocumentListWebApiClient _systemDocumentClient;
        readonly ILogger _logger;
        readonly ISiteBuilderApiContext _siteBuilderApiContext;
        //Task<RuntimeRedirects> _redirectEntryListTask;
        readonly IDocumentListWebApiClient _userDocumentClient;
        ISiteBuilderContextProvider _sbCp;
        public RedirectRepository(ISiteBuilderContextProvider sbCp, IDocumentListWebApiClient documentListWebApiClient, ISiteBuilderApiContext siteBuilderApiContext, ILogger<RedirectRepository> logger)
        {
            _sbCp = sbCp;
            _siteBuilderApiContext = siteBuilderApiContext;
            _systemDocumentClient = documentListWebApiClient.CloneWithoutUserClaims();
            _userDocumentClient = documentListWebApiClient;
            _logger = logger;
        }

        static System.Collections.Concurrent.ConcurrentDictionary<string, AsyncLock> _redirectLookupLock = new System.Collections.Concurrent.ConcurrentDictionary<string, AsyncLock>();

        Task<List<RedirectEntry>> IRedirectRepository.FetchRedirectEntries(int? siteId)
        {
            var client = siteId == null ? _systemDocumentClient : _systemDocumentClient.CloneWithSbContext(_siteBuilderApiContext).CloneWithSiteId(siteId);
            return DoFetchEntries(client);

        }

        RuntimeRedirects IRedirectRepository.GetRuntimeRedirectEntries(int? siteId)
        {
            var data =  _sbCp.GetContextData();// ?? _sbCp.GetContextDataAsync().Result;
            return data.RuntimeRedirects ??= BuildRuntimeRedirects(data.Redirects);
        }

        Task<List<RedirectEntry>> DoFetchEntries( IDocumentListWebApiClient client)
        {

            return client
                //.CloneWithConfigOptions(x => x.TimeoutMilliseconds = 8000)

                            .GetTreeDocumentContent("siteSettings@mozu", FileName)
                            .ContinueWith(x =>
                            {
                                if (x.IsFaulted || !x.IsCompleted)
                                {
                                    return new List<RedirectEntry>();
                                }
                                var resp = x.Result;
                                if (!resp.ResponseMessage.IsSuccessStatusCode)
                                {
                                    return new List<RedirectEntry>();
                                }


                                using (var stream = resp.ResponseMessage.Content.ReadAsStreamAsync().Result)
                                using (var tr = new StreamReader(stream))
                                using (var jr = new JsonTextReader(tr))
                                {
                                    try
                                    {
                                        var ser = JsonSerializer.CreateDefault();
                                        if (jr.Read())
                                        {
                                            if (jr.TokenType == JsonToken.StartArray)
                                            {
                                                var entries = ser.Deserialize<List<RedirectEntry>>(jr);
                                                return entries.Select(e => { e.IsEnabled = e.IsEnabled.GetValueOrDefault(true); return e; }).ToList();
                                            }
                                            else if (jr.TokenType == JsonToken.StartObject)
                                            {
                                                var list = new List<RedirectEntry>();
                                                while (jr.Read())
                                                {
                                                    if (jr.TokenType == JsonToken.PropertyName)
                                                    {
                                                        var source = (string)jr.Value;
                                                        jr.Read();
                                                        var redirect = ser.Deserialize<RedirectEntry>(jr);
                                                        redirect.Source = source;
                                                        redirect.IsEnabled = redirect.IsEnabled.GetValueOrDefault(true);
                                                        list.Add(redirect);
                                                    }
                                                }
                                                return list;
                                            }
                                            else
                                            {
                                                throw new InvalidOperationException("bad format");
                                            }
                                        }
                                    }
                                    catch (Exception ex)
                                    {
                                        _logger.Error(ex);
                                    }
                                    return new List<RedirectEntry>();
                                }

                            });
        }
   
        public static RuntimeRedirects BuildRuntimeRedirects (List<RedirectEntry> redirects)
        {

            RuntimeRedirects rr = new RuntimeRedirects()
            {
                QueryString = new Dictionary<string,List<RuntimeRedirectEntry>>(StringComparer.OrdinalIgnoreCase),
                Simple = new Dictionary<string,RedirectEntry>(StringComparer.OrdinalIgnoreCase),
                
            };

            if ( redirects == null)
            {
                return rr;
            }

            var wildCards = new Dictionary<int, Dictionary<string, List<RuntimeRedirectEntry>>>();
            foreach (var redirect in redirects.Where(x => x.IsEnabled.GetValueOrDefault(false)))
            {
                var source = redirect.Source;
                var stem = source;
                var qPos = source.IndexOf('?');
                var starPos = source.IndexOf('*');
                if (qPos == -1 && starPos==-1)
                {
                    rr.Simple[source] = redirect;
                    continue;
                }
               
                
                RuntimeRedirectEntry runtimeRedirect = new RuntimeRedirectEntry()
                {
                    Redirect = redirect
                };
                if (qPos > -1)
                {
                    stem = source.Substring(0, qPos);
                    runtimeRedirect.Query = System.Web.HttpUtility.ParseQueryString(source.Substring(qPos + 1));
                }

                starPos = stem.IndexOf('*');
                if (starPos > -1)
                {
                    var segments = stem.TrimEnd('*').Split(new char[] { '*' }, StringSplitOptions.None);
                    if (segments.Length == 0)
                    {
                        continue;
                    }

                    Dictionary<string, List<RuntimeRedirectEntry>> indexedLookup;
                    if (!wildCards.TryGetValue(starPos, out indexedLookup))
                    {
                        indexedLookup = new Dictionary<string, List<RuntimeRedirectEntry>>(StringComparer.OrdinalIgnoreCase);
                        wildCards[starPos] = indexedLookup;
                    }
                    List<RuntimeRedirectEntry> indexedMatches;
                    if (!indexedLookup.TryGetValue(segments[0], out indexedMatches))
                    {
                        indexedMatches = new List<RuntimeRedirectEntry>();
                        indexedLookup[segments[0]] = indexedMatches;
                    }
                   

                    if (segments.Length > 1)
                    {
                        runtimeRedirect.AdditionalWildcardSegments = segments.Skip(1).ToArray();
                    }
                    


                    indexedMatches.Add(runtimeRedirect);
               
                    continue;
                }

                if (qPos > -1)
                {
                    List<RuntimeRedirectEntry> qsEntries;


                    stem = source.Substring(0, qPos);

                    if (!rr.QueryString.TryGetValue(stem, out qsEntries))
                    {
                        qsEntries = new List<RuntimeRedirectEntry>();
                        rr.QueryString[stem] = qsEntries;
                    }

                    qsEntries.Add(runtimeRedirect);
                }
                
            }

            rr.WildCards = wildCards.Select(x => new Tuple<int, Dictionary<string, List<RuntimeRedirectEntry>>>(x.Key, x.Value)).OrderByDescending(x => x.Item1).ToList();



            List<RuntimeRedirectEntry> qaEntries;
            List<string> removals = null;
            foreach( var simpleEntries in rr.Simple)
            {
                if (rr.QueryString.TryGetValue(simpleEntries.Key, out qaEntries))
                {
                    qaEntries.Add(new RuntimeRedirectEntry()
                    {
                        Query = new System.Collections.Specialized.NameValueCollection(),
                        Redirect = simpleEntries.Value
                    });
                    if (removals == null)
                    {
                        removals = new List<string>();
                    }

                    removals.Add(simpleEntries.Key);
                }
            }
            if (removals != null)
            {
                removals.ForEach(x=>rr.Simple.Remove(x));
            }

            
            return rr;
        }

        

        Task<List<RedirectEntry>> IRedirectRepository.UpdateRedirectEntries(List<RedirectEntry> redirects, int? siteId)
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

                redirects.Sort(RedirectComparer.Default);

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