using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using DC = Mozu.ProductAdmin.Contracts;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;
using ProductInSiteInfo = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.ProductInSiteInfo;

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

            List<ProductInSiteInfo> returned = Mapper.Map<List<ProductInSiteInfo>>(product.ProductInSites);

            // inject ProductCode into the return object. ExtJS needs this.
            returned.Each(pisi => pisi.ProductCode = productCode);

            return List(returned, returned.Count);
        }

        [WebInvoke(UriTemplate = "create")]
        public Task<Response<List<ProductInSiteInfo>>> CreateProductInSiteInfo(List<ProductInSiteInfo> pisos)
        {
            List<ProductInSiteInfo> returned = new List<ProductInSiteInfo>();

            foreach (ProductInSiteInfo piso in pisos)
            {
                DC.ProductInSiteInfo dcpiso = Mapper.Map<DC.ProductInSiteInfo>(piso);

                // TODO: service call should go here
                DC.Product p = ProductController.GetProduct(piso.ProductCode, _ctx);
                if (p == null)
                    throw new ArgumentException("Product not found: " + piso.ProductCode);
                p.ProductInSites.Add(dcpiso);

                var returnedPisi = Mapper.Map<ProductInSiteInfo>(dcpiso);
                
                // inject ProductCode into the return object. ExtJS needs this.
                returnedPisi.ProductCode = piso.ProductCode;

                returned.Add(returnedPisi);
            }

            return List<ProductInSiteInfo>(returned);
        }


        [WebInvoke(UriTemplate = "edit?id={id}")]
        public Task<Response<List<Product>>> EditProduct(List<Product> products, int? id = null)
        {
            throw new NotImplementedException();
        }
    }
}
