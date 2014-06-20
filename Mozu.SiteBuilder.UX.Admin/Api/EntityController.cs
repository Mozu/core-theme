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
using System.Threading.Tasks;
using Mozu.Core;
using AVM=Mozu.SiteBuilder.Mvc.Models.CMS.Admin;
using Mozu.SiteBuilder.Mvc.CMS;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using System.Net.Http;
using Mozu.SiteBuilder.Mvc.Models.CMS;
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
            public object MetaData { get; set; }
        
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
                        res.Items.ForEach(x => cms.Items.Add(new Node() {Text = x.Name, Id = "cms_" + x.Name, MetaData = x, Leaf = true}));
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
                    res.Items.ForEach(x => mzdb.Items.Add(new Node() { Text = x.Name, Id = "mzdb_" + x.NameSpace + "." + x.Name, MetaData = x, Leaf = true }));
                }

                
            }
            return List2(nodes);
        }

        public class EditorResult
        {
            public string Id { get; set; }
            public string Body { get; set; }

        }

        [HttpGetRoute(UriTemplate = "editors/read")]
        public async Task<Response<List<EditorResult>>> ReadEditor()

        {
            var  editors = System.IO.Directory.GetFiles(HttpRuntime.AppDomainAppPath + @"\Tests\Mocks\Entities\Editors\").Select(js => new EditorResult
                                                                                                                        {
                                                                                                                            Id = Path.GetFileNameWithoutExtension(js).ToLower(),
                                                                                                                            Body = System.IO.File.ReadAllText(js)
                                                                                                                        }).ToList();
            return List2(editors);

        }




    }
}