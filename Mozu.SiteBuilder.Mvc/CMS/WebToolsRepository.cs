using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public interface IWebToolsRepository
    {
        Task<StreamContent> SaveWebmasterToolsFile(string localFileName);

        Stream GetWebMasterToolsFile(string fileName);
    }

    public class WebToolsRepository : IWebToolsRepository
    {
        public const string ContentCollection = "settings";

        private readonly IDocumentWebApiClient _documentWebApiClient;
        private readonly ICmsServiceWrapper _cmsServiceWrapper;

        public WebToolsRepository(IDocumentWebApiClient documentWebApiClient, ICmsServiceWrapper cmsServiceWrapper)
        {
            _documentWebApiClient = documentWebApiClient;
            _cmsServiceWrapper = cmsServiceWrapper;
        }

        public async Task<StreamContent> SaveWebmasterToolsFile(string localFileName)
        {
            var documentId = GetOrCreateDocumentId("google-site-verification");
            var file = new FileInfo(localFileName);

            using (Stream fs = file.OpenRead())
            {
                var task = _documentWebApiClient.UpdateDocumentContent(ContentCollection, documentId, fs);
                return await task.Result.ReadAsAsync();
            }
        }

        public Stream GetWebMasterToolsFile(string fileName)
        {
            var documentId = GetOrCreateDocumentId("google-site-verification");

            var result = _documentWebApiClient.GetDocumentContent(ContentCollection, documentId).Result.ReadAsAsync().Result;

            return result.ReadAsStreamAsync().Result;
        }

        private string GetOrCreateDocumentId(string name)
        {
            var task = _cmsServiceWrapper.GetByPath(ContentCollection, name, "");

            if (task.Result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                return CreateDocument(name);

            var document = task.Result.ReadAsAsync().Result;

            return document == null ? CreateDocument(name) : document.Id;
        }

        private string CreateDocument(string name)
        {
            var document = new Document
            {
                Name = name,
                DocumentType = "document",
                ContentCollection = ContentCollection,
            };

            var response = _documentWebApiClient.Create(ContentCollection, document).Result;

            if (response.HasException)
                throw response.ReadException();

            if (response.ResponseMessage.IsSuccessStatusCode)
                return response.ReadAsSync().Id;

            return null;
        }
    }
}