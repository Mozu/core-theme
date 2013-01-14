using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Order.Contracts.Clients;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using OrderContract = Mozu.Order.Contracts.Order;
using OrderItemContract = Mozu.Order.Contracts.OrderItem;
using RuntimeProductContract = Mozu.ProductRuntime.Contracts.Product;
using RuntimeProductDTO = Mozu.SiteBuilder.UX.Admin.Api.Models.PhoneOrder.RuntimeProduct;
using RuntimeProductSearchResultContract = Mozu.ProductRuntime.Contracts.ProductSearchResult;
using SearchSuggestionContract = Mozu.ProductRuntime.Contracts.SearchSuggestion;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// This controller pertains to everything you ever wanted to know about phone orders, but were afraid to ask.
    /// </summary>
    [ServiceContract]
    public class PhoneOrderController : BaseController
    {
        IProductRuntimeWebApiClient _productClient;
        IProductSearchWebApiClient _searchClient;
        IOrderWebApiClient _orderClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PhoneOrderController(IProductRuntimeWebApiClient productClient, IProductSearchWebApiClient searchClient, IOrderWebApiClient orderClient)
        {
            _productClient = productClient;
            _searchClient = searchClient;
            _orderClient = orderClient;
        }

        [WebGet(UriTemplate = "productX/{productCode}")]
        public Task<Response<RuntimeProductContract>> GetProductRaw(string productCode)
        {
            ServiceClientResponse<RuntimeProductContract> res = _productClient.GetProduct(productCode, null, null, null).Result;
            RuntimeProductContract prod = res.ReadAsSync();
            // var product = Mapper.Map<CatalogProduct>(prod);

            return Single<RuntimeProductContract>(prod);
        }

        [WebGet(UriTemplate = "product/{productCode}")]
        public Task<Response<RuntimeProductDTO>> GetProduct(string productCode)
        {
            ServiceClientResponse<RuntimeProductContract> res = _productClient.GetProduct(productCode, null, null, null).Result;
            RuntimeProductContract prod = res.ReadAsSync();

            RuntimeProductDTO product = Mapper.Map<RuntimeProductDTO>(prod);

            return Single<RuntimeProductDTO>(product);
        }

        [WebGet(UriTemplate = "productsuggest?q={query}")]
        public Task<Response<List<string>>> GetSuggestProduct(string query)
        {
            ServiceClientResponse<SearchSuggestionContract> res = _searchClient.Suggest(query, null).Result;

            SearchSuggestionContract ss = res.ReadAsSync();

            return List<string>(ss.Suggestions);
        }

        [WebGet(UriTemplate = "productsearch?q={q}")]
        public Task<Response<List<RuntimeProductContract>>> GetProductSearch(string q)
        {
            ServiceClientResponse<RuntimeProductSearchResultContract> res = _searchClient.Search(q, null, null, null, null, null, null, null, null, null).Result;

            RuntimeProductSearchResultContract r = res.ReadAsSync();
            // var product = Mapper.Map<CatalogProduct>(prod);

            return List<RuntimeProductContract>(r.Items);
        }

        [WebInvoke(Method="POST",UriTemplate = "order/stuffit")]
        public Task<Response<OrderDTO>> StuffAnOrderIntoABox(OrderDTO order)
        {
            var o = new OrderContract();

            o.Items.AddRange(order.Items);

            ServiceClientResponse<OrderContract> res = _orderClient.CreateOrder(o).Result;

            OrderContract r = res.ReadAsSync();
            // var product = Mapper.Map<CatalogProduct>(prod);

            return Single<OrderDTO>(order);
        }

        [DataContract]
        public class OrderDTO
        {
            [DataMember]
            public List<OrderItemContract> Items { get; set; }
        }
    }
}