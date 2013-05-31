using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// DTO class to allow PublishAll and DiscardAll to receive arguments.
    /// </summary>
    [DataContract]
    public class PublishArgs
    {
        [DataMember(Name = "docType")]
        public string DocType;
    }



    /// <summary>
    /// Controller for CMS smiegels.
    /// </summary>
    [ServiceContract]
    public class CmsPublishingController : BaseController
    {
       
        private IDocumentListWebApiClient _documentClient;
        private readonly IDocumentPublishingWebApiClient _documentPublishingWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        //public CmsPublishingController(IMoreAwesomeDocumentWebApiClient documentClient)
       public CmsPublishingController(IDocumentListWebApiClient documentClient, IDocumentPublishingWebApiClient documentPublishingWebApiClient)
        {
            _documentClient = documentClient;
            _documentPublishingWebApiClient = documentPublishingWebApiClient;
        }

        /// <summary>
        /// Get paged list of all pending drafts.
        /// </summary>
        [WebGet(UriTemplate = "listdrafts")]
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

        /// <summary>
        /// Publish a set of documents.
        /// </summary>
        [WebInvoke(UriTemplate = "publish")]
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
           // IEnumerable<IGrouping<string, DocumentDraft>> documentListGroups = draftsReadyForPublishing.GroupBy(doc => doc.DocumentListName);

            //foreach (IGrouping<string, DocumentDraft> docGroup in documentListGroups)
            //{
            //    List<string> docIds = docGroup.Select(doc => doc.Id).ToList();
            //    var result = await _documentPublishingWebApiClient.PublishDocuments(documentIds:docGroup.Key.ToList() /*documentListName: */ docGroup.Key, /*documentIds: */ docIds);
            //    returnedIds.AddRange(result.ReadAsAsync().Result);
            //}

            return List2(returnedIds);
        }

        /// <summary>
        /// Discard pending changes to a set of documents.
        /// </summary>
        [WebInvoke(UriTemplate = "discard")]
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
        [WebInvoke(UriTemplate = "publishall")]
        public async Task<Response<List<string>>> PublishAll(PublishArgs args)
        {
            args = args ?? new PublishArgs();

            // TODO: The service does not currently support "null", so we pass HACK instead.
            string documentListName = GetDocumentListNameFromDocType(args.DocType);


            if (documentListName == null)
            {
                var res = await _documentPublishingWebApiClient.PublishDocuments(null);
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }
            else
            {
                var res = await _documentPublishingWebApiClient.PublishDocuments(null, documentLists: documentListName);
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
        [WebInvoke(UriTemplate = "discardall")]
        public async Task<Response<List<string>>> DiscardAll(PublishArgs args)
        {
            args = args ?? new PublishArgs();
            // TODO: The service does not currently support "null", so we pass HACK instead.
            string documentListName = GetDocumentListNameFromDocType(args.DocType);

            // TODO: This method implementation should be thrown away when the Mozu service supports a DiscardAll().
            // See related note in PublishAll().

            if (documentListName == null)
            {
                var res = await _documentPublishingWebApiClient.DeleteDocumentDrafts(null);
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }
            else
            {
                var res = await _documentPublishingWebApiClient.DeleteDocumentDrafts(null, documentLists: documentListName);
                if (res.HasException)
                {
                    throw res.ReadException();
                }
            }



            return List2(new List<string>());
        }

        /// <summary>
        /// Translates the UI's idea of a document type (Page and Template) into the appropriate DocumentListName for a cms collection.
        /// If null or an unsupported document type is provided, this will return null.
        /// </summary>
        private string GetDocumentListNameFromDocType(string type)
        {
            switch ((type ?? "").ToLower())
            {
                case "page":
                    return "pages";
                case "template":
                    return "templates";
                default:
                    return null;
            }
        }
    }
}
