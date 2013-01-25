using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using DC = Mozu.ProductAdmin.Contracts;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;

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
        public Task<Response<List<Product>>> GetProductList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                DC.Product prod = _productClient.GetProductByProductCode(pagingParams.id, null).Result.ReadAsSync();
                return List(Mapper.Map<Product>(prod));
            }

            string filter = OldProductController.CreateFilter(extFilter);
            string sort = OldProductController.CreateSort(pagingParams);

            ProductCollection res = _productClient.GetProducts(pagingParams.startIndex, pagingParams.pageSize, sort, null, filter).Result.ReadAsAsync().Result;

            return List(Mapper.Map<List<Product>>(res.Items), (int)res.TotalCount);
        }

        [WebInvoke(UriTemplate = "create")]
        public Task<Response<List<Product>>> CreateProduct(List<Product> products)
        {
            List<Product> createdProducts = new List<Product>(products.Count);
            foreach (Product p in products)
            {
                DC.Product dataModel = Mapper.Map<DC.Product>(p);

                DC.Product returned;
                try
                {
                    returned = _productClient.AddProduct(dataModel).Result.ReadAsAsync().Result;
                }
                catch
                {
                    // TODO: should probably do something about these errors
                    continue;
                }
                createdProducts.Add(Mapper.Map<Product>(returned));
            }

            return List(createdProducts);
        }

        [WebInvoke(UriTemplate = "edit?id={id}")]
        public Task<Response<List<Product>>> EditProduct(List<Product> products, int? id = null)
        {
            List<Product> updatedProducts = new List<Product>(products.Count);
            foreach (Product p in products)
            {
                DC.Product dataModel = Mapper.Map<DC.Product>(p);
                DC.Product ret = _productClient.UpdateProduct(dataModel, dataModel.ProductCode).Result.ReadAsAsync().Result;
                updatedProducts.Add(Mapper.Map<Product>(ret));
            }

            return List(updatedProducts);
        }
    }
}
