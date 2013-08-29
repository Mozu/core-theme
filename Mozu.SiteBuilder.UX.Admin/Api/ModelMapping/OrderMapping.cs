using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Order;
using CustomerDC = Mozu.Customer.Contracts;
using DiscountDC = Mozu.CommerceRuntime.Contracts.Discounts;
using OrdersDC = Mozu.CommerceRuntime.Contracts.Orders;
using PaymentsDC = Mozu.CommerceRuntime.Contracts.Payments;
using ProductsDC = Mozu.CommerceRuntime.Contracts.Products;
using ShippingDC = Mozu.CommerceRuntime.Contracts.Shipping;
using CommerceDC = Mozu.CommerceRuntime.Contracts.Commerce;

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
            Map_DcAppliedProductDiscount_to_OrderItemDiscount();
            Map_DcShippingDiscount_to_ShippingDiscount();
            Map_DcPayment_to_OrderPayment();
            Map_DcPaymentInteraction_to_PaymentInteraction();
            Map_DcPackage_to_OrderPackage();
            Map_DcPackageItem_to_OrderPackageItem();
            Map_DcAdjustment_to_OrderAdjustment();
            Map_DcAppliedDiscount_to_OrderDiscount();

            Map_OrderPackage_to_DcPackage();
            Map_OrderPackageItem_to_DcPackageItem();
            Map_OrderItem_to_DcOrderItem();
            Map_OrderItemDiscount_to_DcAppliedProductDiscount();
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
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.SiteId, op => op.MapFrom(dc => dc.SiteId))
                .ForMember(x => x.SiteGroupId, op => op.MapFrom(dc => dc.SiteGroupId))
                .ForMember(x => x.TenantId, op => op.MapFrom(dc => dc.TenantId))

                .ForMember(x => x.OrderNumber, op => op.MapFrom(dc => dc.OrderNumber))
                .ForMember(x => x.CreateDate, op => op.MapFrom(dc => dc.AuditInfo.CreateDate))
                .ForMember(x => x.CustomerId, op => op.MapFrom(dc => dc.CustomerAccountId))
                .ForMember(x => x.BillingContact, op => op.MapFrom(dc => dc.BillingInfo.BillingContact))
                .ForMember(x => x.ShippingContact, op => op.MapFrom(dc => dc.ShippingInfo.ShippingContact))
                .ForMember(x => x.ShippingMethodCode, op => op.MapFrom(dc => dc.ShippingInfo.ShippingMethodCode))
                .ForMember(x => x.ShippingMethodName, op => op.MapFrom(dc => dc.ShippingInfo.ShippingMethodName))
                .ForMember(x => x.IpAddress, op => op.MapFrom(dc => dc.IPAddress))
                .ForMember(x => x.Items, op => op.MapFrom(dc => dc.Items))
                .ForMember(x => x.Subtotal, op => op.MapFrom(dc => dc.Subtotal))
                .ForMember(x => x.ActiveOrderDiscount, op => op.MapFrom(dc => dc.OrderDiscounts != null ? dc.OrderDiscounts.FirstOrDefault(d => d.Excluded.HasValue && !d.Excluded.Value) : null))
                .ForMember(x => x.OrderDiscounts, op => op.MapFrom(dc => dc.OrderDiscounts))

                .ForMember(x => x.ActiveShippingDiscount, op => op.MapFrom(dc => dc.ShippingDiscounts != null ? dc.ShippingDiscounts.FirstOrDefault(d => d.Discount.Excluded.HasValue && !d.Discount.Excluded.Value) : null))
                .ForMember(x => x.ShippingDiscounts, op => op.MapFrom(dc => dc.ShippingDiscounts))
                .ForMember(x => x.ShippingTotal, op => op.MapFrom(dc => dc.ShippingTotal))
                .ForMember(x => x.Total, op => op.MapFrom(dc => dc.Total))
                .ForMember(x => x.CustomerNote, op => op.MapFrom(dc => dc.ShopperNotes != null ? dc.ShopperNotes.Comments : null))
                .ForMember(x => x.OrderStatus, op => op.MapFrom(dc => dc.Status))
                .ForMember(x => x.ShippingStatus, op => op.MapFrom(dc => dc.ShipmentStatus))
                .ForMember(x => x.PaymentStatus, op => op.MapFrom(dc => dc.PaymentStatus))
                .ForMember(x => x.Payments, op => op.MapFrom(dc => dc.Payments.OrderByDescending(p => p.AuditInfo.CreateDate)))
                .ForMember(x => x.Packages, op => op.MapFrom(dc => dc.Packages))

                .ForMember(x => x.OrderAdjustment, op => op.MapFrom(dc => dc.Adjustment))
                .ForMember(x => x.ShippingAdjustment, op => op.MapFrom(dc => dc.ShippingAdjustment))

                .ForMember(x => x.IsDraft, op => op.MapFrom(dc => dc.IsDraft.HasValue ? dc.IsDraft.Value : false))
                .ForMember(x => x.HasDraft, op => op.MapFrom(dc => dc.HasDraft.HasValue ? dc.HasDraft.Value : false))

                // .ForMember(x => x.DiscountTotal, op => op.MapFrom(dc => dc.ShippingInfo.
                .ForMember(x => x.AvailableActions, op => op.MapFrom(dc => dc.AvailableActions))
                .AfterMap((dc, order) =>
                {
                    // sort order packages by create date (for consistent ordering in UI)
                    order.Packages = order.Packages.OrderBy(p => p.CreateDate).ToList();

                    // add orderId to packages
                    order.Packages.Each(p => p.OrderId = order.Id);

                    // add item name, etc to packageItems
                    order.Packages.SelectMany(p => p.Items).Each(packageItem => FillPackageItemDetails(packageItem, order));

                    // add weight to each package
                    order.Packages.Each(p => { if (p.Weight == null) p.Weight = p.Items.Sum(i => i.Weight.HasValue ? i.Weight : 0); });
                })
                .AfterMap((dc, order) =>
                {
                    // fill out AuthorizationInfo object
                    if (order.Payments == null)
                        return;

                    order.AuthorizationInfo = new OrderAuthorizationInfo
                    {
                        TotalAmount = order.Total,
                        AmountCollected = order.Payments.Sum(p => p.AmountCollected),
                    };
                    order.AuthorizationInfo.CaptureAmount = order.AuthorizationInfo.TotalAmount - order.AuthorizationInfo.AmountCollected;

                })
                .AfterMap((dc, order) =>
                {
                    // fill out UnpackagedItems list
                    order.UnpackagedItems =
                        (from orderItem in order.Items
                         let packagedItems = order.Packages.SelectMany(p => p.Items).Where(i => i.OrderItemId == orderItem.Id)
                         let packagedQuantity = packagedItems.Sum(i => i.Quantity)
                         let remainingQuantity = orderItem.Quantity - packagedQuantity
                         where remainingQuantity > 0
                         select new OrderPackageItem
                         {
                             OrderItemId = orderItem.Id,
                             ProductCode = orderItem.ProductCode,
                             ProductName = orderItem.ProductName,
                             Weight = orderItem.UnitWeight * remainingQuantity,
                             Quantity = remainingQuantity
                         }).ToList();
                })
                .AfterMap((dc, order) =>
                {
                    // fill out number of items ordered, shipped, unshipped
                    order.ItemsOrdered = order.Items.Sum(i => i.Quantity);
                    order.ItemsNotShipped = order.UnpackagedItems.Sum(i => i.Quantity);
                    order.ItemsShipped = order.Packages == null || order.Packages.Count == 0 ? 0 : order.Packages.SelectMany(p => p.Items).Sum(i => i.Quantity);
                })
                ;
        }

        private void Map_DcOrderItem_to_OrderItem()
        {
            Mapper.CreateMap<OrdersDC.OrderItem, OrderItem>()
                  .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                  .ForMember(x => x.ProductCode, op => op.MapFrom(dc => dc.Product.ProductCode))
                  .ForMember(x => x.ProductName, op => op.MapFrom(dc => dc.Product.Name))
                  .ForMember(x => x.UnitPrice, op => op.MapFrom(dc => dc.UnitPrice.BaseAmount))
                  .ForMember(x => x.ListPrice, op => op.MapFrom(dc => dc.UnitPrice.ListAmount))
                  .ForMember(x => x.UnitWeight, op => op.MapFrom(dc => dc.Product.Measurements != null && dc.Product.Measurements != null ? dc.Product.Measurements.Weight : null))
                  .ForMember(x => x.Quantity, op => op.MapFrom(dc => dc.Quantity))
                  .ForMember(x => x.ActiveDiscount, op => op.MapFrom(dc => dc.ProductDiscounts != null ? dc.ProductDiscounts.FirstOrDefault(d => d.Excluded.HasValue && !d.Excluded.Value) : null))
                  .ForMember(x => x.Discounts, op => op.MapFrom(dc => dc.ProductDiscounts))
                  .ForMember(x => x.ActiveShippingDiscount, op => op.MapFrom(dc => dc.ShippingDiscounts != null ? dc.ShippingDiscounts.FirstOrDefault(d => d.Discount.Excluded.HasValue && !d.Discount.Excluded.Value) : null))
                  .ForMember(x => x.ShippingDiscounts, op => op.MapFrom(dc => dc.ShippingDiscounts))
                  .ForMember(x => x.Options, op => op.MapFrom(dc => dc.Product.Options))
                  .AfterMap((dc, orderItem) =>
                  {
                      if (orderItem.Discounts != null)
                      {
                          orderItem.Discounts.Each(d => d.Quantity = d.Quantity == 0 ? orderItem.Quantity : d.Quantity);
                      }
                  });
            // TODO: shopper entered value
            ;
        }

        private void Map_DcAppliedProductDiscount_to_OrderItemDiscount()
        {
            Mapper.CreateMap<DiscountDC.AppliedProductDiscount, OrderItemDiscount>()
                .ForMember(x => x.DiscountId, op => op.MapFrom(dc => dc.Discount.Id))
                .ForMember(x => x.Quantity, op => op.MapFrom(dc => dc.ProductQuantity))
                .ForMember(x => x.Description, op => op.MapFrom(dc => dc.Discount.Name))
                .ForMember(x => x.UnitPrice, op => op.MapFrom(dc => dc.ImpactPerUnit))
                .ForMember(x => x.Total, op => op.MapFrom(dc => dc.Impact))
                .ForMember(x => x.CouponCode, op => op.MapFrom(dc => dc.CouponCode))
                .ForMember(x => x.IsActive, op => op.MapFrom(dc => dc.Excluded.HasValue && !dc.Excluded.Value))
                ;
        }

        private void Map_DcAppliedDiscount_to_OrderDiscount()
        {
            Mapper.CreateMap<DiscountDC.AppliedDiscount, OrderDiscount>()
                .ForMember(x => x.DiscountId, op => op.MapFrom(dc => dc.Discount.Id))
                .ForMember(x => x.Description, op => op.MapFrom(dc => dc.Discount.Name))
                .ForMember(x => x.ExpirationDate, op => op.MapFrom(dc => dc.Discount.ExpirationDate))
                .ForMember(x => x.CouponCode, op => op.MapFrom(dc => dc.CouponCode))
                .ForMember(x => x.Total, op => op.MapFrom(dc => dc.Impact))
                .ForMember(x => x.IsActive, op => op.MapFrom(dc => dc.Excluded.HasValue && !dc.Excluded.Value))
                ;
        }

        private void Map_DcShippingDiscount_to_ShippingDiscount()
        {
            Mapper.CreateMap<DiscountDC.ShippingDiscount, ShippingDiscount>()
                .ForMember(x => x.DiscountId, op => op.MapFrom(dc => dc.Discount.Discount.Id))
                .ForMember(x => x.MethodCode, op => op.MapFrom(dc => dc.MethodCode))
                .ForMember(x => x.Description, op => op.MapFrom(dc => dc.Discount.Discount.Name))
                .ForMember(x => x.Total, op => op.MapFrom(dc => dc.Discount.Impact))
                .ForMember(x => x.CouponCode, op => op.MapFrom(dc => dc.Discount.CouponCode))
                .ForMember(x => x.IsActive, op => op.MapFrom(dc => dc.Discount.Excluded.HasValue && !dc.Discount.Excluded.Value))
                ;
        }

        private void Map_DcPayment_to_OrderPayment()
        {
            Mapper.CreateMap<PaymentsDC.Payment, OrderPayment>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.OrderId, op => op.MapFrom(dc => dc.OrderId))
                .ForMember(x => x.PaymentServiceTransactionId, op => op.MapFrom(dc => dc.PaymentServiceTransactionId))
                .ForMember(x => x.Status, op => op.MapFrom(dc => dc.Status))
                .ForMember(x => x.AmountCollected, op => op.MapFrom(dc => dc.AmountCollected))
                .ForMember(x => x.AmountCredited, op => op.MapFrom(dc => dc.AmountCredited))
                .ForMember(x => x.AmountAuthorized, op => op.ResolveUsing(dc =>
                {
                    if (dc.PaymentType == PaymentsDC.PaymentTypeConst.CHECK && dc.Status == "Pending" && dc.Interactions.Any(i => i.Status == "CheckRequested"))
                        return dc.Interactions.First(i => i.Status == "CheckRequested").Amount.GetValueOrDefault(0);
                    else if (dc.Status == "Authorized" && dc.Interactions.Any(i => i.Status == "Authorized"))
                        return dc.Interactions.First(i => i.Status == "Authorized").Amount.GetValueOrDefault(0);
                    else
                        return 0;
                }))
                .ForMember(x => x.Interactions, op => op.MapFrom(dc => dc.Interactions.OrderByDescending(t => t.AuditInfo.CreateDate)))
                .ForMember(x => x.PaymentType, op => op.MapFrom(dc => dc.PaymentType))
                .ForMember(x => x.CardType, op => op.MapFrom(dc => dc.BillingInfo.Card != null ? dc.BillingInfo.Card.PaymentOrCardType : null))
                .ForMember(x => x.CardNumber, op => op.MapFrom(dc => dc.BillingInfo.Card != null ? dc.BillingInfo.Card.CardNumberPartOrMask : null))
                .ForMember(x => x.NameOnCard, op => op.MapFrom(dc => dc.BillingInfo.Card != null ? dc.BillingInfo.Card.NameOnCard : null))
                .ForMember(x => x.CreateDate, op => op.MapFrom(dc => dc.AuditInfo.CreateDate))
                .ForMember(x => x.AvailableActions, op => op.MapFrom(dc => dc.AvailableActions))
                .ForMember(x => x.CreateDate, op => op.MapFrom(dc => dc.AuditInfo.CreateDate))
                .AfterMap((dc, payment) =>
                {
                    if (payment.PaymentType == "Check")
                        return;

                    // if the payment is manual, all available actions should actually be ManualXXX
                    if (payment.IsManual)
                    {
                        payment.AvailableActions = payment.AvailableActions.Select(action => action.StartsWith("Rollback") ? action : "Manual" + action).ToList();
                    }
                    // otherwise we should duplicate each available actions with a ManualXXX.
                    else
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
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.GatewayTransactionId, op => op.MapFrom(dc => dc.GatewayTransactionId))
                .ForMember(x => x.GatewayInteractionId, op => op.MapFrom(dc => dc.GatewayInteractionId))
                .ForMember(x => x.GatewayInteractionIdReference, op => op.MapFrom(dc => dc.PaymentTransactionInteractionIdReference))
                .ForMember(x => x.InteractionType, op => op.MapFrom(dc => dc.InteractionType))
                .ForMember(x => x.CheckNumber, op => op.MapFrom(dc => dc.CheckNumber))
                .ForMember(x => x.Status, op => op.MapFrom(dc => dc.Status))
                .ForMember(x => x.CreateDate, op => op.MapFrom(dc => dc.AuditInfo != null ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.PaymentId, op => op.MapFrom(dc => dc.PaymentId))
                .ForMember(x => x.IsManual, op => op.MapFrom(dc => dc.IsManual))
                ;
        }

        private void Map_DcPackage_to_OrderPackage()
        {
            Mapper.CreateMap<ShippingDC.Package, OrderPackage>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.ShipmentId, op => op.MapFrom(dc => dc.ShipmentId))
                .ForMember(x => x.ShippingMethodCode, op => op.MapFrom(dc => dc.ShippingMethodCode))
                .ForMember(x => x.ShippingMethodName, op => op.MapFrom(dc => dc.ShippingMethodName))
                .ForMember(x => x.TrackingNumber, op => op.MapFrom(dc => dc.TrackingNumber))

                .ForMember(x => x.PackagingType, op => op.MapFrom(dc => String.IsNullOrEmpty(dc.PackagingType) ? "CUSTOM" : dc.PackagingType))
                .ForMember(x => x.Height, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Height : null))
                .ForMember(x => x.Length, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Length : null))
                .ForMember(x => x.Width, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Width : null))
                .ForMember(x => x.Weight, op => op.MapFrom(dc => dc.Measurements != null && dc.Measurements.Weight != null ? dc.Measurements.Weight.Value : null))
                .ForMember(x => x.Items, op => op.MapFrom(dc => dc.Items))
                .ForMember(x => x.AvailableActions, op => op.MapFrom(dc => dc.AvailableActions))
                .ForMember(x => x.CreateDate, op => op.MapFrom(dc => dc.AuditInfo.CreateDate))
                .ForMember(x => x.ShipDate, op => op.MapFrom(dc => dc.AuditInfo.UpdateDate))
                .ForMember(x => x.TotalQuantity, op => op.MapFrom(dc => dc.Items.Sum(i => i.Quantity)))
                ;
        }

        private void Map_DcPackageItem_to_OrderPackageItem()
        {
            Mapper.CreateMap<ShippingDC.PackageItem, OrderPackageItem>()
                .ForMember(x => x.OrderItemId, op => op.MapFrom(dc => dc.OrderItemId))
                .ForMember(x => x.Quantity, op => op.MapFrom(dc => dc.Quantity))
                ;
        }

        private void Map_Adjustment_to_DcAdjustment()
        {
            Mapper.CreateMap<CommerceDC.Adjustment, Adjustment>()
                .ForMember(x => x.Amount, op => op.MapFrom(dc => dc.Amount))
                .ForMember(x => x.Description, op => op.MapFrom(dc => dc.Description))
                .ForMember(x => x.InternalComment, op => op.MapFrom(dc => dc.InternalComment))
                ;
        }

        private void Map_OrderPackage_to_DcPackage()
        {
            Mapper.CreateMap<OrderPackage, ShippingDC.Package>()
                .ForMember(dc => dc.Id, op => op.MapFrom(x => x.Id))
                .ForMember(dc => dc.Items, op => op.MapFrom(x => x.Items))
                .ForMember(dc => dc.ShipmentId, op => op.MapFrom(x => x.ShipmentId))
                .ForMember(dc => dc.PackagingType, op => op.MapFrom(x => x.PackagingType))
                .ForMember(dc => dc.ShippingMethodCode, op => op.MapFrom(x => x.ShippingMethodCode))
                .ForMember(dc => dc.ShippingMethodName, op => op.MapFrom(x => x.ShippingMethodName))
                .ForMember(dc => dc.Status, op => op.MapFrom(x => x.Status))
                .ForMember(dc => dc.TrackingNumber, op => op.MapFrom(x => x.TrackingNumber))
                .ForMember(dc => dc.Measurements, op => op.MapFrom(x => new CommerceDC.PackageMeasurements
                {
                    Height = new Core.Api.Contracts.Measurement { Unit = "in", Value = x.Height },
                    Width = new Core.Api.Contracts.Measurement { Unit = "in", Value = x.Width },
                    Length = new Core.Api.Contracts.Measurement { Unit = "in", Value = x.Length },
                    Weight = new Core.Api.Contracts.Measurement { Unit = "lbs", Value = x.Weight }
                }))
                ;
        }

        private void Map_OrderPackageItem_to_DcPackageItem()
        {
            Mapper.CreateMap<OrderPackageItem, ShippingDC.PackageItem>()
                .ForMember(dc => dc.OrderItemId, op => op.MapFrom(x => x.OrderItemId))
                .ForMember(dc => dc.Quantity, op => op.MapFrom(x => x.Quantity))
                ;
        }

        private void Map_OrderItem_to_DcOrderItem()
        {
            Mapper.CreateMap<OrderItem, OrdersDC.OrderItem>()
                  .ForMember(dc => dc.Id, op => op.MapFrom(x => x.Id))
                  .ForMember(dc => dc.UnitPrice, op => op.Ignore())
                  .ForMember(dc => dc.Product, op => op.ResolveUsing(x => {
                      return new ProductsDC.Product
                      {
                          ProductCode = x.ProductCode,
                          Name = x.ProductName,
                          Options = Mapper.Map<List<ProductsDC.ProductOption>>(x.Options)
                          // other stuff (price/measurements) are not important to make service calls.
                      };
                  }))
                  .ForMember(dc => dc.Quantity, op => op.MapFrom(x => x.Quantity))
                  .ForMember(dc => dc.ProductDiscounts, op => op.MapFrom(x => x.Discounts))
                  .ForMember(dc => dc.ShippingDiscounts, op => op.MapFrom(x => x.ShippingDiscounts))
                  ;
        }

        private void Map_OrderItemDiscount_to_DcAppliedProductDiscount()
        { 
            Mapper.CreateMap<OrderItemDiscount, DiscountDC.AppliedProductDiscount>()
                .ForMember(dc => dc.ProductQuantity, op => op.MapFrom(x => x.Quantity))
                .ForMember(dc => dc.Discount, op => op.ResolveUsing(x => {
                    return new DiscountDC.Discount {
                        Id = x.DiscountId,
                        Name = x.Description
                    };
                }))
                .ForMember(dc => dc.ImpactPerUnit, op => op.MapFrom(x => x.UnitPrice))
                .ForMember(dc => dc.Impact, op => op.MapFrom(x => x.Total))
                .ForMember(dc => dc.CouponCode, op => op.MapFrom(x => x.CouponCode))
                .ForMember(dc => dc.Excluded, op => op.MapFrom(x => !x.IsActive))
                ;
        }

        private void Map_OrderDiscount_to_DcAppliedDiscount()
        {
            Mapper.CreateMap<OrderDiscount, DiscountDC.AppliedDiscount>()
                .ForMember(dc => dc.CouponCode, op => op.MapFrom(x => x.CouponCode))
                .ForMember(dc => dc.Impact, op => op.MapFrom(x => x.Total))
                .ForMember(dc => dc.Excluded, op => op.MapFrom(x => !x.IsActive))
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
                .ForMember(dc => dc.MethodCode, op => op.MapFrom(x => x.MethodCode))
                .ForMember(dc => dc.Discount, op => op.ResolveUsing(x => {
                    return new DiscountDC.AppliedDiscount {
                        CouponCode = x.CouponCode,
                        Impact = x.Total,
                        Excluded = !x.IsActive,
                        Discount = new DiscountDC.Discount {
                            Id = x.DiscountId,
                            Name = x.Description
                        }
                    };
                }))
                ;
        }

        private void Map_DcAdjustment_to_OrderAdjustment()
        {
            Mapper.CreateMap<Adjustment, CommerceDC.Adjustment>()
                .ForMember(dc => dc.Amount, op => op.MapFrom(x => x.Amount))
                .ForMember(dc => dc.Description, op => op.MapFrom(x => x.Description))
                .ForMember(dc => dc.InternalComment, op => op.MapFrom(x => x.InternalComment))
                ;
        }

        /// <summary>
        /// Looks up a package item by OrderItemId and fills in the other information.
        /// </summary>
        private void FillPackageItemDetails(OrderPackageItem packageItem, Order order)
        {
            if (packageItem == null || order == null || order.Items == null)
                return;

            var itemInOrder = order.Items.FirstOrDefault(i => i.Id == packageItem.OrderItemId);

            if (itemInOrder == null)
                return;

            packageItem.ProductCode = itemInOrder.ProductCode;
            packageItem.ProductName = itemInOrder.ProductName;
            packageItem.Total = itemInOrder.Total;
            packageItem.UnitPrice = itemInOrder.UnitPrice;
            packageItem.Weight = itemInOrder.UnitWeight.HasValue ? packageItem.Quantity * itemInOrder.UnitWeight : null;
        }
    }
}
