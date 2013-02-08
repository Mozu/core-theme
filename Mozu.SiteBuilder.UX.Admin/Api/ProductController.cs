using System;
using System.Collections.Generic;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.ProductHelpers;
using Mozu.SiteBuilder.UX.Admin.MockServices;
using DC = Mozu.ProductAdmin.Contracts;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for products.
    /// </summary>
    [ServiceContract]
    public class ProductController : BaseController
    {
        private readonly IProductWebApiClient _productClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductController(IProductWebApiClient productClient)
        {
            _productClient = productClient;
        }

        [WebGet(UriTemplate = "list")]
        public Task<Response<List<Product>>> ListProducts([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                DC.Product prod = _productClient.GetProduct(pagingParams.id, null).Result.ReadAsAsync().Result;
                return List(Mapper.Map<Product>(prod));
            }

            string filter = extFilter.ToFilterString();
            string sort = pagingParams.sort.ToSortString();

            ProductCollection res;
            res = _productClient.GetProducts(pagingParams.startIndex, pagingParams.pageSize, sort, null, filter).Result.ReadAsAsync().Result;

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

        [WebInvoke(UriTemplate = "edit")]
        public Task<Response<List<Product>>> EditProduct(List<Product> products)
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

        [WebInvoke(UriTemplate = "delete")]
        public Task<Response<List<Product>>> DeleteProduct(List<Product> products)
        {
            List<Product> deletedProducts = new List<Product>(products.Count);
            foreach (Product p in products)
            {
                // TODO: wtf is this for?
                StreamContent ret = _productClient.DeleteProduct(p.ProductCode).Result.ReadAsAsync().Result;
                deletedProducts.Add(p);
            }

            return List(deletedProducts);
        }
    }
}
