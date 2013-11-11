using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Models.Admin.CMS;
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
        //ISessionDocumentStore _sessionDocStore;
        public CmsDocumentController(IDocumentListWebApiClient docRepo ,
      
            IApiContext apiContext,
          //  ISessionDocumentStore sessionDocStore,
            ICmsTypeHelper cmsTypeHelper,
             ICmsServiceWrapper cmsService
            )
        {

            _cmsService = cmsService;
          //  _docRepo = docRepo;
         //   _sessionDocStore = sessionDocStore;
            _cmsTypeHelper = cmsTypeHelper;
         //   provHelper.ProvisionCms();
           

        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<AVM.Document>>> Delete(List<AVM.Document> docs)
        {
            var tasks = docs.Select(doc => _cmsService.Delete2(Mapper.Map<DC.Document>(doc))).ToList();
            await Task.WhenAll(tasks);
            var successes = tasks.Select(x => x.Result).Select(x => x.Item1 ? 1 : 0).Sum();

            return EmptyList2<AVM.Document>();
        }
       
        
        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<AVM.Document>>> Create(List<AVM.Document> docs)
        {
            var tasks = docs.Select(doc => _cmsService.Create2(doc)).ToList();
            await Task.WhenAll(tasks);
            var response = tasks.Select(x => x.Result.ReadAsSync()).Select(ConvertDocument).ToList();

            return List2(response);
        }
       
        [HttpPostRoute(UriTemplate = "update")]
        public async Task<Response<List<AVM.Document>>> Update(List<AVM.Document> docs )
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

            var docResult= (await _cmsService.GetByPath2(contentCollection: source.Collection, name: source.Path));
            DC.Document doc;
            bool exitst = false;
            if (docResult.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
            {
                doc = new DC.Document()
                          {
                              DocumentListName = source.Collection,
                              Name = source.Path,
                              DocumentType = source.DocumentType
                          };
            }
            else
            {
                exitst = true;
                doc = docResult.ReadAsSync();
            }

            var zoneSerilized = Newtonsoft.Json.JsonConvert.SerializeObject(message.zones);
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
        public async Task<Response<List<AVM.Document>>> ReadDocument([FromUri]PagingParamaters pagingParams)
        {
            DC.DocumentCollection  results = null;
            if (pagingParams.id == null)
            {
                results = (await _cmsService.GetList2(contentCollection: CmsConstants.Documents.default_collection_name, pageSize: int.MaxValue)).ReadAsSync();
            }
            else
            {
                var idx= pagingParams.id.IndexOf ('_');
                var col =  pagingParams.id.Substring ( 0,idx);
                var id = pagingParams.id.Substring (idx+1);
                results = new DC.DocumentCollection()
                {
                    Items = new List<DC.Document>()
                    {
                        (await _cmsService.Get2(col, id)).ReadAsSync()
                    },
                    TotalCount =1,
                    PageSize =12,
                    StartIndex =0
                };
                
            }
            var docs = results.Items.Select(document => ConvertDocument(document )).ToList();

            return List2(docs);
        }

        private static AVM.Document ConvertDocument(Mozu.Content.Contracts.Document result)
        {
            var doc = new AVM.Document();
            doc.DocumentId = result.Id;

            doc.DocumentType = result.DocumentType;
                        
            doc.Items = new List<AVM.DocumentProperty>();
            doc.DocumentListName = result.DocumentListName  ;
            doc.Name = result.Name;
            doc.Id = doc.DocumentListName + "_" + doc.DocumentId;
            foreach (var prop in result.Properties)
            {
                doc.Items.Add(new AVM.DocumentProperty
                {
                    Key = prop.PropertyType,
                    Value = prop.Value
                   
                });
            }

            return doc;
        }
    }
}