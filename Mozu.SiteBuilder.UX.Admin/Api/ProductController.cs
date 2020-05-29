using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using System.Text;
using AutoMapper;
using Mozu.Core;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.ScheduledEvent.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers;
using Mozu.Core.Logging;
using DC = Mozu.ProductAdmin.Contracts;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;
using Mozu.Content.Contracts.Clients;
using Mozu.Core.Api.Client;
using Mozu.Content.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for products.
	/// </summary>
    [WebApi("app/product", SuppressDescriptorGeneration = true)]
    public class ProductController : BaseController
    {
        private readonly CollectionTaskUnMapper<Product, DC.Product> _productMapper = new CollectionTaskUnMapper<Product, DC.Product>();
        private readonly IProductWebApiClient _productClient;
        private readonly IProductTypeWebApiClient _productTypeWebApiClient;
        private readonly IPublishSetWebApiClient _publishSetClient;
        private readonly ILogger _logger;
        private readonly IBundleItemCatalogHelper _bundleItemCatalogHelper;
        IDocumentListWebApiClient _documentListWebApiClient;
        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductController(IProductWebApiClient productClient, IProductTypeWebApiClient productTypeWebApiClient, IPublishSetWebApiClient publishSetClient, ILogger logger, IBundleItemCatalogHelper bundleItemCatalogHelper
            , IDocumentListWebApiClient documentListWebApiClient)
        {
            _documentListWebApiClient = documentListWebApiClient;
            _productClient = productClient;
            _productTypeWebApiClient = productTypeWebApiClient;
            _publishSetClient = publishSetClient;
            _logger = logger;
            _bundleItemCatalogHelper = bundleItemCatalogHelper;
        }

        [HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Product>>> ListProducts([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]string responseGroups = "")
        {
            if (pagingParams.id != null)
            {
                return await GetSingleProductAsync(pagingParams);
            }

            if (string.IsNullOrEmpty(responseGroups)) {
                responseGroups = (extFilter.SearchType == "global" || extFilter.SearchType == "picker"
                     ? "min"
                     : "ProductInCatalogs,Min,Price");
            }

            StringBuilder strBuilder = new StringBuilder(extFilter.ToFilterString(extFilter.ShowVariations));

            if (!String.IsNullOrEmpty(extFilter.ShowProductUsages))
            {
                if (strBuilder.Length > 0)
                    strBuilder.Append(" and ");
                strBuilder.Append("(productUsage eq ");
                strBuilder.Append(string.Join(" or productUsage eq ", extFilter.ShowProductUsages.Split(',')));
                strBuilder.Append(")");
            }

            var filter = strBuilder.ToString();
            var q = extFilter.ToQString();
            var isGlobalSearchType = extFilter.SearchType.EqualsIgnoreCase("global");

            var results = await SearchProducts(pagingParams, filter, q, responseGroups, isGlobalSearchType, extFilter.UseLiveMode);
            return results;
        }

        /// <summary>
        /// Lists all products that are capable of managing inventory and have manageStock=true. This excludes base products and bundles.
        /// </summary>
        [HttpGetRoute(UriTemplate = "inventoriedproductlist")]
        public async Task<Response<List<Product>>> ListInventoriedProducts([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            // use a hard-coded response group and filter for this search.
            string responseGroups = extFilter.ResponseGroups ?? "Min,Price,VariationOptions";


            string extraFilter = extFilter.ToFilterString(withVariations: true);
            string filter = "manageStock eq true and (isVariation eq true or productUsage eq standard or productUsage eq component)";
            if (!string.IsNullOrEmpty(extraFilter))
            {
                filter += "and (" + extraFilter + ")";
            }
            var q = extFilter.ToQString(withVariations: true);
            var isGlobalSearchType = extFilter.SearchType.EqualsIgnoreCase("global");

            return await SearchProducts(pagingParams, filter, q, responseGroups, isGlobalSearchType, false);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Product>>> CreateProduct(List<Product> products)
        {
            if (products == null || !products.Any())
                return Message3<List<Product>>(false, "No products were created because they were not sent correctly. Please try again.");


            var createdProducts = await _productMapper.PerformAction(products, p => _productClient.AddProduct(p));
            foreach (var createdProd in createdProducts.Where(editedProd => editedProd.ProductUsage.Equals("Bundle")))
            {
                await GetBundleItemCatalogInfo(createdProd);
            }
            return List2(createdProducts.ToList());
        }

        [HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<Product>>> EditProduct(List<Product> products)
        {
            if (products == null || !products.Any())
                return Message3<List<Product>>(false, "No products were edited because they were not sent correctly. Please try again.");

            var productTypes = new List<ProductType>();
            foreach (var product in products)
            {
                if (product.ProductTypeId.HasValue && !productTypes.Any(x => x.Id == product.ProductTypeId))
                {
                    var pt = (await _productTypeWebApiClient.GetProductType(product.ProductTypeId ?? -1)).ReadAsSync();
                    if (pt != null)
                    {
                        productTypes.Add(pt);
                    }

                }
            }

            var result = (await _productMapper.PerformAction(products, p =>
            {
                var pt = productTypes.FirstOrDefault(x => p.ProductTypeId == x.Id);
                if (p.Properties != null && pt != null)
                {
                    foreach (var prop in p.Properties)
                    {
                        var def = pt.Properties.FirstOrDefault(x => prop.AttributeFQN == x.AttributeFQN && x.AttributeDetail.InputType == "List" && x.AttributeDetail.ValueType == "AdminEntered" && x.AttributeDetail.DataType == "String");
                        if (def != null)
                        {
                            if (prop.Values != null && prop.Values.Count == 1)
                            {
                                prop.Values[0].Value = def.AttributeFQN + "_value";
                            }
                        }
                    }
                    p.Properties.Select(prop => pt.Properties.FirstOrDefault(x => x.AttributeFQN == prop.AttributeFQN))
                        .Where(x => x != null && x.AttributeDetail.ValueType == "AdminEntered" && x.AttributeDetail.DataType == "String")
                        .ToList()
                        .ForEach(def =>
                        {

                        });
                }
                return _productClient.UpdateProduct(p, p.ProductCode);
            })).ToList();
            try
            {
                await Task.WhenAll(result.Select(s => AppendCmsImageNamesForAllCatalogs(s)));
            }
            catch (Exception ex)
            {
                _logger.Warn($"error fetching product Images", ex);
            }
            
            foreach (var editedProd in result.Where(x => x.ProductUsage.Equals("Bundle")))
            {
                await GetBundleItemCatalogInfo(editedProd);
            }
            return List2(result);
        }

        [HttpPostRoute(UriTemplate = "delete")]
        public async Task<Response<List<Product>>> DeleteProduct(List<Product> products)
        {
            if (products == null || !products.Any())
                return Message3<List<Product>>(false, "No products were edited because they were not sent correctly. Please try again.");

            var deletedProducts = await _productMapper.PerformVoidAction(products, p => _productClient.DeleteProduct(p.ProductCode));
            return List2(deletedProducts.ToList());
        }

        private async Task<Response<List<Product>>> SearchProducts(PagingParamaters pagingParams, string filter, string q,
            string responseGroups, bool isSearchTypeGlobal, bool useLiveMode)
        {
            var sort = pagingParams.sort.ToSortString();
            int? qLimit = isSearchTypeGlobal ? 3 : (int?)null;
            if (useLiveMode)
            {
                SbApiContext.SetDataMode(DataViewModeType.Live);
            }

            var responseFields = "items(productCode,productTypeId,productUsage,isVariation,baseProductCode," +
                   "price(price,salePrice)," +
                   "publishingInfo(publishedState)" +
                   "productInCatalogs(catalogId,isContentOverridden,content(productName),price(price,salePrice))," +
                   "auditInfo(updateDate)," +
                   "content(productName)";

            if (responseGroups != null && responseGroups.Contains("VariationOptions"))
            {
                responseFields += ",VariationOptions";
            }
            responseFields += ")";

            var prodCollection = (await _productClient.GetProducts(
                startIndex: pagingParams.startIndex, 
                pageSize: pagingParams.pageSize,
                sortBy: sort,
                responseGroups: responseGroups, 
                filter: filter, 
                q: q, 
                qLimit: qLimit, 
                responseFields:responseFields)).ReadAsSync();

            if (prodCollection.TotalCount == 0)
            {
                return List2(new List<Product>(), 0);
            }
            
            // need to call the productType service and get the productType name to saturate each product record;
            var productTypes = new List<int?>();
            // gather up all of hte product types

            foreach (var product in prodCollection.Items)
            {
                var productType = product.ProductTypeId;
                productTypes.Add(productType);
            }

            // de-duplicate
            productTypes = productTypes.Distinct().ToList();

            var productTypeFilter = new StringBuilder();
            var filterSeperator = "";

            foreach (var productTypeId in productTypes)
            {
                productTypeFilter.Append(filterSeperator).Append("id eq ").Append(productTypeId);
                filterSeperator = " or ";
            }


            // call the productType service and retrieve records for all productTypes;
            var pttask = (await _productTypeWebApiClient.GetProductTypes(
                filter: productTypeFilter.ToString(),
                responseFields: "items(id,name)"
                )).ReadAsSync();
            
            var mapped = prodCollection.Items.Map<List<Product>>();

            var ptLookUp = pttask.Items.ToDictionary(x => x.Id, y => y.Name);

            // iterate product records and add productTypeName
            foreach (var product in mapped)
            {
                string productName;

                //var productTypeName = ptLookUp.FirstOrDefault(productType);
                if (product.ProductTypeId.HasValue && ptLookUp.TryGetValue(product.ProductTypeId, out productName))
                {
                    product.ProductTypeName = productName;
                }
            }

            return List2(mapped, prodCollection.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "renameproductcode")]
        public async Task<Response<List<ProductCodeRename>>> RenameProductCodes(List<ProductCodeRename> prodCodeRenames)
        {
            var dcProductCodeRenames = Mapper.Map<List<DC.ProductCodeRename>>(prodCodeRenames);
            var res = (await _productClient.RenameProductCodes(dcProductCodeRenames)).ReadAsSync();
            return List2(prodCodeRenames);
        }

        [HttpGetRoute(UriTemplate = "bundleitems")]
        public async Task<Response<List<Product>>> ListBundleItems([FromUri]string productCodes)
        {
            var bundleItemCollection = await GetBundleItems(productCodes);
            var bundleItemProducts = bundleItemCollection.Items.Map<List<Product>>();
            return List2(bundleItemProducts, bundleItemCollection.TotalCount);
        }

        private async Task<Response<List<Product>>> GetSingleProductAsync(PagingParamaters pagingParams)
        {
            var result = await _productClient.GetProduct(pagingParams.id, null);
            DC.Product prod = result.ReadAsAsync().Result;
            var productModel = Mapper.Map<Product>(prod);
            if (productModel.ProductUsage.Equals("Bundle") && productModel.BundledProducts != null && productModel.BundledProducts.Any())
            {
                await GetBundleItemCatalogInfo(productModel);
            }
            try
            {
                await AppendCmsImageNamesForAllCatalogs(productModel).ConfigureAwait(false);
            }
            catch( Exception ex )
            {
                _logger.Warn($"error fetching productCode:{productModel.ProductCode}", ex);
            }
            

            if (prod.PublishingInfo == null || string.IsNullOrEmpty(prod.PublishingInfo.PublishSetCode)) {
                return List2(productModel);
            }

            try {
                var ps = (await _publishSetClient.GetPublishSet(prod.PublishingInfo.PublishSetCode)).ReadAsSync();
                productModel.PublishSetName = ps.Name;
                productModel.PublishSetDate = ps.PublishDate;
            }
            catch (Core.Api.Client.Exceptions.ApiWebClientException ex) {
                //TODO: We should set the RoodProduct.PublishSetCode to null at some point
                _logger.Error(string.Format("Error trying to find Publish-Set [{0}]", prod.PublishingInfo.PublishSetCode), ex.Message);
            }

            
            return List2(productModel);
        }

        private async Task AppendCmsImageNamesForAllCatalogs(Product product)
        {
            await AppendCmsImageNames(product).ConfigureAwait(false);
            await Task.WhenAll(product.ProductInCatalogs.Select(s => AppendCmsImageNames(s)));
        }

        private async Task AppendCmsImageNames(Models.ProductModels.IProductWithImages product)
        {
            if (!product?.ProductImages?.Any() ?? false)
            {
                return;
            }

            var images = product.ProductImages
                .Where(w => !string.IsNullOrEmpty(w.CmsId))
                .Select(s => s.CmsId)
                .Chunk(10);

            var tasks = new List<Task<List<Document>>>();
            foreach (var chunk in images)
            {
                // TODO: See why id $in [......] throws an error
                //tasks.Add(GetCmsImageNames(chunk.Partition(nameOrId => Guid.TryParse(nameOrId, out Guid _))));
                tasks.Add(GetCmsImageNames(chunk));
            }
            Task.WaitAll(tasks.ToArray());
            var cmsImages = tasks.SelectMany(s => s.Result);

            foreach (var image in product.ProductImages.Where(_ => !string.IsNullOrEmpty(_.CmsId)))
            {
                image.ImageName = cmsImages
                    .Where(cmsImage => string.Equals(image.CmsId, cmsImage.Id, StringComparison.OrdinalIgnoreCase))
                    .Select(cmsImage => cmsImage.Name)
                    .FirstOrDefault();
            }
        }

        private async Task<List<Document>> GetCmsImageNames(IEnumerable<string> cmsIds)
        {
            var ids = cmsIds
                .Select(s => Guid.TryParse(s, out var _) ?
                    $"id eq \"{s}\"" :
                    $"name eq \"{s}\""
                 );
            // TODO: See why id $in [......] throws an error
            //var filter = $"id in [{cmsIds.True.ToDelimited()}] or name in [{cmsIds.False.ToDelimited()}]";
            var filter = string.Join(" or ", ids); 


            return (await _documentListWebApiClient.CloneWithoutUserClaims()
                .GetDocuments("files@mozu", filter: filter, responseFields: "items(id, name)")
                .ConfigureAwait(false))
                .ReadAsSync()
                ?.Items;
        }


        private async Task<ProductCollection> GetBundleItems(string productCodes)
        {
            var filter = $"productCode in [{productCodes}]";
            var responseFields = "items(productCode,productInCatalogs(catalogId,content(localeCode,productName),price(isoCurrencyCode,price,salePrice)))";
            return (await _productClient.GetProducts(startIndex: 0, pageSize: 600,
                filter: filter, responseFields: responseFields)).ReadAsSync();
        }

        private async Task GetBundleItemCatalogInfo(Product productModel)
        {
            if (productModel.BundledProducts.Any())
            {
                var bundleItemProductCodes = productModel.BundledProducts.Select(x => x.ProductCode).Join(",");
                var bundleItemData = await GetBundleItems(bundleItemProductCodes);

                productModel.ProductInCatalogs =
                    _bundleItemCatalogHelper.MergeBundleItemsAndCatalogInfo(productModel.BundledProducts,
                        productModel.ProductInCatalogs, bundleItemData.Items);
            }
        }
    }
}