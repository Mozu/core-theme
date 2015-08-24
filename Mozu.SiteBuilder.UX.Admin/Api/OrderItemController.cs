using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web.Http;
using Mozu.Core.Api.Routing;
using Mozu.SiteBuilder.Mvc.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using Newtonsoft.Json;
using DC = Mozu.CommerceRuntime.Contracts.Orders;
using DCp = Mozu.CommerceRuntime.Contracts.Products;

namespace Mozu.SiteBuilder.UX.Admin.Api
{
    public partial class OrderController
    {
        public class ProductWithQuantityStuffedIntoIt : Mozu.CommerceRuntime.Contracts.Products.Product
        {
            [JsonProperty(PropertyName = "quantity")]
            public int Quantity { get; set; }

            [JsonProperty(PropertyName = "fulfillmentLocationCode")]
            public string FulfillmentLocationCode { get; set; }

            [JsonProperty(PropertyName = "fulfillmentMethod")]
            public string FulfillmentMethod { get; set; }
        }

        public class AddOrderItemArgs
        {
            public string OrderId { get; set; }

            // yes, technically this isn't a list of OrderItems, but the javascript wants to call it that.
            public List<ProductWithQuantityStuffedIntoIt> OrderItems { get; set; }

        }
        [HttpPostRoute(UriTemplate = "items/add")]
        public async Task<Response<Order>> AddOrderItem(AddOrderItemArgs args, [FromUri]bool draft = false)
        {
            DC.Order dcOrder = null;

            foreach (var product in args.OrderItems)
            {
                if (product == null)
                    continue;
                // todo: Need ProductType added to GetProducts, or do this differently when Digital downloads enabled. - Greg Murray on 2014-06-05 
                if (string.IsNullOrEmpty(product.GoodsType))
                {
                    product.GoodsType = (product.FulfillmentLocationCode == "Digital")
                        ? "DigitalCredit"
                        : "Physical";
                }

                // scrub the product.
                product.Options = (product.Options ?? Enumerable.Empty<DCp.ProductOption>()).Where(o => o.Value != null || o.ShopperEnteredValue != null).ToList();
                product.Price = null;

                var dcOrderItem = new DC.OrderItem
                {
                    Quantity = product.Quantity,
                    Product = product,
                    FulfillmentLocationCode = product.FulfillmentLocationCode,
                    FulfillmentMethod = product.FulfillmentMethod
                };

                dcOrder = (await _orderWebApiClient.CreateOrderItem(args.OrderId, dcOrderItem, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }

            return Single2(dcOrder.Map<Order>());
        }

        public class UpdateOrderItemArgs
        {
            public string OrderId { get; set; }
            public List<OrderItem> OrderItems { get; set; }
        }
        [HttpPostRoute(UriTemplate = "items/editquantity")]
        public async Task<Response<Order>> UpdateOrderItemQuantity(UpdateOrderItemArgs args, [FromUri]bool draft = false)
        {
            DC.Order dcOrder = null;
            foreach (var item in args.OrderItems)
            {
                dcOrder = (await _orderWebApiClient.UpdateItemQuantity(args.OrderId, item.Id, item.Quantity, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }

            return Single2(dcOrder.Map<Order>());
        }

        [HttpPostRoute(UriTemplate = "items/editprice")]
        public async Task<Response<Order>> UpdateOrderItemPrice(UpdateOrderItemArgs args, [FromUri]bool draft = false)
        {
            DC.Order dcOrder = null;
            foreach (var item in args.OrderItems)
            {
                dcOrder = (await _orderWebApiClient.UpdateItemProductPrice(args.OrderId, item.Id, item.UnitPrice, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }

            return Single2(dcOrder.Map<Order>());
        }

        [HttpPostRoute(UriTemplate = "items/editfulfillmentmethod")]
        public async Task<Response<Order>> UpdateOrderItemFulfillmentMethodAndCode(UpdateOrderItemArgs args, [FromUri]bool draft = false)
        {
            DC.Order dcOrder = null;

            foreach (var item in args.OrderItems)
            {
                dcOrder = (await _orderWebApiClient.UpdateItemFulfillment(args.OrderId, item.Id, new DC.OrderItem { FulfillmentMethod = item.FulfillmentMethod, FulfillmentLocationCode = item.FulfillmentLocationCode }, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }

            return Single2(dcOrder.Map<Order>());
        }


        public class RemoveOrderItemArgs
        {
            public string OrderId { get; set; }
            public List<string> OrderItemIds { get; set; }
        }
        [HttpPostRoute(UriTemplate = "items/remove")]
        public async Task<Response<Order>> RemoveOrderItem(RemoveOrderItemArgs args, [FromUri]bool draft = false)
        {
            DC.Order dcOrder = null;

            foreach (var itemId in args.OrderItemIds)
            {
                dcOrder = (await _orderWebApiClient.DeleteOrderItem(args.OrderId, itemId, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }

            return Single2(dcOrder.Map<Order>());
        }

        [HttpPostRoute(UriTemplate = "items/suppressdiscount")]
        public async Task<Response<Order>> SuppressItemDiscount(ActivateSuppressDiscountArgs args, [FromUri]bool draft = false)
        {
            DC.Order dcOrder = null;
            DC.OrderItem dcOrderItem = (await _orderWebApiClient.GetOrderItem(args.OrderId, args.OrderItemId, draft)).ReadAsSync();

            var discount = dcOrderItem.ProductDiscounts.FirstOrDefault(d => d.Discount.Id == args.DiscountId) ?? dcOrderItem.ShippingDiscounts.Select(sd => sd.Discount).FirstOrDefault(d => d.Discount.Id == args.DiscountId);

            if (discount != null)
            {
                discount.Excluded = true;
                dcOrder = (await _orderWebApiClient.UpdateOrderItemDiscount(args.OrderId, args.OrderItemId, discount.Discount.Id, discount, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }
            else
            {
                return Message3<Order>(false, "No discount found with id: " + args.DiscountId);
            }

            return Single2(dcOrder.Map<Order>());
        }

        [HttpPostRoute(UriTemplate = "items/activatediscount")]
        public async Task<Response<Order>> ActivateItemDiscount(ActivateSuppressDiscountArgs args, [FromUri]bool draft = false)
        {
            DC.Order dcOrder = null;
            DC.OrderItem dcOrderItem = (await _orderWebApiClient.GetOrderItem(args.OrderId, args.OrderItemId, draft)).ReadAsSync();

            var discount = dcOrderItem.ProductDiscounts.FirstOrDefault(d => d.Discount.Id == args.DiscountId) ?? dcOrderItem.ShippingDiscounts.Select(sd => sd.Discount).FirstOrDefault(d => d.Discount.Id == args.DiscountId);

            if (discount != null)
            {
                discount.Excluded = false;
                dcOrder = (await _orderWebApiClient.UpdateOrderItemDiscount(args.OrderId, args.OrderItemId, discount.Discount.Id, discount, draft ? APPLY_TO_DRAFT : APPLY_TO_ORIGINAL)).ReadAsSync();
            }
            else
            {
                return Message3<Order>(false, "No discount found with id: " + args.DiscountId);
            }

            return Single2(dcOrder.Map<Order>());
        }
    }
}
