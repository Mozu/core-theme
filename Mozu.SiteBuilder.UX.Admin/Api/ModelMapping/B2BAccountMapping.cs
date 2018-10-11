using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Mozu.SiteBuilder.UX.Admin.Api.Models.Account;
using DC = Mozu.Customer.Contracts;
using ApiB2BAccount = Mozu.SiteBuilder.UX.Admin.Api.Models.B2BAccount;
using ApiB2BUser = Mozu.SiteBuilder.UX.Admin.Api.Models.B2BAccountUser;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class B2BAccountMapping : Profile
    {
        public B2BAccountMapping()
        {
            CreateMap<DC.B2BAccount, ApiB2BAccount>()
                .ForMember(x => x.SegmentIds,
                    op => op.ResolveUsing(dc => dc.Segments?.Select(x => x.Id).ToList() ?? new List<int>()))
                .ForMember(x => x.Segments, op => op.ResolveUsing(dc => dc.Segments))
                .ForMember(x => x.Id, op => op.ResolveUsing(dc => dc.Id))
                .ForMember(x => x.Users, op => op.ResolveUsing(dc => dc.Users))
                .ForMember(x => x.Contacts, op => op.ResolveUsing(dc => dc.Contacts))
                .ForMember(x => x.CompanyOrOrganization, op => op.ResolveUsing(dc => dc.CompanyOrOrganization))
                // .ForMember(x => x.Groups, op => op.ResolveUsing(dc => (dc.Groups ?? Enumerable.Empty<DC.CustomerGroup>()).Select(g => g.Id )))
                .ForMember(x => x.Attributes, op => op.ResolveUsing(dc => dc.Attributes))
                .ForMember(x => x.Notes, op => op.ResolveUsing(dc => dc.Notes))
                .ForMember(x => x.TotalOrderAmount,
                    op => op.ResolveUsing(dc => dc.CommerceSummary?.TotalOrderAmount?.Amount))
                .ForMember(x => x.OrderCount, op => op.ResolveUsing(dc => dc.CommerceSummary?.OrderCount ?? 0))
                .ForMember(x => x.LastOrderDate, op => op.ResolveUsing(dc => dc.CommerceSummary?.LastOrderDate))
                .ForMember(x => x.CreateDate, op => op.ResolveUsing(dc => dc.AuditInfo?.CreateDate))
                .ForMember(x => x.TaxExempt, op => op.ResolveUsing(dc => dc.TaxExempt))
                .ForMember(x => x.TaxId, op => op.ResolveUsing(dc => dc.TaxId))
                .ForMember(x => x.VisitCount, op => op.ResolveUsing(dc => dc.CommerceSummary?.VisitsCount ?? 0))
                .ForMember(x => x.CustomerSet, op => op.ResolveUsing(dc => dc.CustomerSet))
                .ForMember(x => x.ExternalId, op => op.ResolveUsing(dc => dc.ExternalId))
                .ForMember(x => x.PriceList, op => op.ResolveUsing(dc => dc.PriceList))
                //ignores
                .ForMember(x => x.WishlistCount, op => op.Ignore())
                .ForMember(x => x.PaymentCards, op => op.Ignore())
                .ForMember(x => x.IsActive, op => op.ResolveUsing(dc => dc.IsActive))
                .ForMember(x => x.PurchaseOrderAccount, op => op.Ignore())
                .ForMember(x => x.IsPoEnabled, op => op.Ignore())
                ;

            CreateMap<ApiB2BAccount, DC.B2BAccount>()
                .ForMember(dc => dc.Segments, op => op.ResolveUsing(src => src.Segments))
                .ForMember(dc => dc.Id, op => op.ResolveUsing(x => x.Id))
                .ForMember(dc => dc.Users, op => op.ResolveUsing(x => x.Users))
                .ForMember(dc => dc.Contacts, op => op.ResolveUsing(x => x.Contacts))
                .ForMember(dc => dc.CustomerSet, op => op.ResolveUsing(x => x.CustomerSet))
                .ForMember(dc => dc.Contacts, op => op.ResolveUsing(x => x.Contacts))
                .ForMember(dc => dc.CompanyOrOrganization, op => op.ResolveUsing(x => x.CompanyOrOrganization))
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
                .ForMember(dc => dc.ExternalId, op => op.ResolveUsing(x => x.ExternalId))

                // ensure that all contacts have the appropriate AccountId set
                .AfterMap((x, dc) => dc.Contacts.ForEach(con => con.AccountId = dc.Id))
                //ignore
                .ForMember(dc => dc.AuditInfo, op => op.Ignore())
                .ForMember(dc => dc.IsActive, op => op.ResolveUsing(x => x.IsActive))
                .ForMember(dc => dc.PriceList, op => op.ResolveUsing(x => x.PriceList))
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
                .ForMember(dc => dc.OrderNumber, opt => opt.Ignore())
                .ForMember(dc => dc.OrderType, opt => opt.Ignore())
                ;
            CreateMap<CustomerPurchaseOrderTransaction, DC.PurchaseOrderTransaction>()
                .ForMember(dc => dc.AuditInfo, opt => opt.Ignore())
                ;

            CreateMap<DC.CustomerAuditEntry, CustomerAuditEntry>();
            CreateMap<CustomerAuditEntry, DC.CustomerAuditEntry>();
            CreateMap<ApiB2BUser, DC.B2BUser>()
                .ForMember(x => x.Roles, opt => opt.Ignore())
                ;
            CreateMap<DC.B2BUser, ApiB2BUser>()
                .ForMember(x => x.Role, opt => opt.Ignore())
                ;

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