using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Contracts.Client;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public interface ICmsServiceWrapper
    {
        Task<ServiceClientResponse<DC.Document>> Create2(DC.Document doc);

        Task<ServiceClientResponse<DC.Document>> RawCreate2(DC.Document doc);

        Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(DC.Document document);

        Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(string listFQN, string documentId);

        Task<ServiceClientResponse<DC.Document>> GetByPath2(string contentCollection, string name, string status=null, bool? includeInactive = null);

        Task<ServiceClientResponse<DC.Document>> Get2(string contentCollection, string id, bool? includeInactive = null);

        Task<ServiceClientResponse<DC.DocumentCollection>> GetList2(string contentCollection = null, string filter = null, string sortBy = null, int? pageSize = 25, int? startIndex = 0, bool? includeInactive = null);

        [Obsolete]
        Task<Tuple<DC.FolderTree, ServiceClientResponse<DC.FolderTree>>> GetFolderTree(string collection, string parentId = null, int? levels = null);

        [Obsolete]
        Task<ServiceClientResponse<List<DC.Facet>>> GetFacets(string contentCollection,  string propertyName);

        Task<ServiceClientResponse<DC.Document>> Update2(DC.Document document);
   
        IDocumentListWebApiClient DocumentListWebApiClient { get; set; }

        Task<ServiceClientResponse<DC.DocumentList>> GetList(string listFQN);
        Task<ServiceClientResponse<DC.DocumentList>> UpdateList(DC.DocumentList list);
    }
}
