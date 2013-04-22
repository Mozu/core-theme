//using System;
//using System.IO;
//using System.Net.Http;
//using System.Threading.Tasks;
//using Mozu.Content.Contracts;
//using Mozu.Core.Api.Contracts.Client;
//using Document = Mozu.Content.Contracts.Document;

//namespace Mozu.SiteBuilder.Mvc.CMS
//{
//    public interface ITenantCmsServiceWrapper
//    {
//        Task<ServiceClientResponse<PagedCollection<Document>>> GetList(CmsListRequest request);

//        Task<ServiceClientResponse<Document>> Get(string contentCollection, string documentId, string status, string o1);

//        Task<ServiceClientResponse<Folder>> GetByPath(string contentCollection, string path);

//        Task<ServiceClientResponse<Document>> Create(string contentCollection, Document document);

//        Task<ServiceClientResponse<Folder>> Create(string contentCollection, Folder folder);

//        Task<ServiceClientResponse<StreamContent>> Delete(string thing1, string thing2);

//        Task<ServiceClientResponse<StreamContent>> Delete(string contentCollection, string documentId, string version);

//        Task<ServiceClientResponse<StreamContent>> UpdateDocumentContent(string contentCollection, string documentId, FileStream stream);

//        Task<ServiceClientResponse<FolderTree>> GetFolderTree(string contentCollection);

//        Task<ServiceClientResponse<Document>> Update(string contentCollection, string documentId, Document document);

//        Task<ServiceClientResponse<Folder>> Update(string contentCollection, string documentId, Folder folder);
//    }
//}