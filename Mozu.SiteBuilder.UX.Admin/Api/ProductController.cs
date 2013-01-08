using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.Threading.Tasks;
using Mozu.ProductAdmin.Contracts.Clients;
using System.ServiceModel.Web;
using Mozu.SiteBuilder.UX.Admin.Api.Models.ProductModels;
using DC = Mozu.ProductAdmin.Contracts;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using AutoMapper;
using System.Net.Http;
using System.Text;
using System.Linq.Expressions;
using System.Web.Mvc;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    [ServiceContract]
    public class ProductController : BaseController
    {
        private readonly IProductWebApiClient _productClient;

        public ProductController(IProductWebApiClient productClient)
        {
            _productClient = productClient;
        }

        [WebGet(UriTemplate = "/autocomplete/?query={query}&value={productIdsString}")]
        public Task<Response<List<AutoCompleteField<string>>>> SearchByName(string query, FilterCollection extFilter, string productIdsString)
        {
            var filter = string.Empty;

            if (!string.IsNullOrEmpty(productIdsString))
            {
                var prodIds = productIdsString.Split(new char[] { ',', ' ' }, System.StringSplitOptions.RemoveEmptyEntries).Select(x => x).ToArray();

                for(var x = 0; x < prodIds.Length; x++)
                {
                    filter += ((x == 0) ? string.Empty : " ") + "productcode eq " + prodIds[x] + ((x < prodIds.Length - 1) ? " or " : string.Empty);
                }  
            }
            else if (!string.IsNullOrEmpty(query))
            {
                filter = string.Format("Content.ProductName cont \"{0}\" or ProductCode cont \"{0}\"", query);
            }

            var ret = _productClient.GetProducts(0, 500, null, null, filter).Result.ReadAsAsync().Result.Items;
            
             
            var retList = ret.Select(p => new AutoCompleteField<string>
            {
                Display = p.Content.ProductName, Path = p.Content.ProductName, Value = p.ProductCode
            }).ToList();

            return List(retList);
        }

        [WebInvoke(UriTemplate = "/create?id={id}")]
        public Task<Response<List<Product>>> CreateProduct(List<Product> products)
        {
            var retList = (from vm in products
                           select Mapper.Map<DC.Product>(vm) into dm
                           let ret = _productClient.AddProduct(dm).Result.ReadAsAsync().Result
                           select ret ?? dm into ret
                           select Mapper.Map<Product>(ret)).ToList();

            return List(retList);
        }

        [WebInvoke(UriTemplate = "/edit?id={id}")]
        public Task<Response<List<Product>>> EditProduct(List<Product> products, int? id = null)
        {
            var retList = (from vm in products
                           select Mapper.Map<DC.Product>(vm) into dm
                           select _productClient.UpdateProduct(dm, dm.ProductCode).Result.ReadAsAsync().Result into ret
                           select Mapper.Map<Product>(ret)).ToList();

            return List(retList);
        }



        [WebInvoke(Method = "POST", UriTemplate = "/delete")]
        public Task<Response<Product>> DeleteProduct(List<Product> products)
        {
            foreach (var vm in products)
            {
                _productClient.DeleteProduct(vm.ProductCode).Wait();
            }

            return SuccessWithTotal<Product>(products.Count);
        }

        [WebInvoke(Method = "POST", UriTemplate = "/duplicate/?id={id}")]
        public Task<Response<Product>> DuplicateProduct(string id)
        {
            // NOTE: id == ProductCode
            var origProd = _productClient.GetProductByProductCode(id,null).Result.ReadAsSync();

            origProd.Id = null;
            origProd.ProductCode += "-COPY";

            if (origProd.Content != null)
            {
                origProd.Content.ProductName += "-COPY";
            }

            var newProd = _productClient.AddProduct(origProd).Result.ReadAsSync();

            return Single(Mapper.Map<Product>(newProd));
        }

        [WebGet(UriTemplate = "/list")]
        public Task<Response<List<Product>>> GetProductList(PagingParamaters pagingParams, FilterCollection extFilter)
        {
            if (pagingParams.id != null)
            {
                var prod = _productClient.GetProductByProductCode(pagingParams.id,null).Result.ReadAsSync();
                return List(Mapper.Map<Product>(prod));
            }

            var filter = CreateFilter(extFilter);
            var sort = CreateSort(pagingParams);
           

            var res = _productClient.GetProducts(pagingParams.startIndex, pagingParams.pageSize, sort, null, filter).Result.ReadAsAsync().Result;

            return List(Mapper.Map<List<Product>>(res.Items), (int) res.TotalCount);
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
                        sb.Append(PropertyGuy.Convert(x => x.ProductCode ));
                        break;
                    case "stockonhand":
                        sb.Append(PropertyGuy.Convert(x => x.StockAvailable ));
                        break;
                    default:
                        {
                            throw new InvalidOperationException("unknown sort.property " + sort.property);
                        }
                }
                sb.Append (sort.IsAscending ? " asc" : " desc");
            }

            return sb.ToString();
        }

        private static string CreateFilter(FilterCollection extFilter)
        {
            if (!string.IsNullOrEmpty(extFilter.query))
                extFilter.Add(new FilterCollectionItem { comparison = "cont", field = PropertyGuy.Convert(x => x.Content.ProductName), value = extFilter.query });

            if (extFilter.Count == 0)
                return null;

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
            
            return sb.ToString();
        }
    }
}