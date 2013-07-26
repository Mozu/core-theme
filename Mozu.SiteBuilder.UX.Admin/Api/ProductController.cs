using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.Core.Api.Routing;
using Mozu.ProductAdmin.Contracts;
using Mozu.ProductAdmin.Contracts.Clients;
using Mozu.SiteBuilder.Mvc.Extensions;
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
            string responseGroups = extFilter.SearchType == "global" ? "min":"all";

            string filter = extFilter.ToFilterString();
            string sort = pagingParams.sort.ToSortString();

            ProductCollection res = (await _productClient.GetProducts( startIndex : pagingParams.startIndex ,pageSize: pagingParams.pageSize, sortBy: sort,responseGroups:responseGroups, filter:filter)).ReadAsSync();

            var mapped = res.Items.Map<List<Product>>();
            return List2(mapped, (int)res.TotalCount);
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
    }
}
