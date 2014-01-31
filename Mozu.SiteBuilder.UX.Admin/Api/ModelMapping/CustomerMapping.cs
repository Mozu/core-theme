using System;
using System.Linq;
using AutoMapper;
using DC = Mozu.Customer.Contracts;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;
using Contact = Mozu.SiteBuilder.UX.Admin.Api.Models.Contact;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CustomerMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DC.CustomerAccount, ApiCustomer>()
            .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
            .ForMember(x => x.UserId, op => op.ResolveUsing(dc => string.IsNullOrWhiteSpace( dc.UserId) ? null : dc.UserId))
            .ForMember(x => x.EmailAddress, op => op.ResolveUsing(dc => dc.EmailAddress))
            .ForMember(x => x.UserName, op => op.ResolveUsing(dc => dc.UserName))
            .ForMember(x => x.FirstName, op => op.ResolveUsing(dc => dc.FirstName))
            .ForMember(x => x.LastName, op => op.ResolveUsing(dc => dc.LastName))
            .ForMember(x => x.Contacts, op => op.ResolveUsing(dc => dc.Contacts))
            .ForMember(x => x.CompanyOrOrganization, op => op.ResolveUsing(dc => dc.CompanyOrOrganization))
            .ForMember(x => x.AcceptsMarketing, op => op.ResolveUsing(dc => dc.AcceptsMarketing))
            .ForMember(x => x.Groups, op => op.ResolveUsing(dc => (dc.Groups ?? Enumerable.Empty<DC.CustomerGroup>()).Select(g => g.Id )))
            .ForMember(x => x.Attributes, op => op.ResolveUsing(dc => dc.Attributes))
            .ForMember(x => x.Notes, op => op.ResolveUsing(dc => dc.Notes))
            .ForMember(x => x.TotalOrderAmount, op => op.ResolveUsing(dc => dc.CommerceSummary != null && dc.CommerceSummary.TotalOrderAmount != null 
                ? (decimal?)dc.CommerceSummary.TotalOrderAmount.Amount 
                : null))
            .ForMember(x => x.OrderCount, op => op.ResolveUsing(dc => dc.CommerceSummary != null ? dc.CommerceSummary.OrderCount : 0))
            .ForMember(x => x.LastOrderDate, op => op.ResolveUsing(dc => dc.CommerceSummary != null ? dc.CommerceSummary.LastOrderDate : null))
            .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.CreateDate : null))
            .ForMember(x => x.TaxExempt, op => op.ResolveUsing(dc => dc.TaxExempt))
            .ForMember(x => x.TaxId, op => op.ResolveUsing(dc => dc.TaxId))
            //todo: confirm default of 0 Greg Murray on 2014-01-27 (ordercount defaults to 0 above so should be ok)
            .ForMember(x => x.VisitCount, op => op.ResolveUsing(dc => (dc.CommerceSummary != null) ? dc.CommerceSummary.VisitsCount : 0))
            .ForMember(x => x.WishlistCount, op => op.Ignore())
            ;

            //todo: Greg Murray on 2014-01-23 redundant mappings, ex FirstName => FirstName, Remove?
            Mapper.CreateMap<ApiCustomer, DC.CustomerAccount>()
            .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
            .ForMember(x => x.UserId, op => op.ResolveUsing(dc => string.IsNullOrWhiteSpace(dc.UserId) ? null : dc.UserId))
            .ForMember(x => x.EmailAddress, op => op.ResolveUsing(dc => dc.EmailAddress))
            .ForMember(x => x.UserName, op => op.ResolveUsing(dc => dc.UserName))
            
            .ForMember(x => x.FirstName, op => op.ResolveUsing(dc => dc.FirstName))
            .ForMember(x => x.LastName, op => op.ResolveUsing(dc => dc.LastName))
            .ForMember(x => x.Contacts, op => op.ResolveUsing(dc => dc.Contacts))

            .ForMember(dc => dc.Contacts, op => op.ResolveUsing(x => x.Contacts))
            .ForMember(dc => dc.CompanyOrOrganization, op => op.ResolveUsing(x => x.CompanyOrOrganization))
            .ForMember(dc => dc.AcceptsMarketing, op => op.ResolveUsing(x => x.AcceptsMarketing))
            .ForMember(dc => dc.CommerceSummary, op => op.ResolveUsing(x => new DC.CommerceSummary 
                { OrderCount = x.OrderCount, LastOrderDate = x.LastOrderDate, 
                TotalOrderAmount = new DC.CurrencyAmount
                {
                    CurrencyCode = "USD", Amount = x.TotalOrderAmount.HasValue ? x.TotalOrderAmount.Value : 0
                } }))
            .ForMember(dc => dc.Groups, op => op.ResolveUsing(x=> (x.Groups ?? Enumerable.Empty<int>() ).Select( _=> new DC.CustomerGroup() {Id=_ }) ))
            .ForMember(x => x.Attributes, op => op.ResolveUsing(x => x.Attributes))
            .ForMember(dc => dc.TaxExempt, op => op.ResolveUsing(x => x.TaxExempt))
            .ForMember(dc => dc.TaxId, op => op.ResolveUsing(x => x.TaxId))
            .ForMember(dc => dc.Notes, op => op.Ignore())
            .ForMember(dc => dc.TaxExempt, op => op.MapFrom(x => x.TaxExempt))
            .ForMember(dc => dc.TaxId, op => op.MapFrom(x => x.TaxId))
            .ForMember(dc => dc.IsAnonymous, op => op.MapFrom(x => x.IsAnonymous))

                // add AccountId to all the contacts
            .AfterMap((x, dc) => dc.Contacts.ForEach(con => con.AccountId = dc.Id))
            //ignore
            .ForMember(dc => dc.LocaleCode, op => op.Ignore())
            .ForMember(dc => dc.ExternalId, op => op.Ignore())
            .ForMember(dc => dc.AuditInfo, op => op.Ignore())
            ;

            Mapper.CreateMap<Contact, DC.CustomerContact>()
            // DC.CustomerContact is a subclass of DC.Contact, so use the parent class mapping
            .BeforeMap((x, dc) => { Mapper.Map<Contact, Mozu.Core.Api.Contracts.Contact>(x, dc); })
            
            //todo: confirm new name, phone, address mappings Greg Murray on 2014-01-24
            .ForMember(dc => dc.MiddleNameOrInitial, op => op.ResolveUsing(x => x.MiddleName))
            .ForMember(dc => dc.LastNameOrSurname, op => op.ResolveUsing(x => x.LastName))
            .ForMember(dc => dc.PhoneNumbers, op => op.ResolveUsing(x => new Core.Api.Contracts.Phone
                {
                    Home = x.HomePhone,
                    Mobile = x.MobilePhone,
                    Work = x.WorkPhone
                }))
            .ForMember(dc => dc.Address, op => op.ResolveUsing(x => new Core.Api.Contracts.Address()
            {
                Address1 = x.Address1,
                Address2 = x.Address2,
                Address3 = x.Address3,
                Address4 = x.Address4,
                CityOrTown = x.CityOrTown,
                StateOrProvince = x.StateOrProvince,
                PostalOrZipCode = x.PostalOrZipCode,
                CountryCode = x.CountryCode,
                IsValidated = x.AddressIsValidated
            }))
             //ignore
            .ForMember(dc => dc.AccountId, op => op.Ignore())
            .ForMember(dc => dc.Types, op => op.Ignore())
            .ForMember(dc => dc.AuditInfo, op => op.Ignore())
            .ForMember(dc => dc.FaxNumber, op => op.Ignore())  //todo: Greg Murray consider adding FaxNumber to Contact?
            ;
        }
    }
}