using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Web.Http;
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


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class CmsDocumentController : BaseController
    {
        //static HashSet<int> g_provisioned = new HashSet<int>();
        //private readonly IDocumentWebApiClient _docRepo;
        ICmsTypeHelper _cmsTypeHelper;

        ICmsServiceWrapper _cmsService;
        //ISessionDocumentStore _sessionDocStore;
        public CmsDocumentController(IDocumentWebApiClient docRepo ,
      
            IApiContext apiContext,
            IProvisioningHelper provHelper,
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

        [WebInvoke(Method = "POST", UriTemplate = "delete")]
        public Task<Response<List<AVM.Document>>> Delete(List<AVM.Document> docs)
        {
            var tasks = _cmsService.Delete(docs).ToArray ();
            Task.WaitAll(tasks);
            var successes = tasks.Select(x => x.Result).Select(x => x.Item1 ? 1 : 0).Sum();

            return EmptyList<AVM.Document>();
        }
       
        
        [WebInvoke(Method = "POST", UriTemplate = "create")]
        public Task<Response<List<AVM.Document>>> Create(List<AVM.Document> docs)
        {
            var tasks = _cmsService.Create(docs);
            Task.WaitAll(tasks.ToArray ());
            var response = tasks.Select(x => x.Result.ReadAsSync()).Select(ConvertDocument).ToList();

            return List(response);
        }
       
        [WebInvoke(Method = "POST", UriTemplate = "update")]
        public Task<Response<List<AVM.Document>>> Update(List<AVM.Document> docs )
        {
            var tasks = _cmsService.Update(docs).ToArray();
            Task.WaitAll(tasks);

            return List(docs);
        }

        [WebGet(UriTemplate = "read")]
        public Task<Response<List<AVM.Document>>> ReadDocument([FromUri]PagingParamaters pagingParams)
        {
            DC.PagedCollection<DC.Document> results = null;
            if (pagingParams.id == null)
            {
                results = _cmsService.GetList ( new CmsListRequest ()
                {
                    Collection = CmsConstants.Documents.default_collection_name,
                    PageSize = int.MaxValue 
                }).Result.ReadAsSync();
                
                
            }
            else
            {
                var idx= pagingParams.id.IndexOf ('_');
                var col =  pagingParams.id.Substring ( 0,idx);
                var id = pagingParams.id.Substring (idx+1);
                results = new DC.PagedCollection<DC.Document>()
                {
                    Items = new List<DC.Document>()
                    {
                        this._cmsService.Get( col, id ).Result.ReadAsSync ()
                        
                    },
                    TotalCount =1,
                    PageSize =12,
                    StartIndex =0
                };
                
            }
            var docs = results.Items.Select(document => ConvertDocument(document )).ToList();

            return List(docs);
        }

        private static AVM.Document ConvertDocument(Mozu.Content.Contracts.Document result)
        {
            var doc = new AVM.Document();
            doc.DocumentId = result.Id;

            doc.DocumentType = result.DocumentType;
            doc.Items = new List<AVM.DocumentProperty>();
            doc.CollectionName = result.DocumentListName  ;
            doc.Name = result.Name;
            doc.Id = doc.CollectionName + "_" + doc.DocumentId;
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