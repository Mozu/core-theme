using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
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
        private const string APPLY_TO_ORIGINAL = "ApplyToOriginal";
        private const string APPLY_TO_DRAFT = "ApplyToDraft";
        private const string APPLY_AND_COMMIT = "ApplyAndCommit";

        public class ProductWithQuantityStuffedIntoIt : Mozu.CommerceRuntime.Contracts.Products.Product
        {
            public int Quantity { get; set; }
        }

        public class AddOrderItemArgs
        {
            public string OrderId { get; set; }

            // yes, technically this isn't a list of OrderItems, but the javascript wants to call it that.
            public List<ProductWithQuantityStuffedIntoIt> OrderItems { get; set; }

        }
        [HttpPostRoute(UriTemplate = "items/add")]
        public async Task<Response<List<OrderItem>>> AddOrderItem(AddOrderItemArgs args)
        {
            List<OrderItem> returnItems = new List<OrderItem>();
            foreach (var product in args.OrderItems)
            {
                // scrub the product.
                product.Options = product.Options.Where(o => o.Value != null).ToList();
                product.Price = null;

                var dcOrderItem = new DC.OrderItem {
                    Quantity = product.Quantity,
                    Product = product
                };

                var orderItem = (await _orderWebApiClient.CreateOrderItem(args.OrderId, dcOrderItem, APPLY_TO_DRAFT)).ReadAsSync();
                returnItems.Add(orderItem.Map<OrderItem>());
            }

            return List2( returnItems );
        }

        public class UpdateOrderItemArgs {
            public string OrderId { get; set; }
            public List<OrderItem> OrderItems { get; set; }
        }
        [HttpPostRoute(UriTemplate = "items/editquantity")]
        public async Task<Response<List<OrderItem>>> UpdateOrderItemQuantity(UpdateOrderItemArgs args)
        {
            List<OrderItem> returnItems = new List<OrderItem>();
            foreach (var product in args.OrderItems)
            {
                var orderItem = (await _orderWebApiClient.UpdateItemQuantity(args.OrderId, product.Id, product.Quantity, APPLY_TO_DRAFT)).ReadAsSync();
                returnItems.Add( orderItem.Map<OrderItem>() );
            }
        
            return List2( returnItems );
        }
        
        [HttpPostRoute(UriTemplate = "items/editprice")]
        public async Task<Response<List<OrderItem>>> UpdateOrderItemPrice(UpdateOrderItemArgs args)
        {
            List<OrderItem> returnItems = new List<OrderItem>();
            foreach (var item in args.OrderItems)
            {
                var orderItem = (await _orderWebApiClient.UpdateItemQuantity(args.OrderId, item.Id, item.Quantity, APPLY_TO_DRAFT)).ReadAsSync();
                returnItems.Add(orderItem.Map<OrderItem>());
            }
        
            return List2( returnItems );
        }


        public class RemoveOrderItemArgs
        {
            public string OrderId { get; set; }
            public List<string> OrderItemIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "items/remove")]
        public async Task<Response<List<OrderItem>>> RemoveOrderItem(RemoveOrderItemArgs args)
        {
            await Task.WhenAll(
                args.OrderItemIds.Select(oiid => _orderWebApiClient.DeleteOrderItem(args.OrderId, oiid, APPLY_TO_DRAFT))
            );

            return SuccessWithTotal2<List<OrderItem>>(args.OrderItemIds.Count);
        }
    }
}
