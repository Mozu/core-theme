using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using AppliedDiscount = Mozu.SiteBuilder.UX.Models.Orders.AppliedDiscount;
using Category = Mozu.SiteBuilder.UX.Models.Orders.Category;
using Measurement = Mozu.SiteBuilder.UX.Models.Orders.Measurement;
using Order = Mozu.Order.Contracts.Order;
using OrderItem = Mozu.Order.Contracts.OrderItem;
using OrderNote = Mozu.Order.Contracts.OrderNote;
using PackageMeasurements = Mozu.Order.Contracts.PackageMeasurements;
using PaymentCardReference = Mozu.Order.Contracts.PaymentCardReference;
using PaymentReference = Mozu.Order.Contracts.PaymentReference;
using PaymentTransaction = Mozu.Order.Contracts.PaymentTransaction;
using PaymentTransactionInteraction = Mozu.Order.Contracts.PaymentTransactionInteraction;
using Product = Mozu.Order.Contracts.Product;
using ProductOption = Mozu.Order.Contracts.ProductOption;
using ProductPrice = Mozu.Order.Contracts.ProductPrice;
using ProductStock = Mozu.Order.Contracts.ProductStock;
using Shipment = Mozu.Order.Contracts.Shipment;
using ShippingPrice = Mozu.Order.Contracts.ShippingPrice;
using ShopperNotes = Mozu.Order.Contracts.ShopperNotes;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class OrderMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            // placed orders

            Mapper.CreateMap<Models.Customers.Contact, Contact>();
            Mapper.CreateMap<Contact, Models.Customers.Contact>();

            Mapper.CreateMap<Models.Customers.Phone, Phone>();
            Mapper.CreateMap<Phone, Models.Customers.Phone>();

            Mapper.CreateMap<Models.Customers.Address, Address>();
            Mapper.CreateMap<Address, Models.Customers.Address>();

            Mapper.CreateMap<Models.Orders.Order, Mozu.Order.Contracts.Order>();
            Mapper.CreateMap<Mozu.Order.Contracts.Order, Models.Orders.Order>();

            Mapper.CreateMap<Models.Orders.AppliedDiscount, Mozu.Order.Contracts.AppliedDiscount>();
            Mapper.CreateMap<Mozu.Order.Contracts.AppliedDiscount, AppliedDiscount>();

            Mapper.CreateMap<Models.Orders.Category, Mozu.Order.Contracts.Category>();
            Mapper.CreateMap<Mozu.Order.Contracts.Category, Category>();

            Mapper.CreateMap<Models.Orders.Discount, Mozu.Order.Contracts.Discount>();
            Mapper.CreateMap<Mozu.Order.Contracts.Discount, Models.Orders.Discount>();

            Mapper.CreateMap<Measurement, Mozu.Core.Api.Contracts.Measurement>();
            Mapper.CreateMap<Mozu.Core.Api.Contracts.Measurement, Measurement>();

            Mapper.CreateMap<Models.Orders.OrderItem, Mozu.Order.Contracts.OrderItem>();
            Mapper.CreateMap<Mozu.Order.Contracts.OrderItem, Models.Orders.OrderItem>();

            Mapper.CreateMap<Models.Orders.OrderNote, Mozu.Order.Contracts.OrderNote>();
            Mapper.CreateMap<Mozu.Order.Contracts.OrderNote, Models.Orders.OrderNote>();

            Mapper.CreateMap<Models.Orders.PackageMeasurements, Mozu.Order.Contracts.PackageMeasurements>();
            Mapper.CreateMap<Mozu.Order.Contracts.PackageMeasurements, Models.Orders.PackageMeasurements>();

            Mapper.CreateMap<Models.Orders.PaymentCardReference, Mozu.Order.Contracts.PaymentCardReference>();
            Mapper.CreateMap<Mozu.Order.Contracts.PaymentCardReference, Models.Orders.PaymentCardReference>();

            Mapper.CreateMap<Models.Orders.PaymentReference, Mozu.Order.Contracts.PaymentReference>();
            Mapper.CreateMap<Mozu.Order.Contracts.PaymentReference, Models.Orders.PaymentReference>();

            Mapper.CreateMap<Models.Orders.PaymentTransaction, Mozu.Order.Contracts.PaymentTransaction>();
            Mapper.CreateMap<Mozu.Order.Contracts.PaymentTransaction, Models.Orders.PaymentTransaction>();

            Mapper.CreateMap<Models.Orders.PaymentTransactionInteraction, Mozu.Order.Contracts.PaymentTransactionInteraction>();
            Mapper.CreateMap<Mozu.Order.Contracts.PaymentTransactionInteraction, Models.Orders.PaymentTransactionInteraction>();

            Mapper.CreateMap<Models.Orders.Product, Mozu.Order.Contracts.Product>();
            Mapper.CreateMap<Mozu.Order.Contracts.Product, Models.Orders.Product>();

            Mapper.CreateMap<Models.Orders.ProductOption, Mozu.Order.Contracts.ProductOption>();
            Mapper.CreateMap<Mozu.Order.Contracts.ProductOption, Models.Orders.ProductOption>();

            Mapper.CreateMap<Models.Orders.ProductPrice, Mozu.Order.Contracts.ProductPrice>();
            Mapper.CreateMap<Mozu.Order.Contracts.ProductPrice, Models.Orders.ProductPrice>();

            Mapper.CreateMap<Models.Orders.ProductStock, Mozu.Order.Contracts.ProductStock>();
            Mapper.CreateMap<Mozu.Order.Contracts.ProductStock, Models.Orders.ProductStock>();

            Mapper.CreateMap<Models.Orders.Shipment, Mozu.Order.Contracts.Shipment>();
            Mapper.CreateMap<Mozu.Order.Contracts.Shipment, Models.Orders.Shipment>();

            Mapper.CreateMap<Models.Orders.ShippingPrice, Mozu.Order.Contracts.ShippingPrice>();
            Mapper.CreateMap<Mozu.Order.Contracts.ShippingPrice, Models.Orders.ShippingPrice>();

            Mapper.CreateMap<Models.Orders.ShopperNotes, Mozu.Order.Contracts.ShopperNotes>();
            Mapper.CreateMap<Mozu.Order.Contracts.ShopperNotes, Models.Orders.ShopperNotes>();

            // checkout

            Mapper.CreateMap<Mozu.Order.Contracts.Order, Models.Checkout.OrderInformation>()
                .ForMember(x => x.Comments, m => m.ResolveUsing(x => (x.Notes != null && x.Notes.Any()) ? x.Notes.FirstOrDefault().Text : null))
                .ForMember(x => x.CouponCode, m => m.ResolveUsing(x => (x.OrderDiscount != null) ? x.OrderDiscount.CouponCode : null))
                .ForMember(x => x.ShippingMethod, m => m.ResolveUsing(x => (x.Shipment != null) ? x.Shipment.ShippingMethodCode : null))
                .ForMember(x => x.Discount, m => m.ResolveUsing(x => x.OrderDiscount != null
                    ? new Models.Checkout.OrderDiscountInformation
                        {
                            Amount = x.DiscountTotal,
                            FreeShipping = (x.ShippingTotal == 0m && !string.IsNullOrWhiteSpace(x.Shipment.ShippingMethodCode)),
                            Name = x.OrderDiscount.Discount.Name,
                        }
                    : null))
                ;

            Mapper.CreateMap<OrderItem, Models.Checkout.OrderItemInformation>()
                .ForMember(x => x.ProductName, m => m.ResolveUsing(x => x.Product.Name))
                .ForMember(x => x.Quantity, m => m.ResolveUsing(x => x.Quantity ?? 0))
                .ForMember(x => x.SubTotal, m => m.ResolveUsing(x => x.SubTotal ?? 0m))
                .ForMember(x => x.Total, m => m.ResolveUsing(x => x.Total ?? 0m))
                .ForMember(x => x.UnitPrice, m => m.ResolveUsing(x => x.Product.Price.Price ?? 0m))
                .ForMember(x => x.Discount, m => m.ResolveUsing(x => x.Product.Price.Discount != null
                    ? new Models.Checkout.ItemDiscountInformation
                        {
                            SalePrice = x.Product.Price.SalePrice ?? 0m,
                            FreeShipping = false, // todo: fill this in with real stuff
                            Name = x.Product.Price.Discount.Discount.Name,
                        }
                    : null))
                ;

            Mapper.CreateMap<PaymentReference, Models.Checkout.PaymentInformation>()
                .ForMember(x => x.FirstName, m => m.ResolveUsing(x => x.Card != null ? x.Card.BillingAddress.FirstName : null))
                .ForMember(x => x.LastName, m => m.ResolveUsing(x => x.Card != null ? x.Card.BillingAddress.LastNameOrSurname : null))
                .ForMember(x => x.Address1, m => m.ResolveUsing(x => x.Card != null ? x.Card.BillingAddress.Address.Address1 : null))
                .ForMember(x => x.Address2, m => m.ResolveUsing(x => x.Card != null ? x.Card.BillingAddress.Address.Address2 : null))
                .ForMember(x => x.CityOrTown, m => m.ResolveUsing(x => x.Card != null ? x.Card.BillingAddress.Address.CityOrTown : null))
                .ForMember(x => x.CountryCode, m => m.ResolveUsing(x => x.Card != null ? x.Card.BillingAddress.Address.CountryCode : null))
                .ForMember(x => x.StateOrProvince, m => m.ResolveUsing(x => x.Card != null ? x.Card.BillingAddress.Address.StateOrProvince : null))
                .ForMember(x => x.PostalOrZipCode, m => m.ResolveUsing(x => x.Card != null ? x.Card.BillingAddress.Address.PostalOrZipCode : null))
                .ForMember( x=> x.Email , m=> m.ResolveUsing( x=> x.Card != null && x.Card.BillingAddress != null  ? x.Card.BillingAddress.Email : null))
                .ForMember(x => x.Phone , m => m.ResolveUsing(x => x.Card != null && x.Card.BillingAddress != null ? x.Card.BillingAddress.PhoneNumbers  : null))
                .ForMember(x => x.CardType, m => m.ResolveUsing(x => x.Card != null ? x.Card.PaymentOrCardType : null))
                .ForMember(x => x.PaymentServiceCardId, m => m.ResolveUsing(x => x.Card != null ? x.Card.PaymentServiceCardId : null))
                .ForMember(x => x.CardNumberPartOrMask, m => m.ResolveUsing(x => x.Card != null ? x.Card.CardNumberPartOrMask : null))
                .ForMember(x => x.IsSameBillingShippingAddress, m => m.ResolveUsing(x => x.Card != null ? x.Card.IsSameBillingShippingAddress : null))
                .ForMember(x => x.Phone, m => m.ResolveUsing(x =>
                {
                    if (x.Card == null || x.Card.BillingAddress == null)
                        return null;

                    var phoneNumbers = x.Card.BillingAddress.PhoneNumbers;
                    return phoneNumbers == null ? null : phoneNumbers.Home;
                }))
                ;

            Mapper.CreateMap<Shipment, Models.Checkout.ShipmentInformation>()
                .ForMember(x => x.Price, m => m.ResolveUsing(x => x.Price == null ? 0m : (x.Price.Price ?? 0m)))
                //.ForMember(x => x.ShippingMethod, m => m.ResolveUsing(x => x.ShippingMethodCode))
                //.ForMember(x => x.Carrier, m => m.ResolveUsing(x => x.Carrier))
                //.ForMember(x => x.Status, m => m.ResolveUsing(x => x.Status))
                .AfterMap((s, si) => {

                    var contact = s.ShippingAddress;
                    if (contact == null)
                        return;

                    si.CompanyOrOrganization = contact.CompanyOrOrganization;
                    si.FirstName = contact.FirstName;
                    si.LastName = contact.LastNameOrSurname;
                    si.Email = contact.Email;

                    var address = contact.Address;
                    if (address == null)
                        return;

                    si.Address1 = address.Address1;
                    si.Address2 = address.Address2;
                    si.CityOrTown = address.CityOrTown;
                    si.CountryCode = address.CountryCode;
                    si.PostalOrZipCode = address.PostalOrZipCode;
                    si.StateOrProvince = address.StateOrProvince;
                })
                ;

            Mapper.CreateMap<OrderNote, Models.Orders.OrderNote>();

            Mapper.AssertConfigurationIsValid(ProfileName);
        }
    }
}
