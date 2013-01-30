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
using Mozu.SiteBuilder.UX.Admin.MockServices;
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
    /// 
    /// Important: When dealing with the Mozu services, we deal with the top-level Product object.
    /// ProductInSiteInfo is a sub-resource of that, so this controller looks up the parent Product,
    /// updates the whole object tree appropriately, and then sends the updated Product to the service.
    /// </summary>
    [ServiceContract]
    public class ProductInSiteInfoController : BaseController
    {
        private readonly IProductWebApiClient _productClient;
        private IApiContext _ctx;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductInSiteInfoController(IMoreAwesomeProductWebApiClient productClient)
        {
            _productClient = productClient;
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

            DC.Product product = _productClient.GetProductByProductCode(pagingParams.id, null).Result.ReadAsSync();

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

                DC.Product p = _productClient.GetProductByProductCode(piso.ProductCode, null).Result.ReadAsSync();

                if (p == null)
                    throw new ArgumentException("Product not found: " + piso.ProductCode);
                p.ProductInSites.Add(dcpiso);

                ProductInSiteInfo returnedPisi = Mapper.Map<ProductInSiteInfo>(dcpiso);
                
                // inject ProductCode into the return object. ExtJS needs this.
                returnedPisi.ProductCode = piso.ProductCode;

                returned.Add(returnedPisi);
            }

            return List<ProductInSiteInfo>(returned);
        }


        [WebInvoke(UriTemplate = "edit")]
        public Task<Response<List<Product>>> EditProduct(List<ProductInSiteInfo> pisos)
        {
            List<ProductInSiteInfo> returned = new List<ProductInSiteInfo>();

            foreach (ProductInSiteInfo pisi in pisos)
            {
                DC.ProductInSiteInfo dcpiso = Mapper.Map<DC.ProductInSiteInfo>(pisi);

                DC.Product p = _productClient.GetProductByProductCode(pisi.ProductCode, null).Result.ReadAsSync();
                if (p == null)
                    throw new ArgumentException("Product not found: " + pisi.ProductCode);

                int existingPisoIndex = p.ProductInSites.FindIndex(x => x.SiteId == dcpiso.SiteId);
                if (existingPisoIndex >= 0)
                    p.ProductInSites[existingPisoIndex] = dcpiso;
                else
                    p.ProductInSites.Add(dcpiso);

                ProductInSiteInfo returnedPisi = Mapper.Map<ProductInSiteInfo>(dcpiso);
                p.ProductInSites.Add(dcpiso);
            }

            return null;
        }
    }
}