using System;
using System.Collections.Generic;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Attributes;
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
                /*startIndex: */     pagingParams.startIndex, 
                /*pageSize: */       pagingParams.pageSize, 
                /*sortBy: */         sort, 
                /*responseGroups: */ null, 
                /*filter: */         filter
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
            List<ProductType> createdProductTypes = new List<ProductType>(productTypes.Count);
            foreach (ProductType p in productTypes)
            {
                DC.ProductType dataModel = Mapper.Map<DC.ProductType>(p);
                DC.ProductType returned;

                try
                {
                    var result = await _productTypeClient.AddProductType(dataModel);
                    returned = result.ReadAsAsync().Result;
                }
                catch (AggregateException e)
                {
                    return FailureList2<ProductType>(e.UnwrapAgg().Message);
                }

                createdProductTypes.Add(Mapper.Map<ProductType>(returned));
            }

            return List2(createdProductTypes);
        }

        /// <summary>
        /// Edit existing product types.
        /// </summary>
        [WebInvoke(UriTemplate = "edit")]
        public async Task<Response<List<ProductType>>> EditProductType(List<ProductType> productTypes)
        {
            List<ProductType> editedProductTypes = new List<ProductType>(productTypes.Count);

            foreach (ProductType pt in productTypes)
            {
                DC.ProductType mappedPt = Mapper.Map<DC.ProductType>(pt);
                var res = await _productTypeClient.UpdateProductType(mappedPt, pt.Id);
                DC.ProductType returned = res.ReadAsAsync().Result;
                editedProductTypes.Add(Mapper.Map<ProductType>(returned));
            }

            return List2(editedProductTypes);
        }

        /// <summary>
        /// Delete existing product types.
        /// </summary>
        [WebInvoke(UriTemplate = "delete")]
        public async Task<Response<List<ProductType>>> DeleteProductType(List<ProductType> productTypes)
        {
            List<ProductType> deletedProducts = new List<ProductType>(productTypes.Count);
            foreach (ProductType pt in productTypes)
            {
                var result = await _productTypeClient.DeleteProductType(pt.Id);
                // TODO: check success
                deletedProducts.Add(pt);
            }

            return List2(deletedProducts);
        }
    }
}
