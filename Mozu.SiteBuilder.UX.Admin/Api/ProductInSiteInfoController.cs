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
using ProductInSiteInfo = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for the product delta, ProductInSiteInfo.
    /// TODO: The Mozu service for this is not currently available.
    /// TODO: This controller is tightly coupled to the ProductController,
    /// TODO: which maintains an in-memory cache of Products.
    /// </summary>
    [ServiceContract]
    public class ProductInSiteInfoController : BaseController
    {
        private readonly IProductWebApiClient _productClient;
        private IApiContext _ctx;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductInSiteInfoController(IProductWebApiClient productClient, IApiContext ctx)
        {
            _productClient = productClient;
            _ctx = ctx;
        }

        [WebGet(UriTemplate = "list")]
        public Task<Response<List<ProductInSiteInfo>>> GetProductInSiteInfoList([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter)
        {
            // TODO: Need to switch this to ProductCode
            string productCode = extFilter.GetValue<string>("productCode");

            if (string.IsNullOrEmpty(productCode))
            {
                return EmptyList<ProductInSiteInfo>();
            }

            DC.Product product = ProductController.GetProduct(productCode, _ctx);

            if (pagingParams.id != null)
            {
                int siteId = Convert.ToInt32(pagingParams.id);
                DC.ProductInSiteInfo pisi = product.ProductInSites.FirstOrDefault(p => p.SiteId == siteId);
                return List(Mapper.Map<ProductInSiteInfo>(pisi));
            }

            string filter = OldProductController.CreateFilter(extFilter);
            string sort = OldProductController.CreateSort(pagingParams);

            // res = _productClient.GetProducts(pagingParams.startIndex, pagingParams.pageSize, sort, null, filter).Result.ReadAsAsync().Result;

            return List(Mapper.Map<List<ProductInSiteInfo>>(product.ProductInSites), product.ProductInSites.Count);
        }

        [WebInvoke(UriTemplate = "create")]
        public Task<Response<List<Product>>> CreateProductInSiteInfo(List<Product> products)
        {
            throw new NotImplementedException();
        }


        [WebInvoke(UriTemplate = "edit?id={id}")]
        public Task<Response<List<Product>>> EditProduct(List<Product> products, int? id = null)
        {
            throw new NotImplementedException();
        }
    }
}
