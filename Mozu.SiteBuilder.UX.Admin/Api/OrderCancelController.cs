using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using AutoMapper;
using Mozu.CommerceRuntime.Contracts.Orders;
using Mozu.Core.Api.Authorization;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Newtonsoft.Json;
using DC = Mozu.CommerceRuntime.Contracts.Orders;
using DCp = Mozu.CommerceRuntime.Contracts.Products;
using Order = Mozu.SiteBuilder.UX.Admin.Api.Models.Order.Order;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class CancelReasonArgs
        {
            public string Category { get; set; }
        }
        [HttpGetRoute(UriTemplate = "cancel/reasons")]
        public async Task<Response<List<CancelReasonItem>>> GetReasons(CancelReasonArgs args, [FromUri]bool draft = false)
        {
            var reasons = (await _orderWebApiClient.GetReasons()).ReadAsSync();

            return List2(Mapper.Map<List<CancelReasonItem>>(reasons.Items), reasons.TotalCount);
        }

        public class CancelOrderItemsArgs
        {
            public string OrderId { get; set; }
            public List<BulkCancelItem> Items { get; set; }
        }
        [HttpPutRoute(UriTemplate = "cancel/items")]
        public async Task<Response<Order>> CancelItems(CancelOrderItemsArgs args)
        {
            var dcOrder = (await _orderWebApiClient.CancelItems(args.OrderId, args.Items)).ReadAsSync();
            return Single2(Mapper.Map<Order>(dcOrder));
        }

        public class CancelOrderArgs
        {
            public string OrderId { get; set; }
            public CanceledReason Reason { get; set; }
        }
        [HttpPutRoute(UriTemplate = "cancel")]
        public async Task<Response<Order>> CancelOrder(CancelOrderArgs args)
        {
            var dcOrder = (await _orderWebApiClient.CancelOrder(args.OrderId, args.Reason)).ReadAsSync();
            return Single2(Mapper.Map<Order>(dcOrder));
        }

        public class OrderItemCancelArgs
        {
            public string OrderId { get; set; }
            public string OrderItemId { get; set; }
        }
        [HttpGetRoute(UriTemplate = "cancel/cancelitem")]
        [BehaviorAuthorization(true, typeof(Core.Behaviors.OrderReadBehavior))]
        public async Task<Response<CanceledOrderItemCollection>> GetCanceledItems(OrderItemCancelArgs args, [FromUri]bool draft = false)
        {
            CanceledOrderItemCollection canceledItemCollection = null;
            if (string.IsNullOrEmpty(args.OrderItemId))
                canceledItemCollection = (await _orderWebApiClient.GetCanceledItems(args.OrderId, draft: draft)).ReadAsSync();
            else
                canceledItemCollection = (await _orderWebApiClient.GetCanceledItem(args.OrderId, args.OrderItemId, draft: draft)).ReadAsSync();

            return Single2(Mapper.Map<CanceledOrderItemCollection>(canceledItemCollection));
        }
    }
}
