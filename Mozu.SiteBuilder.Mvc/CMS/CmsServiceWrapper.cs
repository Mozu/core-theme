using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web.UI;
using Autofac;
using Magnum.Extensions;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Newtonsoft.Json.Linq;
using AVM = Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsServiceWrapper : ICmsServiceWrapper
    {
        ISiteBuilderApiContext _apiContext;
        IDocumentListWebApiClient _docRepo;
        
        private readonly ILifetimeScope _lifetimescope;


        public CmsServiceWrapper(IDocumentListWebApiClient docRepo,
            ISiteBuilderApiContext apiContext,
            ILifetimeScope lifetimescope
            )
        {
            _apiContext = apiContext;
     
       
            _docRepo = docRepo;
            if (_apiContext.UserClaims != null && _apiContext.UserClaims.ScopeType != Mozu.Core.ContextLevelType.Tenant.ToString())
            {
                _docRepo = _docRepo.CloneWithoutUserClaims();
            }
            
          //  _cmsTypeHelper = cmsTypeHelper;
            _lifetimescope = lifetimescope;
        }

        private Task<ServiceClientResponse<DC.Document>> CreateInternal(DC.Document doc)
        {
            doc.Properties = doc.Properties ?? new JObject();

            var documentTypeId = doc.Get<string>(CmsConstants.Documents.page_type_definition);
            PageTypeDefinition pageTypeDef = null;
            var themeEntityDefinitionProvider = _lifetimescope.Resolve<IThemeEntityDefinitionProvider>();
            if (documentTypeId == null)
            {
                pageTypeDef = new PageTypeDefinition();
                //throw new InvalidOperationException("missing documentTypeId");
            }
            else
            {
                pageTypeDef = themeEntityDefinitionProvider.GetPageTypeDefinition(documentTypeId);
            }
            if (pageTypeDef == null)
            {
                throw new InvalidOperationException("unknonw pageTypeDefinition " + documentTypeId);
            }


            var d = doc;

            d.Name = string.IsNullOrEmpty(d.Name) ? Guid.NewGuid().ToString() : d.Name;
            d.DocumentTypeFQN = string.IsNullOrEmpty(d.DocumentTypeFQN) ? pageTypeDef.DocumentTypeFQN : d.DocumentTypeFQN;

            if (string.IsNullOrEmpty(d.Get<string>(CmsConstants.Documents.template)))
            {
                d.Properties.CastAs<JObject>()[CmsConstants.Documents.template] = pageTypeDef.Template;
                
            }



            d.ListFQN = string.IsNullOrEmpty(d.ListFQN) ? CmsConstants.Documents.default_collection_name : d.ListFQN;

            if (pageTypeDef.Zones != null && pageTypeDef.Zones.Count> 0)
            {
                var widgetPropVal = Newtonsoft.Json.JsonConvert.SerializeObject(pageTypeDef.Zones);
                d.Properties.CastAs<JObject>()[CmsConstants.Documents.widget_prop] = widgetPropVal;
            }


           
            var task = _docRepo.CreateDocument( d.ListFQN, d);
            return task;
        }

        [Obsolete]
        public Task<Tuple<DC.FolderTree, ServiceClientResponse<DC.FolderTree>>> GetFolderTree(string collection, string parentId = null, int? levels = null)
        {
            throw new NotImplementedException();
            //return _folderRepo.GetFolderTree(collection, parentId, levels)
            //    .ContinueWith ( x=>  
            //        {
            //            if ( x.Result.ResponseMessage .IsSuccessStatusCode )
            //            {
            //                return new Tuple<DC.FolderTree,ServiceClientResponse<DC.FolderTree>>( x.Result.ReadAsSync (), x.Result  );
            //            }
            //            else{
            //                return new Tuple<DC.FolderTree, ServiceClientResponse<DC.FolderTree>>(null, x.Result );
            //            }
            //        });
        }

        public Task<ServiceClientResponse<DC.Document>> UpdateInternal(DC.Document doc)
        {
            if (doc.Id.StartsWith("new"))
            {
                //todo: clean up create sync.
                return null;
            }


            //remove when patch comes back.
            if (doc.Properties["widgets"]== null )
            {
                var d = _docRepo.GetDocument(documentListName: doc.ListFQN, documentId: doc.Id).Result.ReadAsSync();

                // doc.Set("widgets", );
                JToken widgets;
                if (d.Properties != null && d.Properties.TryGetValue("widgets", out widgets))
                {
                    doc.Properties["widgets"] = widgets;
                }

            }
            return _docRepo.UpdateDocument(doc.ListFQN, doc.Id, doc);
        }


        [Obsolete]
        public Task<ServiceClientResponse<List<DC.Facet>>> GetFacets(string contentCollection,  string propertyName)
        {
            return _docRepo.GetFacets(contentCollection,propertyName);
        }


        public Task<ServiceClientResponse<DC.DocumentCollection >> GetList2(string contentCollection = null, string filter = null, string sortBy = null, int? pageSize = 25, int? startIndex = 0)
        {
            return _docRepo.GetDocuments(
                    documentListName: contentCollection, 
                              filter: filter, 
       
                            //  publishState : _apiContext.CmsDraftState, 
                              sortBy: sortBy, 
                            pageSize: pageSize, 
                          startIndex: startIndex
            );
        }

        public Task<ServiceClientResponse<DC.Document>> GetByPath2(string contentCollection, string name, string status = null )
        {
            var task = _docRepo.GetTreeDocument(
                documentListName: contentCollection,
                    documentName: name
                    //,
               //     publishState : status?? _apiContext.CmsDraftState
            );

            return task.ContinueWith(t =>
            {
                if (t.Result.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                {
                    return new ServiceClientResponse<DC.Document>()
                    {
                        HasException = false,
                        ResponseMessage = t.Result.ResponseMessage,
                        ReadAsSync = () => null,
                        ReadAsAsync = t.Result.ReadAsAsync
                    };
                }

                return t.Result;
            });
        }

        public Task<ServiceClientResponse<DC.Document>> Get2(string contentCollection, string id)
        {
            return _docRepo.GetDocument(
                documentListName: contentCollection,
                documentId: id
                //,
         //       publishState : _apiContext.CmsDraftState
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
            return _docRepo.CreateDocument(doc.ListFQN, doc
                //,publishState:"latest"
                );
        }

        public Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(DC.Document doc)
        {
            return Delete2(doc.ListFQN, doc.Id);
        }

        public Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(string listFQN, string documentId)
        {
            return _docRepo.DeleteDocument(listFQN, documentId)
                //, _apiContext.CmsDraftState)
                .ContinueWith(t => new Tuple<bool, ServiceClientResponse<StreamContent>>(t.Result.ResponseMessage.IsSuccessStatusCode, t.Result));
        }


        public IDocumentListWebApiClient DocumentListWebApiClient
        {
            get { return _docRepo; }
            set { _docRepo = value; }
        }
    }
}
