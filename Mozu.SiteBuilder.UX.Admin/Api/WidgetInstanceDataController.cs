using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Net;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Api.Contracts.Client;
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
using Mozu.Core.Api.Client;
using Mozu.Core.Api;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/widgetinstance", SuppressDescriptorGeneration = true)]
    public class WidgetInstanceController : BaseController
    {
        //private const string WIDGETPROPNAME = "slug";
        //static HashSet<int> g_provisioned = new HashSet<int>();
        //private readonly IDocumentListWebApiClient _docRepo;
        ICmsTypeHelper _cmsTypeHelper;

        ICmsServiceWrapper _cmsService;
        private IDocumentListWebApiClient  _documentWebApi;
        //ISessionDocumentStore _sessionDocStore;
        public WidgetInstanceController(IDocumentListWebApiClient docRepo,
      
            IApiContext apiContext,
          //  ISessionDocumentStore sessionDocStore,
            ICmsTypeHelper cmsTypeHelper,
             ICmsServiceWrapper cmsService,
            IDocumentListWebApiClient documentWebApi 
            )
        {

            _documentWebApi = documentWebApi;
            _cmsService = cmsService;
          //  _docRepo = docRepo;
         //   _sessionDocStore = sessionDocStore;
            _cmsTypeHelper = cmsTypeHelper;
         //   provHelper.ProvisionCms();

            
         

        }
        class DocumentRequestComparer :IEqualityComparer<DocumentRequest>
        {
            public static readonly DocumentRequestComparer Default = new DocumentRequestComparer();
            public bool Equals(DocumentRequest x, DocumentRequest y)
            {
                if (x == null && y == null)
                {
                    return true;
                }
                if ( x == null  || y == null)
                {
                    return false;
                }
                if ( !string.Equals( x.Path  ,y.Path, StringComparison.InvariantCultureIgnoreCase ))
                {
                    return false;
                }
                if (!string.Equals(x.Id, y.Id, StringComparison.InvariantCultureIgnoreCase))
                {
                    return false;
                }
                
                return true;
            }

            public int GetHashCode(DocumentRequest obj)
            {
                return obj.Id == null ? (obj.Path == null ? 0 : obj.Path.ToLowerInvariant().GetHashCode()) : obj.Id.ToLowerInvariant().GetHashCode();
                
            }
        }


        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<AVM.WidgetInstanceData>>> Process(List<AVM.WidgetInstanceData> widgets, bool remove )
        {
            Task<ServiceClientResponse<DC.Document>> task;
            var docs = new List<DC.Document>();
            var cmsHelper = new CmsHelper(this._cmsService);
            var docRequests = widgets.Select(x => x.Source).Distinct(DocumentRequestComparer.Default).ToList();
            foreach (var req in docRequests)
            {
                if (!cmsHelper.ProcessDocumentRequest(req, null, out task))
                {
                    continue;
                }
                var res = await task;
                if (res.ResponseMessage.StatusCode == HttpStatusCode.NotFound)
                {
                    cmsHelper.CreateTemplate(req, out task);
                    res = await task;
                }
                var doc = res.ReadAsSync();
                docs.Add(doc);
                var widgetRaw = doc.Get( CmsConstants.Documents.widget_prop ) as string;

                var existingWidgets = string.IsNullOrEmpty(widgetRaw) ? new List<AVM.WidgetInstanceData>():  Newtonsoft.Json.JsonConvert.DeserializeObject<List<AVM.WidgetInstanceData>>(widgetRaw);

                foreach (var widget in widgets.Where(x => DocumentRequestComparer.Default.Equals(x.Source, req)))
                {
                    var index = existingWidgets.FindIndex(x => x.Id == widget.Id);
                    if (index > -1)
                    {
                        existingWidgets.RemoveAt(index);
                    }
                    if (!remove)
                    {
                        existingWidgets.Add(widget);
                    }
                }

                widgetRaw = Newtonsoft.Json.JsonConvert.SerializeObject(existingWidgets);

                doc.Set(CmsConstants.Documents.widget_prop, widgetRaw);
                


                await _documentWebApi.UpdateDocument(doc.DocumentListName, doc.Id, doc);



            }



            return this.List2(widgets);


        }


		[HttpPostRoute(UriTemplate = "create")]
        public Task<Response<List<AVM.WidgetInstanceData>>> Create(List<AVM.WidgetInstanceData> docs)
        {
            return Process(docs, false);
          
        }

		[HttpPostRoute(UriTemplate = "update")]
        public Task<Response<List<AVM.WidgetInstanceData>>> Update(List<AVM.WidgetInstanceData> docs)
        {
            return Process(docs, false);
        }

		[HttpPostRoute(UriTemplate = "destroy")]
        public Task<Response<List<AVM.WidgetInstanceData>>> Delete(List<AVM.WidgetInstanceData> docs)
        {
            return Process(docs, true);

        }

        //[HttpGetRoute(UriTemplate = "read")]
        //public Task<Response<List<AVM.WidgetInstanceData>>> ReadDocument(PagingParamaters pagingParams)
        //{
        //    throw new NotImplementedException();
        //}

        //private static AVM.Document ConvertDocument(Mozu.Content.Contracts.Document result)
        //{
        //    var doc = new AVM.Document();
        //    doc.DocumentId = result.Id;

        //    doc.DocumentType = result.DocumentType;
        //    doc.Items = new List<AVM.DocumentProperty>();
        //    doc.CollectionName = result.ContentCollection ;
        //    doc.Name = result.Name;
        //    doc.Id = doc.CollectionName + "_" + doc.DocumentId;
        //    foreach (var prop in result.Properties)
        //    {
        //        doc.Items.Add(new AVM.DocumentProperty
        //        {
        //            Key = prop.PropertyType,
        //            Value = prop.Value
                   
        //        });
        //    }

        //    return doc;
        //}
    }
}