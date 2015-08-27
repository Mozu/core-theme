using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using DC = Mozu.ProductAdmin.Contracts;
//using DC = Volusion.Attribute.Contracts.Administration;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using System.Net.Http;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Options;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using AutoMapper;
using System.Runtime.Serialization;


namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [WebApi("app/productvariation", SuppressDescriptorGeneration = true)]
    public class ProductVariationController : BaseController
    {
        private readonly CollectionTaskUnMapper<Product, DC.Product> _productMapper = new CollectionTaskUnMapper<Product, DC.Product>();

        private readonly IProductWebApiClient _productClient;
        private readonly IProductTypeWebApiClient _productTypeWebApiClient;
        private readonly IAttributeWebApiClient _attributeWebApiClient;

        public ProductVariationController(IProductWebApiClient productClient, IProductTypeWebApiClient productTypeWebApiClient, IAttributeWebApiClient attributeWebApiClient)
        {
            _productClient = productClient;
            _productTypeWebApiClient = productTypeWebApiClient;
            _attributeWebApiClient = attributeWebApiClient;
        }


		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<ProductVariation>>> ListProducts([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter, [FromUri]string productCode = null, [FromUri] string options = null, [FromUri ] int? productTypeId = null, [FromUri]string tempProductCode = null )
        {
            
            var filter = "IsOrphan ne true";
            Mozu.ProductAdmin.Contracts.ProductVariationPagedCollection collection = null;
            if (!string.IsNullOrEmpty(options))
            {
                var productOptions = Newtonsoft.Json.JsonConvert.DeserializeObject<List<ProductProperty>>(options);

                if (productOptions.Count == 0)
                {
                    collection = new DC.ProductVariationPagedCollection() {Items = new List<DC.ProductVariation>(), TotalCount = 0};
                }
                else
                {
                    var dcOPtions = Mapper.Map<List<Mozu.ProductAdmin.Contracts.ProductOption>>(productOptions);
                    collection = (await _productTypeWebApiClient.GenerateProductVariations(productOptionsIn: dcOPtions, productTypeId: productTypeId, productCode: productCode, startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize, filter: filter)).ReadAsSync();
                //    string format = "000";
                    for (int i = 0; i < collection.Items.Count; i++)
                    {
                        var item = collection.Items[i];
                       
                        if (!string.IsNullOrEmpty(tempProductCode))
                        {
                            item.VariationProductCode = tempProductCode + "-" + (i + 1).ToString("000");
                        }

                    }
                    
                    
                }

            }
            else
            {
                collection = (await _productClient.GetProductVariations(productCode, pagingParams.startIndex, pagingParams.pageSize, filter: filter)).ReadAsSync();    
            }

            var mappedRes = AutoMapper.Mapper.Map<List<ProductVariation>>(collection.Items);
            return this.List2(mappedRes, total: (int)collection.TotalCount);
             
        }

		[HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<ProductVariation>>> EditVariations( List<ProductVariation> variations ,[FromUri]string productCode )
        {
            var dcVariations = Mapper.Map<List<DC.ProductVariation>>(variations);
            var res = (await _productClient.UpdateProductVariations( new DC.ProductVariationCollection(){ Items =dcVariations}, productCode)).ReadAsSync();
            var ret = Mapper.Map<List<ProductVariation>>(res.Items);
            return List2(ret);
        }
    }

}