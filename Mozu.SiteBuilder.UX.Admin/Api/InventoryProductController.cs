using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Text;
using System.Threading.Tasks;
using System.Web.Mvc;
using AutoMapper;
using Mozu.ProductAdmin.Contracts.Clients;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class InventoryProductController : BaseController
    {
        private readonly IProductWebApiClient _productClient;
        private const string BaseFilter = "isVariation eq true or hasConfigurableOptions eq false ";
        private const string ResponseGroups = "BaseProductCode,VariationOptions";

        public InventoryProductController(IProductWebApiClient productClient)
        {
            _productClient = productClient;
        }

        [WebInvoke(UriTemplate = "edit?id={id}")]
        public Task<Response<List<Product>>> EditProduct(List<Product> products, int? id = null)
        {
            
            
            foreach (var prod in products)
            {
                if ( prod.StockOnHand.HasValue )
                {
                    //tbd.... get all dc prods at once.
                    var dcProd = _productClient.GetProductByProductCode(prod.ProductCode, ResponseGroups).Result.ReadAsSync();
                    ////tbd.... queu all the updates
                    _productClient.UpdateProductStock(new DC.StockOnHandAdjustment() {Type = "Absolute", Value = prod.StockOnHand.Value}, prod.ProductCode ).Result.ReadAsSync();
                  
                }
            }
            return List(products);
        }
        [WebGet(UriTemplate = "list")]
        public Task<Response<List<Product>>> GetProductList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var prod = _productClient.GetProductByProductCode(pagingParams.id, ResponseGroups).Result.ReadAsSync();
                return List(Mapper.Map<Product>(prod));
            }

            var filter = CreateFilter(extFilter);
            var sort = CreateSort(pagingParams);


            var res = _productClient.GetProducts(pagingParams.startIndex, pagingParams.pageSize, sort, ResponseGroups, filter).Result.ReadAsSync();

            return List(Mapper.Map<List<Product>>(res.Items), (int)res.TotalCount);
        }

        class PropertyGuy
        {
            public static string Convert<T>(Expression<Func<DC.Product, T>> exp)
            {
                return ExpressionHelper.GetExpressionText(exp);
            }

        }
        private static string CreateSort(PagingParamaters pageing)
        {
            if (pageing == null || pageing.sort == null || pageing.sort.Count == 0)
                return null;



            var sb = new StringBuilder();

            foreach (var sort in pageing.sort)
            {
                if (sb.Length > 0)
                {
                    sb.Append(" and ");
                }

                switch (sort.property.ToLowerInvariant())
                {
                    case "categoryids":
                        sb.Append("CategoryId");
                        break;
                    case "isactive":
                        sb.Append(PropertyGuy.Convert(x => x.IsActive));
                        break;
                    case "productname":
                    case "name":
                        sb.Append(PropertyGuy.Convert(x => x.Content.ProductName));

                        break;
                    case "saleprice":
                    case "price":
                        sb.Append(PropertyGuy.Convert(x => x.Price.Price));

                        break;
                    case "productcode":
                        sb.Append(PropertyGuy.Convert(x => x.ProductCode));
                        break;
                    case "stockonhand":
                        sb.Append(PropertyGuy.Convert(x => x.StockAvailable));
                        break;
                    default:
                        {
                            throw new InvalidOperationException("unknown sort.property " + sort.property);
                        }
                }
                sb.Append(sort.IsAscending ? " asc" : " desc");
            }

            return sb.ToString();
        }

        private static string CreateFilter(FilterCollection extFilter)
        {
            if (!string.IsNullOrEmpty(extFilter.query))
                extFilter.Add(new FilterCollectionItem { comparison = "cont", field = PropertyGuy.Convert(x => x.Content.ProductName), value = extFilter.query });

            if (extFilter.Count == 0)
                return BaseFilter ;

            var sb = new StringBuilder();

            foreach (var filter in extFilter)
            {
                if (sb.Length > 0)
                {
                    sb.Append(" and ");
                }

                switch (filter.property.ToLowerInvariant())
                {
                    case "categoryids":
                        sb.AppendFormat("CategoryId {1} {0}", filter.value, filter.comparison);
                        break;
                    case "isactive":
                        sb.AppendFormat("{2} {1} {0}", filter.value, filter.comparison, PropertyGuy.Convert(x => x.IsActive));
                        break;
                    case "productname":
                    case "name":
                        sb.AppendFormat("({1} cont \"{0}\" or {2} cont \"{0}\")", filter.value, PropertyGuy.Convert(x => x.Content.ProductName), PropertyGuy.Convert(x => x.ProductCode));

                        break;
                    case "price":
                        sb.AppendFormat("{2} {1} {0}", filter.value, filter.comparison, PropertyGuy.Convert(x => x.Price.Price));
                        break;
                }
            }
            if (sb.Length == 0)
            {
                return BaseFilter;
            }
            sb.Insert(0, " and( ");
            sb.Insert(0,BaseFilter);
            sb.Append(")");
            return sb.ToString();
            
        }
    }
}