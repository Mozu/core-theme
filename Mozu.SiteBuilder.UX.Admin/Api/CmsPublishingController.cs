using System;
using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
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
        public CmsPublishingController(IDocumentWebApiClient documentClient)
        {
            _documentClient = documentClient;
        }

        [WebGet(UriTemplate = "listdrafts")]
        public Task<Response<List<Document>>> ListDirtyDocuments([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                DC.Document ret = _documentClient.Get(/*documentListName: */ null, pagingParams.id).Result.ReadAsAsync().Result;

                return List(Mapper.Map<Document>(ret));
            }

            // TODO: filter and sort
            string filter = null;
            string sort = null;

            int? pageSize = pagingParams.pageSize;
            int? startIndex = pagingParams.startIndex;

            DC.PagedCollection<DC.Document> res;
            res = _documentClient.GetDrafts(/*documentListName: */ null, /*responseGroups: */ null, /*shouldRecurseFolders: */ null, pageSize, startIndex).Result.ReadAsAsync().Result;

            return List(Mapper.Map<List<Document>>(res.Items), (int)res.TotalCount);
        }
    }
}
