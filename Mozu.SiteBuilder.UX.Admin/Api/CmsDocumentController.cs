using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Security.Policy;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Web.Http;
using Magnum.Extensions;
using Mozu.Core.Api.Routing;
using Mozu.Core.Logging;
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
    [WebApi("app/cmsdocument", SuppressDescriptorGeneration = true)]
    public class CmsDocumentController : BaseController
    {
        //static HashSet<int> g_provisioned = new HashSet<int>();
        //private readonly IDocumentListWebApiClient _docRepo;
        ICmsTypeHelper _cmsTypeHelper;

        ICmsServiceWrapper _cmsService;
        private readonly IDocumentListWebApiClient _documentListWebApiClien;
        private readonly ILogger _logger;
        //ISessionDocumentStore _sessionDocStore;
        public CmsDocumentController(IDocumentListWebApiClient docRepo ,
      
            IApiContext apiContext,
          //  ISessionDocumentStore sessionDocStore,
            ICmsTypeHelper cmsTypeHelper,
             ICmsServiceWrapper cmsService,
            Mozu.Content.Contracts.Clients.IDocumentListWebApiClient documentListWebApiClien,
            ILogger logger 
            )
        {

            _cmsService = cmsService;
            _documentListWebApiClien = documentListWebApiClien;
            _logger = logger;
            //  _docRepo = docRepo;
         //   _sessionDocStore = sessionDocStore;
            _cmsTypeHelper = cmsTypeHelper;
         //   provHelper.ProvisionCms();
           

        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<DC.Document>>> Delete(List<DC.Document> docs)
        {
            var tasks = docs.Select(doc => _cmsService.Delete2(Mapper.Map<DC.Document>(doc))).ToList();
            await Task.WhenAll(tasks);
            var successes = tasks.Select(x => x.Result).Select(x => x.Item1 ? 1 : 0).Sum();

            return EmptyList2<DC.Document>();
        }
       
        
        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<DC.Document>>> Create(List<DC.Document> docs)
        {
            var exitingTasks = docs.Select(doc => _cmsService.GetByPath2(doc.DocumentListName, doc.Name)).ToList();
            await Task.WhenAll(exitingTasks);
            var exiting = exitingTasks.Select(x => x.Result).Where(x => x.ResponseMessage.IsSuccessStatusCode).Select(x=>x.ReadAsSync()).ToList();
            var updates = new List<DC.Document>();
            exiting.ForEach(ed =>
                {
                    var idx = docs.FindIndex(x => string.Equals(x.DocumentListName, ed.DocumentListName, StringComparison.OrdinalIgnoreCase) && string.Equals(x.Name, ed.Name, StringComparison.OrdinalIgnoreCase));
                    if (idx > -1)
                    {
                        updates.Add(docs[idx]);
                        docs[idx].Id = ed.Id;
                        docs.RemoveAt(idx);
                    }

                });

            

            var tasks = docs.Select(doc => _cmsService.Create2(doc)).ToList();
            await Task.WhenAll(tasks);
            var response = tasks.Select(x => x.Result.ReadAsSync()).Select(ConvertDocument).ToList();

            if (updates.Count > 0)
            {
                var updateRes = await  this.Update(updates);
                response.AddRange(updateRes.Items );
            }

            return List2(response);
        }
       
        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<DC.Document>>> Update(List<DC.Document> docs)
        {
            var tasks = docs.Select(doc => _cmsService.Update2(doc)).ToList();
            await Task.WhenAll(tasks);
            var response = tasks.Select(x => x.Result.ReadAsSync()).Select(ConvertDocument).ToList();

            return List2(response);
        }




        public class UpdateWidgetDataMessage
        {
            public List<AVM.ZoneRuntimeData> zones;
            public DocumentRequest source { get; set; }
        }

        [HttpPostRoute(UriTemplate = "widgetdata/update")]
        public async Task<Response<List<AVM.ZoneRuntimeData>>> UpdateWidgetData(UpdateWidgetDataMessage message )
        {
            var source = message.source;
            message.zones = message.zones ?? new List<AVM.ZoneRuntimeData>();

            var docResult= (await _cmsService.GetByPath2(contentCollection: source.DocumentListName, name: source.Path));
            DC.Document doc;
            bool exitst = false;
            if (docResult.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                doc = new DC.Document()
                      {
                          DocumentListName = source.DocumentListName,
                          Name = source.Path,
                          DocumentType = source.DocumentType
                      };
            }
            else
            {
                exitst = true;
                doc = docResult.ReadAsSync();

                var existingZonesString = doc.Get<string>("widgets");
                if (!string.IsNullOrEmpty(existingZonesString))
                {

                    List<AVM.ZoneRuntimeData> existingZones = null;
                    try
                    {
                        existingZones = Newtonsoft.Json.JsonConvert.DeserializeObject<List<AVM.ZoneRuntimeData>>(existingZonesString);
                    }
                    catch (Exception ex)
                    {
                        _logger.Warn("error Deserializing existing widgets", ex);
                    }
                    if (existingZones != null)
                    {
                        foreach (var zoneRuntimeData in existingZones)
                        {
                            if (!message.zones.Any(x => string.Equals(zoneRuntimeData.Id, x.Id, StringComparison.OrdinalIgnoreCase)))
                            {
                                message.zones.Add(zoneRuntimeData);
                            }
                        }
                    }
                }
            }

            var zoneSerilized = Newtonsoft.Json.JsonConvert.SerializeObject(message.zones);

            
          //  zoneSerilized




            doc.Properties = new JObject();
            doc.Set("widgets", zoneSerilized);

            if (exitst)
            {
                doc = (await _cmsService.Update2(doc)).ReadAsSync();
            }
            else
            {
                doc = (await _cmsService.RawCreate2(doc)).ReadAsSync();
            }

            return List2(message.zones);
        }

		[HttpGetRoute(UriTemplate = "read")]
        public async Task<Response<List<DC.Document>>> ReadDocument([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, string id=null, string documentListName= CmsConstants.Documents.default_collection_name)
        {
            DC.DocumentCollection  results = null;
            if (id == null)
            {
                results = (await _cmsService.GetList2(contentCollection: documentListName, pageSize: int.MaxValue)).ReadAsSync();
            }
            else
            {
                


                results = new DC.DocumentCollection()
                {
                    Items = new List<DC.Document>()
                    {
                        (await _documentListWebApiClien.GetDocument(documentListName: documentListName, documentId: id)).ReadAsSync()
                    },
                    TotalCount = 1,
                    PageSize = 12,
                    StartIndex = 0
                };

            }
            

            return List2(results.Items,results.TotalCount );
        }

        private static DC.Document ConvertDocument(Mozu.Content.Contracts.Document result)
        {
            return result;
            //var doc = new DC.Document();
            //doc.Id = result.Id;

            //doc.DocumentType = result.DocumentType;
            //doc.PublishState = result.PublishState;

            //doc.Properties = result.Properties;
                        
         
            //doc.DocumentListName = result.DocumentListName  ;
            //doc.Name = result.Name;
            //doc.Id = doc.DocumentListName + "_" + doc.Id;
           
            //if (doc.Properties != null)
            //{
            //    doc.Properties.CastAs<JObject>().Remove("widgets");
            //}

          
            //return doc;
        }
    }
}