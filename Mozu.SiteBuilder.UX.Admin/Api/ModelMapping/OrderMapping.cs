using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.AppDev.Contracts;
using Mozu.Core.Api.Contracts;
using Mozu.Core.Extensions;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using CommerceDC = Mozu.CommerceRuntime.Contracts.Commerce;
using DiscountDC = Mozu.CommerceRuntime.Contracts.Discounts;
using OrdersDC = Mozu.CommerceRuntime.Contracts.Orders;
using PaymentsDC = Mozu.CommerceRuntime.Contracts.Payments;
using ProductsDC = Mozu.CommerceRuntime.Contracts.Products;
using RefundsDC = Mozu.CommerceRuntime.Contracts.Refunds;
using ShippingDC = Mozu.CommerceRuntime.Contracts.Fulfillment;

// disable warning 618: Some discount contracts are marked 'Obsolete' but we really need them.
#pragma warning disable 618
namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class OrderMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Map_DcOrder_to_Order();
            Map_DcOrderItem_to_OrderItem();
            Map_BundledProduct_to_OrderItem();
            Map_DcAppliedProductDiscount_to_OrderItemDiscount();
            Map_DcShippingDiscount_to_ShippingDiscount();
            Map_DcPayment_to_OrderPayment();
            Map_DcPaymentInteraction_to_PaymentInteraction();
            Map_DcRefund_to_Refund();
            Map_DcPackage_to_OrderPackage();
            Map_DcPackageItem_to_OrderPackageItem();
            Map_DcPickupItem_to_OrderPickupItem();
            Map_DcPickup_to_OrderPickup();
            Map_DcDigitalPackage_to_OrderDigitalPackage();
            Map_DcDigitalPackageItem_to_OrderDigitalPackageItem();
            Map_DcAdjustment_to_Adjustment();
            Map_DcAppliedDiscount_to_OrderDiscount();
            Map_DcOrderNote_to_OrderNote();

            Map_OrderPackage_to_DcPackage();
            Map_OrderPackageItem_to_DcPackageItem();
            Map_OrderItem_to_DcOrderItem();
            Map_OrderItemDiscount_to_DcAppliedProductDiscount();
            Map_OrderPickupItem_to_DcPickupItem();
            Map_ShippingDiscount_to_DcShippingDiscount();
            Map_Adjustment_to_DcAdjustment();
            Map_OrderDiscount_to_DcAppliedDiscount();

            // cheese
            Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, decimal?>()
                .ConvertUsing(f => f == null ? null : f.Value);
        }

        private void Map_DcOrder_to_Order()
        {
            Mapper.CreateMap<OrdersDC.Order, Order>()
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.SiteId, op => op.ResolveUsing(dc => dc.SiteId))
                .ForMember(x => x.ChannelCode, op => op.ResolveUsing(dc => dc.ChannelCode))
                .ForMember(x => x.TenantId, op => op.ResolveUsing(dc => dc.TenantId))
                .ForMember(x => x.OrderType, op => op.ResolveUsing((OrdersDC.Order dc) => dc.Type))
                .ForMember(x => x.InvalidCoupons, op => op.ResolveUsing(dc => dc.InvalidCoupons))
                .ForMember(x => x.CouponCodes, op => op.ResolveUsing(dc => dc.CouponCodes))
                .ForMember(x => x.ParentOrderId, op => op.ResolveUsing(dc => dc.ParentOrderId))
                .ForMember(x => x.ParentReturnId, op => op.ResolveUsing(dc => dc.ParentReturnId))
                .ForMember(x => x.ExternalId, op => op.ResolveUsing(dc => dc.ExternalId))

                .ForMember(x => x.OrderNumber, op => op.ResolveUsing(dc => dc.OrderNumber))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.UpdateDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.UpdateDate : null))
                .ForMember(x => x.SubmittedDate, op => op.ResolveUsing(dc => dc.SubmittedDate))
                .ForMember(x => x.CustomerId, op => op.ResolveUsing(dc => dc.CustomerAccountId))
                .ForMember(x => x.BillingContact, op => op.ResolveUsing(dc => dc.BillingInfo != null && dc.BillingInfo.BillingContact != null 
                    ? dc.BillingInfo.BillingContact : null))
                .ForMember(x => x.FulfillmentContact, op => op.ResolveUsing(dc => (dc.FulfillmentInfo != null) 
                    ? dc.FulfillmentInfo.FulfillmentContact : null))
                .ForMember(x => x.ShippingMethodCode, op => op.ResolveUsing(dc => (dc.FulfillmentInfo != null) 
                    ? dc.FulfillmentInfo.ShippingMethodCode : null))
                .ForMember(x => x.ShippingMethodName, op => op.ResolveUsing(dc => (dc.FulfillmentInfo != null) 
                    ? dc.FulfillmentInfo.ShippingMethodName : null))
                .ForMember(x => x.IpAddress, op => op.ResolveUsing(dc => dc.IPAddress))
                .ForMember(x => x.Items, op => op.ResolveUsing(dc => dc.Items))
                .ForMember(x => x.ActiveOrderDiscount, op => op.ResolveUsing(dc => dc.OrderDiscounts != null 
                    ? dc.OrderDiscounts.FirstOrDefault(d => d.Excluded.HasValue && !d.Excluded.Value) : null))
                .ForMember(x => x.OrderDiscounts, op => op.ResolveUsing(dc => dc.OrderDiscounts))

                .ForMember(x => x.Attributes, op => op.ResolveUsing(dc => dc.Attributes))

                .ForMember(x => x.ActiveShippingDiscount, op => op.ResolveUsing(dc => dc.ShippingDiscounts != null 
                    ? dc.ShippingDiscounts.FirstOrDefault(d => d.Discount.Excluded.HasValue && !d.Discount.Excluded.Value) : null))
                .ForMember(x => x.ShippingDiscounts, op => op.ResolveUsing(dc => dc.ShippingDiscounts))
                .ForMember(x => x.CustomerNote, op => op.ResolveUsing(dc => dc.ShopperNotes != null ? dc.ShopperNotes.Comments : null))
                .ForMember(x => x.InternalNotes, op => op.ResolveUsing(dc => dc.Notes))
                .ForMember(x => x.OrderStatus, op => op.ResolveUsing(dc => dc.Status))
                .ForMember(x => x.FulfillmentStatus, op => op.ResolveUsing(dc => dc.FulfillmentStatus ))
                .ForMember(x => x.PaymentStatus, op => op.ResolveUsing(dc => dc.PaymentStatus))
                .ForMember(x => x.Payments, op => op.ResolveUsing(dc => dc.Payments != null ? dc.Payments.OrderByDescending(p => p.AuditInfo.CreateDate) : null))
                .ForMember(x => x.Refunds, op => op.ResolveUsing(dc => dc.Refunds))
                .ForMember(x => x.Packages, op => op.ResolveUsing(dc => dc.Packages))
                .ForMember(x => x.Pickups, op => op.ResolveUsing(dc => dc.Pickups))
                .ForMember(x => x.DigitalPackages, op => op.ResolveUsing(dc => dc.DigitalPackages ?? new List<ShippingDC.DigitalPackage>()))

                .ForMember(x => x.OrderAdjustment, op => op.ResolveUsing(dc => dc.Adjustment))
                .ForMember(x => x.ShippingAdjustment, op => op.ResolveUsing(dc => dc.ShippingAdjustment))

                .ForMember(x => x.Subtotal, op => op.ResolveUsing(dc => dc.Subtotal))
                .ForMember(x => x.DiscountedSubtotal, op => op.ResolveUsing(dc => dc.DiscountedSubtotal))
                .ForMember(x => x.DiscountTotal, op => op.ResolveUsing(dc => dc.DiscountTotal))
                .ForMember(x => x.DiscountedTotal, op => op.ResolveUsing(dc => dc.DiscountedTotal))
                .ForMember(x => x.HandlingTotal, op => op.ResolveUsing(dc => dc.HandlingTotal))
                .ForMember(x => x.FeeTotal, op => op.ResolveUsing(dc => dc.FeeTotal))
                .ForMember(x => x.ShippingSubtotal, op => op.ResolveUsing(dc => dc.ShippingSubTotal))
                .ForMember(x => x.ShippingTotal, op => op.ResolveUsing(dc => dc.ShippingTotal))
                .ForMember(x => x.TaxTotal, op => op.ResolveUsing(dc => dc.TaxTotal))
                .ForMember(x => x.Total, op => op.ResolveUsing(dc => dc.Total))
                .ForMember(x => x.AmountRefunded, op => op.ResolveUsing(dc => dc.AmountRefunded))

                .ForMember(x => x.IsDraft, op => op.ResolveUsing(dc => dc.IsDraft ?? false ))
                .ForMember(x => x.HasDraft, op => op.ResolveUsing(dc => dc.HasDraft ?? false))

                .ForMember(x => x.AvailableActions, op => op.ResolveUsing(dc => dc.AvailableActions))

                .ForMember(x => x.ValidationResults, op => op.ResolveUsing(dc => dc.ValidationResults))
                .ForMember(x => x.FraudScore, op => op.ResolveUsing(dc =>
                {
                    if (dc.ValidationResults != null)
                    {
                        var fraudScores =
                            from message in dc.ValidationResults.SelectMany(vr => vr.Messages)
                            where message != null && message.MessageType == OrdersDC.OrderValidationMessage.OrderValidatorMessageTypeConst.FRAUD_SCORE
                            select message.Message;

                        if (fraudScores != null && fraudScores.Any())
                            return fraudScores.First();
                    }

                    return null;
                }))

                //ignores, handled in aftermap
                .ForMember(x => x.Customer, op => op.Ignore())
                .ForMember(x => x.UnpackagedItems, op => op.Ignore())
                .ForMember(x => x.UnpickedupItems, op => op.Ignore())
                .ForMember(x => x.AuthorizationInfo, op => op.Ignore())
                .ForMember(x => x.AvailableBulkActions, op => op.Ignore())
                .ForMember(x => x.OrderSummary, op => op.Ignore())
                .ForMember(x => x.ItemsOrdered, op => op.Ignore())
                .ForMember(x => x.ItemsNotShipped, op => op.Ignore())
                .ForMember(x => x.ItemsPackaged, op => op.Ignore())
                .ForMember(x => x.ItemsShipped, op => op.Ignore())
                .ForMember(x => x.ItemsNotPickedup, op => op.Ignore())
                .ForMember(x => x.ItemsInPickups, op => op.Ignore())
                .ForMember(x => x.ItemsPickedup, op => op.Ignore())
                .ForMember(x => x.UndeliveredDigitalItems, op => op.Ignore())
                .ForMember(x => x.ItemsDigitallyFulfilled, op => op.Ignore())
                .ForMember(x => x.ItemsNotDigitallyFulfilled, op => op.Ignore())
                .ForMember(x => x.TaxDutyTotal, op => op.Ignore())
                .ForMember(x => x.ReturnableItems, op => op.Ignore())
                .AfterMap(MapAvailableBulkActions)
                .AfterMap(InterpolateRefundsIntoPaymentInteractions)
                .AfterMap((dc, order) =>
                {
                    if (order.Packages.IsNullOrEmpty())
                        return;

                    // sort order packages by create date (for consistent ordering in UI)
                    order.Packages = order.Packages.OrderBy(p => p.CreateDate).ToList();

                    // add orderId to packages
                    EnumerableExtensions.Each(order.Packages, p => p.OrderId = order.Id);

                    // add item name, etc to packageItems
                    EnumerableExtensions.Each(order.Packages.SelectMany(p => p.Items), packageItem => FillPackageItemDetails(packageItem, order));

                    // add item name to pickup item
                    EnumerableExtensions.Each(order.Pickups.SelectMany(p => p.Items), pickupItem => FillPickupItemDetails(pickupItem, order));

                    // add item name to digital items
                    EnumerableExtensions.Each(order.DigitalPackages.SelectMany(p => p.Items), digitalItem => FillPackageItemDetails(digitalItem, order));

                    // ensure weight on all packages
                    EnumerableExtensions.Each(order.Packages, p => { if (p.Weight == null) p.Weight = p.Items.Sum(i => i.Weight.HasValue ? i.Weight : 0); });
                })
                .AfterMap((dc, order) =>
                {
                    // fill out OrderSummary and AuthorizationInfo object

                    decimal totalAmount, amountCollected, balance;
                    int totalItemCount, unshippedItemCount = 0, shippedItemCount = 0, unpickedupItemCount=0, pickedupItemCount = 0, digitallyFulfilledItemCount, fulfilledItemCount, unfulfilledItemCount;

                    totalAmount = dc.Total.GetValueOrDefault(0);
                    amountCollected = dc.TotalCollected;
                    balance = totalAmount - amountCollected;

                    totalItemCount =
                        (from i in order.Items
                         let itemsPerBundle = i.BundledProducts != null && i.BundledProducts.Count > 0 ? (int?)i.BundledProducts.Sum(bp => bp.Quantity) + (i.ProductUsage != "Bundle"?1:0) : (int?)null
                         let actualQuantity = itemsPerBundle.HasValue ? itemsPerBundle.Value * i.Quantity : i.Quantity
                         select actualQuantity
                        ).Sum();

                    if (order.Packages != null)
                    {
                        shippedItemCount =
                        (from i in order.Packages
                         where i.Status == "Fulfilled"
                         let itemsInPackage = i.Items.Sum(package => package.Quantity)
                         select itemsInPackage
                        ).Sum();

                        unshippedItemCount =
                        (from i in order.Packages
                         where i.Status != "Fulfilled"
                         let itemsInPackage = i.Items.Sum(package => package.Quantity)
                         select itemsInPackage
                        ).Sum();
                    }
                                        
                    if (order.Pickups != null)
                    {
                        pickedupItemCount =
                        (from i in order.Pickups
                         where i.Status == "Fulfilled"
                         let itemsInPickup = i.Items.Sum(pickup => pickup.Quantity)
                         select itemsInPickup
                        ).Sum();

                        unpickedupItemCount =
                        (from i in order.Pickups
                         where i.Status != "Fulfilled"                         
                         let itemsInPickup = i.Items.Sum(pickup => pickup.Quantity)
                         select itemsInPickup
                        ).Sum();
                    }
                    
                    digitallyFulfilledItemCount = order.DigitalPackages != null ? order.DigitalPackages.SelectMany(p => p.Items.Select(i => i.Quantity)).Sum() : 0;
                    fulfilledItemCount = shippedItemCount + pickedupItemCount + digitallyFulfilledItemCount;

                    unfulfilledItemCount = Math.Max(0, totalItemCount - fulfilledItemCount);

                    order.OrderSummary = new OrderSummary
                    {
                        TotalAmount = totalAmount,
                        AmountCollected = amountCollected,
                        Balance = balance,
                        TotalItemCount = totalItemCount,
                        ShippedItemCount = shippedItemCount,
                        UnshippedItemCount = unshippedItemCount,
                        PickedupItemCount = pickedupItemCount,
                        UnpickedupItemCount = unpickedupItemCount,
                        FulfilledItemCount = fulfilledItemCount,
                        UnfulfilledItemCount = unfulfilledItemCount
                    };

                    // authorizationInfo duplicates OrderSummary and should go away soon.
                    order.AuthorizationInfo = new OrderAuthorizationInfo
                    {
                        TotalAmount = totalAmount,
                        AmountCollected = amountCollected
                    };
                })
                .AfterMap((dc, order) =>
                {
                    // fill out UnpackagedItems and UnpickedupItems lists

                    // get all the product codes in the order.
                    var itemLineIds = order.Items.Select(item => item.LineId).ToList();

                    // TODO Write LINQ 
                    //itemLineIds.AddRange(order.Items.Where(i => i.BundledProducts != null).SelectMany(i => i.BundledProducts).Select(bundledItem => bundledItem.LineId));
                    //itemLineIds = itemLineIds.Distinct().ToList();

                    order.UnpackagedItems = new List<OrderPackageItem>();
                    order.UnpickedupItems = new List<OrderPickupItem>();
                    order.UndeliveredDigitalItems = new List<OrderDigitalPackageItem>();

                    foreach (var lineId in itemLineIds)
                    {
                        // This is now an order item, I don't need to call the previous methods!
                        var orderItem = order.Items.Find(i =>i.LineId == lineId);
                        if (orderItem.BundledProducts.IsNullOrEmpty())
                        {
                            ResolveUnpackagedAmounts(lineId, order, orderItem);
                        }
                        else
                        {
                            ResolveUnpackagedAmountsForBundledProduct(lineId, order, orderItem);
                        }
                    }
                })
                .AfterMap((dc, order) =>
                {
                    // fill out number of items ordered, shipped, unshipped
                    order.ItemsOrdered = order.Items.Sum(i => i.Quantity);
                    order.ItemsNotShipped = order.UnpackagedItems.Sum(i => i.Quantity) + order.OrderSummary.UnshippedItemCount;
                    order.ItemsNotPickedup = order.UnpickedupItems.Sum(i => i.Quantity) + order.OrderSummary.UnpickedupItemCount;
                    order.ItemsNotDigitallyFulfilled = order.UndeliveredDigitalItems.Sum(i => i.Quantity);
                    order.ItemsPackaged = order.Packages == null || order.Packages.Count == 0 ? 0 : order.Packages.SelectMany(p => p.Items).Sum(i => i.Quantity);
                    order.ItemsShipped = order.OrderSummary.ShippedItemCount;
                    order.ItemsInPickups = order.Pickups == null || order.Pickups.Count == 0 ? 0 : order.Pickups.SelectMany(p => p.Items).Sum(i => i.Quantity);                    
                    order.ItemsPickedup = order.OrderSummary.PickedupItemCount;
                    order.ItemsDigitallyFulfilled = order.DigitalPackages == null || order.DigitalPackages.Count == 0 ? 0 : order.DigitalPackages.SelectMany(p => p.Items).Sum(i => i.Quantity);
                })
                .AfterMap((dc, order) =>
                {
                    if (order.InternalNotes != null)
                    {
                        order.InternalNotes.ForEach(x=> x.OrderId = order.Id);
                    }
                })
                .AfterMap((dc, order) =>
                {
                    // 1. create returnable items list.
                    order.ReturnableItems =
                        (   
                            from item in order.Items
                            where item.ProductUsage != "Bundle"
                            select new OrderReturnableItem
                            {
                                OrderItemId = item.Id,
                                ProductCode = item.ProductCode,
                                ProductName = item.ProductName,
                                QuantityOrdered = item.Quantity,
                                UnitPrice = item.UnitPrice,
                                Key = item.Id,
                                OrderLineId = item.LineId,
                                OrderFulfillmentStatus = item.FulfillmentStatus
                            }
                        )
                        .Union
                        (
                            from item in order.Items
                            from bp in item.BundledProducts
                            select new OrderReturnableItem
                            {
                                OrderItemId = null,
                                ProductCode = bp.ProductCode,
                                ProductName = bp.Name,
                                QuantityOrdered = item.Quantity * bp.Quantity,
                                UnitPrice = null,
                                ParentItemId = item.Id,
                                ParentProductCode = item.ProductCode,
                                ParentProductName = item.ProductName,
                                Key = item.Id + "-" + bp.ProductCode,
                                OrderLineId = item.LineId,
                                OrderFulfillmentStatus = item.FulfillmentStatus
                            }
                        )
                        .ToList();

                    // 2. Count the number of items already fulfilled.
                    // we have to do some backflips in case line items were split:
                    // we don't want to count one item being fulfilled as 
                    // one fulfilled in each line item.
                    // Now it is grouped by OrderLineId.
                    // TODO (JK): NEED TO REVIEW! This may be messed up by line id now!
                    EnumerableExtensions.Each(order.ReturnableItems.GroupBy(ri => ri.OrderLineId), group =>
                    {
                        int totalQuantityFulfilled = order.GetFulfilledItemCount(group.Key);
                        EnumerableExtensions.Each(@group, returnItem =>
                        {
                            int numToMarkFulfilled = Math.Min(returnItem.QuantityOrdered, totalQuantityFulfilled);
                            returnItem.QuantityFulfilled = numToMarkFulfilled;
                            totalQuantityFulfilled -= numToMarkFulfilled;
                        });
                    });
                });
        }

        private void ResolveUnpackagedAmountsForBundledProduct(int lineId, Order order, OrderItem orderItem)
        {
            // for each item in the bundled product
            foreach (var bundledProduct in orderItem.BundledProducts)
            {
                // Based off of fulfillment type look through packages for remaining quantity
                var desiredPackageQuantity = 0;
                var desiredPickupQuantity = 0;
                var desiredDigitalQuantity = 0;

                if (orderItem.FulfillmentMethod == CommerceDC.FulfillmentMethodConst.SHIP)
                {
                    desiredPackageQuantity = bundledProduct.Quantity * orderItem.Quantity;
                }

                if (orderItem.FulfillmentMethod == CommerceDC.FulfillmentMethodConst.PICKUP)
                {
                    desiredPickupQuantity = bundledProduct.Quantity * orderItem.Quantity;
                }

                if (orderItem.FulfillmentMethod == CommerceDC.FulfillmentMethodConst.DIGITAL)
                {
                    desiredDigitalQuantity = bundledProduct.Quantity * orderItem.Quantity;
                }

                var packagedQuantity = order.Packages.SelectMany(p => p.Items).Where(i => i.LineId == lineId && i.ProductCode == bundledProduct.ProductCode).Sum(i => i.Quantity);
                var pickedQuantity = order.Pickups.SelectMany(p => p.Items).Where(i => i.LineId == lineId && i.ProductCode == bundledProduct.ProductCode).Sum(i => i.Quantity);
                var digitallyFulfilled = order.DigitalPackages.SelectMany(p => p.Items).Where(i => i.LineId == lineId && i.ProductCode == bundledProduct.ProductCode).Sum(i => i.Quantity);
                // add new unpackaged item with remaining quantity to the order.UnpackagedItems
                // make sure new entry contains, fulfillment status, line id, and other goodness
                // if there are more desired products than created packages contain, add this product to unpackagedItems.
                if (desiredPackageQuantity > packagedQuantity)
                {
                    int remainingQuantity = desiredPackageQuantity - packagedQuantity;

                    order.UnpackagedItems.Add(new OrderPackageItem
                    {
                        ProductCode = bundledProduct.ProductCode,
                        ProductName = bundledProduct.Name,
                        Weight = bundledProduct.UnitWeight * remainingQuantity,
                        Quantity = remainingQuantity,
                        FulfillmentMethod = CommerceDC.FulfillmentMethodConst.SHIP,
                        FulfillmentLocationCode = orderItem.FulfillmentLocationCode, // TODO: Can bundled components have different fulfillment locations?
                        IsPackagedStandAlone = bundledProduct.IsPackagedStandAlone,
                        LineId = orderItem.LineId,
                        FulfillmentStatus = bundledProduct.FulfillmentStatus
                    });
                }

                // if there are more desired products than created pickups contain, add this product to unpickedupItems.
                if (desiredPickupQuantity > pickedQuantity)
                {
                    int remainingQuantity = desiredPickupQuantity - pickedQuantity;

                    order.UnpickedupItems.Add(new OrderPickupItem
                    {
                        ProductCode = bundledProduct.ProductCode,
                        ProductName = bundledProduct.Name,
                        Quantity = remainingQuantity,
                        FulfillmentMethod = CommerceDC.FulfillmentMethodConst.PICKUP,
                        FulfillmentLocationCode = orderItem.FulfillmentLocationCode, // TODO: Can bundled components have different fulfillment locations?
                        LineId = orderItem.LineId,
                        FulfillmentStatus = bundledProduct.FulfillmentStatus
                    });
                }

                // if there are more desired digital fulfillments than created digital fulfillments contain, add this product to undeliveredDigitalItems.
                if (desiredDigitalQuantity > digitallyFulfilled)
                {
                    int remainingQuantity = desiredDigitalQuantity - digitallyFulfilled;
                    order.UndeliveredDigitalItems.Add(new OrderDigitalPackageItem
                    {
                        ProductCode = bundledProduct.ProductCode,
                        ProductName = bundledProduct.Name,
                        Quantity = remainingQuantity,
                        GiftCardCode = null,
                        UnitPrice = orderItem.UnitPrice,
                        Total = orderItem.UnitPrice * remainingQuantity, // TODO: Why are we doing this here and not in pickup or unpackaged
                        LineId = orderItem.LineId,
                        FulfillmentStatus = bundledProduct.FulfillmentStatus
                    });
                }
            }            
        }

        private void ResolveUnpackagedAmounts(int lineId, Order order, OrderItem orderItem)
        {
            var desiredPackageQuantity = 0;
            var desiredPickupQuantity = 0;
            var desiredDigitalQuantity = 0;

            //desiredPackageQuantity = order.GetDesiredQuantityByFulfillmentMethod(lineId, CommerceDC.FulfillmentMethodConst.SHIP);
            if (orderItem.FulfillmentMethod == CommerceDC.FulfillmentMethodConst.SHIP)
            {
                desiredPackageQuantity = orderItem.Quantity;
            }

            //desiredPickupQuantity = order.GetDesiredQuantityByFulfillmentMethod(lineId, CommerceDC.FulfillmentMethodConst.PICKUP);
            if (orderItem.FulfillmentMethod == CommerceDC.FulfillmentMethodConst.PICKUP)
            {
                desiredPickupQuantity = orderItem.Quantity;
            }

            //desiredDigitalQuantity = order.GetDesiredQuantityByFulfillmentMethod(lineId, CommerceDC.FulfillmentMethodConst.DIGITAL);
            if (orderItem.FulfillmentMethod == CommerceDC.FulfillmentMethodConst.DIGITAL)
            {
                desiredDigitalQuantity = orderItem.Quantity;
            }

            var packagedQuantity = order.Packages.SelectMany(p => p.Items).Where(i => i.LineId == lineId).Sum(i => i.Quantity);
            var pickedQuantity = order.Pickups.SelectMany(p => p.Items).Where(i => i.LineId == lineId).Sum(i => i.Quantity);
            var digitallyFulfilled = order.DigitalPackages.SelectMany(p => p.Items).Where(i => i.LineId == lineId).Sum(i => i.Quantity);

            // if there are more desired products than created packages contain, add this product to unpackagedItems.
            if (desiredPackageQuantity > packagedQuantity)
            {
                int remainingQuantity = desiredPackageQuantity - packagedQuantity;

                // if more items have already been picked up than were intended for pickup, we have to subtract those items from potential shipping items.
                // I don't think we need to do this anymore.  On a line item, it can only be shipped, picked up, or digital.
                //if (desiredPickupQuantity - pickedQuantity < 0)
                //    remainingQuantity += desiredPickupQuantity - pickedQuantity;

                order.UnpackagedItems.Add(new OrderPackageItem
                {
                    ProductCode = orderItem.ProductCode,
                    ProductName = orderItem.ProductName,
                    Weight = orderItem.UnitWeight * remainingQuantity,
                    Quantity = remainingQuantity,
                    FulfillmentMethod = CommerceDC.FulfillmentMethodConst.SHIP,
                    FulfillmentLocationCode = orderItem.FulfillmentLocationCode,
                    IsPackagedStandAlone = orderItem.IsPackagedStandAlone,
                    LineId = orderItem.LineId,
                    FulfillmentStatus = orderItem.FulfillmentStatus
                });
            }

            // if there are more desired products than created pickups contain, add this product to unpickedupItems.
            if (desiredPickupQuantity > pickedQuantity)
            {
                int remainingQuantity = desiredPickupQuantity - pickedQuantity;

                // if more items have already been picked up than were intended for pickup, we have to subtract those items from potential shipping items.
                // I don't think we need to do this anymore.  On a line item, it can only be shipped, picked up, or digital.
                //if (desiredPackageQuantity - packagedQuantity < 0)
                //    remainingQuantity += desiredPackageQuantity - packagedQuantity;

                if (remainingQuantity > 0)
                {
                    order.UnpickedupItems.Add(new OrderPickupItem
                    {
                        ProductCode = orderItem.ProductCode,
                        ProductName = orderItem.ProductName,
                        Quantity = remainingQuantity,
                        FulfillmentMethod = CommerceDC.FulfillmentMethodConst.PICKUP,
                        FulfillmentLocationCode = orderItem.FulfillmentLocationCode,
                        LineId = orderItem.LineId,
                        FulfillmentStatus = orderItem.FulfillmentStatus
                    });
                }
            }

            // if there are more desired digital fulfillments than created digital fulfillments contain, add this product to undeliveredDigitalItems.
            if (desiredDigitalQuantity > digitallyFulfilled)
            {
                int remainingQuantity = desiredDigitalQuantity - digitallyFulfilled;
                order.UndeliveredDigitalItems.Add(new OrderDigitalPackageItem
                {
                    ProductCode = orderItem.ProductCode,
                    ProductName = orderItem.ProductName,
                    Quantity = remainingQuantity,
                    GiftCardCode = null,

                    // TODO: are these accurate in the case of a bundle? should they even be included?
                    UnitPrice = orderItem.UnitPrice,
                    Total = orderItem.UnitPrice * remainingQuantity,
                    LineId = orderItem.LineId,
                    FulfillmentStatus = orderItem.FulfillmentStatus
                });
            }
        }

        private void MapAvailableBulkActions(OrdersDC.Order dc, Order order)
        {
            const string ACCEPT_ORDER = Mozu.CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.ACCEPT_ORDER;
            const string CANCEL_ORDER = Mozu.CommerceRuntime.Contracts.Orders.OrderAction.OrderActionNameConst.CANCEL_ORDER;
            const string CAPTURE_PAYMENT = Mozu.CommerceRuntime.Contracts.Payments.PaymentAction.PaymentActionNameConst.CAPTURE_PAYMENT;
            const string CHECK = Mozu.CommerceRuntime.Contracts.Payments.PaymentTypeConst.CHECK;
            const string SHIP = Mozu.CommerceRuntime.Contracts.Fulfillment.FulfillmentAction.FulfillmentActionNameConst.SHIP;

            order.AvailableBulkActions = new List<string>(4);

            // accept order
            if (dc.AvailableActions != null && dc.AvailableActions.Contains(ACCEPT_ORDER))
                order.AvailableBulkActions.Add(ACCEPT_ORDER);

            // cancel order
            if (dc.AvailableActions != null && dc.AvailableActions.Contains(CANCEL_ORDER))
                order.AvailableBulkActions.Add(CANCEL_ORDER);

            // capture payment
            if (dc.Payments != null && dc.Payments.Count == 1 && dc.Payments[0].AvailableActions.Contains(CAPTURE_PAYMENT) && dc.Payments[0].PaymentType != CHECK)
                order.AvailableBulkActions.Add(CAPTURE_PAYMENT);
            
            // ship package
            if (dc.Packages != null && dc.Packages.Count == 1 && dc.Packages[0].AvailableActions.Contains(SHIP))
                order.AvailableBulkActions.Add(SHIP);
        }

        /// <summary>
        /// Inject transactions from refunds into Order.Payments for consistency in the view.
        /// A transaction of type "Credit" on the refund will be named to type "Refund".
        /// </summary>
        private void InterpolateRefundsIntoPaymentInteractions(OrdersDC.Order dc, Order order)
        {
            foreach (var p in order.Payments)
            {
                var correspondingRefunds = dc.Refunds.Where(r => r.Payment != null && r.Payment.Id == p.Id);
                if (correspondingRefunds.Count() == 0) continue;

                var uncopiedInteractions = correspondingRefunds.SelectMany(r => r.Payment.Interactions).Where(i => !p.Interactions.Any(pi => pi.Id == i.Id)).ToList();
                if (uncopiedInteractions.Count == 0) continue;

                foreach (var refundInteraction in uncopiedInteractions)
                {
                    var riMapped = Mapper.Map<PaymentInteraction>(refundInteraction);
                    if (riMapped.InteractionType == "Credit")
                    {
                        riMapped.InteractionType = "Refund";
                    }
                    var indexToInsertAt = p.Interactions.FindIndex(i => i.CreateDate < riMapped.CreateDate);
                    p.Interactions.Insert(Math.Max(indexToInsertAt, 0), riMapped);
                    p.AmountRefunded += riMapped.Amount.GetValueOrDefault();
                }
            }
        }

        private void Map_DcOrderItem_to_OrderItem()
        {
            Mapper.CreateMap<ProductsDC.BundledProduct, BundledProduct>()
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(x => x.Name, op => op.ResolveUsing(dc => dc.Name))
                .ForMember(x => x.Description, op => op.ResolveUsing(dc => dc.Description))
                .ForMember(x => x.GoodsType, op => op.ResolveUsing(dc => dc.GoodsType))
                .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Quantity))

                .ForMember(x => x.IsPackagedStandAlone, op => op.ResolveUsing(dc => dc.IsPackagedStandAlone))
                .ForMember(x => x.ProductReservationId, op => op.ResolveUsing(dc => dc.ProductReservationId))
                .ForMember(x => x.UnitWeight, op => op.ResolveUsing(dc => dc.Measurements != null && dc.Measurements.Weight != null ? dc.Measurements.Weight.Value : null))
                .ForMember(x => x.GoodsType, op => op.ResolveUsing(dc => dc.GoodsType))
                .ForMember(x => x.CreditValue, op => op.ResolveUsing(dc => dc.CreditValue))
                .ForMember(x => x.OptionAttributeFQN, op => op.ResolveUsing(dc => dc.OptionAttributeFQN))
                .ForMember(x => x.OptionValue, op => op.ResolveUsing(dc => dc.OptionValue))
                .ForMember(x => x.FulfillmentStatus, op => op.ResolveUsing(dc => dc.FulfillmentStatus))
                .ForMember(x => x.LineId, op => op.Ignore())
                ;

            Mapper.CreateMap<BundledProduct, ProductsDC.BundledProduct>()
                .ForMember(dc => dc.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(dc => dc.Name, op => op.ResolveUsing(dc => dc.Name))
                .ForMember(dc => dc.Description, op => op.ResolveUsing(dc => dc.Description))
                .ForMember(dc => dc.Quantity, op => op.ResolveUsing(dc => dc.GoodsType))
                .ForMember(dc => dc.IsPackagedStandAlone, op => op.ResolveUsing(dc => dc.IsPackagedStandAlone))
                .ForMember(dc => dc.ProductReservationId, op => op.ResolveUsing(x => x.ProductReservationId))
                .ForMember(dc => dc.Measurements, opt => opt.ResolveUsing(x => new CommerceDC.PackageMeasurements { Weight = new Measurement { Value = x.UnitWeight, Unit = "lb" } }))
                .ForMember(dc => dc.GoodsType, op => op.ResolveUsing(x => x.GoodsType))
                .ForMember(dc => dc.CreditValue, op => op.ResolveUsing(x => x.CreditValue))
                .ForMember(dc => dc.OptionAttributeFQN, op => op.ResolveUsing(x => x.OptionAttributeFQN))
                .ForMember(dc => dc.OptionValue, op => op.ResolveUsing(x => x.OptionValue))
                .ForMember(dc => dc.FulfillmentStatus, op => op.Ignore())
                .ForMember(dc => dc.AllocationId, op => op.Ignore())
                .ForMember(dc => dc.AllocationExpiration, op => op.Ignore())
                

                ;
        

            Mapper.CreateMap<OrdersDC.OrderItem, OrderItem>()
                .ForMember(x=> x.ProductUsage , opt => opt.ResolveUsing(dc=> dc.Product != null ? dc.Product.ProductUsage : null ))
                .ForMember(x => x.BundledProducts , op => op.ResolveUsing(dc => (dc.Product != null) 
                    ? dc.Product.BundledProducts : null))
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => (dc.Product != null) 
                    ? (dc.Product.VariationProductCode ?? dc.Product.ProductCode) 
                    : null))
                .ForMember(x => x.ParentProductCode, op => op.ResolveUsing(dc => (dc.Product != null && !string.IsNullOrEmpty(dc.Product.VariationProductCode))
                    ? dc.Product.ProductCode 
                    : null))
                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => (dc.Product != null)
                    ? dc.Product.Name : null))
                .ForMember(x => x.UnitPrice, op => op.ResolveUsing(dc => (dc.UnitPrice != null) 
                    ? dc.UnitPrice.ExtendedAmount : null))
                .ForMember(x => x.SalePrice, op => op.ResolveUsing(dc => (dc.UnitPrice != null) 
                    ? dc.UnitPrice.SaleAmount : null))
                .ForMember(x => x.ListPrice, op => op.ResolveUsing(dc => (dc.UnitPrice != null) 
                    ? dc.UnitPrice.ListAmount : null))
                .ForMember(x => x.UnitWeight, op => op.ResolveUsing(dc => dc.Product != null && dc.Product.Measurements != null 
                    ? dc.Product.Measurements.Weight : null))
                .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Quantity))
                .ForMember(x => x.ActiveDiscount, op => op.ResolveUsing(dc => dc.ProductDiscounts != null 
                    ? dc.ProductDiscounts.FirstOrDefault(d => d.Excluded.HasValue && !d.Excluded.Value) 
                    : null))
                .ForMember(x => x.Discounts, op => op.ResolveUsing(dc => dc.ProductDiscounts))
                .ForMember(x => x.ActiveShippingDiscount, op => op.ResolveUsing(dc => dc.ShippingDiscounts != null 
                    ? dc.ShippingDiscounts.FirstOrDefault(d =>d.Discount != null &&  d.Discount.Excluded.HasValue && !d.Discount.Excluded.Value) 
                    : null))
                .ForMember(x => x.ShippingDiscounts, op => op.ResolveUsing(dc => dc.ShippingDiscounts))
                .ForMember(x => x.Options, op => op.ResolveUsing(dc => (dc.Product != null) 
                    ? dc.Product.Options : null))
                .ForMember(x => x.Subtotal, op => op.ResolveUsing(dc => dc.Subtotal))
                .ForMember(x => x.DisplaySubtotal, op => op.ResolveUsing(dc => dc.ExtendedTotal))
                .ForMember(x => x.Total, op => op.ResolveUsing(dc => dc.Total))
                .ForMember(x => x.FulfillmentLocationCode, op => op.ResolveUsing(dc => dc.FulfillmentLocationCode))
                .ForMember(x => x.FulfillmentMethod, op => op.ResolveUsing(dc => dc.FulfillmentMethod))
                .ForMember(x => x.LineId, op => op.ResolveUsing(dc => dc.LineId))
                .ForMember(x => x.HandlingAmount, op => op.ResolveUsing(dc => (dc.HandlingAmount != null)
                    ? dc.HandlingAmount : null))

                .ForMember(x => x.IsPackagedStandAlone , op => op.ResolveUsing((OrdersDC.OrderItem dc) => (dc.Product==null)? false : dc.Product.IsPackagedStandAlone))
                // handled by after mapper, this needs to be aggregated!
                .ForMember(x => x.FulfillmentStatus, op => op.ResolveUsing(dc => dc.Product.FulfillmentStatus))
                  

                .AfterMap((dc, orderItem) =>
                {
                    if (orderItem.Discounts != null)
                    {
                        EnumerableExtensions.Each(orderItem.Discounts, d => d.Quantity = (d.Quantity == 0) 
                            ? orderItem.Quantity : d.Quantity);
                    }


                });
            // TODO: shopper entered values
        }


        /// <summary>
        /// Bundled products have to become a first class class OrderItem in order to build UnshippedItems list
        /// </summary>
        private void Map_BundledProduct_to_OrderItem()
        {
            Mapper.CreateMap<BundledProduct, OrderItem>()
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(x => x.ProductName, op => op.ResolveUsing(dc => dc.Name))
                .ForMember(x => x.UnitWeight, op => op.ResolveUsing(dc => dc.UnitWeight))
                .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Quantity))
                .ForMember(x => x.LineId, op => op.ResolveUsing(dc => dc.LineId))
                //Coming from a bundled product, this is OK because the bundled product should already be aggregated
                .ForMember(x => x.FulfillmentStatus, op => op.ResolveUsing(dc => dc.FulfillmentStatus))
            
                //ignores
                .ForMember(x => x.BundledProducts, op => op.Ignore())
                .ForMember(x => x.Id, op => op.Ignore())
                .ForMember(x => x.Options, op => op.Ignore())
                .ForMember(x => x.UnitPrice, op => op.Ignore())
                .ForMember(x => x.ListPrice, op => op.Ignore())
                .ForMember(x => x.SalePrice, op => op.Ignore())
                .ForMember(x => x.ActiveDiscount, op => op.Ignore())
                .ForMember(x => x.Discounts, op => op.Ignore())
                .ForMember(x => x.ActiveShippingDiscount, op => op.Ignore())
                .ForMember(x => x.ShippingDiscounts, op => op.Ignore())
                .ForMember(x => x.Subtotal, op => op.Ignore())
                .ForMember(x => x.DisplaySubtotal, op => op.Ignore())
                .ForMember(x => x.Total, op => op.Ignore())
                .ForMember(x => x.FulfillmentLocationCode, op => op.Ignore())
                .ForMember(x => x.FulfillmentMethod, op => op.Ignore())
                .ForMember(x => x.ParentProductCode, op => op.Ignore())
                //todo: temp to get unit test to pass - Greg Murray on 2014-05-20 
                .ForMember(x => x.ProductDiscount, op => op.Ignore())
                .ForMember(dc => dc.ProductUsage, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-28 
                .ForMember(dc => dc.HandlingAmount, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-28
                .ForMember(dc => dc.DutyAmount, op => op.Ignore())
            
//                             ProductCode = orderItem.ProductCode,
//                             ProductName = orderItem.ProductName,
//                             Weight = orderItem.UnitWeight * remainingQuantity,
//                             Quantity = remainingQuantity
                ;
        }

        private void Map_DcAppliedProductDiscount_to_OrderItemDiscount()
        {
            Mapper.CreateMap<DiscountDC.AppliedProductDiscount, OrderItemDiscount>()
                //todo: confirm default 0 when null Greg Murray on 2014-01-28 
                .ForMember(x => x.DiscountId, op => op.ResolveUsing(dc => (dc.Discount != null) 
                    ? dc.Discount.Id : 0))
                .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.ProductQuantity))
                .ForMember(x => x.Description, op => op.ResolveUsing(dc => (dc.Discount != null) 
                    ? dc.Discount.Name : null))
                .ForMember(x => x.UnitPrice, op => op.ResolveUsing(dc => dc.ImpactPerUnit))
                .ForMember(x => x.Total, op => op.ResolveUsing(dc => dc.Impact))
                .ForMember(x => x.CouponCode, op => op.ResolveUsing(dc => dc.CouponCode))
             
                .ForMember(x => x.IsActive, op => op.ResolveUsing(dc => dc.Excluded.HasValue && !dc.Excluded.Value))
                ;

            
        }

        private void Map_DcAppliedDiscount_to_OrderDiscount()
        {
            Mapper.CreateMap<DiscountDC.AppliedDiscount, OrderDiscount>()
                //todo: confirm 0 default when null Greg Murray on 2014-01-28 
                .ForMember(x => x.DiscountId, op => op.ResolveUsing(dc => (dc.Discount != null) 
                    ? dc.Discount.Id : 0))
                .ForMember(x => x.Description, op => op.ResolveUsing(dc => (dc.Discount != null) 
                    ? dc.Discount.Name : null))
                .ForMember(x => x.ExpirationDate, op => op.ResolveUsing(dc => (dc.Discount != null) 
                    ? dc.Discount.ExpirationDate : null))
                .ForMember(x => x.CouponCode, op => op.ResolveUsing(dc => dc.CouponCode))
                .ForMember(x => x.Total, op => op.ResolveUsing(dc => dc.Impact))
                .ForMember(x => x.IsActive, op => op.ResolveUsing(dc => dc.Excluded.HasValue && !dc.Excluded.Value))
                ;
        }

        private void Map_DcShippingDiscount_to_ShippingDiscount()
        {
            Mapper.CreateMap<DiscountDC.AppliedLineItemShippingDiscount, ShippingDiscount>()
                .ForMember(x => x.DiscountId, op => op.ResolveUsing(dc => dc.Discount != null && dc.Discount.Discount != null ? dc.Discount.Discount.Id : 0))
                .ForMember(x => x.MethodCode, op => op.ResolveUsing(dc => dc.MethodCode))
                .ForMember(x => x.Description, op => op.ResolveUsing(dc => (dc.Discount != null && dc.Discount.Discount != null)
                    ? dc.Discount.Discount.Name : null))
                .ForMember(x => x.Total, op => op.ResolveUsing(dc => (dc.Discount != null)
                    ? dc.Discount.Impact : null))
                .ForMember(x => x.CouponCode, op => op.ResolveUsing(dc => (dc.Discount != null)
                    ? dc.Discount.CouponCode : null))
                .ForMember(x => x.IsActive, op => op.ResolveUsing(dc => dc.Discount != null && dc.Discount.Excluded.HasValue && !dc.Discount.Excluded.Value))
                ;

            Mapper.CreateMap<DiscountDC.ShippingDiscount, ShippingDiscount>()
                .ForMember(x => x.DiscountId, op => op.ResolveUsing(dc => dc.Discount != null && dc.Discount.Discount != null ? dc.Discount.Discount.Id : 0))
                .ForMember(x => x.MethodCode, op => op.ResolveUsing(dc => dc.MethodCode))
                .ForMember(x => x.Description, op => op.ResolveUsing(dc => (dc.Discount != null && dc.Discount.Discount != null)
                    ? dc.Discount.Discount.Name : null))
                .ForMember(x => x.Total, op => op.ResolveUsing(dc => (dc.Discount != null)
                    ? dc.Discount.Impact : null))
                .ForMember(x => x.CouponCode, op => op.ResolveUsing(dc => (dc.Discount != null)
                    ? dc.Discount.CouponCode : null))
                .ForMember(x => x.IsActive, op => op.ResolveUsing(dc => dc.Discount != null && dc.Discount.Excluded.HasValue && !dc.Discount.Excluded.Value))
                ;
        }

        private void Map_DcPayment_to_OrderPayment()
        {
            Mapper.CreateMap<PaymentsDC.Payment, OrderPayment>()
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.OrderId, op => op.ResolveUsing(dc => dc.OrderId))
                .ForMember(x => x.PaymentServiceTransactionId, op => op.ResolveUsing(dc => dc.PaymentServiceTransactionId))
                .ForMember(x => x.Status, op => op.ResolveUsing(dc => dc.Status))
                .ForMember(x => x.AmountRequested, op => op.ResolveUsing(dc => dc.AmountRequested))
                .ForMember(x => x.AmountCollected, op => op.ResolveUsing(dc => dc.AmountCollected))
                .ForMember(x => x.AmountCredited, op => op.ResolveUsing(dc => dc.AmountCredited))
                .ForMember(x => x.AmountAuthorized, op => op.ResolveUsing(dc =>
                {
                    if (dc.Status == "Authorized" && dc.Interactions.Any(i => i.Status == "Authorized"))
                        return dc.Interactions.First(i => i.Status == "Authorized").Amount.GetValueOrDefault(0);
                    else
                        return 0;
                }))
                .ForMember(x => x.Interactions, op => op.ResolveUsing(dc => (dc.Interactions != null) 
                    ? dc.Interactions.OrderByDescending(t => t.AuditInfo.CreateDate) : null))
                .ForMember(x => x.PaymentType, op => op.ResolveUsing(dc => dc.PaymentType))
                .ForMember(x => x.BillingContact, op => op.ResolveUsing(dc => dc.BillingInfo != null ? dc.BillingInfo.BillingContact : null))
                .ForMember(x => x.CardType, op => op.ResolveUsing(dc => dc.BillingInfo != null && dc.BillingInfo.Card != null 
                    && dc.PaymentType == PaymentsDC.PaymentTypeConst.CREDIT_CARD 
                        ? dc.BillingInfo.Card.PaymentOrCardType : null))
                .ForMember(x => x.CardNumber, op => op.ResolveUsing(dc => (dc.BillingInfo != null && dc.BillingInfo.Card != null) 
                    ? dc.BillingInfo.Card.CardNumberPartOrMask : null))
                .ForMember(x => x.NameOnCard, op => op.ResolveUsing(dc => (dc.BillingInfo != null && dc.BillingInfo.Card != null) 
                    ? dc.BillingInfo.Card.NameOnCard : null))
                .ForMember(x => x.ExpireMonth, op => op.ResolveUsing(dc => dc.BillingInfo != null && dc.BillingInfo.Card != null ? (short?)dc.BillingInfo.Card.ExpireMonth : null))
                .ForMember(x => x.ExpireYear, op => op.ResolveUsing(dc => dc.BillingInfo != null && dc.BillingInfo.Card != null ? (short?)dc.BillingInfo.Card.ExpireYear : null))
                .ForMember(x => x.StoreCreditCode, op => op.ResolveUsing(dc => dc.BillingInfo != null && dc.BillingInfo.StoreCreditCode != null ? dc.BillingInfo.StoreCreditCode : null))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) 
                    ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.AvailableActions, op => op.ResolveUsing(dc => dc.AvailableActions))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) 
                    ? dc.AuditInfo.CreateDate : null))
                //ignores
                .ForMember(x => x.IsManual, op => op.Ignore()) //calculated field
                .ForMember(x => x.AmountRefunded, op => op.Ignore()) // calculated field
                .AfterMap((dc, payment) =>
                {
                    if (payment == null || payment.PaymentType == PaymentsDC.PaymentTypeConst.CHECK)
                        return;

                    // if the payment is manual, all available actions should actually be ManualXXX
                    if (payment.IsManual)
                    {
                        payment.AvailableActions = payment.AvailableActions.Select(action => action.StartsWith("Rollback") 
                            ? action : "Manual" + action).ToList();
                    }
                    // otherwise we should duplicate each available actions with a ManualXXX.
                    else if (!(payment.PaymentType == PaymentsDC.PaymentTypeConst.STORE_CREDIT && payment.Status == "Collected"))
                    {
                        int i, originalCount = payment.AvailableActions.Count;
                        for (i = 0; i < originalCount; i++)
                        {
                            if (!payment.AvailableActions[i].StartsWith("Rollback"))
                                payment.AvailableActions.Add("Manual" + payment.AvailableActions[i]);
                        }
                    }

                    // sort AvailableActions to put "Rollback" operations at the bottom.
                    payment.AvailableActions = payment.AvailableActions.OrderBy(a => a.StartsWith("Rollback")).ToList();
                })
                ;
        }

        private void Map_DcPaymentInteraction_to_PaymentInteraction()
        {
            Mapper.CreateMap<PaymentsDC.PaymentInteraction, PaymentInteraction>()
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.GatewayTransactionId, op => op.ResolveUsing(dc => dc.GatewayTransactionId))
                .ForMember(x => x.GatewayInteractionId, op => op.ResolveUsing(dc => dc.GatewayInteractionId))
                .ForMember(x => x.GatewayInteractionIdReference, op => op.ResolveUsing(dc => dc.PaymentTransactionInteractionIdReference))
                .ForMember(x => x.InteractionType, op => op.ResolveUsing(dc => dc.InteractionType))
                .ForMember(x => x.CheckNumber, op => op.ResolveUsing(dc => dc.CheckNumber))
                .ForMember(x => x.Status, op => op.ResolveUsing(dc => dc.Status))
                .ForMember(x => x.GatewayResponseCode, op => op.ResolveUsing(dc => dc.GatewayResponseCode))
                .ForMember(x => x.GatewayResponseText, op => op.ResolveUsing(dc => dc.GatewayResponseText))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo != null ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.PaymentId, op => op.ResolveUsing(dc => dc.PaymentId))
                .ForMember(x => x.IsManual, op => op.ResolveUsing(dc => dc.IsManual))
                //ignores
                .ForMember(x => x.CanEdit, op => op.Ignore()) //calc field returns IsManual
                .ForMember(x => x.CanDelete, op => op.Ignore()) //ditto
                ;
        }

        private void Map_DcRefund_to_Refund()
        {
            Mapper.CreateMap<RefundsDC.Refund, OrderRefund>()
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.OrderId, op => op.ResolveUsing(dc => dc.OrderId))
                .ForMember(x => x.Reason, op => op.ResolveUsing(dc => dc.Reason))
                .ForMember(x => x.Payment, op => op.ResolveUsing(dc => dc.Payment))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo != null ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.CreatedBy, op => op.ResolveUsing(dc => dc.AuditInfo != null ? dc.AuditInfo.CreateBy : null))
                ;
        }

        private void Map_DcPackage_to_OrderPackage()
        {
            Mapper.CreateMap<ShippingDC.Package, OrderPackage>()
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.HasLabel, op => op.ResolveUsing(dc => dc.HasLabel))
                .ForMember(x => x.ShipmentId, op => op.ResolveUsing(dc => dc.ShipmentId))
                .ForMember(x => x.Status, op => op.ResolveUsing(dc => dc.Status))
                .ForMember(x => x.FulfillmentLocationCode, op => op.ResolveUsing(dc => dc.FulfillmentLocationCode))
                .ForMember(x => x.ShippingMethodCode, op => op.ResolveUsing(dc => dc.ShippingMethodCode))
                .ForMember(x => x.ShippingMethodName, op => op.ResolveUsing(dc => dc.ShippingMethodName))
                .ForMember(x => x.TrackingNumber, op => op.ResolveUsing(dc => dc.TrackingNumber))

                .ForMember(x => x.PackagingType, op => op.ResolveUsing(dc => String.IsNullOrEmpty(dc.PackagingType) 
                    ? "CUSTOM" : dc.PackagingType))
                .ForMember(x => x.Height, op => op.ResolveUsing(dc => dc.Measurements != null ? 
                    dc.Measurements.Height : null))
                .ForMember(x => x.Length, op => op.ResolveUsing(dc => dc.Measurements != null 
                    ? dc.Measurements.Length : null))
                .ForMember(x => x.Width, op => op.ResolveUsing(dc => dc.Measurements != null 
                    ? dc.Measurements.Width : null))
                .ForMember(x => x.Weight, op => op.ResolveUsing(dc => dc.Measurements != null && dc.Measurements.Weight != null 
                    ? dc.Measurements.Weight.Value : null))
                .ForMember(x => x.Items, op => op.ResolveUsing(dc => dc.Items))
                .ForMember(x => x.AvailableActions, op => op.ResolveUsing(dc => dc.AvailableActions))                
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) 
                    ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.FulfillmentDate, op => op.ResolveUsing(dc => dc.FulfillmentDate))
                .ForMember(x => x.ShipDate, op => op.ResolveUsing(dc => dc.FulfillmentDate))
                .ForMember(x => x.TotalQuantity, op => op.ResolveUsing(dc => dc.Items != null ? dc.Items.Sum(i => i.Quantity) : 0)) // 0 quantity when no items
                .ForMember(x => x.ChangeMessages, op => op.ResolveUsing(dc => dc.ChangeMessages))
                //ignores
                .ForMember(x => x.OrderId, op => op.Ignore()) //handled in Order map method
                ;
        }

        private void Map_DcPackageItem_to_OrderPackageItem()
        {
            Mapper.CreateMap<ShippingDC.PackageItem, OrderPackageItem>()
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Quantity))
                .ForMember(x => x.LineId, op => op.ResolveUsing(dc => dc.LineId))
                //ignores, handled in Order mapping or FillPackageItemDetails.
                .ForMember(x => x.ProductName, op => op.Ignore())
                .ForMember(x => x.FulfillmentMethod, op => op.Ignore())
                .ForMember(x => x.FulfillmentLocationCode, op => op.Ignore())
                .ForMember(x => x.Weight, op => op.Ignore())
                .ForMember(x => x.UnitPrice, op => op.Ignore())
                .ForMember(x => x.Total, op => op.Ignore())
                .ForMember(x => x.FulfillmentStatus, op => op.Ignore())
                .ForMember(x => x.IsPackagedStandAlone, op => op.Ignore())
                ;
        }

        private void Map_DcPickup_to_OrderPickup()
        {
            Mapper.CreateMap<ShippingDC.Pickup, OrderPickup>()
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.Code, op => op.ResolveUsing(dc => dc.Code))
                .ForMember(x => x.FulfillmentDate, op => op.ResolveUsing(dc => dc.FulfillmentDate))
                .ForMember(x => x.AvailableActions, op => op.ResolveUsing(dc => dc.AvailableActions))
                .ForMember(x => x.Status, op => op.ResolveUsing(dc => dc.Status))
                .ForMember(x => x.Items, op => op.ResolveUsing(dc => dc.Items))
                .ForMember(x => x.FulfillmentLocationCode, op => op.ResolveUsing(dc => dc.FulfillmentLocationCode))
                .ForMember(x => x.TotalQuantity, op => op.ResolveUsing(dc => dc.Items != null ? dc.Items.Sum(i => i.Quantity) : 0)) // 0 quantity when no items
                .ForMember(x => x.ChangeMessages, op => op.ResolveUsing(dc => dc.ChangeMessages))
                .ForMember(x => x.OrderId, op => op.Ignore())

                .AfterMap((dc, x) =>
                {
                    // set FulfillmentLocationCode on all items.
                    x.Items.ForEach(pickupItem => pickupItem.FulfillmentLocationCode = x.FulfillmentLocationCode);
                })
                ;
        }

        private void Map_DcPickupItem_to_OrderPickupItem()
        {
            Mapper.CreateMap<ShippingDC.PickupItem, OrderPickupItem>()
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Quantity))
                .ForMember(x => x.LineId, op => op.ResolveUsing(dc => dc.LineId))
                //ignores, handled in Order mapping
                .ForMember(x => x.ProductName, op => op.Ignore())
                .ForMember(x => x.FulfillmentMethod, op => op.Ignore())
                .ForMember(x => x.FulfillmentLocationCode, op => op.Ignore())
                .ForMember(x => x.FulfillmentStatus, op => op.Ignore())
                ;
        }

        private void Map_DcDigitalPackage_to_OrderDigitalPackage()
        {
            Mapper.CreateMap<ShippingDC.DigitalPackage, OrderDigitalPackage>()
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.Code, op => op.ResolveUsing(dc => dc.Code))
                .ForMember(x => x.Items, op => op.ResolveUsing(dc => dc.Items))

                .ForMember(x => x.AvailableActions, op => op.ResolveUsing(dc => dc.AvailableActions))                
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo != null ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.FulfillmentDate, op => op.ResolveUsing(dc => dc.AuditInfo != null ? dc.AuditInfo.UpdateDate : null))
                .ForMember(x => x.TotalQuantity, op => op.ResolveUsing(dc => dc.Items != null ? dc.Items.Sum(i => i.Quantity) : 0)) // 0 quantity when no items
                .ForMember(x => x.Status, op => op.ResolveUsing(dc => dc.Status))
                .ForMember(x => x.ChangeMessages, op => op.ResolveUsing(dc => dc.ChangeMessages))
                //ignores
                .ForMember(x => x.OrderId, op => op.Ignore()) //handled in Order map method
                .ForMember(x => x.FulfillmentEmailAddress, op => op.Ignore()) //handled in Order map method
                ;
        }

        private void Map_DcDigitalPackageItem_to_OrderDigitalPackageItem()
        {
            Mapper.CreateMap<ShippingDC.DigitalPackageItem, OrderDigitalPackageItem>()
                .ForMember(x => x.ProductCode, op => op.ResolveUsing(dc => dc.ProductCode))
                .ForMember(x => x.Quantity, op => op.ResolveUsing(dc => dc.Quantity))
                .ForMember(x => x.GiftCardCode, op => op.ResolveUsing(dc => dc.GiftCardCode))
                .ForMember(x => x.LineId, op => op.ResolveUsing(dc => dc.LineId))
                .ForMember(x => x.Weight, op => op.UseValue(null))
                //ignores, handled in Order mapping
                .ForMember(x => x.FulfillmentStatus, op => op.Ignore())
                .ForMember(x => x.ProductName, op => op.Ignore())
                .ForMember(x => x.UnitPrice, op => op.Ignore())
                .ForMember(x => x.Total, op => op.Ignore())
                ;
        }

        private void Map_DcAdjustment_to_Adjustment()
        {
            Mapper.CreateMap<CommerceDC.Adjustment, Adjustment>()
                .ForMember(x => x.Amount, op => op.ResolveUsing(dc => dc.Amount))
                .ForMember(x => x.Description, op => op.ResolveUsing(dc => dc.Description))
                .ForMember(x => x.InternalComment, op => op.ResolveUsing(dc => dc.InternalComment))
                ;
        }

        private void Map_OrderPackage_to_DcPackage()
        {
            Mapper.CreateMap<OrderPackage, ShippingDC.Package>()
                .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(dc => dc.Items, op => op.ResolveUsing(x => x.Items))
                .ForMember(dc => dc.ShipmentId, op => op.ResolveUsing(x => x.ShipmentId))
                .ForMember(dc => dc.PackagingType, op => op.ResolveUsing(x => x.PackagingType))
                .ForMember(dc => dc.FulfillmentLocationCode, op => op.ResolveUsing(x => x.FulfillmentLocationCode))
                .ForMember(dc => dc.ShippingMethodCode, op => op.ResolveUsing(x => x.ShippingMethodCode))
                .ForMember(dc => dc.ShippingMethodName, op => op.ResolveUsing(x => x.ShippingMethodName))
                .ForMember(dc => dc.Status, op => op.ResolveUsing(x => x.Status))
                .ForMember(dc => dc.TrackingNumber, op => op.ResolveUsing(x => x.TrackingNumber))
                .ForMember(dc => dc.Measurements, op => op.ResolveUsing(x => new CommerceDC.PackageMeasurements
                {
                    Height = new Core.Api.Contracts.Measurement { Unit = "in", Value = x.Height },
                    Width = new Core.Api.Contracts.Measurement { Unit = "in", Value = x.Width },
                    Length = new Core.Api.Contracts.Measurement { Unit = "in", Value = x.Length },
                    Weight = new Core.Api.Contracts.Measurement { Unit = "lbs", Value = x.Weight }
                }))
                .ForMember(dc => dc.AvailableActions, op => op.ResolveUsing(x => x.AvailableActions))  
                //ignores
                .ForMember(dc => dc.FulfillmentDate, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.ChangeMessages, op => op.Ignore())
                ;
        }

        private void Map_OrderPackageItem_to_DcPackageItem()
        {
            Mapper.CreateMap<OrderPackageItem, ShippingDC.PackageItem>()
                .ForMember(dc => dc.ProductCode, op => op.ResolveUsing(x => x.ProductCode))
                .ForMember(dc => dc.Quantity, op => op.ResolveUsing(x => x.Quantity))
                .ForMember(dc => dc.LineId, op => op.ResolveUsing(x => x.LineId))
                .ForMember(dc => dc.FulfillmentItemType, op => op.ResolveUsing(( OrderPackageItem x) => ShippingDC.FulfillmentItemTypeConst.PHYSICAL))
                ;
        }

        private void Map_OrderPickup_to_DcPickup()
        {
            Mapper.CreateMap<OrderPickup, ShippingDC.Pickup>()
                .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(dc => dc.FulfillmentLocationCode, op => op.ResolveUsing(x => x.FulfillmentLocationCode))
                .ForMember(dc => dc.FulfillmentDate, op => op.ResolveUsing(x => x.FulfillmentDate))
                .ForMember(dc => dc.AvailableActions, op => op.ResolveUsing(x => x.AvailableActions))
                .ForMember(dc => dc.Status, op => op.ResolveUsing(x => x.Status))
                .ForMember(dc => dc.Items, op => op.ResolveUsing(x => x.Items))
                ;
        }

        private void Map_OrderPickupItem_to_DcPickupItem()
        {
            Mapper.CreateMap<OrderPickupItem, ShippingDC.PickupItem>()
                .ForMember(dc => dc.ProductCode, op => op.ResolveUsing(x => x.ProductCode))
                .ForMember(dc => dc.Quantity, op => op.ResolveUsing(x => x.Quantity))
                .ForMember(dc => dc.LineId, op => op.ResolveUsing(x => x.LineId))
                //todo: do we need this on our model? - Greg Murray on 2014-05-19 
                .ForMember(dc => dc.FulfillmentItemType, op => op.ResolveUsing(( OrderPickupItem x) => ShippingDC.FulfillmentItemTypeConst.PHYSICAL))
                ;
        }

        private void Map_OrderItem_to_DcOrderItem()
        {
            Mapper.CreateMap<OrderItem, OrdersDC.OrderItem>()
               
                  .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
                  .ForMember(dc => dc.UnitPrice, op => op.Ignore())
                  .ForMember(dc => dc.Product, op => op.ResolveUsing(x =>
                  {
                      return new ProductsDC.Product
                      {
                          ProductCode = x.ProductCode,
                          Name = x.ProductName,
                          FulfillmentStatus = x.FulfillmentStatus,
                          Options = Mapper.Map<List<ProductsDC.ProductOption>>(x.Options)
                          // other stuff (price/measurements) are not important to make service calls.
                      };
                  }))
                  .ForMember(dc => dc.Quantity, op => op.ResolveUsing(x => x.Quantity))
                  .ForMember(dc => dc.ProductDiscounts, op => op.ResolveUsing(x => x.Discounts))
                  .ForMember(dc => dc.ShippingDiscounts, op => op.ResolveUsing(x => x.ShippingDiscounts))
                  .ForMember(dc => dc.FulfillmentLocationCode, op => op.ResolveUsing(x => x.FulfillmentLocationCode))
                  .ForMember(dc => dc.FulfillmentMethod, op => op.ResolveUsing(x => x.FulfillmentMethod))
                  .ForMember(dc => dc.LineId, op => op.ResolveUsing(x => x.LineId))
                  
                  //ignores
                  .ForMember(dc => dc.OriginalCartItemId, op => op.Ignore())
                  .ForMember(dc => dc.LocaleCode, op => op.Ignore())
                  .ForMember(dc => dc.IsRecurring, op => op.Ignore())
                  .ForMember(dc => dc.IsTaxable, op => op.Ignore())
                  .ForMember(dc => dc.ExtendedTotal, op => op.Ignore())
                  .ForMember(dc => dc.TaxableTotal, op => op.Ignore())
                  .ForMember(dc => dc.DiscountTotal, op => op.Ignore())
                  .ForMember(dc => dc.DiscountedTotal, op => op.Ignore())
                  .ForMember(dc => dc.ItemTaxTotal, op => op.Ignore())
                  .ForMember(dc => dc.ShippingTaxTotal, op => op.Ignore())
                  .ForMember(dc => dc.ShippingTotal, op => op.Ignore())
                  .ForMember(dc => dc.FeeTotal, op => op.Ignore())
                  .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                  .ForMember(dc => dc.HandlingAmount, op => op.Ignore())
                  .ForMember(dc => dc.ProductDiscount, op => op.Ignore()) // todo: xverify - Greg Murray on 2014-08-28 
                  .ForMember(dc => dc.Data, op => op.Ignore())
                  .ForMember(dc => dc.DutyAmount, op => op.Ignore())
            
                  ;
        }

        private void Map_OrderItemDiscount_to_DcAppliedProductDiscount()
        { 
            Mapper.CreateMap<OrderItemDiscount, DiscountDC.AppliedProductDiscount>()
                .ForMember(dc => dc.ProductQuantity, op => op.ResolveUsing(x => x.Quantity))
                .ForMember(dc => dc.Discount, op => op.ResolveUsing(x =>
                {
                    return new DiscountDC.Discount
                    {
                        Id = x.DiscountId,
                        Name = x.Description
                    };
                }))
                .ForMember(dc => dc.ImpactPerUnit, op => op.ResolveUsing(x => x.UnitPrice))
                .ForMember(dc => dc.Impact, op => op.ResolveUsing(x => x.Total))
                .ForMember(dc => dc.CouponCode, op => op.ResolveUsing(x => x.CouponCode))
                .ForMember(dc => dc.Excluded, op => op.ResolveUsing(x => !x.IsActive))
                ;
        }

        private void Map_OrderDiscount_to_DcAppliedDiscount()
        {
            Mapper.CreateMap<OrderDiscount, DiscountDC.AppliedDiscount>()
                .ForMember(dc => dc.CouponCode, op => op.ResolveUsing(x => x.CouponCode))
                .ForMember(dc => dc.Impact, op => op.ResolveUsing(x => x.Total))
                .ForMember(dc => dc.Excluded, op => op.ResolveUsing(x => !x.IsActive))
                .ForMember(dc => dc.Discount, op => op.ResolveUsing(x =>
                {
                    return new DiscountDC.Discount
                    {
                        Id = x.DiscountId,
                        Name = x.Description,
                        ExpirationDate = x.ExpirationDate
                    };
                }))
                ;
        }

        private void Map_ShippingDiscount_to_DcShippingDiscount()
        {
            Mapper.CreateMap<ShippingDiscount, DiscountDC.ShippingDiscount>()
                .ForMember(dc => dc.MethodCode, op => op.ResolveUsing(x => x.MethodCode))
                .ForMember(dc => dc.Discount, op => op.ResolveUsing(x =>
                {
                    return new DiscountDC.AppliedDiscount
                    {
                        CouponCode = x.CouponCode,
                        Impact = x.Total,
                        Excluded = !x.IsActive,
                        Discount = new DiscountDC.Discount
                        {
                            Id = x.DiscountId,
                            Name = x.Description
                        }
                    };
                }))
                ;
        }

        private void Map_Adjustment_to_DcAdjustment()
        {
            Mapper.CreateMap<Adjustment, CommerceDC.Adjustment>()
                .ForMember(dc => dc.Amount, op => op.ResolveUsing(x => x.Amount))
                .ForMember(dc => dc.Description, op => op.ResolveUsing(x => x.Description))
                .ForMember(dc => dc.InternalComment, op => op.ResolveUsing(x => x.InternalComment))
                ;
        }

        private void Map_DcOrderNote_to_OrderNote()
        {
            Mapper.CreateMap<OrdersDC.OrderNote, OrderNote>()
                .ForMember(x => x.NoteId, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.Text, op => op.ResolveUsing(dc => dc.Text))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo == null ? null: dc.AuditInfo.CreateDate))
                .ForMember(x => x.CreateBy, op => op.ResolveUsing(dc => dc.AuditInfo == null ? null : dc.AuditInfo.CreateBy))
                .ForMember(x => x.UpdateDate, op => op.ResolveUsing(dc => dc.AuditInfo == null ? null : dc.AuditInfo.UpdateDate))
                .ForMember(x => x.UpdateBy, op => op.ResolveUsing(dc => dc.AuditInfo == null ? null : dc.AuditInfo.UpdateBy))
                .ForMember(x => x.OrderId, op => op.Ignore())
                ;
        }

        private void Map_OrderNote_to_DcOrderNote()
        {
            Mapper.CreateMap<OrderNote, OrdersDC.OrderNote>()
                .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.NoteId))
                .ForMember(dc => dc.Text, op => op.ResolveUsing(x => x.Text))
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;
        }
        /// <summary>
        /// Looks up a package item by OrderItemId and fills in the other information.
        /// </summary>
        private void FillPackageItemDetails(AbstractOrderPackageItem packageItem, Order order)
        {
            if (packageItem == null || order == null || order.Items == null)
                return;
            
            // use the packageItem's LineId here!
            // Find the orderItem within the order:
            var orderItem = order.Items.FirstOrDefault(i => i.LineId == packageItem.LineId);

            if (orderItem == null)
                return;

            if (orderItem.BundledProducts.IsNullOrEmpty())
            {
                packageItem.ProductCode = orderItem.ProductCode;
                packageItem.ProductName = orderItem.ProductName;
                packageItem.Total = orderItem.Total;
                packageItem.UnitPrice = orderItem.UnitPrice;
                packageItem.Weight = orderItem.UnitWeight.HasValue ? packageItem.Quantity * orderItem.UnitWeight : null;
                packageItem.LineId = packageItem.LineId;
                packageItem.FulfillmentStatus = orderItem.FulfillmentStatus;
            }
            else
            {
                var foundProduct = orderItem.BundledProducts.FirstOrDefault(i => i.ProductCode == packageItem.ProductCode);
                if (foundProduct == null)
                    return;
                packageItem.ProductCode = foundProduct.ProductCode;
                packageItem.ProductName = foundProduct.Name;
                packageItem.Total = 0;
                packageItem.UnitPrice = 0;
                packageItem.Weight = foundProduct.UnitWeight.HasValue ? packageItem.Quantity*foundProduct.UnitWeight : null;
                packageItem.LineId = packageItem.LineId;
                packageItem.FulfillmentStatus = foundProduct.FulfillmentStatus;
            }
        }

        private void FillPickupItemDetails(OrderPickupItem pickupItem, Order order)
        {
            if (pickupItem == null || order == null || order.Items == null)
                return;

            var itemInOrder = order.Items.FirstOrDefault(i => i.LineId == pickupItem.LineId);

            if (itemInOrder == null)
                return;

            pickupItem.ProductCode = itemInOrder.ProductCode;
            pickupItem.ProductName = itemInOrder.ProductName;
            pickupItem.LineId = itemInOrder.LineId;
            pickupItem.FulfillmentStatus = itemInOrder.FulfillmentStatus;
        }
    }
}
