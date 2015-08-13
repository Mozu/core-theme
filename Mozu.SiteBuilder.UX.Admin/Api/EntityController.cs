using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Runtime.CompilerServices;
using System.Threading.Tasks;
using System.Web;
using AutoMapper;
using MongoDB.Bson;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.MZDB.Contracts;
using Mozu.MZDB.Contracts.Clients;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Contexts;
using Mozu.SiteBuilder.Mvc.Themes;
using Mozu.SiteBuilder.Mvc.ViewEngine;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

using DC = Mozu.Content.Contracts;
using CMS = Mozu.Content.Contracts;
using AVM = Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Constants = Mozu.Core.Messaging.Contracts.Constants;
using Mozu.Core;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/entities", SuppressDescriptorGeneration = true)]
    public class EntityControllerController : BaseController
    {
        private const string MZDB_LIST_PROPERTY = "EntityListName";
        private const string MZDB_DOCUMENT_ID_PROPERTY = "Id";
        private const string CMS_LIST_PROPERTY = "listFQN";
        private const string CMS_DOCUMENT_ID_PROPERTY = "Id";
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private readonly IEntityListsWebApiClient _entityListsWebApiClient;
        private readonly IDocumentTypeWebApiClient _documentTypeWebApiClient;
        private readonly IThemeContentRetriever _contentRetriever;
        private readonly bool shouldGetInactiveDocumnents;
        //   private const string TBD = "duno";
        public EntityControllerController(IDocumentListWebApiClient documentListWebApiClient, IEntityListsWebApiClient entityListsWebApiClient, IDocumentTypeWebApiClient documentTypeWebApiClient, IThemeContentRetriever contentRetriever, ISiteBuilderApiContext sbApiContext)

        {
            _documentListWebApiClient = documentListWebApiClient;
            _entityListsWebApiClient = entityListsWebApiClient;
            _documentTypeWebApiClient = documentTypeWebApiClient;
            _contentRetriever = contentRetriever;
            shouldGetInactiveDocumnents = sbApiContext.UserClaims != null && sbApiContext.UserClaims.ScopeType.EqualsIgnoreCase(UserScopeType.Tenant.ToStringQuickly());
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<object>>> Delete(List<JObject> documents)
        {
            if (documents.First().Value<string>("entityType") == "cms")
            {
                List<Task<ServiceClientResponse<StreamContent>>> tasks = documents.Select(doc =>
                    _documentListWebApiClient.DeleteDocument(documentListName: (string)doc.GetValue(CMS_LIST_PROPERTY, StringComparison.OrdinalIgnoreCase), documentId: (string)doc.GetValue(CMS_DOCUMENT_ID_PROPERTY, StringComparison.OrdinalIgnoreCase))
                    ).ToList();


                await Task.WhenAll(tasks);
                EnumerableExtensions.Each(tasks, x =>
                {
                    if (x.Result.HasException)
                    {
                        throw x.Result.ReadException();
                    }
                });
            }
            else if (documents.First().Value<string>("entityType") == "mzdb")
            {
                List<Task<ServiceClientResponse<StreamContent>>> tasks = documents.Select(doc =>
                    _entityListsWebApiClient.DeleteEntity(entityListFullName: (string) doc.GetValue("NameSpace", StringComparison.OrdinalIgnoreCase) + "." + (string) doc.GetValue(MZDB_LIST_PROPERTY, StringComparison.OrdinalIgnoreCase), id: (string) doc.GetValue(MZDB_DOCUMENT_ID_PROPERTY, StringComparison.OrdinalIgnoreCase))
                    ).ToList();


                await Task.WhenAll(tasks);
                EnumerableExtensions.Each(tasks, x =>
                {
                    if (x.Result.HasException)
                    {
                        throw x.Result.ReadException();
                    }
                });
            }
            else
            {
                throw new InvalidOperationException("unknonw entityType [" + documents.First().Value<string>("entityType") + "]");
            }


            return EmptyList2<object>();
        }


        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Object>>> Create(List<JObject> documents)
        {
            if (documents.First().Value<string>("entityType") == "cms")
            {
                List<Task<ServiceClientResponse<DC.Document>>> tasks = documents.Select(doc =>
                {
                    var cmsDoc = Mapper.Map<DC.Document>(doc);
                    return _documentListWebApiClient.CreateDocument(documentListName: cmsDoc.ListFQN, document: cmsDoc);
                }).ToList();

                await Task.WhenAll(tasks);

                return List2(tasks.Select(x => (object) x.Result.ReadAsSync()).ToList());
            }
            else if (documents.First().Value<string>("entityType") == "mzdb")
            {
                List<Task<ServiceClientResponse<JObject>>> tasks = documents.Select(doc =>
                {
                    var entity = doc.ToObject<EntityContainer>();
                    var fullName = entity.ListFullName ?? (string) doc.Value<string>("listFQN");
                    return _entityListsWebApiClient.InsertEntity(entityListFullName: fullName, item: entity.Item);
                }).ToList();

                await Task.WhenAll(tasks);

                return List2(tasks.Select(x => (object) x.Result.ReadAsSync()).ToList());
            }
            else
            {
                throw new InvalidOperationException("unknonw entityType [" + documents.First().Value<string>("entityType") + "]");
            }
        }


        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<Object>>> Update(List<JObject> documents)
        {
            if (documents.First().Value<string>("entityType") == "cms")
            {
                List<Task<ServiceClientResponse<DC.Document>>> tasks = documents.Select(doc =>
                {
                    var cmsDoc = Mapper.Map<JObject,DC.Document>(doc);
                    return _documentListWebApiClient.UpdateDocument(documentListName: cmsDoc.ListFQN, documentId: cmsDoc.Id, document: cmsDoc);
                }).ToList();

                await Task.WhenAll(tasks);

                return List2(tasks.Select(x => (object) x.Result.ReadAsSync()).ToList());
            }
            else if (documents.First().Value<string>("entityType") == "mzdb")
            {
              
                List<Task<ServiceClientResponse<JObject>>> tasks = documents.Select(doc =>
                {
                    
                    var entity = doc.ToObject<EntityContainer>();
                    var listFqn = entity.ListFullName ?? doc.Value<string>("listFQN");
                    return _entityListsWebApiClient.UpdateEntity(entityListFullName: listFqn, item: entity.Item, id: entity.Id);
                }).ToList();

                await Task.WhenAll(tasks);

                return List2(tasks.Select(x => (object) x.Result.ReadAsSync()).ToList());
            }
            else
            {
                throw new InvalidOperationException("unknonw entityType [" + documents.First().Value<string>("entityType") + "]");
            }
        }


        [HttpGetRoute(UriTemplate = "documentTypes/read")]
        public async Task<Response<List<CMS.DocumentType>>> ReadDocumentTypes(PagingParamaters pagingParams, FilterCollection extFilter, string entityType, string list, string view = null)
        {
            var docTYpes = (await _documentTypeWebApiClient.CloneWithoutUserClaims().GetDocumentTypes(pageSize:200)).ReadAsSync();
            return this.List2(docTYpes.Items, docTYpes.TotalCount);
        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<JObject>>> Read(PagingParamaters pagingParams, FilterCollection extFilter, string entityType, string list, string view = null)
        {
            if (view != null && view.IndexOf("-fake")>-1)
            {
                view = null;
            }
            if (entityType == "cms")
            {
                string sortBy = null;
                string filter = null;

                DC.DocumentCollection res = null;
                if (!string.IsNullOrEmpty(pagingParams.id))
                {

                    var doc = (await _documentListWebApiClient.GetDocument(documentListName: list, documentId: pagingParams.id, includeInactive: shouldGetInactiveDocumnents)).ReadAsSync();
                    res = new DC.DocumentCollection()
                          {
                              Items = new List<DC.Document>() {doc},
                              TotalCount = 1
                          };
                }
                else if (string.IsNullOrEmpty(view))
                {
                    res = (await _documentListWebApiClient.GetDocuments(documentListName: list, pageSize: pagingParams.pageSize, filter: filter, startIndex: pagingParams.startIndex, sortBy: sortBy, includeInactive: shouldGetInactiveDocumnents)).ReadAsSync();
                }
                else
                {
                    res = (await _documentListWebApiClient.GetViewDocuments(documentListName: list, pageSize: pagingParams.pageSize, filter: filter, startIndex: pagingParams.startIndex, sortBy: sortBy, viewName: view, includeInactive: shouldGetInactiveDocumnents)).ReadAsSync();
                    
                }

                

                return List2(res.Items.Select(x =>
                {
                    JObject j = Mapper.Map<JObject>(x); 
                    j["entityType"] = "cms";
                    return j;
                }).ToList(), res.TotalCount);
            }
            else
            {
                string sortBy = null;
                string filter = null;
                EntityContainerCollection res = null;
                if (!string.IsNullOrEmpty(pagingParams.id))
                    {
                        var doc = (await _entityListsWebApiClient.GetEntityContainer(id: pagingParams.id, entityListFullName: list)).ReadAsSync();
                        res = new EntityContainerCollection()
                        {
                            Items = new List<EntityContainer>() { doc },
                            TotalCount = 1
                        };
                    }
                else if (string.IsNullOrEmpty(view))
                {
                    res = (await _entityListsWebApiClient.GetEntityContainers(entityListFullName: list, pageSize: pagingParams.pageSize, filter: filter, startIndex: pagingParams.startIndex, sortBy: sortBy)).ReadAsSync();
                }
                else
                {
                    res = (await _entityListsWebApiClient.GetViewEntityContainers(viewName: view, entityListFullName: list, pageSize: pagingParams.pageSize, filter: filter, startIndex: pagingParams.startIndex)).ReadAsSync();
                }


                return List2(res.Items.Select(x =>
                {
              
                    JObject j = JObject.FromObject(x, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

                    j["listFQN"] = x.ListFullName;
                    j["entityType"] = "mzdb";
                    return j;
                }).ToList(), res.TotalCount);
            }
        }



        [HttpGetRoute(UriTemplate = "lists/read")]
        public async Task<Response<List<JObject>>> ReadLists (PagingParamaters pagingParams, FilterCollection extFilter, string entityType )
        {


            if (entityType == "cms")
            {
                DC.DocumentListCollection res = (await _documentListWebApiClient.GetDocumentLists(pageSize: pagingParams.pageSize, startIndex: pagingParams.startIndex)).ReadAsSync();

                var items = res.Items.Select(x => JObject.FromObject(x, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings())))
                    .Select(x =>
                    {
                        x["entityType"] = "cms";
                        x["uniqueId"] = x.Value<string>("entityType") + "-" + x.Value<string>("listFQN");
                        return x;

                    }).ToList();
                return this.List2(items, res.TotalCount);
            }
            else if (entityType == "mzdb")
            {
                EntityListCollection res = (await _entityListsWebApiClient.GetEntityLists(pageSize: pagingParams.pageSize, startIndex: pagingParams.startIndex)).ReadAsSync();
                var items = res.Items.Select(x => JObject.FromObject(x, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings())))
                    .Select(x =>
                    {
                        x["entityType"] = "mzdb";
                        x["listFQN"] = string.IsNullOrEmpty(x.Value<string>("nameSpace")) ? x.Value<string>("name") : x.Value<string>("name") + "@" + x.Value<string>("nameSpace");
                        x["uniqueId"] = x.Value<string>("entityType") + "-" + x.Value<string>("listFQN");
                        return x;

                    }).ToList();
                return this.List2(items, res.TotalCount);
            }
            throw new NotImplementedException("unknown entity type-"+ entityType);

        }


        [HttpGetRoute(UriTemplate = "lists/tree")]
        public async Task<Response<List<Node>>> ReadListsTree(PagingParamaters pagingParams, FilterCollection extFilter, string entityType = null, string view = null, string usages = null)
        {
            var nodes = new List<Node>();
            var usagesArray = usages == null ? null : usages.Split(new char[]{','}, StringSplitOptions.RemoveEmptyEntries);
            var usageFilter = new Func<IEnumerable<string>, bool>(listUsages =>
            {
                if (usagesArray == null || usagesArray.Length == 0)
                {
                    return true;
                }
                if (listUsages == null || listUsages.Count() == 0)
                {
                    return false;
                }
                return listUsages.Any(u => usagesArray.Any(v => u.Equals(v, StringComparison.OrdinalIgnoreCase)));
            });


            if (this.HttpContext.Request.Cookies["debugext"] != null && string.Equals(this.HttpContext.Request.Cookies["debugext"].Value, "true", StringComparison.InvariantCultureIgnoreCase))
            {
                usageFilter = new Func<IEnumerable<string>, bool>(listUsages => true);
            }


            if (entityType == "cms" || string.IsNullOrEmpty(entityType))
            {
                var cms = new Node() {Text = "content", Id = "cms", Expanded = true, Items = new List<Node>()};
                nodes.Add(cms);

                string sortBy = null;
                string filter = null;

                DC.DocumentListCollection res = (await _documentListWebApiClient.GetDocumentLists(pageSize: pagingParams.pageSize, startIndex: pagingParams.startIndex)).ReadAsSync();
                if (res.Items != null)
                {
                    res.Items.Where(x => usageFilter(x.Usages)).ToList().ForEach(x => cms.Items.Add(new Node() {Text = x.Name, Id = "cms_" + x.Name, MetaData = AddViews(x), Leaf = true}));
                }

            }
            if (entityType == "mzdb" || string.IsNullOrEmpty(entityType))
            {
                var mzdb = new Node() {Text = "entities", Id = "mzdb", Expanded = true, Items = new List<Node>()};
                nodes.Add(mzdb);
                string sortBy = null;
                string filter = null;
                EntityListCollection res = (await _entityListsWebApiClient.GetEntityLists(pageSize: pagingParams.pageSize, startIndex: pagingParams.startIndex)).ReadAsSync();
                if (res.Items != null)
                {
                    mzdb.Items.AddRange(res.Items
                        .Where(x=> usageFilter(x.Usages ))
                        .Where(x =>
                    {
                        switch (x.ContextLevel)
                        {
                            case "Tenant":
                            {
                                return true;
                            }
                            case "MasterCatalog":
                            {
                                return this.SbApiContext.MasterCatalogId.HasValue;
                            }
                            case "Catalog":
                            {
                                return this.SbApiContext.CatalogId.HasValue;
                            }
                            case "Site":
                            {
                                return this.SbApiContext.SiteId.HasValue;
                            }
                        }
                        throw new HttpUnhandledException("unknown context type ["+ x.ContextLevel +"] on entity list "+ x.Name);
                    }).Select(x => new Node() {Text = x.Name, Id = "mzdb_" + x.NameSpace + "." + x.Name, MetaData = AddViews(x), Leaf = true}));

                    //res.Items.ForEach(x => mzdb.Items.Add(new Node() {Text = x.Name, Id = "mzdb_" + x.NameSpace + "." + x.Name, MetaData = AddViews(x), Leaf = true}));
                }
            }
            return List2(nodes);
        }

        private JObject AddViews(EntityList x)
        {
           

           
            JObject ret = JObject.FromObject(x, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));
            ret["listFQN"] = string.IsNullOrEmpty(x.NameSpace) ? x.Name : x.Name + "@" + x.NameSpace;
            ret["entityType"] = "mzdb";
            // ret.Add("views", JArray.FromObject(views, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings())));
            return ret;
        }

        private JObject AddViews(DC.DocumentList x)
        {
            //var views = new List<DC.View>()
            //            {
                            
            //                new DC.View()
            //                {
            //                    Name = "-fake",
            //                    Usages = new List<string>() {"entityManager"},
            //                    Fields = new List<DC.ViewFields>()
            //                             {
            //                                 new DC.ViewFields()
            //                                 {
            //                                     IsQueryable = true,
            //                                     IsSortable = true,
            //                                     Name = "link_title",
            //                                     Type = "string"
            //                                 },
            //                                 new DC.ViewFields()
            //                                 {
            //                                     IsQueryable = true,
            //                                     IsSortable = true,
            //                                     Name = "meta_title",
            //                                     Type = "string"
            //                                 }
            //                             },
            //                    Security = "public"
            //                }
            //            };
            //if (x.Views == null || x.Views.Count == 0)
            //{
            //    x.Views = views;
            //}
            JObject ret = JObject.FromObject(x, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));
            ret["entityType"] = "cms";
            //ret["listFQN"] = x.Name;
            return ret;
        }


        [HttpGetRoute(UriTemplate = "editors/read")]
        public async Task<Response<List<EditorResult>>> ReadEditor()

        {
            ServiceClientResponse<DC.DocumentCollection> cmsEditorsTask = await _documentListWebApiClient.GetDocuments(documentListName: "entityEditors@mozu", targetContextLevel: TargetContextLevelType.Tenant, pageSize: 600, startIndex: 0, includeInactive: shouldGetInactiveDocumnents);

            List<EditorResult> editors = new List<EditorResult>();
            //List<EditorResult> editors = Directory.GetFiles(HttpRuntime.AppDomainAppPath + @"\Tests\Mocks\Entities\Editors\").Select(js => new EditorResult
            //                                                                                                                               {
            //                                                                                                                                   Id = Path.GetFileNameWithoutExtension(js).ToLower(),
            //                                                                                                                                   DocumentTypes = new List<string>()
            //                                                                                                                                                   {
            //                                                                                                                                                       Path.GetFileNameWithoutExtension(js).ToLower()
            //                                                                                                                                                   },
            //                                                                                                                                   EntityLists = new List<string>()
            //                                                                                                                                                 {
            //                                                                                                                                                     Path.GetFileNameWithoutExtension(js).ToLower()
            //                                                                                                                                                 },
            //                                                                                                                                   DocumentLists = new List<string>()
            //                                                                                                                                                   {
            //                                                                                                                                                       Path.GetFileNameWithoutExtension(js).ToLower()
            //                                                                                                                                                   },
            //                                                                                                                                   Priority = 0,
            //                                                                                                                                   Code = File.ReadAllText(js)
            //                                                                                                                               }).ToList();

            if (!cmsEditorsTask.HasException)
            {
                IEnumerable<EditorResult> cmsEditors = cmsEditorsTask.ReadAsSync().Items.Select(x =>
                {
                    try
                    {
                        var edit = x.Properties.ToObject<EditorResult>();
                        edit.Id = x.Id;
                        return edit;
                    }
                    catch
                    {
                        return null;
                    }

                }).Where(x => x != null);
                editors = editors.Concat(cmsEditors).ToList();
            }

            if (this.SbApiContext.SiteId.HasValue)
            {
                var siteContext = this.Request.Resolve<SiteContext>();
                var vpp =this.Request.Resolve<IMozuVirtualPathProvider>(); 
                await siteContext.Init();
                var theme = this.Request.Resolve<SiteContext>().Theme;
                if (theme.Editors != null && theme.Editors.Count > 0)
                {
                    editors = editors.Concat(theme.Editors.Select(x =>
                    {
                        var jsFile = vpp.GetThemeFileInfo("admin\\editors\\" + x.Path, true);
                        //var jsFile = theme.FileListing.GetFileInfo("admin\\editors\\"+ x.Path, true);
                        if (jsFile != null)
                        {
                            return new EditorResult()
                                   {
                                       Id = "theme_" + x.Id,
                                       DocumentLists = x.DocumentLists,
                                       EntityLists = x.EntityLists,
                                       DocumentTypes = x.DocumentTypes,
                                       Priority = x.Priority,
                                       Code = _contentRetriever.GetContent(jsFile)
                                   };
                        }
                        return null;
                    }).Where(x => x != null)).ToList();
                }
            }


            return List2(editors);
        }

        public class EditorResult
        {
            public string Id { get; set; }

            public string Code { get; set; }
            public List<string> DocumentTypes { get; set; }
            public List<string> EntityLists { get; set; }
            public List<string> DocumentLists { get; set; }
            public decimal? Priority { get; set; }
        }

        public class Node
        {
            public string Text { get; set; }
            public string Id { get; set; }
            public JObject MetaData { get; set; }

            public List<Node> Items { get; set; }
            public bool Leaf { get; set; }
            public bool Expanded { get; set; }
        }
    }
}

