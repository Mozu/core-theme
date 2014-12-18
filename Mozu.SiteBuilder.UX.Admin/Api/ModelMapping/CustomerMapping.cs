using System;
using System.Collections.Generic;
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
                .ForMember(x => x.SegmentIds, op => op.ResolveUsing(dc => dc.Segments == null ? new List<int>(): dc.Segments.Select( x=> x.Id ).ToList()))
                .ForMember(x => x.Segments, op => op.ResolveUsing(dc => dc.Segments))
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.UserId, op => op.ResolveUsing(dc => string.IsNullOrWhiteSpace(dc.UserId) ? null : dc.UserId))
                .ForMember(x => x.EmailAddress, op => op.ResolveUsing(dc => dc.EmailAddress))
                .ForMember(x => x.UserName, op => op.ResolveUsing(dc => dc.UserName))
                .ForMember(x => x.FirstName, op => op.ResolveUsing(dc => dc.FirstName))
                .ForMember(x => x.LastName, op => op.ResolveUsing(dc => dc.LastName))
                .ForMember(x => x.Contacts, op => op.ResolveUsing(dc => dc.Contacts))
                .ForMember(x => x.CompanyOrOrganization, op => op.ResolveUsing(dc => dc.CompanyOrOrganization))
                .ForMember(x => x.AcceptsMarketing, op => op.ResolveUsing(dc => dc.AcceptsMarketing))
                // .ForMember(x => x.Groups, op => op.ResolveUsing(dc => (dc.Groups ?? Enumerable.Empty<DC.CustomerGroup>()).Select(g => g.Id )))
                .ForMember(x => x.Attributes, op => op.ResolveUsing(dc => dc.Attributes))
                .ForMember(x => x.Notes, op => op.ResolveUsing(dc => dc.Notes))
                .ForMember(x => x.TotalOrderAmount, op => op.ResolveUsing(dc => dc.CommerceSummary != null && dc.CommerceSummary.TotalOrderAmount != null
                    ? (decimal?) dc.CommerceSummary.TotalOrderAmount.Amount
                    : null))
                .ForMember(x => x.OrderCount, op => op.ResolveUsing(dc => dc.CommerceSummary != null ? dc.CommerceSummary.OrderCount : 0))
                .ForMember(x => x.LastOrderDate, op => op.ResolveUsing(dc => dc.CommerceSummary != null ? dc.CommerceSummary.LastOrderDate : null))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.CreateDate : null))
                .ForMember(x => x.TaxExempt, op => op.ResolveUsing(dc => dc.TaxExempt))
                .ForMember(x => x.TaxId, op => op.ResolveUsing(dc => dc.TaxId))
                //todo: confirm default of 0 Greg Murray on 2014-01-27 (ordercount defaults to 0 above so should be ok)
                .ForMember(x => x.VisitCount, op => op.ResolveUsing(dc => (dc.CommerceSummary != null) ? dc.CommerceSummary.VisitsCount : 0))
                .ForMember(x => x.IsAnonymous, op => op.ResolveUsing(dc => dc.IsAnonymous))
                //ignores
                .ForMember(x => x.WishlistCount, op => op.Ignore())
                .ForMember(x => x.PaymentCards, op => op.Ignore())
                ;

            //todo: Greg Murray on 2014-01-23 redundant mappings, ex FirstName => FirstName, Remove?
            Mapper.CreateMap<ApiCustomer, DC.CustomerAccount>()
                .ForMember(dc => dc.Segments, op => op.ResolveUsing(x => (x.SegmentIds ?? new List<int>()).Select(y=> new DC.CustomerSegment(){ Id=y})))
                .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(dc => dc.UserId, op => op.ResolveUsing(x => string.IsNullOrWhiteSpace(x.UserId) ? null : x.UserId))
                .ForMember(dc => dc.EmailAddress, op => op.ResolveUsing(x => x.EmailAddress))
                .ForMember(dc => dc.UserName, op => op.ResolveUsing(x => !String.IsNullOrEmpty(x.UserName) ? x.UserName : (!x.IsAnonymous ? x.EmailAddress : null)))
                 
                .ForMember(dc => dc.FirstName, op => op.ResolveUsing(x => x.FirstName))
                .ForMember(dc => dc.LastName, op => op.ResolveUsing(x => x.LastName))
                .ForMember(dc => dc.Contacts, op => op.ResolveUsing(x => x.Contacts))

                .ForMember(dc => dc.Contacts, op => op.ResolveUsing(x => x.Contacts))
                .ForMember(dc => dc.CompanyOrOrganization, op => op.ResolveUsing(x => x.CompanyOrOrganization))
                .ForMember(dc => dc.AcceptsMarketing, op => op.ResolveUsing(x => x.AcceptsMarketing))
                .ForMember(dc => dc.CommerceSummary, op => op.ResolveUsing(x => new DC.CommerceSummary
                                                                                {
                                                                                    OrderCount = x.OrderCount, LastOrderDate = x.LastOrderDate,
                                                                                    TotalOrderAmount = new DC.CurrencyAmount
                                                                                                       {
                                                                                                           CurrencyCode = "USD", Amount = x.TotalOrderAmount.HasValue ? x.TotalOrderAmount.Value : 0
                                                                                                       }
                                                                                }))
                //  .ForMember(dc => dc.Groups, op => op.ResolveUsing(x=> (x.Groups ?? Enumerable.Empty<int>() ).Select( _=> new DC.CustomerGroup() {Id=_ }) ))
                .ForMember(dc => dc.Attributes, op => op.ResolveUsing(x => x.Attributes))
                .ForMember(dc => dc.TaxExempt, op => op.ResolveUsing(x => x.TaxExempt))
                .ForMember(dc => dc.TaxId, op => op.ResolveUsing(x => x.TaxId))
                .ForMember(dc => dc.Notes, op => op.Ignore())
                .ForMember(dc => dc.TaxExempt, op => op.ResolveUsing(x => x.TaxExempt))
                .ForMember(dc => dc.TaxId, op => op.ResolveUsing(x => x.TaxId))
                .ForMember(dc => dc.IsAnonymous, op => op.ResolveUsing(x => x.IsAnonymous))

                // ensure that all contacts have the appropriate AccountId set
                .AfterMap((x, dc) => dc.Contacts.ForEach(con => con.AccountId = dc.Id))
                //ignore
                .ForMember(dc => dc.LocaleCode, op => op.Ignore())
                .ForMember(dc => dc.ExternalId, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.IsLocked, op => op.Ignore())
                ;


            Mapper.CreateMap<Mozu.SiteBuilder.UX.Admin.Api.Models.CustomerSegment, DC.CustomerSegment>()
                .ForMember(x => x.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.AuditInfo, op => op.ResolveUsing(x => x.AuditInfo))
                .ForMember(x => x.Code, op => op.ResolveUsing(x => x.Code))
                .ForMember(x => x.Description, op => op.ResolveUsing(x => x.Description))
                .ForMember(x => x.Name, op => op.ResolveUsing(x => x.Name));
            Mapper.CreateMap<DC.CustomerSegment, Mozu.SiteBuilder.UX.Admin.Api.Models.CustomerSegment>()
                .ForMember(x => x.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.AuditInfo, op => op.ResolveUsing(x => x.AuditInfo))
                .ForMember(x => x.Code, op => op.ResolveUsing(x => x.Code))
                .ForMember(x => x.Description, op => op.ResolveUsing(x => x.Description))
                .ForMember(x => x.Name, op => op.ResolveUsing(x => x.Name));
        }
    }
}