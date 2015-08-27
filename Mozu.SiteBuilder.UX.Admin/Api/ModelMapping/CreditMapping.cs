using System;
using System.Linq;
using AutoMapper;
using DC = Mozu.Customer.Contracts.Credit;
using Credit = Mozu.SiteBuilder.UX.Admin.Api.Models.Credit;

namespace Mozu.SiteBuilder.UX.Admin.Api.ModelMapping
{
    public class CreditMapping : Profile
    {
        public override string ProfileName
        {
            get { return GetType().FullName; }
        }

        protected override void Configure()
        {
            Mapper.CreateMap<DC.Credit, Credit>()
                //.ForMember(x => x.CustomerName, op => op.ResolveUsing(dc => string.Format("Customer {0}", dc.CustomerId)))
                //.ForMember(x => x.IssuedBy, op => op.ResolveUsing(dc => string.Format("Issued By {0}", dc.AuditInfo.CreateBy)))
                .ForMember(x => x.CreatedDate, opt => opt.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.CreateDate : null))

                .ForMember(x => x.CreateBy, opt => opt.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.CreateBy : null))
                .ForMember(x => x.UpdateBy, opt => opt.ResolveUsing(dc => (dc.AuditInfo != null) ? dc.AuditInfo.UpdateBy : null))
                .ForMember(x => x.ModifiedDate, op => op.ResolveUsing(dc => (dc.AuditInfo != null) 
                    ? (dc.AuditInfo.UpdateDate ?? dc.AuditInfo.CreateDate)
                    : null ))
                .ForMember(x => x.IssuedBy, op => op.Ignore())
                .ForMember(x => x.Customer, op => op.Ignore())
            ;

            Mapper.CreateMap<Credit, DC.Credit>()
                .ForMember(x=> x.CurrencyCode , opt=> opt.ResolveUsing(x=> string.IsNullOrEmpty( x.CurrencyCode)?"USD" :x.CurrencyCode))
                .ForMember(x => x.CreditType, opt => opt.ResolveUsing(x => string.IsNullOrEmpty(x.CreditType) ? "StoreCredit" : x.CreditType))
                .ForMember(x => x.AuditInfo, op => op.Ignore())
                
            ;
        }
    }
}