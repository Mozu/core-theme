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
    /// 
    /// Important: When dealing with the Mozu services, we deal with the top-level Product object.
    /// ProductInSiteInfo is a sub-resource of that, so this controller looks up the parent Product,
    /// updates the whole object tree appropriately, and then sends the updated Product to the service.
    /// </summary>
    [ServiceContract]
    public class ProductInSiteInfoController : BaseController
    {
        private readonly IProductWebApiClient _productClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ProductInSiteInfoController(IProductWebApiClient productClient)
        {
            _productClient = productClient;
        }

        [WebInvoke(UriTemplate = "create")]
        public async Task<Response<List<ProductInSiteInfo>>> CreateProductInSiteInfo(List<ProductInSiteInfo> pisis)
        {
            List<ProductInSiteInfo> returned = new List<ProductInSiteInfo>();

            foreach (ProductInSiteInfo pisi in pisis)
            {
                DC.ProductInSiteInfo dcpisi = Mapper.Map<DC.ProductInSiteInfo>(pisi);

                string productCode = pisi.ProductCode;
                var result = await _productClient.GetProduct(productCode, null);
                DC.Product p = result.ReadAsAsync().Result;

                if (p == null)
                    throw new ArgumentException("Product not found: " + productCode);

                if (p.ProductInSites == null)
                    p.ProductInSites = new List<DC.ProductInSiteInfo>(1);

                p.ProductInSites.Add(dcpisi);

                DC.Product returnedProduct = _productClient.UpdateProduct(p, productCode).Result.ReadAsAsync().Result;

                DC.ProductInSiteInfo returnedDcPisi = returnedProduct.ProductInSites.First(x => x.SiteId == pisi.SiteId);
                ProductInSiteInfo returnedPisi = Mapper.Map<ProductInSiteInfo>(returnedDcPisi);
                
                // inject ProductCode into the return object. ExtJS needs this.
                returnedPisi.ProductCode = pisi.ProductCode;

                returned.Add(returnedPisi);
            }

            return List2<ProductInSiteInfo>(returned);
        }


        [WebInvoke(UriTemplate = "edit")]
        public Task<Response<List<ProductInSiteInfo>>> EditProductInSiteInfo(List<ProductInSiteInfo> pisis)
        {
            List<ProductInSiteInfo> returned = new List<ProductInSiteInfo>();

            foreach (ProductInSiteInfo pisi in pisis)
            {
                DC.ProductInSiteInfo dcpisi = Mapper.Map<DC.ProductInSiteInfo>(pisi);

                DC.Product p = _productClient.GetProduct(pisi.ProductCode, null).Result.ReadAsAsync().Result;
                if (p == null)
                    throw new ArgumentException("Product not found: " + pisi.ProductCode);

                int existingPisoIndex = p.ProductInSites.FindIndex(x => x.SiteId == dcpisi.SiteId);
                if (existingPisoIndex >= 0)
                    p.ProductInSites[existingPisoIndex] = dcpisi;
                else
                    throw new ArgumentException("ProductInSiteInfo not found. Product: " + p.ProductCode + ". Site ID: " + pisi.SiteId);


                DC.Product returnedDcProduct = _productClient.UpdateProduct(p, p.ProductCode).Result.ReadAsAsync().Result;
                DC.ProductInSiteInfo returnedDcPisi = returnedDcProduct.ProductInSites.First(x => x.SiteId == pisi.SiteId);
                returned.Add(Mapper.Map<ProductInSiteInfo>(returnedDcPisi));
            }

            return List<ProductInSiteInfo>(returned);
        }

        [WebInvoke(UriTemplate = "delete")]
        public async Task<Response<List<ProductInSiteInfo>>> DeleteProductInSiteInfo(List<ProductInSiteInfo> pisis)
        {
            List<ProductInSiteInfo> deleted = new List<ProductInSiteInfo>(pisis.Count);
            foreach (ProductInSiteInfo pisi in pisis)
            {
                string productCode = pisi.ProductCode;
                var result = await _productClient.GetProduct(productCode);
                DC.Product p = result.ReadAsAsync().Result;

                if (p == null)
                    throw new ArgumentException("Product not found: " + productCode);

                int index = p.ProductInSites.FindIndex(x => x.SiteId == pisi.SiteId);
                DC.ProductInSiteInfo dcpisi;
                if (index >= 0)
                {
                    dcpisi = p.ProductInSites[index];
                    deleted.Add(Mapper.Map<ProductInSiteInfo>(dcpisi));
                    p.ProductInSites.RemoveAt(index);
                    await _productClient.UpdateProduct(p, productCode);
                }
                else
                {
                    throw new ArgumentException("ProductInSiteInfo not found for product. Site id: " + pisi.SiteId);
                }
            }

            return List2(deleted);
        }
    }
}