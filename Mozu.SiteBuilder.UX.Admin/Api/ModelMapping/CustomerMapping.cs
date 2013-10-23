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
            .ForMember(x => x.Id, op => op.MapFrom(dc => dc.Id))
            .ForMember(x => x.UserId, op => op.MapFrom(dc => dc.UserId))
            
            .ForMember(x => x.Contacts, op => op.MapFrom(dc => dc.Contacts))
            .ForMember(x => x.CompanyOrOrganization, op => op.MapFrom(dc => dc.CompanyOrOrganization))
            .ForMember(x => x.AcceptsMarketing, op => op.MapFrom(dc => dc.AcceptsMarketing))
            .ForMember(x => x.Groups, op => op.MapFrom(dc => (dc.Groups ?? Enumerable.Empty<DC.CustomerGroup>()).Select(g => g.Id )))
            .ForMember(x => x.Attributes, op => op.MapFrom(dc => (dc.Attributes ?? Enumerable.Empty<DC.CustomerAttribute>()).Select(a => a.Id)))
            .ForMember(x => x.Notes, op => op.MapFrom(dc => dc.Notes))
            .ForMember(x => x.TotalOrderAmount, op => op.MapFrom(dc => dc.OrderSummary != null && dc.OrderSummary.TotalOrderAmount != null ? (decimal?)dc.OrderSummary.TotalOrderAmount.Amount : null))
            .ForMember(x => x.OrderCount, op => op.MapFrom(dc => dc.OrderSummary != null ? dc.OrderSummary.OrderCount : 0))
            .ForMember(x => x.LastOrderDate, op => op.MapFrom(dc => dc.OrderSummary != null ? dc.OrderSummary.LastOrderDate : null))
            .ForMember(x => x.CreateDate, op => op.MapFrom(dc => dc.AuditInfo.CreateDate))
            .ForMember(x => x.TaxExempt, op => op.MapFrom(dc => dc.TaxExempt))
            .ForMember(x => x.TaxId, op => op.MapFrom(dc => dc.TaxId))
            ;

            Mapper.CreateMap<ApiCustomer, DC.CustomerAccount>()
            .ForMember(dc => dc.Id, op => op.MapFrom(x => x.Id))
            
            .ForMember(dc => dc.UserId, op => op.MapFrom(x => x.UserId))
            .ForMember(dc => dc.Contacts, op => op.MapFrom(x => x.Contacts))
            .ForMember(dc => dc.CompanyOrOrganization, op => op.MapFrom(x => x.CompanyOrOrganization))
            .ForMember(dc => dc.AcceptsMarketing, op => op.MapFrom(x => x.AcceptsMarketing))
            .ForMember(dc => dc.OrderSummary, op => op.MapFrom(x => new DC.OrderSummary { OrderCount = x.OrderCount, LastOrderDate = x.LastOrderDate, TotalOrderAmount = new DC.CurrencyAmount { CurrencyCode = "USD", Amount = x.TotalOrderAmount.HasValue ? x.TotalOrderAmount.Value : 0 } }))

            .ForMember(dc => dc.Groups, op => op.MapFrom(x=> (x.Groups ?? Enumerable.Empty<int>() ).Select( _=> new DC.CustomerGroup() {Id=_ }) ))
            .ForMember(dc => dc.Attributes, op => op.Ignore())
            .ForMember(dc => dc.Notes, op => op.Ignore())
                // add AccountId to all the contacts
            .AfterMap((x, dc) => dc.Contacts.ForEach(dcc => dcc.AccountId = dc.Id))
            ;


            Mapper.CreateMap<Contact, DC.CustomerContact>()
            // DC.CustomerContact is a subclass of DC.Contact, so use the parent class mapping
            .BeforeMap((x, dc) => { Mapper.Map<Contact, Mozu.Core.Api.Contracts.Contact>(x, dc); })
            ;
        }
    }
}