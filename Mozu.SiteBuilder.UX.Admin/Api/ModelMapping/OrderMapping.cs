using System;
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
                .ForMember(x => x.IpAddress, op => op.MapFrom(dc => dc.IPAddress))
                .ForMember(x => x.Items, op => op.MapFrom(dc => dc.Items))
                .ForMember(x => x.Subtotal, op => op.MapFrom(dc => dc.Subtotal))
                .ForMember(x => x.OrderDiscountTotal, op => op.MapFrom(dc => dc.DiscountTotal))
                .ForMember(x => x.ShippingTotal, op => op.MapFrom(dc => dc.ShippingTotal))
                .ForMember(x => x.Total, op => op.MapFrom(dc => dc.Total))
                .ForMember(x => x.CustomerNote, op => op.MapFrom(dc => dc.ShopperNotes != null ? dc.ShopperNotes.Comments : null))
                .ForMember(x => x.OrderStatus, op => op.MapFrom(dc => dc.Status))
                .ForMember(x => x.ShippingStatus, op => op.MapFrom(dc => dc.ShipmentStatus))
                .ForMember(x => x.PaymentStatus, op => op.MapFrom(dc => dc.PaymentStatus))
                .ForMember(x => x.Payments, op => op.MapFrom(dc => dc.Payments))
                // .ForMember(x => x.DiscountTotal, op => op.MapFrom(dc => dc.ShippingInfo.
                //.ForMember(x => x.AvailableOrderActions, op => op.MapFrom(dc => dc.AvailableOrderActions))
                //.ForMember(x => x.AvailablePaymentActions, op => op.MapFrom(dc => dc.AvailablePaymentActions))
                //.ForMember(x => x.AvailableShipmentActions, op => op.MapFrom(dc => dc.AvailableShipmentActions))
                .AfterMap((dc, order) => {
                    order.Packages.SelectMany(p => p.Items).Each(packageItem => FillPackageItemDetails(packageItem, order));
                })
                ;

            Mapper.CreateMap<OrdersDC.OrderItem, OrderItem>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.ProductCode, op => op.MapFrom(dc => dc.Product.ProductCode))
                // TODO: options .ForMember(x => x.Options, op => op.MapFrom(dc => dc.Product.Options))
                .ForMember(x => x.ProductName, op => op.MapFrom(dc => dc.Product.Name))
                .ForMember(x => x.UnitPrice, op => op.MapFrom(dc => dc.Product.Price.Price))
                .ForMember(x => x.Quantity, op => op.MapFrom(dc => dc.Quantity))
                //TODO:find out where the metadata for discount went
                .ForMember(x => x.Discount, op => op.MapFrom(dc => dc.ProductDiscount ))
                .ForMember(x => x.Options, op => op.MapFrom(dc => dc.Product.Options != null ? dc.Product.Options.Select(o => o.OptionValue) : null))
                // TODO: shopper entered value
                ;

            Mapper.CreateMap<DiscountDC.AppliedProductDiscount, OrderItemDiscount>()
                .ForMember(x => x.Quantity, op => op.MapFrom(dc => dc.ProductQuantity))
                .ForMember(x => x.Description, op => op.MapFrom(dc => dc.Discount.Name))
                .ForMember(x => x.UnitPrice, op => op.MapFrom(dc => dc.ImpactPerUnit))
                .ForMember(x => x.Total, op => op.MapFrom(dc => dc.Impact))
                ;

            Mapper.CreateMap<CustomerDC.CustomerAccount, OrderCustomer>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.FirstName, op => op.MapFrom(dc => dc.Contacts != null && dc.Contacts.Count > 0 ? dc.Contacts.First().FirstName : null))
                .ForMember(x => x.LastName, op => op.MapFrom(dc => dc.Contacts != null && dc.Contacts.Count > 0 ? dc.Contacts.First().LastNameOrSurname : null))
                .ForMember(x => x.CompanyName, op => op.MapFrom(dc => dc.CompanyOrOrganization))
                .ForMember(x => x.Address, op => op.MapFrom(dc => dc.Contacts != null ? FormatAddress(dc.Contacts.Select(x=>x.Address).FirstOrDefault()) : null))
                .ForMember(x => x.CustomerSince, op => op.MapFrom(dc => dc.AuditInfo.CreateDate))
                .ForMember(x => x.TotalOrders, op => op.MapFrom(dc => dc.OrderSummary.OrderCount))
                .ForMember(x => x.TotalSpent, op => op.MapFrom(dc => dc.OrderSummary.TotalOrderAmount))
                .ForMember(x => x.Groups, op => op.MapFrom(dc => dc.Groups.Select(g => g.Name)))
                ;

            Mapper.CreateMap<PaymentsDC.Payment, OrderPayment>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.Status, op => op.MapFrom(dc => dc.Status))
                .ForMember(x => x.TransactionDate, op => op.MapFrom(dc => dc.AuditInfo.CreateDate ))
                .ForMember(x => x.AmountCollected, op => op.MapFrom(dc => dc.AmountCollected))
                .ForMember(x => x.AmountCredited, op => op.MapFrom(dc => dc.AmountCredited))
                .ForMember(x => x.PaymentType, op => op.MapFrom(dc => dc.PaymentType))
                .ForMember(x => x.CardNumber, op => op.MapFrom(dc => dc.BillingInfo.Card != null ? dc.BillingInfo.Card.CardNumberPartOrMask : null))
                .ForMember(x => x.TransactionId, op => op.MapFrom(dc => dc.PaymentServiceTransactionId))
                ;

            Mapper.CreateMap<ShippingDC.Package, OrderPackage>()
                .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
                .ForMember(x => x.ShippingMethodCode, op => op.MapFrom(dc => dc.ShippingMethodCode))
                .ForMember(x => x.ShippingMethodName, op => op.MapFrom(dc => dc.ShippingMethodName))
                .ForMember(x => x.TrackingNumber, op => op.MapFrom(dc => dc.TrackingNumber))
                // TODO: shipment id
                .ForMember(x => x.PackagingType, op => op.MapFrom(dc => dc.PackagingType))
                .ForMember(x => x.Height, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Height : null))
                .ForMember(x => x.Length, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Length : null))
                .ForMember(x => x.Width, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Width : null))
                .ForMember(x => x.Weight, op => op.MapFrom(dc => dc.Measurements != null ? dc.Measurements.Weight : null))
                .ForMember(x => x.Items, op => op.MapFrom(dc => dc.Items))
                ;

            Mapper.CreateMap<ShippingDC.PackageItem, OrderPackageItem>()
                .ForMember(x => x.OrderItemId, op => op.MapFrom(dc => dc.OrderItemId))
                .ForMember(x => x.Quantity, op => op.MapFrom(dc => dc.Quantity))
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
