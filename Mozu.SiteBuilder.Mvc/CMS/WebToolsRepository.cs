using System;
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
        private const string DefaultRobotsTxt = @"User-agent: *
Disallow: /admin/";

        public const string ContentCollection = "settings";

        private readonly IDocumentWebApiClient _documentWebApiClient;
        private readonly ICmsServiceWrapper _cmsServiceWrapper;

        public WebToolsRepository(IDocumentWebApiClient documentWebApiClient, ICmsServiceWrapper cmsServiceWrapper)
        {
            _documentWebApiClient = documentWebApiClient;
            _cmsServiceWrapper = cmsServiceWrapper;
        }

        public async Task<bool> SaveWebmasterToolsFile(string localFileName, string fileName)
        {

            var documentId = await GetOrCreateDocumentId(fileName, "text/html");
         
            using (var stream = File.OpenRead(localFileName))
            {
                var result  = await _documentWebApiClient.UpdateDocumentContent(ContentCollection, documentId, stream);
                if (result.HasException)
                {
                    throw result.ReadException();
                }
                return true;
            }
        
           

        }


        //    string docID = null;
        //    var getDocTask  = await _cmsServiceWrapper.GetByPath(ContentCollection, fileName, "");
        //    if (getDocTask.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
        //    {
        //        var document = new Document
        //                           {
        //                               Name = fileName,
        //                               //ContentMimeType = "text/html",
        //                               DocumentType = "document",
        //                               ContentCollection = ContentCollection,
        //                           };

        //         var docCreateTask = await _documentWebApiClient.Create(ContentCollection, document);
        //        docID = docCreateTask.ReadAsSync().Id;


        //    }
        //    else
        //    {
        //        docID = getDocTask.ReadAsSync().Id;
        //    }

            
        //    var file = new FileInfo(localFileName);

          

        //    using (Stream fs = file.OpenRead())
        //    {
        //        var x = await  _documentWebApiClient.UpdateDocumentContent(ContentCollection, docID, fs);

        //        if (x.HasException)
        //        {
        //            throw x.ReadException();
        //        }
        //        return true;


        //    }
        //}

        public async Task<Stream> GetWebMasterToolsFile(string fileName)
        {
            var documentId = await GetOrCreateDocumentId(fileName, "text/html");

            var blah = await _documentWebApiClient.GetDocumentContent(ContentCollection, documentId);

            var stream = blah.ResponseMessage.Content.ReadAsStreamAsync().Result;

            return stream;
        }

        public async Task<bool> SaveRobotsContent(RobotsTxtSettings settings)
        {
            var documentId = await  GetOrCreateDocumentId("robots.txt", "text/plain");
            var content = Encoding.ASCII.GetBytes(settings.Content);
            var stream = new MemoryStream(content);

            var task = await _documentWebApiClient.UpdateDocumentContent(ContentCollection, documentId, stream);

            if (task.HasException)
            {
                throw task.ReadException();
            }
            return true;

        }

        public async Task<string> GetRobotsContent()
        {
            var documentId = await GetOrCreateDocumentId("robots.txt", "text/plain");
            var result = await _documentWebApiClient.GetDocumentContent(ContentCollection, documentId);

            if (result.HasException || !result.ResponseMessage.IsSuccessStatusCode)
                return DefaultRobotsTxt;

            var stream = result.ResponseMessage.Content.ReadAsStreamAsync().Result;

            var reader = new StreamReader(stream);

            return reader.ReadToEnd();
        }

        private async Task<string> GetOrCreateDocumentId(string name, string mimeType)
        {
            var task = await _cmsServiceWrapper.GetByPath(ContentCollection, name, "");

            if (task.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                return await CreateDocument(name, mimeType);
            }
            return task.ReadAsSync().Id;
        }

        private async Task<string> CreateDocument(string name, string mimeType)
        {
            var document = new Document
            {
                Name = name,
                ContentMimeType = mimeType,
                DocumentType = "document",
                DocumentListName = ContentCollection,
            };

            var response = await _documentWebApiClient.Create(ContentCollection, document);

           

            return response.ReadAsSync().Id;
        }
    }
}