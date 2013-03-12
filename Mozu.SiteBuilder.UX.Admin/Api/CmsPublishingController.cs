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
using Mozu.SiteBuilder.UX.Admin.MockServices;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using DC = Mozu.Content.Contracts;

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
       
        private IDocumentWebApiClient _documentClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        //public CmsPublishingController(IMoreAwesomeDocumentWebApiClient documentClient)
       public CmsPublishingController(IDocumentWebApiClient documentClient)
        {
            _documentClient = documentClient;
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

            var result = await _documentClient.GetDrafts(pageSize: 200);
            
            var res = result.ReadAsAsync().Result;

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

            IEnumerable<IGrouping<string, DocumentDraft>> documentListGroups = draftsReadyForPublishing.GroupBy(doc => doc.DocumentListName);

            foreach (IGrouping<string, DocumentDraft> docGroup in documentListGroups)
            {
                List<string> docIds = docGroup.Select(doc => doc.Id).ToList();
                var result = await _documentClient.PublishDocuments(/*documentListName: */ docGroup.Key, /*documentIds: */ docIds);
                returnedIds.AddRange(result.ReadAsAsync().Result);
            }

            return List2(returnedIds);
        }

        /// <summary>
        /// Discard pending changes to a set of documents.
        /// </summary>
        [WebInvoke(UriTemplate = "discard")]
        public async Task<Response<List<string>>> Discard(List<DocumentDraft> docs)
        {
            List<string> discardedDocIds = new List<string>();

            IEnumerable<IGrouping<string, DocumentDraft>> documentListGroups = docs.GroupBy(doc => doc.DocumentListName);

            foreach (IGrouping<string, DocumentDraft> docGroup in documentListGroups)
            {
                List<string> docIds = docGroup.Select(doc => doc.Id).ToList();

                var result = await _documentClient.Discard(/*documentListName: */ docGroup.Key, /*documentIds: */ docIds);
                List<string> returnedIds = result.ReadAsAsync().Result;
                discardedDocIds.AddRange(returnedIds);
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
            string documentListName = GetDocumentListNameFromDocType(args.DocType) ;

            // TODO: The all-knowing Thom has said this method is not sufficient.
            // Since we'd have to get each page, then group by document list name and make N calls to publish
            // We should wait for the Mozu service to support a PublishAll().
            // See related note in DiscardAll.
            List<string> publishedDocIds = new List<string>();
            int startIndex = 0;
            int pageSize = 200;
            int totalCount = Int32.MaxValue;

            do
            {

                var getListResult = await _documentClient.GetDrafts(documentListNames: documentListName, pageSize: pageSize, startIndex: startIndex);// /*responseGroups: */ null, pageSize, startIndex);

                var docs = getListResult.ReadAsAsync().Result;
               
                totalCount = (int)docs.TotalCount;

                var documentListGroups = docs.Items.GroupBy(doc => doc.DocumentListName);

                foreach (var docGroup in documentListGroups)
                {

                    //ugg
                    //if (documentListName != HACK)
                    //{
                    //    // TODO: currently the server ignores documentListName, so we double-check that we only got results from the list we expected.
                    //    if (!String.IsNullOrEmpty(documentListName) && docGroup.Key.ToLower() != documentListName.ToLower())
                    //        continue;
                    //}


                    List<string> docIds = docGroup.Select(doc => doc.Id.ToString()).ToList();

                    var publishResult = await _documentClient.PublishDocuments(/*documentListName: */ docGroup.Key, /*documentIds: */ docIds);
                    List<string> returnedIds = publishResult.ReadAsAsync().Result;
                    publishedDocIds.AddRange(returnedIds);
                }

                startIndex = docs.StartIndex + docs.PageSize;
            } while (startIndex < totalCount);

            return List2(publishedDocIds);
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

            List<string> discardedDocIds = new List<string>();
            int startIndex = 0;
            int pageSize = 200;
            int totalCount = Int32.MaxValue;

            do
            {
                var getListResult = await _documentClient.GetDrafts(documentListNames :documentListName,pageSize:pageSize , startIndex:startIndex );
                var  docs = getListResult.ReadAsAsync().Result;
                totalCount = (int)docs.TotalCount;

                var documentListGroups = docs.Items.GroupBy(doc => doc.DocumentListName);

                foreach (var docGroup in documentListGroups)
                {
                    // TODO: currently the server ignores documentListName, so we double-check that we only got results from the list we expected.
                    if (!String.IsNullOrEmpty(documentListName) && docGroup.Key.ToLower() != documentListName.ToLower())
                        continue;

                    List<string> docIds = docGroup.Select(doc => doc.Id.ToString( )).ToList();

                    var discardResult = await _documentClient.Discard(/*documentListName: */ docGroup.Key, /*documentIds: */ docIds);
                    List<string> returnedIds = discardResult.ReadAsAsync().Result;
                    discardedDocIds.AddRange(returnedIds);
                }

                startIndex = docs.StartIndex + docs.PageSize;
            } while (startIndex < totalCount);

            return List2(discardedDocIds);
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
                    return "Pages";
                case "template":
                    return "Templates";
                default:
                    return null;
            }
        }
    }
}
