using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/productruntime", SuppressDescriptorGeneration = true)]
    public class ProductRuntimeController : BaseController
    {
         private readonly IProductRuntimeWebApiClient _productRuntimeWebApiClient;

         public ProductRuntimeController ( Mozu.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient productRuntimeWebApiClient)
         {
             _productRuntimeWebApiClient = productRuntimeWebApiClient;
         }

		 [HttpGetRoute(UriTemplate = "read")]
         public async Task<Response <Newtonsoft.Json.Linq.JObject>> ListProducts(string productCode )
         {
             var prod = (await _productRuntimeWebApiClient.GetProduct(productCode)).ReadAsSync();

             Newtonsoft.Json.Linq.JObject jobj = Newtonsoft.Json.Linq.JObject.FromObject(prod);
             return this.Single2( jobj);
         }



		 [HttpPostRoute(UriTemplate = "configure")]
         public async Task<Response<Newtonsoft.Json.Linq.JObject>> Configure([FromBody]Mozu.ProductRuntime.Contracts.ProductOptionSelections selections , [FromUri] string productCode)
         {
             var res = (await _productRuntimeWebApiClient.ConfiguredProduct(selections, productCode, true )).ReadAsSync();
             Newtonsoft.Json.Linq.JObject jobj = Newtonsoft.Json.Linq.JObject.FromObject(res);
             return this.Single2(jobj);
         }
    }
}