//namespace Mozu.Content.Contracts.Prototype
//{

//    /// <summary>
//    /// shared betweeen cms / mzdb2.  
//    /// </summary>
//    public class View
//    {

//        /// <summary>
//        /// id of the view
//        /// </summary>
//        public string Name { get; set; }

//        /// <summary>
//        /// lets not do this
//        /// </summary>
//        public string NameSpace { get; set; }


//        /// <summary>
//        /// tag as use in admin or not ... maybe other's
//        /// </summary>
//        public string[] Usages { get; set; }


//        /// <summary>
//        /// untyped extensibility place
//        /// </summary>
//        public Object MetaData { get; set; }

//        /// <summary>
//        /// less restrictive than collectoin/list security.
//        /// </summary>
//        public SecurityStrategy Security { get; set; }


//        /// <summary>
//        /// filter is anded with any fiilter used in the get </summary>
//        public string Filter { get; set; }
//        /// <summary>
//        /// sort isn't anded cause that would be dumb
//        /// </summary>
//        public string DefaultSort { get; set; }

//        /// <summary>
//        /// list of fields returned by the get of the view 
//        /// </summary>
//        public List<ViewFields> Fields { get; set; }


//    }


//    /// <summary>
//    /// shared by cms/mzdb.
//    /// </summary>
//    public class ViewFields
//    {
//        /// <summary>
//        /// The property Name/Key of the items property value
//        /// </summary>
//        public string Name { get; set; }


