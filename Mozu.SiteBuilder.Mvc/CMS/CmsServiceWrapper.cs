using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Newtonsoft.Json.Linq;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsServiceWrapper : ICmsServiceWrapper
    {
        private readonly Lazy<IThemeEntityDefinitionProvider> _themeEntityDefinitionProvider;

        public CmsServiceWrapper(IDocumentListWebApiClient docRepo,
            ISiteBuilderApiContext apiContext,
            Lazy<IThemeEntityDefinitionProvider> themeEntityDefinitionProvider
            )
        {
            DocumentListWebApiClient = docRepo;
            
            if (apiContext != null)
            {
                if (apiContext.UserClaims != null && apiContext.UserClaims.ScopeType != Mozu.Core.ContextLevelType.Tenant.ToString())
                {
                    DocumentListWebApiClient = DocumentListWebApiClient.CloneWithoutUserClaims();
                }

                if (apiContext.DataViewMode == Core.DataViewModeType.Pending)
                {
                    DocumentListWebApiClient.Options.DisableCache = true;
                }
            }
            _themeEntityDefinitionProvider = themeEntityDefinitionProvider;
        }

        private Task<ServiceClientResponse<DC.Document>> CreateInternal(DC.Document doc)
        {
            doc.Properties ??= new JObject();

            var documentTypeId = doc.Get<string>(CmsConstants.Documents.page_type_definition);
            var pageTypeDef = GetPageTypeDefinition(documentTypeId);

            doc.Name = string.IsNullOrEmpty(doc.Name) ? Guid.NewGuid().ToString() : doc.Name;
            doc.DocumentTypeFQN = string.IsNullOrEmpty(doc.DocumentTypeFQN) ? pageTypeDef.DocumentTypeFQN : doc.DocumentTypeFQN;

            if (string.IsNullOrEmpty(doc.Get<string>(CmsConstants.Documents.template)))
            {
                doc.Properties[CmsConstants.Documents.template] = pageTypeDef.Template;
            }

            doc.ListFQN = string.IsNullOrEmpty(doc.ListFQN) ? CmsConstants.Documents.default_collection_name : doc.ListFQN;

            if (pageTypeDef.Zones == null || pageTypeDef.Zones.Count <= 0)
                return DocumentListWebApiClient.CreateDocument(doc.ListFQN, doc);

            var widgetPropVal = Newtonsoft.Json.JsonConvert.SerializeObject(pageTypeDef.Zones);
            doc.Properties[CmsConstants.Documents.widget_prop] = widgetPropVal;

            return DocumentListWebApiClient.CreateDocument(doc.ListFQN, doc);
        }

        PageTypeDefinition GetPageTypeDefinition(string documentTypeId)
        {
            var pageTypeDef = documentTypeId == null ? new PageTypeDefinition() : _themeEntityDefinitionProvider.Value.GetPageTypeDefinition(documentTypeId);
            if (pageTypeDef == null)
            {
                throw new InvalidOperationException("unknonw pageTypeDefinition " + documentTypeId);
            }

            return pageTypeDef;
        }

        

        public async Task<ServiceClientResponse<DC.Document>> UpdateInternal(DC.Document doc)
        {
            if (doc.Id.StartsWith("new"))
            {
                return null;
            }

            if (doc.Properties["widgets"] != null)
                return await DocumentListWebApiClient.UpdateDocument(doc.ListFQN, doc.Id, doc).ConfigureAwait(false);

            var docResponse = await DocumentListWebApiClient.GetDocument(documentListName: doc.ListFQN, documentId: doc.Id).ConfigureAwait(false);
            var d = docResponse.ReadAsSync();

            if (d.Properties != null && d.Properties.TryGetValue("widgets", out var widgets))
            {
                doc.Properties["widgets"] = widgets;
            }

            return await DocumentListWebApiClient.UpdateDocument(doc.ListFQN, doc.Id, doc).ConfigureAwait(false);
        }

        [Obsolete]
        public Task<ServiceClientResponse<List<DC.Facet>>> GetFacets(string contentCollection,  string propertyName)
        {
            return DocumentListWebApiClient.GetFacets(contentCollection,propertyName);
        }

        public Task<ServiceClientResponse<DC.DocumentCollection >> GetList2(string contentCollection = null, string filter = null, string sortBy = null, int? pageSize = 25, int? startIndex = 0, bool? includeinactive = null)
        {
            return DocumentListWebApiClient.GetDocuments(
                    documentListName: contentCollection, 
                              filter: filter, 
                              sortBy: sortBy, 
                            pageSize: pageSize, 
                          startIndex: startIndex,
                          includeInactive: includeinactive
            );
        }

        public async Task<ServiceClientResponse<DC.Document>> GetByPath2(string contentCollection, string name, string status = null, bool? includeInactive = null)
        {
            var treeDocResponse = await DocumentListWebApiClient.GetTreeDocument(
                documentListName: contentCollection,
                    documentName: name,
                    includeInactive: includeInactive
            ).ConfigureAwait(false);

            if (treeDocResponse.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                return new ServiceClientResponse<DC.Document>()
                {
                    HasException = false,
                    ResponseMessage = treeDocResponse.ResponseMessage,
                    ReadAsSync = () => null,
                    ReadAsAsync = () => Task.FromResult<DC.Document>(null)
                };
            }
            else return treeDocResponse;
        }

        public Task<ServiceClientResponse<DC.Document>> Get2(string contentCollection, string id, bool? includeInactive = null)
        {
            return DocumentListWebApiClient.GetDocument(
                documentListName: contentCollection,
                documentId: id,
                includeInactive: includeInactive
            );
        }

        public Task<ServiceClientResponse<DC.Document>> Update2(DC.Document doc)
        {
            return UpdateInternal( doc );
        }

        public Task<ServiceClientResponse<DC.Document>> Create2(DC.Document doc)
        {
            return CreateInternal( doc );
        }

        public Task<ServiceClientResponse<DC.Document>> RawCreate2(DC.Document doc)
        {
            return DocumentListWebApiClient.CreateDocument(doc.ListFQN, doc);
        }

        public Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(DC.Document doc)
        {
            return Delete2(doc.ListFQN, doc.Id);
        }

        public async Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(string listFQN, string documentId)
        {
            var result = await DocumentListWebApiClient.DeleteDocument(listFQN, documentId).ConfigureAwait(false);
            return Tuple.Create(result.ResponseMessage.IsSuccessStatusCode, result);
        }

        public Task<ServiceClientResponse<DC.DocumentList>> GetList(string listFQN)
        {
            return DocumentListWebApiClient.GetDocumentList(listFQN);
        }

        public Task<ServiceClientResponse<DC.DocumentList>> UpdateList(DC.DocumentList list)
        {
            return DocumentListWebApiClient.UpdateDocumentList(list.ListFQN, list);
        }

        public IDocumentListWebApiClient DocumentListWebApiClient { get; set; }
    }
}
