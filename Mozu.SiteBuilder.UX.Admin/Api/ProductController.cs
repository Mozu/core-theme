using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using System.Text;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.Core.Extensions;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers;
using DC = Mozu.ProductAdmin.Contracts;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;
using StringExtensions = Mozu.Core.Extensions.StringExtensions;

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

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductController(IProductWebApiClient productClient, IProductTypeWebApiClient productTypeWebApiClient)
        {
            _productClient = productClient;
            
            _productTypeWebApiClient = productTypeWebApiClient;
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Product>>> ListProducts([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var result = await _productClient.GetProduct(pagingParams.id, null);
                DC.Product prod = result.ReadAsAsync().Result;
                return List2(Mapper.Map<Product>(prod));
            }
            string responseGroups = !string.IsNullOrEmpty(extFilter.ResponseGroups) ? extFilter.ResponseGroups : (extFilter.SearchType == "global" || extFilter.SearchType == "picker" ? "min" : "ProductInCatalogs,Min,Price");

            string filter = extFilter.ToFilterString();

            if (!String.IsNullOrEmpty(extFilter.ShowProductUsages))
            {
                StringBuilder filterB = new StringBuilder("productUsage eq ");

                filterB.Append(string.Join(" or productUsage eq ", extFilter.ShowProductUsages.Split(',')));

                if (extFilter.ShowVariations)
                {
                    filterB.Insert(0, "isVariation eq true or ");
                }

                filter = filterB.ToString();
            }

            var q = extFilter.ToQString();
            var isGlobalSearchType = extFilter.SearchType.EqualsIgnoreCase("global");

            return await SearchProducts(pagingParams, filter, q, responseGroups, isGlobalSearchType);
        }

        /// <summary>
        /// Lists all products that are capable of managing inventory and have manageStock=true. This excludes base products and bundles.
        /// </summary>
        [HttpGetRoute(UriTemplate = "inventoriedproductlist")]
        public async Task<Response<List<Product>>> ListInventoriedProducts([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter) 
        {
            // use a hard-coded response group and filter for this search.
            string responseGroups = extFilter.ResponseGroups ?? "Min,Price,VariationOptions";

            
            string extraFilter = extFilter.ToFilterString(withVariations: true );
            string filter = "manageStock eq true and (isVariation eq true or productUsage eq standard or productUsage eq component)";
            if (!string.IsNullOrEmpty(extraFilter))
            {
                filter += "and (" + extraFilter + ")";
            }
            var q = extFilter.ToQString(withVariations: true);
            var isGlobalSearchType = extFilter.SearchType.EqualsIgnoreCase("global");

            return await SearchProducts(pagingParams, filter, q, responseGroups, isGlobalSearchType);
        }

        [HttpPostRoute(UriTemplate = "create")]
        public async Task<Response<List<Product>>> CreateProduct(List<Product> products)
        {
            if (products == null || !products.Any())
                return Message3<List<Product>>(false, "No products were created because they were not sent correctly. Please try again.");

           
            var createdProducts = await _productMapper.PerformAction(products, p => _productClient.AddProduct(p));
            return List2(createdProducts.ToList());
        }

		[HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<Product>>> EditProduct(List<Product> products)
        {
            if (products == null || !products.Any())
                return Message3<List<Product>>(false, "No products were edited because they were not sent correctly. Please try again.");

            var  productTypes = new List<ProductType>();
            foreach (var product in products)
            {
                if (product.ProductTypeId.HasValue && !productTypes.Any(x => x.Id == product.ProductTypeId))
                {
                    var pt = (await _productTypeWebApiClient.GetProductType(product.ProductTypeId)).ReadAsSync();
                    if (pt != null)
                    {
                        productTypes.Add(pt);
                    }

                }
            }
            
            var editedProducts = await _productMapper.PerformAction(products, p =>
                {
                    var pt = productTypes.FirstOrDefault(x => p.ProductTypeId == x.Id);
                    if (p.Properties  != null && pt != null)
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
                        p.Properties.Select( prop=>  pt.Properties.FirstOrDefault(x=>x.AttributeFQN == prop.AttributeFQN ) )
                            .Where( x=> x!=null&& x.AttributeDetail.ValueType =="AdminEntered" && x.AttributeDetail.DataType =="String")
                            .ToList() 
                            .ForEach(def =>
                                {
                                    
                                });
                    }
                    return _productClient.UpdateProduct(p, p.ProductCode);
                });
            return List2(editedProducts.ToList());
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
            string responseGroups, bool isSearchTypeGlobal)
        {
            string sort = pagingParams.sort.ToSortString();
            int? qLimit = isSearchTypeGlobal ? (int?)3 : (int?)null;
            // if there is a q AND there is no filter, default qLimit to 50.
            if (String.IsNullOrWhiteSpace(filter) && !String.IsNullOrWhiteSpace(q) && !qLimit.HasValue)
                qLimit = pagingParams.pageSize.GetValueOrDefault(50) + 1;

            // qLimit and pageSize do not work together.
            // if q is specified and we are attempting to page beyond page 1, do not use qLimit.
            var prodCollection = (!String.IsNullOrWhiteSpace(q) && pagingParams.pageIndex > 1)
                ? (await _productClient.GetProducts(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize,
                        sortBy: sort, responseGroups: responseGroups, filter: filter, q: q)).ReadAsSync()
                : (await _productClient.GetProducts(startIndex: pagingParams.startIndex, pageSize: pagingParams.pageSize,
                        sortBy: sort, responseGroups: responseGroups, filter: filter, q: q, qLimit: qLimit)).ReadAsSync();

            var mapped = prodCollection.Items.Map<List<Product>>();
            return List2(mapped, (int)prodCollection.TotalCount);
        }

        [HttpPostRoute(UriTemplate = "renameproductcode")]
        public async Task<Response<List<ProductCodeRename>>> RenameProductCodes(List<ProductCodeRename> prodCodeRenames)
        {
            var dcProductCodeRenames = Mapper.Map<List<DC.ProductCodeRename>>(prodCodeRenames);
            var res = (await _productClient.RenameProductCodes(dcProductCodeRenames)).ReadAsSync();
            return List2(prodCodeRenames);
        }
    }
}