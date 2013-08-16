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
using DCp = Mozu.CommerceRuntime.Contracts.Products;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
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
        public async Task<Response<Order>> AddOrderItem(AddOrderItemArgs args)
        {
            DC.Order dcOrder = null;

            foreach (var product in args.OrderItems)
            {
                // scrub the product.
                product.Options = (product.Options ?? Enumerable.Empty<DCp.ProductOption>()).Where(o => o.Value != null).ToList();
                product.Price = null;

                var dcOrderItem = new DC.OrderItem {
                    Quantity = product.Quantity,
                    Product = product
                };

                dcOrder = (await _orderWebApiClient.CreateOrderItem(args.OrderId, dcOrderItem, APPLY_TO_DRAFT)).ReadAsSync();
            }

            return Single2( dcOrder.Map<Order>() );
        }

        public class UpdateOrderItemArgs {
            public string OrderId { get; set; }
            public List<OrderItem> OrderItems { get; set; }
        }
        [HttpPostRoute(UriTemplate = "items/editquantity")]
        public async Task<Response<Order>> UpdateOrderItemQuantity(UpdateOrderItemArgs args)
        {
            DC.Order dcOrder = null;
            foreach (var item in args.OrderItems)
            {
                dcOrder = (await _orderWebApiClient.UpdateItemQuantity(args.OrderId, item.Id, item.Quantity, APPLY_TO_DRAFT)).ReadAsSync();
            }
        
            return Single2( dcOrder.Map<Order>() );
        }
        
        [HttpPostRoute(UriTemplate = "items/editprice")]
        public async Task<Response<Order>> UpdateOrderItemPrice(UpdateOrderItemArgs args)
        {
            DC.Order dcOrder = null;
            foreach (var item in args.OrderItems)
            {
                dcOrder = (await _orderWebApiClient.UpdateItemProductPrice(args.OrderId, item.Id, item.UnitPrice, APPLY_TO_DRAFT)).ReadAsSync();
            }

            return Single2( dcOrder.Map<Order>() );
        }

        public class RemoveOrderItemArgs
        {
            public string OrderId { get; set; }
            public List<string> OrderItemIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "items/remove")]
        public async Task<Response<Order>> RemoveOrderItem(RemoveOrderItemArgs args)
        {
            DC.Order dcOrder = null;

            foreach (var itemId in args.OrderItemIds)
            {
                dcOrder = (await _orderWebApiClient.DeleteOrderItem(args.OrderId, itemId, APPLY_TO_DRAFT)).ReadAsSync();
            }

            return Single2( dcOrder.Map<Order>() );
        }

        [HttpPostRoute(UriTemplate = "items/suppressdiscount")]
        public async Task<Response<Order>> SuppressItemDiscount(SuppressDiscountArgs args)
        {
            DC.Order dcOrder = null;
            DC.OrderItem dcOrderItem = (await _orderWebApiClient.GetOrderItem(args.OrderId, args.OrderItemId, true)).ReadAsSync();

            var discount = dcOrderItem.ProductDiscounts.FirstOrDefault(d => d.Discount.Id == args.DiscountId) ?? dcOrderItem.ShippingDiscounts.Select(sd => sd.Discount).FirstOrDefault(d => d.Discount.Id == args.DiscountId);

            if (discount != null)
            {
                discount.Excluded = true;
                dcOrder = (await _orderWebApiClient.UpdateOrderItemDiscount(args.OrderId, args.OrderItemId, discount.Discount.Id, discount, APPLY_TO_DRAFT)).ReadAsSync();
            }
            else
            {
                return Message3<Order>(false, "No discount found with id: " + args.DiscountId);
            }

            return Single2( dcOrder.Map<Order>() );
        }

    }
}
