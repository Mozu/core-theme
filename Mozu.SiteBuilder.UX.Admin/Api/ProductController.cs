using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web;
using System.Web.Caching;
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
    /// <summary>
    /// Controller for products.
    /// TODO: The Mozu service for this is not currently available.
    /// TODO: I am storing all items in HttpRuntimeCache in the meantime.
    /// TODO: Eventually we need to use the services.
    /// </summary>
    [ServiceContract]
    public class ProductController : BaseController
    {
        private const string PRODUCTS_CACHE_STRING = "_products";
        private readonly IProductWebApiClient _productClient;

        /// <summary>
        /// Static constructor.
        /// Initializes our product list in the RuntimeCache.
        /// </summary>
        static ProductController()
        {
            Cache cache = HttpRuntime.Cache;
            if (cache.Get(PRODUCTS_CACHE_STRING) == null)
                cache.Add(PRODUCTS_CACHE_STRING, new List<DC.Product>(), null, Cache.NoAbsoluteExpiration, Cache.NoSlidingExpiration, CacheItemPriority.NotRemovable, null);
        }

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductController(IProductWebApiClient productClient)
        {
            _productClient = productClient;
        }

        [WebGet(UriTemplate = "list")]
        public Task<Response<List<Product>>> GetProductList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            // our in-memory product repository
            List<DC.Product> productRepo = (List<DC.Product>)HttpRuntime.Cache.Get(PRODUCTS_CACHE_STRING);

            
            {
                if (pagingParams.id != null)
                {
                    // DC.Product prod = _productClient.GetProductByProductCode(pagingParams.id, null).Result.ReadAsSync();
                    DC.Product prod;
                    lock (productRepo)
                    {
                        prod = productRepo.FirstOrDefault(p => p.ProductCode == pagingParams.id);
                    }
                    return List(Mapper.Map<Product>(prod));
                }

                string filter = OldProductController.CreateFilter(extFilter);
                string sort = OldProductController.CreateSort(pagingParams);

                ProductCollection res;
                // res = _productClient.GetProducts(pagingParams.startIndex, pagingParams.pageSize, sort, null, filter).Result.ReadAsAsync().Result;
                lock (productRepo)
                {
                    res = new ProductCollection { Items = productRepo.ToList() };
                }

                return List(Mapper.Map<List<Product>>(res.Items), (int)res.TotalCount);
            }
        }

        [WebInvoke(UriTemplate = "create")]
        public Task<Response<List<Product>>> CreateProduct(List<Product> products)
        {
            // our in-memory product repository
            List<DC.Product> productRepo = (List<DC.Product>)HttpRuntime.Cache.Get(PRODUCTS_CACHE_STRING);

            List<Product> createdProducts = new List<Product>(products.Count);
            foreach (Product p in products)
            {
                DC.Product dataModel = Mapper.Map<DC.Product>(p);
                DC.Product returned;

                lock (productRepo)
                {
                    productRepo.Add(dataModel);
                    returned = dataModel;
                }

                // try
                // {
                //     returned = _productClient.AddProduct(dataModel).Result.ReadAsAsync().Result;
                // }
                // catch
                // {
                //     // TODO: should probably do something about these errors
                //     continue;
                // }

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