//        /// <summary>
//        /// auto int string float date bool
//        /// </summary>
//        public ViewFieldTYpe Type { get; set; }


//        /// <summary>
//        /// the dot notation that links to the source document property eg foo for foo first level or foo.bing.bang for deeper property.  
//        /// Need to describe how it aggregates if an interior property is a collection eg  post.relatedproducts.code

//        /// </summary>
//        public string Target { get; set; }

//        /// <summary>
//        /// need to discus how this might work.  should querys to the view be orientanted around the view or the document.
//        /// Eg where productCodes='sam' vs post.relatedproducts.code='sam'
//        /// </summary>
//        public bool IsQueryable { get; set; }


//        public bool IsSortable { get; set; }


//    }


//    public class DocumentTypeFQN
//    {
//        //public string Id { get; set; }

//        /// <summary>
//        /// unique name
//        /// </summary>
//        public string Name { get; set; }

//        /// <summary>
//        /// the scope of the documenttype
//        /// </summary>
//        public string DocumentTypeScope { get; set; }

//        /// <summary>
//        /// Friendly name localized to default(??) language
//        /// </summary>
//        public string DisplayName { get; set; }

//        public List<LocalizedString> LocalizedDisplayNames { get; set; }

//        /// <summary>
//        /// Description localized to default(??) language
//        /// </summary>
//        public string Description { get; set; }

