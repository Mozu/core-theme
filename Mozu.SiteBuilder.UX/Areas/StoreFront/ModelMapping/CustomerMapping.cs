using AutoMapper;
using Mozu.SiteBuilder.UX.Models.Customers;
using Address = Mozu.SiteBuilder.UX.Models.Customers.Address;
using Contact = Mozu.Core.Api.Contracts.Contact;
using CurrencyAmount = Mozu.SiteBuilder.UX.Models.Customers.CurrencyAmount;
using CustomerAccount = Mozu.Customer.Contracts.CustomerAccount;
//using CustomerAccountGroup = Mozu.Customer.Contracts.CustomerGroup;
using CustomerAccountContact = Mozu.Customer.Contracts.CustomerContact;
using CustomerAccountNote = Mozu.Customer.Contracts.CustomerNote;
//using CustomerGroup = Mozu.Customer.Contracts.CustomerGroup;
using Phone = Mozu.SiteBuilder.UX.Models.Customers.Phone;
using PurchaseOrder = Mozu.Customer.Contracts.CustomerPurchaseOrderAccount;
using CustomerPurchaseOrderPaymentTerm = Mozu.Customer.Contracts.CustomerPurchaseOrderPaymentTerm;

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class CustomerMapping : Profile
    {
        public CustomerMapping()
        {
            CreateMap<CustomerAccount, UX.Models.Customers.CustomerAccount>();
            CreateMap<UX.Models.Customers.CustomerAccount, CustomerAccount>();

          //  CreateMap<CustomerAccountGroup, Models.Customers.CustomerGroup>();
       //     CreateMap<Models.Customers.CustomerGroup, CustomerAccountGroup>();

            CreateMap<CustomerAccountContact, UX.Models.Customers.CustomerAccountContact>();
            CreateMap<UX.Models.Customers.CustomerAccountContact, CustomerAccountContact>();

            CreateMap<CustomerAccountNote, UX.Models.Customers.CustomerAccountNote>();
            CreateMap<UX.Models.Customers.CustomerAccountNote, CustomerAccountNote>();

            CreateMap<Contact, UX.Models.Customers.Contact>();
            CreateMap<UX.Models.Customers.Contact, Contact>();

            CreateMap<CurrencyAmount, Mozu.Customer.Contracts.CurrencyAmount>();
            CreateMap<Mozu.Customer.Contracts.CurrencyAmount, CurrencyAmount>();

            CreateMap<Phone, Mozu.Core.Api.Contracts.Phone>();
            CreateMap<Mozu.Core.Api.Contracts.Phone, Phone>();

            CreateMap<CommerceSummary, Mozu.Customer.Contracts.CommerceSummary >();
            CreateMap<Mozu.Customer.Contracts.CommerceSummary, CommerceSummary>();

            CreateMap<Address, Mozu.Core.Api.Contracts.Address>();
            CreateMap<Mozu.Core.Api.Contracts.Address, Address>();

            CreateMap<CustomerGroup, UX.Models.Customers.CustomerGroup>();
            CreateMap<UX.Models.Customers.CustomerGroup, CustomerGroup>();

            CreateMap<PurchaseOrder, UX.Models.Customers.CustomerPurchaseOrderAccount>()
                .ForMember(x => x.PaymentTerms, opt => opt.MapFrom(dc => dc.CustomerPurchaseOrderPaymentTerms))
                ;
            CreateMap<UX.Models.Customers.CustomerPurchaseOrderAccount, PurchaseOrder>()
                .ForMember(dc => dc.CustomerPurchaseOrderPaymentTerms, opt => opt.MapFrom(x => x.PaymentTerms))
                .ForMember(dc => dc.OverdraftAllowance, opt => opt.Ignore())
                .ForMember(dc => dc.OverdraftAllowanceType, opt => opt.Ignore())
                .ForMember(dc => dc.AuditInfo, opt => opt.Ignore())
                ;

            CreateMap<CustomerPurchaseOrderPaymentTerm, UX.Models.Customers.PurchaseOrderPaymentTerm>()
                ;
            CreateMap<UX.Models.Customers.PurchaseOrderPaymentTerm, CustomerPurchaseOrderPaymentTerm>()
                .ForMember(dc => dc.AuditInfo, opt=> opt.Ignore())
                ;
        }
    }
}