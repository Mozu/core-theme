using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Admin.MockServices;
using DC = Mozu.ProductAdmin.Contracts;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for product types.
    /// </summary>
    [ServiceContract]
    public class ProductTypeController : BaseController
    {
        private readonly IProductTypeWebApiClient _productTypeClient;

        private readonly CollectionTaskUnMapper<ProductType, DC.ProductType> _productTypeMapper = new CollectionTaskUnMapper<ProductType, DC.ProductType>();

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductTypeController(IMoreAwesomeProductTypeWebApiClient productTypeClient)
        {
            _productTypeClient = productTypeClient;
        }

        /// <summary>
        /// Get a list of Product Types.
        /// </summary>
        [WebGet(UriTemplate = "list")]
        public async Task<Response<List<ProductType>>> ListProductTypes([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                int id;
                try
                {
                    id = Convert.ToInt32(pagingParams.id);
                }
                catch (System.FormatException e)
                {
                    return FailureList2<ProductType>("Invalid id parameter passed." + e.ToString());
                }
                var resultSingle = await _productTypeClient.GetProductType(id);
                DC.ProductType prod = resultSingle.ReadAsAsync().Result;
                return List2(Mapper.Map<ProductType>(prod));
            }

            string filter = null; // extFilter.ToFilterString();
            string sort = null; // pagingParams.sort.ToSortString();

            DC.ProductTypeCollection res;
            var result = await _productTypeClient.GetProductTypes(
                /* startIndex:     */ pagingParams.startIndex,
                /* pageSize:       */ pagingParams.pageSize,
                /* sortBy:         */ sort,
                /* responseGroups: */ null,
                /* filter:         */ filter
            );
            res = result.ReadAsAsync().Result;

            return List2(Mapper.Map<List<ProductType>>(res.Items), (int)res.TotalCount);
        }

        /// <summary>
        /// Create new product types.
        /// </summary>
        [WebInvoke(UriTemplate = "create")]
        public async Task<Response<List<ProductType>>> CreateProductType(List<ProductType> productTypes)
        {
            if (productTypes == null || !productTypes.Any())
                return Message3<List<ProductType>>(false, "No product types were created because they were not sent correctly. Please try again.");

            var createdProductTypes = await _productTypeMapper.PerformAction(productTypes, x => _productTypeClient.AddProductType(x));
            return List2(createdProductTypes.ToList());
        }

        /// <summary>
        /// Edit existing product types.
        /// </summary>
        [WebInvoke(UriTemplate = "edit")]
        public async Task<Response<List<ProductType>>> EditProductType(List<ProductType> productTypes)
        {
            if (productTypes == null || !productTypes.Any())
                return Message3<List<ProductType>>(false, "No product types were edited because they were not sent correctly. Please try again.");

            var editedProductTypes = await _productTypeMapper.PerformAction(productTypes, (a, b) => _productTypeClient.UpdateProductType(a, b.Id));
            return List2(editedProductTypes.ToList());
        }

        /// <summary>
        /// Delete existing product types.
        /// </summary>
        [WebInvoke(UriTemplate = "delete")]
        public async Task<Response<List<ProductType>>> DeleteProductType(List<ProductType> productTypes)
        {
            if (productTypes == null || !productTypes.Any())
                return Message3<List<ProductType>>(false, "No product types were deleted because they were not sent correctly. Please try again.");

            var deletedProducts = await _productTypeMapper.PerformAction(productTypes, x => _productTypeClient.DeleteProductType(x.Id));

            return List2(deletedProducts.ToList());
        }
    }
}
