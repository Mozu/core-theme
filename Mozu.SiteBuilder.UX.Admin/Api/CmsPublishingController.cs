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

        [WebGet(UriTemplate = "listdrafts")]
        public async Task<Response<List<Document>>> ListDirtyDocuments([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var resultGetById = await _documentClient.Get(/*documentListName: */ null, pagingParams.id);
                DC.Document ret = resultGetById.ReadAsAsync().Result;

                return List2(Mapper.Map<Document>(ret));
            }

            // TODO: filter and sort
            string filter = null;
            string sort = null;

            int? pageSize = pagingParams.pageSize;
            int? startIndex = pagingParams.startIndex;

            
            var result = await _documentClient.GetDrafts(/*documentListName: */ null, /*responseGroups: */ null, pageSize, startIndex);
            DC.PagedCollection<DC.Document> res = result.ReadAsAsync().Result;

            return List2(Mapper.Map<List<Document>>(res.Items), (int)res.TotalCount);
        }

        [WebInvoke(UriTemplate = "publish")]
        public async Task<Response<List<string>>> Publish(List<string> ids)
        {
            var result = await _documentClient.PublishDocuments(/*documentList: */ null, ids);
            List<string> returnedIds = result.ReadAsAsync().Result;
            return List2(returnedIds);
        }


        [WebInvoke(UriTemplate = "publishall")]
        public async Task<Response<List<string>>> PublishAll()
        {
            List<string> publishedDocIds = new List<string>();
            int startIndex = 0;
            int pageSize = 100;
            int totalCount = Int32.MaxValue;

            do
            {
                var getListResult = await _documentClient.GetDrafts(/*documentListName: */ null, /*responseGroups: */ null, pageSize, startIndex);
                DC.PagedCollection<DC.Document> docs = getListResult.ReadAsAsync().Result;
                totalCount = (int)docs.TotalCount;

                List<string> docIds = docs.Items.Select(d => d.Id).ToList();
                var publishResult = await _documentClient.PublishDocuments(/*documentList: */ null, docIds);
                List<string> returnedIds = publishResult.ReadAsAsync().Result;
                publishedDocIds.AddRange(returnedIds);

                startIndex += docs.Items.Count;
            } while (startIndex <= totalCount);

            return List2(publishedDocIds);
        }
    }
}
