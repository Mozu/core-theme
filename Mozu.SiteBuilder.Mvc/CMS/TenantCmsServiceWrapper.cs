using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Document = Mozu.Content.Contracts.Document;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class TenantCmsServiceWrapper : ITenantCmsServiceWrapper
    {
        private readonly IDocumentWebApiClient _docRepo;
        private readonly IFolderWebApiClient _folderWebApiClient;
        private readonly ISiteBuilderContext _siteBuilderContext;
        private const TargetContextLevelType _targetContextLevelType = TargetContextLevelType.SiteGroup;

        public TenantCmsServiceWrapper(IDocumentWebApiClient docRepo, IFolderWebApiClient folderWebApiClient, ISiteBuilderContext siteBuilderContext)
        {
            _docRepo = docRepo;
            _folderWebApiClient = folderWebApiClient;
            _siteBuilderContext = siteBuilderContext;

            var repo = _docRepo as DocumentWebApiClient;
            if (repo != null)
            {
                repo.Options.MaxSize = int.MaxValue;
            }
        }

        public Task<ServiceClientResponse<PagedCollection<Document>>> GetList(CmsListRequest request)
        {
            return _docRepo.With(_targetContextLevelType)
                .List(request.Collection, request.ToFilterString(), null, request.Recurse, CmsConstants.Documents.doc_state_active, request.ToSortString(), request.PageSize, request.StartIndex);
        }

        public Task<ServiceClientResponse<Document>> Get(string contentCollection, string documentId, string status, string o1)
        {
            return _docRepo.With(_targetContextLevelType)
                .Get(contentCollection, documentId, status: status, version: o1);
        }

        public Task<ServiceClientResponse<Folder>> GetByPath(string contentCollection, string path)
        {
            return _folderWebApiClient.With(_targetContextLevelType)
                .GetByPath(contentCollection, path);
        }

        public Task<ServiceClientResponse<Document>> Create(string contentCollection, Document document)
        {
            return _docRepo.With(_targetContextLevelType)
                .Create(contentCollection, document);
        }

        public Task<ServiceClientResponse<Folder>> Create(string contentCollection, Folder folder)
        {
            return _folderWebApiClient.With(_targetContextLevelType)
                .Create(contentCollection, folder);
        }

        public Task<ServiceClientResponse<StreamContent>> Delete(string contentCollection, string folderId)
        {
            return _folderWebApiClient.With(_targetContextLevelType)
                .Delete(contentCollection, folderId);
        }

        public Task<ServiceClientResponse<StreamContent>> Delete(string contentCollection, string documentId, string version)
        {
            return _docRepo.With(_targetContextLevelType)
                .Delete(contentCollection, documentId, version);
        }

        public Task<ServiceClientResponse<StreamContent>> UpdateDocumentContent(string contentCollection, string documentId, FileStream stream)
        {
            return _docRepo.With(_targetContextLevelType)
                .UpdateDocumentContent(contentCollection, documentId, stream);
        }

        public async Task<ServiceClientResponse<FolderTree>> GetFolderTree(string documentListName)
        {
            const int levels = 99;
            var folderWebApiClient = _folderWebApiClient.With(_targetContextLevelType);

            Folder rootFolder = folderWebApiClient.GetByPath(documentListName, "/").Result.ReadAsAsync().Result;
            var task = await folderWebApiClient.GetFolderTree(documentListName, rootFolder.Id, levels);

            if (task.ResponseMessage.StatusCode != HttpStatusCode.NotFound)
                return task;

            var folder = new Folder { DocumentListName = documentListName, ParentId = rootFolder.Id, Name = documentListName };
            await folderWebApiClient.Create(documentListName, folder, _targetContextLevelType).Result.ReadAsAsync();
            return await folderWebApiClient.GetFolderTree(documentListName, rootFolder.Id, levels);
        }

        public Task<ServiceClientResponse<Document>> Update(string contentCollection, string documentId, Document document)
        {
            return _docRepo.With(_targetContextLevelType)
                .Update(contentCollection, documentId, document);
        }

        public Task<ServiceClientResponse<Folder>> Update(string contentCollection, string documentId, Folder folder)
        {
            return _folderWebApiClient.With(_targetContextLevelType)
                .Update(contentCollection, documentId, folder);
        }
    }
}