using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using System.Web.Http;
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
    [ServiceContract]
    public class ProductVariationController : BaseController
    {
        private readonly CollectionTaskUnMapper<Product, DC.Product> _productMapper = new CollectionTaskUnMapper<Product, DC.Product>();

        private readonly IProductWebApiClient _productClient;
        private readonly IProductTypeWebApiClient _productTypeWebApiClient;
        public ProductVariationController(IProductWebApiClient productClient, IProductTypeWebApiClient productTypeWebApiClient)
        {
            _productClient = productClient;
            _productTypeWebApiClient = productTypeWebApiClient;
        }

        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<ProductVariation >>> ListProducts([FromUri] PagingParamaters pagingParams, [FromUri] FilterCollection extFilter,string productCode)
        {
            var res = (await _productClient.GetProductVariations(productCode, pagingParams.startIndex, pagingParams.pageSize)).ReadAsSync();
            var mappedRes = AutoMapper.Mapper.Map<List<ProductVariation>>(res.Items);
            return this.List2(mappedRes, total: (int)res.TotalCount);

        }
    }

}