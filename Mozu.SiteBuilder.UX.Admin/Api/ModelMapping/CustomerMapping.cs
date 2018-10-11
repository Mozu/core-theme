using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using DC = Mozu.Customer.Contracts;
using ApiCustomer = Mozu.SiteBuilder.UX.Admin.Api.Models.Customer;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CustomerMapping : Profile
    {
        public CustomerMapping()
        {
            CreateMap<DC.CustomerAccount, ApiCustomer>()
                .ForMember(x => x.SegmentIds,
                    op => op.ResolveUsing(dc => dc.Segments?.Select(x => x.Id).ToList() ?? new List<int>()))
                .ForMember(x => x.Segments, op => op.ResolveUsing(dc => dc.Segments))
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.UserId,
                    op => op.ResolveUsing(dc => string.IsNullOrWhiteSpace(dc.UserId) ? null : dc.UserId))
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
                .ForMember(x => x.TotalOrderAmount, op => op.ResolveUsing(dc =>
                    dc.CommerceSummary?.TotalOrderAmount?.Amount))
                .ForMember(x => x.OrderCount,
                    op => op.ResolveUsing(dc => dc.CommerceSummary?.OrderCount ?? 0))
                .ForMember(x => x.LastOrderDate,
                    op => op.ResolveUsing(dc => dc.CommerceSummary?.LastOrderDate))
                .ForMember(x => x.CreateDate,
                    op => op.ResolveUsing(dc => dc.AuditInfo?.CreateDate))
                .ForMember(x => x.TaxExempt, op => op.ResolveUsing(dc => dc.TaxExempt))
                .ForMember(x => x.TaxId, op => op.ResolveUsing(dc => dc.TaxId))
                //todo: confirm default of 0 Greg Murray on 2014-01-27 (ordercount defaults to 0 above so should be ok)
                .ForMember(x => x.VisitCount,
                    op => op.ResolveUsing(dc => dc.CommerceSummary?.VisitsCount ?? 0))
                .ForMember(x => x.IsAnonymous, op => op.ResolveUsing(dc => dc.IsAnonymous))
                .ForMember(x => x.CustomerSet, op => op.ResolveUsing(dc => dc.CustomerSet))
                .ForMember(x => x.ExternalId, op => op.ResolveUsing(dc => dc.ExternalId))
                .ForMember(x => x.AccountType, op => op.ResolveUsing(dc => dc.AccountType))
                //ignores
                .ForMember(x => x.WishlistCount, op => op.Ignore())
                .ForMember(x => x.PaymentCards, op => op.Ignore())
                .ForMember(x => x.IsDisabled, op => op.ResolveUsing(dc => !dc.IsActive))
                .ForMember(x => x.PurchaseOrderAccount, op => op.Ignore())
                .ForMember(x => x.IsPoEnabled, op => op.Ignore())
                ;

            //todo: Greg Murray on 2014-01-23 redundant mappings, ex FirstName => FirstName, Remove?
            CreateMap<ApiCustomer, DC.CustomerAccount>()
                .ForMember(dc => dc.Segments,
                    op => op.ResolveUsing(x =>
                        (x.SegmentIds ?? new List<int>()).Select(y => new DC.CustomerSegment() {Id = y})))
                .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(dc => dc.UserId,
                    op => op.ResolveUsing(x => string.IsNullOrWhiteSpace(x.UserId) ? null : x.UserId))
                .ForMember(dc => dc.EmailAddress, op => op.ResolveUsing(x => x.EmailAddress))
                .ForMember(dc => dc.UserName,
                    op => op.ResolveUsing(x =>
                        !string.IsNullOrEmpty(x.UserName) ? x.UserName : (!x.IsAnonymous ? x.EmailAddress : null)))

                .ForMember(dc => dc.FirstName, op => op.ResolveUsing(x => x.FirstName))
                .ForMember(dc => dc.LastName, op => op.ResolveUsing(x => x.LastName))
                .ForMember(dc => dc.Contacts, op => op.ResolveUsing(x => x.Contacts))
                .ForMember(dc => dc.CustomerSet, op => op.ResolveUsing(x => x.CustomerSet))
                .ForMember(dc => dc.Contacts, op => op.ResolveUsing(x => x.Contacts))
                .ForMember(x => x.HasExternalPassword, op => op.Ignore())
                .ForMember(dc => dc.CompanyOrOrganization, op => op.ResolveUsing(x => x.CompanyOrOrganization))
                .ForMember(dc => dc.AcceptsMarketing, op => op.ResolveUsing(x => x.AcceptsMarketing))
                .ForMember(dc => dc.CommerceSummary, op => op.ResolveUsing(x => new DC.CommerceSummary
                {
                    OrderCount = x.OrderCount,
                    LastOrderDate = x.LastOrderDate,
                    TotalOrderAmount = new DC.CurrencyAmount
                    {
                        CurrencyCode = "USD",
                        Amount = x.TotalOrderAmount ?? 0
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
                .ForMember(dc => dc.ExternalId, op => op.ResolveUsing(x => x.ExternalId))
                .ForMember(dc => dc.AccountType, op => op.ResolveUsing(x => x.AccountType))

                // ensure that all contacts have the appropriate AccountId set
                .AfterMap((x, dc) => dc.Contacts.ForEach(con => con.AccountId = dc.Id))
                //ignore
                .ForMember(dc => dc.LocaleCode, op => op.Ignore())
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.IsActive, op => op.ResolveUsing(x => !x.IsDisabled))
                ;

            CreateMap<DC.CustomerPurchaseOrderAccount, CustomerPurchaseOrderAccount>()
                ;
            CreateMap<CustomerPurchaseOrderAccount, DC.CustomerPurchaseOrderAccount>()
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                ;
            
            CreateMap<DC.CustomerPurchaseOrderPaymentTerm, PurchaseOrderPaymentTerm>()
                ;
            CreateMap<PurchaseOrderPaymentTerm, DC.CustomerPurchaseOrderPaymentTerm>()
                .ForMember(dc => dc.AuditInfo, opt => opt.Ignore())
                ;

            CreateMap<DC.PurchaseOrderTransaction, CustomerPurchaseOrderTransaction>()
                .ForMember(dc=>dc.OrderNumber, opt=>opt.Ignore())
                .ForMember(dc => dc.OrderType, opt => opt.Ignore())
                ;
            CreateMap<CustomerPurchaseOrderTransaction, DC.PurchaseOrderTransaction>()
                .ForMember(dc => dc.AuditInfo, opt => opt.Ignore())
                ;

            CreateMap<DC.CustomerAuditEntry, CustomerAuditEntry>();
            CreateMap<CustomerAuditEntry, DC.CustomerAuditEntry>();

            CreateMap<Models.CustomerSegment, DC.CustomerSegment>()
                .ForMember(x => x.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.AuditInfo, op => op.ResolveUsing(x => x.AuditInfo))
                .ForMember(x => x.Code, op => op.ResolveUsing(x => x.Code))
                .ForMember(x => x.Description, op => op.ResolveUsing(x => x.Description))
                .ForMember(x => x.Name, op => op.ResolveUsing(x => x.Name));
            CreateMap<DC.CustomerSegment, Models.CustomerSegment>()
                .ForMember(x => x.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(x => x.AuditInfo, op => op.ResolveUsing(x => x.AuditInfo))
                .ForMember(x => x.Code, op => op.ResolveUsing(x => x.Code))
                .ForMember(x => x.Description, op => op.ResolveUsing(x => x.Description))
                .ForMember(x => x.Name, op => op.ResolveUsing(x => x.Name));
        }
    }
}