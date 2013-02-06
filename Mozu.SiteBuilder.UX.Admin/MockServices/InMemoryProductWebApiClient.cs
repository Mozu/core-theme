using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Web;
using System.Web.Caching;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductAdmin.Contracts.Clients;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.MockServices
{
    public interface IMoreAwesomeProductWebApiClient : IProductWebApiClient
    {
        bool IsAwesome { get; }
    }

    /// <summary>
    /// Mocks IProductWebApiClient to store Products in the HttpRuntime.Cache
    /// </summary>
    public class InMemoryProductWebApiClient : IMoreAwesomeProductWebApiClient
    {
        private const string PRODUCTS_CACHE_FORMAT_STRING = "_products";
        private IApiContext _ctx;

        /// <summary>
        /// Implements IMoreAwesomeProductWebApiClient
        /// </summary>
        public bool IsAwesome { get { return true; } }

        /// <summary>
        /// Public constructor.
        /// </summary>
        public InMemoryProductWebApiClient(IApiContext ctx)
        {
            _ctx = ctx;
        }

        /// <summary>
        /// Bleep the blurg.
        /// </summary>
        public Task<ServiceClientResponse<DC.Product>> GetProductByProductCode(string productCode, string responseGroups = null)
        {
            var repo = ProductRepository;
            DC.Product prod;
            lock (repo)
            {
                prod = repo.FirstOrDefault(p => p.ProductCode == productCode);
            }

            return (new TestResponse<DC.Product>(prod)).Task;
        }

        /// <summary>
        /// Get the list.
        /// </summary>
        public Task<ServiceClientResponse<DC.ProductCollection>> GetProducts(int? startIndex = null, int? pageSize = null, string sortBy = null, string responseGroups = null, string filter = null)
        {
            // ignore all paging and sorting parameters, because fuck it.
            DC.ProductCollection returnCol = new DC.ProductCollection { Items = ProductRepository.ToList() };

            return (new TestResponse<DC.ProductCollection>(returnCol)).Task;
        }

        /// <summary>
        /// Update a Product.
        /// </summary>
        public Task<ServiceClientResponse<DC.Product>> UpdateProduct(DC.Product product, string productCode)
        {
            var repo = ProductRepository;
            lock (repo)
            {
                var idx = repo.FindIndex(x => x.ProductCode == productCode);
                repo[idx] = product;
            }
            return (new TestResponse<DC.Product>(product)).Task;
        }

        /// <summary>
        /// Returns the product repository (which is backed by HttpRuntimeCache) for this tenant.
        /// TODO: This is a lot of logic for a property. Then again, this is throwaway code.
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

                // if the repository is empty, fill it with mock data.
                lock (existingRepo)
                {
                    if (existingRepo.Count == 0)
                    {
                        int currentSiteId = _ctx.SiteId.HasValue ? _ctx.SiteId.Value : 0;
                        InitializeRepoWithMockData(existingRepo, currentSiteId);
                    }
                }

                return existingRepo;
            }
        }

        /// <summary>
        /// Adds a product TO THE CLOUD.
        /// </summary>
        public Task<ServiceClientResponse<DC.Product>> AddProduct(DC.Product product)
        {
            var repo = ProductRepository;
            lock (repo)
            {
                repo.Add(product);
            }

            return (new TestResponse<DC.Product>(product)).Task;
        }

        /// <summary>
        /// pew pew pew
        /// </summary>
        public Task<ServiceClientResponse<StreamContent>> DeleteProduct(string productCode)
        {
            var repo = ProductRepository;
            lock (repo)
            {
                int idx = repo.FindIndex(x => x.ProductCode == productCode);
                if (idx < 0)
                    throw new ArgumentException("Product not found: " + productCode);

                repo.RemoveAt(idx);
            }

            return (new TestResponse<StreamContent>(null)).Task;
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
                Price = new DC.ProductPrice
                {
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

        # region IProductWebApiClient shit that I'm not implementing
        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<System.Net.Http.StreamContent>> DeleteConfigurableOption(string productCode, int? attributeId)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<System.Net.Http.StreamContent>> DeleteProductAttribute(string productCode, int? attributeId)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<System.Net.Http.StreamContent>> DeleteProductOption(string productCode, int? attributeId)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<System.Net.Http.StreamContent>> DeleteProductVariation(string productCode, string variationKey)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttribute>> GetProductAttribute(string productCode, int? attributeId, string responseGroups)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttributeCollection>> GetProductAttributes(string productCode, int? startIndex, int? pageSize, string responseGroups)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttribute>> GetProductConfigurableOption(string productCode, int? attributeId, string responseGroups = null)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttributeCollection>> GetProductConfigurableOptions(string productCode, int? startIndex = null, int? pageSize = null, string responseGroups = null)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductOption>> GetProductOption(string productCode, int? attributeId, string responseGroups = null)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductOptionCollection>> GetProductOptions(string productCode, int? startIndex = null, int? pageSize = null, string responseGroups = null)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductVariation>> GetProductVariation(string productCode, string variationKey)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductVariationPagedCollection>> GetProductVariations(string productCode, int? startIndex = null, int? pageSize = null, string sortBy = null, string filter = null)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttribute>> UpdateConfigurableOption(ProductAdmin.Contracts.ProductAttribute productAttribute, string productCode, int? attributeId)
        {
            throw new NotImplementedException();
        }

       

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttribute>> UpdateProductAttribute(ProductAdmin.Contracts.ProductAttribute productAttribute, string productCode, int? attributeId)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductOption>> UpdateProductOption(ProductAdmin.Contracts.ProductOption productOption, string productCode, int? attributeId)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.Product>> UpdateProductStock(ProductAdmin.Contracts.StockOnHandAdjustment stockAdjustment, string productCode)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductVariation>> UpdateProductVariation(ProductAdmin.Contracts.ProductVariation productVariation, string productCode, string variationKey)
        {
            throw new NotImplementedException();
        }

        public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductVariationCollection>> UpdateProductVariations(ProductAdmin.Contracts.ProductVariationCollection productVariations, string productCode)
        {
            throw new NotImplementedException();
        }
        #endregion


        public Task<ServiceClientResponse<DC.ProductInSiteInfo>> AddProductInSite(DC.ProductInSiteInfo productInSiteInfoIn, string productCode)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<StreamContent>> DeleteProductInSite(string productCode, int? siteId)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.Product>> GetProduct(string productCode, string responseGroups = null)
        {
            return this.GetProductByProductCode(productCode, responseGroups);
        }

        public Task<ServiceClientResponse<DC.ProductInSiteInfo>> GetProductInSite(string productCode, int? siteId)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.ProductInSiteInfo>>> GetProductInSites(string productCode)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<DC.ProductInSiteInfo>> UpdateProductInSite(DC.ProductInSiteInfo productInSiteInfoIn, string productCode, int? siteId)
        {
            throw new NotImplementedException();
        }

        public Task<ServiceClientResponse<List<DC.ProductInSiteInfo>>> UpdateProductInSites(List<DC.ProductInSiteInfo> productInSitesIn, string productCode)
        {
            throw new NotImplementedException();
        }
    }
}