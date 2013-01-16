using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.Mvc.CMS
{
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

        public async Task<StreamContent> SaveWebmasterToolsFile(string localFileName, string fileName)
        {
            var documentId = GetOrCreateDocumentId(fileName);
            var file = new FileInfo(localFileName);

            using (Stream fs = file.OpenRead())
            {
                var task = _documentWebApiClient.UpdateDocumentContent(ContentCollection, documentId.Result, fs);
                return await task.Result.ReadAsAsync();
            }
        }

        public async Task<Stream> GetWebMasterToolsFile(string fileName)
        {
            var documentId = await GetOrCreateDocumentId(fileName);

            var result = _documentWebApiClient.GetDocumentContent(ContentCollection, documentId).Result.ReadAsAsync();

            return await result.Result.ReadAsStreamAsync();
        }

        public async Task<StreamContent> SaveRobotsContent(RobotsTxtSettings settings)
        {
            var documentId = GetOrCreateDocumentId("robots.txt");
            var content = Encoding.ASCII.GetBytes(settings.Content);

            var stream = new MemoryStream(content);

            var task = _documentWebApiClient.UpdateDocumentContent(ContentCollection, documentId.Result, stream);
            return await task.Result.ReadAsAsync();
        }

        public async Task<string> GetRobotsContent()
        {
            var documentId = GetOrCreateDocumentId("robots.txt");
            var result = await _documentWebApiClient.GetDocumentContent(ContentCollection, documentId.Result);

            return await StringFromStreamContent(result.ReadAsAsync());
        }

        private static async Task<string> StringFromStreamContent(Task<StreamContent> streamContent)
        {
            var result = streamContent.Result.ReadAsStreamAsync();
            var reader = new StreamReader(result.Result);

            return await reader.ReadToEndAsync();
        }

        private async Task<string> GetOrCreateDocumentId(string name)
        {
            var task = await _cmsServiceWrapper.GetByPath(ContentCollection, name, "");

            if (task.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                return await CreateDocument(name);

            var document = task.ReadAsAsync().Result;

            return document == null ? await CreateDocument(name) : document.Id;
        }

        private async Task<string> CreateDocument(string name)
        {
            var document = new Document
            {
                Name = name,
                //ContentMimeType = "text/html",
                DocumentType = "document",
                ContentCollection = ContentCollection,
            };

            var response = await _documentWebApiClient.Create(ContentCollection, document);

            if (response.HasException)
                throw response.ReadException();

            //if (response.ResponseMessage.IsSuccessStatusCode)

            return response.ReadAsSync().Id;
        }
    }
}