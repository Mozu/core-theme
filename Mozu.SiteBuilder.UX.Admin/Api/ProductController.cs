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
using Mozu.SiteBuilder.Mvc.Extensions;

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
        public async Task<Response<List<Product>>> ListProducts([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var result = await _productClient.GetProduct(pagingParams.id, null);
                DC.Product prod = result.ReadAsAsync().Result;
                return List2(Mapper.Map<Product>(prod));
            }

            string filter = extFilter.ToFilterString();
            string sort = pagingParams.sort.ToSortString();

            ProductCollection res;
            res = _productClient.GetProducts(pagingParams.startIndex, pagingParams.pageSize, sort, null, filter).Result.ReadAsAsync().Result;

            return List2(Mapper.Map<List<Product>>(res.Items), (int)res.TotalCount);
        }

        [WebInvoke(UriTemplate = "create")]
        public async Task<Response<List<Product>>> CreateProduct(List<Product> products)
        {
            List<Product> createdProducts = new List<Product>(products.Count);
            foreach (Product p in products)
            {
                DC.Product dataModel = Mapper.Map<DC.Product>(p);
                DC.Product returned;

                try
                {
                    var result = await _productClient.AddProduct(dataModel);
                    returned = result.ReadAsAsync().Result;
                }
                catch (AggregateException e)
                {
                    return Message3<List<Product>>(false, e.UnwrapAgg().Message);
                }

                createdProducts.Add(Mapper.Map<Product>(returned));
            }

            return List2(createdProducts);
        }

        [WebInvoke(UriTemplate = "edit")]
        public async Task<Response<List<Product>>> EditProduct(List<Product> products)
        {
            List<Product> updatedProducts = new List<Product>(products.Count);
            foreach (Product p in products)
            {
                DC.Product dataModel = Mapper.Map<DC.Product>(p);
                var result = await _productClient.UpdateProduct(dataModel, dataModel.ProductCode);
                DC.Product returned = result.ReadAsAsync().Result;
                updatedProducts.Add(Mapper.Map<Product>(returned));
            }

            return List2(updatedProducts);
        }

        [WebInvoke(UriTemplate = "delete")]
        public async Task<Response<List<Product>>> DeleteProduct(List<Product> products)
        {
            List<Product> deletedProducts = new List<Product>(products.Count);
            foreach (Product p in products)
            {
                var result = await _productClient.DeleteProduct(p.ProductCode);
                // TODO: wtf is this for?
                StreamContent ret = result.ReadAsAsync().Result;
                deletedProducts.Add(p);
            }

            return List2(deletedProducts);
        }
    }
}
