using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Content.Contracts.Clients;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using Newtonsoft.Json.Linq;
using AVM = Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using DC = Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.Mvc.CMS
{


    /// <summary>
    /// TODO: Update summary.
    /// </summary>
    public class CmsServiceWrapper : ICmsServiceWrapper
    {
        ISiteBuilderApiContext _apiContext;
        IDocumentWebApiClient _docRepo;
        ICmsTypeHelper _cmsTypeHelper;
        IFolderWebApiClient _folderRepo;
        IFacetsWebApiClient _facetsRepo;
        private readonly IThemeEntityDefinitionProvider _themeEntityDefinitionProvider;

        public CmsServiceWrapper(IDocumentWebApiClient docRepo,
            ISiteBuilderApiContext apiContext,
            ICmsTypeHelper cmsTypeHelper,
            IFolderWebApiClient folderRepo,
            IFacetsWebApiClient facetsRepo,
            IThemeEntityDefinitionProvider themeEntityDefinitionProvider
            )
        {
            _apiContext = apiContext;
            _facetsRepo = facetsRepo;
            _themeEntityDefinitionProvider = themeEntityDefinitionProvider;
            _folderRepo = folderRepo;
            _docRepo = docRepo;
            _cmsTypeHelper = cmsTypeHelper;
        }

        [Obsolete]
        public IEnumerable<Task<Tuple<bool,ServiceClientResponse<StreamContent>>>> Delete(IEnumerable<AVM.Document> docs)
        {
            //ServiceClientExtensions;

            return docs.Select(doc => _docRepo.Delete(doc.CollectionName, doc.DocumentId, null)
                .ContinueWith((x) =>
                {
                    var resp = x.Result;
                    return new Tuple<bool, ServiceClientResponse<StreamContent>>(resp.ResponseMessage.IsSuccessStatusCode, resp);
                }));
            

        }


        [Obsolete]
        public IEnumerable<Task< ServiceClientResponse<DC.Document> >> Create(IEnumerable<AVM.Document> docs)
        {
            var response = new List<AVM.Document>();

            

            var  tasks  = new List<Task<ServiceClientResponse<DC.Document>>>();

            foreach (var doc in docs)
            {
                doc.Items = doc.Items ?? new List<AVM.DocumentProperty>();

                var documentTypeId = doc.Items.Where(x => x.Key == CmsConstants.Widgets.page_type_definition).Select(x => (string)x.Value).FirstOrDefault();

                if (documentTypeId == null)
                {
                    throw new InvalidOperationException("missing documentTypeId");
                }

                var pageTypeDef = _themeEntityDefinitionProvider.GetPageTypeDefinition(documentTypeId);



                var d = AutoMapper.Mapper.Map<Mozu.Content.Contracts.Document>(doc);
               
                d.Name = string.IsNullOrEmpty(d.Name) ? Guid.NewGuid().ToString() : d.Name;
               d.DocumentType = string.IsNullOrEmpty( d.DocumentType)? pageTypeDef.DocumentType:d.DocumentType;

                if (string.IsNullOrEmpty((string) d.Get(CmsConstants.Documents.template)))
                {
                    d.Set(CmsConstants.Documents.template, pageTypeDef.Template);
                }



                d.DocumentListName = string.IsNullOrEmpty(d.DocumentListName) ? CmsConstants.Documents.default_collection_name : d.DocumentListName;

                if (pageTypeDef.Widgets != null)
                {
                    var widgetPropVal= Newtonsoft.Json.JsonConvert.SerializeObject(pageTypeDef.Widgets);
                    d.Set(CmsConstants.Documents.widget_prop, widgetPropVal);
                }


                if (pageTypeDef.Properties != null)
                {
                    foreach (var kvp in pageTypeDef.Properties)
                    {
                        if (string.IsNullOrEmpty((string) d.Get(kvp.Key)))
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

                if (documentTypeId == "post")
                {
                    string folderPath = DateTime.Now.ToString("MM-yyyy");
                    var res = _folderRepo.GetByPath("blogs", folderPath).Result.ReadAsSync();

                    if (res != null )
                    {
                        d.FolderId = res.Id;
                    }
                    else
                    {
                        var folder = _folderRepo.Create("blogs", new DC.Folder() { Name = folderPath, DocumentListName = "blogs" }).Result.ReadAsSync();
                        d.FolderId = folder.Id;
                    }

                    

                }




                var task = _docRepo.Create(d.DocumentListName , d);
                tasks.Add(task);




            }
            return tasks;

            
        }

        [Obsolete]
        public Task<Tuple<DC.FolderTree, ServiceClientResponse<DC.FolderTree>>> GetFolderTree(string collection, string parentId = null, int? levels = null)
        {
            return _folderRepo.GetFolderTree(collection, parentId, levels)
                .ContinueWith ( x=>  
                    {
                        if ( x.Result.ResponseMessage .IsSuccessStatusCode )
                        {
                            return new Tuple<DC.FolderTree,ServiceClientResponse<DC.FolderTree>>( x.Result.ReadAsSync (), x.Result  );
                        }
                        else{
                            return new Tuple<DC.FolderTree, ServiceClientResponse<DC.FolderTree>>(null, x.Result );
                        }
                    });
        }

        [Obsolete]
        public IEnumerable<Task<DC.Document>> Update(List<AVM.Document> docs)
        {
            List<Task<DC.Document>> tasks = new List<Task<DC.Document>>();
            foreach (var doc in docs)
            {

                if (doc.DocumentId.StartsWith("new"))
                {
                    //todo: clean up create sync.
                    continue;
                }
                var d = _docRepo.Get(doc.CollectionName, doc.DocumentId, null, "draft").Result.ReadAsSync();
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
                
                //hack for roeder....
                //d.Properties.ForEach(x => ToPropertyValue(new AVM.DocumentProperty() { Key = x.PropertyType, Value = x.Value }, x));

                tasks.Add(_docRepo.Update(doc.CollectionName, doc.DocumentId , d).ContinueWith < DC.Document>(x => x.Result.ReadAsSync ()));
            }
            return tasks;

        }

        [Obsolete]
        public IEnumerable<Task<Mozu.Content.Contracts.Document>> Update(List<DC.Document> docs)
        {
            List<Task<DC.Document>> tasks = new List<Task<DC.Document>>();
            foreach (var doc in docs)
            {
                tasks.Add(Update(doc));
            }

            return tasks;
        }

        [Obsolete]
        public Task<Mozu.Content.Contracts.Document> Update(DC.Document doc)
        {
            return _docRepo.Update(doc.DocumentListName, doc.Id, doc).ContinueWith<DC.Document>(x => x.Result.ReadAsSync());
        }

        [Obsolete]
        public Task<ServiceClientResponse<DC.PagedCollection<DC.Document>>> GetList(CmsListRequest request)
        {
            return _docRepo.List(request.Collection, request.ToFilterString(), null, request.Recurse, request.DocumentStatus ?? "draft", request.ToSortString(), request.PageSize, request.StartIndex);
        }

        [Obsolete]
        public Task <ServiceClientResponse<DC.Document>> GetByPath ( string contentCollection , string name, string folderPath ,string documentState = "draft" )
        {
            return _docRepo.FindByName(contentCollection, name, folderPath, null, documentState).ContinueWith(x =>
                {

                    if (x.Result.ResponseMessage.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        return new ServiceClientResponse<DC.Document>()
                        {
                            HasException = false,
                            ResponseMessage = x.Result.ResponseMessage,
                            ReadAsSync = ()=> null,
                            ReadAsAsync = x.Result.ReadAsAsync 
                        };
                        //return null;
                    }
                   
                    return x.Result;
                });
          
        }

        [Obsolete]
        public bool BypassCache
        {
            get
            {
                var options =((DocumentWebApiClient) _docRepo).Options;
                var dic = (IDictionary<string, object>) options.ExtendedProperties;
                if ( dic == null )
                {
                    return false;
                }
                object val;
                if ( dic.TryGetValue("bypassCache", out val ))
                {
                    return (bool) val;
                }
                return false;
            }
            set
            {
                var options =((DocumentWebApiClient) _docRepo).Options;
                var dic = (IDictionary<string, object>) options.ExtendedProperties;
                if ( dic == null )
                {
                    options.ExtendedProperties = dic= new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);
                }
                dic["bypassCache"] = value;

            }
        }

        [Obsolete]
        public Task<ServiceClientResponse<DC.Document>> Get(string contentCollection, string id , bool activeVersion = false )
        {
            return _docRepo.Get(contentCollection, id, null, activeVersion ? CmsConstants.Documents.doc_state_active : "draft");
        }


        [Obsolete]
        class PropCompare : IEqualityComparer<Models.CMS.Admin.DocumentProperty>
        {

            public static readonly PropCompare Default = new PropCompare();

            public bool Equals(Models.CMS.Admin.DocumentProperty x, Models.CMS.Admin.DocumentProperty y)
            {
                return x.Key == y.Key;
            }

            public int GetHashCode(Models.CMS.Admin.DocumentProperty obj)
            {
                return obj.Key.GetHashCode();
            }
        }

        [Obsolete]
        DC.PropertyValue ToPropertyValue(AVM.DocumentProperty inProperty, DC.PropertyValue outProperty = null)
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
        public Task<ServiceClientResponse<DC.PagedCollection<DC.Document>>> GetList(string contentCollection = null, string filter = null, bool? recurseFolders = null, string status = null, string sortBy = null, int? pageSize = 25, int? startIndex = 0)
        {
            return _docRepo.List(contentCollection, filter, null, recurseFolders, status, sortBy, pageSize, startIndex);
        }

        [Obsolete]
        public Task<ServiceClientResponse<List<DC.Facet>>> GetFacets(string contentCollection,  string propertyName)
        {
            return _facetsRepo.Get(contentCollection,propertyName);
        }

        [Obsolete]
        public Task<ServiceClientResponse<DC.Document>> RawCreate(DC.Document doc)
        {
            return _docRepo.Create(doc.DocumentListName, doc );
        }


        public Task<ServiceClientResponse<DC.PagedCollection<DC.Document>>> GetList2(string contentCollection = null, string filter = null, string sortBy = null, int? pageSize = 25, int? startIndex = 0)
        {
            return _docRepo.List(
                    documentListName: contentCollection, 
                              filter: filter, 
                      responseGroups: null, 
                shouldRecurseFolders: false, 
                              status: _apiContext.CmsDraftState, 
                              sortBy: sortBy, 
                            pageSize: pageSize, 
                          startIndex: startIndex
            );
        }

        public Task<ServiceClientResponse<DC.Document>> GetByPath2(string contentCollection, string name)
        {
            var task = _docRepo.FindByName(
                documentListName: contentCollection,
                    documentName: name,
                      folderPath: null,
                         version: null,
                          status: _apiContext.CmsDraftState
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
            return _docRepo.Get(
                documentListName: contentCollection,
                documentId: id,
                version: null,
                status: _apiContext.CmsDraftState
            );
        }

        public Task<ServiceClientResponse<DC.Document>> Update2(DC.Document doc)
        {
            return _docRepo.Update(doc.DocumentListName, doc.Id, doc);
        }

        public Task<ServiceClientResponse<DC.Document>> Create2(AVM.Document doc)
        {
            #pragma warning disable 612
            return Create( new [] { doc } ).First();
            #pragma warning restore 612
        }

        public Task<ServiceClientResponse<DC.Document>> RawCreate2(DC.Document doc)
        {
            return _docRepo.Create(doc.DocumentListName, doc);
        }

        public Task<Tuple<bool, ServiceClientResponse<StreamContent>>> Delete2(DC.Document doc)
        {
            return _docRepo.Delete(doc.DocumentListName, doc.Id)
                .ContinueWith(t => new Tuple<bool, ServiceClientResponse<StreamContent>>(t.Result.ResponseMessage.IsSuccessStatusCode, t.Result));
        }
    }
}
