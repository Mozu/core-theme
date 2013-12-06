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
                //.ForMember(x => x.CustomerName, op => op.MapFrom(dc => string.Format("Customer {0}", dc.CustomerId)))
                //.ForMember(x => x.IssuedBy, op => op.MapFrom(dc => string.Format("Issued By {0}", dc.AuditInfo.CreateBy)))
                .ForMember(x => x.ModifiedDate, op => op.MapFrom(dc => dc.AuditInfo.UpdateDate == null ? dc.AuditInfo.CreateDate : dc.AuditInfo.UpdateDate))
            ;

            Mapper.CreateMap<Credit, DC.Credit>()
            ;
        }
    }
}