using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Security.Policy;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Web;
using System.Web.DynamicData;
using System.Web.Http;
using Magnum.FileSystem;
using MongoDB.Driver.Builders;
using Mozu.SiteBuilder.Mvc;
using Mozu.SiteBuilder.Mvc.Models.CMS;
using Newtonsoft.Json;
using Proto=Mozu.Content.Contracts.Prototype;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.Core.Collections.Filtering;
using Mozu.Core.Logging;
using Mozu.MZDB.Contracts;
using Mozu.MZDB.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
using Newtonsoft.Json.Linq;
using DC=Mozu.Content.Contracts;
using Mozu.Content.Contracts.Clients;
using CMS=Mozu.Content.Contracts;
using System.Threading.Tasks;
using Mozu.Core;
using AVM=Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Net.Http;


using Mozu.SiteBuilder.UX.Models.StoreFront.CMS;
using AutoMapper;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/entities", SuppressDescriptorGeneration = true)]
    public class EntityControllerController : BaseController
    {
        private readonly IDocumentListWebApiClient _documentListWebApiClient;
        private readonly IEntityListsWebApiClient _entityListsWebApiClient;
        private const string MZDB_LIST_PROPERTY = "EntityListName";
        private const string MZDB_DOCUMENT_ID_PROPERTY = "Id";
        private const string CMS_LIST_PROPERTY = "DocumentListName";
        private const string CMS_DOCUMENT_ID_PROPERTY = "Id";
     //   private const string TBD = "duno";
        public EntityControllerController(IDocumentListWebApiClient documentListWebApiClient,Mozu.MZDB.Contracts.Clients.IEntityListsWebApiClient entityListsWebApiClient)

        {
            _documentListWebApiClient = documentListWebApiClient;
            _entityListsWebApiClient = entityListsWebApiClient;
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<object>>> Delete(List<JObject>  documents)
        {
            EntityContainer cont;

            if (documents.First().GetValue(MZDB_LIST_PROPERTY, StringComparison.OrdinalIgnoreCase) == null)
            {
                var tasks = documents.Select(doc =>
                    _documentListWebApiClient.DeleteDocument(documentListName: (string) doc.GetValue(CMS_LIST_PROPERTY, StringComparison.OrdinalIgnoreCase), documentId: (string) doc.GetValue(CMS_DOCUMENT_ID_PROPERTY, StringComparison.OrdinalIgnoreCase))
                    ).ToList();


                await Task.WhenAll(tasks);
                tasks.Each(x =>
                {
                    if (x.Result.HasException)
                    {
                        throw x.Result.ReadException();
                    }
                });

            }
            else
            {

               
                var tasks = documents.Select(doc =>
                    _entityListsWebApiClient.DeleteEntity(entityListFullName: (string) doc.GetValue("NameSpace", StringComparison.OrdinalIgnoreCase) + "." + (string) doc.GetValue(MZDB_LIST_PROPERTY, StringComparison.OrdinalIgnoreCase), id: (string) doc.GetValue(MZDB_DOCUMENT_ID_PROPERTY, StringComparison.OrdinalIgnoreCase))
                    ).ToList();


                await Task.WhenAll(tasks);
                tasks.Each(x =>
                {
                    if (x.Result.HasException)
                    {
                        throw x.Result.ReadException();
                    }
                });
            }




            return EmptyList2<object>();
        }



        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Object>>> Create(List<JObject> documents)
        {

            if (documents.First().GetValue(MZDB_LIST_PROPERTY, StringComparison.OrdinalIgnoreCase) == null)
            {
                var tasks = documents.Select(doc =>
                {
                    var cmsDoc = doc.ToObject<Mozu.Content.Contracts.Document>();
                    return _documentListWebApiClient.CreateDocument(documentListName: cmsDoc.DocumentListName, document: cmsDoc);
                }).ToList();

                await Task.WhenAll(tasks);

                return List2(tasks.Select(x => (object) x.Result.ReadAsSync()).ToList());


            }
            else
            {


                var tasks = documents.Select(doc =>
                {
                    var entity = doc.ToObject<Mozu.MZDB.Contracts.EntityContainer>();
                    return _entityListsWebApiClient.InsertEntity(entityListFullName: entity.NameSpace + "." +  entity.EntityListName, item: entity.Item);
                }).ToList();

                await Task.WhenAll(tasks);

                return List2(tasks.Select(x => (object) x.Result.ReadAsSync()).ToList());

            }

        }


        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<Object>>> Update(List<JObject> documents)
        {

            if (documents.First().GetValue(MZDB_LIST_PROPERTY, StringComparison.OrdinalIgnoreCase) == null)
            {
                var tasks = documents.Select(doc =>
                {
                    var cmsDoc = doc.ToObject<Mozu.Content.Contracts.Document>();
                    return _documentListWebApiClient.UpdateDocument(documentListName: cmsDoc.DocumentListName, documentId: cmsDoc.Id, document: cmsDoc);
                }).ToList();

                await Task.WhenAll(tasks);

                return List2(tasks.Select(x => (object)x.Result.ReadAsSync()).ToList());


            }
            else
            {


                var tasks = documents.Select(doc =>
                {
                    var entity = doc.ToObject<Mozu.MZDB.Contracts.EntityContainer>();
                    return _entityListsWebApiClient.UpdateEntity(entityListFullName: entity.NameSpace +"."+ entity.EntityListName, item: entity.Item, id: entity.Id );
                }).ToList();

                await Task.WhenAll(tasks);

                return List2(tasks.Select(x => (object)x.Result.ReadAsSync()).ToList());

            }

        }

        [HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<Object>>> Read(PagingParamaters pagingParams, FilterCollection extFilter, string entityType, string list, string view=null)
        {
            if (entityType == "cms")
            {

                string sortBy = null;
                string filter = null;
                var res = (await _documentListWebApiClient.GetDocuments(documentListName: list, pageSize: pagingParams.pageSize, filter: filter, startIndex: pagingParams.startIndex, sortBy: sortBy)).ReadAsSync();

                return List2(res.Items.Cast<object>().ToList(), res.TotalCount);
            }
            else
            {
                string sortBy = null;
                string filter = null;
                var res = (await _entityListsWebApiClient.GetEntityContainers(entityListFullName: list, pageSize: pagingParams.pageSize, filter: filter, startIndex: pagingParams.startIndex, sortBy: sortBy)).ReadAsSync();

                return List2(res.Items.Cast<object>().ToList(), res.TotalCount);
            }

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

        [HttpGetRoute(UriTemplate = "lists/read")]
        public async Task<Response<List<Node>>> ReadLists(PagingParamaters pagingParams, FilterCollection extFilter, string entityType = null, string view = null)
        {
            var nodes = new List<Node>();
            

           


            if (entityType == "cms" || string.IsNullOrEmpty(entityType))
            {
                var cms = new Node() {Text = "content", Id="cms", Expanded =true,Items = new List<Node>()};
                nodes.Add(cms);

                string sortBy = null;
                string filter = null;
                try //todo:remove when support is there for tenant.
                {
                    var res = (await _documentListWebApiClient.GetDocumentLists(pageSize: pagingParams.pageSize, startIndex: pagingParams.startIndex)).ReadAsSync();
                    if (res.Items != null)
                    {
                        res.Items.ForEach(x => cms.Items.Add(new Node() { Text = x.Name, Id = "cms_" + x.Name, MetaData = AddViews(x), Leaf = true }));
                    }
                }
                catch
                {
                }

            }
            if(entityType == "mzdb" || string.IsNullOrEmpty(entityType))
            {
                var mzdb = new Node() { Text = "entities", Id = "mzdb", Expanded = true, Items = new List<Node>() };
                 nodes.Add(mzdb);
                string sortBy = null;
                string filter = null;
                var res = (await _entityListsWebApiClient.GetEntityLists(pageSize: pagingParams.pageSize, startIndex: pagingParams.startIndex)).ReadAsSync();
                if (res.Items != null)
                {
                    res.Items.ForEach(x => mzdb.Items.Add(new Node() { Text = x.Name, Id = "mzdb_" + x.NameSpace + "." + x.Name, MetaData = AddViews(x), Leaf = true }));
                }

                
            }
            return List2(nodes);
        }

        private JObject AddViews(EntityList x)
        {

            List<ListView> views = null;
            if (string.Equals( x.Name ,"subNavLinks", StringComparison.OrdinalIgnoreCase))
            {
                views = new List<ListView>()
                        {
                            new ListView()
                            {
                                Name = "default",
                                Usages = new List<string>() {"entityManager"},
                                Fields = new List<ListViewField>()
                                         {
                                             new ListViewField()
                                             {
                                                 IsQueryable = true,
                                                 IsSortable = true,
                                                 Name = "parentId",
                                                 Type = "string"
                                             },
                                             new ListViewField()
                                             {
                                                 IsQueryable = true,
                                                 IsSortable = true,
                                                 Name = "path",
                                                 Type = "any",
                                             },

                                             new ListViewField()
                                             {
                                                 IsQueryable = true,
                                                 IsSortable = true,
                                                 Name = "href",
                                                 Type = "string"
                                             },
                                             new ListViewField()
                                             {
                                                 IsQueryable = true,
                                                 IsSortable = true,
                                                 Name = "windowTitle",
                                                 Type = "string"
                                             }
                                         },
                                Security = "public"

                            }
                        };


             

            }
            else
            {
                views = new List<ListView>()
                            {
                                new ListView()
                                {
                                    Name = "default",
                                    Usages = new List<string> {"entityManager"},
                                    Fields = new List<ListViewField>()
                                             {
                                                 new ListViewField()
                                                 {
                                                     IsQueryable = true,
                                                     IsSortable = true,
                                                     Name = "name",
                                                     Type = "string"
                                                 },
                                                 new ListViewField()
                                                 {
                                                     IsQueryable = true,
                                                     IsSortable = true,
                                                     Name = "email",
                                                   Type = "string"
                                                 },

                                                 new ListViewField()
                                                 {
                                                     IsQueryable = true,
                                                     IsSortable = true,
                                                     Name = "phone",
                                                     Type = "string"
                                                 },
                                                 new ListViewField()
                                                 {
                                                     IsQueryable = true,
                                                     IsSortable = true,
                                                     Name = "age",
                                                     Type = "string"
                                                 }
                                             },
                                    Security =  "public"

                                },
                                new ListView()
                                {
                                    Name = "alt1",
                                    Usages = new List<string> {"entityManager"},
                                    Fields = new List<ListViewField>()
                                             {
                                                 new ListViewField()
                                                 {
                                                     IsQueryable = true,
                                                     IsSortable = true,
                                                     Name = "name",
                                                     Type = "string"
                                                 },
                                                 new ListViewField()
                                                 {
                                                     IsQueryable = true,
                                                     IsSortable = true,
                                                     Name = "email",
                                                     Type = "string"
                                                 },
                                                 new ListViewField()
                                                 {
                                                     IsQueryable = true,
                                                     IsSortable = true,
                                                     Name = "registere",
                                                     Type = "datetime"
                                                 },
                                                 new ListViewField()
                                                 {
                                                     IsQueryable = true,
                                                     IsSortable = true,
                                                     Name = "favoriteFruit",
                                                     Type = "string"
                                                 }

                                             },
                                    Security = "public"

                                }
                            };
            }

            x.Views = views;
            var ret = JObject.FromObject(x, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));

            ret["entityType"] = "mzdb";
           // ret.Add("views", JArray.FromObject(views, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings())));
            return ret;
        }

        private JObject AddViews(DC.DocumentList x)
        {
           
            var views = new List<CMS.View>()
                        {
                            new CMS.View() 
                            {
                                Usages= new List<string>(){"entityManager"},
                                Fields=new List<CMS.ViewFields>()
                                       {
                                           new CMS.ViewFields()
                                           {
                                               IsQueryable=true,
                                               IsSortable=true,
                                               Name="link_title",
                                               Type="string"
                                           },
                                           new CMS.ViewFields()
                                           {
                                               IsQueryable=true,
                                               IsSortable=true,
                                               Name="meta_title",
                                               Type="string"
                                           }
                                       },
                                       Security = "public"

                            }
                        };
            x.Views = views;
            var ret = JObject.FromObject(x, JsonSerializer.Create(new CaseInsensitiveJsonSerializerSettings()));
            ret["entityType"] = "cms";
           
            return ret;
        }

        public class EditorResult
        {
            public string Id { get; set; }
            public string Body { get; set; }

            public List<DocumentOrEntityListEditorSelector> DocumentTypes { get; set; }
            public List<DocumentOrEntityListEditorSelector> EntityLists { get; set; }

        }

       

        [HttpGetRoute(UriTemplate = "editors/read")]
        public async Task<Response<List<EditorResult>>> ReadEditor()

        {
          
            
            var  editors = System.IO.Directory.GetFiles(HttpRuntime.AppDomainAppPath + @"\Tests\Mocks\Entities\Editors\").Select(js => new EditorResult
                                                                                                                        {
                                                                                                                            Id = Path.GetFileNameWithoutExtension(js).ToLower(),
                                                                                                                            DocumentTypes = new List<DocumentOrEntityListEditorSelector>()
                                                                                                                                          {
                                                                                                                                              new DocumentOrEntityListEditorSelector()
                                                                                                                                              {
                                                                                                                                                  Name = Path.GetFileNameWithoutExtension(js).ToLower(),
                                                                                                                                                  Priority = .1F
                                                                                                                                              }
                                                                                                                                          },
                                                                                                                            EntityLists = new List<DocumentOrEntityListEditorSelector>()
                                                                                                                                          {
                                                                                                                                              new DocumentOrEntityListEditorSelector()
                                                                                                                                              {
                                                                                                                                                  Name = Path.GetFileNameWithoutExtension(js).ToLower(),
                                                                                                                                                  Priority = .1F
                                                                                                                                              }
                                                                                                                                          },
                                                                                                                            Body = System.IO.File.ReadAllText(js)
                                                                                                                        }).ToList();

            
            return List2(editors);

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


//    public class DocumentType
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

        
//        public string DocumentType { get; set; }

//        //
//        //public string FolderId { get; set; }

        
//        public string DocumentListName { get; set; }

        
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