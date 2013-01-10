using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Runtime.Serialization.Json;
using Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.UX.Models.Settings;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public interface IWebToolsRepository
    {
        T Get<T>() where T : IWebToolsSetting;

        void Save<T>(T setting) where T : IWebToolsSetting;
    }

    public class WebToolsRepository : IWebToolsRepository
    {
        public const string ContentCollection = "settings";

        private readonly IDocumentWebApiClient _documentWebApiClient;
        private readonly ICmsServiceWrapper _cmsServiceWrapper;

        private static Type[] _knownTypes = new[] { typeof(string) };

        public WebToolsRepository(IDocumentWebApiClient documentWebApiClient, ICmsServiceWrapper cmsServiceWrapper)
        {
            _documentWebApiClient = documentWebApiClient;
            _cmsServiceWrapper = cmsServiceWrapper;
        }

        public T Get<T>() where T : IWebToolsSetting
        {
            var documentId = GetOrCreateDocumentId(typeof(T));

            using (var content = _documentWebApiClient.GetDocumentContent(ContentCollection, documentId).Result.ResponseMessage.Content)
            using (var stream = content.ReadAsStreamAsync().Result)
            {
                var serializer = new DataContractJsonSerializer(typeof(T), _knownTypes);

                stream.Position = 0;

                var o = (T) serializer.ReadObject(stream);

                return o;
            }
        }

        public void Save<T>(T setting) where T : IWebToolsSetting
        {
            var documentId = GetOrCreateDocumentId(typeof(T));

            using (var stream = new MemoryStream())
            {
                var serializer = new DataContractJsonSerializer(typeof (T), _knownTypes);

                serializer.WriteObject(stream, setting);
                stream.SetLength(stream.Position);

                var svc = (ServiceClientBase)_documentWebApiClient;
                var relpath = ContentCollection + "/" + documentId;

                //using (var updateTask = _documentWebApiClient.UpdateDocumentContent(ContentCollection, documentId))
                using (var updateTask = svc.Handler.SendAsync<StreamContent, Stream>("POST", relpath, stream, svc.ServiceId, svc.Options))
                {
                    if (updateTask.Result.HasException)
                        throw updateTask.Result.ReadException();
                }
            }
        }

        private string GetOrCreateDocumentId(Type type)
        {
            var name = type.Name.ToLower();
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