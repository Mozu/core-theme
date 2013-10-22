using System;
using System.Collections.Generic;
using System.Linq;
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
using AVM = Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.CMS
{
    public class CmsServiceWrapper : ICmsServiceWrapper
    {
        ISiteBuilderApiContext _apiContext;
        IDocumentListWebApiClient _docRepo;
        ICmsTypeHelper _cmsTypeHelper;
      
        private readonly IThemeEntityDefinitionProvider _themeEntityDefinitionProvider;

        public CmsServiceWrapper(IDocumentListWebApiClient docRepo,
            ISiteBuilderApiContext apiContext,
            ICmsTypeHelper cmsTypeHelper,
          
            IThemeEntityDefinitionProvider themeEntityDefinitionProvider
            )
        {
            _apiContext = apiContext;
     
            _themeEntityDefinitionProvider = themeEntityDefinitionProvider;
            _docRepo = docRepo;
            if (_apiContext.UserClaims != null && _apiContext.UserClaims.ScopeType != Mozu.Core.ContextLevelType.Tenant.ToString())
            {
                _docRepo = _docRepo.CloneWithoutUserClaims();
            }
            
            _cmsTypeHelper = cmsTypeHelper;
        }

        private Task<ServiceClientResponse<DC.Document>> CreateInternal(AVM.Document doc)
        {
            doc.Items = doc.Items ?? new List<AVM.DocumentProperty>();

            var documentTypeId = doc.Items.Where(x => x.Key == CmsConstants.Widgets.page_type_definition).Select(x => (string)x.Value).FirstOrDefault();
            PageTypeDefinition pageTypeDef = null;

            if (documentTypeId == null)
            {
                pageTypeDef = new PageTypeDefinition();
                //throw new InvalidOperationException("missing documentTypeId");
            }
            else
            {
                pageTypeDef = _themeEntityDefinitionProvider.GetPageTypeDefinition(documentTypeId);
            }
            if (pageTypeDef == null)
            {
                throw new InvalidOperationException("unknonw pageTypeDefinition " + documentTypeId);
            }


            var d = AutoMapper.Mapper.Map<Mozu.Content.Contracts.Document>(doc);

            d.Name = string.IsNullOrEmpty(d.Name) ? Guid.NewGuid().ToString() : d.Name;
            d.DocumentType = string.IsNullOrEmpty(d.DocumentType) ? pageTypeDef.DocumentType : d.DocumentType;

            if (string.IsNullOrEmpty((string)d.Get(CmsConstants.Documents.template)))
            {
                d.Set(CmsConstants.Documents.template, pageTypeDef.Template);
            }



            d.DocumentListName = string.IsNullOrEmpty(d.DocumentListName) ? CmsConstants.Documents.default_collection_name : d.DocumentListName;

            if (pageTypeDef.Widgets != null)
            {
                var widgetPropVal = Newtonsoft.Json.JsonConvert.SerializeObject(pageTypeDef.Widgets);
                d.Set(CmsConstants.Documents.widget_prop, widgetPropVal);
            }


            if (pageTypeDef.Properties != null)
            {
                foreach (var kvp in pageTypeDef.Properties)
                {
                    if (string.IsNullOrEmpty((string)d.Get(kvp.Key)))
                    {
                        object valueToSet = null;
                        switch (kvp.Value.Type)
                        {
                            case JTokenType.Array:
                                {
                                    valueToSet = kvp.Value.ToObject<object[]>();
                                    break;
                                }
                            case JTokenType.Object:
                                {
                                    valueToSet = kvp.Value.ToString();
                                    break;
                                }
                            default:
                                {
                                    var jval = kvp.Value as JValue;
                                    if (jval != null)
                                    {
                                        valueToSet = jval.Value;
                                    }
                                    break;
                                }

                        }

                        if (valueToSet != null)
                        {
                            d.Set(kvp.Key, valueToSet);
                        }

                    }
                }
            }

            //tbd get this shit out of here

            //if (documentTypeId == "post")
            //{
            //    string folderPath = DateTime.Now.ToString("MM-yyyy");
            //    var res = _folderRepo.GetByPath("blogs", folderPath).Result.ReadAsSync();

            //    if (res != null)
            //    {
            //        d.FolderId = res.Id;
            //    }
            //    else
            //    {
            //        var folder = _folderRepo.Create("blogs", new DC.Folder() { Name = folderPath, DocumentListName = "blogs" }).Result.ReadAsSync();
            //        d.FolderId = folder.Id;
            //    }



            //}

            var task = _docRepo.CreateDocument( d.DocumentListName, d);
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

        public Task<ServiceClientResponse<DC.Document>> UpdateInternal(AVM.Document doc)
        {
            if (doc.DocumentId.StartsWith("new"))
            {
                //todo: clean up create sync.
                return null;
            }

            var d = _docRepo.GetDocument( documentListName : doc.DocumentListName, documentId : doc.DocumentId ).Result.ReadAsSync();
            // d.PublishState = CmsConstants.Documents.doc_state_active;
            foreach (var item in doc.Items)
            {
                
                var prop = d.Properties.FirstOrDefault(x => string.Equals(x.PropertyType, item.Key, StringComparison.OrdinalIgnoreCase));


                if (prop == null)
                {

                    try
                    {
                        var cProp = ToPropertyValue(item);
                        d.Properties.Add(cProp);
                    }
                    catch
                    {
                    }

                }
                else
                {
                    ToPropertyValue(item, prop);
                    prop.Value = item.Value;
                }
            }

            return _docRepo.UpdateDocument(doc.DocumentListName, doc.DocumentId, d);
        }

        private DC.PropertyValue ToPropertyValue(AVM.DocumentProperty inProperty, DC.PropertyValue outProperty = null)
        {
            var propType = _cmsTypeHelper.GetPropertyType(inProperty.Key);//.GetDocumentType (doc.DocumentType).PropertyTypes.FirstOrDefault(x => string.Equals(x.Name, p.Key, StringComparison.OrdinalIgnoreCase));
            if (propType == null)
            {
                throw new Exception("unknown property" + inProperty.Key);
                //todo: throw fault or warning.....
                //continue;
            }
            if (outProperty == null)
            {
                outProperty = new DC.PropertyValue()
                {
                    PropertyType = inProperty.Key,
                    Value = inProperty.Value
                };
            }
            else
            {
                outProperty.Value = inProperty.Value;
            }

            //todo: value type validation and or conversion...
            if (propType.PropertyValueType.StorageType == "integer")
            {
                if (!(outProperty.Value is int))
                {
                    outProperty.Value = Convert.ToInt32(outProperty.Value);
                }
            }
            if (propType.IsMultiValued.Value)
            {

                if (!(outProperty.Value is System.Collections.IList))
                {
                    outProperty.Value = new object[] { outProperty.Value };
                }


            }
            return outProperty;
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

        public Task<ServiceClientResponse<DC.Document>> Update2(AVM.Document doc)
        {
            return UpdateInternal( doc );

        }

        public Task<ServiceClientResponse<DC.Document>> Update2(DC.Document doc)
        {
            return _docRepo.UpdateDocument(doc.DocumentListName, doc.Id, doc);
        }

        public Task<ServiceClientResponse<DC.Document>> Create2(AVM.Document doc)
        {
            return CreateInternal( doc );
        }

        public Task<ServiceClientResponse<DC.Document>> RawCreate2(DC.Document doc)
        {
            return _docRepo.CreateDocument(doc.DocumentListName, doc
                //,publishState:"latest"
                );
        }

        public Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(DC.Document doc)
        {
            return Delete2(doc.DocumentListName, doc.Id);
        }

        public Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(string documentListName, string documentId)
        {
            return _docRepo.DeleteDocument(documentListName, documentId)
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
