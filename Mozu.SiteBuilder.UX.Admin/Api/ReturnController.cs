using System;
using System.Collections.Generic;
using System.Linq;
using System.ServiceModel;
using System.ServiceModel.Web;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Clients;
using Mozu.Core.Api.Routing;
using Mozu.Core.Settings;
using Mozu.SiteBuilder.Mvc.ActionFilters;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Mozu.SiteBuilder.UX.Admin.Helpers.OrderHelpers;
using DCo = Mozu.CommerceRuntime.Contracts.Orders;

namespace Mozu.SiteBuilder.UX.Admin.Api
{

    [WebApi("app/return", SuppressDescriptorGeneration = true)]
    public partial class ReturnController : BaseController
    {
        private readonly ISettings _settings;
        private IOrderWebApiClient _orderWebApiClient;
        private readonly IReturnWebApiClient _returnWebApiClient;

        /// <summary>
        /// Public constructor.
        /// </summary>
        public ReturnController(IOrderWebApiClient orderWebApiClient, IReturnWebApiClient returnWebApiClient, ISettings settings)
        {
            _settings = settings;
            _orderWebApiClient = orderWebApiClient;
            _returnWebApiClient = returnWebApiClient;
        }

		[HttpGetRoute(UriTemplate = "list")]
        public async Task<Response<List<Order>>> List([FromUri]PagingParamaters pagingParams, [FromUri]FilterCollection extFilter, [FromUri]bool draft=false)
		{
            throw new NotImplementedException();
            //var originalOrderId = extFilter.GetValue("originalOrderId");
            //if (originalOrderId != null)
            //{
                
            //}
            //_returnWebApiClient.GetReturns()
            //int? startIndex = pagingParams.startIndex;
            //int? pageSize = pagingParams.pageSize ?? 20;
            //string sort = (pagingParams != null && pagingParams.sort != null) ? pagingParams.sort.ToSortString() : null;

            //DCo.OrderCollection dcOrders = null;
            
            //// get single order
            //if (!string.IsNullOrEmpty(pagingParams.id))
            //{
            //    dcOrders = new DCo.OrderCollection() { Items = new List<DCo.Order>() };
            //    var order = (await _orderWebApiClient.GetOrder(pagingParams.id, draft)).ReadAsSync();
            //    if (order != null)
            //    {
            //        dcOrders.Items.Add(order);
            //    }
            //}
            //// get list of orders
            //else
            //{
            //    var filter = extFilter.ToFilterString();
            //    try
            //    {
            //        dcOrders = (await _orderWebApiClient.GetOrders(startIndex, pageSize, pagingParams.sort.ToSortString(), filter)).ReadAsSync();
            //    }
            //    catch (Exception)
            //    {
            //        dcOrders = new DCo.OrderCollection { Items = new List<DCo.Order>() };
            //    }
            //}

            //var orders = dcOrders != null ? Mapper.Map<List<Order>>(dcOrders.Items) : new List<Order>();

            //return List2(orders,(int) dcOrders.TotalCount );
        }

		[HttpPostRoute(UriTemplate = "cancel")]
        public async Task<Response<List<Order>>> CancelOrder(string orderId)
        {
            var dc = (await _orderWebApiClient.PerformOrderAction(orderId, new DCo.OrderAction { ActionName = "CancelOrder" })).ReadAsSync();

            return List2( Mapper.Map<Order>(dc) );
        }
    }
}
