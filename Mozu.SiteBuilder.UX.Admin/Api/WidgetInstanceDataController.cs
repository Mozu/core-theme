using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
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
    [ServiceContract]
    public class WidgetInstanceDataController : BaseController
    {
        //static HashSet<int> g_provisioned = new HashSet<int>();
        //private readonly IDocumentWebApiClient _docRepo;
        ICmsTypeHelper _cmsTypeHelper;

        ICmsServiceWrapper _cmsService;
        //ISessionDocumentStore _sessionDocStore;
        public WidgetInstanceDataController(IDocumentWebApiClient docRepo,
      
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
        class DocumentRequestComparer :IEqualityComparer<DocumentRequest>
        {
            public static DocumentRequestComparer Default = new DocumentRequestComparer();
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
                if ( string.Equals( x.Path  ,y.Path, StringComparison.InvariantCultureIgnoreCase ))
                {
                    return false;
                }
                if (string.Equals(x.Id, y.Id, StringComparison.InvariantCultureIgnoreCase))
                {
                    return true;
                }
                if (x.Id == y.Id)
                {
                    return true;
                }
                if (x.Path == y.Path)
                {
                    return true;
                }
                return false;
            }

            public int GetHashCode(DocumentRequest obj)
            {
                throw new NotImplementedException();
            }
        }
            
            
            [WebInvoke(Method = "POST", UriTemplate = "delete")]
        public Task<Response<List<AVM.WidgetInstanceData>>> Process(List<AVM.WidgetInstanceData> docs)
            {
                var docRequests = docs.Select(x => x.Source).Distinct(DocumentRequestComparer.Default).ToList();
                foreach (var req in docRequests)
                {
                    
                }
                CmsHelper  cmsHelper = new CmsHelper( this._cmsService );
                throw new NotImplementedException();
        }


        [WebInvoke(Method = "POST", UriTemplate = "create")]
        public Task<Response<List<AVM.WidgetInstanceData>>> Create(List<AVM.WidgetInstanceData> docs)
        {

            throw new NotImplementedException();
        }

        [WebInvoke(Method = "POST", UriTemplate = "update")]
        public Task<Response<List<AVM.WidgetInstanceData>>> Update(List<AVM.WidgetInstanceData> docs)
        {
            throw new NotImplementedException();
        }

        //[WebGet(UriTemplate = "read")]
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