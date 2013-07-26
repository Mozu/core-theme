using System;
using System.Collections.Generic;
using System.Runtime.Serialization;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Contracts.Client;
using Mozu.Core.Api.Routing;
using Mozu.ProductRuntime.Contracts.Clients;
using Mozu.SiteBuilder.UX.Admin.Api;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
//using OrderContract = Mozu.Order.Contracts.Order;
//using OrderItemContract = Mozu.Order.Contracts.OrderItem;
using RuntimeProductContract = Mozu.ProductRuntime.Contracts.Product;
using RuntimeProductDTO = Mozu.SiteBuilder.UX.Admin.Api.Models.PhoneOrder.RuntimeProduct;
using RuntimeProductSearchResultContract = Mozu.ProductRuntime.Contracts.ProductSearchResult;
using SearchSuggestionContract = Mozu.ProductRuntime.Contracts.SearchSuggestion;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    /// <summary>
    /// This controller pertains to everything you ever wanted to know about phone orders, but were afraid to ask.
	/// </summary>
    [WebApi("app/phoneorder", SuppressDescriptorGeneration = true)]
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

		[HttpGetRoute(UriTemplate = "product/{productCode}")]
        public async Task<Response<RuntimeProductContract>> GetProductRaw(string productCode)
        {
            RuntimeProductContract prod = (await _productClient.GetProduct(productCode, null, null, null)).ReadAsSync();
            // var product = Mapper.Map<CatalogProduct>(prod);

            return Single2<RuntimeProductContract>(prod);
        }

        [HttpGetRoute(UriTemplate = "product/{productCode}")]
        public async Task<Response<RuntimeProductDTO>> GetProduct(string productCode)
        {
            RuntimeProductContract prod = (await _productClient.GetProduct(productCode, null, null, null)).ReadAsSync();

            RuntimeProductDTO product = Mapper.Map<RuntimeProductDTO>(prod);

            return Single2<RuntimeProductDTO>(product);
        }

        [HttpGetRoute(UriTemplate = "productsuggest?q={query}")]
        public async Task<Response<List<string>>> GetSuggestProduct(string query)
        {
            SearchSuggestionContract ss = (await _searchClient.Suggest(query, null)).ReadAsSync();

            return List2<string>(ss.Suggestions);
        }

        [HttpGetRoute(UriTemplate = "productsearch?q={q}")]
        public async Task<Response<List<RuntimeProductContract>>> GetProductSearch(string q)
        {
            RuntimeProductSearchResultContract r = (await _searchClient.Search(q, null, null, null, null, null, null, null, null, null)).ReadAsSync();
            // var product = Mapper.Map<CatalogProduct>(prod);

            return List2<RuntimeProductContract>(r.Items);
        }

		//[HttpPostRoute(UriTemplate = "order/stuffit")]
        //public async Task<Response<OrderDTO>> StuffAnOrderIntoABox(OrderDTO order)
        //{
        //    var o = new OrderContract();

        //    o.Items.AddRange(order.Items);

        //    OrderContract r = (await _orderClient.CreateOrder(o)).ReadAsSync();

        //    return Single2<OrderDTO>(order);
        //}

        //[DataContract]
        //public class OrderDTO
        //{
        //    [DataMember]
        //    public List<OrderItemContract> Items { get; set; }
        //}
    }
}