using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using DC = Mozu.CommerceRuntime.Contracts.Orders;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        /*
         * All order item operations have an updateMode attribute.
         * Valid options are: ApplyToOriginal, ApplyToDraft, and ApplyAndCommit
         */
        public class AddOrderItemArgs
        {
            public string OrderId { get; set; }
            public List<OrderItem> OrderItems { get; set; }

        }
        [HttpPostRoute(UriTemplate = "items/add")]
        public async Task<Response<List<OrderItem>>> AddOrderItem(AddOrderItemArgs args)
        {
            List<OrderItem> returnItems = new List<OrderItem>();
            foreach (var item in args.OrderItems)
            {
                var orderItem = (await _orderWebApiClient.CreateOrderItem(args.OrderId, item.Map<DC.OrderItem>(), "ApplyToDraft")).ReadAsSync();
                returnItems.Add(orderItem.Map<OrderItem>());
            }

            return List2( returnItems );
        }

        // public async Task<Response<List<OrderItem>>> UpdateOrderItemQuantity(AddOrderItemArgs args)
        // {
        //     
        // }
        // 
        // public async Task<Response<List<OrderItem>>> DeleteOrderItem(AddOrderItemArgs args)
        // {
        //     // _orderWebApiClient.orderi
        // }

    }
}
