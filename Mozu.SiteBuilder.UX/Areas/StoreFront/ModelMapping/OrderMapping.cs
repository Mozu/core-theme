using System.Linq;
using AutoMapper;
using Mozu.Core.Api.Contracts;
using Mozu.SiteBuilder.UX.Models.Orders;
using AppliedDiscount = Mozu.SiteBuilder.UX.Models.Orders.AppliedDiscount;
using Category = Mozu.SiteBuilder.UX.Models.Orders.Category;
using Measurement = Mozu.SiteBuilder.UX.Models.Orders.Measurement;
using Order = Mozu.CommerceRuntime.Contracts.Orders   ;
using OrderItem = Mozu.CommerceRuntime.Contracts.Orders.OrderItem ;
using OrderNote = Mozu.CommerceRuntime.Contracts.Orders.OrderNote;
using PackageMeasurements = Mozu.CommerceRuntime.Contracts.Commerce.PackageMeasurements ;
using Product = Mozu.CommerceRuntime.Contracts.Products.Product ;
using ProductOption = Mozu.CommerceRuntime.Contracts.Products.ProductOption;
using ProductPrice = Mozu.CommerceRuntime.Contracts.Products.ProductPrice;


using ShopperNotes = Mozu.CommerceRuntime.Contracts.Orders.ShopperNotes;

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

            Mapper.CreateMap<Mozu.CommerceRuntime.Contracts.Discounts.AppliedDiscount, Models.Orders.AppliedDiscount>()
                .ForMember(x => x.Discount, op => op.Ignore())
                ;
            Mapper.CreateMap<Models.Orders.AppliedDiscount, Mozu.CommerceRuntime.Contracts.Discounts.AppliedDiscount>()
                .ForMember(x => x.Discount, op => op.Ignore())
                ;

            
      
        }
    }
}
