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

namespace Mozu.SiteBuilder.UX.Areas.StoreFront.ModelMapping
{
    public class CustomerMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<CustomerAccount, UX.Models.Customers.CustomerAccount>();
            Mapper.CreateMap<UX.Models.Customers.CustomerAccount, CustomerAccount>();

          //  Mapper.CreateMap<CustomerAccountGroup, Models.Customers.CustomerGroup>();
       //     Mapper.CreateMap<Models.Customers.CustomerGroup, CustomerAccountGroup>();

            Mapper.CreateMap<CustomerAccountContact, UX.Models.Customers.CustomerAccountContact>();
            Mapper.CreateMap<UX.Models.Customers.CustomerAccountContact, CustomerAccountContact>();

            Mapper.CreateMap<CustomerAccountNote, UX.Models.Customers.CustomerAccountNote>();
            Mapper.CreateMap<UX.Models.Customers.CustomerAccountNote, CustomerAccountNote>();

            Mapper.CreateMap<Contact, UX.Models.Customers.Contact>();
            Mapper.CreateMap<UX.Models.Customers.Contact, Contact>();

            Mapper.CreateMap<CurrencyAmount, Mozu.Customer.Contracts.CurrencyAmount>();
            Mapper.CreateMap<Mozu.Customer.Contracts.CurrencyAmount, CurrencyAmount>();

            Mapper.CreateMap<Phone, Mozu.Core.Api.Contracts.Phone>();
            Mapper.CreateMap<Mozu.Core.Api.Contracts.Phone, Phone>();

            Mapper.CreateMap<CommerceSummary, Mozu.Customer.Contracts.CommerceSummary >();
            Mapper.CreateMap<Mozu.Customer.Contracts.CommerceSummary, CommerceSummary>();

            Mapper.CreateMap<Address, Mozu.Core.Api.Contracts.Address>();
            Mapper.CreateMap<Mozu.Core.Api.Contracts.Address, Address>();

            Mapper.CreateMap<CustomerGroup, UX.Models.Customers.CustomerGroup>();
            Mapper.CreateMap<UX.Models.Customers.CustomerGroup, CustomerGroup>();
        }
    }
}