using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Mozu.Core;
using Mozu.Core.Api.Contracts.Client;
using Mozu.ProductAdmin.Contracts.Clients;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.MockServices
{
    [Obsolete]
    public interface IMoreAwesomeProductWebApiClient : IProductWebApiClient
    {
        bool IsAwesome { get; }
    }

    /// <summary>
    /// Mocks IProductWebApiClient to store Products in the HttpRuntime.Cache
    /// </summary>
    //[Obsolete]
    //public class InMemoryProductWebApiClient : AbstractInMemoryResourceApiClient<List<DC.Product>>, IMoreAwesomeProductWebApiClient
    //{
    //    private const string PRODUCTS_CACHE_FORMAT_STRING = "_products_{0}_{1}";
    //    private IApiContext _ctx;

    //    /// <summary>
    //    /// Cache key for the repository. Tied to current tenant/site group.
    //    /// </summary>
    //    protected override string CacheKey { get { return String.Format(PRODUCTS_CACHE_FORMAT_STRING, _ctx.TenantId, _ctx.MasterCatalogId); } }

    //    /// <summary>
    //    /// Implements IMoreAwesomeProductWebApiClient
    //    /// </summary>
    //    public bool IsAwesome { get { return true; } }

    //    /// <summary>
    //    /// Public constructor.
    //    /// </summary>
    //    public InMemoryProductWebApiClient(IApiContext ctx)
    //    {
    //        _ctx = ctx;
    //    }

    //    /// <summary>
    //    /// Bleep the blurg.
    //    /// </summary>
    //    public Task<ServiceClientResponse<DC.Product>> GetProductByProductCode(string productCode, string responseGroups = null)
    //    {
    //        DC.Product prod;
    //        lock (Repository)
    //        {
    //            prod = Repository.FirstOrDefault(p => p.ProductCode == productCode);
    //        }

    //        return (new TestResponse<DC.Product>(prod)).Task;
    //    }

    //    /// <summary>
    //    /// Get the list.
    //    /// </summary>
    //    public Task<ServiceClientResponse<DC.ProductCollection>> GetProducts(int? startIndex = null, int? pageSize = null, string sortBy = null, string responseGroups = null, string filter = null)
    //    {
    //        // ignore all paging and sorting parameters, because fuck it.
    //        DC.ProductCollection returnCol = new DC.ProductCollection { Items = Repository.ToList() };

    //        return (new TestResponse<DC.ProductCollection>(returnCol)).Task;
    //    }

    //    /// <summary>
    //    /// Update a Product.
    //    /// </summary>
    //    public Task<ServiceClientResponse<DC.Product>> UpdateProduct(DC.Product product, string productCode)
    //    {
    //        lock (Repository)
    //        {
    //            var idx = Repository.FindIndex(x => x.ProductCode == productCode);
    //            Repository[idx] = product;
    //        }
    //        return (new TestResponse<DC.Product>(product)).Task;
    //    }

    //    /// <summary>
    //    /// Adds a product TO THE CLOUD.
    //    /// </summary>
    //    public Task<ServiceClientResponse<DC.Product>> AddProduct(DC.Product product)
    //    {
    //        lock (Repository)
    //        {
    //            Repository.Add(product);
    //        }

    //        return (new TestResponse<DC.Product>(product)).Task;
    //    }

    //    /// <summary>
    //    /// pew pew pew
    //    /// </summary>
    //    public Task<ServiceClientResponse<StreamContent>> DeleteProduct(string productCode)
    //    {
    //        lock (Repository)
    //        {
    //            Repository.RemoveAll(x => x.ProductCode == productCode);
    //        }

    //        return (new TestResponse<StreamContent>(null)).Task;
    //    }


    //    /// <summary>
    //    /// Initializes some mock product data for the ui team's delight.
    //    /// </summary>
    //    protected override void InitializeRepoWithMockData(List<DC.Product> repo)
    //    {
    //        int siteIdToOverride = _ctx.SiteId.HasValue ? _ctx.SiteId.Value : 0;

    //        DC.Product p1 = new DC.Product
    //        {
    //            ProductCode = "KT-001",
    //            Content = new DC.ProductLocalizedContent
    //            {
    //                ProductName = "KT Deluxe Edition",
    //                ProductShortDescription = "blur blur",
    //                ProductFullDescription = "blur blur blur"
    //            },
    //            Price = new DC.ProductPrice
    //            {
    //                CurrencyCode = "USD",
    //                Price = 12m
    //            },
    //            ProductInCatalogs = new List<DC.ProductInCatalogInfo> {
    //                new DC.ProductInCatalogInfo {
    //                    SiteId = siteIdToOverride,
    //                    IsContentOverridden = true,
    //                    Content = new DC.ProductLocalizedContent {
    //                            ProductName = "KT Super Deluxe"
    //                    },
    //                    IsPriceOverridden = false,
    //                    IsSEOContentOverridden = false
    //                }
    //            },
    //        };

    //        DC.Product p2 = new DC.Product
    //        {
    //            ProductCode = "KT-002",
    //            Content = new DC.ProductLocalizedContent
    //            {
    //                ProductName = "KT Starter Kit",
    //                ProductShortDescription = "",
    //                ProductFullDescription = ""
    //            },
    //            Price = new DC.ProductPrice
    //            {
    //                CurrencyCode = "USD",
    //                Price = 4.5m
    //            },
    //            ProductInCatalogs = null
    //        };

    //        repo.AddRange(new[] { p1, p2 });
    //    }

    //    # region IProductWebApiClient shit that I'm not implementing
    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<System.Net.Http.StreamContent>> DeleteConfigurableOption(string productCode, int? attributeId)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<System.Net.Http.StreamContent>> DeleteProductAttribute(string productCode, int? attributeId)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<System.Net.Http.StreamContent>> DeleteProductOption(string productCode, int? attributeId)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<System.Net.Http.StreamContent>> DeleteProductVariation(string productCode, string variationKey)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttribute>> GetProductAttribute(string productCode, int? attributeId, string responseGroups)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttributeCollection>> GetProductAttributes(string productCode, int? startIndex, int? pageSize, string responseGroups)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttribute>> GetProductConfigurableOption(string productCode, int? attributeId, string responseGroups = null)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttributeCollection>> GetProductConfigurableOptions(string productCode, int? startIndex = null, int? pageSize = null, string responseGroups = null)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductOption>> GetProductOption(string productCode, int? attributeId, string responseGroups = null)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductOptionCollection>> GetProductOptions(string productCode, int? startIndex = null, int? pageSize = null, string responseGroups = null)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductVariation>> GetProductVariation(string productCode, string variationKey)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductVariationPagedCollection>> GetProductVariations(string productCode, int? startIndex = null, int? pageSize = null, string sortBy = null, string filter = null)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttribute>> UpdateConfigurableOption(ProductAdmin.Contracts.ProductAttribute productAttribute, string productCode, int? attributeId)
    //    {
    //        throw new NotImplementedException();
    //    }

       

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductAttribute>> UpdateProductAttribute(ProductAdmin.Contracts.ProductAttribute productAttribute, string productCode, int? attributeId)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductOption>> UpdateProductOption(ProductAdmin.Contracts.ProductOption productOption, string productCode, int? attributeId)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.Product>> UpdateProductStock(ProductAdmin.Contracts.StockOnHandAdjustment stockAdjustment, string productCode)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductVariation>> UpdateProductVariation(ProductAdmin.Contracts.ProductVariation productVariation, string productCode, string variationKey)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public System.Threading.Tasks.Task<Core.Api.Contracts.Client.ServiceClientResponse<ProductAdmin.Contracts.ProductVariationCollection>> UpdateProductVariations(ProductAdmin.Contracts.ProductVariationCollection productVariations, string productCode)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public Task<ServiceClientResponse<DC.ProductInCatalogInfo>> AddProductInSite(DC.ProductInCatalogInfo productInCatalogInfoIn, string productCode)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public Task<ServiceClientResponse<StreamContent>> DeleteProductInSite(string productCode, int? siteId)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public Task<ServiceClientResponse<DC.Product>> GetProduct(string productCode, string responseGroups = null)
    //    {
    //        return this.GetProductByProductCode(productCode, responseGroups);
    //    }

    //    public Task<ServiceClientResponse<DC.ProductInCatalogInfo>> GetProductInSite(string productCode, int? siteId)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public Task<ServiceClientResponse<List<DC.ProductInCatalogInfo>>> GetProductInCatalogs(string productCode)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public Task<ServiceClientResponse<DC.ProductInCatalogInfo>> UpdateProductInSite(DC.ProductInCatalogInfo productInCatalogInfoIn, string productCode, int? siteId)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public Task<ServiceClientResponse<List<DC.ProductInCatalogInfo>>> UpdateProductInCatalogs(List<DC.ProductInCatalogInfo> productInCatalogsIn, string productCode)
    //    {
    //        throw new NotImplementedException();
    //    }

    //    public IServiceClientMessageHandler Handler
    //    {
    //        get
    //        {
    //            throw new NotImplementedException();
    //        }
    //        set
    //        {
    //            throw new NotImplementedException();
    //        }
    //    }

    //    public ConfigOptions Options
    //    {
    //        get
    //        {
    //            throw new NotImplementedException();
    //        }
    //        set
    //        {
    //            throw new NotImplementedException();
    //        }
    //    }
    //    #endregion
    //}
}