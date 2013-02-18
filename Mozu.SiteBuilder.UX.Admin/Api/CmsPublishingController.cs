using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.MockServices;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
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
        public CmsPublishingController(IMoreAwesomeDocumentWebApiClient documentClient)
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
            string filter = null;
            string sort = null;

            int? pageSize = pagingParams.pageSize;
            int? startIndex = pagingParams.startIndex;
            
            var result = await _documentClient.GetDrafts(/*documentListName: */ null, /*responseGroups: */ null, pageSize, startIndex);
            DC.PagedCollection<DC.Document> res = result.ReadAsAsync().Result;

            return List2(Mapper.Map<List<DocumentDraft>>(res.Items), (int)res.TotalCount);
        }

        /// <summary>
        /// Publish a set of documents.
        /// </summary>
        [WebInvoke(UriTemplate = "publish")]
        public async Task<Response<List<string>>> Publish(List<DocumentDraft> docs)
        {
            List<string> returnedIds = new List<string>();

            IEnumerable<IGrouping<string, DocumentDraft>> documentListGroups = docs.GroupBy(doc => doc.DocumentListName);

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
        /// </summary>
        [WebInvoke(UriTemplate = "publishall")]
        public async Task<Response<List<string>>> PublishAll()
        {
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
                var getListResult = await _documentClient.GetDrafts(/*documentListName: */ null, /*responseGroups: */ null, pageSize, startIndex);
                DC.PagedCollection<DC.Document> docs = getListResult.ReadAsAsync().Result;
                totalCount = (int)docs.TotalCount;

                IEnumerable<IGrouping<string, DC.Document>> documentListGroups = docs.Items.GroupBy(doc => doc.DocumentListName);

                foreach (IGrouping<string, DC.Document> docGroup in documentListGroups)
                {
                    List<string> docIds = docGroup.Select(doc => doc.Id).ToList();

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
        [WebInvoke(UriTemplate = "discardall")]
        public async Task<Response<List<string>>> DiscardAll()
        {
            // TODO: This method implementation should be thrwon away when the Mozu service supports a DiscardAll().
            // See related note in PublishAll().

            List<string> discardedDocIds = new List<string>();
            int startIndex = 0;
            int pageSize = 200;
            int totalCount = Int32.MaxValue;

            do
            {
                var getListResult = await _documentClient.GetDrafts(/*documentListName: */ null, /*responseGroups: */ null, pageSize, startIndex);
                DC.PagedCollection<DC.Document> docs = getListResult.ReadAsAsync().Result;
                totalCount = (int)docs.TotalCount;

                IEnumerable<IGrouping<string, DC.Document>> documentListGroups = docs.Items.GroupBy(doc => doc.DocumentListName);

                foreach (IGrouping<string, DC.Document> docGroup in documentListGroups)
                {
                    List<string> docIds = docGroup.Select(doc => doc.Id).ToList();

                    var discardResult = await _documentClient.Discard(/*documentListName: */ docGroup.Key, /*documentIds: */ docIds);
                    List<string> returnedIds = discardResult.ReadAsAsync().Result;
                    discardedDocIds.AddRange(returnedIds);
                }

                startIndex = docs.StartIndex + docs.PageSize;
            } while (startIndex < totalCount);

            return List2(discardedDocIds);
        }
    }
}
