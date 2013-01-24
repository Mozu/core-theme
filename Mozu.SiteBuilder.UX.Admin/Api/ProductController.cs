using System;
using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using ProductContract = Mozu.ProductAdmin.Contracts.Product;
using ProductDTO = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ProductController : BaseController
    {
        private readonly IProductWebApiClient _productClient;

        public ProductController(IProductWebApiClient productClient)
        {
            _productClient = productClient;
        }

        [WebGet(UriTemplate = "list")]
        public Task<Response<List<ProductDTO>>> GetProductList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                ProductContract prod = _productClient.GetProductByProductCode(pagingParams.id, null).Result.ReadAsSync();
                return List(Mapper.Map<ProductDTO>(prod));
            }

            string filter = OldProductController.CreateFilter(extFilter);
            string sort = OldProductController.CreateSort(pagingParams);

            ProductCollection res = _productClient.GetProducts(pagingParams.startIndex, pagingParams.pageSize, sort, null, filter).Result.ReadAsAsync().Result;

            return List(Mapper.Map<List<ProductDTO>>(res.Items), (int)res.TotalCount);
        }
    }
}