//        public List<LocalizedString> LocalizedDescriptions { get; set; }

//        public string ParentTypeName { get; set; }

//        public List<PropertyType> PropertyTypes { get; set; }


//        /********************
//        *  CHANGE           *
//        ********************/


//        public List<string> Editors { get; set; }


//        public Object MetaData { get; set; }

//        /*********************
//         *  EMD CHANGE       *
//        *********************/


//    }

//    public enum SecurityStrategy
//    {
//        Public,
//        Admin,
//        Owner
//    }


//    public enum ViewFieldTYpe
//    {

//        String,
//        Boolean,
//        Int,
//        Float,
//        DateTime,
//        Any
//    }


//    public class DocumentList
//    {
//        public string Name { get; set; }

//        public List<string> DocumentTypes { get; set; }

//        public bool? SupportsPublishing { get; set; }

//        public bool? EnablePublishing { get; set; }


//        /*********************
//        *  CHANGE           *
//        ********************/

//        public Scopes Scope { get; set; }

//        public List<View> Views { get; set; }

//        public Object MetaData { get; set; }

//        public SecurityStrategy Security { get; set; }

//        public List<string> Usages { get; set; }

//        /*********************
//         *  EMD CHANGE       *
//        *********************/


//    }

//    public class PropertyType
//    {

