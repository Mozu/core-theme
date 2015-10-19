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
using Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers;
using DC = Mozu.Content.Contracts;
using CMS = Mozu.Content.Contracts;
using AVM = Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Constants = Mozu.Core.Messaging.Contracts.Constants;
using Mozu.Core;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Mozu.Core.Collections;
using Mozu.SiteBuilder.Mvc.Extensions;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/entities", SuppressDescriptorGeneration = true)]
    public class EntityControllerController : BaseController
    {
       const string MZDB_LIST_PROPERTY = "EntityListName";
       const string MZDB_DOCUMENT_ID_PROPERTY = "Id";
       const string CMS_LIST_PROPERTY = "listFQN";
       const string CMS_DOCUMENT_ID_PROPERTY = "Id";
       readonly IDocumentListWebApiClient _documentListWebApiClient;
       readonly IEntityListsWebApiClient _entityListsWebApiClient;
       readonly IDocumentTypeWebApiClient _documentTypeWebApiClient;
       readonly IThemeContentRetriever _contentRetriever;
       readonly bool shouldGetInactiveDocumnents;
       readonly CmsHelper _cmsHelper;

        //   private const string TBD = "duno";
        public EntityControllerController(IDocumentListWebApiClient documentListWebApiClient, IEntityListsWebApiClient entityListsWebApiClient, IDocumentTypeWebApiClient documentTypeWebApiClient, IThemeContentRetriever contentRetriever, ISiteBuilderApiContext sbApiContext, CmsHelper cmsHelper)

        {
            _documentListWebApiClient = documentListWebApiClient;
            _entityListsWebApiClient = entityListsWebApiClient;
            _documentTypeWebApiClient = documentTypeWebApiClient;
            _contentRetriever = contentRetriever;
            shouldGetInactiveDocumnents = sbApiContext.UserClaims != null && sbApiContext.UserClaims.ScopeType.EqualsIgnoreCase(UserScopeType.Tenant.ToStringQuickly());
            _cmsHelper = cmsHelper;
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
                string sortBy = pagingParams.sort.Count() > 0 ? pagingParams.sort.ToSortString() : null;
                string filter = null;

                Tuple<IEnumerable<DocumentWithListInfo>, int> res = null;
                if (!string.IsNullOrEmpty(pagingParams.id))
                {
                    var docRequest = new DocumentRequest
                    {
                        Id = pagingParams.id,
                        ListFQN = list,
                        IncludeInactiveDocument = shouldGetInactiveDocumnents
                    };

                    Task<ServiceClientResponse<DocumentWithListInfo>> augmentedDocTask;
                    if (_cmsHelper.ProcessDocumentRequest(docRequest, list, out augmentedDocTask, true))
                    {
                        var response = await augmentedDocTask.ConfigureAwait(false);
                        var docWithListInfo = response.ReadAsSync();
                        res = Tuple.Create<IEnumerable<DocumentWithListInfo>, int>(new[] { docWithListInfo }, 1);
                    }
                }
                else if (string.IsNullOrEmpty(view))
                {
                    var docTask = _documentListWebApiClient.GetDocuments(documentListName: list, pageSize: pagingParams.pageSize, filter: filter, startIndex: pagingParams.startIndex, sortBy: sortBy, includeInactive: shouldGetInactiveDocumnents)
                            .ContinueWith(t => {
                                var result = t.Result.ReadAsSync();
                                return Tuple.Create(result.Items.AsEnumerable(), result.TotalCount);
                            });
                    var listTask = _documentListWebApiClient.GetDocumentList(list).ContinueWith(t => t.Result.ReadAsSync());
                    res = await GetDocsAndAugmentWithList(docTask, listTask).ConfigureAwait(false);
                }
                else
                {
                    var docTask = _documentListWebApiClient.GetViewDocuments(documentListName: list, pageSize: pagingParams.pageSize, filter: filter, startIndex: pagingParams.startIndex, sortBy: sortBy, viewName: view, includeInactive: shouldGetInactiveDocumnents)
                        .ContinueWith(t => {
                            var result = t.Result.ReadAsSync();
                            return Tuple.Create(result.Items.AsEnumerable(), result.TotalCount);
                        });
                    var listTask = _documentListWebApiClient.GetDocumentList(list).ContinueWith(t => t.Result.ReadAsSync());
                    res = await GetDocsAndAugmentWithList(docTask, listTask).ConfigureAwait(false);

                }

                return List2(res.Item1.Select(x =>
                {
                    JObject j = Mapper.Map<JObject>(x); 
                    j["entityType"] = "cms";
                    return j;
                }).ToList(), res.Item2);
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

        async Task<Tuple<IEnumerable<DocumentWithListInfo>, int>> GetDocsAndAugmentWithList(Task<Tuple<IEnumerable<DC.Document>, int>> docTask, Task<DC.DocumentList> listTask)
        {
            await Task.WhenAll(docTask, listTask).ConfigureAwait(false);
            var list = listTask.Result;
            var listFlags = new DocListFlags
            {
                EnableActiveDateRange = list.EnableActiveDateRanges.GetValueOrDefault(false),
                EnablePublishing = list.EnablePublishing.GetValueOrDefault(false),
                SupportsActiveDateRange = list.SupportsActiveDateRanges.GetValueOrDefault(false),
                SupportsPublishing = list.SupportsPublishing.GetValueOrDefault(false),
            };
            return Tuple.Create(
                docTask.Result.Item1
                .Select(x => x.Map<DocumentWithListInfo>())
                .Select(x => { x.ListFlags = listFlags; return x; }), 
                docTask.Result.Item2);
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
            JObject ret = JObject.FromObject(x, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));
            ret["entityType"] = "cms";
            return ret;
        }

        [HttpGetRoute(UriTemplate = "editors/read")]
        public async Task<Response<List<EditorResult>>> ReadEditor()
        {
            ServiceClientResponse<DC.DocumentCollection> cmsEditorsTask = await _documentListWebApiClient.GetDocuments(documentListName: "entityEditors@mozu", targetContextLevel: TargetContextLevelType.Tenant, pageSize: 600, startIndex: 0, includeInactive: shouldGetInactiveDocumnents);
            List<EditorResult> editors = new List<EditorResult>();
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
