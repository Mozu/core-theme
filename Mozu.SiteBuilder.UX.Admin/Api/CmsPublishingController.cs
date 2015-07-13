using System;
using System.Collections.Generic;
using System.Linq;
using Mozu.Tenant.Contracts.Clients;
using Newtonsoft.Json;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Admin;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json.Linq;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// DTO class to allow PublishAll and DiscardAll to receive arguments.
    /// </summary>
    
    public class PublishArgs
    {
        public string ListFQN { get; set; }

       
    }





    /// <summary>
    /// Controller for CMS smiegels.
	/// </summary>
    [WebApi("app/cmspublishing", SuppressDescriptorGeneration = true)]
    public class CmsPublishingController : BaseController
    {
       
        private IDocumentListWebApiClient _documentClient;
        private readonly IDocumentPublishingWebApiClient _documentPublishingWebApiClient;
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private readonly ITenantsWebApiClient _tenantsWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        //public CmsPublishingController(IMoreAwesomeDocumentWebApiClient documentClient)
       public CmsPublishingController(IDocumentListWebApiClient documentClient, IDocumentPublishingWebApiClient documentPublishingWebApiClient , IDocumentListWebApiClient documentListWebApiClient, Mozu.Tenant.Contracts.Clients.ITenantsWebApiClient tenantsWebApiClient)
        {
            _documentClient = documentClient;
            _documentPublishingWebApiClient = documentPublishingWebApiClient;
            _documentListWebApiClient = documentListWebApiClient;
            _tenantsWebApiClient = tenantsWebApiClient;
        }

        /// <summary>
        /// Get paged list of all pending drafts.
        /// </summary>
        [HttpGetRoute(UriTemplate = "listdrafts")]
        public async Task<Response<List<DocumentDraft>>> ListDirtyDocuments([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                // this operation is not supported.
                return FailureList2<DocumentDraft>("Getting a single document by this method is not supported.");
            }

            // TODO: filter and sort
            // string filter = null;
            // string sort = null;

            int? pageSize = pagingParams.pageSize;
            int? startIndex = pagingParams.startIndex;

            var res = (await _documentPublishingWebApiClient.ListDocumentDraftSummaries(pageSize: 200)).ReadAsSync();
            
            List<DocumentDraft> items = Mapper.Map<List<DocumentDraft>>(res.Items);

            return List2(items, (int)res.TotalCount);
        }

        public class GetListForSettingsPageResultItem
        {
            public string ScopeType { get; set; }
            public int? mcid { get; set; }
            public int? catid { get; set; }
            public int? siteid { get; set; }

            public int LevelId { get; set; }

            public string id
            {
                get { return mcid + "-" + catid + "-" + siteid; }
            }
            [JsonProperty(NullValueHandling = NullValueHandling.Include, DefaultValueHandling = DefaultValueHandling.Include)]
            public bool? IsPubEnabled { get; set; }
        }

        /// Publish a set of documents.
        /// </summary>
        [HttpGetRoute(UriTemplate = "settingsList")]
        public async Task<Response<List<GetListForSettingsPageResultItem>>> GetListForSettingsPage (EnablePublishingRequest request)
        {
            var tenant = (await _tenantsWebApiClient.CloneWithoutUserClaims().GetTenantInternal(this.SbApiContext.TenantId, false)).ReadAsSync();

            var stuff = tenant.MasterCatalogs.Select(x =>
            {
                var client = _documentListWebApiClient.CloneWithApiContext(z =>
                {
                    z.MasterCatalogId = x.Id ;
                    z.CatalogId = null;
                    z.SiteId = null;
                });
                return new Tuple<GetListForSettingsPageResultItem, Task<ServiceClientResponse<DocumentListCollection>>>(
                    new GetListForSettingsPageResultItem()
                    {
                        ScopeType = "m",
                        mcid = x.Id ,
                        LevelId = x.Id
                    },
                    client.GetDocumentLists());

            }).Concat(

                tenant.MasterCatalogs.SelectMany(x => x.Catalogs).Select(x =>
                {
                    var client = _documentListWebApiClient.CloneWithApiContext(z =>
                    {
                        z.MasterCatalogId = x.MasterCatalogId;
                        z.CatalogId = x.Id;
                        z.SiteId = null;
                    });
                    return new Tuple<GetListForSettingsPageResultItem, Task<ServiceClientResponse<DocumentListCollection>>>(
                        new GetListForSettingsPageResultItem()
                        {
                            ScopeType = "c",
                            mcid = x.MasterCatalogId,
                            catid = x.Id ,
                            LevelId = x.Id
                        },
                        client.GetDocumentLists());



                })).Concat(
                    tenant.Sites.Select(x =>
                    {
                        var client = _documentListWebApiClient.CloneWithApiContext(z =>
                        {
                            z.MasterCatalogId = x.MasterCatalogId;
                            z.CatalogId = x.CatalogId;
                            z.SiteId = x.Id;
                        });
                          return new Tuple<GetListForSettingsPageResultItem, Task<ServiceClientResponse<DocumentListCollection>>>(
                              new GetListForSettingsPageResultItem()
                               {
                                   ScopeType = "s",
                                   mcid = x.MasterCatalogId,
                                   catid = x.CatalogId,
                                   siteid = x.Id,
                                   LevelId = x.Id
                     
                                },
                        client.GetDocumentLists());

                    })).ToList();







            var pubTasks = stuff.Select(x => x.Item2).ToList();

            await Task.WhenAll(pubTasks);

            stuff.ForEach(x =>
            {
                if (x.Item2.Result.HasException || !x.Item2.Result.ResponseMessage.IsSuccessStatusCode)
                {
                    return;
                }
                var res = x.Item2.Result.ReadAsSync();
                var lists = res.Items.Where(l =>
                    (x.Item1.ScopeType == "m" && string.Equals(l.ScopeType, "mastercatalog", StringComparison.OrdinalIgnoreCase))
                    ||
                    (x.Item1.ScopeType == "c" && string.Equals(l.ScopeType, "catalog", StringComparison.OrdinalIgnoreCase))
                    ||
                    (x.Item1.ScopeType == "s" && string.Equals(l.ScopeType, "site", StringComparison.OrdinalIgnoreCase))
                    ).Where(l=> l.SupportsPublishing .GetValueOrDefault(false )).ToList();

                x.Item1.IsPubEnabled = lists.Count == 0 ? (bool?) null : lists.Any(l => l.EnablePublishing.GetValueOrDefault(false));



            });


            return List2(stuff.Select(x=>x.Item1).ToList());
        }

        public class EnablePublishingRequest
        {
            public Mozu.Core.ApiContext Context { get; set; }
            public bool PublishingEnabled { get; set; }
        }
        /// <summary>
        /// Publish a set of documents.
        /// </summary>
        [HttpPostRoute(UriTemplate = "enablePublishing")]
        public async Task<Response<bool>> EnablePublishing(EnablePublishingRequest request)
        {

            var client = _documentClient.CloneWithApiContext(x =>
            {
                x.SiteId = request.Context.SiteId;
                x.MasterCatalogId = request.Context.MasterCatalogId;
                x.CatalogId = request.Context.CatalogId;
            });
            var res = (await client.GetDocumentLists(startIndex: 0, pageSize: 200)).ReadAsSync();
            var updateTasks= res.Items.Select(x =>
            {
                if (request.Context.SiteId.HasValue)
                {
                    if (!string.Equals(x.ScopeType, "site", StringComparison.OrdinalIgnoreCase))
                    {
                        return null;
                    }
                }
                else if (request.Context.CatalogId.HasValue)
                {
                    if (!string.Equals(x.ScopeType, "catalog", StringComparison.OrdinalIgnoreCase))
                    {
                        return null;
                    }
                }
                else if (request.Context.MasterCatalogId.HasValue)
                {
                    if (!string.Equals(x.ScopeType, "mastercatalog", StringComparison.OrdinalIgnoreCase))

                    {
                        return null;
                    }
                }
                if (!x.SupportsPublishing.GetValueOrDefault(false))
                {
                    return null;
                }
                x.EnablePublishing = request.PublishingEnabled;
                return client.UpdateDocumentList(x.ListFQN, x);
            }).Where(x=> x!= null).ToArray();
            await Task.WhenAll(updateTasks);
            AnyExceptionsThenThrow(updateTasks);
            return SuccessWithTotal2<bool>(0);
        }

        /// <summary>
        /// Publish a set of documents.
        /// </summary>
        [HttpPostRoute(UriTemplate = "publish")]
        public async Task<Response<List<string>>> Publish(List<DocumentDraft> docs)
        {
            List<string> returnedIds = new List<string>();

            List<DocumentDraft> draftsReadyForPublishing = docs.Where(dr => dr.IsPublished).ToList();

            if (draftsReadyForPublishing.Count == 0)
            {
                return FailureList2<string>("No DocumentDrafts provided were marked for publish. Be sure to set IsPublished=true.");
            }


            var docsToDel = draftsReadyForPublishing.Select(x => x.Id).ToList();
            var result = await _documentPublishingWebApiClient.PublishDocuments(documentIds: docsToDel);

            if (result.HasException)
            {
                throw result.ReadException();
            }
           // IEnumerable<IGrouping<string, DocumentDraft>> documentListGroups = draftsReadyForPublishing.GroupBy(doc => doc.ListFQN);

            //foreach (IGrouping<string, DocumentDraft> docGroup in documentListGroups)
            //{
            //    List<string> docIds = docGroup.Select(doc => doc.Id).ToList();
            //    var result = await _documentPublishingWebApiClient.PublishDocuments(documentIds:docGroup.Key.ToList() /*listFQN: */ docGroup.Key, /*documentIds: */ docIds);
            //    returnedIds.AddRange(result.ReadAsAsync().Result);
            //}

            return List2(returnedIds);
        }

        [HttpPostRoute(UriTemplate = "pubsetpublish")]
        public async Task<Response<List<string>>> PubSetPublish(List<string> docIds)
        {
         
            var result = await _documentPublishingWebApiClient.PublishDocuments(documentIds: docIds);

            if (result.HasException)
            {
                throw result.ReadException();
            }

            return List2(docIds);
        }

        [HttpPostRoute(UriTemplate = "pubsetdiscard")]
        public async Task<Response<List<string>>> PubSetDiscard(List<string> docIds)
        {

            var result = await _documentPublishingWebApiClient.DeleteDocumentDrafts(documentIds: docIds);

            if (result.HasException)
            {
                throw result.ReadException();
            }

            return List2(docIds);
        }

        /// <summary>
        /// Discard pending changes to a set of documents.
        /// </summary>
        [HttpPostRoute(UriTemplate = "discard")]
        public async Task<Response<List<string>>> Discard(List<DocumentDraft> docs)
        {
            List<string> discardedDocIds = docs.Select(x => x.Id).ToList();



            var result = await _documentPublishingWebApiClient.DeleteDocumentDrafts(documentIds: discardedDocIds);

            if (result.HasException)
            {
                throw result.ReadException();
            }

            return List2(discardedDocIds);
        }

        /// <summary>
        /// Publishes all the pending changes.
        /// <param name="type">Document type ("Page" or "Template"). Passing null or empty means to publish all documents.</param>
        /// </summary>
        [HttpPostRoute(UriTemplate = "publishall")]
        public async Task<Response<List<string>>> PublishAll(PublishArgs args)
        {
            args = args ?? new PublishArgs();

            // TODO: The service does not currently support "null", so we pass HACK instead.
            string listFQN = args.ListFQN;


            if (listFQN == null)
            {
                var res = await _documentPublishingWebApiClient.PublishDocuments(null);
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }
           
            else
            {
                var res = await _documentPublishingWebApiClient.PublishDocuments(null, documentLists: listFQN);
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }
           

            return List2(new List<string>());
        }

        /// <summary>
        /// Publishes all the pending changes.
        /// </summary>
        /// <param name="type">Document type ("Page" or "Template"). Passing null or empty means to discard all documents.</param>
        [HttpPostRoute(UriTemplate = "discardall")]
        public async Task<Response<List<string>>> DiscardAll(PublishArgs args)
        {
            args = args ?? new PublishArgs();
            // TODO: The service does not currently support "null", so we pass HACK instead.
            string listFQN = (args.ListFQN);

            // TODO: This method implementation should be thrown away when the Mozu service supports a DiscardAll().
            // See related note in PublishAll().

            if (listFQN == null)
            {
                var res = await _documentPublishingWebApiClient.DeleteDocumentDrafts(null);
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }
            else
            {
                var res = await _documentPublishingWebApiClient.DeleteDocumentDrafts(null, documentLists: listFQN);
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }



            return List2(new List<string>());
        }

        /// <summary>
        /// Translates the UI's idea of a document type (Page and Template) into the appropriate ListFQN for a cms collection.
        /// If null or an unsupported document type is provided, this will return null.
        /// </summary>
        
    }
}
