using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Helpers;
using Mozu.SiteBuilder.UX.Admin.Helpers.ProductHelpers;
using DC = Mozu.ProductAdmin.Contracts;
using Product = Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels.Product;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// Controller for products.
	/// </summary>
	[WebApi("app/inventoryproduct", SuppressDescriptorGeneration = true)]
    public class InventoryProductController : BaseController
    {
        private readonly CollectionTaskUnMapper<Product, DC.Product> _productMapper = new CollectionTaskUnMapper<Product, DC.Product>();

        private readonly IProductWebApiClient _productClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public InventoryProductController(IProductWebApiClient productClient)
        {
            _productClient = productClient;
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Product>>> ListProducts([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri] bool? withVariations = false)
        {
            if (pagingParams.id != null)
            {
                var result = await _productClient.GetProduct(pagingParams.id, null);
                DC.Product prod = result.ReadAsAsync().Result;
                return List2(Mapper.Map<Product>(prod));
            }

            string filter = extFilter.ToFilterString(withVariations);
            string sort = pagingParams.sort.ToSortString();

            ProductCollection res = _productClient.GetProducts(pagingParams.startIndex, pagingParams.pageSize, sort, null, filter).Result.ReadAsAsync().Result;

            return List2(Mapper.Map<List<Product>>(res.Items), (int)res.TotalCount);
        }



		[HttpPostRoute(UriTemplate = "edit")]
        public async Task<Response<List<Product>>> EditProduct(List<Product> products)
        {
            if (products == null || !products.Any())
                return Message3<List<Product>>(false, "No products were edited because they were not sent correctly. Please try again.");
            List<Product> retProds = new List<Product>();
            foreach (var prod in products)
            {
                var dcProd = (await _productClient.GetProduct(prod.ProductCode)).ReadAsSync();
                dcProd.StockOnHandAdjustment = Mapper.Map<DC.StockOnHandAdjustment>(prod.StockOnHandAdjustment);
                var retProd = (await _productClient.UpdateProduct(dcProd, dcProd.ProductCode)).ReadAsSync();
                retProds.Add(Mapper.Map<Product>(retProd));

            }

            //var editedProducts = await _productMapper.PerformAction(products, p => _productClient.UpdateProduct(p, p.ProductCode));
            return List2(retProds);
        }

       
    }
}
