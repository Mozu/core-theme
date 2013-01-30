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
using Mozu.Core;
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
        private const string PRODUCTS_CACHE_FORMAT_STRING = "_products";
        private readonly IProductWebApiClient _productClient;
        private IApiContext _ctx;

        /// <summary>
        /// Returns the product repository (which is backed by HttpRuntimeCache) for this tenant.
        /// </summary>
        private List<DC.Product> ProductRepository
        {
            get
            {
                string key = String.Format(PRODUCTS_CACHE_FORMAT_STRING, _ctx.TenantId);

                List<DC.Product> existingRepo = (List<DC.Product>)HttpRuntime.Cache[key];
                if (existingRepo == null)
                {
                    existingRepo = new List<DC.Product>();
                    HttpRuntime.Cache.Add(key, existingRepo, null, Cache.NoAbsoluteExpiration, Cache.NoSlidingExpiration, CacheItemPriority.NotRemovable, null);
                }

                return existingRepo;
            }
        }

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductController(IProductWebApiClient productClient, IApiContext ctx)
        {
            _productClient = productClient;
            _ctx = ctx;
        }

        [WebGet(UriTemplate = "list")]
        public Task<Response<List<Product>>> GetProductList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            // our in-memory product repository
            List<DC.Product> productRepo = ProductRepository;

            // if the repository is empty, fill it with mock data.
            lock (productRepo)
            {
                if (productRepo.Count == 0)
                {
                    int siteIdToOverride = _ctx.SiteId.HasValue ? _ctx.SiteId.Value : 0;
                    InitializeRepoWithMockData(productRepo, siteIdToOverride);
                }
            }

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

        [WebInvoke(UriTemplate = "create")]
        public Task<Response<List<Product>>> CreateProduct(List<Product> products)
        {
            // our in-memory product repository
            List<DC.Product> productRepo = ProductRepository;

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
            throw new NotImplementedException();

            List<Product> updatedProducts = new List<Product>(products.Count);
            foreach (Product p in products)
            {
                DC.Product dataModel = Mapper.Map<DC.Product>(p);
                DC.Product ret = _productClient.UpdateProduct(dataModel, dataModel.ProductCode).Result.ReadAsAsync().Result;
                updatedProducts.Add(Mapper.Map<Product>(ret));
            }

            return List(updatedProducts);
        }

        /// <summary>
        /// Initializes some mock product data for the ui team's delight.
        /// </summary>
        private static void InitializeRepoWithMockData(List<DC.Product> repo, int siteIdToOverride)
        {
            DC.Product p1 = new DC.Product
            {
                ProductCode = "KT-001",
                Content = new DC.ProductLocalizedContent
                {
                    ProductName = "KT Deluxe Edition",
                    ProductShortDescription = "blur blur",
                    ProductFullDescription = "blur blur blur"
                },
                Price = new DC.ProductPrice {
                    ISOCurrencyCode = "USD",
                    Price = 12m
                },
                ProductInSites = new List<DC.ProductInSiteInfo> {
                    new DC.ProductInSiteInfo {
                        SiteId = siteIdToOverride,
                        IsContentOverridden = true,
                        Content = new DC.ProductLocalizedContent {
                                ProductName = "KT Super Deluxe"
                        },
                        IsPriceOverridden = false,
                        IsSEOContentOverridden = false
                    }
                },
            };

            DC.Product p2 = new DC.Product
            {
                ProductCode = "KT-002",
                Content = new DC.ProductLocalizedContent
                {
                    ProductName = "KT Starter Kit",
                    ProductShortDescription = "",
                    ProductFullDescription = ""
                },
                Price = new DC.ProductPrice
                {
                    ISOCurrencyCode = "USD",
                    Price = 4.5m
                },
                ProductInSites = null
            };

            repo.AddRange(new[] { p1, p2 });
        }

        /// <summary>
        /// Allows ProductInSiteInfoController to get to our in-memory products.
        /// </summary>
        internal static DC.Product GetProduct(string productCode, IApiContext ctx)
        {
            string key = String.Format(PRODUCTS_CACHE_FORMAT_STRING, ctx.TenantId);

            // our in-memory product repository
            List<DC.Product> productRepo = (List<DC.Product>)HttpRuntime.Cache.Get(key);

            if (productRepo.Count == 0)
                InitializeRepoWithMockData(productRepo, ctx.SiteId.HasValue ? ctx.SiteId.Value : 0);

            return productRepo.FirstOrDefault(p => p.ProductCode == productCode);
        }
    }
}
