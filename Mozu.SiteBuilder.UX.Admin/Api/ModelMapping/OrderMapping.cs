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
using ShippingDC = Mozu.CommerceRuntime.Contracts.Shipping;

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
            Mapper.CreateMap<OrdersDC.Order, Order>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.OrderNumber, op => op.MapFrom(dc => dc.OrderNumber))
                .ForMember(x => x.CreateDate, op => op.MapFrom(dc => dc.AuditInfo.CreateDate ))
                .ForMember(x => x.CustomerId, op => op.MapFrom(dc => dc.CustomerAccountId))
                .ForMember(x => x.BillingContact, op => op.MapFrom(dc => dc.BillingInfo.BillingContact))
                .ForMember(x => x.IpAddress, op => op.MapFrom(dc => dc.IPAddress))
                .ForMember(x => x.Items, op => op.MapFrom(dc => dc.Items))
                .ForMember(x => x.Subtotal, op => op.MapFrom(dc => dc.Subtotal))
                .ForMember(x => x.OrderDiscountTotal, op => op.MapFrom(dc => dc.DiscountTotal))
                .ForMember(x => x.ShippingDiscount, op => op.MapFrom(dc => dc.ShippingDiscount != null && dc.ShippingDiscount.Discount != null ? (decimal?)dc.ShippingDiscount.Discount.Impact : null))
                .ForMember(x => x.ShippingDiscountDescription, op => op.MapFrom(dc => dc.ShippingDiscount != null && dc.ShippingDiscount.Discount != null && dc.ShippingDiscount.Discount.Discount != null ? dc.ShippingDiscount.Discount.Discount.Name : null))
                .ForMember(x => x.ShippingTotal, op => op.MapFrom(dc => dc.ShippingTotal))
                .ForMember(x => x.Total, op => op.MapFrom(dc => dc.Total))
                .ForMember(x => x.CustomerNote, op => op.MapFrom(dc => dc.ShopperNotes != null ? dc.ShopperNotes.Comments : null))
                .ForMember(x => x.OrderStatus, op => op.MapFrom(dc => dc.Status))
                .ForMember(x => x.ShippingStatus, op => op.MapFrom(dc => dc.ShipmentStatus))
                .ForMember(x => x.PaymentStatus, op => op.MapFrom(dc => dc.PaymentStatus))
                .ForMember(x => x.Payments, op => op.MapFrom(dc => dc.Payments))
                .ForMember(x => x.Packages, op => op.MapFrom(dc => dc.Packages))
                // .ForMember(x => x.DiscountTotal, op => op.MapFrom(dc => dc.ShippingInfo.
                .ForMember(x => x.AvailableActions, op => op.MapFrom(dc => dc.AvailableActions))
                .AfterMap((dc, order) => {
                    // add orderId to packages
                    order.Packages.Each(p => p.OrderId = order.Id);

                    // add item name, etc to packageItems
                    order.Packages.SelectMany(p => p.Items).Each(packageItem => FillPackageItemDetails(packageItem, order));
                })
                .AfterMap((dc, order) => {
                    // fill out AuthorizationInfo object
                    if (order.Payments == null)
                        return;

                    order.AuthorizationInfo = new OrderAuthorizationInfo {
                        TotalAmount = order.Total,
                        AmountCollected = order.Payments.Sum(p => p.AmountCollected),
                        AuthReady = order.Payments.Any(p => p.AvailableActions.Contains("CapturePayment")),
                        CaptureData = order.Payments.OrderByDescending(p => p.AvailableActions.Contains("CapturePayment")).FirstOrDefault()
                    };
                    order.AuthorizationInfo.CaptureAmount = order.AuthorizationInfo.TotalAmount - order.AuthorizationInfo.AmountCollected;
                    order.AuthorizationInfo.CanCapture = order.AuthorizationInfo.AuthReady && order.AuthorizationInfo.CaptureAmount > 0;
                })
                .AfterMap((dc, order) => {
                    // fill out UnpackagedItems list
                    order.UnpackedItems = 
                        (from orderItem in order.Items
                        let packagedItems = order.Packages.SelectMany(p => p.Items).Where(i => i.OrderItemId == orderItem.Id)
                        let packagedQuantity = packagedItems.Sum(i => i.Quantity)
                        let remainingQuantity = orderItem.Quantity - packagedQuantity
                        where remainingQuantity > 0
                        select new OrderPackageItem { 
                            OrderItemId = orderItem.Id, 
                            ProductCode = orderItem.ProductCode, 
                            ProductName = orderItem.ProductName,
                            Weight = orderItem.UnitWeight * remainingQuantity,
                            Quantity = remainingQuantity
                        }).ToList();
                })
                ;

            Mapper.CreateMap<OrdersDC.OrderItem, OrderItem>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.ProductCode, op => op.MapFrom(dc => dc.Product.ProductCode))
                // TODO: options .ForMember(x => x.Options, op => op.MapFrom(dc => dc.Product.Options))
                .ForMember(x => x.ProductName, op => op.MapFrom(dc => dc.Product.Name))
                .ForMember(x => x.UnitPrice, op => op.MapFrom(dc => dc.Product.Price.Price))
                .ForMember(x => x.UnitWeight, op => op.MapFrom(dc => dc.Product.Measurements != null && dc.Product.Measurements != null ? dc.Product.Measurements.Weight : null))
                .ForMember(x => x.Quantity, op => op.MapFrom(dc => dc.Quantity))
                //TODO:find out where the metadata for discount went
                .ForMember(x => x.Discount, op => op.MapFrom(dc => dc.ProductDiscount ))
                .ForMember(x => x.Options, op => op.MapFrom(dc => dc.Product.Options != null ? dc.Product.Options.Select(o => o.Value) : null))
                // TODO: shopper entered value
                ;

            Mapper.CreateMap<DiscountDC.AppliedProductDiscount, OrderItemDiscount>()
                .ForMember(x => x.Quantity, op => op.MapFrom(dc => dc.ProductQuantity))
                .ForMember(x => x.Description, op => op.MapFrom(dc => dc.Discount.Name))
                .ForMember(x => x.UnitPrice, op => op.MapFrom(dc => dc.ImpactPerUnit))
                .ForMember(x => x.Total, op => op.MapFrom(dc => dc.Impact))
                ;

            Mapper.CreateMap<PaymentsDC.Payment, OrderPayment>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.OrderId, op => op.MapFrom(dc => dc.OrderId))
                .ForMember(x => x.PaymentServiceTransactionId, op => op.MapFrom(dc => dc.PaymentServiceTransactionId))
                .ForMember(x => x.Status, op => op.MapFrom(dc => dc.Status))
                .ForMember(x => x.AmountCollected, op => op.MapFrom(dc => dc.AmountCollected))
                .ForMember(x => x.AmountCredited, op => op.MapFrom(dc => dc.AmountCredited))
                .ForMember(x => x.Interactions, op => op.MapFrom(dc => dc.Interactions))
                .ForMember(x => x.PaymentType, op => op.MapFrom(dc => dc.PaymentType))
                .ForMember(x => x.CardType, op => op.MapFrom(dc => dc.BillingInfo.Card != null ? dc.BillingInfo.Card.PaymentOrCardType : null))
                .ForMember(x => x.CardNumber, op => op.MapFrom(dc => dc.BillingInfo.Card != null ? dc.BillingInfo.Card.CardNumberPartOrMask : null))
                .ForMember(x => x.NameOnCard, op => op.MapFrom(dc => dc.BillingInfo.Card != null ? dc.BillingInfo.Card.NameOnCard : null))
                .ForMember(x => x.CreateDate, op => op.MapFrom(dc => dc.AuditInfo.CreateDate))
                .ForMember(x => x.AvailableActions, op => op.MapFrom(dc => dc.AvailableActions))
                .ForMember(x => x.CreateDate, op => op.MapFrom(dc => dc.AuditInfo.CreateDate))
                ;

            Mapper.CreateMap<PaymentsDC.PaymentInteraction, OrderPaymentInteraction>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.GatewayInteractionId, op => op.MapFrom(dc => dc.GatewayInteractionId))
                .ForMember(x => x.GatewayInteractionIdReference, op => op.MapFrom(dc => dc.PaymentTransactionInteractionIdReference))
                .ForMember(x => x.InteractionType, op => op.MapFrom(dc => dc.InteractionType))
                .ForMember(x => x.CheckNumber, op => op.MapFrom(dc => dc.CheckNumber))
                .ForMember(x => x.Status, op => op.MapFrom(dc => dc.Status))
                ;

            Mapper.CreateMap<ShippingDC.Package, OrderPackage>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.ShipmentId, op => op.MapFrom(dc => dc.ShipmentId))
                .ForMember(x => x.ShippingMethodCode, op => op.MapFrom(dc => dc.ShippingMethodCode))
                .ForMember(x => x.ShippingMethodName, op => op.MapFrom(dc => dc.ShippingMethodName))
                .ForMember(x => x.TrackingNumber, op => op.MapFrom(dc => dc.TrackingNumber))
                
                .ForMember(x => x.PackagingType, op => op.MapFrom(dc => dc.PackagingType))
                .ForMember(x => x.Height, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Height : null))
                .ForMember(x => x.Length, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Length : null))
                .ForMember(x => x.Width, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Width : null))
                .ForMember(x => x.Weight, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Weight : null))
                .ForMember(x => x.Items, op => op.MapFrom(dc => dc.Items))
                .ForMember(x => x.AvailableActions, op => op.MapFrom(dc => dc.AvailableActions))
                ;

            Mapper.CreateMap<ShippingDC.PackageItem, OrderPackageItem>()
                .ForMember(x => x.OrderItemId, op => op.MapFrom(dc => dc.OrderItemId))
                .ForMember(x => x.Quantity, op => op.MapFrom(dc => dc.Quantity))
                ;

            Mapper.CreateMap<OrderPackage, ShippingDC.Package>()
                .ForMember(dc => dc.Id, op => op.MapFrom(x => x.Id))
                .ForMember(dc => dc.Items, op => op.MapFrom(x => x.Items))
                .ForMember(dc => dc.ShipmentId, op => op.MapFrom(x => x.ShipmentId))
                .ForMember(dc => dc.PackagingType, op => op.MapFrom(x => x.PackagingType))
                .ForMember(dc => dc.ShippingMethodCode, op => op.MapFrom(x => x.ShippingMethodCode))
                .ForMember(dc => dc.ShippingMethodName, op => op.MapFrom(x => x.ShippingMethodName))
                .ForMember(dc => dc.Status, op => op.MapFrom(x => x.Status))
                .ForMember(dc => dc.TrackingNumber, op => op.MapFrom(x => x.TrackingNumber))
                .ForMember(dc => dc.Measurements, op => op.MapFrom(x => new Mozu.CommerceRuntime.Contracts.Commerce.PackageMeasurements { 
                    Height = new Core.Api.Contracts.Measurement { Unit = "in", Value = x.Height },
                    Width = new Core.Api.Contracts.Measurement { Unit = "in", Value = x.Width },
                    Length = new Core.Api.Contracts.Measurement { Unit = "in", Value = x.Length },
                    Weight = new Core.Api.Contracts.Measurement { Unit = "lbs", Value = x.Weight }
                }))
                ;

            Mapper.CreateMap<OrderPackageItem, ShippingDC.PackageItem>()
                .ForMember(dc => dc.OrderItemId, op => op.MapFrom(x => x.OrderItemId))
                .ForMember(dc => dc.Quantity, op => op.MapFrom(x => x.Quantity))
                ;

            // cheese
            Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, decimal?>()
                .ConvertUsing(f => f == null ? null : f.Value);
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
            packageItem.Weight = itemInOrder.UnitWeight.HasValue ? packageItem.Quantity * itemInOrder.UnitWeight : null;
        }
    
        /// <summary>
        /// Flattens an address object into a string for the UI.
        /// </summary>
        string FormatAddress(Core.Api.Contracts.Address address)
        {
            if (address == null)
                return null;

            StringBuilder sb = new StringBuilder();

            sb.Append(address.Address1);

            if (!String.IsNullOrWhiteSpace(address.CityOrTown) || !String.IsNullOrWhiteSpace(address.StateOrProvince) || !String.IsNullOrWhiteSpace(address.PostalOrZipCode))
            {
                if (sb.Length > 0)
                    sb.Append(", ");

                sb.AppendFormat("{0} {1} {2}", address.CityOrTown, address.StateOrProvince, address.PostalOrZipCode);
            }

            if (!String.IsNullOrWhiteSpace(address.CountryCode))
                sb.Append(sb.Length > 0 ? ", " + address.CountryCode : address.CountryCode);


            return sb.ToString();
        }
    }
}