//        public PropertyType()
//        {
//            LocalizedDescriptions = new List<LocalizedString>();
//            LocalizedDisplayNames = new List<LocalizedString>();
//        }

//        /// <summary>
//        /// unique name
//        /// </summary>
//        public string Name { get; set; }

//        /// <summary>
//        /// Friendly name localized to current language locale or default
//        /// </summary>
//        public string DisplayName { get; set; }

//        public string Description { get; set; }

//        public List<LocalizedString> LocalizedDisplayNames { get; set; }
//        public List<LocalizedString> LocalizedDescriptions { get; set; }

//        public string DisplayTemplate { get; set; }

//        public string EditTemplate { get; set; }

//        public PropertyValueType PropertyValueType { get; set; }

//        public string Regex { get; set; }
//        /*public int MaxValue { get; set; }
//        public int MinValue { get; set; }
//        public string[] AllowedValues { get; set; }*/

//        //public bool? IsInherited { get; set; }
//        public bool? IsQueryable { get; set; }
//        public bool? IsSortable { get; set; }
//        public bool? IsMultiValued { get; set; }
//        public bool? IsAggregatable { get; set; }
//        public bool IsRequired { get; set; }


//        /********************
//        *  CHANGE           *
//        ********************/
//        public Object MetaData { get; set; }
//        /*********************
//         *  EMD CHANGE       *
//        *********************/

//    }


//    public enum Scopes
//    {
//        Tenant,
//        MasterCataglog,
//        Catalog,
//        Site
//    }


//    public class Document
//    {

//        public string Id { get; set; }


//        public string Name { get; set; }


//        public string Extension { get; set; }

//        //
//        //public string Path { get; set; }


//        public string DocumentTypeFQN { get; set; }

//        //
//        //public string FolderId { get; set; }


//        public string listFQN { get; set; }


//        public long? ContentLength { get; set; }


//        public string ContentMimeType { get; set; }


//        public DateTime? ContentUpdateDate { get; set; }


//        public string PublishState { get; set; }


//        /*********************
//         *  CHANGE           *
//         ********************/


//        public Object Properties { get; set; }


//        //
//        //public List<PropertyValue> Properties { get; set; }

//        /*********************
//         *  EMD CHANGE       *
//        *********************/

//        //TODO: jr -- rename to AuditInfo

//        public DateTime? InsertDate { get; set; }


//        public DateTime? UpdateDate { get; set; }
//    }


//}