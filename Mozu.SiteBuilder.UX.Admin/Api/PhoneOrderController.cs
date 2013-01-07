using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using AutoMapper;
using Volusion.Api.Contracts.Client;
using Volusion.OrderService.Contracts;
using Volusion.OrderService.Contracts.Clients;
using Volusion.ProductRuntime.Contracts.Clients;
using Volusion.SiteBuilder.UX.Admin.Api;
using Volusion.SiteBuilder.UX.Admin.Api.Models;
using RuntimeProductContract = Volusion.ProductRuntime.Contracts.Product;
using RuntimeProductDTO = Mozu.SiteBuilder.UX.Admin.Api.Models.PhoneOrder.RuntimeProduct;
using RuntimeProductSearchResultContract = Volusion.ProductRuntime.Contracts.ProductSearchResult;
using SearchSuggestionContract = Volusion.ProductRuntime.Contracts.SearchSuggestion;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// This controller pertains to everything you ever wanted to know about phone orders, but were afraid to ask.
    /// </summary>
    [ServiceContract]
    public class PhoneOrderApi : BaseApi
    {
        IProductRuntimeWebApiClient _productClient;
        IProductSearchWebApiClient _searchClient;
        IOrderWebApiClient _orderClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public PhoneOrderApi(Volusion.ProductRuntime.Contracts.Clients.IProductRuntimeWebApiClient productClient, IProductSearchWebApiClient searchClient, IOrderWebApiClient orderClient)
        {
            _productClient = productClient;
            _searchClient = searchClient;
            _orderClient = orderClient;
        }

        [WebGet(UriTemplate = "/productX/{productCode}")]
        public Response<RuntimeProductContract> GetProductRaw(string productCode)
        {
            ServiceClientResponse<RuntimeProductContract> res = _productClient.GetProduct(productCode, null, null, null).Result;
            RuntimeProductContract prod = res.ReadAsSync();
            // var product = Mapper.Map<CatalogProduct>(prod);

            return Single<RuntimeProductContract>(prod);
        }

        [WebGet(UriTemplate = "/product/{productCode}")]
        public Response<RuntimeProductDTO> GetProduct(string productCode)
        {
            ServiceClientResponse<RuntimeProductContract> res = _productClient.GetProduct(productCode, null, null, null).Result;
            RuntimeProductContract prod = res.ReadAsSync();

            RuntimeProductDTO product = Mapper.Map<RuntimeProductDTO>(prod);

            return Single<RuntimeProductDTO>(product);
        }

        [WebGet(UriTemplate = "/productsuggest?q={query}")]
        public Response<List<string>> SuggestProduct(string query)
        {
            ServiceClientResponse<SearchSuggestionContract> res = _searchClient.Suggest(query, null).Result;

            SearchSuggestionContract ss = res.ReadAsSync();

            return List<string>(ss.Suggestions);
        }

        [WebGet(UriTemplate = "/productsearch?q={query}")]
        public Response<List<RuntimeProductContract>> SearchProduct(string query)
        {
            ServiceClientResponse<RuntimeProductSearchResultContract> res = _searchClient.Search(query, null, null, null, null, null, null, null, null, null).Result;

            RuntimeProductSearchResultContract r = res.ReadAsSync();
            // var product = Mapper.Map<CatalogProduct>(prod);

            return List<RuntimeProductContract>(r.Items);
        }

        [WebInvoke(Method="POST",UriTemplate = "/order/stuffit")]
        public Response<OrderDTO> StuffAnOrderIntoABox(OrderDTO order)
        {
            var o = new Order();

            o.Items.AddRange(order.Items);

            ServiceClientResponse<Order> res = _orderClient.CreateOrder(o).Result;

            Order r = res.ReadAsSync();
            // var product = Mapper.Map<CatalogProduct>(prod);

            return Single<OrderDTO>(order);
        }

        [DataContract]
        public class OrderDTO
        {
            [DataMember]
            public List<OrderItem> Items { get; set; }
        }
    }
}